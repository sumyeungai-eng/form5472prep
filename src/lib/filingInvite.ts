import crypto from "node:crypto";
import { env } from "./env";
import { prisma } from "./prisma";

export type InviteScope = "edit" | "sign";
export const INVITE_TTL_DAYS = 14;
export const INVITE_COOKIE = "fs_invite";

const SECRET_FALLBACK = "dev-only-session-secret-please-override-in-production-with-openssl-rand";

function inviteSecret(): string {
  return process.env.SESSION_SECRET || SECRET_FALLBACK;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", inviteSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function isInviteScope(v: unknown): v is InviteScope {
  return v === "edit" || v === "sign";
}

export function hashInviteToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function inviteCookieValue(filingId: string, scope: InviteScope, expiresAt: Date): string {
  const expiresMs = expiresAt.getTime();
  const payload = `${filingId}.${scope}.${expiresMs}`;
  return `${payload}.${sign(payload)}`;
}

export function parseInviteCookie(
  raw: string | undefined,
  now: Date = new Date(),
): { filingId: string; scope: InviteScope } | null {
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 4) return null;

  const [filingId, scope, expiresMsRaw, sig] = parts;
  if (!filingId || !isInviteScope(scope) || !expiresMsRaw || !sig) return null;

  const expiresMs = Number(expiresMsRaw);
  if (!Number.isSafeInteger(expiresMs)) return null;
  if (now.getTime() >= expiresMs) return null;

  const payload = `${filingId}.${scope}.${expiresMsRaw}`;
  if (!safeEqual(sign(payload), sig)) return null;

  return { filingId, scope };
}

export async function createFilingInvite(
  filingId: string,
  scope: InviteScope,
  email: string,
): Promise<{ url: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.filing.update({
    where: { id: filingId },
    data: {
      inviteTokenHash: tokenHash,
      inviteScope: scope,
      inviteEmail: normalizedEmail,
      inviteExpiresAt: expiresAt,
      inviteCreatedAt: new Date(),
    },
  });

  return { url: `${env.appUrl}/invite/${encodeURIComponent(token)}`, expiresAt };
}

export async function consumeFilingInvite(token: string): Promise<{ filingId: string; scope: InviteScope } | null> {
  const tokenHash = hashInviteToken(token);
  const filing = await prisma.filing.findUnique({
    where: { inviteTokenHash: tokenHash },
    select: {
      id: true,
      inviteTokenHash: true,
      inviteScope: true,
      inviteExpiresAt: true,
    },
  });

  if (!filing?.inviteTokenHash || !safeEqual(filing.inviteTokenHash, tokenHash)) return null;
  if (!isInviteScope(filing.inviteScope)) return null;
  if (!filing.inviteExpiresAt || Date.now() >= filing.inviteExpiresAt.getTime()) return null;

  return { filingId: filing.id, scope: filing.inviteScope };
}
