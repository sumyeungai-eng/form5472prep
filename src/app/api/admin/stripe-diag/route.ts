import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import { stripe } from "@/lib/stripe";

// One-off diagnostic to inspect Stripe webhook configuration when payments
// succeed but emails don't fire. Remove after the investigation is done.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session");

  const s = stripe();
  const endpoints = await s.webhookEndpoints.list({ limit: 20 });
  const events = await s.events.list({ type: "checkout.session.completed", limit: 5 });

  let session = null;
  if (sessionId) {
    try {
      session = await s.checkout.sessions.retrieve(sessionId);
    } catch (e) {
      session = { error: e instanceof Error ? e.message : "lookup failed" };
    }
  }

  return NextResponse.json({
    webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    webhookSecretPrefix: (process.env.STRIPE_WEBHOOK_SECRET ?? "").slice(0, 8),
    stripeKeyPrefix: (process.env.STRIPE_SECRET_KEY ?? "").slice(0, 8),
    endpoints: endpoints.data.map((ep) => ({
      url: ep.url,
      status: ep.status,
      events: ep.enabled_events,
      secretPrefix: ep.secret?.slice(0, 8) ?? null,
    })),
    recentCheckoutCompletedEvents: events.data.map((ev) => ({
      id: ev.id,
      created: new Date(ev.created * 1000).toISOString(),
      pendingWebhooks: ev.pending_webhooks,
      sessionId: (ev.data.object as { id?: string })?.id,
    })),
    session,
  });
}
