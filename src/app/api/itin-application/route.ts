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
    // Personal
    dateOfBirth, countryOfBirth, citizenship, countryOfResidence,
    // ITIN reason
    itinReason, taxReturnType,
    // Passport
    passportNumber, passportExpiry,
    // US activity
    usActivity,
    // Notes
    notes,
  } = body as Record<string, string>;

  if (!fullName || !email || !itinReason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || "support@form5472prep.com";

  await sendEmail({
    to: adminEmail,
    subject: `[ITIN Application] ${fullName} — ${itinReason}`,
    text: [
      `New ITIN Application`,
      ``,
      `--- Contact ---`,
      `Name:  ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone || "(not provided)"}`,
      ``,
      `--- Personal Info ---`,
      `Date of birth:       ${dateOfBirth || "(not provided)"}`,
      `Country of birth:    ${countryOfBirth || "(not provided)"}`,
      `Citizenship:         ${citizenship || "(not provided)"}`,
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
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;width:180px;">Name</td><td style="color:#0f172a;font-weight:600;">${fullName}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${email}" style="color:#1e3a8a;">${email}</a></td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Phone</td><td style="color:#0f172a;">${phone || "—"}</td></tr>
        <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Personal Info</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Date of birth</td><td style="color:#0f172a;">${dateOfBirth || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Country of birth</td><td style="color:#0f172a;">${countryOfBirth || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Citizenship</td><td style="color:#0f172a;">${citizenship || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Country of residence</td><td style="color:#0f172a;">${countryOfResidence || "—"}</td></tr>
        <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">ITIN Application</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">W-7 reason</td><td style="color:#0f172a;">${itinReason}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Tax return type</td><td style="color:#0f172a;">${taxReturnType || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">US activity</td><td style="color:#0f172a;">${usActivity || "—"}</td></tr>
        <tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Passport</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport number</td><td style="color:#0f172a;">${passportNumber || "—"}</td></tr>
        <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Passport expiry</td><td style="color:#0f172a;">${passportExpiry || "—"}</td></tr>
        ${notes ? `<tr><td colspan="2" style="padding:16px 0 4px;font-weight:600;color:#1e3a8a;border-bottom:1px solid #e2e8f0;">Notes</td></tr><tr><td colspan="2" style="padding:6px 0;color:#0f172a;">${notes}</td></tr>` : ""}
      </table>
      <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Reply directly to this email to contact the applicant.</p>
    `,
    replyTo: email,
  });

  // Confirmation to applicant
  await sendEmail({
    to: email,
    subject: "We received your ITIN application — Form5472 Prep",
    text: `Hi ${fullName},\n\nWe've received your ITIN application. Our team will review it and reach out within 1 business day with next steps (document checklist, CAA certification appointment, and payment link).\n\nIf you have any questions in the meantime, reply to this email or contact support@form5472prep.com.\n\n— Form5472 Prep`,
    html: `
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${fullName},</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">We've received your ITIN application.</p>
      <p style="margin:0 0 16px;color:#475569;font-size:15px;">Our team will review it and reach out within <strong>1 business day</strong> with next steps — including the document checklist, CAA certification appointment, and payment link.</p>
      <p style="margin:0 0 0;color:#475569;font-size:14px;">Questions? Reply to this email or contact <a href="mailto:support@form5472prep.com" style="color:#1e3a8a;">support@form5472prep.com</a>.</p>
    `,
  });

  return NextResponse.json({ ok: true });
}
