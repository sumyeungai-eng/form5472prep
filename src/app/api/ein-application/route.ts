import { NextResponse } from "next/server";
import { sendEinApplicationAdminEmail, sendEinApplicationConfirmationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = await rateLimit("ein-application", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const {
    fullName, email, phone,
    llcName, llcState, llcFormedDate, businessMailingAddress, businessType, businessPurpose, principalProducts,
    ownerName, ownerHomeAddress, ownerCitizenship, ownerResidence, passportNumber,
    notes,
  } = body as Record<string, string>;
  const effectiveFullName = fullName || ownerName;

  if (!effectiveFullName || !email || !llcName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

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
      ownerName: ownerName || null, ownerHomeAddress: ownerHomeAddress || null, ownerCitizenship: ownerCitizenship || null,
      ownerResidence: ownerResidence || null, passportNumber: passportNumber || null,
      notes: notes || null,
      userId: user.id,
    },
  });

  const portalLink = makeMagicLink(user.id);
  const adminEmail = process.env.ADMIN_EMAIL || "support@form5472prep.com";

  await Promise.all([
    // Admin notification
    sendEinApplicationAdminEmail({
      adminEmail,
      fullName: effectiveFullName,
      email: normalized,
      phone,
      llcName,
      llcState,
      llcFormedDate,
      businessMailingAddress,
      businessType,
      businessPurpose,
      principalProducts,
      ownerName,
      ownerHomeAddress,
      ownerCitizenship,
      ownerResidence,
      passportNumber,
      notes,
    }),
    // Applicant confirmation with portal link
    sendEinApplicationConfirmationEmail({
      email: normalized,
      fullName: effectiveFullName,
      llcName,
      portalLink,
    }),
  ]);

  return NextResponse.json({ ok: true, id: application.id });
}
