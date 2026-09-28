import crypto from "node:crypto";
import { env } from "./env";

// HMAC-signed unsubscribe tokens. Long-lived (1 year) since they live in
// the footer of every marketing email and users may click months later.

const configuredSecret = process.env.MAGIC_LINK_SECRET || process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("Unsubscribe tokens require MAGIC_LINK_SECRET or SESSION_SECRET in production");
}
const SECRET =
  configuredSecret ||
  "dev-only-magic-link-secret-please-override-in-production";
const TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

// Constant-time string compare on raw bytes (length-checked first).
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function makeUnsubscribeLink(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}:${expiresAt}`;
  const token = `${payload}.${sign(`unsub:${payload}`)}`;
  return `${env.appUrl}/unsubscribe?t=${encodeURIComponent(token)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  // Keep old email footers working: legacy tokens may still unsubscribe.
  if (!safeEqual(sign(`unsub:${payload}`), sig) && !safeEqual(sign(payload), sig)) return null;
  const parts = payload.split(":");
  if (parts.length !== 2) return null;
  const [userId, expStr] = parts;
  const exp = Number(expStr);
  if (!userId || !Number.isSafeInteger(exp)) return null;
  if (Math.floor(Date.now() / 1000) >= exp) return null;
  return userId;
}
