import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { MULTI_YEAR_ADDON_CENTS, MULTI_YEAR_ADDON_LABEL, multiYearAddonCents, tierInfo } from "@/lib/pricing";

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
