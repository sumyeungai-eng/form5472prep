import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

// Three identities can exist for a request:
//
//   1. Anonymous browser session — cookie `fs_session` holds a random ID.
//      The current draft Filing.sessionId matches it. Lets the wizard
//      persist across page refreshes before they enter an email.
//
//   2. Magic-link-authenticated user — cookie `fs_user` holds a signed
//      `{userId, expiresAt}` token. Issued when the user clicks the magic
//      link we email them after payment.
//
//   3. Admin — separate cookie (`form5472_admin`), see /lib/admin/auth.
//
// Anonymous filings get bound to a User row once the user enters an email
// at the Review step. The cookie identity stays anonymous until they later
// click a magic link (typically after payment).

const SESSION_COOKIE = "fs_session";
const USER_COOKIE = "fs_user";
const USER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

const SECRET =
  process.env.SESSION_SECRET ||
  "dev-only-session-secret-please-override-in-production-with-openssl-rand";

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
}

// Constant-time comparison of two signatures (length-checked first). These
// cookies authorize access to taxpayer data, so avoid the early-exit timing
// leak of a plain `!==` string compare.
function sigEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// ---- Anonymous browser session ----

export function getOrCreateSessionId(): string {
  const store = cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) return existing;
  const fresh = crypto.randomBytes(16).toString("base64url");
  store.set({
    name: SESSION_COOKIE,
    value: fresh,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return fresh;
}

export function getSessionId(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

// ---- Magic-link-issued user identity ----

export function makeUserToken(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + USER_TTL_SECONDS;
  const payload = `${userId}:${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyUserToken(token: string | undefined): string | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  if (!sigEqual(sign(payload), sig)) return null;
  const [userId, expStr] = payload.split(":");
  const exp = Number(expStr);
  if (!userId || !exp || Number.isNaN(exp)) return null;
  if (Math.floor(Date.now() / 1000) >= exp) return null;
  return userId;
}

export function setUserCookie(userId: string) {
  cookies().set({
    name: USER_COOKIE,
    value: makeUserToken(userId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: USER_TTL_SECONDS,
  });
}

export function clearUserCookie() {
  cookies().set({ name: USER_COOKIE, value: "", path: "/", maxAge: 0 });
}

export async function getCurrentUser() {
  const userId = verifyUserToken(cookies().get(USER_COOKIE)?.value);
  if (!userId) return null;
  try {
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch (err) {
    // DB down? Don't blow up the marketing layout — render as logged-out.
    console.warn("[session] DB lookup failed in getCurrentUser:", err);
    return null;
  }
}

// Cheap, DB-free "is there a valid signed session?" check. Verifies only the
// cookie's HMAC signature and expiry — no database round-trip. Used by the
// /api/me endpoint that the client header island polls, so the marketing
// layout can be fully static (edge-cached) instead of force-dynamic.
export function hasValidSession(): boolean {
  return !!verifyUserToken(cookies().get(USER_COOKIE)?.value);
}

// Redirects to home when not signed in. Use on /dashboard etc.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/?signin=required");
  return user;
}

// ---- Filing access helpers ----

// Returns the filing IF it belongs either to the current anonymous session
// (sessionId match) OR to the signed-in user (userId match). Null otherwise.
export async function getOwnedFiling(filingId: string) {
  const user = await getCurrentUser();
  const sessionId = getSessionId();

  return prisma.filing.findFirst({
    where: {
      id: filingId,
      OR: [
        user ? { userId: user.id } : { id: "__never__" },
        sessionId ? { sessionId } : { id: "__never__" },
      ],
    },
  });
}

// Distinguishes "filing doesn't exist" from "filing exists but is owned by
// someone else." Returns "owned" with the filing, "locked" if it exists but the
// current visitor can't access it (typically: anonymous session cookie expired
// or different browser, and the filing is bound to a user account), or
// "not_found" if the ID doesn't exist at all.
export async function getFilingAccess(filingId: string): Promise<
  | { kind: "owned"; filing: { id: string; status: string } }
  | { kind: "locked"; ownerEmail: string | null }
  | { kind: "not_found" }
> {
  const owned = await getOwnedFiling(filingId);
  if (owned) return { kind: "owned", filing: { id: owned.id, status: owned.status } };

  const exists = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { id: true, user: { select: { email: true } } },
  });
  if (!exists) return { kind: "not_found" };
  return { kind: "locked", ownerEmail: exists.user?.email ?? null };
}

// Upgrade an anonymous draft Filing to be owned by a real (email-bound) User.
// Idempotent: if the filing is already bound, just updates the email.
// We DO NOT clear sessionId here — the browser may not have a fs_user cookie
// yet (they only get one by clicking the magic-link we email after payment),
// so dropping sessionId would lock them out of their own draft. Both
// identities can co-exist on the row; the magic-link flow takes over later.
export async function bindFilingToEmail(filingId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });
  await prisma.filing.update({
    where: { id: filingId },
    data: { userId: user.id },
  });
  return user;
}
