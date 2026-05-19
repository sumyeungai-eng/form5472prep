import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { tierForYearCount } from "@/lib/pricing";

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

      // Email the order confirmation (receipt + next steps) and the magic link
      // (so they can come back from any device).
      if (filing.user) {
        const link = makeMagicLink(filing.user.id);
        const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
        const amountPaidCents = session.amount_total ?? 0;
        const tier = tierForYearCount(filing.taxYears.length);

        // Stripe receipt URL — pull from the latest charge on the payment intent.
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
            llcName: filing.llcName,
            taxYears: filing.taxYears,
            tier,
            amountPaidCents,
            portalLink: link,
            receiptUrl,
          });
        } catch (err) {
          console.error("[stripe-webhook] order confirmation email failed", err);
        }
        try {
          await sendMagicLinkEmail(filing.user.email, link, label);
        } catch (err) {
          console.error("[stripe-webhook] magic link email failed", err);
        }
      }

      // Fire-and-forget PDF generation. The detail page also triggers it on demand.
      fetch(`${env.appUrl}/api/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filingId }),
      }).catch(() => undefined);
    }
  }

  return NextResponse.json({ received: true });
}
