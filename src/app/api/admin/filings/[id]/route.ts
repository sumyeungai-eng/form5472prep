import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { submitFax } from "@/lib/fax";
import { publicUrl, putPdf, get as getStorageObject } from "@/lib/storage";
import { env } from "@/lib/env";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// AI check takes 15-30s end-to-end; the regenerate-and-resend-confirmation
// case can be similar. Default 10s isn't enough.
export const maxDuration = 120;

const VALID_STATUSES = new Set([
  "DRAFT",
  "PAID",
  "PDF_GENERATED",
  "SIGNATURE_PENDING",
  "SIGNED_UPLOADED",
  "FAXED",
  "CONFIRMED",
  "FAILED",
]);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  if (!action) return NextResponse.json({ error: "missing action" }, { status: 400 });

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: { user: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  switch (action) {
    case "setStatus": {
      const next = String(body?.status ?? "").toUpperCase();
      if (!VALID_STATUSES.has(next)) {
        return NextResponse.json({ error: "invalid status" }, { status: 400 });
      }
      // Cast to satisfy Prisma's enum type. We validated against the same set.
      await prisma.filing.update({
        where: { id: filing.id },
        data: { status: next as never },
      });
      return NextResponse.json({ ok: true });
    }

    case "resendOrderConfirmation": {
      if (!filing.user) return NextResponse.json({ error: "no customer email" }, { status: 400 });
      // Regenerate the PDF fresh against the latest generator code, store to
      // R2, and attach to the email — so a stale PDF (e.g. from a previous
      // template version) is never what the customer receives.
      let pdfBytes: Uint8Array | null = null;
      let signatures: SignatureLocation[] = [];
      try {
        const full = await prisma.filing.findUnique({
          where: { id: filing.id },
          include: { yearData: true },
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
      return NextResponse.json({ ok: true, pdfAttached: !!pdfBytes, signatureCount: signatures.length });
    }

    case "resendMagicLink": {
      if (!filing.user) return NextResponse.json({ error: "no customer email" }, { status: 400 });
      const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
      await sendMagicLinkEmail(filing.user.email, makeMagicLink(filing.user.id), label);
      return NextResponse.json({ ok: true });
    }

    case "retryFax": {
      if (!filing.signedPdfKey) {
        return NextResponse.json({ error: "no signed PDF on file" }, { status: 400 });
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
        return NextResponse.json(
          { error: "Could not snapshot the PDF for the fax audit trail; fax not sent." },
          { status: 500 },
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
      });
      return NextResponse.json({ ok: true, faxJobId: job.id });
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
        include: { yearData: { orderBy: { taxYear: "asc" } } },
      });
      if (!full) return NextResponse.json({ error: "filing not found" }, { status: 404 });
      if (!full.llcName || !full.llcEin || !full.llcAddress || !full.llcCity ||
          !full.llcState || !full.llcZip || !full.llcDateIncorporated ||
          !full.llcBusinessActivity || !full.llcBusinessCode || !full.ownerName ||
          !full.ownerAddress || !full.ownerCountryCitizenship ||
          !full.ownerCountryTaxResidence || !full.ownerCountryBusiness || !full.ownerFtin) {
        return NextResponse.json({ error: "filing is missing required fields — finish the wizard first" }, { status: 400 });
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
        return NextResponse.json({ error: `generation failed: ${msg}` }, { status: 500 });
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
      });
      return NextResponse.json({
        ok: true,
        pdfBytes: pkg.bytes.length,
        signatureCount: pkg.signatures.length,
        note: filing.signedPdfKey ? "Existing signed PDF was discarded — re-sign required." : undefined,
      });
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
        return NextResponse.json({ error: `field "${field}" is not editable` }, { status: 400 });
      }

      const before = (filing as unknown as Record<string, unknown>)[field];
      await prisma.$transaction([
        prisma.filing.update({
          where: { id: filing.id },
          data: { [field]: value } as unknown as never,
        }),
        prisma.filingChangeLog.create({
          data: {
            filingId: filing.id,
            source: "admin",
            field,
            beforeJson: before as never,
            afterJson: value as never,
            reason: reason || null,
          },
        }),
      ]);
      return NextResponse.json({ ok: true, field, before, after: value });
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
        return NextResponse.json({ error: "Empty or missing pdfBase64" }, { status: 400 });
      }
      const bytes = Buffer.from(cleaned, "base64");
      // Cheap magic-number check — PDF files always start with "%PDF-".
      if (!bytes.slice(0, 5).toString("ascii").startsWith("%PDF-")) {
        return NextResponse.json({ error: "Uploaded file is not a valid PDF (missing %PDF- header)" }, { status: 400 });
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
      });
      return NextResponse.json({ ok: true, key, bytes: bytes.length });
    }

    default:
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }
}
