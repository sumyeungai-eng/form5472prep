import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

// Partner (reseller/agency) authentication. Mirrors the customer magic-link
// model in src/lib/session.ts + src/lib/magicLink.ts, but for the separate
// Partner table and a distinct cookie (`fs_partner`).
//
// Flow:
//   1. Partner enters their email at /partner/sign-in.
//   2. If an ACTIVE Partner row exists for that email, we email a signed
//      login link to /partner/auth/{token} (silent no-op for unknown/inactive
//      emails — no account enumeration).
//   3. The link sets the `fs_partner` cookie; the partner dashboard reads it.
//
// There is no public partner signup — admins create Partner rows in /admin.

const PARTNER_COOKIE = "fs_partner";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days logged in
const LINK_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days to click the login link

const SECRET =
  process.env.PARTNER_SESSION_SECRET ||
  process.env.SESSION_SECRET ||
  "dev-only-partner-secret-please-override-in-production";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

// Constant-time signature comparison (length-checked first) — these tokens
// grant access to clients' taxpayer data.
function sigEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ---- Login link (emailed, one-shot-ish, 7-day TTL) ----

export function makePartnerLoginLink(partnerId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  const payload = `${partnerId}:${expiresAt}`;
  const token = `${payload}.${sign(payload)}`;
  return `${env.appUrl}/partner/auth/${encodeURIComponent(token)}`;
}

export function verifyPartnerLoginToken(token: string): string | null {
  return verifyToken(token);
}

// ---- Session cookie (set after the login link is clicked) ----

export function makePartnerSessionToken(partnerId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${partnerId}:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): string | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!sigEqual(sign(payload), sig)) return null;
  const [partnerId, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!partnerId || !exp || Number.isNaN(exp)) return null;
  if (Math.floor(Date.now() / 1000) >= exp) return null;
  return partnerId;
}

export const PARTNER_COOKIE_NAME = PARTNER_COOKIE;
export const PARTNER_SESSION_TTL_SECONDS = SESSION_TTL_SECONDS;

export function clearPartnerCookie() {
  cookies().set({ name: PARTNER_COOKIE, value: "", path: "/", maxAge: 0 });
}

// Returns the active Partner for the current request, or null. Deactivated
// partners (active=false) are treated as logged out so admins can revoke
// access immediately.
export async function getCurrentPartner() {
  const partnerId = verifyToken(cookies().get(PARTNER_COOKIE)?.value);
  if (!partnerId) return null;
  try {
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner || !partner.active) return null;
    return partner;
  } catch (err) {
    console.warn("[partner/auth] DB lookup failed in getCurrentPartner:", err);
    return null;
  }
}

// Redirects to the partner sign-in page when not authenticated. Use on
// /partner/* protected pages.
export async function requirePartner() {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/partner/sign-in");
  return partner;
}
