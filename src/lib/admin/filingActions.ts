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
            taxYears: full.taxYears, isDiirsp: full.isDiirsp,
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
          taxYears: full.taxYears, isDiirsp: full.isDiirsp,
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
      ]);
      if (!allowed.has(field)) {
        throw new FilingActionError(400, "field_not_editable", `field "${field}" is not editable`);
      }

      const before = (filing as unknown as Record<string, unknown>)[field];
      await prisma.$transaction([
        prisma.filing.update({
          where: { id: filing.id },
          data: { [field]: value } as unknown as never,
          select: { id: true },
        }),
        prisma.filingChangeLog.create({
          data: {
            filingId: filing.id,
            adminId: ctx.adminId,
            source: "admin",
            field,
            beforeJson: before as never,
            afterJson: value as never,
            reason: reason || ctx.reason || null,
          },
          select: { id: true },
        }),
      ]);
      return { ok: true, field, before, after: value };
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
