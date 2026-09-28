import crypto from "node:crypto";
import { env } from "./env";

// Magic-link tokens for emailing customers an access link. These remain reusable
// until expiry; single-use consumption requires persistent server-side state.
// Separate from the session cookie (which is per-browser).

const configuredSecret = process.env.MAGIC_LINK_SECRET || process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("Magic-link tokens require MAGIC_LINK_SECRET or SESSION_SECRET in production");
}
const SECRET =
  configuredSecret ||
  "dev-only-magic-link-secret-please-override-in-production";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days to click the link

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

// Constant-time signature comparison (length-checked first). Magic-link tokens
// grant portal access to taxpayer data, so avoid the `!==` early-exit timing leak.
function sigEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function makeMagicLink(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${userId}:${expiresAt}`;
  const token = `${payload}.${sign(`login:${payload}`)}`;
  return `${env.appUrl}/auth/${encodeURIComponent(token)}`;
}

export function verifyMagicLinkToken(token: string): string | null {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const parts = payload.split(":");
  if (parts.length !== 2) return null;
  const [userId, expStr] = parts;
  const exp = Number(expStr);
  const now = Math.floor(Date.now() / 1000);
  if (!userId || !Number.isSafeInteger(exp) || now >= exp) return null;
  if (!sigEqual(sign(`login:${payload}`), sig)) {
    // 2026-09-29 transition: delete this legacy branch after 2026-10-07.
    // Legacy login links last 7 days; year-long unsubscribe links must never
    // grant access. Allow one hour of clock skew for existing login links.
    if (exp > now + TTL_SECONDS + 60 * 60 || !sigEqual(sign(payload), sig)) return null;
  }
  return userId;
}
