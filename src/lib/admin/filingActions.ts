import { Prisma, type FilingStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail, sendReadyToSignEmail } from "@/lib/email";
import { submitFax } from "@/lib/fax";
import { publicUrl, put, putPdf, get as getStorageObject } from "@/lib/storage";
import { env } from "@/lib/env";
import { generatePackage, type GeneratedPackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { filingToPackageInput } from "@/lib/pdf/packageInput";
import { runPreflight } from "@/lib/pdf/preflight";
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
import { hasCompleteReasonableCause, requiresReasonableCause } from "@/lib/completeness";
import { apnsConfigured, sendAdminPush } from "@/lib/apns";

export type FilingActionName =
  | "setStatus"
  | "resendOrderConfirmation"
  | "resendMagicLink"
  | "retryFax"
  | "regeneratePdf"
  | "approvePreflightOverride"
  | "approveForSignature"
  | "updateField"
  | "updateYearField"
  | "uploadReviewedPdf"
  | "uploadSignedPdf";

export type FilingActionContext = {
  adminId: string | null;
  /** Who is approving: the personal admin id, or the shared admin login's email. Null only when
   *  the caller could not be identified at all. Used for approvals that must be attributed. */
  approver?: string | null;
  force?: boolean;
  reason?: string;
};

export type FilingActionResult = { ok: true; [k: string]: unknown };

export const FILING_ACTION_NAMES = [
  "setStatus",
  "resendOrderConfirmation",
  "resendMagicLink",
  "retryFax",
  "regeneratePdf",
  "approvePreflightOverride",
  "approveForSignature",
  "updateField",
  "updateYearField",
  "uploadReviewedPdf",
  "uploadSignedPdf",
] as const satisfies readonly FilingActionName[];

export const SIDE_EFFECTING_ACTIONS: ReadonlySet<FilingActionName> = new Set<FilingActionName>([
  "retryFax",
  "resendOrderConfirmation",
  "resendMagicLink",
  "regeneratePdf",
  "approveForSignature",
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
  reasonableCauseNarrative: true,
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
  faxJobId: true,
  faxStatus: true,
  user: { select: { id: true, email: true } },
  yearData: {
    select: {
      taxYear: true,
      rcsWhyMissed: true,
      rcsWhenLearned: true,
      rcsNoIrsNoticeConfirmed: true,
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
    },
  },
} as const;

const YEAR_NULLABLE_STRINGS = new Set(["rcsWhyMissed", "rcsWhenLearned"]);
const YEAR_NULLABLE_BOOLEANS = new Set(["rcsNoIrsNoticeConfirmed"]);

const adminNonCashTransferSchema = z.object({
  date: z.string().trim().min(1),
  direction: z.enum(["in", "out"]),
  description: z.string().trim().min(1),
  fairMarketValueCents: z.number().int().finite(),
  valuationMethod: z.string().trim().min(1),
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
  date: z.string().trim().min(1),
  amountCents: z.number().int().finite(),
  note: z.string().optional(),
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
    throw new FilingActionError(400, "invalid_value", `${field} has an invalid shape`);
  }
  return parsed.data;
}

function yearJsonWriteValue(value: unknown) {
  if (value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
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
      let pdfBytes: Uint8Array | null = null;
      let signatures: SignatureLocation[] = [];
      try {
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
          await prisma.filing.update({
            where: { id: filing.id },
            data: {
              generatedPdfKey: key,
              preflightStatus: preflight.ok ? "passed" : "failed",
              preflightFailures: preflight.failures,
              preflightWarnings: preflight.warnings,
              preflightCheckedAt: new Date(),
              preflightOverrideBy: null,
              preflightOverrideAt: null,
              preflightOverrideReason: null,
              reviewApprovedAt: null,
              reviewApprovedBy: null,
              generatorVersion: result.record.generatorVersion,
              generatorCommit: result.record.commit,
            },
            select: { id: true },
          });
        }
      } catch (err) {
        console.error("[admin resendOrderConfirmation] regenerate failed", err);
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
      await sendMagicLinkEmail(filing.user.email, makeMagicLink(filing.user.id), label);
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

    case "retryFax": {
      if (!filing.signedPdfKey) {
        throw new FilingActionError(400, "signed_pdf_required", "no signed PDF on file");
      }
      if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
        throw new FilingActionError(
          409,
          "preflight_failed",
          "Fax held: this package failed pre-flight checks. An admin must review it.",
        );
      }
      // A late filing without a reasonable-cause statement is legally naked on
      // the $25,000 exposure — the whole pitch of the service is that late
      // filings go out WITH the statement. Computed fresh (never from the
      // stored isDiirsp flag): the classification may have changed since the
      // package was generated. The admin can override with force+reason for
      // the rare deliberate case; the override is captured in the change log.
      {
        const rcsComplete = hasCompleteReasonableCause(filing, filing.yearData ?? []);
        if (!rcsComplete && !isValidForceOverride(ctx)) {
          throw new FilingActionError(
            409,
            "rcs_missing_for_late_filing",
            "This filing is past its due date but has no reasonable-cause statement. Add the narrative (or force with a reason) before faxing.",
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
      try {
        const bytes = await getStorageObject(filing.signedPdfKey);
        await putPdf(faxedKey, bytes);
      } catch (err) {
        console.error("[retryFax] faxed-snapshot copy failed", err);
        throw new FilingActionError(
          500,
          "fax_snapshot_failed",
          "Could not snapshot the PDF for the fax audit trail; fax not sent.",
        );
      }
      // Fax the snapshotted bytes so the transmitted content and the recorded
      // faxedPdfKey are guaranteed identical.
      const mediaUrl = await publicUrl(faxedKey);
      const job = await submitFax({ mediaUrl, to: env.telnyx.destination });
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          faxJobId: job.id,
          faxStatus: "queued",
          status: "FAXED",
          faxedPdfKey: faxedKey,
          faxedAt: new Date(),
        },
        select: { id: true },
      });
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
        },
        reason: ctx.reason,
      });
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
      const full = await prisma.filing.findUnique({
        where: { id: filing.id },
        select: {
          ...packageFilingSelect,
          yearData: {
            ...packageFilingSelect.yearData,
            orderBy: { taxYear: "asc" as const },
          },
        },
      });
      if (!full) {
        throw new FilingActionError(404, "not_found", "filing not found");
      }
      if (!full.llcName || !full.llcEin || !full.llcAddress || !full.llcCity ||
          !full.llcState || !full.llcZip || !full.llcDateIncorporated ||
          !full.llcBusinessActivity || !full.llcBusinessCode || !full.ownerName ||
          !full.ownerAddress || !full.ownerCountryCitizenship ||
          !full.ownerCountryTaxResidence || !full.ownerCountryBusiness ||
          !(full.ownerFtin || full.ownerHasFtin === false)) {
        throw new FilingActionError(
          400,
          "missing_required_fields",
          "filing is missing required fields — finish the wizard first",
        );
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
      // Reset signed PDF + validation state — the old signature was applied
      // to a stale PDF and isn't valid against the new one. Customer (or
      // admin) needs to re-sign.
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          generatedPdfKey: key,
          signedPdfKey: null,
          validationStatus: "pending",
          validationCheckedAt: null,
          preflightStatus: preflight.ok ? "passed" : "failed",
          preflightFailures: preflight.failures,
          preflightWarnings: preflight.warnings,
          preflightCheckedAt: new Date(),
          preflightOverrideBy: null,
          preflightOverrideAt: null,
          preflightOverrideReason: null,
          reviewApprovedAt: null,
          reviewApprovedBy: null,
          generatorVersion: pkg.record.generatorVersion,
          generatorCommit: pkg.record.commit,
          status: "PDF_GENERATED",
        },
        select: { id: true },
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
        },
        reason: ctx.reason,
      });
      return {
        ok: true,
        pdfBytes: pkg.bytes.length,
        signatureCount: pkg.signatures.length,
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

      const allowed = new Set<string>([
        "llcName", "llcEin", "llcAddress", "llcCity", "llcState", "llcZip",
        "llcCountry", "llcCountryBusiness", "llcBusinessActivity", "llcBusinessCode",
        "llcMemberCount", "llcAddressIsRegisteredAgentOnly", "priorForm5472Filed",
        "ownerName", "ownerAddress",
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
      ]);
      if (!allowed.has(field)) {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
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
      };
      // Blanking an EXTENSION field is always allowed — it means "we don't
      // have this fact", which is the same as never having asked. The legacy
      // string fields keep their previous behaviour exactly (an empty string
      // is stored as an empty string) — llcCountry is a non-nullable column,
      // so silently turning "" into null there would start throwing.
      const EXTENSION_SCALARS = new Set([
        "extensionFiled", "extensionTransmittedAt", "extensionMethod", "extensionDestination",
      ]);
      const NULLABLE_ENUM_SCALARS = new Set(Array.from(EXTENSION_SCALARS).concat("priorForm5472Filed"));
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
      return {
        ok: true,
        field,
        before,
        after,
        derived: Object.fromEntries(derivedKeys.map((k) => [k, toJson(update[k])])),
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
      const allowed = new Set<string>([
        "rcsWhyMissed",
        "rcsWhenLearned",
        "rcsNoIrsNoticeConfirmed",
        "nonCashTransfers",
        "ownerPaidCosts",
        "zeroConfirmations",
      ]);
      if (!allowed.has(field)) {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
      }

      let after: unknown;
      let writeValue: unknown;
      if (YEAR_NULLABLE_STRINGS.has(field)) {
        const raw = body.value === undefined || body.value === null ? null : String(body.value);
        after = raw === null || raw.trim() === "" ? null : raw;
        writeValue = after;
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
          nonCashTransfers: true,
          ownerPaidCosts: true,
          zeroConfirmations: true,
        },
      });
      if (!year) {
        throw new FilingActionError(404, "year_not_found", "filing year not found");
      }

      const before = (year as unknown as Record<string, unknown>)[field] ?? null;
      await prisma.filingYearData.update({
        where: { filingId_taxYear: { filingId: filing.id, taxYear } },
        data: { [field]: writeValue } as never,
        select: { id: true },
      });
      await logFilingChange({
        filingId: filing.id,
        adminId: ctx.adminId,
        source: "admin",
        field: `year:${taxYear}:${field}`,
        before,
        after,
        reason: reason || ctx.reason,
      });
      return { ok: true };
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
        },
        reason,
      });
      return { ok: true };
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

      try {
        await sendReadyToSignEmail({
          email: filing.user.email,
          recipientName: filing.ownerName,
          filingId: filing.id,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink: makeMagicLink(filing.user.id),
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
      if (["SIGNED_UPLOADED", "FAXED", "CONFIRMED"].includes(filing.status)) {
        throw new FilingActionError(
          409,
          "already_signed_or_filed",
          "This filing has already been signed, faxed, or confirmed.",
        );
      }
      if (filing.preflightStatus === "failed" && !filing.preflightOverrideBy) {
        throw new FilingActionError(
          409,
          "preflight_failed",
          "This package failed pre-flight checks. Fix the order data and regenerate.",
        );
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
      // the original artifact in R2. Customer-signs-first flow: when their
      // drawn signature is already on file, return to SIGNATURE_PENDING (admin
      // stamps the saved signature onto this version next), not PDF_GENERATED.
      const reviewedStatus = filing.signaturePngKey ? "SIGNATURE_PENDING" : "PDF_GENERATED";
      const approvedAt = new Date();
      await prisma.filing.update({
        where: { id: filing.id },
        data: {
          generatedPdfKey: key,
          signedPdfKey: null,
          signedAt: null,
          validationStatus: "pending",
          validationCheckedAt: null,
          reviewApprovedAt: approvedAt,
          reviewApprovedBy: ctx.approver ?? ctx.adminId,
          status: reviewedStatus,
        },
        select: { id: true },
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
          status: reviewedStatus,
          reviewApprovedAt: approvedAt,
          reviewApprovedBy: ctx.approver ?? ctx.adminId,
        },
        reason: ctx.reason,
      });
      if (!filing.signaturePngKey && filing.user) {
        try {
          await sendReadyToSignEmail({
            email: filing.user.email,
            recipientName: filing.ownerName,
            filingId: filing.id,
            llcName: filing.llcName,
            taxYears: filing.taxYears,
            portalLink: makeMagicLink(filing.user.id),
          });
        } catch (err) {
          console.error("[uploadReviewedPdf] ready-to-sign email failed", err);
        }
      }
      return { ok: true, key, bytes: bytes.length };
    }

    case "uploadSignedPdf": {
      // Admin/accountant uploads the externally-signed final PDF. Body:
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

    default:
      throw new FilingActionError(400, "unknown_action", "unknown action");
  }
}
