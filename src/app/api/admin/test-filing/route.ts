import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { TEST_TIER_VALUE } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only: creates a DRAFT filing with tier="test" so we can walk through
// the wizard end-to-end without a real payment. /api/checkout detects the
// test tier and bypasses Stripe, then inlines the same post-PAID flow the
// Stripe webhook runs (PDF gen + AI validation + email).
//
// Not whitelisted in /api/filings POST — that endpoint rejects unknown
// tiers via isTier(), so a non-admin can't fabricate a $0 filing.
//
// We attach the admin's session cookie (and user, if signed in) so the
// /filings/[id]/edit wizard's getOwnedFiling() check passes and the admin
// can immediately drop into the wizard from the test-order page.
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();
  const filing = await prisma.filing.create({
    data: {
      status: "DRAFT",
      tier: TEST_TIER_VALUE,
      amountPaid: 0,
      taxYears: [],
      funnelSource: "admin_test",
      sessionId,
      userId: user?.id ?? null,
    },
  });
  return NextResponse.json({ id: filing.id, editUrl: `/filings/${filing.id}/edit` });
}
