import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { makeMagicLink } from "@/lib/magicLink";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

// Escape applicant-supplied values before interpolating into the admin
// notification email's HTML so a submitter can't inject markup/links into the
// operator's inbox.
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rl = await rateLimit("ein-application", clientIp(req), 5, 3600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const {
    fullName, email, phone,
    llcName, llcState, llcFormedDate, businessPurpose,
    ownerName, ownerCitizenship, ownerResidence, passportNumber,
    notes,
  } = body as Record<string, string>;

  if (!fullName || !email || !llcName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  // Upsert user and create application
  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized },
  });

  await prisma.einApplication.create({
    data: {
      fullName, email: normalized, phone: phone || null,
      llcName, llcState: llcState || null, llcFormedDate: llcFormedDate || null,
      businessPurpose: businessPurpose || null,
      ownerName: ownerName || null, ownerCitizenship: ownerCitizenship || null,
      ownerResidence: ownerResidence || null, passportNumber: passportNumber || null,
      notes: notes || null,
      userId: user.id,
    },
  });

  const portalLink = makeMagicLink(user.id);
  const adminEmail = process.env.ADMIN_EMAIL || "support@form5472prep.com";

  await Promise.all([
    // Admin notification
    sendEmail({
      to: adminEmail,
      subject: `[EIN Application] ${fullName} — ${llcName}`,
      text: [
        `New EIN Application`,
        ``,
        `--- Contact ---`,
        `Name:  ${fullName}`,
        `Email: ${normalized}`,
        `Phone: ${phone || "(not provided)"}`,
        ``,
        `--- LLC ---`,
        `LLC Name:         ${llcName}`,
        `State:            ${llcState || "(not provided)"}`,
        `Formed date:      ${llcFormedDate || "(not provided)"}`,
        `Business purpose: ${businessPurpose || "(not provided)"}`,
        ``,
        `--- Owner ---`,
        `Owner name:   ${ownerName || "(same as contact)"}`,
        `Citizenship:  ${ownerCitizenship || "(not provided)"}`,
        `Residence:    ${ownerResidence || "(not provided)"}`,
        `Passport No:  ${passportNumber || "(not provided)"}`,
        ``,
        `--- Notes ---`,
        notes || "(none)",
      ].join("\n"),
      html: `
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">New EIN Application</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td colspan="2" style="padding:8px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Contact</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;width:180px;">Name</td><td style="color:#0f172a;font-weight:600;">${esc(fullName)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${esc(normalized)}" style="color:#1e3a8a;">${esc(normalized)}</a></td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="color:#0f172a;">${esc(phone) || "—"}</td></tr>
          <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">LLC</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">LLC Name</td><td style="color:#0f172a;">${esc(llcName)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">State</td><td style="color:#0f172a;">${esc(llcState) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Formed</td><td style="color:#0f172a;">${esc(llcFormedDate) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Business purpose</td><td style="color:#0f172a;">${esc(businessPurpose) || "—"}</td></tr>
          <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Owner</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Owner name</td><td style="color:#0f172a;">${esc(ownerName) || "(same as contact)"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Citizenship</td><td style="color:#0f172a;">${esc(ownerCitizenship) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Residence</td><td style="color:#0f172a;">${esc(ownerResidence) || "—"}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport</td><td style="color:#0f172a;">${esc(passportNumber) || "—"}</td></tr>
          ${notes ? `<tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Notes</td></tr><tr><td colspan="2" style="padding:6px 0;color:#0f172a;">${esc(notes)}</td></tr>` : ""}
        </table>
        <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Reply directly to this email to contact the applicant.</p>
      `,
      replyTo: normalized,
    }),
    // Applicant confirmation with portal link
    sendEmail({
      to: normalized,
      subject: "EIN application received — Form5472 Prep",
      text: `Hi ${fullName},\n\nWe've received your EIN application for ${llcName}.\n\nOur team will reach out within 1 business day with a document checklist and payment link.\n\nYou can also track your application status in your client portal:\n${portalLink}\n\nIf you have any questions, reply to this email or contact support@form5472prep.com.\n\n— Form5472 Prep`,
      html: `
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${fullName},</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">We&apos;ve received your EIN application for <strong>${llcName}</strong>.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Our team will reach out within <strong>1 business day</strong> with a document checklist and payment link.</p>
        <p style="margin:0 0 16px;color:#475569;font-size:15px;">Track your application status in your client portal:<br><a href="${portalLink}" style="color:#1e3a8a;">View my application &rarr;</a></p>
        <p style="margin:0;color:#475569;font-size:14px;">Questions? Reply to this email or contact <a href="mailto:support@form5472prep.com" style="color:#1e3a8a;">support@form5472prep.com</a>.</p>
      `,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
