import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { MULTI_YEAR_ADDON_CENTS, MULTI_YEAR_ADDON_LABEL, multiYearAddonCents, tierInfo, isTestTier, resolveTier } from "@/lib/pricing";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { putPdf } from "@/lib/storage";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";

export async function POST(req: Request) {
  const { filingId, email } = await req.json();
  if (typeof email !== "string" || !email.includes("@"))
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status !== "DRAFT")
    return NextResponse.json({ error: "Already paid" }, { status: 409 });

  // Tier is selected at /pricing (or /start?tier=) and stored on Filing.tier.
  // Fax delivery is bundled into every tier — there's no separate add-on
  // line item anymore. Multi-year filings add a flat per-extra-year charge.
  const tier = tierInfo(filing.tier);
  const yearCount = filing.taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);

  // Bind the filing to the email before payment so the Stripe webhook can
  // look up the user and email the magic link even if the cookie is lost.
  const user = await bindFilingToEmail(filing.id, email);

  // Fax delivery is included on every tier — pin faxService=true so post-
  // payment UI + admin views never branch into the legacy "self-fax" path.
  await prisma.filing.update({
    where: { id: filing.id },
    data: { faxService: true },
  });

  // ─── Admin-only $0 test path ───
  // Skip Stripe entirely. Mark PAID, generate the PDF inline (mirroring the
  // production Stripe webhook), and send the order-confirmation email with
  // the PDF + sign link. No AI compliance check — the accountant reviews
  // the package before fax, same as real orders.
  if (isTestTier(filing.tier)) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: { status: "PAID", stripePaymentId: "test_no_payment" },
    });

    // Refetch with yearData + user so we have everything generatePackage +
    // sendOrderConfirmationEmail need.
    const full = await prisma.filing.findUnique({
      where: { id: filing.id },
      include: { user: true, yearData: true },
    });

    let pdfBytes: Uint8Array | null = null;
    let pdfSignatures: SignatureLocation[] = [];
    try {
      if (full && full.llcName && full.llcEin && full.llcAddress && full.llcCity &&
          full.llcState && full.llcZip && full.llcDateIncorporated &&
          full.llcBusinessActivity && full.llcBusinessCode && full.ownerName &&
          full.ownerAddress && full.ownerCountryCitizenship &&
          full.ownerCountryTaxResidence && full.ownerCountryBusiness && full.ownerFtin) {
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
        pdfSignatures = result.signatures;
        const key = `${filing.id}_unsigned.pdf`;
        await putPdf(key, result.bytes);
        await prisma.filing.update({
          where: { id: filing.id },
          data: { generatedPdfKey: key, status: "PDF_GENERATED" },
        });
      } else {
        console.warn("[checkout test] PDF generation skipped — required fields missing");
      }
    } catch (err) {
      console.error("[checkout test] PDF generation failed", err);
    }

    if (full?.user) {
      try {
        await sendOrderConfirmationEmail({
          email: full.user.email,
          filingId: full.id,
          llcName: full.llcName,
          taxYears: full.taxYears,
          tier: resolveTier(full.tier).tier,
          amountPaidCents: 0,
          faxService: full.faxService,
          portalLink: makeMagicLink(full.user.id),
          receiptUrl: null,
          funnelSource: full.funnelSource,
          pdfBytes,
          signatures: pdfSignatures,
        });
      } catch (err) {
        console.error("[checkout test] order confirmation email failed", err);
      }
    }
    return NextResponse.json({ url: `${env.appUrl}/filings/${filing.id}?paid=1` });
  }

  const lineItems = [
    {
      price_data: {
        currency: "usd" as const,
        unit_amount: tier.priceCents,
        product_data: {
          name: `Form5472 Prep — ${tier.label}`,
          description: `Filing for ${filing.llcName ?? "your LLC"} — ${filing.taxYears.join(", ") || "tax year"} (IRS fax delivery included)`,
        },
      },
      quantity: 1,
    },
  ];
  if (extraYears > 0) {
    lineItems.push({
      price_data: {
        currency: "usd" as const,
        unit_amount: MULTI_YEAR_ADDON_CENTS,
        product_data: {
          name: MULTI_YEAR_ADDON_LABEL,
          description: `Each additional past tax year beyond the first (${extraYears} × $${(MULTI_YEAR_ADDON_CENTS / 100).toFixed(0)}).`,
        },
      },
      quantity: extraYears,
    });
  }
  // Final total: tier base + multi-year add-on. Kept here as a sanity log so
  // a mismatched Stripe receipt can be cross-checked against expected math.
  const expectedTotalCents = tier.priceCents + multiYearAddonCents(yearCount);
  console.log("[checkout] expected total cents:", expectedTotalCents, "filing:", filing.id);

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: lineItems,
    success_url: `${env.appUrl}/filings/${filing.id}?paid=1`,
    cancel_url: `${env.appUrl}/filings/${filing.id}/edit`,
    metadata: { filingId: filing.id, userId: user.id },
  });

  await prisma.filing.update({
    where: { id: filing.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
