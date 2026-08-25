import type { FilingStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { submitFax } from "@/lib/fax";
import { publicUrl, putPdf, get as getStorageObject } from "@/lib/storage";
import { env } from "@/lib/env";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import {
  isLegalTransition,
  logFilingChange,
  TransitionError,
} from "@/lib/admin/mutations";
import { effectiveDueDateUtc, extensionUnclear, formatDueDate } from "@/lib/schemas";
import { apnsConfigured, sendAdminPush } from "@/lib/apns";

export type FilingActionName =
  | "setStatus"
  | "resendOrderConfirmation"
  | "resendMagicLink"
  | "retryFax"
  | "regeneratePdf"
  | "updateField"
  | "uploadSignedPdf";

export type FilingActionContext = {
  adminId: string | null;
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
  "updateField",
  "uploadSignedPdf",
] as const satisfies readonly FilingActionName[];

export const SIDE_EFFECTING_ACTIONS: ReadonlySet<FilingActionName> = new Set<FilingActionName>([
  "retryFax",
  "resendOrderConfirmation",
  "resendMagicLink",
  "regeneratePdf",
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
  llcBusinessActivity: true,
  llcBusinessCode: true,
  ownerName: true,
  ownerAddress: true,
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
  faxService: true,
  signedPdfKey: true,
  generatedPdfKey: true,
  faxedPdfKey: true,
  faxJobId: true,
  faxStatus: true,
  user: { select: { id: true, email: true } },
} as const;

const packageFilingSelect = {
  llcName: true,
  llcEin: true,
  llcAddress: true,
  llcCity: true,
  llcState: true,
  llcZip: true,
  llcCountry: true,
  llcDateIncorporated: true,
  llcBusinessActivity: true,
  llcBusinessCode: true,
  ownerName: true,
  ownerAddress: true,
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
    },
  },
} as const;

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
    // End of the tax year = Dec 31, or the dissolution date on a final
    // (short-year) return.
    const yearEnd =
      f.isFinalReturn && f.dissolvedAt ? f.dissolvedAt.getTime() : Date.UTC(maxYear, 11, 31);
    if (sent < yearEnd) {
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
            full.ownerCountryBusiness && full.ownerFtin) {
          const result = await generatePackage({
            llcName: full.llcName, llcEin: full.llcEin, llcAddress: full.llcAddress,
            llcCity: full.llcCity, llcState: full.llcState, llcZip: full.llcZip,
            llcCountry: full.llcCountry, llcDateIncorporated: full.llcDateIncorporated,
            llcBusinessActivity: full.llcBusinessActivity, llcBusinessCode: full.llcBusinessCode,
            ownerName: full.ownerName, ownerAddress: full.ownerAddress,
            ownerCountryCitizenship: full.ownerCountryCitizenship,
            ownerCountryTaxResidence: full.ownerCountryTaxResidence,
            ownerCountryBusiness: full.ownerCountryBusiness, ownerFtin: full.ownerFtin,
            ownerItin: full.ownerItin, ownerReferenceId: full.ownerReferenceId,
            taxYears: full.taxYears, isDiirsp: full.isDiirsp, isFinalReturn: full.isFinalReturn,
            dissolvedAt: full.dissolvedAt,
            extensionFiled: full.extensionFiled,
            extensionTransmittedAt: full.extensionTransmittedAt,
            reasonableCauseNarrative: full.reasonableCauseNarrative,
            yearData: full.yearData.map((y) => ({
              taxYear: y.taxYear,
              totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
              contributions: Number(y.contributions),
              distributions: Number(y.distributions),
              otherTransactionsNote: y.otherTransactionsNote,
              reportableTransactions: Array.isArray(y.reportableTransactions)
                ? (y.reportableTransactions as unknown[]).filter(
                    (t): t is { date: string; description: string; counterparty?: string; amountCents: number; category: string } =>
                      !!t && typeof t === "object" && "date" in t && "amountCents" in t && "category" in t,
                  )
                : [],
            })),
          });
          pdfBytes = result.bytes;
          signatures = result.signatures;
          const key = `${filing.id}_unsigned.pdf`;
          await putPdf(key, result.bytes);
          await prisma.filing.update({
            where: { id: filing.id },
            data: { generatedPdfKey: key },
            select: { id: true },
          });
        }
      } catch (err) {
        console.error("[admin resendOrderConfirmation] regenerate failed", err);
      }
      await sendOrderConfirmationEmail({
        email: filing.user.email,
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
          !full.ownerCountryTaxResidence || !full.ownerCountryBusiness || !full.ownerFtin) {
        throw new FilingActionError(
          400,
          "missing_required_fields",
          "filing is missing required fields — finish the wizard first",
        );
      }
      let pkg: { bytes: Uint8Array; signatures: SignatureLocation[] };
      try {
        pkg = await generatePackage({
          llcName: full.llcName, llcEin: full.llcEin, llcAddress: full.llcAddress,
          llcCity: full.llcCity, llcState: full.llcState, llcZip: full.llcZip,
          llcCountry: full.llcCountry, llcDateIncorporated: full.llcDateIncorporated,
          llcBusinessActivity: full.llcBusinessActivity, llcBusinessCode: full.llcBusinessCode,
          ownerName: full.ownerName, ownerAddress: full.ownerAddress,
          ownerCountryCitizenship: full.ownerCountryCitizenship,
          ownerCountryTaxResidence: full.ownerCountryTaxResidence,
          ownerCountryBusiness: full.ownerCountryBusiness, ownerFtin: full.ownerFtin,
          ownerItin: full.ownerItin, ownerReferenceId: full.ownerReferenceId,
          taxYears: full.taxYears, isDiirsp: full.isDiirsp, isFinalReturn: full.isFinalReturn,
          dissolvedAt: full.dissolvedAt,
          extensionFiled: full.extensionFiled,
          extensionTransmittedAt: full.extensionTransmittedAt,
          reasonableCauseNarrative: full.reasonableCauseNarrative,
          yearData: full.yearData.map((y) => ({
            taxYear: y.taxYear,
            totalAssetsYearEnd: Number(y.totalAssetsYearEnd),
            contributions: Number(y.contributions),
            distributions: Number(y.distributions),
            otherTransactionsNote: y.otherTransactionsNote,
            reportableTransactions: Array.isArray(y.reportableTransactions)
              ? (y.reportableTransactions as unknown[]).filter(
                  (t): t is { date: string; description: string; counterparty?: string; amountCents: number; category: string } =>
                    !!t && typeof t === "object" && "date" in t && "amountCents" in t && "category" in t,
                )
              : [],
          })),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        throw new FilingActionError(500, "generation_failed", `generation failed: ${msg}`);
      }
      const key = `${filing.id}_unsigned.pdf`;
      await putPdf(key, pkg.bytes);
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
        "llcCountry", "llcBusinessActivity", "llcBusinessCode",
        "ownerName", "ownerAddress",
        "ownerCountryCitizenship", "ownerCountryTaxResidence",
        "ownerCountryBusiness", "ownerFtin", "ownerItin", "ownerReferenceId",
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
      };
      // Blanking an EXTENSION field is always allowed — it means "we don't
      // have this fact", which is the same as never having asked. The legacy
      // string fields keep their previous behaviour exactly (an empty string
      // is stored as an empty string) — llcCountry is a non-nullable column,
      // so silently turning "" into null there would start throwing.
      const EXTENSION_SCALARS = new Set([
        "extensionFiled", "extensionTransmittedAt", "extensionMethod", "extensionDestination",
      ]);
      const blank = value === null || value.trim() === "";
      let writeValue: string | Date | boolean | null =
        EXTENSION_SCALARS.has(field) && blank ? null : value;
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
          // Same parse the filings route uses for date-only wizard input.
          const parsed = new Date(value!);
          if (Number.isNaN(parsed.getTime())) {
            throw new FilingActionError(400, "invalid_value", "extensionTransmittedAt must be a valid date");
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
      }

      const beforeRaw = (filing as unknown as Record<string, unknown>)[field];
      // Dates are not JSON — normalise both sides so the audit log stays
      // readable (and Prisma's Json column stays writable).
      const before = beforeRaw instanceof Date ? beforeRaw.toISOString() : beforeRaw ?? null;
      const after = writeValue instanceof Date ? writeValue.toISOString() : writeValue;
      await prisma.$transaction([
        prisma.filing.update({
          where: { id: filing.id },
          data: { [field]: writeValue } as unknown as never,
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
            reason: reason || ctx.reason || null,
          },
          select: { id: true },
        }),
      ]);
      return { ok: true, field, before, after };
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
