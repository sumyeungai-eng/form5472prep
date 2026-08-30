// Transactional email. Uses Resend if RESEND_API_KEY is set; otherwise
// falls through to console.log so dev works without an account.
//
// Get a key at https://resend.com — free tier sends 3,000/month.

import { formatUsd } from "@/lib/utils";
import { multiYearAddonCents, tierInfo, type Tier } from "@/lib/pricing";
import { filingDueDateUtc, formatDueDate } from "@/lib/schemas";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Single source of truth for the inline colours used across every email.
export const EMAIL_STYLES = {
  brand: "#1e3a8a",
  ink: "#0f172a",
  muted: "#64748b",
  subtle: "#475569",
  bg: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
  slate: "#334155",
  green: "#047857",
  greenDark: "#065f46",
  greenBg: "#ecfdf5",
  greenBorder: "#a7f3d0",
  amber: "#92400e",
  amberDark: "#78350f",
  amberText: "#b45309",
  amberBg: "#fffbeb",
  amberBorder: "#fcd34d",
  red: "#dc2626",
  redDark: "#991b1b",
  redStrong: "#b91c1c",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
} as const;

type SendAttachment = {
  filename: string;
  content: Buffer | Uint8Array;
  contentType?: string; // defaults to application/pdf for .pdf, octet-stream otherwise
};

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string;
  attachments?: SendAttachment[];
  headers?: Record<string, string>;
};

// Sender address. Must NOT match any inbox we monitor — sending FROM and TO
// the same mailbox (e.g. orders@ → orders@ for admin alerts) is a classic
// spam-filter trigger and was burying every admin notification in our own
// Gmail spam folder. `donotreply@` is a send-only alias on the same verified
// Resend domain, so no extra DNS/verification is needed. Replies still go to
// support@ via Reply-To, which is the inbox we actually read.
const FROM = process.env.RESEND_FROM || "Form5472 Prep <donotreply@form5472prep.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@form5472prep.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://form5472prep.com";

export async function sendEmail({ to, subject, html, text, replyTo, bcc, attachments, headers }: SendArgs) {
  const previewDir = process.env.EMAIL_PREVIEW_DIR;
  if (previewDir) {
    const slug = slugifySubject(subject);
    await mkdir(previewDir, { recursive: true });
    const htmlPath = join(previewDir, `${slug}.html`);
    const textPath = join(previewDir, `${slug}.txt`);
    await Promise.all([
      writeFile(htmlPath, html, "utf8"),
      writeFile(textPath, text, "utf8"),
    ]);
    console.log(`[email preview] ${htmlPath} ${textPath}`);
    return { preview: true, htmlPath, textPath };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("\n[email stub — set RESEND_API_KEY to actually send]");
    console.log("  to:     ", to);
    console.log("  subject:", subject);
    console.log("  text:   ", text);
    if (attachments?.length) console.log("  attach: ", attachments.map((a) => `${a.filename} (${a.content.byteLength}B)`).join(", "));
    console.log("");
    return { sandbox: true };
  }

  const resendAttachments = attachments?.map((a) => ({
    filename: a.filename,
    content: Buffer.from(a.content).toString("base64"),
    content_type:
      a.contentType ?? (a.filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
  }));

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
      ...(bcc ? { bcc } : {}),
      ...(resendAttachments && resendAttachments.length > 0 ? { attachments: resendAttachments } : {}),
      ...(headers && Object.keys(headers).length > 0 ? { headers } : {}),
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
  closingHtml?: string;
  internal?: boolean;
};

function shell({ preheader, heading, bodyHtml, cta, unsubscribeUrl, closingHtml = "", internal = false }: ShellArgs) {
  const footerUrl = internal ? "https://www.form5472prep.com" : APP_URL;
  const ctaBlock = cta
    ? `<tr><td style="padding:8px 0 24px;">
         <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${EMAIL_STYLES.brand};color:${EMAIL_STYLES.white};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(cta.label)}</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_STYLES.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${EMAIL_STYLES.ink};">
  <!-- preheader: hidden inbox preview -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_STYLES.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${EMAIL_STYLES.white};border:1px solid ${EMAIL_STYLES.border};border-radius:12px;overflow:hidden;">
          <!-- Brand header: hosted banner. The navy cell background + white alt text
               keep the header on-brand in clients that block remote images. -->
          <tr>
            <td style="background:#0d1b3d;border-bottom:1px solid ${EMAIL_STYLES.border};">
              <img src="https://www.form5472prep.com/email/banner.png" width="560" alt="Form5472 Prep"
                style="display:block;width:100%;height:auto;border:0;color:${EMAIL_STYLES.white};font-size:18px;font-weight:600;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;font-weight:600;color:${EMAIL_STYLES.ink};">${escapeHtml(heading)}</h1>
              ${bodyHtml}
              <table role="presentation" cellpadding="0" cellspacing="0">${ctaBlock}</table>
              ${closingHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid ${EMAIL_STYLES.border};background:${EMAIL_STYLES.bg};color:${EMAIL_STYLES.muted};font-size:12px;line-height:1.5;">
              Questions? Reply to this email or write to <a href="mailto:support@form5472prep.com" style="color:${EMAIL_STYLES.brand};text-decoration:none;">support@form5472prep.com</a>.
              <br/>Form5472 Prep · <a href="${footerUrl}" style="color:${EMAIL_STYLES.brand};text-decoration:none;">form5472prep.com</a>
              ${unsubscribeUrl ? `<br/><br/><a href="${escapeHtml(unsubscribeUrl)}" style="color:${EMAIL_STYLES.muted};text-decoration:underline;">Unsubscribe from filing reminders</a>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function customerShell({
  heading,
  salutation,
  bodyHtml,
  cta,
  footnoteHtml,
  unsubscribeUrl,
  preheader,
}: {
  heading: string;
  salutation: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  footnoteHtml?: string;
  unsubscribeUrl?: string;
  preheader?: string;
}) {
  const greeting = `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">Hello ${escapeHtml(salutation)},</p>`;
  const closingHtml = `${footnoteHtml ? `<div style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">${footnoteHtml}</div>` : ""}
    <p style="margin:0;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">Thank you,<br/>The Form5472 Prep team</p>`;
  return shell({ preheader: preheader ?? heading, heading, bodyHtml: `${greeting}${bodyHtml}`, cta, closingHtml, unsubscribeUrl });
}

export function adminShell({
  tag,
  heading,
  rows,
  extraHtml,
}: {
  tag: string;
  heading: string;
  rows: Array<[label: string, value: string]>;
  extraHtml?: string;
}) {
  const tableRows = rows
    .map(([label, value]) => `<tr>
      <td style="padding:7px 16px 7px 0;color:${EMAIL_STYLES.muted};font-size:13px;vertical-align:top;width:150px;">${escapeHtml(label)}</td>
      <td style="padding:7px 0;color:${EMAIL_STYLES.ink};font-size:13px;vertical-align:top;white-space:pre-wrap;word-break:break-word;">${escapeHtml(value)}</td>
    </tr>`)
    .join("");
  const bodyHtml = `
    <div style="margin:0 0 20px;padding:9px 12px;background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:6px;color:${EMAIL_STYLES.muted};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">Internal notification · ${escapeHtml(tag)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">${tableRows}</table>
    ${extraHtml ?? ""}`;
  return shell({ preheader: `${tag}: ${heading}`, heading, bodyHtml, internal: true });
}

function customerText(salutation: string, body: string, footnote?: string) {
  return `Hello ${salutation},\n\n${body}${footnote ? `\n\n${footnote}` : ""}\n\nThank you,\nThe Form5472 Prep team`;
}

export function firstNameFrom(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : null;
}

// ---------- 1. Magic-link email (existing) ----------

export async function sendMagicLinkEmail(email: string, link: string, filingLabel: string) {
  const heading = "Open your filing";
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Use the button below to access your filing (<strong>${escapeHtml(filingLabel)}</strong>) —
      download the generated PDF, upload your signed copy, and track the fax delivery to the IRS.
    </p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;">This link is good for 7 days.</p>`;

  return sendEmail({
    to: email,
    subject: "Your Form5472 Prep filing — access link",
    text: customerText(
      "there",
      `Use this secure link to open your filing (${filingLabel}):\n\n${link}\n\nThis link is good for 7 days. If you did not request this, you can ignore this email.`,
    ),
    html: customerShell({
      heading,
      salutation: "there",
      bodyHtml,
      cta: { label: "Open my filing", url: link },
    }),
  });
}

// ---------- 1b. Partner login link ----------

export async function sendPartnerLoginEmail(email: string, link: string, partnerName: string) {
  const heading = "Sign in to your partner dashboard";
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Use the button below to sign in to your Form5472 Prep
      partner dashboard — start new filings for your clients and track every one in a single place.
    </p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;">This link is good for 7 days.</p>`;

  return sendEmail({
    to: email,
    subject: "Your Form5472 Prep partner sign-in link",
    text: customerText(
      partnerName,
      `Use this secure link to sign in to your Form5472 Prep partner dashboard:\n\n${link}\n\nThis link is good for 7 days. If you did not request this, you can ignore this email.`,
    ),
    html: customerShell({
      heading,
      salutation: partnerName,
      bodyHtml,
      cta: { label: "Open partner dashboard", url: link },
    }),
  });
}

// ---------- 1c. Partner application acknowledgement ----------

export async function sendPartnerApplicationAckEmail(email: string, name: string) {
  const heading = "We received your partner application";
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Thank you for applying to the Form5472 Prep partner program. We&apos;ve received your details
      and our team is reviewing them.
    </p>
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      We approve partner accounts manually — usually within one business day. As soon as yours is
      active, you&apos;ll get a follow-up email with a secure sign-in link, and you can start
      preparing Form 5472 filings for your clients right away.
    </p>
    `;

  return sendEmail({
    to: email,
    subject: "We received your Form5472 Prep partner application",
    text: customerText(
      name,
      `Thank you for applying to the Form5472 Prep partner program. We've received your details and our team is reviewing them.\n\nWe approve partner accounts manually — usually within one business day. As soon as yours is active, you'll receive a follow-up email with a secure sign-in link.`,
    ),
    html: customerShell({
      heading,
      salutation: name,
      bodyHtml,
    }),
  });
}

// ---------- 2. Order confirmation email ----------

type OrderSignatureInfo = {
  label: string;
  page: number;
  instruction: string;
};

type OrderConfirmationArgs = {
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  tier: Tier;
  amountPaidCents: number; // total paid (may or may not include fax fee)
  faxService: boolean; // true = we fax it; false = customer self-faxes
  portalLink: string;
  receiptUrl?: string | null; // Stripe-hosted receipt
  // Filing ID is used to deeplink the email CTA to the sign page through
  // the magic-link auth handler's ?next= parameter.
  filingId?: string;
  // Source attribution — drives which tier table is used to render the
  // tier label + per-tier price in the email. Premium funnel sources are
  // billed at PREMIUM_TIERS so the email must show those values to match
  // what the customer was actually charged.
  funnelSource?: string | null;
  // Filled package — if present, we attach the PDF and list signature
  // locations directly in the email. If null/undefined, the email goes out
  // without an attachment (e.g. PDF generation failed and will be retried).
  pdfBytes?: Uint8Array | null;
  pdfFilename?: string;
  signatures?: OrderSignatureInfo[];
  // Post-purchase sequencing. FINAL short-year returns (dissolved LLC) get an
  // extra warning box: customers routinely cancel the EIN / tick "closed" with
  // their formation service the same week they buy, which can land the final
  // 5472 at an EIN the IRS has already retired.
  isFinalReturn?: boolean;
  // Pre-rendered deadline string (e.g. "April 15, 2026"). Caller computes it
  // from filingDueDateUtc() so the email never re-derives tax logic.
  dueDateText?: string | null;
};

// Append a `?next=` query param to a magic-link portal URL so the auth
// handler bounces the user to a specific in-app page after sign-in.
// Falls back to the bare portal link if appending fails (e.g. malformed URL).
function portalLinkWithNext(portalLink: string, nextPath: string): string {
  if (!nextPath || !nextPath.startsWith("/")) return portalLink;
  try {
    const u = new URL(portalLink);
    u.searchParams.set("next", nextPath);
    return u.toString();
  } catch {
    const sep = portalLink.includes("?") ? "&" : "?";
    return `${portalLink}${sep}next=${encodeURIComponent(nextPath)}`;
  }
}

export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  const {
    email, recipientName, llcName, taxYears, tier, amountPaidCents, portalLink, receiptUrl,
    pdfBytes, signatures, isFinalReturn, dueDateText,
  } = args;
  const salutation = firstNameFrom(recipientName) ?? "there";
  // Resolve the tier through pricing.ts so legacy tier values from old
  // filings still render a sensible label rather than crashing.
  const t = tierInfo(tier);
  const tierLabel = t.label;
  const tierPrice = formatUsd(t.priceCents);
  const yearCount = taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);
  const addOnCents = multiYearAddonCents(yearCount);
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(LLC name pending)";
  const hasPdf = !!pdfBytes && pdfBytes.byteLength > 0;
  const sigCount = signatures?.length ?? 0;

  // ----- Post-purchase sequencing -----
  // Deadline line, shown high in the email so the customer can sanity-check
  // that what they just bought lands before the date they were worried about.
  const dueDateHtml = dueDateText
    ? `<p style="margin:0 0 12px;color:${EMAIL_STYLES.slate};line-height:1.6;font-size:14px;">
         <strong style="color:${EMAIL_STYLES.ink};">Your filing deadline:</strong> ${escapeHtml(dueDateText)} — we prepare and file well before this.
       </p>`
    : "";

  // Amber warning — FINAL RETURNS ONLY, and deliberately the loudest block in
  // the "what happens next" section.
  const einWarningHtml = isFinalReturn
    ? `<div style="background:${EMAIL_STYLES.amberBg};border:1px solid ${EMAIL_STYLES.amberBorder};border-radius:8px;padding:14px 18px;margin:0 0 16px;color:${EMAIL_STYLES.amber};font-size:14px;line-height:1.6;">
         <strong style="display:block;margin:0 0 6px;color:${EMAIL_STYLES.amberDark};font-size:15px;">Before you close anything else</strong>
         Do not sign any EIN cancellation letter, and don't mark your closure task complete with your formation service, until we send you the fax transmission confirmation. Cancelling the EIN before the filing is transmitted can cause the IRS to reject or misfile your final return.
       </div>`
    : "";

  const nextImportantHtml = `
    <!-- What happens next — important -->
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">What happens next — important</p>
    ${einWarningHtml}
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 12px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.6;">
      <strong style="display:block;margin:0 0 6px;color:${EMAIL_STYLES.ink};">Your proof of filing</strong>
      The IRS does not send an acknowledgment for Form 5472. Your proof is the timestamped fax transmission report plus your filed copy — we email both to you at no charge once transmission completes.
    </div>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">
      Keep your filed copy and the transmission report with your LLC records for at least six years.
    </p>
  `;

  // Fax delivery is included on every tier — the row just states that
  // explicitly so the customer can see what they got.
  const faxFeeRowHtml = `<tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">IRS fax delivery</td><td align="right" style="padding:4px 0;">Included</td></tr>`;
  const multiYearRowHtml = extraYears > 0
    ? `<tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">+ ${extraYears} additional year${extraYears === 1 ? "" : "s"}</td><td align="right" style="padding:4px 0;">${formatUsd(addOnCents)}</td></tr>`
    : "";

  const step3Html = `<li style="margin-bottom:6px;">We fax it to the IRS Ogden PIN Unit and send you a delivery confirmation email.</li>`;
  const step3Text = `  3. We fax it to the IRS Ogden PIN Unit and email you confirmation.`;

  const introCopy = hasPdf
    ? "Thanks for your order. Your IRS filing package is ready — open your portal to review and sign it."
    : "Thanks for your order. We've received your payment and started preparing your IRS filing. You'll get the generated PDF in your portal within a few minutes.";

  const signaturesHtml = hasPdf && sigCount > 0
    ? `
    <!-- Sign in portal -->
    <p style="margin:24px 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">Sign your filing</p>
    <p style="margin:0 0 12px;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.5;">
      Open your portal, review the package, and draw your signature to acknowledge it. Our tax accountant will sign the final IRS forms before fax — no printing or uploading required on your end.
    </p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 12px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${introCopy}
    </p>
    ${dueDateHtml}
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.muted};font-size:13px;">
      Save <strong>donotreply@form5472prep.com</strong> to your contacts to make sure our filing emails reach your inbox.
    </p>

    ${signaturesHtml}

    <!-- Receipt -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid ${EMAIL_STYLES.border};font-size:13px;color:${EMAIL_STYLES.muted};text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Order receipt</td></tr>
      <tr><td style="padding:14px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${EMAIL_STYLES.ink};">
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">LLC</td><td align="right" style="padding:4px 0;">${escapeHtml(llcLine)}</td></tr>
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">Tax year${taxYears.length > 1 ? "s" : ""}</td><td align="right" style="padding:4px 0;">${escapeHtml(yearsLabel)}</td></tr>
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">Plan</td><td align="right" style="padding:4px 0;">${escapeHtml(tierLabel)} — ${tierPrice}</td></tr>
          ${faxFeeRowHtml}
          ${multiYearRowHtml}
          <tr><td style="padding:10px 0 4px;border-top:1px solid ${EMAIL_STYLES.border};font-weight:600;">Total paid</td><td align="right" style="padding:10px 0 4px;border-top:1px solid ${EMAIL_STYLES.border};font-weight:600;">${formatUsd(amountPaidCents)}</td></tr>
        </table>
      </td></tr>
    </table>

    <!-- What happens next -->
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">What happens next</p>
    <ol style="margin:0 0 24px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      <li style="margin-bottom:6px;">We generate your filled <strong>Form 5472 + pro forma Form 1120</strong> (≈ 2 min).</li>
      <li style="margin-bottom:6px;">You open your portal, review the package, and draw your signature to acknowledge it. A qualified tax accountant on our team then reviews the package end-to-end before we fax it to the IRS.</li>
      ${step3Html}
    </ol>

    ${nextImportantHtml}

    ${receiptUrl ? `<p style="margin:0 0 20px;font-size:13px;color:${EMAIL_STYLES.muted};">A detailed payment receipt is also available on <a href="${receiptUrl}" style="color:${EMAIL_STYLES.brand};text-decoration:none;">Stripe</a>.</p>` : ""}
  `;

  const faxFeeTextLine = `  Fax delivery:  Included\n`;
  const multiYearTextLine = extraYears > 0
    ? `  + ${extraYears} extra year${extraYears === 1 ? "" : "s"}: ${formatUsd(addOnCents)}\n`
    : "";

  const signaturesText = hasPdf && sigCount > 0
    ? `\nReview the package in your portal and draw your signature to acknowledge it. Our accountant signs the IRS forms before fax.\n`
    : "";

  const nextStepsText = hasPdf
    ? `What to do next:\n` +
      `  1. Open your portal: ${portalLink}\n` +
      `  2. Draw your signature once — we apply it to every required box.\n` +
      step3Text + "\n"
    : `What happens next:\n` +
      `  1. We generate your Form 5472 + pro forma 1120 (≈ 2 min).\n` +
      `  2. You open the portal to sign in-browser. A qualified tax accountant on our team reviews the package end-to-end before we fax it to the IRS.\n` +
      step3Text + "\n";

  // Plain-text mirror of the post-purchase sequencing section above.
  const dueDateLineText = dueDateText
    ? `Your filing deadline: ${dueDateText} — we prepare and file well before this.\n\n`
    : "";
  const nextImportantText =
    `What happens next — important\n\n` +
    (isFinalReturn
      ? `  Before you close anything else\n` +
        `  Do not sign any EIN cancellation letter, and don't mark your closure task complete\n` +
        `  with your formation service, until we send you the fax transmission confirmation.\n` +
        `  Cancelling the EIN before the filing is transmitted can cause the IRS to reject or\n` +
        `  misfile your final return.\n\n`
      : "") +
    `  Your proof of filing\n` +
    `  The IRS does not send an acknowledgment for Form 5472. Your proof is the timestamped\n` +
    `  fax transmission report plus your filed copy — we email both to you at no charge once\n` +
    `  transmission completes.\n\n` +
    `  Keep your filed copy and the transmission report with your LLC records for at least six years.\n`;

  return sendEmail({
    to: email,
    subject: hasPdf
      ? `Your Form 5472 filing package — ${sigCount} signature${sigCount === 1 ? "" : "s"} needed`
      : `Order confirmed — Form5472 Prep filing (${yearsLabel})`,
    text: customerText(
      salutation,
      `Thank you for your order.\n\n` +
      dueDateLineText +
      `Tip: save donotreply@form5472prep.com to your contacts so our emails reach your inbox.\n\n` +
      `Order summary:\n` +
      `  LLC:           ${llcLine}\n` +
      `  Tax year(s):   ${yearsLabel}\n` +
      `  Plan:          ${tierLabel} — ${tierPrice}\n` +
      faxFeeTextLine +
      multiYearTextLine +
      `  Total paid:    ${formatUsd(amountPaidCents)}\n` +
      signaturesText + "\n" +
      nextStepsText + "\n" +
      nextImportantText + "\n" +
      `Open your filing: ${portalLink}`,
    ),
    html: customerShell({
      heading: hasPdf ? "Your filing is ready to sign" : "Order confirmed",
      salutation,
      bodyHtml,
      // When the PDF is ready, deep-link straight to the sign page via the
      // magic-link's ?next= deeplink so the customer skips the dashboard.
      cta: hasPdf
        ? { label: "Sign my filing", url: portalLinkWithNext(portalLink, `/filings/${args.filingId ?? ""}/sign`) }
        : { label: "Open my filing", url: portalLink },
    }),
  });
}

// ---------- 3. Fax delivered email ----------

export type FaxProof = {
  faxId: string;
  deliveredAt: string; // ISO timestamp
  pageCount?: number | null;
  durationSecs?: number | null;
  from?: string | null;
  to?: string | null;
};

function formatFaxProofRows(proof: FaxProof): string {
  const rows: Array<[string, string]> = [
    ["IRS fax number", proof.to ?? "+1 (855) 887-7737 (Ogden PIN Unit)"],
    ["Delivered at", new Date(proof.deliveredAt).toUTCString()],
  ];
  if (proof.pageCount != null) rows.push(["Pages transmitted", String(proof.pageCount)]);
  if (proof.durationSecs != null) rows.push(["Transmission duration", `${proof.durationSecs}s`]);
  if (proof.from) rows.push(["Sent from", proof.from]);
  rows.push(["Telnyx confirmation ID", proof.faxId]);

  return rows
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:6px 12px 6px 0;color:${EMAIL_STYLES.subtle};font-size:13px;vertical-align:top;">${escapeHtml(k)}</td>
          <td style="padding:6px 0;color:${EMAIL_STYLES.ink};font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");
}

export async function sendFaxDeliveredEmail(args: {
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
  proof?: FaxProof;
  signedPdfBytes?: Uint8Array | Buffer;
  // Generated IRS Fax Transmission Receipt PDF. Attached separately from
  // the signed-package PDF so the customer can keep / forward / file the
  // proof-of-delivery document on its own.
  receiptPdfBytes?: Uint8Array | Buffer;
}) {
  const { email, recipientName, llcName, taxYears, portalLink, proof, signedPdfBytes, receiptPdfBytes } = args;
  const salutation = firstNameFrom(recipientName) ?? "there";
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const proofTable = proof
    ? `
      <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">Proof of fax</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
        ${formatFaxProofRows(proof)}
      </table>
      ${signedPdfBytes ? `<p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};font-size:13px;">The exact PDF transmitted to the IRS is available for download in your portal.</p>` : ""}
    `
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Good news — your signed Form 5472 + pro forma 1120 for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}) was successfully faxed
      to the IRS Ogden PIN Unit.
    </p>
    <div style="background:${EMAIL_STYLES.greenBg};border:1px solid ${EMAIL_STYLES.greenBorder};border-radius:8px;padding:14px 18px;margin:0 0 20px;color:${EMAIL_STYLES.greenDark};font-size:14px;">
      <strong>✓ Delivered to the IRS</strong> — keep this email as your proof of submission.
    </div>
    ${proofTable}
    ${receiptPdfBytes ? `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      A timestamped <strong>IRS Fax Transmission Receipt</strong> is saved in your portal — download
      it to keep with your tax records. Under IRC § 6038A it serves as proof of on-time filing if
      the IRS ever asks.
    </p>` : ""}
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">What's next</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      The IRS doesn't send acknowledgments for faxed 5472 filings, so no further action is required.
      You can re-download the receipt and your filing package anytime from your portal.
    </p>
  `;

  const proofText = proof
    ? `\nProof of fax\n` +
      `  IRS fax number: ${proof.to ?? "+1 (855) 887-7737 (Ogden PIN Unit)"}\n` +
      `  Delivered at:   ${new Date(proof.deliveredAt).toUTCString()}\n` +
      (proof.pageCount != null ? `  Pages:          ${proof.pageCount}\n` : "") +
      (proof.durationSecs != null ? `  Duration:       ${proof.durationSecs}s\n` : "") +
      (proof.from ? `  Sent from:      ${proof.from}\n` : "") +
      `  Confirmation:   ${proof.faxId}\n`
    : "";

  return sendEmail({
    to: email,
    subject: `Your ${llcLine} filing was delivered to the IRS`,
    text: customerText(
      salutation,
      `Your signed Form 5472 + pro forma 1120 for ${llcLine} (${yearsLabel}) was successfully faxed to the IRS Ogden PIN Unit.\n\n` +
      `Keep this email as your proof of submission. Download your timestamped IRS Fax Transmission Receipt from your portal — it serves as proof of on-time filing.\n` +
      `The IRS doesn't send acknowledgments for faxed 5472 filings, so no further action is required.\n` +
      proofText +
      `\nView your filing and download documents: ${portalLink}`,
    ),
    html: customerShell({
      heading: "Your filing was delivered to the IRS",
      salutation,
      bodyHtml,
      cta: { label: "View my filing", url: portalLink },
    }),
  });
}

// Admin notification when a new order is placed (Stripe checkout succeeded
// OR a $0 test order was created via /admin/test-order). Lets the operator
// know "new paid order waiting" without having to poll the admin dashboard.
// No PDF attachment — generation is async and may not be done by the time
// this fires; the admin can grab the PDF from the linked filing page once
// generation completes.
export async function sendNewOrderAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  tier: Tier;
  amountPaidCents: number;
  isTestOrder: boolean;
  pdfGenerated: boolean;
}) {
  const {
    adminEmail,
    customerEmail,
    llcName,
    taxYears,
    filingId,
    adminFilingUrl,
    tier,
    amountPaidCents,
    isTestOrder,
    pdfGenerated,
  } = args;
  const yearsLabel = taxYears.join(", ") || "(none)";
  const llcLine = llcName ?? "(no LLC name)";
  const tierLabel = tierInfo(tier).label;
  const amountLabel = isTestOrder ? "$0.00 (TEST ORDER)" : formatUsd(amountPaidCents);

  return sendEmail({
    to: adminEmail,
    subject: `${isTestOrder ? "[Test order]" : "[New order]"} ${llcLine} (${yearsLabel})`,
    text:
      `${isTestOrder ? "Admin test order created (Stripe bypassed, $0)." : "New paid order received."}\n\n` +
      `Customer:      ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:           ${llcLine}\n` +
      `Tax year(s):   ${yearsLabel}\n` +
      `Tier:          ${tierLabel}\n` +
      `Amount paid:   ${amountLabel}\n` +
      `PDF generated: ${pdfGenerated ? "yes" : "no — check filing for missing fields"}\n` +
      `Filing ID:     ${filingId}\n` +
      `\nAdmin view: ${adminFilingUrl}\n`,
    html: adminShell({
      tag: "Orders",
      heading: isTestOrder ? "Test order created" : "New order received",
      rows: [
        ["Customer", customerEmail ?? "(anonymous)"],
        ["LLC", llcLine],
        ["Tax years", yearsLabel],
        ["Tier", tierLabel],
        ["Amount paid", amountLabel],
        ["PDF generated", pdfGenerated ? "Yes" : "No — check filing for missing fields"],
        ["Filing ID", filingId],
        ["Admin view", adminFilingUrl],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">Next step: review the filing, place the customer signature after it is provided in the portal, then fax the filing to the IRS.</p>`,
    }),
  });
}

// Admin notification when a fax succeeds. Plain, scannable format.
// Attaches BOTH the IRS Fax Transmission Receipt and a frozen copy of the
// exact signed PDF that was faxed — so the operator has the full proof-of-
// filing artifact in one inbox message without having to log into admin
// and download each piece separately. Customer email keeps only the
// receipt (signed package is already in their portal).
export async function sendFaxDeliveredAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  proof: FaxProof;
  receiptPdfBytes?: Uint8Array | Buffer;
  signedPdfBytes?: Uint8Array | Buffer;
}) {
  const {
    adminEmail,
    customerEmail,
    llcName,
    taxYears,
    filingId,
    adminFilingUrl,
    proof,
    receiptPdfBytes,
    signedPdfBytes,
  } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";

  // Filename hygiene: scrub the LLC name down to alphanumerics + dashes so
  // mail clients don't choke on Unicode / punctuation in attachment headers.
  const safeLlc = llcLine.replace(/[^a-zA-Z0-9-]+/g, "_");
  const safeYears = yearsLabel.replace(/[^0-9-]+/g, "-");
  const attachments: Array<{ filename: string; content: Uint8Array | Buffer }> = [];
  if (receiptPdfBytes) {
    attachments.push({
      filename: `IRS-fax-receipt-${safeLlc}-${safeYears}.pdf`,
      content: receiptPdfBytes,
    });
  }
  if (signedPdfBytes) {
    attachments.push({
      filename: `form5472-${safeLlc}-${safeYears}-faxed.pdf`,
      content: signedPdfBytes,
    });
  }

  return sendEmail({
    to: adminEmail,
    subject: `[Fax delivered] ${llcLine} (${yearsLabel})`,
    text:
      `Fax delivered to IRS.\n\n` +
      `Customer:    ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n` +
      `Filing ID:   ${filingId}\n` +
      `Telnyx ID:   ${proof.faxId}\n` +
      `Delivered:   ${new Date(proof.deliveredAt).toUTCString()}\n` +
      (proof.pageCount != null ? `Pages:       ${proof.pageCount}\n` : "") +
      (proof.durationSecs != null ? `Duration:    ${proof.durationSecs}s\n` : "") +
      `\nAttachments: ${attachments.map((a) => a.filename).join(", ") || "(none)"}\n` +
      `\nAdmin view: ${adminFilingUrl}\n`,
    html: adminShell({
      tag: "Fax delivery",
      heading: "Fax delivered to IRS",
      rows: [
        ["Customer", customerEmail ?? "(anonymous)"],
        ["LLC", llcLine],
        ["Tax years", yearsLabel],
        ["Filing ID", filingId],
        ["IRS fax number", proof.to ?? "+1 (855) 887-7737 (Ogden PIN Unit)"],
        ["Delivered at", new Date(proof.deliveredAt).toUTCString()],
        ...(proof.pageCount != null ? [["Pages transmitted", String(proof.pageCount)] as [string, string]] : []),
        ...(proof.durationSecs != null ? [["Transmission duration", `${proof.durationSecs}s`] as [string, string]] : []),
        ...(proof.from ? [["Sent from", proof.from] as [string, string]] : []),
        ["Telnyx confirmation ID", proof.faxId],
        ["Admin view", adminFilingUrl],
      ],
      extraHtml: attachments.length > 0
        ? `<p style="margin:0;color:${EMAIL_STYLES.subtle};font-size:13px;line-height:1.6;"><strong>Attachments:</strong> ${escapeHtml(attachments.map((attachment) => attachment.filename).join(", "))}</p>`
        : undefined,
    }),
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

// Admin notification when a fax permanently fails (retries exhausted).
export async function sendFaxFailedAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  faxId: string;
  failureReason: string | null;
  deliveryAttempts: number;
}) {
  const { adminEmail, customerEmail, llcName, taxYears, filingId, adminFilingUrl, faxId, failureReason, deliveryAttempts } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";

  return sendEmail({
    to: adminEmail,
    subject: `[Fax failed] ${llcLine} (${yearsLabel}) — ${failureReason ?? "unknown"}`,
    text:
      `Fax to IRS failed after ${deliveryAttempts} attempt(s).\n\n` +
      `Customer:    ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n` +
      `Filing ID:   ${filingId}\n` +
      `Telnyx ID:   ${faxId}\n` +
      `Reason:      ${failureReason ?? "unknown"}\n` +
      `\nAdmin view: ${adminFilingUrl}\n`,
    html: adminShell({
      tag: "Fax delivery",
      heading: "Fax to IRS failed — manual action needed",
      rows: [
        ["Customer", customerEmail ?? "(anonymous)"],
        ["LLC", llcLine],
        ["Tax years", yearsLabel],
        ["Filing ID", filingId],
        ["Telnyx fax ID", faxId],
        ["Delivery attempts", String(deliveryAttempts)],
        ["Failure reason", failureReason ?? "unknown"],
        ["Admin view", adminFilingUrl],
      ],
      extraHtml: `<div style="background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:8px;padding:14px 18px;color:${EMAIL_STYLES.redDark};font-size:14px;line-height:1.6;">The customer has been notified separately. Manual intervention is required.</div>`,
    }),
  });
}

// ---------- 4. Fax failed email ----------

export async function sendFaxFailedEmail(args: {
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
}) {
  const { email, recipientName, llcName, taxYears, portalLink } = args;
  const salutation = firstNameFrom(recipientName) ?? "there";
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      We tried to fax your signed Form 5472 + pro forma 1120 for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}) to the IRS Ogden PIN Unit,
      but the transmission didn't go through after multiple attempts.
    </p>
    <div style="background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:8px;padding:14px 18px;margin:0 0 20px;color:${EMAIL_STYLES.redDark};font-size:14px;">
      <strong>Fax delivery failed</strong> — no action lost. Our team has been notified and will
      reach out within one business day with next steps (manual retry or refund).
    </div>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      You don't need to do anything right now. If you have questions in the meantime,
      reply to this email and we'll get back to you quickly.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `Action needed — fax to IRS failed (${llcLine})`,
    text: customerText(
      salutation,
      `We tried to fax your signed Form 5472 + pro forma 1120 for ${llcLine} (${yearsLabel}) to the IRS Ogden PIN Unit, but transmission failed after multiple attempts.\n\n` +
      `Our team has been notified and will reach out within one business day with next steps. You don't need to do anything right now.\n\n` +
      `View your filing: ${portalLink}`,
    ),
    html: customerShell({
      heading: "We could not fax your filing",
      salutation,
      bodyHtml,
      cta: { label: "View my filing", url: portalLink },
    }),
  });
}


// ---------- 5a. New portal message — admin → customer ----------

// Fires when admin posts a message into a filing's thread AND the customer
// currently has zero unread admin messages (so we don't double-notify on a
// rapid back-and-forth). Email is intentionally light on content — the
// portal thread is the source of truth.
export async function sendNewMessageToCustomerEmail(args: {
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  bodyExcerpt: string;
  portalLink: string;
}) {
  const { email, recipientName, llcName, taxYears, bodyExcerpt, portalLink } = args;
  const salutation = firstNameFrom(recipientName) ?? "there";
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      You have a new message from our team about <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}).
    </p>
    <blockquote style="margin:0 0 20px;padding:14px 18px;background:${EMAIL_STYLES.bg};border-left:3px solid ${EMAIL_STYLES.brand};color:${EMAIL_STYLES.ink};font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyExcerpt)}</blockquote>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      Open your portal to read the full message and reply.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `New message about your filing — ${llcLine}`,
    text: customerText(
      salutation,
      `You have a new message from our team about ${llcLine} (${yearsLabel}).\n\n` +
      `${bodyExcerpt}\n\n` +
      `Open your portal to read and reply: ${portalLink}`,
    ),
    html: customerShell({
      heading: "You have a new message",
      salutation,
      bodyHtml,
      cta: { label: "Open my portal", url: portalLink },
    }),
  });
}

// ---------- 5b. New portal message — customer → admin ----------

export async function sendNewMessageToAdminEmail(args: {
  adminEmail: string;
  customerEmail: string;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  bodyExcerpt: string;
}) {
  const { adminEmail, customerEmail, llcName, taxYears, filingId, adminFilingUrl, bodyExcerpt } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";

  return sendEmail({
    to: adminEmail,
    subject: `[New message] ${llcLine} from ${customerEmail}`,
    text:
      `${customerEmail} sent a new message about ${llcLine} (${yearsLabel}).\n\n` +
      `${bodyExcerpt}\n\n` +
      `Filing ID: ${filingId}\n` +
      `Reply in admin: ${adminFilingUrl}\n`,
    html: adminShell({
      tag: "Customer message",
      heading: "New message from customer",
      rows: [
        ["Customer", customerEmail],
        ["LLC", llcLine],
        ["Tax years", yearsLabel],
        ["Filing ID", filingId],
        ["Message", bodyExcerpt],
        ["Admin view", adminFilingUrl],
      ],
    }),
  });
}

// ---------- 6. January reminder (annual marketing email) ----------

type ReminderArgs = {
  email: string;
  taxYearToFile: number; // e.g. 2025 if reminding in January 2026 about the 2025 tax year
  previousLlcNames: string[]; // distinct LLCs the customer has filed for before
  startLink: string; // CTA to start a new filing
  unsubscribeUrl: string;
};

export async function sendJanuaryReminderEmail(args: ReminderArgs) {
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  // Shared rule owns the date — never a hardcoded April 15. Prospect mail, so
  // there are no extension facts to apply: this is the original due date.
  const deadline = formatDueDate(filingDueDateUtc(taxYearToFile));
  const llcLine =
    previousLlcNames.length === 0
      ? "your foreign-owned LLC"
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : `${previousLlcNames.slice(0, -1).join(", ")} and ${previousLlcNames[previousLlcNames.length - 1]}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      The new filing season is here. The IRS requires foreign-owned US LLCs to file
      <strong>Form 5472 + pro forma Form 1120</strong> every year, even if there was no income.
    </p>
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      For ${escapeHtml(llcLine)}, your <strong>${taxYearToFile}</strong> tax year filing is due by
      <strong>${deadline}</strong>. Start now and have it filed in ~15 minutes —
      we'll pull your previous answers forward so you don't re-enter the LLC details.
    </p>
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 24px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.5;">
      <strong style="color:${EMAIL_STYLES.ink};">Why now?</strong> Filing in January means no last-minute rush
      and no risk of IRS late-filing penalties on Form 5472.
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Time to file your ${taxYearToFile} Form 5472`,
    text:
      `Hello there,\n\nYour ${taxYearToFile} Form 5472 + pro forma 1120 for ${llcLine} is due by ${deadline}.\n\n` +
      `File now in ~15 minutes — we'll pull your previous answers forward: ${startLink}\n\n` +
      `Filing early avoids IRS late-filing penalties on Form 5472.\n\n` +
      `Thank you,\nThe Form5472 Prep team\n\n` +
      `Unsubscribe from filing reminders: ${unsubscribeUrl}`,
    html: customerShell({
      heading: `Time to file your ${taxYearToFile} Form 5472`,
      salutation: "there",
      bodyHtml,
      cta: { label: `File my ${taxYearToFile} return`, url: startLink },
      unsubscribeUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

// ---------- 6. March deadline reminder (second touch) ----------

export async function sendMarchReminderEmail(args: ReminderArgs) {
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  // Never hardcode April 15: the shared rule owns the date (and rolls a
  // weekend deadline forward, e.g. tax year 2027 is really due April 17 2028).
  // No extension facts here — this reminder goes to a prospect with no filing
  // on record, so it is the ordinary original due date by definition.
  const deadline = formatDueDate(filingDueDateUtc(taxYearToFile));
  const llcLine =
    previousLlcNames.length === 0
      ? "your foreign-owned LLC"
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : `${previousLlcNames.slice(0, -1).join(", ")} and ${previousLlcNames[previousLlcNames.length - 1]}`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Quick reminder — your <strong>${taxYearToFile}</strong> Form 5472 for
      ${escapeHtml(llcLine)} is due in about <strong>30 days</strong> (deadline: ${deadline}).
    </p>
    <div style="background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:8px;padding:14px 18px;margin:0 0 20px;color:${EMAIL_STYLES.redDark};font-size:14px;line-height:1.5;">
      <strong>Heads up:</strong> the IRS imposes significant late-filing penalties for Form 5472 —
      act now to file on time.
    </div>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      The filing takes ~15 minutes from start to faxed-with-the-IRS. We've kept your previous
      LLC and owner details on file so you can move fast.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `30 days left — file your ${taxYearToFile} Form 5472 before ${deadline}`,
    text:
      `Hello there,\n\nYour ${taxYearToFile} Form 5472 for ${llcLine} is due in about 30 days (deadline: ${deadline}).\n\n` +
      `The IRS imposes significant late-filing penalties on Form 5472. Take 15 minutes now and we'll fax it to the IRS today: ${startLink}\n\n` +
      `Thank you,\nThe Form5472 Prep team\n\n` +
      `Unsubscribe from filing reminders: ${unsubscribeUrl}`,
    html: customerShell({
      heading: `Your ${taxYearToFile} Form 5472 deadline is in 30 days`,
      salutation: "there",
      bodyHtml,
      cta: { label: `File my ${taxYearToFile} return now`, url: startLink },
      unsubscribeUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

// ---------- 7. Abandoned-draft reminder (one-shot) ----------

type AbandonedDraftArgs = {
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  resumeLink: string;
  unsubscribeUrl: string;
  // "first" = the 24-hour nudge (default). "final" = the ~1-month follow-up,
  // which reads as a gentler "still saved" reminder rather than "you just
  // didn't finish".
  variant?: "first" | "final";
};

export async function sendAbandonedDraftReminderEmail(args: AbandonedDraftArgs) {
  const { email, recipientName, llcName, resumeLink, unsubscribeUrl, variant = "first" } = args;
  const salutation = firstNameFrom(recipientName) ?? "there";
  const llcLine = llcName ? escapeHtml(llcName) : "your foreign-owned LLC";
  const llcPlain = llcName ?? "your foreign-owned LLC";
  const isFinal = variant === "final";

  const subject = isFinal
    ? "Still time to file your Form 5472 — your draft is saved"
    : "Finish your Form 5472 filing — your progress is saved";
  const heading = isFinal ? "Your Form 5472 draft is still saved" : "Finish your Form 5472 filing";
  const preheader = isFinal
    ? "It's been about a month — your draft is still saved and takes ~15 minutes to finish."
    : "Your progress is saved. Pick up where you left off — about 15 minutes left.";
  const introHtml = isFinal
    ? `It's been about a month since you started a Form 5472 filing for <strong>${llcLine}</strong>.
       Your progress is still saved — you can pick up right where you left off whenever you're ready.`
    : `You started a Form 5472 filing for <strong>${llcLine}</strong> but didn't finish.
       Your progress is saved — you can pick up right where you left off.`;
  const introText = isFinal
    ? `It's been about a month since you started a Form 5472 filing for ${llcPlain}. Your progress is still saved.`
    : `You started a Form 5472 filing for ${llcPlain} but didn't finish.\n\nYour progress is saved.`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${introHtml}
    </p>
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      Most customers finish in about <strong>15 minutes</strong>. The IRS imposes
      significant penalties for missing Form 5472 filings, so it's worth completing today.
    </p>
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 24px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.5;">
      <strong style="color:${EMAIL_STYLES.ink};">Need help?</strong> Just reply to this email and we'll
      walk you through whatever you got stuck on.
    </div>`;

  return sendEmail({
    to: email,
    subject,
    text:
      `Hello ${salutation},\n\n${introText}\n\n` +
      `Pick up where you left off (most customers finish in ~15 minutes):\n` +
      `${resumeLink}\n\n` +
      `The IRS imposes significant penalties for missing Form 5472 filings — worth completing today.\n\n` +
      `If you need help, reply to this email.\n\nThank you,\nThe Form5472 Prep team\n\n` +
      `Unsubscribe from these emails: ${unsubscribeUrl}`,
    html: customerShell({ preheader,
      heading,
      salutation,
      bodyHtml,
      cta: { label: "Resume my filing", url: resumeLink },
      unsubscribeUrl,
    }),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

// ---------- Application, contact, authentication, and partner emails ----------

type EinApplicationEmailArgs = {
  fullName: string;
  email: string;
  phone?: string;
  llcName: string;
  llcState?: string;
  llcFormedDate?: string;
  businessPurpose?: string;
  ownerName?: string;
  ownerCitizenship?: string;
  ownerResidence?: string;
  passportNumber?: string;
  notes?: string;
};

export async function sendEinApplicationAdminEmail(args: EinApplicationEmailArgs & { adminEmail: string }) {
  const value = (input?: string, fallback = "(not provided)") => input || fallback;
  return sendEmail({
    to: args.adminEmail,
    replyTo: args.email,
    subject: `[EIN Application] ${args.fullName} — ${args.llcName}`,
    text: [
      "New EIN application",
      "",
      `Name: ${args.fullName}`,
      `Email: ${args.email}`,
      `Phone: ${value(args.phone)}`,
      `LLC name: ${args.llcName}`,
      `State: ${value(args.llcState)}`,
      `Formed date: ${value(args.llcFormedDate)}`,
      `Business purpose: ${value(args.businessPurpose)}`,
      `Owner name: ${value(args.ownerName, "(same as contact)")}`,
      `Citizenship: ${value(args.ownerCitizenship)}`,
      `Residence: ${value(args.ownerResidence)}`,
      `Passport number: ${value(args.passportNumber)}`,
      `Notes: ${value(args.notes, "(none)")}`,
      "",
      "Reply directly to this email to contact the applicant.",
    ].join("\n"),
    html: adminShell({
      tag: "EIN application",
      heading: "New EIN application",
      rows: [
        ["Name", args.fullName],
        ["Email", args.email],
        ["Phone", value(args.phone)],
        ["LLC name", args.llcName],
        ["State", value(args.llcState)],
        ["Formed date", value(args.llcFormedDate)],
        ["Business purpose", value(args.businessPurpose)],
        ["Owner name", value(args.ownerName, "(same as contact)")],
        ["Citizenship", value(args.ownerCitizenship)],
        ["Residence", value(args.ownerResidence)],
        ["Passport number", value(args.passportNumber)],
        ["Notes", value(args.notes, "(none)")],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to contact the applicant.</p>`,
    }),
  });
}

export async function sendEinApplicationConfirmationEmail(args: {
  email: string;
  fullName: string;
  llcName: string;
  portalLink: string;
}) {
  const body = `We've received your EIN application for ${args.llcName}.\n\nOur team will reach out within 1 business day with a document checklist and payment link.\n\nTrack your application status in your client portal:\n${args.portalLink}`;
  return sendEmail({
    to: args.email,
    subject: "EIN application received — Form5472 Prep",
    text: customerText(args.fullName, body),
    html: customerShell({
      heading: "We received your EIN application",
      salutation: args.fullName,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">We&apos;ve received your EIN application for <strong>${escapeHtml(args.llcName)}</strong>.</p>
        <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">Our team will reach out within <strong>1 business day</strong> with a document checklist and payment link.</p>`,
      cta: { label: "View my application", url: args.portalLink },
    }),
  });
}

type ItinApplicationEmailArgs = {
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  countryOfBirth?: string;
  citizenship?: string;
  countryOfResidence?: string;
  itinReason: string;
  taxReturnType?: string;
  usActivity?: string;
  passportNumber?: string;
  passportExpiry?: string;
  notes?: string;
};

export async function sendItinApplicationAdminEmail(args: ItinApplicationEmailArgs & { adminEmail: string }) {
  const value = (input?: string, fallback = "(not provided)") => input || fallback;
  return sendEmail({
    to: args.adminEmail,
    replyTo: args.email,
    subject: `[ITIN Application] ${args.fullName} — ${args.itinReason}`,
    text: [
      "New ITIN application",
      "",
      `Name: ${args.fullName}`,
      `Email: ${args.email}`,
      `Phone: ${value(args.phone)}`,
      `Date of birth: ${value(args.dateOfBirth)}`,
      `Country of birth: ${value(args.countryOfBirth)}`,
      `Citizenship: ${value(args.citizenship)}`,
      `Country of residence: ${value(args.countryOfResidence)}`,
      `Reason (W-7): ${args.itinReason}`,
      `Tax return type: ${value(args.taxReturnType, "(not applicable)")}`,
      `US activity: ${value(args.usActivity)}`,
      `Passport number: ${value(args.passportNumber)}`,
      `Passport expiry: ${value(args.passportExpiry)}`,
      `Notes: ${value(args.notes, "(none)")}`,
      "",
      "Reply directly to this email to contact the applicant.",
    ].join("\n"),
    html: adminShell({
      tag: "ITIN application",
      heading: "New ITIN application",
      rows: [
        ["Name", args.fullName],
        ["Email", args.email],
        ["Phone", value(args.phone)],
        ["Date of birth", value(args.dateOfBirth)],
        ["Country of birth", value(args.countryOfBirth)],
        ["Citizenship", value(args.citizenship)],
        ["Country of residence", value(args.countryOfResidence)],
        ["Reason (W-7)", args.itinReason],
        ["Tax return type", value(args.taxReturnType, "(not applicable)")],
        ["US activity", value(args.usActivity)],
        ["Passport number", value(args.passportNumber)],
        ["Passport expiry", value(args.passportExpiry)],
        ["Notes", value(args.notes, "(none)")],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to contact the applicant.</p>`,
    }),
  });
}

export async function sendItinApplicationConfirmationEmail(args: {
  email: string;
  fullName: string;
  portalLink: string;
}) {
  const body = `We've received your ITIN application.\n\nOur team will reach out within 1 business day with a document checklist, CAA certification appointment details, and payment link.\n\nTrack your application status in your client portal:\n${args.portalLink}`;
  return sendEmail({
    to: args.email,
    subject: "ITIN application received — Form5472 Prep",
    text: customerText(args.fullName, body),
    html: customerShell({
      heading: "We received your ITIN application",
      salutation: args.fullName,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">We&apos;ve received your ITIN application.</p>
        <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">Our team will review it and reach out within <strong>1 business day</strong> with next steps, including the document checklist, CAA certification appointment, and payment link.</p>`,
      cta: { label: "View my application", url: args.portalLink },
    }),
  });
}

function subjectSnippet(message: string, maxLength = 60) {
  if (message.length <= maxLength) return message;
  const initial = message.slice(0, maxLength).trimEnd();
  const boundary = /\s/.test(message.charAt(maxLength)) ? initial.length : initial.lastIndexOf(" ");
  const wholeWords = boundary > 0 ? initial.slice(0, boundary).trimEnd() : "Message received";
  return `${wholeWords}…`;
}

export async function sendWebsiteQuestionAdminEmail(args: {
  adminEmail: string;
  name?: string;
  email: string;
  message: string;
  topicLabel?: string;
  pageUrl?: string;
}) {
  const displayName = args.name || "(not provided)";
  const subjectParts = [args.topicLabel, args.name, subjectSnippet(args.message)].filter(Boolean).join(" — ");
  return sendEmail({
    to: args.adminEmail,
    replyTo: args.email,
    subject: `[Website question] ${subjectParts}`,
    text: [
      "New question from the website",
      "",
      `Name: ${displayName}`,
      `Email: ${args.email}`,
      args.topicLabel ? `Topic: ${args.topicLabel}` : "",
      args.pageUrl ? `Page: ${args.pageUrl}` : "",
      "",
      "Message:",
      args.message,
      "",
      "Reply directly to this email to answer the visitor.",
    ].filter(Boolean).join("\n"),
    html: adminShell({
      tag: "Website question",
      heading: "New question from the website",
      rows: [
        ["Name", displayName],
        ["Email", args.email],
        ...(args.topicLabel ? [["Topic", args.topicLabel] as [string, string]] : []),
        ...(args.pageUrl ? [["Page", args.pageUrl] as [string, string]] : []),
        ["Message", args.message],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to answer the visitor.</p>`,
    }),
  });
}

export async function sendAdminLoginEmail(args: {
  email: string;
  link: string;
  appLink: string;
}) {
  const body = `Use this secure link to sign in to Form5472 Prep:\n\nSign in on the web:\n${args.link}\n\nSign in on the iPhone app:\n${args.appLink}\n\nThis link expires in 15 minutes and can only be used once. Using either link consumes it, so choose the service you want to use.`;
  return sendEmail({
    to: args.email,
    subject: "Your Form5472 Prep admin sign-in link",
    text: customerText("administrator", body),
    html: customerShell({
      heading: "Sign in to Form5472 Prep",
      salutation: "administrator",
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">Use this secure link to sign in to Form5472 Prep.</p>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">You can also <a href="${escapeHtml(args.appLink)}" style="color:${EMAIL_STYLES.brand};text-decoration:none;">sign in on the iPhone app</a>.</p>
        <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};line-height:1.6;font-size:13px;">This link expires in 15 minutes and can only be used once. Using either link consumes it, so choose the service you want to use.</p>`,
      cta: { label: "Sign in", url: args.link },
    }),
  });
}

export function sendPartnerApplicationAdminEmail(args: {
  adminEmail: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  wantsWhiteLabel: boolean;
  notes?: string;
  adminPartnersUrl: string;
}): ReturnType<typeof sendEmail>;
export function sendPartnerApplicationAdminEmail(args: {
  adminEmail: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  wantsWhiteLabel?: boolean;
  notes?: string;
  adminPartnersUrl: string;
}): ReturnType<typeof sendEmail>;
export async function sendPartnerApplicationAdminEmail(args: {
  adminEmail: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  wantsWhiteLabel?: boolean;
  notes?: string;
  adminPartnersUrl: string;
}) {
  const wantsWhiteLabel = args.wantsWhiteLabel === true;
  const whiteLabelText = wantsWhiteLabel ? "Yes — wants their own branding" : "No";
  return sendEmail({
    to: args.adminEmail,
    replyTo: args.email,
    subject: `[Partner application] ${args.name}${args.company ? ` — ${args.company}` : ""}`,
    text: [
      "New partner application — pending approval.",
      "",
      `Contact: ${args.name}`,
      `Email: ${args.email}`,
      args.company ? `Company: ${args.company}` : "",
      args.phone ? `Phone: ${args.phone}` : "",
      `White-label: ${whiteLabelText}`,
      args.notes ? `Notes: ${args.notes}` : "",
      "",
      `Activate the applicant at ${args.adminPartnersUrl}. They cannot sign in until approval.`,
    ].filter(Boolean).join("\n"),
    html: adminShell({
      tag: "Partner application",
      heading: "New partner application",
      rows: [
        ["Contact", args.name],
        ["Email", args.email],
        ...(args.company ? [["Company", args.company] as [string, string]] : []),
        ...(args.phone ? [["Phone", args.phone] as [string, string]] : []),
        ["White-label", whiteLabelText],
        ...(args.notes ? [["Notes", args.notes] as [string, string]] : []),
        ["Admin view", args.adminPartnersUrl],
      ],
      extraHtml: `
        ${wantsWhiteLabel ? `
        <div style="background:${EMAIL_STYLES.amberBg};border:1px solid ${EMAIL_STYLES.amberBorder};border-radius:8px;padding:14px 18px;color:${EMAIL_STYLES.amber};font-size:14px;line-height:1.6;margin:0 0 12px;">
          <strong style="display:block;margin:0 0 6px;color:${EMAIL_STYLES.amberDark};">White-label requested</strong>
          The applicant wants clients to see their own branding on communications.
        </div>` : ""}
        <div style="background:${EMAIL_STYLES.amberBg};border:1px solid ${EMAIL_STYLES.amberBorder};border-radius:8px;padding:14px 18px;color:${EMAIL_STYLES.amber};font-size:14px;line-height:1.6;">
          <strong style="display:block;margin:0 0 6px;color:${EMAIL_STYLES.amberDark};">Pending approval</strong>
          The applicant cannot sign in until you activate the partner account.
        </div>`,
    }),
  });
}

// ---------- helpers ----------

function slugifySubject(subject: string) {
  return subject
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "email";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
