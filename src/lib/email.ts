// Transactional email. Uses Resend if RESEND_API_KEY is set; otherwise
// falls through to console.log so dev works without an account.
//
// Get a key at https://resend.com — free tier sends 3,000/month.

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const FROM = process.env.RESEND_FROM || "Form5472 Prep <orders@form5472prep.com>";

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("\n[email stub — set RESEND_API_KEY to actually send]");
    console.log("  to:     ", to);
    console.log("  subject:", subject);
    console.log("  text:   ", text);
    console.log("");
    return { sandbox: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html, text }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function sendMagicLinkEmail(email: string, link: string, filingLabel: string) {
  return sendEmail({
    to: email,
    subject: `Your Form5472 Prep filing — access link`,
    text:
      `Hi,\n\n` +
      `Thanks for filing with Form5472 Prep. Click the link below to access your filing` +
      ` (${filingLabel}) — download the generated PDF, upload your signed copy, and track the` +
      ` fax delivery to the IRS.\n\n` +
      `${link}\n\n` +
      `This link is good for 7 days. If you didn't request this, ignore this email.\n\n` +
      `— Form5472 Prep`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
        <h1 style="font-size: 20px; margin: 0 0 16px;">Your filing is ready to manage</h1>
        <p style="color: #475569; line-height: 1.5;">
          Thanks for filing with <strong>Form5472 Prep</strong>. Click the button below to access
          your filing (${filingLabel}) — download the generated PDF, upload your signed copy,
          and track the fax delivery to the IRS.
        </p>
        <p style="margin: 24px 0;">
          <a href="${link}" style="display: inline-block; background: #1e3a8a; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 500;">Open my filing</a>
        </p>
        <p style="color: #64748b; font-size: 12px;">
          This link is good for 7 days. If you didn't request this, you can ignore this email.
        </p>
      </div>
    `,
  });
}
