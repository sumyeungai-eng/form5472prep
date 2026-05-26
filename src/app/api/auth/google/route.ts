import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId, setUserCookie } from "@/lib/session";
import { findOrCreateDraftFiling } from "@/lib/findOrCreateDraft";

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

  const body = await req.json().catch(() => ({}));
  const credential = body?.credential;
  // "start" = user is on /start or /file (wants to begin a filing), so
  // ensure they have a DRAFT to drop into. Anything else (default) = just
  // authenticate. Previously this endpoint always auto-created a DRAFT,
  // which meant signing in from /sign-in or a magic-link-expired page
  // produced spurious empty "Unnamed filing" rows on every login.
  const intent: "start" | "signin" = body?.intent === "start" ? "start" : "signin";
  // Sales attribution — the source landing page slug that sent the visitor
  // here, captured by StartForm from ?src= on the URL. Sanitized to
  // slug-safe characters so a tampered request body can't inject anything.
  // Only persisted when intent === "start" since signins don't create filings.
  const rawSource = typeof body?.funnelSource === "string" ? body.funnelSource : null;
  const funnelSource = rawSource
    ? rawSource.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80) || null
    : null;
  // Pre-selected service tier (?tier= on the /start URL, set by the
  // /pricing card CTAs). Only persisted on intent="start" since signin
  // doesn't create a filing here.
  const rawTier = typeof body?.tier === "string" ? body.tier.toLowerCase().trim() : null;
  const tier = rawTier === "standard" ? rawTier : null;
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

  // For signin intent: just look for an existing DRAFT (don't create one).
  // Frontend redirects to /dashboard regardless of whether filingId comes back.
  // For start intent: ensure a DRAFT exists so the wizard has something to load.
  let filing = await prisma.filing.findFirst({
    where: { userId: user.id, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });
  if (!filing && intent === "start") {
    const sessionId = getOrCreateSessionId();
    const created = await findOrCreateDraftFiling({
      sessionId,
      userId: user.id,
      funnelSource,
      tier: tier ?? undefined,
    });
    filing = created.filing;
  }

  return NextResponse.json({ filingId: filing?.id ?? null, email });
}
