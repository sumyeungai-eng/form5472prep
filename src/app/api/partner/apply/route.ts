import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPartnerApplicationAckEmail, sendPartnerApplicationAdminEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public partner-application form. Creates a Partner record as INACTIVE
// (active=false) and emails the admin to review + activate. The partner can't
// sign in until an admin flips them Active at /admin/partners — this keeps the
// manual-approval gate while letting the applicant do the data entry.

const MAX = { name: 200, company: 200, email: 320, phone: 60, notes: 2000 };

export async function POST(req: Request) {
  const rl = await rateLimit("partner-apply", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX.name) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, MAX.company) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, MAX.email) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, MAX.phone) : "";
  const wantsWhiteLabel = body.wantsWhiteLabel === true;
  const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, MAX.notes) : "";
  // Honeypot — bots fill hidden fields; humans never see it.
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "Contact name and a valid email are required" }, { status: 400 });
  }

  if (website) {
    // Spam — pretend success, do nothing.
    return NextResponse.json({ ok: true });
  }

  const existing = await prisma.partner.findUnique({ where: { email } });

  // If a partner with this email already exists, don't error or change their
  // active state (could be an already-approved partner re-submitting). Just
  // return success — same response shape as a fresh application, no enumeration.
  if (!existing) {
    const noteLines = [
      company ? `Company: ${company}` : null,
      phone ? `Phone: ${phone}` : null,
      notes ? `Notes: ${notes}` : null,
      `Applied via /partners on ${new Date().toISOString()}`,
    ].filter(Boolean);

    await prisma.partner.create({
      data: {
        name,
        email,
        company: company || null,
        phone: phone || null,
        wantsWhiteLabel,
        active: false, // pending admin approval
        notes: noteLines.join("\n"),
      },
    });

    try {
      await sendPartnerApplicationAdminEmail({
        adminEmail: env.adminEmail,
        name,
        email,
        company,
        phone,
        wantsWhiteLabel,
        notes,
        adminPartnersUrl: `${env.appUrl}/admin/partners`,
      });
    } catch (err) {
      console.error("[partner/apply] admin email failed", err);
      // The Partner row is created regardless — admin can still see it in
      // /admin/partners even if the notification email didn't go out.
    }

    // Acknowledgement to the applicant. Non-blocking — a failure here must not
    // change the success response (the application is already recorded).
    try {
      await sendPartnerApplicationAckEmail(email, name);
    } catch (err) {
      console.error("[partner/apply] applicant ack email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
