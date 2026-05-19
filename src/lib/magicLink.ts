import crypto from "node:crypto";
import { env } from "./env";

// One-shot magic-link tokens for emailing customers an access link.
// Separate from the session cookie (which is per-browser).

const SECRET =
  process.env.MAGIC_LINK_SECRET ||
  process.env.SESSION_SECRET ||
  "dev-only-magic-link-secret-please-override-in-production";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days to click the link

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function makeMagicLink(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}:${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  return `${env.appUrl}/auth/${encodeURIComponent(token)}`;
}

export function verifyMagicLinkToken(token: string): string | null {
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
