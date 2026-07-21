import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Fixed-window rate limiter backed by Postgres — no external store (Redis/KV)
// required. One row per (bucket:identifier:windowStart); count is incremented
// atomically via upsert. Old rows simply age out (a different windowStart =>
// a different key); `expiresAt` is there for optional cleanup.
//
// FAILS OPEN: any DB error (including the table not existing yet, before the
// migration is applied) returns { ok: true } so a transient blip or a
// not-yet-migrated deploy never locks out real users.
export async function rateLimit(
  bucket: string,
  identifier: string,
  limit: number,
  windowSec: number,
): Promise<{ ok: boolean; retryAfterSec: number }> {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${bucket}:${identifier}:${windowStart}`;
  const expiresAt = new Date(windowStart + windowMs);
  try {
    const row = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: { increment: 1 } },
    });
    if (row.count > limit) {
      return { ok: false, retryAfterSec: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)) };
    }
    return { ok: true, retryAfterSec: 0 };
  } catch (err) {
    console.error("[rateLimit] store error — failing open", err);
    return { ok: true, retryAfterSec: 0 };
  }
}

// Best-effort client IP from the proxy headers Vercel sets. Falls back to a
// constant so a missing header still buckets (globally) rather than throwing.
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

// Standard 429 with Retry-After.
export function tooManyRequests(retryAfterSec: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } },
  );
}
