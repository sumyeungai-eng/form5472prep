import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";

// Escape applicant-supplied values before interpolating into the admin
// notification email HTML (prevents markup/link injection into the inbox).
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
    sendEmail({
      to: adminEmail,
      subject: `[ITIN Application] ${fullName} — ${itinReason}`,
      text: [
        `New ITIN Application`,
        ``,
        `--- Contact ---`,
        `Name:  ${fullName}`,
        `Email: ${normalized}`,
        `Phone: ${phone || "(not provided)"}`,
        ``,
        `--- Personal Info ---`,
        `Date of birth:        ${dateOfBirth || "(not provided)"}`,
        `Country of birth:     ${countryOfBirth || "(not provided)"}`,
        `Citizenship:          ${citizenship || "(not provided)"}`,
        `Country of residence: ${countryOfResidence || "(not provided)"}`,
        ``,
        `--- ITIN Application ---`,
        `Reason (W-7):    ${itinReason}`,
        `Tax return type: ${taxReturnType || "(not applicable)"}`,
        `US activity:     ${usActivity || "(not provided)"}`,
        ``,
        `--- Passport ---`,
        `Passport number: ${passportNumber || "(not provided)"}`,
        `Passport expiry: ${passportExpiry || "(not provided)"}`,
        ``,
        `--- Notes ---`,
        notes || "(none)",
      ].join("\n"),
      html: `
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">New ITIN Application</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td colspan="2" style="padding:8px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Contact</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;width:180px;">Name</td><td style="color:#0f172a;font-weight:600;">${esc(fullName)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${esc(normalized)}" style="color:#1e3a8a;">${esc(normalized)}</a></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="color:#0f172a;">${esc(phone) || "—"}</td></tr>
          <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Personal Info</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Date of birth</td><td style="color:#0f172a;">${esc(dateOfBirth) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Country of birth</td><td style="color:#0f172a;">${esc(countryOfBirth) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Citizenship</td><td style="color:#0f172a;">${esc(citizenship) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Country of residence</td><td style="color:#0f172a;">${esc(countryOfResidence) || "—"}</td></tr>
          <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">ITIN Application</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">W-7 reason</td><td style="color:#0f172a;">${esc(itinReason)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Tax return type</td><td style="color:#0f172a;">${esc(taxReturnType) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">US activity</td><td style="color:#0f172a;">${esc(usActivity) || "—"}</td></tr>
          <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Passport</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport number</td><td style="color:#0f172a;">${esc(passportNumber) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport expiry</td><td style="color:#0f172a;">${esc(passportExpiry) || "—"}</td></tr>
          ${notes ? `<tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Notes</td></tr><tr><td colspan="2" style="padding:6px 0;color:#0f172a;">${esc(notes)}</td></tr>` : ""}
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Reply directly to this email to contact the applicant.</p>
      `,
      replyTo: normalized,
    }),
    sendEmail({
      to: normalized,
      subject: "ITIN application received — Form5472 Prep",
      text: `Hi ${fullName},\n\nWe've received your ITIN application.\n\nOur team will reach out within 1 business day with a document checklist, CAA certification appointment details, and payment link.\n\nTrack your application status in your client portal:\n${portalLink}\n\nIf you have any questions, reply to this email or contact support@form5472prep.com.\n\n— Form5472 Prep`,
      html: `
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${fullName},</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">We&apos;ve received your ITIN application.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Our team will review it and reach out within <strong>1 business day</strong> with next steps &mdash; including the document checklist, CAA certification appointment, and payment link.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Track your application status in your client portal:<br><a href="${portalLink}" style="color:#1e3a8a;">View my application &rarr;</a></p>
        <p style="margin:0;color:#475569;font-size:14px;">Questions? Reply to this email or contact <a href="mailto:support@form5472prep.com" style="color:#1e3a8a;">support@form5472prep.com</a>.</p>
      `,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
