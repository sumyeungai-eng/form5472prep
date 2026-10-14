import { isPdfEncodable, PDF_TEXT_MESSAGE } from "@/lib/pdfText";
import { Prisma, type FilingStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import {
  sendFaxDeliveredEmail,
  sendMagicLinkEmail,
  sendOrderConfirmationEmail,
  sendOwnerSsnRequestEmail,
  sendReadyToSignEmail,
} from "@/lib/email";
import { submitFax, TelnyxSubmitRejectedError } from "@/lib/fax";
import { RETRY_CLAIM_GRACE_MS } from "@/lib/fax/pollCandidates";
import { publicUrl, put, putPdf, get as getStorageObject } from "@/lib/storage";
import { env } from "@/lib/env";
import { generatePackage, type GeneratedPackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { filingToPackageInput } from "@/lib/pdf/packageInput";
import { runPreflight, type PreflightIssue, type PreflightResult } from "@/lib/pdf/preflight";
import {
  CLEARED_PREFLIGHT_OVERRIDE,
  overrideCoversFailures,
  persistNewPackagePreflight,
  preflightIssueKey,
  preflightIssues,
  preflightResultColumns,
} from "@/lib/pdf/persistPreflight";
import {
  isLegalTransition,
  logFilingChange,
  TransitionError,
} from "@/lib/admin/mutations";
import {
  effectiveDueDateUtc,
  extensionUnclear,
  formatDueDate,
  isYearDelinquent,
} from "@/lib/schemas";
import { hasAdminReasonableCauseForFax, requiresReasonableCause } from "@/lib/completeness";
import { apnsConfigured, sendAdminPush } from "@/lib/apns";
import { brandForFiling } from "@/lib/partnerBrand";
import { isPiiCryptoConfigured } from "@/lib/crypto/pii";
import {
  OWNER_SSN_CHANGE_FIELD,
  OWNER_SSN_REQUEST_FIELD,
  OwnerSsnError,
  ownerSsnNewerThanPackage,
  revealOwnerSsn,
  saveOwnerSsn,
  SSN_ADMIN_KEY_MISSING_MESSAGE,
  SSN_LOCKED_MESSAGE,
  SSN_NEWER_THAN_PACKAGE_MESSAGE,
  ssnEntryState,
} from "@/lib/ownerSsn";
import {
  deliveryFactsFromTelnyx,
  faxProofFromFacts,
  fetchTelnyxFax,
  isTerminalFaxStatus,
  TELNYX_DELIVERED_STATUS,
} from "@/lib/fax/telnyxStatus";

export type FilingActionName =
  | "setStatus"
  | "resendOrderConfirmation"
  | "resendMagicLink"
  | "resendFaxConfirmation"
  | "retryFax"
  | "regeneratePdf"
  | "approvePreflightOverride"
  | "rerunPreflight"
  | "approveForSignature"
  | "updateField"
  | "updateYearField"
  | "uploadReviewedPdf"
  | "uploadSignedPdf"
  // SSN capture (docs/reviews/2026-10-15-ssn-capture-spec.md).
  | "requestOwnerSsn"
  | "setOwnerSsn"
  | "revealOwnerSsn";

export type FilingActionContext = {
  adminId: string | null;
  /** Who is approving: the personal admin id, or the shared admin login's email. Null only when
   *  the caller could not be identified at all. Used for approvals that must be attributed. */
  approver?: string | null;
  force?: boolean;
  reason?: string;
  /** retryFax only: the deliberate "send this fax again" confirmation carried by THIS request
   *  (see refaxDecision). Kept apart from `force`/`reason` because the web admin route sets those
   *  blanket-true for its legacy gates — a blanket flag must never count as a re-fax confirmation.
   *  When absent, `force`/`reason` are used (the v1 API passes them per request). */
  refax?: RefaxOverride;
  /** Who caused a pre-flight re-run's change-log rows: "admin" (default), or
   *  "customer" when the client's own SSN entry triggered it. */
  changeSource?: "admin" | "customer";
};

export type FilingActionResult = { ok: true; [k: string]: unknown };

export const FILING_ACTION_NAMES = [
  "setStatus",
  "resendOrderConfirmation",
  "resendMagicLink",
  "resendFaxConfirmation",
  "retryFax",
  "regeneratePdf",
  "approvePreflightOverride",
  "rerunPreflight",
  "approveForSignature",
  "updateField",
  "updateYearField",
  "uploadReviewedPdf",
  "uploadSignedPdf",
  "requestOwnerSsn",
] as const satisfies readonly FilingActionName[];

// Admin-WEBSITE-only actions. They carry (setOwnerSsn) or return
// (revealOwnerSsn) the plaintext SSN, so they are deliberately NOT in
// FILING_ACTION_NAMES — the admin v1 (iOS) API allow-list, whose idempotency
// store persists results — and the web route refuses them for bearer-token
// (device) callers. Spec S3: the v1 API only ever sees the SSN masked.
export const WEB_ADMIN_ONLY_FILING_ACTIONS = [
  "setOwnerSsn",
  "revealOwnerSsn",
] as const satisfies readonly FilingActionName[];

export function isWebAdminOnlyFilingAction(action: string): boolean {
  return (WEB_ADMIN_ONLY_FILING_ACTIONS as readonly string[]).includes(action);
}

export const SIDE_EFFECTING_ACTIONS: ReadonlySet<FilingActionName> = new Set<FilingActionName>([
  "retryFax",
  "resendOrderConfirmation",
  "resendMagicLink",
  "resendFaxConfirmation",
  "regeneratePdf",
  "approveForSignature",
  "requestOwnerSsn",
]);

export class FilingActionError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "FilingActionError";
    this.status = status;
    this.code = code;
  }
}

export function isValidForceOverride(
  ctx: Pick<FilingActionContext, "force" | "reason">,
): boolean {
  return ctx.force === true && typeof ctx.reason === "string" && ctx.reason.trim().length > 0;
}

// ---- Re-fax guard ----------------------------------------------------------
//
// DUPLICATE IRS FAXES MUST NOT BE ONE CLICK AWAY. retryFax sends freely only
// when no earlier fax can still reach the IRS: the first send (no fax job yet)
// or a retry after a CONFIRMED failure (faxStatus "failed…"). Once a fax went
// out or may still go out, a human must confirm with force + a written reason;
// while a resubmission claim ("retrying_N", see lib/fax/retry.ts) is fresh,
// nothing may send at all. Status names follow lib/fax/telnyxStatus.ts.

export type RefaxOverride = { force: boolean; reason: string | null };

export const MIN_REFAX_REASON_CHARS = 10;

// Claim label held while a MANUAL send is between "decided" and "recorded".
// Reuses the retrying_N convention (N = 0: not an automatic attempt), so the
// webhook, the hourly poll, the automatic retry and this guard all already
// treat it as "a submission may be with Telnyx — hands off".
export const MANUAL_FAX_CLAIM = "retrying_0";

export type RefaxState =
  | "retry_claim_stale"
  | "delivered"
  | "fax_in_flight"
  | "outcome_unknown";

export type RefaxDecision =
  | { kind: "allowed" }
  | { kind: "needs_override"; state: RefaxState; message: string }
  | { kind: "refused"; message: string };

function isRetryClaimLabel(faxStatus: string | null | undefined): boolean {
  return !!faxStatus && /^retrying_\d+$/.test(faxStatus);
}

function nonSpaceLength(text: string): number {
  return text.replace(/\s/g, "").length;
}

const REASON_HINT = `To send anyway, confirm with a reason (at least ${MIN_REFAX_REASON_CHARS} characters).`;

export function refaxDecision(
  filing: {
    status: string;
    faxJobId: string | null;
    faxStatus: string | null;
    /** Row's last write; for a retrying_N claim, when the claim was taken. */
    updatedAt?: Date | null;
  },
  now: Date,
): RefaxDecision {
  const { status, faxJobId, faxStatus } = filing;

  if (isRetryClaimLabel(faxStatus)) {
    // A claim with no readable timestamp (or one from the future) counts as fresh.
    const ageMs = filing.updatedAt ? now.getTime() - filing.updatedAt.getTime() : -1;
    if (ageMs < RETRY_CLAIM_GRACE_MS) {
      const mins = Math.max(0, Math.floor(ageMs / 60_000));
      const clearsAt = filing.updatedAt
        ? formatUtcMinute(new Date(filing.updatedAt.getTime() + RETRY_CLAIM_GRACE_MS))
        : "15 minutes from now";
      return {
        kind: "refused",
        message:
          `A fax submission for this filing is in progress right now (fax status ${faxStatus}, started ${mins} min ago) — ` +
          `an automatic retry or another admin's send. Sending another fax now could give the IRS a duplicate, so this is ` +
          `refused even with a reason. If it has not cleared by ${clearsAt}, check Telnyx for a newer outbound fax to the ` +
          `IRS for this filing before sending again.`,
      };
    }
    return {
      kind: "needs_override",
      state: "retry_claim_stale",
      message:
        `A fax submission for this filing started ${Math.floor(ageMs / 60_000)} min ago (fax status ${faxStatus}) and never ` +
        `recorded its result — that fax may or may not have reached Telnyx. Check Telnyx for a newer outbound fax to the ` +
        `IRS for this filing first. ${REASON_HINT}`,
    };
  }

  if (status === "CONFIRMED" || faxStatus === "delivered") {
    return {
      kind: "needs_override",
      state: "delivered",
      message:
        `This filing was already delivered to the IRS${faxJobId ? ` (fax ${faxJobId})` : ""}. Faxing again sends the IRS ` +
        `a second copy of the package — only do this if the IRS asked for it. ${REASON_HINT}`,
    };
  }

  if (status === "FAXED") {
    return {
      kind: "needs_override",
      state: "fax_in_flight",
      message:
        `A fax for this filing is already on its way or waiting for delivery confirmation (fax status ` +
        `${faxStatus ?? "unknown"}). Sending again may give the IRS a duplicate — check Telnyx first. ${REASON_HINT}`,
    };
  }

  // Not FAXED, but the last job never reported an outcome (e.g. the status was
  // overridden by hand while Telnyx was still sending). A terminal failure
  // ("failed" / "failed:<reason>") is the only outcome that frees a re-send.
  if (faxJobId && !isTerminalFaxStatus(faxStatus)) {
    return {
      kind: "needs_override",
      state: "outcome_unknown",
      message:
        `Fax ${faxJobId} for this filing has not reported an outcome yet (fax status ${faxStatus ?? "unknown"}), even ` +
        `though the filing is marked ${status}. It may still reach the IRS — check Telnyx first. ${REASON_HINT}`,
    };
  }

  return { kind: "allowed" };
}

function formatUtcMinute(d: Date): string {
  return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

const VALID_STATUSES: ReadonlySet<string> = new Set([
  "DRAFT",
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

const payloadSchema = z.object({}).catchall(z.unknown());

const filingSelect = {
  id: true,
  status: true,
  tier: true,
  amountPaid: true,
  llcName: true,
  llcEin: true,
  llcAddress: true,
  llcCity: true,
  llcState: true,
  llcZip: true,
  llcCountry: true,
  llcCountryBusiness: true,
  llcMemberCount: true,
  ownerHasFtin: true,
  ownerNoPostalCode: true,
  llcAddressIsRegisteredAgentOnly: true,
  priorForm5472Filed: true,
  hasUsSourceIncome: true,
  usTaxWithheld: true,
  llcBusinessActivity: true,
  llcBusinessCode: true,
  ownerName: true,
  ownerAddress: true,
  ownerAddressStreet: true,
  ownerAddressCity: true,
  ownerAddressState: true,
  ownerAddressPostal: true,
  ownerAddressCountry: true,
  ownerCountryCitizenship: true,
  ownerCountryTaxResidence: true,
  ownerCountryBusiness: true,
  ownerFtin: true,
  ownerItin: true,
  ownerReferenceId: true,
  // SSN capture: masked state only — the ciphertext is never selected here.
  ownerSsnLast4: true,
  ownerSsnSubmittedAt: true,
  ownerSsnRequestedAt: true,
  // retryFax's SSN gate compares the SSN time with the signature time.
  signedAt: true,
  reasonableCauseNarrative: true,
  // Generator 2.3.0 paid preparer settings (updateField logs their BEFORE value).
  paidPreparerMode: true,
  irsMayDiscussWithPreparer: true,
  taxYears: true,
  isDiirsp: true,
  isFinalReturn: true,
  dissolvedAt: true,
  // Form 7004 gate. Read here (not just in packageFilingSelect) because
  // updateField logs the BEFORE value of these fields, and the confirmation
  // email's deadline line is computed from them.
  extensionFiled: true,
  extensionTransmittedAt: true,
  extensionMethod: true,
  extensionDestination: true,
  // Part of the cascade: a filing that no longer records an extension must not
  // keep the "proof of extension" upload attached to it.
  extensionProofKey: true,
  faxService: true,
  signedPdfKey: true,
  signaturePngKey: true,
  generatedPdfKey: true,
  preflightStatus: true,
  preflightFailures: true,
  preflightWarnings: true,
  preflightCheckedAt: true,
  preflightOverrideBy: true,
  preflightOverrideAt: true,
  preflightOverrideReason: true,
  reviewApprovedAt: true,
  reviewApprovedBy: true,
  generatorVersion: true,
  generatorCommit: true,
  faxedPdfKey: true,
  faxedAt: true,
  faxJobId: true,
  faxStatus: true,
  faxConfirmationKey: true,
  // retryFax's re-fax guard: for a retrying_N claim, when it was taken.
  updatedAt: true,
  user: { select: { id: true, email: true } },
  yearData: {
    select: {
      taxYear: true,
      rcsWhyMissed: true,
      rcsWhenLearned: true,
      rcsNoIrsNoticeConfirmed: true,
      // Generator 2.3.0 admin RCS fields (staff-only).
      rcsAdminNarrative: true,
      rcsLearnedOn: true,
      rcsSmallCorpParagraph: true,
    },
  },
} as const;

export const packageFilingSelect = {
  llcName: true,
  llcEin: true,
  llcAddress: true,
  llcCity: true,
  llcState: true,
  llcZip: true,
  llcCountry: true,
  llcCountryBusiness: true,
  llcMemberCount: true,
  ownerHasFtin: true,
  ownerNoPostalCode: true,
  llcAddressIsRegisteredAgentOnly: true,
  priorForm5472Filed: true,
  hasUsSourceIncome: true,
  usTaxWithheld: true,
  llcDateIncorporated: true,
  llcBusinessActivity: true,
  llcBusinessCode: true,
  ownerName: true,
  ownerAddress: true,
  ownerAddressStreet: true,
  ownerAddressCity: true,
  ownerAddressState: true,
  ownerAddressPostal: true,
  ownerAddressCountry: true,
  ownerCountryCitizenship: true,
  ownerCountryTaxResidence: true,
  ownerCountryBusiness: true,
  ownerFtin: true,
  ownerItin: true,
  // Encrypted owner SSN: decrypted only inside filingToPackageInput (S7).
  ownerSsnCiphertext: true,
  ownerReferenceId: true,
  taxYears: true,
  isDiirsp: true,
  isFinalReturn: true,
  dissolvedAt: true,
  // Form 7004 facts. generatePackage applies them to max(taxYears) only; a
  // valid extension makes that year timely and drops the DIIRSP language.
  extensionFiled: true,
  extensionTransmittedAt: true,
  reasonableCauseNarrative: true,
  // Generator 2.3.0: per-order paid preparer block settings.
  paidPreparerMode: true,
  irsMayDiscussWithPreparer: true,
  yearData: {
    select: {
      taxYear: true,
      totalAssetsYearEnd: true,
      contributions: true,
      distributions: true,
      otherTransactionsNote: true,
      reportableTransactions: true,
      nonCashTransfers: true,
      ownerPaidCosts: true,
      zeroConfirmations: true,
      rcsWhyMissed: true,
      rcsWhenLearned: true,
      rcsNoIrsNoticeConfirmed: true,
      // Generator 2.3.0 admin RCS fields.
      rcsAdminNarrative: true,
      rcsLearnedOn: true,
      rcsSmallCorpParagraph: true,
    },
  },
} as const;

const YEAR_NULLABLE_STRINGS = new Set(["rcsWhyMissed", "rcsWhenLearned", "rcsAdminNarrative"]);
const YEAR_NULLABLE_BOOLEANS = new Set(["rcsNoIrsNoticeConfirmed", "rcsSmallCorpParagraph"]);
const YEAR_NULLABLE_DATES = new Set(["rcsLearnedOn"]);
// The admin-authored RCS narrative renders into a signed IRS statement; keep it
// to a length that fits the statement page.
const MAX_RCS_NARRATIVE_CHARS = 4000;

// Filing columns an admin may edit with updateField (same set the customer can
// edit in the wizard, plus the Form 7004 remediation fields and the paid
// preparer settings). Exported so the admin page can tell a package-data edit
// from other change-log rows (stale pre-flight badge).
export const ADMIN_EDITABLE_FILING_FIELDS = [
  "llcName", "llcEin", "llcAddress", "llcCity", "llcState", "llcZip",
  "llcCountry", "llcCountryBusiness", "llcBusinessActivity", "llcBusinessCode",
  "llcMemberCount", "llcAddressIsRegisteredAgentOnly", "priorForm5472Filed",
  "ownerName", "ownerAddress",
  // The structured owner address is what Form 5472 line 4a prints when
  // present (the single line is only the fallback), so pre-flight W39's
  // "correct it by hand" needs these to be editable.
  "ownerAddressStreet", "ownerAddressCity", "ownerAddressState",
  "ownerAddressPostal", "ownerAddressCountry",
  "ownerCountryCitizenship", "ownerCountryTaxResidence",
  "ownerCountryBusiness", "ownerFtin", "ownerItin", "ownerReferenceId",
  "ownerHasFtin", "ownerNoPostalCode", "hasUsSourceIncome", "usTaxWithheld",
  "reasonableCauseNarrative",
  // Form 7004 gate + the late/timely classification it drives. These are
  // the remediation path for orders sold BEFORE the extension question
  // existed: a customer who writes in "I filed a 7004 on April 10" gets
  // the facts recorded here, isDiirsp corrected, and the package
  // regenerated — no wizard round-trip, no re-purchase.
  "extensionFiled", "extensionTransmittedAt", "extensionMethod",
  "extensionDestination", "isDiirsp",
  // Generator 2.3.0: per-order paid preparer block (staff-only settings).
  "paidPreparerMode", "irsMayDiscussWithPreparer",
] as const;

export const ADMIN_EDITABLE_YEAR_FIELDS = [
  "rcsWhyMissed",
  "rcsWhenLearned",
  "rcsNoIrsNoticeConfirmed",
  "rcsAdminNarrative",
  "rcsLearnedOn",
  "rcsSmallCorpParagraph",
  "nonCashTransfers",
  "ownerPaidCosts",
  "zeroConfirmations",
] as const;

// Columns updateField may change as a side effect of an edit (cascade or
// recompute); each gets its own change-log row.
const DERIVED_FILING_FIELDS = ["extensionProofKey"] as const;
// Package data changed outside updateField: the owner's SSN (client box or
// admin entry; the change-log row holds only the masked number).
const OTHER_PACKAGE_DATA_FIELDS = [OWNER_SSN_CHANGE_FIELD] as const;

// True for change-log rows that record a change to the data the package is
// built from: updateField rows (and their derived rows) and updateYearField
// rows ("year:<YYYY>:<field>"). Pre-flight runs, overrides, PDFs, emails and
// status changes are not data changes.
export function isPackageDataChangeField(field: string): boolean {
  return (
    field.startsWith("year:") ||
    (ADMIN_EDITABLE_FILING_FIELDS as readonly string[]).includes(field) ||
    (DERIVED_FILING_FIELDS as readonly string[]).includes(field) ||
    (OTHER_PACKAGE_DATA_FIELDS as readonly string[]).includes(field)
  );
}

export const PACKAGE_DATA_CHANGE_WHERE = {
  OR: [
    { field: { startsWith: "year:" } },
    {
      field: {
        in: [...ADMIN_EDITABLE_FILING_FIELDS, ...DERIVED_FILING_FIELDS, ...OTHER_PACKAGE_DATA_FIELDS] as string[],
      },
    },
  ],
} satisfies Prisma.FilingChangeLogWhereInput;

const adminNonCashTransferSchema = z.object({
  date: z.string().trim().min(1).refine(isPdfEncodable, PDF_TEXT_MESSAGE),
  direction: z.enum(["in", "out"]),
  description: z.string().trim().min(1).refine(isPdfEncodable, PDF_TEXT_MESSAGE),
  fairMarketValueCents: z.number().int().finite(),
  valuationMethod: z.string().trim().min(1).refine(isPdfEncodable, PDF_TEXT_MESSAGE),
  alsoInPartV: z.boolean(),
}).strict();

const adminOwnerPaidCostSchema = z.object({
  category: z.enum([
    "state_filing_fee",
    "registered_agent",
    "formation_or_ein_service",
    "software_subscriptions",
    "initial_bank_funding",
    "other",
  ]),
  date: z.string().trim().min(1).refine(isPdfEncodable, PDF_TEXT_MESSAGE),
  amountCents: z.number().int().finite(),
  note: z.string().refine(isPdfEncodable, PDF_TEXT_MESSAGE).optional(),
}).strict();

const adminZeroConfirmationsSchema = z.object({
  contributions: z.boolean().optional(),
  distributions: z.boolean().optional(),
  loansFromOwner: z.boolean().optional(),
  loansToOwner: z.boolean().optional(),
  ownerPaidCosts: z.boolean().optional(),
}).strict();

const YEAR_JSON_SCHEMAS = {
  nonCashTransfers: z.array(adminNonCashTransferSchema),
  ownerPaidCosts: z.array(adminOwnerPaidCostSchema),
  zeroConfirmations: adminZeroConfirmationsSchema,
} as const;

function parseNullableBoolean(field: string, value: string | null): boolean | null {
  const blank = value === null || value.trim() === "";
  const truthy = new Set(["true", "yes", "1"]);
  const falsy = new Set(["false", "no", "0"]);
  const raw = (value ?? "").trim().toLowerCase();
  if (blank) return null;
  if (truthy.has(raw)) return true;
  if (falsy.has(raw)) return false;
  throw new FilingActionError(400, "invalid_value", `${field} must be true, false, or blank`);
}

function parseYearJsonField(field: keyof typeof YEAR_JSON_SCHEMAS, value: unknown): unknown {
  if (value === null) return null;
  if (typeof value === "string") {
    if (value.trim() === "") return null;
    try {
      value = JSON.parse(value);
    } catch {
      throw new FilingActionError(400, "invalid_value", `${field} must be valid JSON`);
    }
  }
  const parsed = YEAR_JSON_SCHEMAS[field].safeParse(value);
  if (!parsed.success) {
    if (parsed.error.issues.some((issue) => issue.message === PDF_TEXT_MESSAGE)) {
      throw new FilingActionError(400, "invalid_value", PDF_TEXT_MESSAGE);
    }
    throw new FilingActionError(400, "invalid_value", `${field} has an invalid shape`);
  }
  return parsed.data;
}

function yearJsonWriteValue(value: unknown) {
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

// Why the reviewed-PDF upload is blocked, in words the admin can act on. The
// gate reads the stored pre-flight of the ORDER DATA, not the uploaded file.
export function preflightBlockedMessage(filing: {
  preflightFailures: unknown;
  preflightCheckedAt: Date | null;
}): string {
  const ids = Array.from(new Set(preflightIssues(filing.preflightFailures).map((issue) => issue.id)));
  const checked = filing.preflightCheckedAt
    ? ` (checked ${filing.preflightCheckedAt.toISOString().slice(0, 16).replace("T", " ")} UTC)`
    : "";
  return (
    `Pre-flight failed${checked} and no override is recorded, so the reviewed PDF can't be uploaded yet` +
    `${ids.length > 0 ? `. Failing checks: ${ids.join(", ")}` : ""}. Pre-flight checks the order data, not the ` +
    "uploaded PDF: fix the data (pre-flight re-runs after each save) or click \"Re-run pre-flight\", or record " +
    "\"Approve despite pre-flight failures\" with a reason."
  );
}

function hasPreflightApproval(filing: {
  preflightStatus: string | null;
  preflightOverrideBy: string | null;
}): boolean {
  return filing.preflightStatus === "passed" || !!filing.preflightOverrideBy;
}

// ─── Extension review flags (internal only) ──────────────────────────────────
// Three things about a Form 7004 answer that a human must look at before the
// package is faxed. None of them change what the customer is told or what the
// PDF says — they exist because the extension is a customer-ASSERTED fact and
// the accountant reviews every package anyway. Shared by the admin list and
// the admin detail page so the chip and the block can never disagree.
export type ExtensionReviewFlag = {
  code: "unclear" | "destination" | "premature";
  detail: string;
};

export type ExtensionReviewInput = {
  taxYears: number[];
  isFinalReturn: boolean;
  dissolvedAt: Date | null;
  extensionFiled: string | null;
  extensionTransmittedAt: Date | null;
  extensionDestination: string | null;
};

export function extensionReviewFlags(f: ExtensionReviewInput): ExtensionReviewFlag[] {
  const flags: ExtensionReviewFlag[] = [];
  // "I'm not sure" is deliberately NOT collapsed into yes or no anywhere in the
  // product, so somebody has to ask the customer.
  if (extensionUnclear({ filed: f.extensionFiled, transmittedAt: f.extensionTransmittedAt })) {
    flags.push({ code: "unclear", detail: "Extension unclear — confirm with customer before fax" });
  }
  // A foreign-owned DE's 7004 has to go to the Ogden address/fax. Anything else
  // may mean the extension never posted to this entity's account.
  if (f.extensionDestination === "standard" || f.extensionDestination === "not_sure") {
    flags.push({ code: "destination", detail: "7004 may have gone to the wrong address — verify" });
  }
  // A 7004 transmitted before the tax year even closed is usually a mistyped
  // year (or an extension for the PREVIOUS year being credited to this one).
  const maxYear = f.taxYears.length > 0 ? Math.max(...f.taxYears) : null;
  const sent = f.extensionTransmittedAt?.getTime() ?? null;
  if (sent !== null && maxYear !== null) {
    // The boundary is EXCLUSIVE: the tax year is not over until its last day
    // has ENDED, so the first non-premature instant is the start of the day
    // AFTER year end. Comparing against Dec 31 itself (as this used to) missed
    // a 7004 sent ON December 31 — sent while the year was still running, which
    // is exactly the mistake the flag exists to catch.
    //
    // A final return's year ends on the dissolution date instead — but only
    // when that date actually falls in maxYear. A dissolvedAt in some other
    // year (stale value, mis-keyed year, or a multi-year bundle whose final
    // year isn't the latest) would otherwise move the boundary to an unrelated
    // point on the calendar; fall back to the normal December 31 rule.
    const dissolvedInMaxYear =
      f.isFinalReturn &&
      f.dissolvedAt !== null &&
      !Number.isNaN(f.dissolvedAt.getTime()) &&
      f.dissolvedAt.getUTCFullYear() === maxYear;
    const yearEndExclusive = dissolvedInMaxYear
      ? f.dissolvedAt!.getTime() + 24 * 60 * 60 * 1000
      : Date.UTC(maxYear + 1, 0, 1);
    if (sent < yearEndExclusive) {
      flags.push({ code: "premature", detail: "7004 possibly premature — sent before the tax year closed" });
    }
  }
  return flags;
}

// When the admin "Resend fax confirmation" action is offered: delivery was
// confirmed — a receipt is on file, or the filing is CONFIRMED with a Telnyx
// job (the receipt PDF can fail to generate even though the fax delivered).
// Shared by the action and the admin page so the button and server agree.
export function canResendFaxConfirmation(filing: {
  faxConfirmationKey: string | null;
  status: string;
  faxJobId: string | null;
}): boolean {
  return !!filing.faxConfirmationKey || (filing.status === "CONFIRMED" && !!filing.faxJobId);
}

// ─── Pre-flight re-run (spec item 1, decision D11) ──────────────────────────
// Pre-flight evaluates the ORDER DATA (the package is rebuilt in memory), never
// an uploaded PDF. It re-runs on demand ("Re-run pre-flight"), after every
// change-logged field save, and after Regenerate, so the result an upload is
// gated on is current. A re-run writes no PDF.

type FilingRow = Prisma.FilingGetPayload<{ select: typeof filingSelect }>;

export type PreflightRerunSummary =
  | {
      ran: true;
      status: "passed" | "failed";
      failures: PreflightIssue[];
      warnings: PreflightIssue[];
      checkedAt: string;
      overrideCleared: boolean;
    }
  | {
      ran: false;
      reason: "missing_required_fields" | "generation_failed" | "not_applicable";
      message: string;
    };

const MISSING_PACKAGE_FIELDS_MESSAGE = "filing is missing required fields — finish the wizard first";

// The reviewed upload is the client version while generatedPdfKey points at it.
export function isReviewedPdfKey(key: string | null | undefined): boolean {
  return !!key && key.includes("_reviewed_");
}

async function loadPackageFiling(filingId: string) {
  return prisma.filing.findUnique({
    where: { id: filingId },
    select: {
      ...packageFilingSelect,
      yearData: {
        ...packageFilingSelect.yearData,
        orderBy: { taxYear: "asc" as const },
      },
    },
  });
}

type PackageFilingLoaded = NonNullable<Awaited<ReturnType<typeof loadPackageFiling>>>;

function hasPackageRequiredFields(full: PackageFilingLoaded): boolean {
  return !!(
    full.llcName && full.llcEin && full.llcAddress && full.llcCity &&
    full.llcState && full.llcZip && full.llcDateIncorporated &&
    full.llcBusinessActivity && full.llcBusinessCode && full.ownerName &&
    full.ownerAddress && full.ownerCountryCitizenship &&
    full.ownerCountryTaxResidence && full.ownerCountryBusiness &&
    (full.ownerFtin || full.ownerHasFtin === false)
  );
}

// The failures the admin approved when recording the current override: stored
// on its change-log row (approvedFailures). Overrides recorded before that was
// stored fall back to the failures on the filing, which nothing re-ran since.
async function approvedFailuresForOverride(filing: FilingRow): Promise<PreflightIssue[]> {
  try {
    const entry = await prisma.filingChangeLog.findFirst({
      where: { filingId: filing.id, field: "preflightOverride" },
      orderBy: { changedAt: "desc" },
      select: { afterJson: true },
    });
    const approved = (entry?.afterJson as { approvedFailures?: unknown } | null | undefined)?.approvedFailures;
    if (Array.isArray(approved)) return preflightIssues(approved);
  } catch (err) {
    console.error(`[preflight] ${filing.id} override lookup failed`, err);
  }
  return preflightIssues(filing.preflightFailures);
}

// Persist a pre-flight result for the package that is ALREADY with the client
// (a re-run, or a draft-only regenerate while a reviewed PDF is current). The
// recorded override is kept only if every new failure was one it approved;
// otherwise it is cleared and that is change-logged too.
async function persistRerunPreflight(
  filing: FilingRow,
  preflight: PreflightResult,
  ctx: FilingActionContext,
  trigger: string,
): Promise<{ checkedAt: Date; overrideCleared: boolean }> {
  const checkedAt = new Date();
  let overrideCleared = false;
  let approved: PreflightIssue[] = [];
  if (filing.preflightOverrideBy && preflight.failures.length > 0) {
    approved = await approvedFailuresForOverride(filing);
    overrideCleared = !overrideCoversFailures(approved, preflight.failures);
  }
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      ...preflightResultColumns(preflight, checkedAt),
      ...(overrideCleared ? CLEARED_PREFLIGHT_OVERRIDE : {}),
    },
    select: { id: true },
  });
  const ids = (issues: PreflightIssue[]) => issues.map((issue) => issue.id);
  const source = ctx.changeSource ?? "admin";
  await logFilingChange({
    filingId: filing.id,
    adminId: ctx.adminId,
    source,
    field: "preflight",
    before: {
      preflightStatus: filing.preflightStatus,
      preflightCheckedAt: filing.preflightCheckedAt,
      failureIds: ids(preflightIssues(filing.preflightFailures)),
    },
    after: {
      action: "rerunPreflight",
      trigger,
      preflightStatus: preflight.ok ? "passed" : "failed",
      preflightCheckedAt: checkedAt,
      failureIds: ids(preflight.failures),
      warningIds: ids(preflight.warnings),
      overrideKept: !!filing.preflightOverrideBy && !overrideCleared,
    },
    reason: ctx.reason,
  });
  if (overrideCleared) {
    const approvedKeys = new Set(approved.map(preflightIssueKey));
    await logFilingChange({
      filingId: filing.id,
      adminId: ctx.adminId,
      source,
      field: "preflightOverride",
      before: {
        preflightOverrideBy: filing.preflightOverrideBy,
        preflightOverrideAt: filing.preflightOverrideAt,
        preflightOverrideReason: filing.preflightOverrideReason,
      },
      after: {
        cleared: true,
        trigger,
        notApprovedFailures: preflight.failures.filter((issue) => !approvedKeys.has(preflightIssueKey(issue))),
      },
      reason: "Pre-flight re-run found failures the recorded override did not approve; the override was cleared.",
    });
  }
  return { checkedAt, overrideCleared };
}

async function rerunPreflightNow(
  filing: FilingRow,
  ctx: FilingActionContext,
  trigger: string,
): Promise<PreflightRerunSummary> {
  const full = await loadPackageFiling(filing.id);
  if (!full || !hasPackageRequiredFields(full)) {
    return { ran: false, reason: "missing_required_fields", message: MISSING_PACKAGE_FIELDS_MESSAGE };
  }
  let pkg: GeneratedPackage;
  try {
    pkg = await generatePackage(filingToPackageInput(full));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    return { ran: false, reason: "generation_failed", message: `The package could not be built in memory: ${msg}` };
  }
  const preflight = await runPreflight(pkg.record, pkg.bytes);
  const { checkedAt, overrideCleared } = await persistRerunPreflight(filing, preflight, ctx, trigger);
  return {
    ran: true,
    status: preflight.ok ? "passed" : "failed",
    failures: preflight.failures,
    warnings: preflight.warnings,
    checkedAt: checkedAt.toISOString(),
    overrideCleared,
  };
}

// After a change-logged field save. Never fails the save it follows: a
// problem is reported in the result (and the page then shows the stale badge).
async function autoRerunPreflight(
  filing: FilingRow,
  ctx: FilingActionContext,
  trigger: string,
): Promise<PreflightRerunSummary> {
  if (["DRAFT", "FAXED", "CONFIRMED"].includes(filing.status)) {
    return {
      ran: false,
      reason: "not_applicable",
      message: `Pre-flight is not re-run automatically for a ${filing.status} filing.`,
    };
  }
  try {
    return await rerunPreflightNow(filing, ctx, trigger);
  } catch (err) {
    console.error(`[preflight] ${filing.id} automatic re-run after ${trigger} failed`, err);
    return {
      ran: false,
      reason: "generation_failed",
      message: err instanceof Error ? err.message : "Pre-flight re-run failed",
    };
  }
}

// The client's own SSN entry (POST /api/filings/[id]/ssn) changes package
// data like an admin field save does, so it gets the same automatic pre-flight
// re-run (spec S5). Same guarantees as autoRerunPreflight: never throws, skips
// DRAFT/FAXED/CONFIRMED, and a problem leaves the stale badge to show.
export async function rerunPreflightAfterOwnerSsnChange(
  filingId: string,
  ctx: FilingActionContext,
): Promise<PreflightRerunSummary> {
  try {
    const filing = await prisma.filing.findUnique({ where: { id: filingId }, select: filingSelect });
    if (!filing) {
      return { ran: false, reason: "not_applicable", message: "filing not found" };
    }
    return await autoRerunPreflight(filing, ctx, OWNER_SSN_CHANGE_FIELD);
  } catch (err) {
    console.error(`[preflight] ${filingId} re-run after SSN change failed`, err);
    return { ran: false, reason: "generation_failed", message: "Pre-flight re-run failed" };
  }
}

export async function runFilingAction(
  filingId: string,
  action: FilingActionName,
  payload: unknown,
  ctx: FilingActionContext,
): Promise<FilingActionResult> {
  const parsedPayload = payloadSchema.safeParse(payload ?? {});
  if (!parsedPayload.success) {
    throw new FilingActionError(400, "invalid_payload", "invalid action payload");
  }
  const body = parsedPayload.data;

  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: filingSelect,
  });
  if (!filing) {
    throw new FilingActionError(404, "not_found", "filing not found");
  }

  switch (action) {
    case "setStatus": {
      const next = String(body.status ?? "").toUpperCase();
      if (!VALID_STATUSES.has(next)) {
        throw new FilingActionError(400, "invalid_status", "invalid status");
      }
      const nextStatus = next as FilingStatus;
      if (!isLegalTransition(filing.status, nextStatus) && !isValidForceOverride(ctx)) {
        throw new TransitionError(filing.status, nextStatus);
      }
      // Cast to satisfy Prisma's enum type. We validated against the same set.
      await prisma.filing.update({
        where: { id: filing.id },
        data: { status: nextStatus },
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "status",
        before: filing.status,
        after: nextStatus,
        reason: ctx.reason,
      });
      if (apnsConfigured()) {
        try {
          await sendAdminPush({
            title: "Filing updated",
            body: `${filing.llcName ?? filing.id} → ${nextStatus}`,
            threadId: filing.id,
          });
        } catch {}
      }
      return { ok: true };
    }

    case "resendOrderConfirmation": {
      if (!filing.user) {
        throw new FilingActionError(400, "no_customer_email", "no customer email");
      }
      // Regenerate the PDF fresh against the latest generator code, store to
      // R2, and attach to the email — so a stale PDF (e.g. from a previous
      // template version) is never what the customer receives.
      // Never once the package has been reviewed or signed: rebuilding would
      // silently replace the accountant-reviewed upload (or the version the
      // client signed) with an unreviewed one. The email then goes without
      // the PDF; the client sees the current package in their portal.
      const packageLocked =
        !!filing.reviewApprovedAt ||
        !!filing.signaturePngKey ||
        !!filing.signedPdfKey ||
        ["SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(filing.status);
      let pdfBytes: Uint8Array | null = null;
      let signatures: SignatureLocation[] = [];
      if (!packageLocked) try {
        const full = await prisma.filing.findUnique({
          where: { id: filing.id },
          select: packageFilingSelect,
        });
        if (full?.llcName && full.llcEin && full.llcAddress && full.llcCity && full.llcState &&
            full.llcZip && full.llcDateIncorporated && full.llcBusinessActivity &&
            full.llcBusinessCode && full.ownerName && full.ownerAddress &&
            full.ownerCountryCitizenship && full.ownerCountryTaxResidence &&
            full.ownerCountryBusiness && (full.ownerFtin || full.ownerHasFtin === false)) {
          const result = await generatePackage(filingToPackageInput(full));
          pdfBytes = result.bytes;
          signatures = result.signatures;
          const key = `${filing.id}_unsigned.pdf`;
          await putPdf(key, result.bytes);
          const preflight = await runPreflight(result.record, result.bytes);
          await persistNewPackagePreflight({
            filingId: filing.id,
            preflight,
            record: result.record,
            data: {
              generatedPdfKey: key,
              reviewApprovedAt: null,
              reviewApprovedBy: null,
            },
          });
        }
      } catch (err) {
        console.error("[admin resendOrderConfirmation] regenerate failed", err);
      }
      // A package with the owner's SSN on lines 4b(1)/8b(1) is never emailed
      // (SSN capture spec S3): the client opens it in their portal instead.
      if (filing.ownerSsnLast4) {
        pdfBytes = null;
        signatures = [];
      }
      await sendOrderConfirmationEmail({
        email: filing.user.email,
        recipientName: filing.ownerName,
        filingId: filing.id,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        tier: resolveTier(filing.tier).tier,
        amountPaidCents: filing.amountPaid,
        faxService: filing.faxService,
        portalLink: makeMagicLink(filing.user.id),
        receiptUrl: null,
        pdfBytes,
        signatures,
        // Admin resends must match the original confirmation: final returns
        // carry the EIN-cancellation sequencing warning + deadline line.
        isFinalReturn: filing.isFinalReturn,
        // The date the customer actually has to beat. A valid Form 7004 moves
        // it six months, so an extended filer must see October 15, not April
        // 15 — effectiveDueDateUtc() is the single place that decides.
        dueDateText:
          filing.taxYears.length > 0
            ? formatDueDate(
                effectiveDueDateUtc(
                  Math.max(...filing.taxYears),
                  filing.isFinalReturn ? filing.dissolvedAt : null,
                  { filed: filing.extensionFiled, transmittedAt: filing.extensionTransmittedAt },
                ),
              )
            : null,
        requiresReasonableCause: requiresReasonableCause(filing),
        extensionUnclear:
          filing.taxYears.length > 0
            ? extensionUnclear(
                { filed: filing.extensionFiled, transmittedAt: filing.extensionTransmittedAt },
                Math.max(...filing.taxYears),
                filing.isFinalReturn ? filing.dissolvedAt : null,
              )
            : false,
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "email",
        before: null,
        after: {
          action: "resendOrderConfirmation",
          pdfAttached: !!pdfBytes,
          signatureCount: signatures.length,
        },
        reason: ctx.reason,
      });
      return { ok: true, pdfAttached: !!pdfBytes, signatureCount: signatures.length };
    }

    case "resendMagicLink": {
      if (!filing.user) {
        throw new FilingActionError(400, "no_customer_email", "no customer email");
      }
      const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
      await sendMagicLinkEmail(filing.user.email, makeMagicLink(filing.user.id), label, undefined, filing.id);
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "email",
        before: null,
        after: { action: "resendMagicLink" },
        reason: ctx.reason,
      });
      return { ok: true };
    }

    case "resendFaxConfirmation": {
      // Support tool for "I never got the confirmation": re-sends the fax-
      // delivered email to the customer email on file (never a free-text
      // recipient), with the stored IRS Fax Transmission Receipt ATTACHED when
      // one exists. Offered once delivery was confirmed: a receipt is on file,
      // or the filing is CONFIRMED with a fax job (receipt generation can fail
      // independently of the delivery — then the email goes without it).
      if (!canResendFaxConfirmation(filing)) {
        throw new FilingActionError(
          409,
          "no_fax_receipt",
          "Fax delivery has not been confirmed for this filing, so there is nothing to resend.",
        );
      }
      if (!filing.user) {
        throw new FilingActionError(400, "no_customer_email", "no customer email");
      }
      let receiptPdfBytes: Uint8Array | undefined;
      if (filing.faxConfirmationKey) {
        try {
          receiptPdfBytes = await getStorageObject(filing.faxConfirmationKey);
        } catch (err) {
          // Transient storage error on a receipt that exists: fail so a retry
          // sends the complete email rather than a receipt-less one.
          console.error("[admin resendFaxConfirmation] receipt read failed", err);
          throw new FilingActionError(
            502,
            "receipt_unavailable",
            "Could not read the stored fax receipt, so nothing was sent. Try again in a minute.",
          );
        }
      }
      const receiptAttached = !!receiptPdfBytes;
      // Proof table (delivered-at, pages, Telnyx id) comes from Telnyx's API,
      // best-effort: if it is unreachable the email still goes out and the
      // attached receipt carries the same facts.
      let proof: ReturnType<typeof faxProofFromFacts> | undefined;
      if (filing.faxJobId) {
        const lookup = await fetchTelnyxFax(filing.faxJobId, { timeoutMs: 5_000 });
        if (lookup.ok && lookup.fax.status === TELNYX_DELIVERED_STATUS) {
          proof = faxProofFromFacts(deliveryFactsFromTelnyx(lookup.fax));
        }
      }
      let brand: Awaited<ReturnType<typeof brandForFiling>> = null;
      try {
        brand = await brandForFiling(filing.id);
      } catch (err) {
        console.error("[admin resendFaxConfirmation] brand lookup failed", err);
      }
      try {
        await sendFaxDeliveredEmail({
          email: filing.user.email,
          recipientName: filing.ownerName,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
          proof,
          receiptPdfBytes,
          attachReceipt: receiptAttached,
          isFinalReturn: filing.isFinalReturn,
          dissolvedAt: filing.dissolvedAt,
          brand: brand ?? undefined,
          filingId: filing.id,
          logKind: "fax_delivered_resend",
        });
      } catch (err) {
        // sendEmail has already recorded the failed attempt in EmailLog.
        const message = err instanceof Error ? err.message : String(err);
        throw new FilingActionError(502, "email_failed", `The email could not be sent: ${message}`);
      }
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "email",
        before: null,
        after: {
          action: "resendFaxConfirmation",
          to: filing.user.email,
          receiptAttached,
          proofIncluded: !!proof,
        },
        reason: ctx.reason,
      });
      return { ok: true, to: filing.user.email, receiptAttached, proofIncluded: !!proof };
    }

    case "retryFax": {
      if (!filing.signedPdfKey) {
        throw new FilingActionError(400, "signed_pdf_required", "no signed PDF on file");
      }
      // Re-fax guard (see refaxDecision): the first send and a retry after a
      // confirmed failure go straight through; anything that could hand the
      // IRS a duplicate needs force + a written reason from THIS request; a
      // fresh resubmission claim refuses outright.
      const refax = ctx.refax ?? { force: ctx.force === true, reason: ctx.reason ?? null };
      const refaxReason = typeof refax.reason === "string" ? refax.reason.slice(0, 500).trim() : "";
      const decision = refaxDecision(filing, new Date());
      if (decision.kind === "refused") {
        throw new FilingActionError(409, "fax_submission_in_progress", decision.message);
      }
      let refaxOverride: { state: RefaxState; by: string; reason: string } | null = null;
      if (decision.kind === "needs_override") {
        if (refax.force !== true) {
          throw new FilingActionError(409, "refax_reason_required", decision.message);
        }
        if (nonSpaceLength(refaxReason) < MIN_REFAX_REASON_CHARS) {
          throw new FilingActionError(
            400,
            "refax_reason_required",
            `Write a reason of at least ${MIN_REFAX_REASON_CHARS} characters for sending this fax again. ${decision.message}`,
          );
        }
        const by = ctx.approver ?? ctx.adminId;
        if (!by) {
          throw new FilingActionError(
            403,
            "identity_required",
            "We could not tell which admin is signed in, so this re-send cannot be attributed. Sign out of the admin portal and sign in again.",
          );
        }
        refaxOverride = { state: decision.state, by, reason: refaxReason };
      }
      if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
        throw new FilingActionError(
          409,
          "preflight_failed",
          "Fax held: this package failed pre-flight checks. An admin must review it.",
        );
      }
      // SSN capture: the client (or an admin) saved an SSN after this package
      // was reviewed/signed, so the signed copy would go to the IRS without it.
      // Staff-side gate; the remedy is a new reviewed upload + re-sign.
      if (ownerSsnNewerThanPackage(filing)) {
        throw new FilingActionError(409, "ssn_newer_than_package", SSN_NEWER_THAN_PACKAGE_MESSAGE);
      }
      // A late filing without a reasonable-cause statement is legally naked on
      // the $25,000 exposure — the whole pitch of the service is that late
      // filings go out WITH the statement. Computed fresh (never from the
      // stored isDiirsp flag): the classification may have changed since the
      // package was generated. The admin can override with force+reason for
      // the rare deliberate case; the override is captured in the change log.
      {
        // Generator 2.3.0: the printed statement comes only from the admin
        // narrative, so that (not the customer's explanation) is what's required.
        const rcsComplete = hasAdminReasonableCauseForFax(filing, filing.yearData ?? []);
        if (!rcsComplete && !isValidForceOverride(ctx)) {
          throw new FilingActionError(
            409,
            "rcs_missing_for_late_filing",
            "This filing is past its due date but a late year has no admin RCS narrative, so the package has no reasonable-cause statement. Write the RCS narrative (admin) for each late year and regenerate (or force with a reason) before faxing.",
          );
        }
      }

      // Claim before submit: pinned on the exact fax state the guard judged,
      // so of two racing sends (double click, two admins, or an automatic
      // retry landing now) only one proceeds. The claim is released only when
      // the fax provably did NOT go out; after an ambiguous submit it is kept,
      // and the guard above then refuses (fresh) or demands a reason (stale).
      const claim = await prisma.filing.updateMany({
        where: {
          id: filing.id,
          status: filing.status,
          faxJobId: filing.faxJobId,
          faxStatus: filing.faxStatus,
        },
        data: { faxStatus: MANUAL_FAX_CLAIM },
      });
      if (claim.count !== 1) {
        throw new FilingActionError(
          409,
          "fax_state_changed",
          "This filing's fax state changed while you were sending (another send or a fax update just landed). Nothing was sent. Refresh the page and check it before trying again.",
        );
      }
      const release = async () => {
        try {
          await prisma.filing.updateMany({
            where: { id: filing.id, faxJobId: filing.faxJobId, faxStatus: MANUAL_FAX_CLAIM },
            data: { faxStatus: filing.faxStatus },
          });
        } catch (err) {
          console.error(`[retryFax] ${filing.id} could not release ${MANUAL_FAX_CLAIM}`, err);
        }
      };

      // The reason is on file BEFORE anything reaches the IRS: no audit row,
      // no fax.
      if (refaxOverride) {
        try {
          await logFilingChange({
            filingId: filing.id,
            adminId: ctx.adminId,
            source: "admin",
            field: "faxRefaxOverride",
            before: { status: filing.status, faxJobId: filing.faxJobId, faxStatus: filing.faxStatus },
            after: { overridden: refaxOverride.state, by: refaxOverride.by, reason: refaxOverride.reason },
            reason: refaxOverride.reason,
          });
        } catch (err) {
          console.error("[retryFax] re-fax override audit write failed", err);
          await release();
          throw new FilingActionError(
            500,
            "audit_log_failed",
            "Could not record the reason for this re-send, so nothing was sent. Try again in a minute.",
          );
        }
      }

      // Snapshot the EXACT bytes we're about to fax under a stable key so the
      // admin can later verify "what was sent to the IRS". Hard precondition:
      // if the copy fails we do NOT fax and do NOT mark FAXED — otherwise the
      // audit artifact would be missing or wrong. Always re-snapshot the
      // current signedPdfKey (a manual re-fax may follow a regenerate+re-sign,
      // so the snapshot must reflect THIS submission's bytes, not a stale one).
      const faxedKey = `${filing.id}_faxed.pdf`;
      let mediaUrl: string;
      try {
        const bytes = await getStorageObject(filing.signedPdfKey);
        await putPdf(faxedKey, bytes);
        // Fax the snapshotted bytes so the transmitted content and the
        // recorded faxedPdfKey are guaranteed identical.
        mediaUrl = await publicUrl(faxedKey);
      } catch (err) {
        console.error("[retryFax] faxed-snapshot copy failed", err);
        await release();
        throw new FilingActionError(
          500,
          "fax_snapshot_failed",
          "Could not snapshot the PDF for the fax audit trail; fax not sent.",
        );
      }

      let job: Awaited<ReturnType<typeof submitFax>>;
      try {
        job = await submitFax({ mediaUrl, to: env.telnyx.destination });
        if (typeof job?.id !== "string" || job.id.trim() === "") {
          throw new Error("Telnyx accepted the fax but returned no fax id — it may be in flight");
        }
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        if (err instanceof TelnyxSubmitRejectedError) {
          // Telnyx refused it: no fax job exists, so the claim can go.
          await release();
          throw new FilingActionError(502, "fax_submit_rejected", `Telnyx refused the fax, so nothing was sent: ${detail}`);
        }
        console.error(
          `[retryFax] AMBIGUOUS_FAX_SUBMIT filing=${filing.id} claim=${MANUAL_FAX_CLAIM} — outcome unknown; check Telnyx before re-faxing`,
          err,
        );
        throw new FilingActionError(
          502,
          "fax_submit_ambiguous",
          `We could not tell whether Telnyx accepted the fax (${detail}). The filing is held at fax status ${MANUAL_FAX_CLAIM} so nothing sends it again for now. Check Telnyx for an outbound fax to the IRS for this filing before sending again.`,
        );
      }

      const faxedAt = new Date();
      try {
        await prisma.filing.update({
          where: { id: filing.id },
          data: {
            faxJobId: job.id,
            faxStatus: "queued",
            status: "FAXED",
            faxedPdfKey: faxedKey,
            faxedAt,
          },
          select: { id: true },
        });
      } catch (err) {
        console.error(
          `[retryFax] UNTRACKED_FAX_JOB filing=${filing.id} newFaxId=${job.id} — Telnyx accepted the fax but the filing still shows ${MANUAL_FAX_CLAIM}`,
          err,
        );
        throw new FilingActionError(
          500,
          "fax_record_failed",
          `Telnyx accepted fax ${job.id}, but it could not be recorded on this filing. Do NOT send again: set faxJobId to ${job.id}, faxStatus to queued and status to FAXED by hand.`,
        );
      }
      try {
        await logFilingChange({
          filingId: filing.id,
          adminId: ctx.adminId,
          source: "admin",
          field: "fax",
          before: {
            faxJobId: filing.faxJobId,
            faxStatus: filing.faxStatus,
            faxedPdfKey: filing.faxedPdfKey,
            status: filing.status,
          },
          after: {
            faxJobId: job.id,
            faxStatus: "queued",
            faxedPdfKey: faxedKey,
            status: "FAXED",
            ...(refaxOverride ? { refaxOverride } : {}),
          },
          reason: refaxOverride?.reason ?? ctx.reason,
        });
      } catch (err) {
        // The fax is out and recorded; a lost log line must not report failure
        // (an admin who reads "failed" may send the IRS a second copy).
        console.error(`[retryFax] ${filing.id} fax change-log write failed (fax ${job.id} was sent)`, err);
      }
      return { ok: true, faxJobId: job.id };
    }

    // reEngageAi + runAiCheck cases removed — AI compliance check + AI
    // conversation agent are no longer part of the order flow. Accountant
    // reviews every order before fax.

    case "regeneratePdf": {
      if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(filing.status)) {
        throw new FilingActionError(
          409,
          "already_signed_or_filed",
          "This filing has been signed or faxed. Its package cannot be regenerated.",
        );
      }
      // Rebuild the unsigned PDF from current DB state. Used after admin
      // edits a field by hand and wants a fresh package without going
      // through the wizard or asking the customer to do anything. If the
      // existing PDF had a signature on it, regenerating discards the
      // signed version too — surface that risk to the admin via the UI.
      const full = await loadPackageFiling(filing.id);
      if (!full) {
        throw new FilingActionError(404, "not_found", "filing not found");
      }
      if (!hasPackageRequiredFields(full)) {
        throw new FilingActionError(400, "missing_required_fields", MISSING_PACKAGE_FIELDS_MESSAGE);
      }
      let pkg: GeneratedPackage;
      try {
        pkg = await generatePackage(filingToPackageInput(full));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        throw new FilingActionError(500, "generation_failed", `generation failed: ${msg}`);
      }
      const key = `${filing.id}_unsigned.pdf`;
      await putPdf(key, pkg.bytes);
      const preflight = await runPreflight(pkg.record, pkg.bytes);

      // Spec item 12 / D10: while an accountant-reviewed upload is the client
      // version (generatedPdfKey = *_reviewed_*), Regenerate writes a DRAFT
      // only. The client keeps checking and signing the reviewed PDF; review
      // approval, signature and status are untouched. The admin downloads the
      // draft ("Download latest generated draft") and uploads it as the
      // reviewed PDF if it should replace the client version. Pre-flight
      // re-runs on the current data either way.
      if (isReviewedPdfKey(filing.generatedPdfKey)) {
        const { overrideCleared } = await persistRerunPreflight(
          filing,
          preflight,
          ctx,
          "regeneratePdf (draft only; reviewed PDF kept)",
        );
        await logFilingChange({
          filingId: filing.id,
          adminId: ctx.adminId,
          source: "admin",
          field: "pdf",
          before: { generatedPdfKey: filing.generatedPdfKey, status: filing.status },
          after: {
            draftOnly: true,
            draftKey: key,
            generatedPdfKey: filing.generatedPdfKey,
            status: filing.status,
            generatorVersion: pkg.record.generatorVersion,
            generatorCommit: pkg.record.commit,
          },
          reason: ctx.reason,
        });
        return {
          ok: true,
          draftOnly: true,
          draftKey: key,
          pdfBytes: pkg.bytes.length,
          signatureCount: pkg.signatures.length,
          preflightStatus: preflight.ok ? "passed" : "failed",
          overrideCleared,
          note:
            "A reviewed PDF is the current client version, so it was kept. The regenerated draft was saved separately: " +
            "use \"Download latest generated draft\", and upload it as the reviewed PDF if it should replace the client version.",
        };
      }

      // Reset signed PDF + validation state — the old signature was applied
      // to a stale PDF and isn't valid against the new one. Customer (or
      // admin) needs to re-sign.
      await persistNewPackagePreflight({
        filingId: filing.id,
        preflight,
        record: pkg.record,
        data: {
          generatedPdfKey: key,
          signedPdfKey: null,
          // The client's drawn signature was for the old PDF too.
          signaturePngKey: null,
          signedAt: null,
          validationStatus: "pending",
          validationCheckedAt: null,
          reviewApprovedAt: null,
          reviewApprovedBy: null,
          status: "PDF_GENERATED",
        },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "pdf",
        before: {
          generatedPdfKey: filing.generatedPdfKey,
          signedPdfKey: filing.signedPdfKey,
          status: filing.status,
        },
        after: {
          generatedPdfKey: key,
          signedPdfKey: null,
          status: "PDF_GENERATED",
          preflightStatus: preflight.ok ? "passed" : "failed",
        },
        reason: ctx.reason,
      });
      return {
        ok: true,
        pdfBytes: pkg.bytes.length,
        signatureCount: pkg.signatures.length,
        preflightStatus: preflight.ok ? "passed" : "failed",
        note: filing.signedPdfKey ? "Existing signed PDF was discarded — re-sign required." : undefined,
      };
    }

    case "updateField": {
      // Admin edits a single filing field (e.g. customer wrote in saying
      // "EIN should be 12-3456789, not 12-3456788"). Whitelisted to the
      // same fields the customer can edit in the wizard. Logged to
      // FilingChangeLog so the audit trail is clear.
      const field = typeof body.field === "string" ? body.field : "";
      const value = body.value === undefined || body.value === null
        ? null
        : String(body.value);
      const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : "";

      const allowed = new Set<string>(ADMIN_EDITABLE_FILING_FIELDS);
      if (!allowed.has(field)) {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
      }

      if (value !== null && !isPdfEncodable(value)) {
        throw new FilingActionError(400, "invalid_value", PDF_TEXT_MESSAGE);
      }

      // Typed coercion + validation. The generic path writes strings, but
      // extensionTransmittedAt is a DateTime and isDiirsp a Boolean, and the
      // three extension answers are closed enums shared with the wizard — an
      // admin correction must never be able to write a value the rest of the
      // app cannot read back.
      const EXTENSION_ENUMS: Record<string, readonly string[]> = {
        extensionFiled: ["yes", "no", "not_sure"],
        extensionMethod: ["fax", "certified_mail", "mail", "not_sure"],
        extensionDestination: ["ogden", "standard", "not_sure"],
        priorForm5472Filed: ["yes", "no", "not_sure"],
        // Generator 2.3.0 paid preparer settings. Blank = None / Blank.
        paidPreparerMode: ["none", "house"],
        irsMayDiscussWithPreparer: ["yes", "no"],
      };
      // Blanking an EXTENSION field is always allowed — it means "we don't
      // have this fact", which is the same as never having asked. The legacy
      // string fields keep their previous behaviour exactly (an empty string
      // is stored as an empty string) — llcCountry is a non-nullable column,
      // so silently turning "" into null there would start throwing.
      const EXTENSION_SCALARS = new Set([
        "extensionFiled", "extensionTransmittedAt", "extensionMethod", "extensionDestination",
      ]);
      const NULLABLE_ENUM_SCALARS = new Set(
        Array.from(EXTENSION_SCALARS).concat("priorForm5472Filed", "paidPreparerMode", "irsMayDiscussWithPreparer"),
      );
      const NULLABLE_BOOLEANS = new Set([
        "ownerHasFtin",
        "ownerNoPostalCode",
        "llcAddressIsRegisteredAgentOnly",
        "hasUsSourceIncome",
        "usTaxWithheld",
      ]);
      const blank = value === null || value.trim() === "";
      let writeValue: string | Date | boolean | number | null =
        NULLABLE_ENUM_SCALARS.has(field) && blank ? null : value;
      if (field in EXTENSION_ENUMS) {
        if (!blank && !EXTENSION_ENUMS[field].includes(value!)) {
          throw new FilingActionError(
            400,
            "invalid_value",
            `${field} must be one of: ${EXTENSION_ENUMS[field].join(", ")}`,
          );
        }
      } else if (field === "extensionTransmittedAt") {
        if (!blank) {
          // DATE-ONLY, exactly like the customer PATCH. The old `new Date(value)`
          // accepted anything Date.parse tolerates — a full timestamp with a
          // timezone, "March 4 2026", "2026" — and stored an instant that no
          // longer round-trips to the calendar day the admin typed. Since
          // isExtensionValid() compares this against a UTC-midnight due date,
          // an off-by-a-timezone instant can flip a return from timely to late.
          const raw = value!.trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            throw new FilingActionError(
              400,
              "invalid_value",
              "extensionTransmittedAt must be a date in YYYY-MM-DD form",
            );
          }
          const parsed = new Date(`${raw}T00:00:00.000Z`);
          // Round-trip check: rejects a well-formed but non-existent calendar
          // date ("2026-02-31", "2026-13-01"), which some parsers roll forward
          // into a different real day instead of failing.
          if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) {
            throw new FilingActionError(
              400,
              "invalid_value",
              "extensionTransmittedAt is not a real calendar date",
            );
          }
          writeValue = parsed;
        }
      } else if (field === "isDiirsp") {
        // Non-nullable boolean column: blanking it is not a thing.
        const truthy = new Set(["true", "yes", "1"]);
        const falsy = new Set(["false", "no", "0"]);
        const raw = (value ?? "").trim().toLowerCase();
        if (truthy.has(raw)) writeValue = true;
        else if (falsy.has(raw)) writeValue = false;
        else throw new FilingActionError(400, "invalid_value", "isDiirsp must be true or false");
      } else if (NULLABLE_BOOLEANS.has(field)) {
        const truthy = new Set(["true", "yes", "1"]);
        const falsy = new Set(["false", "no", "0"]);
        const raw = (value ?? "").trim().toLowerCase();
        if (blank) writeValue = null;
        else if (truthy.has(raw)) writeValue = true;
        else if (falsy.has(raw)) writeValue = false;
        else throw new FilingActionError(400, "invalid_value", `${field} must be true, false, or blank`);
      } else if (field === "llcMemberCount") {
        const raw = (value ?? "").trim();
        if (blank) writeValue = null;
        else if (/^\d+$/.test(raw)) writeValue = Number.parseInt(raw, 10);
        else throw new FilingActionError(400, "invalid_value", "llcMemberCount must be an integer or blank");
      }

      // ── Grouped rules for the Form 7004 fields ───────────────────────────
      // updateField writes one column at a time, but the four extension fields
      // are ONE fact. The customer PATCH enforces the invariants below; an
      // admin correction has to land on the same end state or the two write
      // paths disagree about the same filing — and it is the admin path that
      // exists specifically to remediate pre-gate orders, so it is the one that
      // must not be able to store a half-answer.
      const update: Record<string, unknown> = { [field]: writeValue };

      if (EXTENSION_SCALARS.has(field)) {
        // The state the filing will be in AFTER this write.
        const nextFiled =
          field === "extensionFiled" ? (writeValue as string | null) : filing.extensionFiled;
        const nextTransmittedAt =
          field === "extensionTransmittedAt"
            ? (writeValue as Date | null)
            : filing.extensionTransmittedAt;

        // null / "no" / "not_sure": the supporting details describe an
        // extension this filing no longer records. Cleared in the SAME update
        // (and the same transaction) so no stale 7004 date can survive for
        // effectiveDueDateUtc — or the accountant — to trip over. The uploaded
        // proof goes with them: a filing with no extension must not keep a
        // "proof of extension" attachment.
        if (field === "extensionFiled" && nextFiled !== "yes") {
          update.extensionTransmittedAt = null;
          update.extensionMethod = null;
          update.extensionDestination = null;
          update.extensionProofKey = null;
        }

        // isDiirsp is DERIVED, never stored independently of the facts that
        // produce it. Writing an extension field without recomputing left the
        // pre-edit (usually delinquent) verdict in place, which is what the
        // reasonable-cause statement and the whole DIIRSP path key off. Same
        // rule the PATCH route runs: extension facts apply to max(taxYears)
        // alone, because one Form 7004 covers exactly one tax year.
        const facts = {
          filed: nextFiled,
          transmittedAt: nextFiled === "yes" ? nextTransmittedAt : null,
        };
        const maxYear = filing.taxYears.length > 0 ? Math.max(...filing.taxYears) : null;
        update.isDiirsp = filing.taxYears.some((y) =>
          isYearDelinquent(
            y,
            filing.isFinalReturn ? filing.dissolvedAt : null,
            y === maxYear ? facts : null,
          ),
        );
      }
      // NOTE the deliberate asymmetry: when the admin names `isDiirsp` itself,
      // that explicit value is written and NOT recomputed. It is the manual
      // override — the escape hatch for a case the shared rule gets wrong — so
      // it has to survive the save that set it.

      // Dates are not JSON — normalise so the audit log stays readable (and
      // Prisma's Json column stays writable).
      const toJson = (v: unknown) => (v instanceof Date ? v.toISOString() : v ?? null);
      const beforeOf = (k: string) => toJson((filing as unknown as Record<string, unknown>)[k]);
      const before = beforeOf(field);
      const after = toJson(update[field]);
      // Every column this edit touches BEYOND the one the admin named — the
      // cascade and the recomputed isDiirsp — gets its own change-log row, so
      // the trail explains values nobody typed.
      const derivedKeys = Object.keys(update).filter(
        (k) => k !== field && toJson(update[k]) !== beforeOf(k),
      );
      const logReason = reason || ctx.reason || null;
      await prisma.$transaction([
        prisma.filing.update({
          where: { id: filing.id },
          data: update as unknown as never,
          select: { id: true },
        }),
        prisma.filingChangeLog.create({
          data: {
            filingId: filing.id,
            adminId: ctx.adminId,
            source: "admin",
            field,
            beforeJson: before as never,
            afterJson: after as never,
            reason: logReason,
          },
          select: { id: true },
        }),
        ...derivedKeys.map((k) =>
          prisma.filingChangeLog.create({
            data: {
              filingId: filing.id,
              adminId: ctx.adminId,
              source: "admin",
              field: k,
              beforeJson: beforeOf(k) as never,
              afterJson: toJson(update[k]) as never,
              reason: `${logReason ? `${logReason} — ` : ""}derived from ${field} edit`,
            },
            select: { id: true },
          }),
        ),
      ]);
      // Spec item 1: every change-logged save re-runs pre-flight on the new data.
      const preflightRerun = await autoRerunPreflight(filing, ctx, `updateField:${field}`);
      return {
        ok: true,
        field,
        before,
        after,
        derived: Object.fromEntries(derivedKeys.map((k) => [k, toJson(update[k])])),
        preflight: preflightRerun,
      };
    }

    case "updateYearField": {
      if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(filing.status)) {
        throw new FilingActionError(
          409,
          "already_signed_or_filed",
          "This filing has been signed or faxed. Its package cannot be regenerated.",
        );
      }

      const taxYear = Number(body.taxYear);
      if (!Number.isInteger(taxYear)) {
        throw new FilingActionError(400, "invalid_value", "taxYear must be an integer");
      }
      const field = typeof body.field === "string" ? body.field : "";
      const reason = typeof body.reason === "string" ? body.reason.slice(0, 500) : "";
      const allowed = new Set<string>(ADMIN_EDITABLE_YEAR_FIELDS);
      if (!allowed.has(field)) {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
      }

      let after: unknown;
      let writeValue: unknown;
      if (YEAR_NULLABLE_STRINGS.has(field)) {
        let raw = body.value === undefined || body.value === null ? null : String(body.value);
        // The admin narrative is multi-paragraph ("blank line = new paragraph"):
        // line breaks are layout, not printed characters, so they are exempt
        // from the PDF-encodable check (the generator splits on them).
        if (raw !== null && field === "rcsAdminNarrative") raw = raw.replace(/\r\n?/g, "\n");
        const encodable = raw === null || isPdfEncodable(field === "rcsAdminNarrative" ? raw.replace(/\n/g, " ") : raw);
        if (!encodable) {
          throw new FilingActionError(400, "invalid_value", PDF_TEXT_MESSAGE);
        }
        if (field === "rcsAdminNarrative" && raw !== null && raw.length > MAX_RCS_NARRATIVE_CHARS) {
          throw new FilingActionError(
            400,
            "invalid_value",
            `The RCS narrative must be ${MAX_RCS_NARRATIVE_CHARS} characters or fewer.`,
          );
        }
        after = raw === null || raw.trim() === "" ? null : raw;
        writeValue = after;
      } else if (YEAR_NULLABLE_DATES.has(field)) {
        // DATE-ONLY (YYYY-MM-DD), stored at UTC midnight, like extensionTransmittedAt.
        const raw = body.value === undefined || body.value === null ? "" : String(body.value).trim();
        if (raw === "") {
          after = null;
          writeValue = null;
        } else {
          const parsed = new Date(`${raw}T00:00:00.000Z`);
          if (
            !/^\d{4}-\d{2}-\d{2}$/.test(raw) ||
            Number.isNaN(parsed.getTime()) ||
            parsed.toISOString().slice(0, 10) !== raw
          ) {
            throw new FilingActionError(400, "invalid_value", `${field} must be a real date in YYYY-MM-DD form`);
          }
          after = raw;
          writeValue = parsed;
        }
      } else if (YEAR_NULLABLE_BOOLEANS.has(field)) {
        const raw = body.value === undefined || body.value === null ? null : String(body.value);
        after = parseNullableBoolean(field, raw);
        writeValue = after;
      } else if (field in YEAR_JSON_SCHEMAS) {
        after = parseYearJsonField(field as keyof typeof YEAR_JSON_SCHEMAS, body.value);
        writeValue = yearJsonWriteValue(after);
      } else {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
      }

      const year = await prisma.filingYearData.findUnique({
        where: { filingId_taxYear: { filingId: filing.id, taxYear } },
        select: {
          id: true,
          rcsWhyMissed: true,
          rcsWhenLearned: true,
          rcsNoIrsNoticeConfirmed: true,
          rcsAdminNarrative: true,
          rcsLearnedOn: true,
          rcsSmallCorpParagraph: true,
          nonCashTransfers: true,
          ownerPaidCosts: true,
          zeroConfirmations: true,
          noReportableTransactions: true,
        },
      });
      if (!year) {
        throw new FilingActionError(404, "year_not_found", "filing year not found");
      }

      const rawBefore = (year as unknown as Record<string, unknown>)[field] ?? null;
      const before = rawBefore instanceof Date ? rawBefore.toISOString().slice(0, 10) : rawBefore;
      const data: Record<string, unknown> = { [field]: writeValue };
      // Spec item 7: owner-paid costs entered by an admin are reportable Part V
      // contributions, so the customer's display-only "no reportable
      // transactions" declaration for that year no longer holds. Cleared in the
      // same write and change-logged on its own row.
      const clearsNoneDeclared =
        field === "ownerPaidCosts" &&
        Array.isArray(after) &&
        after.length > 0 &&
        year.noReportableTransactions === true;
      if (clearsNoneDeclared) data.noReportableTransactions = false;
      await prisma.filingYearData.update({
        where: { filingId_taxYear: { filingId: filing.id, taxYear } },
        data: data as never,
        select: { id: true },
      });
      const logReason = reason || ctx.reason;
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: `year:${taxYear}:${field}`,
        before,
        after,
        reason: logReason,
      });
      if (clearsNoneDeclared) {
        await logFilingChange({
          filingId: filing.id,
          adminId: ctx.adminId,
          source: "admin",
          field: `year:${taxYear}:noReportableTransactions`,
          before: true,
          after: false,
          reason:
            `${logReason ? `${logReason} — ` : ""}derived from ownerPaidCosts edit: admin-entered owner-paid costs ` +
            "override the customer's \"no reportable transactions\" declaration",
        });
      }
      // Spec item 1: every change-logged save re-runs pre-flight on the new data.
      const preflightRerun = await autoRerunPreflight(filing, ctx, `updateYearField:${taxYear}:${field}`);
      return {
        ok: true,
        ...(clearsNoneDeclared ? { derived: { noReportableTransactions: false } } : {}),
        preflight: preflightRerun,
      };
    }

    case "approvePreflightOverride": {
      if (!(ctx.approver ?? ctx.adminId)) {
        throw new FilingActionError(
          403,
          "identity_required",
          "We could not tell which admin is signed in. Sign out of the admin portal and sign in again.",
        );
      }
      if (filing.preflightStatus !== "failed") {
        throw new FilingActionError(
          409,
          "preflight_not_failed",
          "Only a filing with failed pre-flight checks can be approved for override.",
        );
      }
      const reason = typeof body.reason === "string" ? body.reason.slice(0, 500).trim() : "";
      if (reason.replace(/\s/g, "").length < 10) {
        throw new FilingActionError(
          400,
          "reason_required",
          "Write a short reason for approving this package.",
        );
      }
      const approvedAt = new Date();
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          preflightOverrideBy: ctx.approver ?? ctx.adminId,
          preflightOverrideAt: approvedAt,
          preflightOverrideReason: reason,
        },
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "preflightOverride",
        before: {
          preflightOverrideBy: filing.preflightOverrideBy,
          preflightOverrideAt: filing.preflightOverrideAt,
          preflightOverrideReason: filing.preflightOverrideReason,
        },
        after: {
          preflightOverrideBy: ctx.approver ?? ctx.adminId,
          preflightOverrideAt: approvedAt,
          preflightOverrideReason: reason,
          // What the admin approved: a later re-run keeps this override only
          // while every failure it finds is in this list (D11).
          approvedFailures: preflightIssues(filing.preflightFailures),
          preflightCheckedAt: filing.preflightCheckedAt,
        },
        reason,
      });
      return { ok: true };
    }

    case "rerunPreflight": {
      if (filing.status === "DRAFT") {
        throw new FilingActionError(
          409,
          "not_paid",
          "This order is not paid yet. Pre-flight runs when the package is generated at payment.",
        );
      }
      const summary = await rerunPreflightNow(filing, ctx, "manual");
      if (!summary.ran) {
        throw new FilingActionError(
          summary.reason === "missing_required_fields" ? 400 : 500,
          summary.reason,
          summary.message,
        );
      }
      return { ok: true, ...summary };
    }

    case "approveForSignature": {
      if (!(ctx.approver ?? ctx.adminId)) {
        throw new FilingActionError(
          403,
          "identity_required",
          "We could not tell which admin is signed in. Sign out of the admin portal and sign in again.",
        );
      }
      if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(filing.status)) {
        throw new FilingActionError(
          409,
          "already_signed_or_filed",
          "This filing has already been signed, faxed, or confirmed.",
        );
      }
      if (!filing.generatedPdfKey) {
        throw new FilingActionError(
          409,
          "generated_package_required",
          "Generate the filing package before approving it for signature.",
        );
      }
      if (!hasPreflightApproval(filing)) {
        throw new FilingActionError(
          409,
          "preflight_not_approved",
          "Pre-flight must pass or be overridden before approval for signature.",
        );
      }
      if (!filing.user) {
        throw new FilingActionError(400, "no_customer_email", "no customer email");
      }

      const approvedAt = new Date();
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          reviewApprovedAt: approvedAt,
          reviewApprovedBy: ctx.approver ?? ctx.adminId,
        },
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "reviewApproval",
        before: {
          reviewApprovedAt: filing.reviewApprovedAt,
          reviewApprovedBy: filing.reviewApprovedBy,
        },
        after: {
          reviewApprovedAt: approvedAt,
          reviewApprovedBy: ctx.approver ?? ctx.adminId,
        },
        reason: ctx.reason,
      });

      // White-label partner filings go out under the partner's brand, like
      // every other customer email for the filing.
      let brand: Awaited<ReturnType<typeof brandForFiling>> = null;
      try {
        brand = await brandForFiling(filing.id);
      } catch (err) {
        console.error("[approveForSignature] brand lookup failed", err);
      }
      try {
        await sendReadyToSignEmail({
          email: filing.user.email,
          recipientName: filing.ownerName,
          filingId: filing.id,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
          brand: brand ?? undefined,
        });
      } catch (err) {
        console.error("[approveForSignature] ready-to-sign email failed", err);
        return {
          ok: true,
          approvedAt,
          emailSent: false,
          emailError: err instanceof Error ? err.message : String(err),
        };
      }

      return { ok: true, approvedAt, emailSent: true };
    }

    case "uploadReviewedPdf": {
      if (!(ctx.approver ?? ctx.adminId)) {
        throw new FilingActionError(
          403,
          "identity_required",
          "We could not tell which admin is signed in. Sign out of the admin portal and sign in again.",
        );
      }
      // Owner decision (2026-10-07): a signed package may be replaced until it
      // is faxed — the client then signs the new version (their old signature
      // is never reused). Anything that has touched the fax path (sent, being
      // sent, or a send claim held after an ambiguous submit) stays locked:
      // that version is, or may be, with the IRS.
      const faxTouched =
        ["FAXED", "CONFIRMED"].includes(filing.status) ||
        !!filing.faxJobId ||
        !!filing.faxedAt ||
        !!filing.faxStatus;
      if (faxTouched) {
        throw new FilingActionError(
          409,
          "already_faxed",
          "This filing has already been faxed (or a fax is being sent), so its package can't be replaced. A correction after faxing is a new filing.",
        );
      }
      if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
        throw new FilingActionError(409, "preflight_failed", preflightBlockedMessage(filing));
      }
      const rawB64 = typeof body.pdfBase64 === "string" ? body.pdfBase64 : "";
      const cleaned = rawB64.includes(",") ? rawB64.slice(rawB64.indexOf(",") + 1) : rawB64;
      if (cleaned.length < 200) {
        throw new FilingActionError(400, "invalid_pdf", "Empty or missing pdfBase64");
      }
      const bytes = Buffer.from(cleaned, "base64");
      if (bytes.length > 20 * 1024 * 1024) {
        throw new FilingActionError(400, "pdf_too_large", "Uploaded PDF must be 20 MB or smaller");
      }
      if (!bytes.slice(0, 5).toString("ascii").startsWith("%PDF-")) {
        throw new FilingActionError(
          400,
          "invalid_pdf",
          "Uploaded file is not a valid PDF (missing %PDF- header)",
        );
      }
      const key = `${filing.id}_reviewed_${Date.now()}.pdf`;
      await put(key, bytes, "application/pdf");
      // Repoint generatedPdfKey so sign, preview, place-signature, and fax paths
      // read the reviewed package; the timestamp avoids stale caches and keeps
      // the original artifact in R2.
      //
      // Owner rule (2026-10-05): uploading the reviewed PDF is THE step that
      // hands the package to the client. The client must check and sign the
      // exact version they will be filed with, so any signature drawn on an
      // earlier version is set aside (the PNG stays in storage and in the
      // change log) and the client is emailed to check and sign again.
      const reviewedStatus = "PDF_GENERATED";
      const approvedAt = new Date();
      // One transaction: the conditional update (pinned on the fax state the
      // guard saw, so a fax send starting at the same moment can't race this
      // replacement) and the change-log entry that records the set-aside
      // signed PDF / signature keys either both land or neither does.
      await prisma.$transaction(async (tx) => {
        const replaced = await tx.filing.updateMany({
          where: {
            id: filing.id,
            status: filing.status,
            faxJobId: null,
            faxStatus: null,
            faxedAt: null,
          },
          data: {
            generatedPdfKey: key,
            signedPdfKey: null,
            signaturePngKey: null,
            signedAt: null,
            validationStatus: "pending",
            validationCheckedAt: null,
            reviewApprovedAt: approvedAt,
            reviewApprovedBy: ctx.approver ?? ctx.adminId,
            status: reviewedStatus,
          },
        });
        if (replaced.count !== 1) {
          throw new FilingActionError(
            409,
            "filing_state_changed",
            "This filing changed while you were uploading (for example a fax just started). Nothing was replaced. Refresh the page and check it.",
          );
        }
        await logFilingChange({
          filingId: filing.id,
          adminId: ctx.adminId,
          source: "admin",
          field: "pdf",
          before: {
            generatedPdfKey: filing.generatedPdfKey,
            signedPdfKey: filing.signedPdfKey,
            signaturePngKey: filing.signaturePngKey,
            status: filing.status,
          },
          after: {
            generatedPdfKey: key,
            signedPdfKey: null,
            signaturePngKey: null,
            status: reviewedStatus,
            reviewApprovedAt: approvedAt,
            reviewApprovedBy: ctx.approver ?? ctx.adminId,
            clientEmailed: body.notifyClient !== false,
          },
          reason: ctx.reason,
          tx,
        });
      });
      // Owner option (2026-10-07): upload a corrected version without emailing
      // the client (e.g. they are already in touch by email). The signature
      // is still set aside above, so they must sign this exact version.
      if (body.notifyClient === false) {
        return { ok: true, key, bytes: bytes.length, emailSent: false, emailSkipped: true };
      }
      if (!filing.user) {
        return {
          ok: true,
          key,
          bytes: bytes.length,
          emailSent: false,
          emailError: "No customer email on this filing yet (partner clients get their link from the partner).",
        };
      }
      let brand: Awaited<ReturnType<typeof brandForFiling>> = null;
      try {
        brand = await brandForFiling(filing.id);
      } catch (err) {
        console.error("[uploadReviewedPdf] brand lookup failed", err);
      }
      try {
        await sendReadyToSignEmail({
          email: filing.user.email,
          recipientName: filing.ownerName,
          filingId: filing.id,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
          brand: brand ?? undefined,
          resign: !!filing.signaturePngKey,
        });
      } catch (err) {
        console.error("[uploadReviewedPdf] check-and-sign email failed", err);
        return {
          ok: true,
          key,
          bytes: bytes.length,
          emailSent: false,
          emailError: err instanceof Error ? err.message : String(err),
        };
      }
      return { ok: true, key, bytes: bytes.length, emailSent: true, emailTo: filing.user.email };
    }

    case "uploadSignedPdf": {
      // Admin uploads a final PDF the CLIENT signed outside the portal (staff
      // never sign the 1120 for the client). Body:
      // { action: "uploadSignedPdf", pdfBase64: "<base64-encoded PDF>" }.
      // Stores at the same signedPdfKey path so the existing "Send fax to
      // IRS" button works downstream without further changes.
      const rawB64 = typeof body.pdfBase64 === "string" ? body.pdfBase64 : "";
      // Tolerate a data-URL prefix in case the client sends one.
      const cleaned = rawB64.includes(",") ? rawB64.slice(rawB64.indexOf(",") + 1) : rawB64;
      if (cleaned.length < 200) {
        throw new FilingActionError(400, "invalid_pdf", "Empty or missing pdfBase64");
      }
      const bytes = Buffer.from(cleaned, "base64");
      // Cheap magic-number check — PDF files always start with "%PDF-".
      if (!bytes.slice(0, 5).toString("ascii").startsWith("%PDF-")) {
        throw new FilingActionError(
          400,
          "invalid_pdf",
          "Uploaded file is not a valid PDF (missing %PDF- header)",
        );
      }
      const key = `${filing.id}_signed.pdf`;
      await putPdf(key, bytes);
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          signedPdfKey: key,
          signedAt: new Date(),
          status: "SIGNED_UPLOADED",
        },
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: "pdf",
        before: { signedPdfKey: filing.signedPdfKey, status: filing.status },
        after: { signedPdfKey: key, status: "SIGNED_UPLOADED", bytes: bytes.length },
        reason: ctx.reason,
      });
      return { ok: true, key, bytes: bytes.length };
    }

    // ── SSN capture (docs/reviews/2026-10-15-ssn-capture-spec.md) ──

    case "requestOwnerSsn": {
      // S1: email the client a sign-in link straight to the secure box on
      // their order page. The email never carries the number or a field for it.
      if (!filing.user) {
        throw new FilingActionError(400, "no_customer_email", "no customer email");
      }
      const entry = ssnEntryState(filing.status);
      if (entry === "locked") {
        throw new FilingActionError(409, "ssn_locked", SSN_LOCKED_MESSAGE);
      }
      if (entry === "not_paid") {
        throw new FilingActionError(
          409,
          "not_paid",
          "This order is not paid yet. The SSN box is on the client's order page, which opens after payment.",
        );
      }
      if (!isPiiCryptoConfigured()) {
        throw new FilingActionError(503, "not_configured", SSN_ADMIN_KEY_MISSING_MESSAGE);
      }
      let brand: Awaited<ReturnType<typeof brandForFiling>> = null;
      try {
        brand = await brandForFiling(filing.id);
      } catch (err) {
        console.error("[admin requestOwnerSsn] brand lookup failed", err);
      }
      try {
        await sendOwnerSsnRequestEmail({
          email: filing.user.email,
          recipientName: filing.ownerName,
          filingId: filing.id,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
          brand: brand ?? undefined,
        });
      } catch (err) {
        throw new FilingActionError(
          502,
          "email_failed",
          `The email could not be sent: ${err instanceof Error ? err.message : "unknown error"}`,
        );
      }
      const requestedAt = new Date();
      await prisma.filing.update({
        where: { id: filing.id },
        data: { ownerSsnRequestedAt: requestedAt },
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: OWNER_SSN_REQUEST_FIELD,
        before: { ownerSsnRequestedAt: filing.ownerSsnRequestedAt },
        after: { action: "requestOwnerSsn", ownerSsnRequestedAt: requestedAt, emailSent: true },
        reason: "Admin asked the client to add their SSN on the order page.",
      });
      return { ok: true, requestedAt: requestedAt.toISOString(), emailTo: filing.user.email };
    }

    case "setOwnerSsn": {
      // S6: the client sent the number another way; staff type it in through
      // the same encrypted path. Web admin only (WEB_ADMIN_ONLY_FILING_ACTIONS).
      const who = ctx.approver ?? ctx.adminId;
      if (!who) {
        throw new FilingActionError(
          403,
          "identity_required",
          "We could not tell which admin is signed in. Sign out of the admin portal and sign in again.",
        );
      }
      let saved: Awaited<ReturnType<typeof saveOwnerSsn>>;
      try {
        saved = await saveOwnerSsn({
          filingId: filing.id,
          ssn: body.ssn,
          confirm: body.confirm,
          submittedBy: who,
          adminId: ctx.adminId,
          source: "admin",
        });
      } catch (err) {
        if (err instanceof OwnerSsnError) throw new FilingActionError(err.status, err.code, err.message);
        // Never rethrow the raw error: a database error can echo its arguments
        // (the ciphertext) into the server log.
        console.error(`[admin setOwnerSsn] ${filing.id} save failed (${err instanceof Error ? err.name : "unknown"})`);
        throw new FilingActionError(500, "save_failed", "The SSN could not be saved. Try again.");
      }
      const preflightRerun = await autoRerunPreflight(filing, ctx, OWNER_SSN_CHANGE_FIELD);
      return {
        ok: true,
        last4: saved.last4,
        submittedAt: saved.submittedAt.toISOString(),
        replaced: saved.replaced,
        preflightRerun,
      };
    }

    case "revealOwnerSsn": {
      // S3: admin website only, change-logged (who, when) before the number is
      // returned. The plaintext goes to the admin UI in this response only.
      const who = ctx.approver ?? ctx.adminId;
      if (!who) {
        throw new FilingActionError(
          403,
          "identity_required",
          "We could not tell which admin is signed in. Sign out of the admin portal and sign in again.",
        );
      }
      try {
        const revealed = await revealOwnerSsn({ filingId: filing.id, adminId: ctx.adminId, revealedBy: who });
        return { ok: true, ssn: revealed.ssn, revealedAt: revealed.revealedAt.toISOString() };
      } catch (err) {
        if (err instanceof OwnerSsnError) throw new FilingActionError(err.status, err.code, err.message);
        console.error(`[admin revealOwnerSsn] ${filing.id} failed (${err instanceof Error ? err.name : "unknown"})`);
        throw new FilingActionError(500, "reveal_failed", "The SSN could not be shown. Try again.");
      }
    }

    default:
      throw new FilingActionError(400, "unknown_action", "unknown action");
  }
}
