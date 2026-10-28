import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";
import { ATTR_COOKIE, parseAttributionCookie } from "@/lib/attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i;

function cleanString(value: unknown, max = 200): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

// Accept a number or a numeric string; anything else is stored as null and
// staff confirm the year after payment (never block payment on it).
function parseTaxYear(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : null;
}

// Form 7004 order intake. Only the email is required (checkout receipt and
// follow-up go there); every other field may be blank or imperfect — staff fix
// it after payment (CLAUDE.md "Never block a customer from paying").
export async function POST(req: Request) {
  const rl = await rateLimit("extension-application", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const input = body as Record<string, unknown>;

  const email = cleanString(input.email)?.toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Same sanitising as the EIN route: user-controllable (?src= on the page).
  const rawSource = typeof input.funnelSource === "string" ? input.funnelSource : null;
  const funnelSource = rawSource
    ? rawSource.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80) || null
    : null;
  const attribution = parseAttributionCookie(cookies().get(ATTR_COOKIE)?.value);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const application = await prisma.extensionApplication.create({
    data: {
      fullName: cleanString(input.fullName) ?? "",
      email,
      phone: cleanString(input.phone, 40),
      llcName: cleanString(input.llcName),
      ein: cleanString(input.ein, 20),
      llcStreet: cleanString(input.llcStreet),
      llcCity: cleanString(input.llcCity, 100),
      llcState: cleanString(input.llcState, 40),
      llcZip: cleanString(input.llcZip, 20),
      taxYear: parseTaxYear(input.taxYear),
      notes: cleanString(input.notes, 2000),
      funnelSource,
      attrSource: attribution?.source ?? null,
      attrMedium: attribution?.medium ?? null,
      attrCampaign: attribution?.campaign ?? null,
      attrReferrer: attribution?.referrer ?? null,
      attrLanding: attribution?.landing ?? null,
      userId: user.id,
      status: "PAYMENT_PENDING",
    },
  });

  return NextResponse.json({ ok: true, id: application.id });
}
