import crypto from "node:crypto";
import { cookies } from "next/headers";

// Password gate for /admin (taxpayer data, PDF regen, fax submission).
//
// SECURITY — fail closed in production. In dev we allow the legacy "111111" /
// dev-secret defaults so local work isn't blocked. In production
// (NODE_ENV === "production") we REQUIRE ADMIN_PASSWORD and
// ADMIN_SESSION_SECRET to be set to non-default values; if either is missing
// or still the default, every auth check fails rather than silently exposing
// the admin surface with guessable credentials.

const IS_PROD = process.env.NODE_ENV === "production";
const DEV_PASSWORD = "111111";
const DEV_SECRET = "dev-only-secret-please-override-in-production-please-please";

const PASSWORD = process.env.ADMIN_PASSWORD || DEV_PASSWORD;
const SECRET = process.env.ADMIN_SESSION_SECRET || DEV_SECRET;
const COOKIE_NAME = "form5472_admin";
const TTL_SECONDS = 60 * 60 * 12; // 12 hours

// True when the admin gate is safe to use. In prod, defaults are forbidden.
function adminConfigOk(): boolean {
  if (!IS_PROD) return true;
  const passwordOk = !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD !== DEV_PASSWORD;
  const secretOk = !!process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET !== DEV_SECRET;
  if (!passwordOk || !secretOk) {
    console.error(
      "[admin/auth] FAIL CLOSED: ADMIN_PASSWORD and/or ADMIN_SESSION_SECRET is missing or still the default in production. Admin access is disabled until both are set to real values.",
    );
    return false;
  }
  return true;
}

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

export function verifyPassword(input: string): boolean {
  if (!adminConfigOk()) return false;
  return safeEqual(input, PASSWORD);
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
  // Constant-time signature comparison — these cookies authorize admin access
  // to taxpayer data, so avoid the early-exit timing leak of `!==`.
  if (!safeEqual(sign(payload), sig)) return false;
  const [role, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (role !== "admin" || !exp || Number.isNaN(exp)) return false;
  return Math.floor(Date.now() / 1000) < exp;
}

export async function isAdmin(): Promise<boolean> {
  // Fail closed if admin credentials aren't properly configured in prod.
  if (!adminConfigOk()) return false;
  // cookies() is synchronous in Next 14, but the API is being made async in
  // Next 15 — awaiting a non-Promise is harmless, so this is forward-compatible.
  const store = cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: TTL_SECONDS,
};
