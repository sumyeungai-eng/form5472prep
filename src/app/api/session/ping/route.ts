import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { parseAttributionCookie } from "@/lib/attribution";
import { rateLimit } from "@/lib/rateLimit";
import { getCurrentUserId, getSessionId } from "@/lib/session";
import {
  clientIpFromHeaders,
  deviceFromUserAgent,
  externalReferrerHost,
  geoFromHeaders,
  hashIp,
  isBotUserAgent,
  isTrackablePath,
} from "@/lib/traffic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VISITOR_COOKIE = "fs_visitor";
const VISITOR_TTL_SECONDS = 60 * 60 * 24 * 365;
const PING_DAILY_LIMIT = 50_000;
const PING_WINDOW_SECONDS = 24 * 60 * 60;

type PingBody = {
  p: string;
  r?: string | null;
  w?: number;
};

export async function POST(req: NextRequest) {
  let body: PingBody;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || typeof parsed.p !== "string") {
      return noContent();
    }
    body = parsed as PingBody;
  } catch {
    return noContent();
  }

  if (!isTrackablePath(body.p)) return noContent();

  const ip = clientIpFromHeaders(req.headers);

  // This is an unauthenticated write endpoint sharing the RateLimit table and
  // connection pool with checkout. An unthrottled beacon could both bloat that
  // table and crowd out real conversions, so it gets a per-IP brake plus a
  // hard daily circuit breaker before any visitor rows are written.
  const perIp = await rateLimit("ping", ip ?? "unknown", 120, 10 * 60);
  if (!perIp.ok) return rateLimited(perIp.retryAfterSec);

  const daily = await consumeDailyPingBudget();
  if (!daily.ok) return rateLimited(daily.retryAfterSec);

  const res = noContent();

  try {
    const store = cookies();
    let visitorKey = store.get(VISITOR_COOKIE)?.value;
    if (!visitorKey) {
      visitorKey = crypto.randomUUID();
      res.cookies.set({
        name: VISITOR_COOKIE,
        value: visitorKey,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VISITOR_TTL_SECONDS,
      });
    }

    const ua = req.headers.get("user-agent");
    const host = req.headers.get("host") ?? new URL(req.url).host;
    const rawReferrer = typeof body.r === "string" ? body.r : null;
    const referrer = externalReferrerHost(rawReferrer, host);
    const attrCookie = store.get("f5472_attr")?.value;
    const attr = parseAttributionCookie(attrCookie);
    const geo = geoFromHeaders(req.headers);
    const sessionId = getSessionId();
    const userId = getCurrentUserId();
    const isBot = isBotUserAgent(ua);
    const ipHash = ip ? hashIp(ip, env.trafficIpSalt) : null;
    const seenAt = new Date();

    await prisma.$transaction(async (tx) => {
      const visitor = await tx.visitor.upsert({
        where: { visitorKey },
        create: {
          visitorKey,
          firstSeenAt: seenAt,
          lastSeenAt: seenAt,
          pageViews: 1,
          isBot,
          attrSource: attr.source,
          attrMedium: attr.medium,
          attrCampaign: attr.campaign,
          attrReferrer: attr.referrer ?? referrer,
          attrLanding: attr.landing,
          ip,
          ipHash,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: geo.timezone,
          userAgent: ua,
          userId,
          lastSessionId: sessionId ?? null,
        },
        update: {
          lastSeenAt: seenAt,
          pageViews: { increment: 1 },
          isBot,
          ip,
          ipHash,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          timezone: geo.timezone,
          userAgent: ua,
          ...(userId ? { userId } : {}),
          ...(sessionId ? { lastSessionId: sessionId } : {}),
        },
      });

      await tx.pageView.create({
        data: {
          visitorId: visitor.id,
          path: body.p,
          referrer,
          sessionId: sessionId ?? null,
          userId,
          ip,
          country: geo.country,
          city: geo.city,
          device: deviceFromUserAgent(ua),
          isBot,
        },
      });
    });
  } catch (err) {
    console.error("[traffic] ping failed", err);
  }

  return res;
}

async function consumeDailyPingBudget(): Promise<{ ok: boolean; retryAfterSec: number }> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const windowStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const expiresAt = new Date(windowStart + PING_WINDOW_SECONDS * 1000);
  const key = `ping:day:${day}`;

  try {
    const row = await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt },
      update: { count: { increment: 1 } },
    });
    if (row.count > PING_DAILY_LIMIT) {
      return {
        ok: false,
        retryAfterSec: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)),
      };
    }
  } catch (err) {
    console.error("[traffic] daily ping rate limit failed open", err);
  }

  return { ok: true, retryAfterSec: 0 };
}

function noContent() {
  return new NextResponse(null, { status: 204 });
}

function rateLimited(retryAfterSec: number) {
  return new NextResponse(null, {
    status: 429,
    headers: { "Retry-After": String(retryAfterSec) },
  });
}

