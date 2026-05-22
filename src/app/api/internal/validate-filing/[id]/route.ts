import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { get as getStorageObject, putPdf } from "@/lib/storage";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { resolveTier } from "@/lib/pricing";
import { makeMagicLink } from "@/lib/magicLink";
import {
  sendOrderConfirmationEmail,
  sendUnderReviewEmail,
  sendAiFlaggedAdminEmail,
} from "@/lib/email";
import { validateFiling, type FilingSnapshot, type ValidationResponse } from "@/lib/ai/validateFiling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

// Internal endpoint invoked by the Stripe webhook (fire-and-forget) and by
// the admin "Re-run AI check" button. Runs the Claude compliance check on
// the generated PDF and dispatches the appropriate emails/messages based
// on the result. Authenticated via INTERNAL_API_SECRET shared bearer.

function isAuthorized(req: Request): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) return false;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const filing = await prisma.filing.findUnique({
    where: { id: params.id },
    include: { user: true, yearData: { orderBy: { taxYear: "asc" } } },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });
  if (!filing.generatedPdfKey) {
    return NextResponse.json({ error: "no generated PDF on file" }, { status: 400 });
  }

  // Mark pending so concurrent admin requests don't double-fire.
  await prisma.filing.update({
    where: { id: filing.id },
    data: { validationStatus: "pending" },
  });

  const snapshot = buildSnapshot(filing);
  const adminFilingUrl = `${env.appUrl}/admin/filings/${filing.id}`;

  // 1) Load the current PDF and call Claude.
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await getStorageObject(filing.generatedPdfKey);
  } catch (err) {
    return finishWithError(filing.id, "could not load PDF from storage", err);
  }

  let result = await validateFiling({ pdfBytes, filing: snapshot });

  // 2) If AI says we can auto-fix, regenerate once and re-validate.
  // Auto-fix in practice is limited to generator-side issues; the regenerator
  // pulls from the same DB so it can only re-emit. This loop exists so future
  // generator improvements can act on AI hints without round-tripping the customer.
  let autoFixedSignatures: SignatureLocation[] | null = null;
  if (result.status === "fix_attempted") {
    try {
      const regen = await regenerate(filing);
      pdfBytes = regen.bytes;
      autoFixedSignatures = regen.signatures;
      await prisma.filing.update({
        where: { id: filing.id },
        data: { generatedPdfKey: regen.key },
      });
      result = await validateFiling({ pdfBytes, filing: snapshot });
    } catch (err) {
      return finishWithError(filing.id, "auto-fix regenerate failed", err);
    }
  }

  // 3) Persist final status + raw issues, then branch on outcome.
  await prisma.filing.update({
    where: { id: filing.id },
    data: {
      validationStatus: result.status,
      validationIssuesJson: result as unknown as never,
      validationCheckedAt: new Date(),
    },
  });

  // Helpers reused across branches.
  const portalLink = filing.user ? makeMagicLink(filing.user.id) : `${env.appUrl}/sign-in`;
  const signatures: SignatureLocation[] = autoFixedSignatures ?? (await ensureSignatures(filing));

  if (result.status === "passed" || (result.status === "fix_attempted" && result.issues.length === 0)) {
    // Clean — send the order confirmation email with PDF attached.
    await sendOrderConfirmationIfPossible(filing, pdfBytes, signatures);
    return NextResponse.json({ ok: true, status: result.status, summary: result.summary });
  }

  if (result.status === "needs_customer_input") {
    await postSystemMessage(filing.id, result.customer_questions, result.summary);
    if (filing.user) {
      try {
        await sendUnderReviewEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          taxYears: filing.taxYears,
          portalLink,
        });
      } catch (err) {
        console.error("[validate] under-review email failed", err);
      }
    }
    try {
      await sendAiFlaggedAdminEmail({
        adminEmail: env.supportEmail,
        customerEmail: filing.user?.email ?? null,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        filingId: filing.id,
        adminFilingUrl,
        status: "needs_customer_input",
        summary: result.summary,
        questions: result.customer_questions,
      });
    } catch (err) {
      console.error("[validate] admin alert failed", err);
    }
    return NextResponse.json({ ok: true, status: result.status, questions: result.customer_questions.length });
  }

  // result.status === "error" or fix_attempted with lingering issues we can't classify.
  // Fail open: send the PDF email so the customer isn't stuck on AI infra issues.
  // Notify admin to manually review.
  await sendOrderConfirmationIfPossible(filing, pdfBytes, signatures);
  try {
    await sendAiFlaggedAdminEmail({
      adminEmail: env.supportEmail,
      customerEmail: filing.user?.email ?? null,
      llcName: filing.llcName,
      taxYears: filing.taxYears,
      filingId: filing.id,
      adminFilingUrl,
      status: "error",
      summary: result.summary,
      questions: result.customer_questions,
      errorMessage: result.errorMessage,
    });
  } catch (err) {
    console.error("[validate] admin error alert failed", err);
  }
  return NextResponse.json({ ok: true, status: result.status, failOpen: true });
}

// Builds the structured snapshot the AI sees alongside the PDF.
function buildSnapshot(filing: {
  id: string; tier: string; taxYears: number[]; isDiirsp: boolean;
  reasonableCauseNarrative: string | null;
  llcName: string | null; llcEin: string | null; llcAddress: string | null;
  llcCity: string | null; llcState: string | null; llcZip: string | null;
  llcCountry: string; llcDateIncorporated: Date | null;
  llcBusinessActivity: string | null; llcBusinessCode: string | null;
  ownerName: string | null; ownerAddress: string | null;
  ownerCountryCitizenship: string | null; ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null; ownerFtin: string | null;
  ownerItin: string | null; ownerReferenceId: string | null;
  yearData: Array<{ taxYear: number; totalAssetsYearEnd: { toString(): string }; contributions: { toString(): string }; distributions: { toString(): string }; otherTransactionsNote: string | null; reportableTransactions: unknown }>;
}): FilingSnapshot {
  return {
    id: filing.id,
    tier: filing.tier,
    taxYears: filing.taxYears,
    isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    llcName: filing.llcName, llcEin: filing.llcEin, llcAddress: filing.llcAddress,
    llcCity: filing.llcCity, llcState: filing.llcState, llcZip: filing.llcZip,
    llcCountry: filing.llcCountry,
    llcDateIncorporated: filing.llcDateIncorporated?.toISOString().split("T")[0] ?? null,
    llcBusinessActivity: filing.llcBusinessActivity, llcBusinessCode: filing.llcBusinessCode,
    ownerName: filing.ownerName, ownerAddress: filing.ownerAddress,
    ownerCountryCitizenship: filing.ownerCountryCitizenship,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
    ownerCountryBusiness: filing.ownerCountryBusiness,
    ownerFtin: filing.ownerFtin, ownerItin: filing.ownerItin, ownerReferenceId: filing.ownerReferenceId,
    yearData: filing.yearData.map((y) => ({
      taxYear: y.taxYear,
      totalAssetsYearEnd: y.totalAssetsYearEnd.toString(),
      contributions: y.contributions.toString(),
      distributions: y.distributions.toString(),
      otherTransactionsNote: y.otherTransactionsNote,
      reportableTransactions: Array.isArray(y.reportableTransactions) ? y.reportableTransactions : [],
    })),
  };
}

// Regenerate the PDF from current DB state. Same gating as the webhook.
async function regenerate(filing: {
  id: string; llcName: string | null; llcEin: string | null; llcAddress: string | null;
  llcCity: string | null; llcState: string | null; llcZip: string | null;
  llcCountry: string; llcDateIncorporated: Date | null;
  llcBusinessActivity: string | null; llcBusinessCode: string | null;
  ownerName: string | null; ownerAddress: string | null;
  ownerCountryCitizenship: string | null; ownerCountryTaxResidence: string | null;
  ownerCountryBusiness: string | null; ownerFtin: string | null;
  ownerItin: string | null; ownerReferenceId: string | null;
  taxYears: number[]; isDiirsp: boolean; reasonableCauseNarrative: string | null;
  yearData: Array<{ taxYear: number; totalAssetsYearEnd: { toString(): string }; contributions: { toString(): string }; distributions: { toString(): string }; otherTransactionsNote: string | null; reportableTransactions: unknown }>;
}) {
  if (!filing.llcName || !filing.llcEin || !filing.llcAddress || !filing.llcCity ||
      !filing.llcState || !filing.llcZip || !filing.llcDateIncorporated ||
      !filing.llcBusinessActivity || !filing.llcBusinessCode || !filing.ownerName ||
      !filing.ownerAddress || !filing.ownerCountryCitizenship ||
      !filing.ownerCountryTaxResidence || !filing.ownerCountryBusiness ||
      !filing.ownerFtin) {
    throw new Error("filing missing required generator inputs");
  }
  const pkg = await generatePackage({
    llcName: filing.llcName, llcEin: filing.llcEin, llcAddress: filing.llcAddress,
    llcCity: filing.llcCity, llcState: filing.llcState, llcZip: filing.llcZip,
    llcCountry: filing.llcCountry, llcDateIncorporated: filing.llcDateIncorporated,
    llcBusinessActivity: filing.llcBusinessActivity, llcBusinessCode: filing.llcBusinessCode,
    ownerName: filing.ownerName, ownerAddress: filing.ownerAddress,
    ownerCountryCitizenship: filing.ownerCountryCitizenship,
    ownerCountryTaxResidence: filing.ownerCountryTaxResidence,
    ownerCountryBusiness: filing.ownerCountryBusiness, ownerFtin: filing.ownerFtin,
    ownerItin: filing.ownerItin, ownerReferenceId: filing.ownerReferenceId,
    taxYears: filing.taxYears, isDiirsp: filing.isDiirsp,
    reasonableCauseNarrative: filing.reasonableCauseNarrative,
    yearData: filing.yearData.map((y) => ({
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
  const key = `${filing.id}_unsigned.pdf`;
  await putPdf(key, pkg.bytes);
  return { bytes: pkg.bytes, signatures: pkg.signatures, key };
}

// Re-derive signature locations from the current PDF when we didn't just regenerate.
// We don't store signatures separately, so a re-run needs to regenerate for the
// metadata — cheap and idempotent.
async function ensureSignatures(filing: Parameters<typeof regenerate>[0]) {
  try {
    const r = await regenerate(filing);
    return r.signatures;
  } catch {
    return [];
  }
}

async function sendOrderConfirmationIfPossible(
  filing: { id: string; tier: string; taxYears: number[]; amountPaid: number; faxService: boolean; llcName: string | null; user: { id: string; email: string } | null },
  pdfBytes: Uint8Array,
  signatures: SignatureLocation[],
) {
  if (!filing.user) return; // Anonymous filings don't get email — webhook caught this earlier too.
  try {
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
  } catch (err) {
    console.error("[validate] order confirmation email failed", err);
  }
}

async function postSystemMessage(filingId: string, questions: string[], summary: string) {
  // Per product decision, AI messages are posted as fromAdmin=true so the
  // customer experiences them as coming from "Form5472 Prep team" — same
  // surface as a human-typed admin reply. The portal already auto-marks
  // and the "first unread" email logic handles notification.
  const body =
    `Hi — we've reviewed your filing and want to confirm a few details before we send your signed-ready PDF:\n\n` +
    questions.map((q, i) => `${i + 1}. ${q}`).join("\n\n") +
    `\n\nReply here with the answers and we'll regenerate your package. No additional charge.\n\n— Form5472 Prep team` +
    `\n\n(Internal summary: ${summary})`;
  await prisma.message.create({
    data: { filingId, fromAdmin: true, body },
  });
}

async function finishWithError(filingId: string, label: string, err: unknown) {
  console.error(`[validate] ${label}`, err);
  await prisma.filing.update({
    where: { id: filingId },
    data: {
      validationStatus: "error",
      validationIssuesJson: { error: label, detail: err instanceof Error ? err.message : String(err) } as unknown as never,
      validationCheckedAt: new Date(),
    },
  });
  return NextResponse.json({ error: label }, { status: 500 });
}

// Re-export the response type so callers (admin UI) can be typed.
export type { ValidationResponse };
