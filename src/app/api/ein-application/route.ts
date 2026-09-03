import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";
import { ATTR_COOKIE, parseAttributionCookie } from "@/lib/attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = await rateLimit("ein-application", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Sanitize funnelSource — user-controllable (set client-side from ?src=
  // on /ein/apply). Cap length and restrict to slug-safe chars so a tampered
  // request body can't store huge or weird strings in the DB / admin UI.
  const rawSource = typeof body?.funnelSource === "string" ? body.funnelSource : null;
  const funnelSource = rawSource
    ? rawSource.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 80) || null
    : null;

  const {
    fullName, email, phone,
    llcName, llcState, llcFormedDate, businessMailingAddress, businessType, businessPurpose, principalProducts,
    ownerName, dateOfBirth, ownerHomeAddress, ownerCitizenship, ownerResidence, passportNumber,
    notes,
  } = body as Record<string, string>;
  const effectiveFullName = fullName || ownerName;

  if (!effectiveFullName || !email || !llcName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();
  // First-touch traffic attribution, captured into an httpOnly cookie by the
  // middleware on the visitor's first page view. Read-only here and never
  // fatal: a malformed cookie parses to all-nulls rather than throwing.
  const attribution = parseAttributionCookie(cookies().get(ATTR_COOKIE)?.value);

  // Upsert user and create application
  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });

  const application = await prisma.einApplication.create({
    data: {
      fullName: effectiveFullName, email: normalized, phone: phone || null,
      llcName, llcState: llcState || null, llcFormedDate: llcFormedDate || null,
      businessMailingAddress: businessMailingAddress || null, businessType: businessType || null,
      businessPurpose: businessPurpose || null, principalProducts: principalProducts || null,
      ownerName: ownerName || null, dateOfBirth: dateOfBirth || null, ownerHomeAddress: ownerHomeAddress || null, ownerCitizenship: ownerCitizenship || null,
      ownerResidence: ownerResidence || null, passportNumber: passportNumber || null,
      notes: notes || null,
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
