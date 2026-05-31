import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const {
    // Contact
    fullName, email, phone,
    // LLC
    llcName, llcState, llcFormedDate, businessPurpose,
    // Owner
    ownerName, ownerCitizenship, ownerResidence, passportNumber,
    // Notes
    notes,
  } = body as Record<string, string>;

  if (!fullName || !email || !llcName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "support@form5472prep.com";

  await sendEmail({
    to: adminEmail,
    subject: `[EIN Application] ${llcName} — ${fullName}`,
    text: [
      `New EIN Application`,
      ``,
      `--- Contact ---`,
      `Name:    ${fullName}`,
      `Email:   ${email}`,
      `Phone:   ${phone || "(not provided)"}`,
      ``,
      `--- LLC Info ---`,
      `LLC Name:       ${llcName}`,
      `State:          ${llcState || "(not provided)"}`,
      `Formation date: ${llcFormedDate || "(not provided)"}`,
      `Business purpose: ${businessPurpose || "(not provided)"}`,
      ``,
      `--- Owner Info ---`,
      `Owner name:      ${ownerName || fullName}`,
      `Citizenship:     ${ownerCitizenship || "(not provided)"}`,
      `Country of residence: ${ownerResidence || "(not provided)"}`,
      `Passport number: ${passportNumber || "(not provided)"}`,
      ``,
      `--- Notes ---`,
      notes || "(none)",
    ].join("\n"),
    html: `
      <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">New EIN Application</h2>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td colspan="2" style="padding:8px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Contact</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;width:160px;">Name</td><td style="color:#0f172a;">${fullName}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${email}" style="color:#1e3a8a;">${email}</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="color:#0f172a;">${phone || "—"}</td></tr>
        <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">LLC Info</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">LLC Name</td><td style="color:#0f172a;font-weight:600;">${llcName}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">State</td><td style="color:#0f172a;">${llcState || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Formation date</td><td style="color:#0f172a;">${llcFormedDate || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Business purpose</td><td style="color:#0f172a;">${businessPurpose || "—"}</td></tr>
        <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Owner Info</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Owner name</td><td style="color:#0f172a;">${ownerName || fullName}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Citizenship</td><td style="color:#0f172a;">${ownerCitizenship || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Country of residence</td><td style="color:#0f172a;">${ownerResidence || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport number</td><td style="color:#0f172a;">${passportNumber || "—"}</td></tr>
        ${notes ? `<tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Notes</td></tr><tr><td colspan="2" style="padding:6px 0;color:#0f172a;">${notes}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Reply directly to this email to contact the applicant.</p>
    `,
    replyTo: email,
  });

  // Confirmation to applicant
  await sendEmail({
    to: email,
    subject: "We received your EIN application — Form5472 Prep",
    text: `Hi ${fullName},\n\nWe've received your EIN application for ${llcName}. Our team will review it and reach out within 1 business day with next steps (document checklist and payment link).\n\nIf you have any questions in the meantime, reply to this email or contact support@form5472prep.com.\n\n— Form5472 Prep`,
    html: `
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${fullName},</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">We've received your EIN application for <strong>${llcName}</strong>.</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Our team will review it and reach out within <strong>1 business day</strong> with next steps — including the document checklist and payment link.</p>
      <p style="margin:0 0 0;color:#475569;font-size:14px;">Questions? Reply to this email or contact <a href="mailto:support@form5472prep.com" style="color:#1e3a8a;">support@form5472prep.com</a>.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
