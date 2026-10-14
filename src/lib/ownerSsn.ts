import type { FilingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logFilingChange } from "@/lib/admin/mutations";
import {
  decryptPii,
  encryptPii,
  formatSsnForForms,
  isPiiCryptoConfigured,
  maskSsn,
  normalizeSsn,
  PiiCryptoError,
  validateSsn,
} from "@/lib/crypto/pii";

// The owner's U.S. SSN (spec docs/reviews/2026-10-15-ssn-capture-spec.md).
// ONE write path for the client portal box and the admin entry form (S6), one
// read path for the admin Reveal (S3). The number is only ever stored
// encrypted; change-log rows carry the masked form ("•••-••-1234") only.
//
// NEVER log, email, or return the number from here except revealOwnerSsn's
// return value (admin website only).

// Change-log `field` values. OWNER_SSN_CHANGE_FIELD is package data (the
// stale pre-flight badge counts it); the other two are not.
export const OWNER_SSN_CHANGE_FIELD = "ownerSsn";
export const OWNER_SSN_REVEAL_FIELD = "ownerSsnReveal";
export const OWNER_SSN_REQUEST_FIELD = "ownerSsnRequest";

// S4: once the package has gone to the IRS the number can no longer change.
export const SSN_LOCKED_STATUSES: readonly FilingStatus[] = ["FAXED", "CONFIRMED"];
// Unpaid drafts have no order page yet (the box lives there). Refusing them
// also keeps the SSN out of the package that is built — and emailed as an
// attachment — at payment. Never touches the pay path: nothing here runs in it.
const SSN_NOT_YET_STATUSES: readonly FilingStatus[] = ["DRAFT"];

export const SSN_LOCKED_MESSAGE = "This filing has already been sent to the IRS — please contact support.";
export const SSN_UNAVAILABLE_MESSAGE = "Secure entry is temporarily unavailable — please contact support.";
export const SSN_MISMATCH_MESSAGE = "The two numbers don't match. Please type your SSN again in both boxes.";
export const SSN_NOT_PAID_MESSAGE =
  "Please finish your order first — you can add your SSN on your order page after checkout.";
export const SSN_ADMIN_KEY_MISSING_MESSAGE =
  "PII_ENCRYPTION_KEY is not set (or is not base64 of 32 bytes). Set it in Vercel before storing or showing SSNs.";
export const SSN_DECRYPT_FAILED_MESSAGE =
  "The SSN on file could not be decrypted — check PII_ENCRYPTION_KEY.";

export class OwnerSsnError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "OwnerSsnError";
    this.status = status;
    this.code = code;
  }
}

export type SsnEntryState = "open" | "locked" | "not_paid";

export function ssnEntryState(status: FilingStatus | string): SsnEntryState {
  if ((SSN_LOCKED_STATUSES as readonly string[]).includes(status)) return "locked";
  if ((SSN_NOT_YET_STATUSES as readonly string[]).includes(status)) return "not_paid";
  return "open";
}

export type SaveOwnerSsnResult = {
  last4: string;
  submittedAt: Date;
  replaced: boolean;
  // The number equals the one already on file: nothing was written (no new
  // timestamp, no change-log row) and callers send no email / re-run nothing.
  unchanged: boolean;
};

// Validate, encrypt and store. `confirm` must match `ssn` (S4: typed twice to
// catch typos). `submittedBy` is "client" or the admin id / shared-login label.
export async function saveOwnerSsn(opts: {
  filingId: string;
  ssn: unknown;
  confirm: unknown;
  submittedBy: string;
  adminId: string | null;
  source: "customer" | "admin";
}): Promise<SaveOwnerSsnResult> {
  if (!isPiiCryptoConfigured()) {
    throw new OwnerSsnError(
      503,
      "not_configured",
      opts.source === "admin" ? SSN_ADMIN_KEY_MISSING_MESSAGE : SSN_UNAVAILABLE_MESSAGE,
    );
  }
  if (typeof opts.ssn !== "string" || typeof opts.confirm !== "string") {
    throw new OwnerSsnError(400, "invalid_ssn", "Enter your SSN in both boxes.");
  }
  const checked = validateSsn(opts.ssn);
  if (!checked.ok) throw new OwnerSsnError(400, `invalid_ssn_${checked.code}`, checked.error);
  if (normalizeSsn(opts.confirm) !== checked.ssn) {
    throw new OwnerSsnError(400, "ssn_mismatch", SSN_MISMATCH_MESSAGE);
  }

  const filing = await prisma.filing.findUnique({
    where: { id: opts.filingId },
    select: { id: true, status: true, ownerSsnLast4: true, ownerSsnCiphertext: true, ownerSsnSubmittedAt: true },
  });
  if (!filing) throw new OwnerSsnError(404, "not_found", "Not found");
  assertEntryOpen(filing.status);

  // Re-entering the number already on file is a no-op: keeping its timestamp
  // means a package built after the first entry is not wrongly held by the
  // fax gate (ownerSsnNewerThanPackage). A value that cannot be decrypted is
  // treated as different and overwritten.
  if (filing.ownerSsnCiphertext && filing.ownerSsnSubmittedAt && sameSsn(filing.ownerSsnCiphertext, checked.ssn)) {
    return {
      last4: checked.last4,
      submittedAt: filing.ownerSsnSubmittedAt,
      replaced: false,
      unchanged: true,
    };
  }

  const ciphertext = encryptPii(checked.ssn);
  const submittedAt = new Date();
  const written = await prisma.$transaction(async (tx) => {
    // Conditional on the status so a fax that went out between the check and
    // this write can never get a new number under it.
    const { count } = await tx.filing.updateMany({
      where: { id: filing.id, status: { notIn: [...SSN_LOCKED_STATUSES, ...SSN_NOT_YET_STATUSES] } },
      data: {
        ownerSsnCiphertext: ciphertext,
        ownerSsnLast4: checked.last4,
        ownerSsnSubmittedAt: submittedAt,
        ownerSsnSubmittedBy: opts.submittedBy,
      },
    });
    if (count === 0) return false;
    await logFilingChange({
      tx,
      filingId: filing.id,
      adminId: opts.adminId,
      source: opts.source,
      field: OWNER_SSN_CHANGE_FIELD,
      before: { ssn: maskSsn(filing.ownerSsnLast4) || null },
      after: { ssn: maskSsn(checked.last4), submittedBy: opts.source === "customer" ? "client" : "admin" },
      reason:
        opts.source === "customer"
          ? "Client entered their SSN on the order page (stored encrypted)."
          : "Admin entered the client's SSN (stored encrypted).",
    });
    return true;
  });
  if (!written) throw new OwnerSsnError(409, "ssn_locked", SSN_LOCKED_MESSAGE);

  return { last4: checked.last4, submittedAt, replaced: !!filing.ownerSsnLast4, unchanged: false };
}

function sameSsn(ciphertext: string, ssn: string): boolean {
  try {
    return normalizeSsn(decryptPii(ciphertext)) === ssn;
  } catch {
    return false;
  }
}

// True when the SSN on file was saved AFTER the package that will be faxed
// was built, so that package does not show it. "Built" is the latest of:
//   - reviewApprovedAt: the accountant-reviewed PDF was uploaded (the client
//     then signs that file in the portal / staff place the signature on it —
//     those later signedAt stamps do NOT count, the content is the reviewed one);
//   - signedPdfUploadedAt: staff uploaded an already-signed PDF
//     (uploadSignedPdf sets signedAt but not reviewApprovedAt);
// and only when neither exists, signedAt (legacy packages with no review).
// Used by the admin card warning and the retryFax gate (which has an explicit,
// change-logged staff override for the case where the package does show it).
export function ownerSsnNewerThanPackage(
  filing: {
    ownerSsnSubmittedAt: Date | null;
    reviewApprovedAt: Date | null;
    signedAt: Date | null;
  },
  signedPdfUploadedAt: Date | null = null,
): boolean {
  if (!filing.ownerSsnSubmittedAt) return false;
  const stamps = [filing.reviewApprovedAt, signedPdfUploadedAt].filter((d): d is Date => d instanceof Date);
  const packageAt = stamps.length > 0 ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : filing.signedAt;
  if (!packageAt) return false;
  return filing.ownerSsnSubmittedAt.getTime() > packageAt.getTime();
}

// When staff last uploaded an already-signed PDF (admin "Upload signed PDF"):
// its change-log row (field "pdf", after.status SIGNED_UPLOADED with a byte
// count). Null when there is none or the lookup fails (the gate then falls
// back to the stricter rule; the staff override covers the rest).
export async function latestSignedPdfUploadAt(filingId: string): Promise<Date | null> {
  try {
    const rows = await prisma.filingChangeLog.findMany({
      where: { filingId, field: "pdf" },
      orderBy: { changedAt: "desc" },
      take: 20,
      select: { changedAt: true, afterJson: true },
    });
    for (const row of rows) {
      const after = row.afterJson as { status?: unknown; bytes?: unknown } | null;
      if (after && after.status === "SIGNED_UPLOADED" && typeof after.bytes === "number") return row.changedAt;
    }
  } catch (err) {
    console.error(`[ownerSsn] ${filingId} signed-upload lookup failed`, err instanceof Error ? err.name : err);
  }
  return null;
}

export const SSN_NEWER_THAN_PACKAGE_MESSAGE =
  "Fax held: the owner's SSN was added after this package was built, so it may not show the SSN on lines " +
  "4b(1)/8b(1). Regenerate the package with the SSN, then either upload it as the reviewed PDF (the client checks " +
  "and signs again) or, if the client has already signed the rebuilt package, upload that signed PDF. If the " +
  "package you are faxing does show the SSN, confirm that below with a reason to send it anyway.";

function assertEntryOpen(status: FilingStatus) {
  const state = ssnEntryState(status);
  if (state === "locked") throw new OwnerSsnError(409, "ssn_locked", SSN_LOCKED_MESSAGE);
  if (state === "not_paid") throw new OwnerSsnError(409, "not_paid", SSN_NOT_PAID_MESSAGE);
}

// Admin website only (S3). The reveal is change-logged (who, when) BEFORE the
// number is returned: no audit row, no reveal.
export async function revealOwnerSsn(opts: {
  filingId: string;
  adminId: string | null;
  revealedBy: string;
}): Promise<{ ssn: string; last4: string; revealedAt: Date }> {
  if (!isPiiCryptoConfigured()) {
    throw new OwnerSsnError(503, "not_configured", SSN_ADMIN_KEY_MISSING_MESSAGE);
  }
  const filing = await prisma.filing.findUnique({
    where: { id: opts.filingId },
    select: { id: true, ownerSsnCiphertext: true, ownerSsnLast4: true },
  });
  if (!filing) throw new OwnerSsnError(404, "not_found", "filing not found");
  if (!filing.ownerSsnCiphertext) throw new OwnerSsnError(404, "no_ssn", "No SSN on file for this filing.");

  let ssn: string;
  try {
    ssn = decryptPii(filing.ownerSsnCiphertext);
  } catch (err) {
    const code = err instanceof PiiCryptoError ? err.code : "unknown";
    console.error(`[ownerSsn] reveal for ${filing.id} could not decrypt (${code})`);
    throw new OwnerSsnError(500, "decrypt_failed", SSN_DECRYPT_FAILED_MESSAGE);
  }
  const last4 = ssn.slice(-4);
  const revealedAt = new Date();
  await logFilingChange({
    filingId: filing.id,
    adminId: opts.adminId,
    source: "admin",
    field: OWNER_SSN_REVEAL_FIELD,
    before: null,
    after: { action: "reveal", ssn: maskSsn(last4), revealedBy: opts.revealedBy, revealedAt },
    reason: "Admin revealed the SSN on the admin page.",
  });
  return { ssn: formatSsnForForms(ssn), last4, revealedAt };
}
