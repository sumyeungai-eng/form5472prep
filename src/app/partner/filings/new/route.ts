import { NextResponse } from "next/server";
import { getCurrentPartner } from "@/lib/partner/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TIER, totalPriceCents } from "@/lib/pricing";
import { env } from "@/lib/env";

export const runtime = "nodejs";

// Creates a fresh DRAFT filing tagged to the current partner, then redirects
// into the standard wizard. Unlike the customer /filings/new route we do NOT
// reuse an "untouched draft" — a partner files for many different clients, so
// each "New client filing" must be its own row (collapsing onto one draft
// would mix clients). The partner fills entity/owner/years like any filing;
// when it's ready they send the client a sign link from the dashboard.
export async function GET() {
  const partner = await getCurrentPartner();
  if (!partner) {
    return NextResponse.redirect(`${env.appUrl}/partner/sign-in`);
  }

  // Deliberately no sessionId here: partner filings are owned via partnerId
  // alone, never the partner's browser session, so starting a NEW filing
  // later in the same browser (e.g. /start's draft-reuse) can never pick up
  // a client's in-progress draft — getOwnedFiling grants access via partnerId.
  const filing = await prisma.filing.create({
    data: {
      partnerId: partner.id,
      status: "DRAFT",
      tier: DEFAULT_TIER,
      amountPaid: totalPriceCents(DEFAULT_TIER, 0),
      taxYears: [],
      funnelSource: "partner",
    },
  });

  return NextResponse.redirect(`${env.appUrl}/filings/${filing.id}/edit`);
}
