import crypto from "node:crypto";
import { env } from "./env";

// HMAC-signed unsubscribe tokens. Long-lived (1 year) since they live in
// the footer of every marketing email and users may click months later.

const SECRET =
  process.env.MAGIC_LINK_SECRET ||
  process.env.SESSION_SECRET ||
  "dev-only-magic-link-secret-please-override-in-production";
const TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function makeUnsubscribeLink(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}:${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  return `${env.appUrl}/unsubscribe?t=${encodeURIComponent(token)}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (sign(payload) !== sig) return null;
  const [userId, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!userId || !exp || Number.isNaN(exp)) return null;
  if (Math.floor(Date.now() / 1000) >= exp) return null;
  return userId;
}
