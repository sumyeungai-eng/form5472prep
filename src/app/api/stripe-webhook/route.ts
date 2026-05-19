import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { sendMagicLinkEmail } from "@/lib/email";

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

      // Email the magic link so they can come back from any device.
      if (filing.user) {
        const link = makeMagicLink(filing.user.id);
        const label = filing.llcName ?? `tax year ${filing.taxYears.join(", ")}`;
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
