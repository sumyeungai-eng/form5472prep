import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma"
import {
  ADMIN_SESSION_TTL_SECONDS,
  makeAdminSessionToken,
  verifyAdminSessionToken,
  verifyDeviceToken,
} from "@/lib/admin/identity"

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

function legacyCookieValid(req?: Request): boolean {
  if (!adminConfigOk()) return false;
  return verifyToken(cookieValue(req, COOKIE_NAME));
}

export async function isAdmin(): Promise<boolean> {
  // cookies() is synchronous in Next 14, but the API is being made async in
  // Next 15 — awaiting a non-Promise is harmless, so this is forward-compatible.
  if (legacyCookieValid()) return true;

  try {
    const principal = await getAdminPrincipal();
    return principal !== null;
  } catch (error) {
    console.error("[admin/auth] Failed to resolve admin principal:", error);
    return false;
  }
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: TTL_SECONDS,
};

const ADMIN_SESSION_COOKIE_NAME = "form5472_admin_session"

export const ADMIN_SESSION_COOKIE = {
  name: ADMIN_SESSION_COOKIE_NAME,
  maxAge: ADMIN_SESSION_TTL_SECONDS,
}

export function setAdminSessionCookie(adminId: string): void {
  cookies().set({
    name: ADMIN_SESSION_COOKIE.name,
    value: makeAdminSessionToken(adminId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_COOKIE.maxAge,
  })
}

export function clearAdminSessionCookie(): void {
  cookies().set({
    name: ADMIN_SESSION_COOKIE.name,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export type AdminPrincipal = {
  adminId: string | null
  email: string | null
  via: "cookie" | "bearer" | "legacy-password"
}

function requestCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.get("cookie")
  if (!cookieHeader) return undefined

  for (const cookie of cookieHeader.split(";")) {
    const separator = cookie.indexOf("=")
    if (separator === -1) continue
    if (cookie.slice(0, separator).trim() !== name) continue
    const value = cookie.slice(separator + 1).trim()
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  }

  return undefined
}

function cookieValue(req: Request | undefined, name: string): string | undefined {
  if (req) return requestCookie(req, name)
  return cookies().get(name)?.value
}

async function findActiveAdmin(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { email: true, active: true },
  })
  if (!admin?.active) return null
  return admin
}

export async function getAdminPrincipal(req?: Request): Promise<AdminPrincipal | null> {
  const authorization = req?.headers.get("authorization")
  const bearerMatch = authorization?.match(/^Bearer\s+(.+)$/i)

  if (bearerMatch) {
    const adminId = await verifyDeviceToken(bearerMatch[1].trim())
    if (adminId) {
      const admin = await findActiveAdmin(adminId)
      if (admin) return { adminId, email: admin.email, via: "bearer" }
    }
  }

  const sessionToken = cookieValue(req, ADMIN_SESSION_COOKIE_NAME)
  if (sessionToken) {
    const adminId = verifyAdminSessionToken(sessionToken)
    if (adminId) {
      const admin = await findActiveAdmin(adminId)
      if (admin) return { adminId, email: admin.email, via: "cookie" }
    }
  }

  const legacyAuthenticated = legacyCookieValid(req)

  if (legacyAuthenticated) {
    return { adminId: null, email: null, via: "legacy-password" }
  }

  return null
}

export async function requireAdmin(req?: Request): Promise<AdminPrincipal> {
  const principal = await getAdminPrincipal(req)
  if (!principal) throw new Error("Admin authentication required")
  return principal
}
