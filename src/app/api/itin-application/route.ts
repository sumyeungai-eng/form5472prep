import { NextResponse } from "next/server";
import { sendItinApplicationAdminEmail, sendItinApplicationConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = await rateLimit("itin-application", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const {
    fullName, email, phone,
    dateOfBirth, countryOfBirth, citizenship, countryOfResidence,
    itinReason, taxReturnType, usActivity,
    passportNumber, passportExpiry,
    notes,
  } = body as Record<string, string>;

  if (!fullName || !email || !itinReason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });

  await prisma.itinApplication.create({
    data: {
      fullName, email: normalized, phone: phone || null,
      dateOfBirth: dateOfBirth || null, countryOfBirth: countryOfBirth || null,
      citizenship: citizenship || null, countryOfResidence: countryOfResidence || null,
      itinReason, taxReturnType: taxReturnType || null, usActivity: usActivity || null,
      passportNumber: passportNumber || null, passportExpiry: passportExpiry || null,
      notes: notes || null,
      userId: user.id,
    },
  });

  const portalLink = makeMagicLink(user.id);
  const adminEmail = process.env.ADMIN_EMAIL || "support@form5472prep.com";

  await Promise.all([
    sendItinApplicationAdminEmail({
      adminEmail,
      fullName,
      email: normalized,
      phone,
      dateOfBirth,
      countryOfBirth,
      citizenship,
      countryOfResidence,
      itinReason,
      taxReturnType,
      usActivity,
      passportNumber,
      passportExpiry,
      notes,
    }),
    sendItinApplicationConfirmationEmail({
      email: normalized,
      fullName,
      portalLink,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
