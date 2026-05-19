// Transactional email. Uses Resend if RESEND_API_KEY is set; otherwise
// falls through to console.log so dev works without an account.
//
// Get a key at https://resend.com — free tier sends 3,000/month.

import { formatUsd } from "@/lib/utils";
import { TIERS, FAX_FEE_CENTS, type Tier } from "@/lib/pricing";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const FROM = process.env.RESEND_FROM || "Form5472 Prep <orders@form5472prep.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@form5472prep.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://form5472prep.com";

export async function sendEmail({ to, subject, html, text, replyTo }: SendArgs) {
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
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
      text,
      reply_to: replyTo ?? REPLY_TO,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ---------- Shared email shell ----------
// All transactional emails wrap their body in this template so the brand
// look stays consistent. Inline styles only — most email clients strip <style>.

type ShellArgs = {
  preheader: string; // ~90 chars hidden preview shown in inbox before opening
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  // Only set on marketing emails (yearly reminders). Transactional emails
  // omit this — CAN-SPAM only requires unsubscribe on commercial messages.
  unsubscribeUrl?: string;
};

function shell({ preheader, heading, bodyHtml, cta, unsubscribeUrl }: ShellArgs) {
  const ctaBlock = cta
    ? `<tr><td style="padding:8px 0 32px;">
         <a href="${cta.url}" style="display:inline-block;background:#1e3a8a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">${cta.label}</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <!-- preheader: hidden inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <!-- Brand header -->
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #e2e8f0;background:#ffffff;">
              <div style="font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                <span style="color:#0f172a;">Form</span><span style="color:#1e3a8a;">5472</span><span style="color:#0f172a;"> Prep</span>
              </div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;font-weight:600;color:#0f172a;">${heading}</h1>
              ${bodyHtml}
              <table role="presentation" cellpadding="0" cellspacing="0">${ctaBlock}</table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;color:#64748b;font-size:12px;line-height:1.5;">
              Questions? Reply to this email or contact <a href="mailto:${REPLY_TO}" style="color:#1e3a8a;text-decoration:none;">${REPLY_TO}</a>.
              <br/>
              Form5472 Prep · <a href="${APP_URL}" style="color:#1e3a8a;text-decoration:none;">form5472prep.com</a>
              ${unsubscribeUrl ? `<br/><br/><a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline;">Unsubscribe from filing reminders</a>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------- 1. Magic-link email (existing) ----------

export async function sendMagicLinkEmail(email: string, link: string, filingLabel: string) {
  const heading = "Open your filing";
  const bodyHtml = `
    <p style="margin:0 0 14px;color:#475569;line-height:1.6;font-size:15px;">
      Use the button below to access your filing (<strong>${escapeHtml(filingLabel)}</strong>) —
      download the generated PDF, upload your signed copy, and track the fax delivery to the IRS.
    </p>
    <p style="margin:0 0 24px;color:#64748b;font-size:13px;">This link is good for 7 days.</p>`;

  return sendEmail({
    to: email,
    subject: "Your Form5472 Prep filing — access link",
    text:
      `Open your filing (${filingLabel}):\n\n${link}\n\n` +
      `This link is good for 7 days. If you didn't request this, ignore this email.\n\n— Form5472 Prep`,
    html: shell({
      preheader: `Open your filing (${filingLabel})`,
      heading,
      bodyHtml,
      cta: { label: "Open my filing", url: link },
    }),
  });
}

// ---------- 2. Order confirmation email ----------

type OrderConfirmationArgs = {
  email: string;
  llcName: string | null;
  taxYears: number[];
  tier: Tier;
  amountPaidCents: number; // total including fax fee
  portalLink: string;
  receiptUrl?: string | null; // Stripe-hosted receipt
};

export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  const { email, llcName, taxYears, tier, amountPaidCents, portalLink, receiptUrl } = args;
  const tierLabel = TIERS[tier].label;
  const tierPrice = formatUsd(TIERS[tier].priceCents);
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(LLC name pending)";

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#475569;line-height:1.6;font-size:15px;">
      Thanks for your order. We've received your payment and started preparing your IRS filing.
      You'll get the generated PDF in your portal within a few minutes.
    </p>

    <!-- Receipt -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Order receipt</td></tr>
      <tr><td style="padding:14px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#0f172a;">
          <tr><td style="padding:4px 0;color:#64748b;">LLC</td><td align="right" style="padding:4px 0;">${escapeHtml(llcLine)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Tax year${taxYears.length > 1 ? "s" : ""}</td><td align="right" style="padding:4px 0;">${escapeHtml(yearsLabel)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Plan</td><td align="right" style="padding:4px 0;">${escapeHtml(tierLabel)} — ${tierPrice}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">IRS fax delivery</td><td align="right" style="padding:4px 0;">${formatUsd(FAX_FEE_CENTS)}</td></tr>
          <tr><td style="padding:10px 0 4px;border-top:1px solid #e2e8f0;font-weight:600;">Total paid</td><td align="right" style="padding:10px 0 4px;border-top:1px solid #e2e8f0;font-weight:600;">${formatUsd(amountPaidCents)}</td></tr>
        </table>
      </td></tr>
    </table>

    <!-- What happens next -->
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:15px;">What happens next</p>
    <ol style="margin:0 0 24px;padding-left:20px;color:#475569;line-height:1.6;font-size:14px;">
      <li style="margin-bottom:6px;">We generate your filled <strong>Form 5472 + pro forma Form 1120</strong> (≈ 2 min).</li>
      <li style="margin-bottom:6px;">You download, sign, and upload the signed PDF in your portal.</li>
      <li style="margin-bottom:6px;">We fax it to the IRS Ogden PIN Unit and send you a delivery confirmation email.</li>
    </ol>

    ${receiptUrl ? `<p style="margin:0 0 20px;font-size:13px;color:#64748b;">A detailed payment receipt is also available on <a href="${receiptUrl}" style="color:#1e3a8a;text-decoration:none;">Stripe</a>.</p>` : ""}
  `;

  return sendEmail({
    to: email,
    subject: `Order confirmed — Form5472 Prep filing (${yearsLabel})`,
    text:
      `Thanks for your order!\n\n` +
      `Order summary:\n` +
      `  LLC:           ${llcLine}\n` +
      `  Tax year(s):   ${yearsLabel}\n` +
      `  Plan:          ${tierLabel} — ${tierPrice}\n` +
      `  Fax delivery:  ${formatUsd(FAX_FEE_CENTS)}\n` +
      `  Total paid:    ${formatUsd(amountPaidCents)}\n\n` +
      `What happens next:\n` +
      `  1. We generate your Form 5472 + pro forma 1120 (≈ 2 min).\n` +
      `  2. You download, sign, and upload the signed PDF.\n` +
      `  3. We fax it to the IRS Ogden PIN Unit and email you confirmation.\n\n` +
      `Open your filing: ${portalLink}\n\n` +
      `— Form5472 Prep`,
    html: shell({
      preheader: `Order confirmed for ${llcLine} — ${yearsLabel}. Total ${formatUsd(amountPaidCents)}.`,
      heading: "Order confirmed",
      bodyHtml,
      cta: { label: "Open my filing", url: portalLink },
    }),
  });
}

// ---------- 3. Fax delivered email ----------

export async function sendFaxDeliveredEmail(args: {
  email: string;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
}) {
  const { email, llcName, taxYears, portalLink } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Good news — your signed Form 5472 + pro forma 1120 for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}) was successfully faxed
      to the IRS Ogden PIN Unit.
    </p>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#065f46;font-size:14px;">
      <strong>✓ Delivered to the IRS</strong> — keep this email as your proof of submission.
    </div>
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:15px;">What's next</p>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:14px;">
      The IRS doesn't send acknowledgments for faxed 5472 filings, so no further action is required.
      You can download a copy of your full filing package anytime from your portal.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `Filed with the IRS — ${llcLine} (${yearsLabel})`,
    text:
      `Your signed Form 5472 + pro forma 1120 for ${llcLine} (${yearsLabel}) was successfully faxed to the IRS Ogden PIN Unit.\n\n` +
      `Keep this email as your proof of submission. The IRS doesn't send acknowledgments for faxed 5472 filings, so no further action is required.\n\n` +
      `Download your full filing package: ${portalLink}\n\n— Form5472 Prep`,
    html: shell({
      preheader: `Filed with the IRS — ${llcLine} (${yearsLabel}) successfully delivered.`,
      heading: "Your filing was delivered to the IRS",
      bodyHtml,
      cta: { label: "View my filing", url: portalLink },
    }),
  });
}

// ---------- 4. Fax failed email ----------

export async function sendFaxFailedEmail(args: {
  email: string;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
}) {
  const { email, llcName, taxYears, portalLink } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      We tried to fax your signed Form 5472 + pro forma 1120 for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}) to the IRS Ogden PIN Unit,
      but the transmission didn't go through after multiple attempts.
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#991b1b;font-size:14px;">
      <strong>Fax delivery failed</strong> — no action lost. Our team has been notified and will
      reach out within one business day with next steps (manual retry or refund).
    </div>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:14px;">
      You don't need to do anything right now. If you have questions in the meantime,
      reply to this email and we'll get back to you quickly.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `Action needed — fax to IRS failed (${llcLine})`,
    text:
      `We tried to fax your signed Form 5472 + pro forma 1120 for ${llcLine} (${yearsLabel}) to the IRS Ogden PIN Unit, but transmission failed after multiple attempts.\n\n` +
      `Our team has been notified and will reach out within one business day with next steps. You don't need to do anything right now.\n\n` +
      `View your filing: ${portalLink}\n\n— Form5472 Prep`,
    html: shell({
      preheader: `Fax to IRS failed for ${llcLine} — our team has been notified.`,
      heading: "We hit a snag faxing your filing",
      bodyHtml,
      cta: { label: "View my filing", url: portalLink },
    }),
  });
}

// ---------- 5. January reminder (annual marketing email) ----------

type ReminderArgs = {
  email: string;
  taxYearToFile: number; // e.g. 2025 if reminding in January 2026 about the 2025 tax year
  previousLlcNames: string[]; // distinct LLCs the customer has filed for before
  startLink: string; // CTA to start a new filing
  unsubscribeUrl: string;
};

export async function sendJanuaryReminderEmail(args: ReminderArgs) {
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  const llcLine =
    previousLlcNames.length === 0
      ? "your foreign-owned LLC"
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : `${previousLlcNames.slice(0, -1).join(", ")} and ${previousLlcNames[previousLlcNames.length - 1]}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Happy New Year! It's that time again — the IRS requires foreign-owned US LLCs to file
      <strong>Form 5472 + pro forma Form 1120</strong> every year, even if there was no income.
    </p>
    <p style="margin:0 0 20px;color:#475569;line-height:1.6;font-size:15px;">
      For ${escapeHtml(llcLine)}, your <strong>${taxYearToFile}</strong> tax year filing is due by
      <strong>April 15, ${taxYearToFile + 1}</strong>. Start now and have it filed in ~15 minutes —
      we'll pull your previous answers forward so you don't re-enter the LLC details.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin:0 0 24px;color:#334155;font-size:14px;line-height:1.5;">
      <strong style="color:#0f172a;">Why now?</strong> Filing in January means no last-minute rush
      and no risk of the <strong>$25,000 penalty</strong> for late or missing Form 5472.
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Time to file your ${taxYearToFile} Form 5472`,
    text:
      `Happy New Year!\n\nYour ${taxYearToFile} Form 5472 + pro forma 1120 for ${llcLine} is due by April 15, ${taxYearToFile + 1}.\n\n` +
      `File now in ~15 minutes — we'll pull your previous answers forward: ${startLink}\n\n` +
      `Filing early avoids the $25,000 IRS penalty for late or missing Form 5472.\n\n` +
      `— Form5472 Prep\n\n` +
      `Unsubscribe from filing reminders: ${unsubscribeUrl}`,
    html: shell({
      preheader: `Your ${taxYearToFile} Form 5472 is due by April 15, ${taxYearToFile + 1}. File in 15 min.`,
      heading: `Time to file your ${taxYearToFile} Form 5472`,
      bodyHtml,
      cta: { label: `File my ${taxYearToFile} return`, url: startLink },
      unsubscribeUrl,
    }),
  });
}

// ---------- 6. March deadline reminder (second touch) ----------

export async function sendMarchReminderEmail(args: ReminderArgs) {
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  const deadline = `April 15, ${taxYearToFile + 1}`;
  const llcLine =
    previousLlcNames.length === 0
      ? "your foreign-owned LLC"
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : `${previousLlcNames.slice(0, -1).join(", ")} and ${previousLlcNames[previousLlcNames.length - 1]}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Quick reminder — your <strong>${taxYearToFile}</strong> Form 5472 for
      ${escapeHtml(llcLine)} is due in about <strong>30 days</strong> (deadline: ${deadline}).
    </p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#991b1b;font-size:14px;line-height:1.5;">
      <strong>Heads up:</strong> the IRS late-filing penalty for Form 5472 is <strong>$25,000</strong>,
      and an additional $25,000 per 30-day period it remains unfiled after they request it.
    </div>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:15px;">
      The filing takes ~15 minutes from start to faxed-with-the-IRS. We've kept your previous
      LLC and owner details on file so you can move fast.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `30 days left — file your ${taxYearToFile} Form 5472 before April 15`,
    text:
      `Your ${taxYearToFile} Form 5472 for ${llcLine} is due in about 30 days (deadline: ${deadline}).\n\n` +
      `The late-filing penalty is $25,000. Take 15 minutes now and we'll fax it to the IRS today: ${startLink}\n\n` +
      `— Form5472 Prep\n\n` +
      `Unsubscribe from filing reminders: ${unsubscribeUrl}`,
    html: shell({
      preheader: `30 days left until the ${deadline} Form 5472 deadline.`,
      heading: `Your ${taxYearToFile} Form 5472 deadline is in 30 days`,
      bodyHtml,
      cta: { label: `File my ${taxYearToFile} return now`, url: startLink },
      unsubscribeUrl,
    }),
  });
}

// ---------- helpers ----------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
