import crypto from "node:crypto"
import { env } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export const ADMIN_SESSION_TTL_SECONDS: number = 60 * 60 * 24 * 7
export const ADMIN_LOGIN_LINK_TTL_SECONDS: number = 15 * 60
export const DEVICE_TOKEN_TTL_DAYS: number = 30

const IS_PROD = process.env.NODE_ENV === "production"
const DEV_SECRET = "dev-only-admin-secret-please-override-in-production"
const SECRET = process.env.ADMIN_SESSION_SECRET || (IS_PROD ? "" : DEV_SECRET)

function identityConfigOk(): boolean {
  if (!IS_PROD) return true
  const secretOk =
    !!process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET !== DEV_SECRET
  if (!secretOk) {
    console.error(
      "[admin/identity] FAIL CLOSED: ADMIN_SESSION_SECRET is missing or still the default in production. Admin identity tokens are disabled until it is set to a real value.",
    )
    return false
  }
  return true
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("base64url")
}

function sigEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

function verifySignedPayload(token: string): string | null {
  const lastDot = token.lastIndexOf(".")
  if (lastDot === -1) return null
  const payload = token.slice(0, lastDot)
  const sig = token.slice(lastDot + 1)
  if (!sigEqual(sign(payload), sig)) return null
  return payload
}

function verifySessionPayload(token: string): string | null {
  const payload = verifySignedPayload(token)
  if (!payload) return null
  const parts = payload.split(":")
  if (parts.length !== 2) return null
  const [adminId, expStr] = parts
  const exp = Number(expStr)
  if (!adminId || !exp || Number.isNaN(exp)) return null
  if (Math.floor(Date.now() / 1000) >= exp) return null
  return adminId
}

function verifyLoginPayload(
  token: string,
): { adminId: string; nonce: string } | null {
  const payload = verifySignedPayload(token)
  if (!payload) return null
  const parts = payload.split(":")
  if (parts.length !== 3) return null
  const [adminId, expStr, nonce] = parts
  const exp = Number(expStr)
  if (!adminId || !exp || Number.isNaN(exp) || !nonce) return null
  if (Math.floor(Date.now() / 1000) >= exp) return null
  return { adminId, nonce }
}

export async function makeAdminLoginLink(adminId: string): Promise<string> {
  if (!identityConfigOk()) throw new Error("Admin identity tokens are disabled")

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_LOGIN_LINK_TTL_SECONDS
  const nonce = crypto.randomBytes(16).toString("base64url")
  await prisma.admin.update({
    where: { id: adminId },
    data: { loginNonce: nonce },
  })

  const payload = `${adminId}:${expiresAt}:${nonce}`
  const token = `${payload}.${sign(payload)}`
  return `${env.appUrl}/admin/auth/${encodeURIComponent(token)}`
}

export async function verifyAdminLoginToken(token: string): Promise<string | null> {
  if (!identityConfigOk()) return null

  const verified = verifyLoginPayload(token)
  if (!verified) return null

  const admin = await prisma.admin.findUnique({
    where: { id: verified.adminId },
    select: { loginNonce: true },
  })
  if (!admin?.loginNonce || !sigEqual(admin.loginNonce, verified.nonce)) return null

  const consumed = await prisma.admin.updateMany({
    where: { id: verified.adminId, loginNonce: verified.nonce },
    data: { loginNonce: null },
  })
  if (consumed.count !== 1) return null

  return verified.adminId
}

export function makeAdminSessionToken(adminId: string): string {
  if (!identityConfigOk()) throw new Error("Admin identity tokens are disabled")

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS
  const payload = `${adminId}:${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function verifyAdminSessionToken(token: string): string | null {
  if (!identityConfigOk()) return null
  return verifySessionPayload(token)
}

function hashDeviceToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex")
}

export async function issueDeviceToken(
  adminId: string,
  deviceName?: string,
): Promise<{ token: string; expiresAt: Date }> {
  if (!identityConfigOk()) throw new Error("Admin identity tokens are disabled")

  const token = crypto.randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + DEVICE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)

  await prisma.adminDeviceToken.create({
    data: {
      adminId,
      tokenHash: hashDeviceToken(token),
      deviceName,
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export async function verifyDeviceToken(rawToken: string): Promise<string | null> {
  if (!identityConfigOk()) return null

  const deviceToken = await prisma.adminDeviceToken.findUnique({
    where: { tokenHash: hashDeviceToken(rawToken) },
    include: { admin: true },
  })

  if (
    !deviceToken ||
    deviceToken.revokedAt ||
    deviceToken.expiresAt <= new Date() ||
    !deviceToken.admin ||
    !deviceToken.admin.active
  ) {
    return null
  }

  await prisma.adminDeviceToken.update({
    where: { id: deviceToken.id },
    data: { lastUsedAt: new Date() },
  })

  return deviceToken.adminId
}

export async function revokeDeviceToken(rawToken: string): Promise<void> {
  await prisma.adminDeviceToken.updateMany({
    where: { tokenHash: hashDeviceToken(rawToken) },
    data: { revokedAt: new Date() },
  })
}
