import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public partner-application form. Creates a Partner record as INACTIVE
// (active=false) and emails the admin to review + activate. The partner can't
// sign in until an admin flips them Active at /admin/partners — this keeps the
// manual-approval gate while letting the applicant do the data entry.

const MAX = { name: 200, company: 200, email: 320, phone: 60, notes: 2000 };

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX.name) : "";
  const company = typeof body.company === "string" ? body.company.trim().slice(0, MAX.company) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, MAX.email) : "";
  const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, MAX.phone) : "";
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
        active: false, // pending admin approval
        notes: noteLines.join("\n"),
      },
    });

    const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    try {
      await sendEmail({
        to: env.adminEmail,
        replyTo: email,
        subject: `[Partner application] ${name}${company ? ` — ${company}` : ""}`,
        text: [
          "New partner application — PENDING approval.",
          "",
          `Contact: ${name}`,
          `Email:   ${email}`,
          company ? `Company: ${company}` : "",
          phone ? `Phone:   ${phone}` : "",
          notes ? `\nNotes:\n${notes}` : "",
          "",
          `Activate them at ${env.appUrl}/admin/partners (they can't sign in until you do).`,
        ]
          .filter(Boolean)
          .join("\n"),
        html: `
          <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">New partner application</h2>
          <p style="margin:0 0 16px;color:#b45309;font-size:14px;font-weight:600;">Status: pending approval — they cannot sign in until you activate them.</p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Contact</td><td style="color:#0f172a;font-weight:600;">${safe(name)}</td></tr>
            <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${safe(email)}" style="color:#1e3a8a;">${safe(email)}</a></td></tr>
            ${company ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">Company</td><td style="color:#0f172a;">${safe(company)}</td></tr>` : ""}
            ${phone ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="color:#0f172a;">${safe(phone)}</td></tr>` : ""}
          </table>
          ${notes ? `<p style="margin:16px 0 4px;color:#64748b;font-size:13px;">Notes</p><p style="margin:0;color:#0f172a;font-size:15px;white-space:pre-wrap;">${safe(notes)}</p>` : ""}
          <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Activate at <a href="${env.appUrl}/admin/partners" style="color:#1e3a8a;">/admin/partners</a>. Reply to this email to contact the applicant.</p>
        `,
      });
    } catch (err) {
      console.error("[partner/apply] admin email failed", err);
      // The Partner row is created regardless — admin can still see it in
      // /admin/partners even if the notification email didn't go out.
    }
  }

  return NextResponse.json({ ok: true });
}
