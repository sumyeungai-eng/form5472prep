import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";
import { resolveTier } from "@/lib/pricing";
import { generatePackage, type SignatureLocation } from "@/lib/pdf/generatePackage";
import { putPdf } from "@/lib/storage";
import { sendMetaPurchase } from "@/lib/analytics/metaServer";

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
      // Idempotency guard, keyed on stripePaymentId (NOT status). Stripe
      // delivers events at-least-once, AND the post-payment success page
      // (filings/[id]/page.tsx) promotes DRAFT->PAID as a redirect fallback
      // WITHOUT setting stripePaymentId. Keying the claim on status:DRAFT would
      // therefore let that page win the race and make this handler skip the
      // whole fulfillment (PDF gen + confirmation/magic-link/admin emails),
      // stranding a paid customer. stripePaymentId is only ever written here,
      // so `stripePaymentId: null` == "not yet fulfilled": the first delivery
      // claims it (even if the page already flipped status to PAID) and every
      // redelivery finds it set, matches 0 rows, and no-ops.
      const claim = await prisma.filing.updateMany({
        where: { id: filingId, stripePaymentId: null },
        data: {
          status: "PAID",
          stripePaymentId: session.payment_intent as string,
        },
      });
      if (claim.count === 0) {
        console.log(`[stripe-webhook] ${filingId} already fulfilled — skipping duplicate checkout.session.completed`);
        return NextResponse.json({ received: true, deduplicated: true });
      }
      const filing = await prisma.filing.findUnique({
        where: { id: filingId },
        include: { user: true },
      });
      if (!filing) return NextResponse.json({ received: true });

      // Stale-session guard. checkout overwrites filing.stripeSessionId with
      // the LATEST session, so a payment against a superseded session (e.g. the
      // customer opened a $199 one-year session, upgraded the draft to a
      // pricier tier/more years which minted a new session, then paid the old
      // tab) must be rejected — otherwise they'd get the bigger package for the
      // old price. Release the idempotency claim so the current session can
      // still fulfill, and don't process this one. (An orphaned charge here
      // needs a manual refund — surfaced via this warn log.)
      if (session.id !== filing.stripeSessionId) {
        await prisma.filing.updateMany({
          where: { id: filing.id, stripePaymentId: session.payment_intent as string },
          data: { status: "DRAFT", stripePaymentId: null },
        });
        console.warn("[stripe-webhook] stale checkout session rejected", {
          filingId,
          paidSessionId: session.id,
          currentSessionId: filing.stripeSessionId,
        });
        return NextResponse.json({ received: true, staleSession: true });
      }

      // Record the amount actually charged (the DB previously held only the
      // pre-checkout expected amount).
      await prisma.filing.update({
        where: { id: filing.id },
        data: { amountPaid: session.amount_total ?? filing.amountPaid },
      });

      // Consent-gated server-side Purchase event. Only a hashed email, order
      // value, currency, and event ID are sent; no filing or tax data leaves
      // the application. The browser Pixel uses the same event ID so Meta can
      // deduplicate the two delivery paths.
      if (filing.marketingConsent && filing.user && (session.amount_total ?? 0) > 0) {
        try {
          await sendMetaPurchase({
            email: filing.user.email,
            eventId: `purchase_${filing.id}`,
            amountCents: session.amount_total ?? 0,
            sourceUrl: `${env.appUrl}/pricing`,
          });
        } catch (err) {
          console.error("[stripe-webhook] Meta Purchase event failed", err);
        }
      }

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
      let pdfSignatures: SignatureLocation[] = [];
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
          pdfSignatures = result.signatures;
          const key = `${filing.id}_unsigned.pdf`;
          await putPdf(key, result.bytes);
          await prisma.filing.update({
            where: { id: filing.id },
            data: {
              generatedPdfKey: key,
              status: "PDF_GENERATED",
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

      // Send the order confirmation email directly — AI compliance check has
      // been removed from the order flow (every package is reviewed by our
      // tax accountant before fax instead). If PDF generation succeeded the
      // email includes the unsigned PDF attachment + signature locations so
      // the customer can sign in-portal immediately. If generation failed
      // (missing required fields) the email goes out without an attachment
      // so the customer at least gets a payment receipt + portal link.
      if (filing.user) {
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
            funnelSource: filing.funnelSource,
            pdfBytes,
            signatures: pdfSignatures,
          });
        } catch (err) {
          console.error("[stripe-webhook] order confirmation email failed", err);
        }
        // Admin notification — fires on every new paid order so the
        // operator sees "new order in queue" in their inbox without
        // having to poll the admin dashboard.
        try {
          await sendNewOrderAdminEmail({
            adminEmail: env.adminEmail,
            customerEmail: filing.user.email,
            llcName: filing.llcName,
            taxYears: filing.taxYears,
            filingId: filing.id,
            adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
            tier,
            amountPaidCents,
            isTestOrder: false,
            pdfGenerated: !!pdfBytes,
          });
        } catch (err) {
          console.error("[stripe-webhook] admin new-order email failed", err);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
