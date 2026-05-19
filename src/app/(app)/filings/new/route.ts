import { NextResponse } from "next/server";
import { getOrCreateSessionId, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { TIERS } from "@/lib/pricing";

export const runtime = "nodejs";

// Route handler (not a Page) because Server Components can't set cookies.
// Creates a fresh DRAFT filing, binds it to the browser session, and
// redirects to the wizard. Anonymous customers can start with no auth.
export async function GET() {
  const sessionId = getOrCreateSessionId();
  const user = await getCurrentUser();
  const filing = await prisma.filing.create({
    data: {
      sessionId,
      userId: user?.id ?? null,
      status: "DRAFT",
      tier: "single_year",
      amountPaid: TIERS.single_year.priceCents,
      taxYears: [],
    },
  });
  return NextResponse.redirect(`${env.appUrl}/filings/${filing.id}/edit`);
}
