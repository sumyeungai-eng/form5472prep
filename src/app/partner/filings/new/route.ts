import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
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

  // A session cookie still anchors the draft to this browser so the partner
  // can edit it in the shared wizard (getOwnedFiling matches on sessionId).
  const sessionId = getOrCreateSessionId();

  const filing = await prisma.filing.create({
    data: {
      sessionId,
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
