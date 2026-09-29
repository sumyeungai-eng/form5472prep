import { NextResponse } from "next/server";
import { applyResendEvent, verifySvixSignature } from "@/lib/resendWebhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resend delivery webhook → EmailLog status (delivered / bounced / complained /
// delivery_delayed). Configure in Resend → Webhooks → Add endpoint:
//   https://www.form5472prep.com/api/resend-webhook   (www — the apex 307s)
// with those four events, then copy the endpoint's signing secret (whsec_...)
// into the Vercel env var RESEND_WEBHOOK_SECRET.
//
// No secret configured → 503 and nothing is touched: an unauthenticated
// endpoint would let anyone mark our audit trail "delivered".
// Middleware never runs on /api/* (see src/middleware.ts matcher), so no
// auth exemption is needed.
export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set — ignoring event");
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const rawBody = await req.text();
  const verified = verifySvixSignature({
    secret,
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signatureHeader: req.headers.get("svix-signature"),
    rawBody,
  });
  if (!verified.ok) {
    console.error(`[resend-webhook] rejected: ${verified.reason}`);
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let evt: unknown;
  try {
    evt = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!evt || typeof evt !== "object") {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const result = await applyResendEvent(evt as Parameters<typeof applyResendEvent>[0]);
  // Unknown email ids (sent before EmailLog existed, or by another app on the
  // same Resend account) are a 200 no-op so Resend doesn't keep retrying.
  return NextResponse.json({ ok: true, ...result });
}
