import { NextResponse } from "next/server";
import { getOwnedFiling, bindFilingToEmail } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { MULTI_YEAR_ADDON_CENTS, MULTI_YEAR_ADDON_LABEL, multiYearAddonCents, tierInfo, isTestTier } from "@/lib/pricing";

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
  // Skip Stripe entirely. Mark the filing PAID immediately and fire the same
  // internal validate-filing endpoint the Stripe webhook would, so the post-
  // payment flow (PDF gen + AI compliance check + emails) runs end-to-end.
  // Only reachable when an admin created the filing via /api/admin/test-filing
  // (the public /api/filings POST whitelist rejects "test" via isTier).
  if (isTestTier(filing.tier)) {
    await prisma.filing.update({
      where: { id: filing.id },
      data: {
        status: "PAID",
        stripePaymentId: "test_no_payment",
      },
    });
    // Fire validate-filing endpoint async. It generates the PDF, runs the
    // AI check, and emails the customer the order-confirmation with sign
    // link — same as the production webhook path.
    const internalSecret = process.env.INTERNAL_API_SECRET;
    if (internalSecret) {
      fetch(`${env.appUrl}/api/internal/validate-filing/${filing.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${internalSecret}` },
      }).catch((err) => console.error("[checkout test] validate trigger failed", err));
    } else {
      console.warn("[checkout test] INTERNAL_API_SECRET not set; skipping validate fire");
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
