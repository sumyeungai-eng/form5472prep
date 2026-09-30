import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getCurrentPartner } from "./partner/auth";
import { INVITE_COOKIE, parseInviteCookie, type InviteScope } from "./filingInvite";

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
// DB-free user id from the signed cookie, for hot paths that only need the
// identifier (the page-view beacon runs on every navigation and must not
// spend a database round-trip to learn who is browsing).
export function getCurrentUserId(): string | null {
  return verifyUserToken(cookies().get(USER_COOKIE)?.value) ?? null;
}

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

// Filing.sessionId IS the value of this browser's fs_session cookie, and
// getSessionId() trusts that cookie verbatim — so the column is a bearer
// credential. It must never reach a browser: every filing row sent to the
// client (API JSON, client-component props) goes through this. An explicit
// omission rather than a field allowlist because the wizard consumes ~80
// columns and sessionId is the only credential among them (userId/partnerId
// are identifiers; the fs_user cookie is HMAC-signed, not the raw id).
export function toClientFiling<T extends { sessionId?: unknown }>(filing: T): Omit<T, "sessionId"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sessionId, ...rest } = filing;
  return rest;
}

// The identities this request presents, as filing filters. Shared by the
// access check and the write-time re-checks below so they cannot drift.
function requestScope(userId: string | null, sessionId: string | undefined): Prisma.FilingWhereInput[] {
  const scope: Prisma.FilingWhereInput[] = [];
  if (userId) scope.push({ userId });
  if (sessionId) scope.push({ sessionId });
  return scope.length > 0 ? scope : [{ id: "__never__" }];
}

// "Nobody but this browser (or nobody at all) holds it anonymously."
function notHeldElsewhere(sessionId: string | undefined): Prisma.FilingWhereInput {
  return { OR: sessionId ? [{ sessionId: null }, { sessionId }] : [{ sessionId: null }] };
}

const MAX_TAKEOVER_ATTEMPTS = 3;

export function hasFilingInviteAccess(filingId: string, scope: InviteScope): boolean {
  const raw = cookies().get(INVITE_COOKIE)?.value;
  const invite = parseInviteCookie(raw);
  return invite?.filingId === filingId && invite.scope === scope;
}

// Returns the filing IF it belongs either to the current anonymous session
// (sessionId match), the signed-in user (userId match), OR the signed-in
// PARTNER who created it (partnerId match — a partner owns every filing they
// create for a client, independent of which browser/session created it).
// Null otherwise.
export async function getOwnedFiling(
  filingId: string,
  // Invite-cookie access is opt-in. The edit page should pass "edit"; the
  // sign page and sign API should pass "sign". Existing callers omit this
  // parameter and receive no invite-cookie access grant.
  inviteScope?: InviteScope,
) {
  const user = await getCurrentUser();
  const sessionId = getSessionId();
  const partner = await getCurrentPartner();
  const inviteMatches = inviteScope ? hasFilingInviteAccess(filingId, inviteScope) : false;

  const scope = requestScope(user?.id ?? null, sessionId);
  if (partner) scope.push({ partnerId: partner.id });
  if (inviteMatches) scope.push({ id: filingId });

  for (let attempt = 0; attempt < MAX_TAKEOVER_ATTEMPTS; attempt++) {
    const filing = await prisma.filing.findFirst({
      where: { id: filingId, OR: scope },
      include: { yearData: true },
    });
    if (!filing) return null;

    // Independent legitimate grants survive takeover. But a foreign anonymous
    // cookie is not evidence of partner/invite authority: drop it before any
    // verified holder sees or edits the filing, just as for the account owner.
    const verifiedHolder = (user && filing.userId === user.id) ||
      (partner && filing.partnerId === partner.id) || inviteMatches;
    if (!verifiedHolder || !filing.sessionId || filing.sessionId === sessionId) return filing;

    // Compare-and-set, then RE-READ even if count=0 (the holder may have rebound
    // the filing between queries). Never return the pre-takeover snapshot.
    await prisma.filing.updateMany({
      where: { id: filing.id, userId: filing.userId, partnerId: filing.partnerId, sessionId: filing.sessionId },
      data: { sessionId: null },
    });
  }
  return null;
}

// Account-wide takeover, for views that show the account's filings together
// (dashboard, GET /api/filings): drop every anonymous hold another browser
// has on this account's filings, then return the filter that lists only
// filings no other browser holds — so a filing bound to the account by
// someone else in the instant between the two queries is simply not listed
// until the next view, rather than listed while that browser can read it.
export async function claimAccountFilings(userId: string): Promise<Prisma.FilingWhereInput> {
  const sessionId = getSessionId();
  await prisma.filing.updateMany({
    where: {
      userId,
      AND: [{ sessionId: { not: null } }, ...(sessionId ? [{ sessionId: { not: sessionId } }] : [])],
    },
    data: { sessionId: null },
  });
  return { userId, ...notHeldElsewhere(sessionId) };
}

// Returns the current signed-in partner IF they created this filing
// (filing.partnerId === partner.id), else null. Used by the client-facing
// filing pages to render the "Partner filing" bar — distinct from
// getOwnedFiling's access grant, since a partner owning a filing is not
// itself permission to sign it (the sign route and sign page each check
// this and additionally require the signed-in client user). Never throws
// when there is no partner cookie present.
export async function partnerOwnsFiling(
  filingId: string,
): Promise<{ id: string; name: string; company: string | null } | null> {
  const partner = await getCurrentPartner();
  if (!partner) return null;

  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { partnerId: true },
  });
  if (!filing || filing.partnerId !== partner.id) return null;

  return { id: partner.id, name: partner.name, company: partner.company };
}

export async function getOwnedEinApplication(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.einApplication.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      userId: true,
      fullName: true,
      email: true,
      llcName: true,
      status: true,
    },
  });
}

export async function getOwnedItinApplication(id: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  return prisma.itinApplication.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      userId: true,
      fullName: true,
      email: true,
      status: true,
    },
  });
}

// Distinguishes "filing doesn't exist" from "filing exists but is owned by
// someone else." Returns "owned" with the filing, "locked" if it exists but the
// current visitor can't access it (typically: anonymous session cookie expired
// or different browser, and the filing is bound to a user account), or
// "not_found" if the ID doesn't exist at all.
export async function getFilingAccess(
  filingId: string,
  // Invite-cookie access is opt-in. The edit page should pass "edit"; the
  // sign page should pass "sign". Existing callers omit this parameter and
  // receive no invite-cookie access grant.
  inviteScope?: InviteScope,
): Promise<
  | { kind: "owned"; filing: { id: string; status: string } }
  | { kind: "locked"; ownerEmail: string | null }
  | { kind: "not_found" }
> {
  const owned = await getOwnedFiling(filingId, inviteScope);
  if (owned) return { kind: "owned", filing: { id: owned.id, status: owned.status } };

  const exists = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { id: true, user: { select: { email: true } } },
  });
  if (!exists) return { kind: "not_found" };
  return { kind: "locked", ownerEmail: exists.user?.email ?? null };
}

// Thrown by bindFilingToEmail when the caller no longer holds the filing at
// the moment of the write. Routes map it to 404, same as "not yours".
export class FilingAccessLostError extends Error {
  constructor(filingId: string) {
    super(`caller no longer holds filing ${filingId}`);
    this.name = "FilingAccessLostError";
  }
}

// Upgrade an anonymous draft Filing to be owned by a real (email-bound) User.
// Idempotent: if the filing is already bound, just updates the email.
// We DO NOT clear sessionId here — the browser may not have a fs_user cookie
// yet (they only get one by clicking the magic-link we email after payment),
// so dropping sessionId would lock them out of their own draft. Both
// identities can co-exist on the row until the account owner opens it from
// another browser — then getOwnedFiling drops the anonymous hold.
//
// UNVERIFIED: the caller has not proven they control `email`. Nothing may
// treat the resulting filing.userId as proof that the requester IS that user —
// compare against getCurrentUser() instead (see the sign page's prior-signature
// guard and findOrCreateDraftFiling's reuse rule).
//
// Write-time authority: callers authorise first (getOwnedFiling, or the
// partner route's partnerId check), but a request can sit between that check
// and this write — e.g. a slowly-sent body — while the owner takes the filing
// over. So the link is written ONLY if the caller still holds the filing now:
// same identities as getOwnedFiling (this user / this browser), plus the
// signed-in partner that owns it. Otherwise FilingAccessLostError, and nothing
// is changed — a stale request can never re-link a filing out from under the
// owner who just took it over.
export async function bindFilingToEmail(filingId: string, email: string, inviteScope?: InviteScope) {
  const normalized = email.trim().toLowerCase();
  const [currentUser, partner] = await Promise.all([getCurrentUser(), getCurrentPartner()]);
  const scope = requestScope(currentUser?.id ?? null, getSessionId());
  if (partner) scope.push({ partnerId: partner.id });

  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });
  if (inviteScope && hasFilingInviteAccess(filingId, inviteScope)) scope.push({ id: filingId });
  const { count } = await prisma.filing.updateMany({
    where: { id: filingId, OR: scope },
    data: { userId: user.id },
  });
  if (count === 0) throw new FilingAccessLostError(filingId);
  return user;
}
