import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId, setUserCookie } from "@/lib/session";
import { TIERS } from "@/lib/pricing";

export const runtime = "nodejs";

// Verifies a Google Identity Services credential (a JWT issued by Google),
// upserts the corresponding User row, sets our session cookie, and either
// returns an existing in-progress DRAFT filing or creates a fresh one.
export async function POST(req: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google sign-in isn't configured on this server. Set NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID." },
      { status: 503 },
    );
  }

  const { credential } = await req.json().catch(() => ({}));
  if (typeof credential !== "string" || !credential) {
    return NextResponse.json({ error: "Google credential required" }, { status: 400 });
  }

  // Verify the JWT was signed by Google and is for our app.
  const client = new OAuth2Client();
  let payload: { email?: string | null; name?: string | null } | undefined;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    payload = ticket.getPayload() ?? undefined;
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid Google token: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 401 },
    );
  }

  const email = payload?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Google account has no email" }, { status: 400 });
  }

  // Upsert the user, set the long-lived session cookie ("sign them in").
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });
  setUserCookie(user.id);

  // If they already have a DRAFT filing, resume it. Otherwise create a fresh one.
  let filing = await prisma.filing.findFirst({
    where: { userId: user.id, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });
  if (!filing) {
    const sessionId = getOrCreateSessionId();
    filing = await prisma.filing.create({
      data: {
        userId: user.id,
        sessionId,
        status: "DRAFT",
        tier: "single_year",
        amountPaid: TIERS.single_year.priceCents,
        taxYears: [],
      },
    });
  }

  return NextResponse.json({ filingId: filing.id, email });
}
