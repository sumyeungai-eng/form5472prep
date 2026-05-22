import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { resolveTier } from "@/lib/pricing";
import { generatePackage } from "@/lib/pdf/generatePackage";
import { putPdf } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new NextResponse("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, env.stripe.webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return new NextResponse(`Webhook signature failed: ${msg}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const filingId = session.metadata?.filingId;
    if (filingId) {
      const filing = await prisma.filing.update({
        where: { id: filingId },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
        },
        include: { user: true },
      });

      // Generate the filled PDF synchronously so we can attach it to the
      // confirmation email and tell the customer exactly where to sign.
      // If generation fails (e.g. missing required fields), we still send the
      // confirmation email — just without the attachment — and the customer
      // can finish the wizard and trigger generation from the portal.
      // The AI-validate endpoint owns sending the order confirmation email
      // (with PDF + signature locations). Webhook only needs to track whether
      // a PDF was successfully produced, to decide between "fire validation"
      // and "fall back to legacy no-attachment confirmation".
      let pdfBytes: Uint8Array | null = null;
      try {
        const full = await prisma.filing.findUnique({
          where: { id: filing.id },
          include: { yearData: true },
        });
        if (full && full.llcName && full.llcEin && full.llcAddress && full.llcCity &&
            full.llcState && full.llcZip && full.llcDateIncorporated &&
            full.llcBusinessActivity && full.llcBusinessCode && full.ownerName &&
            full.ownerAddress && full.ownerCountryCitizenship &&
            full.ownerCountryTaxResidence && full.ownerCountryBusiness && full.ownerFtin) {
          const result = await generatePackage({
            llcName: full.llcName,
            llcEin: full.llcEin,
            llcAddress: full.llcAddress,
            llcCity: full.llcCity,
            llcState: full.llcState,
            llcZip: full.llcZip,
            llcCountry: full.llcCountry,
            llcDateIncorporated: full.llcDateIncorporated,
            llcBusinessActivity: full.llcBusinessActivity,
            llcBusinessCode: full.llcBusinessCode,
            ownerName: full.ownerName,
            ownerAddress: full.ownerAddress,
            ownerCountryCitizenship: full.ownerCountryCitizenship,
            ownerCountryTaxResidence: full.ownerCountryTaxResidence,
            ownerCountryBusiness: full.ownerCountryBusiness,
            ownerFtin: full.ownerFtin,
            ownerItin: full.ownerItin,
            ownerReferenceId: full.ownerReferenceId,
            taxYears: full.taxYears,
            isDiirsp: full.isDiirsp,
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
          const key = `${filing.id}_unsigned.pdf`;
          await putPdf(key, result.bytes);
          await prisma.filing.update({
            where: { id: filing.id },
            data: {
              generatedPdfKey: key,
              status: "PDF_GENERATED",
              validationStatus: "pending",
            },
          });
        } else {
          console.warn("[stripe-webhook] PDF generation skipped — required fields missing");
        }
      } catch (err) {
        console.error("[stripe-webhook] PDF generation failed", err);
      }

      // Send the magic link no matter what — customers always need a way to
      // come back to their portal.
      if (filing.user) {
        const link = makeMagicLink(filing.user.id);
        const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
        try {
          await sendMagicLinkEmail(filing.user.email, link, label);
        } catch (err) {
          console.error("[stripe-webhook] magic link email failed", err);
        }
      }

      // If PDF generation succeeded, kick off the AI compliance check.
      // The validate endpoint owns sending the order-confirmation email
      // (after the check passes) or posting a "we need clarification"
      // system message (when it doesn't). This is fire-and-forget so we
      // don't block Stripe's webhook timeout on a 20-30s AI call.
      //
      // If PDF generation FAILED (missing required fields), there's nothing
      // to validate — fall through and send the order confirmation as today
      // so the customer at least gets payment acknowledgment.
      if (pdfBytes && filing.user) {
        const internalSecret = process.env.INTERNAL_API_SECRET;
        if (internalSecret) {
          // Fire-and-forget: don't await. fetch() returns a Promise but the
          // serverless function may still run it to completion as long as we
          // hold the event loop briefly — and even if it doesn't, the admin
          // "Re-run AI check" button is the fallback.
          fetch(`${env.appUrl}/api/internal/validate-filing/${filing.id}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${internalSecret}` },
          }).catch((err) => console.error("[stripe-webhook] kick off validation failed", err));
        } else {
          console.warn("[stripe-webhook] INTERNAL_API_SECRET not set; skipping AI validation");
        }
      } else if (filing.user) {
        // No PDF generated — send the legacy order confirmation (no attachment)
        // so the customer still gets a payment receipt + next steps.
        const link = makeMagicLink(filing.user.id);
        const amountPaidCents = session.amount_total ?? 0;
        const tier = resolveTier(filing.tier).tier;

        let receiptUrl: string | null = null;
        try {
          const piId = session.payment_intent as string;
          if (piId) {
            const pi = await stripe().paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
            const charge = pi.latest_charge as Stripe.Charge | null;
            receiptUrl = charge?.receipt_url ?? null;
          }
        } catch (err) {
          console.error("[stripe-webhook] receipt url lookup failed", err);
        }

        try {
          await sendOrderConfirmationEmail({
            email: filing.user.email,
            filingId: filing.id,
            llcName: filing.llcName,
            taxYears: filing.taxYears,
            tier,
            amountPaidCents,
            faxService: filing.faxService,
            portalLink: link,
            receiptUrl,
            // Drives tier-label + price selection in the email so premium
            // customers see "Single year — Priority / $149" matching what
            // Stripe charged them.
            funnelSource: filing.funnelSource,
            pdfBytes: null,
            signatures: [],
          });
        } catch (err) {
          console.error("[stripe-webhook] order confirmation email failed", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
