import crypto from "node:crypto";
import { cookies } from "next/headers";

// Simple password gate for the post editor at /admin.
// IMPORTANT: this is NOT a substitute for real auth. The password defaults
// to "111111" per the spec and can be overridden with ADMIN_PASSWORD.
// The cookie is HMAC-signed against ADMIN_SESSION_SECRET (defaults to a
// dev-only constant; set a real secret in production).

const PASSWORD = process.env.ADMIN_PASSWORD || "111111";
const SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "dev-only-secret-please-override-in-production-please-please";
const COOKIE_NAME = "form5472_admin";
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function verifyPassword(input: string): boolean {
  // Constant-time compare to avoid timing oracles.
  const a = Buffer.from(input);
  const b = Buffer.from(PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function makeSessionToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `admin:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (sign(payload) !== sig) return false;
  const [role, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (role !== "admin" || !exp || Number.isNaN(exp)) return false;
  return Math.floor(Date.now() / 1000) < exp;
}

export async function isAdmin(): Promise<boolean> {
  // cookies() is synchronous in Next 14, but the API is being made async in
  // Next 15 — awaiting a non-Promise is harmless, so this is forward-compatible.
  const store = cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: TTL_SECONDS,
};
