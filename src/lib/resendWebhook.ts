// Resend delivery webhooks → EmailLog. Resend signs webhooks with Svix
// ("standard webhooks"): HMAC-SHA256 over `${svix-id}.${svix-timestamp}.${body}`
// keyed with the base64-decoded part of the `whsec_...` signing secret; the
// `svix-signature` header carries one or more space-separated `v1,<base64>`
// signatures (several during secret rotation). Implemented with node:crypto
// so no Svix dependency is needed.

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export const SVIX_TOLERANCE_SECS = 5 * 60;

export type SvixVerifyInput = {
  secret: string;
  id: string | null;
  timestamp: string | null;
  signatureHeader: string | null;
  rawBody: string;
  nowSecs?: number;
};

export type SvixVerifyResult = { ok: true } | { ok: false; reason: string };

export function verifySvixSignature(input: SvixVerifyInput): SvixVerifyResult {
  const { secret, id, timestamp, signatureHeader, rawBody } = input;
  if (!id || !timestamp || !signatureHeader) return { ok: false, reason: "missing svix headers" };
  if (!/^\d+$/.test(timestamp)) return { ok: false, reason: "bad timestamp" };
  const ts = Number(timestamp);
  const now = input.nowSecs ?? Math.floor(Date.now() / 1000);
  // Replay guard: reject stale (and implausibly future) timestamps.
  if (Math.abs(now - ts) > SVIX_TOLERANCE_SECS) return { ok: false, reason: "timestamp outside tolerance" };

  const keyB64 = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  const key = Buffer.from(keyB64, "base64");
  if (key.length === 0) return { ok: false, reason: "invalid secret" };
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();

  for (const part of signatureHeader.split(" ")) {
    const comma = part.indexOf(",");
    if (comma === -1) continue;
    const version = part.slice(0, comma);
    const sigB64 = part.slice(comma + 1);
    if (version !== "v1" || !sigB64) continue;
    const given = Buffer.from(sigB64, "base64");
    if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) {
      return { ok: true };
    }
  }
  return { ok: false, reason: "no matching signature" };
}

// Resend event type → EmailLog.status.
const EVENT_STATUS: Record<string, string> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.delivery_delayed": "delivery_delayed",
};

// Events can arrive out of order (a delivery_delayed retried after the
// delivered event, say). A status may only move to one of equal or higher
// rank: delivery_delayed never overwrites delivered, and delivered never
// overwrites a bounce/complaint.
const RANK: Record<string, number> = {
  sent: 0,
  failed: 0,
  delivery_delayed: 1,
  delivered: 2,
  bounced: 3,
  complained: 3,
};

function statusesAtOrBelow(status: string): string[] {
  const rank = RANK[status];
  return Object.keys(RANK).filter((s) => RANK[s] <= rank);
}

type ResendEvent = {
  type?: unknown;
  created_at?: unknown;
  data?: {
    email_id?: unknown;
    bounce?: { message?: unknown; type?: unknown; subType?: unknown } | null;
  } | null;
};

function bounceReason(evt: ResendEvent): string | null {
  const b = evt.data?.bounce;
  if (!b || typeof b !== "object") return "bounced";
  const parts = [b.type, b.subType, b.message].filter((p): p is string => typeof p === "string" && p.trim() !== "");
  return parts.length ? parts.join(" — ").slice(0, 2000) : "bounced";
}

export type ApplyResult =
  | { applied: true; status: string }
  | { applied: false; reason: "ignored_event" | "missing_email_id" | "unknown_or_stale" };

export async function applyResendEvent(evt: ResendEvent): Promise<ApplyResult> {
  const type = typeof evt.type === "string" ? evt.type : "";
  const status = EVENT_STATUS[type];
  if (!status) return { applied: false, reason: "ignored_event" };
  const emailId = typeof evt.data?.email_id === "string" ? evt.data.email_id : "";
  if (!emailId) return { applied: false, reason: "missing_email_id" };

  const at = typeof evt.created_at === "string" && !Number.isNaN(Date.parse(evt.created_at))
    ? new Date(evt.created_at)
    : new Date();
  const data: { status: string; lastEventAt: Date; error?: string | null } = { status, lastEventAt: at };
  if (status === "bounced") data.error = bounceReason(evt);
  if (status === "complained") data.error = "recipient marked the email as spam";

  const updated = await prisma.emailLog.updateMany({
    where: { resendId: emailId, status: { in: statusesAtOrBelow(status) } },
    data,
  });
  if (updated.count === 0) return { applied: false, reason: "unknown_or_stale" };
  return { applied: true, status };
}
