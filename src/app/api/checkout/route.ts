import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { TIERS, FAX_FEE_CENTS, FAX_FEE_LABEL } from "@/lib/pricing";

export async function POST(req: Request) {
  const { filingId, email } = await req.json();
  if (typeof email !== "string" || !email.includes("@"))
    return NextResponse.json({ error: "Email required" }, { status: 400 });

  const filing = await getOwnedFiling(filingId);
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (filing.status !== "DRAFT")
    return NextResponse.json({ error: "Already paid" }, { status: 409 });

  const tier = TIERS[filing.tier as keyof typeof TIERS];
  if (!tier) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

  // Bind the filing to the email before payment so the Stripe webhook can
  // look up the user and email the magic link even if the cookie is lost.
  const user = await bindFilingToEmail(filing.id, email);

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tier.priceCents,
          product_data: {
            name: `Form5472 Prep — ${tier.label}`,
            description: `Filing for ${filing.llcName ?? "your LLC"} — ${filing.taxYears.join(", ")}`,
          },
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: "usd",
          unit_amount: FAX_FEE_CENTS,
          product_data: {
            name: FAX_FEE_LABEL,
            description: "Fax transmission to the IRS Ogden PIN Unit + delivery receipt.",
          },
        },
        quantity: 1,
      },
    ],
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
