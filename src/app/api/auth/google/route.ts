import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { getOrCreateSessionId, setUserCookie } from "@/lib/session";
import { findOrCreateDraftFiling } from "@/lib/findOrCreateDraft";
import { ATTR_COOKIE, parseAttributionCookie } from "@/lib/attribution";
import { isTier } from "@/lib/pricing";

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
  // Pre-selected service tier (?tier=standard | ?tier=express on the /start
  // URL, set by the /pricing card CTAs). Only persisted on intent="start"
  // since signin doesn't create a filing here.
  //
  // Checked with isTier() — the pricing module's own tier list — so adding or
  // renaming a tier can never leave a stale copy of the names behind in this
  // route and silently downgrade the customer to DEFAULT_TIER.
  const rawTier = typeof body?.tier === "string" ? body.tier.toLowerCase().trim() : null;
  const tier = isTier(rawTier) ? rawTier : null;
  const marketingConsent = body?.marketingConsent === true;
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
    // First-touch channel from the `f5472_attr` cookie (set by middleware on
    // the visitor's first page view). Parsing never throws — a malformed
    // cookie yields all-nulls so sign-in can't break on bad attribution.
    const attribution = parseAttributionCookie(cookies().get(ATTR_COOKIE)?.value);
    const created = await findOrCreateDraftFiling({
      sessionId,
      userId: user.id,
      funnelSource,
      tier: tier ?? undefined,
      marketingConsent,
      attribution,
    });
    filing = created.filing;
  }

  if (filing && intent === "start" && marketingConsent && !filing.marketingConsent) {
    filing = await prisma.filing.update({
      where: { id: filing.id },
      data: { marketingConsent: true },
    });
  }

  return NextResponse.json({ filingId: filing?.id ?? null, email });
}
