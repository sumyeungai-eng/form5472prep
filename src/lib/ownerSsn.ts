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
    select: { id: true, status: true, ownerSsnLast4: true },
  });
  if (!filing) throw new OwnerSsnError(404, "not_found", "Not found");
  assertEntryOpen(filing.status);

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

  return { last4: checked.last4, submittedAt, replaced: !!filing.ownerSsnLast4 };
}

// True when the SSN on file was saved AFTER the package now with the client
// was approved (reviewed PDF uploaded) or, without a review stamp, signed —
// so that package (and the signed copy the fax sends) does not show it. Used
// by the admin card warning and the retryFax gate.
export function ownerSsnNewerThanPackage(filing: {
  ownerSsnSubmittedAt: Date | null;
  reviewApprovedAt: Date | null;
  signedAt: Date | null;
}): boolean {
  const packageAt = filing.reviewApprovedAt ?? filing.signedAt;
  if (!filing.ownerSsnSubmittedAt || !packageAt) return false;
  return filing.ownerSsnSubmittedAt.getTime() > packageAt.getTime();
}

export const SSN_NEWER_THAN_PACKAGE_MESSAGE =
  "Fax held: the owner's SSN was added after this package was reviewed/signed, so the package does not show it on " +
  "lines 4b(1)/8b(1). Build a new package with the SSN and upload it as the reviewed PDF (the client checks and " +
  "signs again), then fax.";

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
