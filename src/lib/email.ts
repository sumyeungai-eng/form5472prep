// Transactional email. Uses Resend if RESEND_API_KEY is set; otherwise
// falls through to console.log so dev works without an account.
//
// Get a key at https://resend.com — free tier sends 3,000/month.

import { formatUsd } from "@/lib/utils";
import { multiYearAddonCents, tierInfo, type Tier } from "@/lib/pricing";

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
  attachments?: SendAttachment[];
};

// Sender addresses — split into TWO send-only aliases on the same Resend-
// verified domain so neither matches any inbox we monitor (a From/To match
// is a classic spam-filter trigger).
//
//   FROM_EXTERNAL = "donotreply@…" — used for mail going to customers
//   FROM_INTERNAL = "noreply@…"    — used for mail going to ourselves
//
// The reason for the split: any admin notification we send goes TO
// support@form5472prep.com (our actual inbox). Sending those FROM
// donotreply@form5472prep.com would still be same-domain → same-domain,
// which Gmail will treat as suspicious if Reply-To also points back at the
// same domain. Sending admin alerts FROM noreply@ instead gives us a
// distinct sender we can safelist with a dedicated Gmail filter that
// guarantees they bypass Spam. Customer mail (FROM donotreply@) goes to
// customer inboxes Google has no opinion on.
//
// Replies still flow to support@ via Reply-To, which is the inbox we read.
const FROM_EXTERNAL = process.env.RESEND_FROM || "Form5472 Prep <donotreply@form5472prep.com>";
const FROM_INTERNAL = process.env.RESEND_FROM_INTERNAL || "Form5472 Prep <noreply@form5472prep.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@form5472prep.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://form5472prep.com";

// Decide which sender alias to use based on the recipient. Any recipient on
// our own domain is "internal" → noreply@. Everything else is "external" →
// donotreply@.
function pickFromAddress(to: string): string {
  const recipient = to.trim().toLowerCase();
  if (recipient.endsWith("@form5472prep.com")) return FROM_INTERNAL;
  return FROM_EXTERNAL;
}

export async function sendEmail({ to, subject, html, text, replyTo, attachments }: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = pickFromAddress(to);
  if (!apiKey) {
    console.log("\n[email stub — set RESEND_API_KEY to actually send]");
    console.log("  from:   ", from);
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
      from,
      to,
      subject,
      html,
      text,
      reply_to: replyTo ?? REPLY_TO,
      ...(resendAttachments && resendAttachments.length > 0 ? { attachments: resendAttachments } : {}),
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

type OrderSignatureInfo = {
  label: string;
  page: number;
  instruction: string;
};

type OrderConfirmationArgs = {
  email: string;
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
    email, llcName, taxYears, tier, amountPaidCents, portalLink, receiptUrl,
    pdfBytes, pdfFilename, signatures,
  } = args;
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
  const attachmentName = pdfFilename ?? buildPdfFilename(llcName, taxYears);

  // Fax delivery is included on every tier — the row just states that
  // explicitly so the customer can see what they got.
  const faxFeeRowHtml = `<tr><td style="padding:4px 0;color:#64748b;">IRS fax delivery</td><td align="right" style="padding:4px 0;">Included</td></tr>`;
  const multiYearRowHtml = extraYears > 0
    ? `<tr><td style="padding:4px 0;color:#64748b;">+ ${extraYears} additional year${extraYears === 1 ? "" : "s"}</td><td align="right" style="padding:4px 0;">${formatUsd(addOnCents)}</td></tr>`
    : "";

  const step3Html = `<li style="margin-bottom:6px;">We fax it to the IRS Ogden PIN Unit and send you a delivery confirmation email.</li>`;
  const step3Text = `  3. We fax it to the IRS Ogden PIN Unit and email you confirmation.`;

  const introCopy = hasPdf
    ? "Thanks for your order. Your IRS filing package is ready — open your portal to sign it. The unsigned PDF is attached for your reference."
    : "Thanks for your order. We've received your payment and started preparing your IRS filing. You'll get the generated PDF in your portal within a few minutes.";

  const signaturesHtml = hasPdf && sigCount > 0
    ? `
    <!-- Sign in portal -->
    <p style="margin:24px 0 8px;font-weight:600;color:#0f172a;font-size:15px;">Sign your filing</p>
    <p style="margin:0 0 12px;color:#64748b;font-size:13px;line-height:1.5;">
      Open your portal, review the package, and draw your signature to acknowledge it. Our tax accountant will sign the final IRS forms before fax — no printing or uploading required on your end.
    </p>`
    : "";

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#475569;line-height:1.6;font-size:15px;">
      ${introCopy}
    </p>

    ${signaturesHtml}

    <!-- Receipt -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">Order receipt</td></tr>
      <tr><td style="padding:14px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#0f172a;">
          <tr><td style="padding:4px 0;color:#64748b;">LLC</td><td align="right" style="padding:4px 0;">${escapeHtml(llcLine)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Tax year${taxYears.length > 1 ? "s" : ""}</td><td align="right" style="padding:4px 0;">${escapeHtml(yearsLabel)}</td></tr>
          <tr><td style="padding:4px 0;color:#64748b;">Plan</td><td align="right" style="padding:4px 0;">${escapeHtml(tierLabel)} — ${tierPrice}</td></tr>
          ${faxFeeRowHtml}
          ${multiYearRowHtml}
          <tr><td style="padding:10px 0 4px;border-top:1px solid #e2e8f0;font-weight:600;">Total paid</td><td align="right" style="padding:10px 0 4px;border-top:1px solid #e2e8f0;font-weight:600;">${formatUsd(amountPaidCents)}</td></tr>
        </table>
      </td></tr>
    </table>

    <!-- What happens next -->
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:15px;">What happens next</p>
    <ol style="margin:0 0 24px;padding-left:20px;color:#475569;line-height:1.6;font-size:14px;">
      <li style="margin-bottom:6px;">We generate your filled <strong>Form 5472 + pro forma Form 1120</strong> and run an AI compliance check (≈ 2 min).</li>
      <li style="margin-bottom:6px;">You open your portal, review the package, and draw your signature to acknowledge it. Our accountant signs the IRS forms before fax.</li>
      ${step3Html}
    </ol>

    ${receiptUrl ? `<p style="margin:0 0 20px;font-size:13px;color:#64748b;">A detailed payment receipt is also available on <a href="${receiptUrl}" style="color:#1e3a8a;text-decoration:none;">Stripe</a>.</p>` : ""}
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
      `  1. We generate your Form 5472 + pro forma 1120 (≈ 2 min) and run an AI compliance check.\n` +
      `  2. You open the portal to sign in-browser.\n` +
      step3Text + "\n";

  return sendEmail({
    to: email,
    subject: hasPdf
      ? `Your Form 5472 filing package — ${sigCount} signature${sigCount === 1 ? "" : "s"} needed`
      : `Order confirmed — Form5472 Prep filing (${yearsLabel})`,
    text:
      `Thanks for your order!\n\n` +
      `Order summary:\n` +
      `  LLC:           ${llcLine}\n` +
      `  Tax year(s):   ${yearsLabel}\n` +
      `  Plan:          ${tierLabel} — ${tierPrice}\n` +
      faxFeeTextLine +
      multiYearTextLine +
      `  Total paid:    ${formatUsd(amountPaidCents)}\n` +
      signaturesText + "\n" +
      nextStepsText + "\n" +
      `Open your filing: ${portalLink}\n\n` +
      `— Form5472 Prep`,
    html: shell({
      preheader: hasPdf
        ? `Your filing is ready to sign — sign in-browser, no printing needed.`
        : `Order confirmed for ${llcLine} — ${yearsLabel}. Total ${formatUsd(amountPaidCents)}.`,
      heading: hasPdf ? "Your filing is ready to sign" : "Order confirmed",
      bodyHtml,
      // When the PDF is ready, deep-link straight to the sign page via the
      // magic-link's ?next= deeplink so the customer skips the dashboard.
      cta: hasPdf
        ? { label: "Sign my filing", url: portalLinkWithNext(portalLink, `/filings/${args.filingId ?? ""}/sign`) }
        : { label: "Open my filing", url: portalLink },
    }),
    attachments: hasPdf
      ? [{ filename: attachmentName, content: pdfBytes!, contentType: "application/pdf" }]
      : undefined,
  });
}

function buildPdfFilename(llcName: string | null, taxYears: number[]): string {
  const safeName = (llcName ?? "Filing")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50) || "Filing";
  const yearPart = taxYears.length === 1 ? `${taxYears[0]}` : `${taxYears[0]}-${taxYears[taxYears.length - 1]}`;
  return `${safeName}_Form5472_${yearPart}.pdf`;
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
          <td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;white-space:nowrap;">${escapeHtml(k)}</td>
          <td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");
}

export async function sendFaxDeliveredEmail(args: {
  email: string;
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
  const { email, llcName, taxYears, portalLink, proof, signedPdfBytes, receiptPdfBytes } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const proofTable = proof
    ? `
      <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:15px;">Proof of fax</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
        ${formatFaxProofRows(proof)}
      </table>
      ${signedPdfBytes ? `<p style="margin:0 0 20px;color:#475569;font-size:13px;">A copy of the exact PDF transmitted to the IRS is attached to this email.</p>` : ""}
    `
    : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Good news — your signed Form 5472 + pro forma 1120 for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}) was successfully faxed
      to the IRS Ogden PIN Unit.
    </p>
    <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#065f46;font-size:14px;">
      <strong>✓ Delivered to the IRS</strong> — keep this email as your proof of submission.
    </div>
    ${proofTable}
    ${receiptPdfBytes ? `<p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:14px;">
      A timestamped <strong>IRS Fax Transmission Receipt</strong> is attached
      (<code style="font-family:ui-monospace,monospace;font-size:12px;">IRS-fax-receipt-…pdf</code>).
      Keep it with your tax records — under IRC § 6038A it serves as proof of on-time filing if the
      IRS ever asks.
    </p>` : ""}
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:15px;">What's next</p>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:14px;">
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

  // Build attachment list. Both PDFs are optional — receipt OR signed PDF
  // alone is fine. The receipt is named so it sorts before the package PDF
  // alphabetically in most mail clients.
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
    to: email,
    subject: `Filed with the IRS — ${llcLine} (${yearsLabel})`,
    text:
      `Your signed Form 5472 + pro forma 1120 for ${llcLine} (${yearsLabel}) was successfully faxed to the IRS Ogden PIN Unit.\n\n` +
      `Keep this email as your proof of submission. The IRS doesn't send acknowledgments for faxed 5472 filings, so no further action is required.\n` +
      proofText +
      `\nDownload your full filing package: ${portalLink}\n\n— Form5472 Prep`,
    html: shell({
      preheader: `Filed with the IRS — ${llcLine} (${yearsLabel}) successfully delivered.`,
      heading: "Your filing was delivered to the IRS",
      bodyHtml,
      cta: { label: "View my filing", url: portalLink },
    }),
    attachments: attachments.length > 0 ? attachments : undefined,
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

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Fax delivered to the IRS Ogden PIN Unit.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Customer</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(customerEmail ?? "(anonymous)")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">LLC</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(llcLine)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Tax year(s)</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(yearsLabel)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Filing ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</td></tr>
      ${formatFaxProofRows(proof)}
    </table>
    ${(receiptPdfBytes || signedPdfBytes) ? `
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:14px;">Attachments</p>
    <ul style="margin:0 0 20px 18px;padding:0;color:#475569;font-size:13px;line-height:1.6;">
      ${receiptPdfBytes ? `<li>IRS Fax Transmission Receipt (proof of delivery)</li>` : ""}
      ${signedPdfBytes ? `<li>Frozen copy of the signed package that was faxed</li>` : ""}
    </ul>` : ""}
  `;

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
    html: shell({
      preheader: `Fax delivered — ${llcLine} (${yearsLabel})`,
      heading: "Fax delivered to IRS",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
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

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      Telnyx gave up after ${deliveryAttempts} attempt${deliveryAttempts === 1 ? "" : "s"}.
      Customer has been notified separately. Manual intervention required.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Customer</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(customerEmail ?? "(anonymous)")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">LLC</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(llcLine)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Tax year(s)</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(yearsLabel)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Filing ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Telnyx fax ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(faxId)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#dc2626;font-size:13px;font-weight:600;">Failure reason</td><td style="padding:6px 0;color:#dc2626;font-size:13px;">${escapeHtml(failureReason ?? "unknown")}</td></tr>
    </table>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[Fax FAILED] ${llcLine} (${yearsLabel}) — ${failureReason ?? "unknown"}`,
    text:
      `Fax to IRS FAILED after ${deliveryAttempts} attempt(s).\n\n` +
      `Customer:    ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n` +
      `Filing ID:   ${filingId}\n` +
      `Telnyx ID:   ${faxId}\n` +
      `Reason:      ${failureReason ?? "unknown"}\n` +
      `\nAdmin view: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `Fax FAILED — ${llcLine} (${yearsLabel})`,
      heading: "Fax to IRS failed — manual action needed",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
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

// ---------- 4c. "We're reviewing your filing" (post-payment, before AI clears it) ----------

// Sent immediately after payment when our AI compliance check flagged
// issues that require customer clarification. The customer does NOT yet
// receive the PDF — that's held until the issues resolve. We point them
// to their portal where the system message with the questions awaits.
export async function sendUnderReviewEmail(args: {
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
      Thanks for your payment — we've received your order for <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}).
    </p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:0 0 20px;color:#92400e;font-size:14px;">
      <strong>We're reviewing your filing.</strong> Our compliance check spotted a few details we'd
      like to confirm with you before we send your signed-ready PDF. The questions are waiting
      in your portal.
    </div>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:14px;">
      Open your portal to read and reply. Once you've answered, we'll regenerate your filing package
      and email you the PDF with signing instructions. No additional charge.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `We're reviewing your filing — ${llcLine}`,
    text:
      `Thanks for your payment — we've received your order for ${llcLine} (${yearsLabel}).\n\n` +
      `Our compliance check spotted a few details we'd like to confirm with you before we send your signed-ready PDF. The questions are waiting in your portal.\n\n` +
      `Open your portal to read and reply: ${portalLink}\n\n` +
      `Once you've answered, we'll regenerate your filing package and email you the PDF.\n\n— Form5472 Prep`,
    html: shell({
      preheader: `We're reviewing your ${llcLine} filing — a couple of questions in your portal.`,
      heading: "Your order is in — we're reviewing the details",
      bodyHtml,
      cta: { label: "Open my portal", url: portalLink },
    }),
  });
}

// ---------- 4d. Admin alert when AI compliance check flagged issues it couldn't auto-fix ----------

export async function sendAiFlaggedAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  status: "needs_customer_input" | "error";
  summary: string;
  questions: string[];
  errorMessage?: string;
}) {
  const { adminEmail, customerEmail, llcName, taxYears, filingId, adminFilingUrl, status, summary, questions, errorMessage } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";

  const issueBody = status === "error"
    ? `<p style="margin:0 0 16px;color:#dc2626;font-size:14px;">AI validation failed: <code style="font-family:ui-monospace,monospace;">${escapeHtml(errorMessage ?? "unknown")}</code>. PDF was sent to the customer anyway (fail-open). You may want to manually review.</p>`
    : `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.5;">${escapeHtml(summary)}</p>
       <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:14px;">Questions posted to customer's portal:</p>
       <ul style="margin:0 0 20px 18px;padding:0;color:#475569;font-size:13px;line-height:1.5;">
         ${questions.map((q) => `<li style="margin-bottom:6px;">${escapeHtml(q)}</li>`).join("")}
       </ul>`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      AI compliance check flagged this filing (${status}). Customer notified via portal + email; PDF email is on hold pending their reply.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Customer</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(customerEmail ?? "(anonymous)")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">LLC</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(llcLine)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Tax year(s)</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(yearsLabel)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Filing ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</td></tr>
    </table>
    ${issueBody}
  `;

  return sendEmail({
    to: adminEmail,
    subject:
      status === "error"
        ? `[AI check ERROR] ${llcLine} (${yearsLabel}) — fail-open, PDF sent`
        : `[AI flagged] ${llcLine} (${yearsLabel}) — ${questions.length} question${questions.length === 1 ? "" : "s"} for customer`,
    text:
      `AI compliance check flagged filing ${filingId}.\n\n` +
      `Status:      ${status}\n` +
      `Customer:    ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n\n` +
      `Summary: ${summary}\n\n` +
      (questions.length > 0 ? `Questions posted to portal:\n${questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}\n\n` : "") +
      (errorMessage ? `Error: ${errorMessage}\n\n` : "") +
      `Admin view: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `AI flagged ${llcLine} (${yearsLabel}) — ${status}.`,
      heading: status === "error" ? "AI compliance check failed" : "AI flagged a filing for customer input",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
    }),
  });
}

// ---------- 4d. AI validation auto-fixed one or more fields silently ----------

// Audit notice for silent edits the validate-filing endpoint applied based on
// the AI's proposed_fixes. The customer is NOT cc'd — they only learn about
// the package via the order-confirmation email that comes next. The admin
// gets this so they can spot-check what was changed and revert in the
// FilingChangeLog if needed.
export async function sendAiAutoFixedAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  fixes: Array<{
    field: string;
    before: string;
    after: string;
    category: string;
    reason: string;
  }>;
  // Final validation status after the auto-fix + re-validate cycle.
  // "passed" = customer got their PDF straight after. Other values mean we
  // also asked them follow-ups; the audit still matters either way.
  followUpStatus: "passed" | "fix_attempted" | "needs_customer_input" | "error";
}) {
  const { adminEmail, customerEmail, llcName, taxYears, filingId, adminFilingUrl, fixes, followUpStatus } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";

  const rowsHtml = fixes.map((f) => `
    <tr>
      <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:12px;font-family:ui-monospace,monospace;color:#0f172a;vertical-align:top;">${escapeHtml(f.field)}</td>
      <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:12px;color:#475569;vertical-align:top;text-decoration:line-through;">${escapeHtml(f.before || "(empty)")}</td>
      <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:12px;color:#0f172a;vertical-align:top;font-weight:600;">${escapeHtml(f.after || "(empty)")}</td>
      <td style="padding:8px 10px;border:1px solid #e2e8f0;font-size:11px;color:#64748b;vertical-align:top;"><div>[${escapeHtml(f.category)}]</div><div style="margin-top:2px;">${escapeHtml(f.reason)}</div></td>
    </tr>
  `).join("");

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      AI compliance check silently fixed ${fixes.length} field${fixes.length === 1 ? "" : "s"} on this filing. The PDF was regenerated and re-validated automatically.
      <br /><span style="color:#64748b;font-size:13px;">Final status after re-validation: <strong>${escapeHtml(followUpStatus)}</strong>.</span>
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Customer</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(customerEmail ?? "(anonymous)")}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">LLC</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(llcLine)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Tax year(s)</td><td style="padding:6px 0;color:#0f172a;font-size:13px;">${escapeHtml(yearsLabel)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Filing ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</td></tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;width:100%;">
      <thead><tr>
        <th align="left" style="padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Field</th>
        <th align="left" style="padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Before</th>
        <th align="left" style="padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">After</th>
        <th align="left" style="padding:8px 10px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Why</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <p style="margin:0;color:#94a3b8;font-size:12px;">Every change is logged to FilingChangeLog (source=ai_validation_auto_fix). Revert from the admin filing page if anything looks wrong.</p>
  `;

  const textRows = fixes.map((f) => `  - ${f.field}: "${f.before}" -> "${f.after}"  [${f.category}] ${f.reason}`).join("\n");

  return sendEmail({
    to: adminEmail,
    subject: `[AI auto-fix] ${llcLine} (${yearsLabel}) — ${fixes.length} field${fixes.length === 1 ? "" : "s"} silently corrected`,
    text:
      `AI compliance check applied ${fixes.length} silent fix${fixes.length === 1 ? "" : "es"} on filing ${filingId}.\n\n` +
      `Customer:    ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n` +
      `Final status: ${followUpStatus}\n\n` +
      `Changes:\n${textRows}\n\n` +
      `Admin view: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `AI auto-fixed ${fixes.length} field${fixes.length === 1 ? "" : "s"} on ${llcLine}.`,
      heading: `AI silently corrected ${fixes.length} field${fixes.length === 1 ? "" : "s"}`,
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
    }),
  });
}

// ---------- 4e. AI agent applied a field change ----------

export async function sendAiFieldChangeAdminEmail(args: {
  adminEmail: string;
  filingId: string;
  llcName: string | null;
  adminFilingUrl: string;
  field: string;
  before: unknown;
  after: unknown;
  reason: string | null;
}) {
  const { adminEmail, filingId, llcName, adminFilingUrl, field, before, after, reason } = args;
  const display = (v: unknown) => v == null || v === "" ? "(empty)" : typeof v === "string" ? v : JSON.stringify(v);

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      AI agent updated a field on filing <strong>${escapeHtml(llcName ?? filingId)}</strong> based on a customer reply.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Field</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(field)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Before</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(display(before))}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">After</td><td style="padding:6px 0;color:#10b981;font-size:13px;font-family:ui-monospace,monospace;font-weight:600;">${escapeHtml(display(after))}</td></tr>
      ${reason ? `<tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Customer said</td><td style="padding:6px 0;color:#475569;font-size:13px;font-style:italic;">${escapeHtml(reason)}</td></tr>` : ""}
      <tr><td style="padding:6px 12px 6px 0;color:#475569;font-size:13px;">Filing ID</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</td></tr>
    </table>
    <p style="margin:0 0 20px;color:#475569;font-size:13px;">If this looks wrong, open the filing in admin and revert via the edit page.</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[AI updated] ${field} on ${llcName ?? filingId}`,
    text:
      `AI agent updated field "${field}" on filing ${filingId} (${llcName ?? "no LLC name"}).\n\n` +
      `Before: ${display(before)}\n` +
      `After:  ${display(after)}\n` +
      (reason ? `Customer said: ${reason}\n` : "") +
      `\nAdmin view: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `AI updated ${field} on ${llcName ?? filingId}.`,
      heading: "AI agent updated a filing field",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
    }),
  });
}

// ---------- 4f. AI escalated to admin ----------

export async function sendAiEscalationAdminEmail(args: {
  adminEmail: string;
  customerEmail: string | null;
  filingId: string;
  llcName: string | null;
  adminFilingUrl: string;
  reason: string;
  recentThread: string;
}) {
  const { adminEmail, customerEmail, filingId, llcName, adminFilingUrl, reason, recentThread } = args;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      AI agent has handed this thread off to you. Reason: <strong>${escapeHtml(reason)}</strong>
    </p>
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:14px;">
      Customer: <strong>${escapeHtml(customerEmail ?? "(anonymous)")}</strong> · Filing: <strong>${escapeHtml(llcName ?? filingId)}</strong>
    </p>
    <p style="margin:0 0 8px;font-weight:600;color:#0f172a;font-size:14px;">Recent conversation:</p>
    <pre style="margin:0 0 20px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;color:#0f172a;font-size:12px;font-family:ui-monospace,monospace;white-space:pre-wrap;line-height:1.45;">${escapeHtml(recentThread)}</pre>
    <p style="margin:0 0 20px;color:#475569;font-size:13px;">AI will not respond further until you re-engage it via the "Re-engage AI" button on the admin filing page.</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[AI escalated] ${llcName ?? filingId} — needs you`,
    text:
      `AI agent escalated this conversation to you.\n\n` +
      `Reason:   ${reason}\n` +
      `Customer: ${customerEmail ?? "(anonymous)"}\n` +
      `LLC:      ${llcName ?? "(no name)"}\n` +
      `Filing:   ${filingId}\n\n` +
      `Recent thread:\n${recentThread}\n\n` +
      `Admin view: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `AI escalated ${llcName ?? filingId} to you — ${reason}`,
      heading: "AI handed off — needs human",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
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
  llcName: string | null;
  taxYears: number[];
  bodyExcerpt: string;
  portalLink: string;
}) {
  const { email, llcName, taxYears, bodyExcerpt, portalLink } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "your filing";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      You have a new message from our team about <strong>${escapeHtml(llcLine)}</strong>
      (tax year${taxYears.length > 1 ? "s" : ""} ${escapeHtml(yearsLabel)}).
    </p>
    <blockquote style="margin:0 0 20px;padding:14px 18px;background:#f8fafc;border-left:3px solid #1e3a8a;color:#0f172a;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyExcerpt)}</blockquote>
    <p style="margin:0 0 24px;color:#475569;line-height:1.6;font-size:14px;">
      Open your portal to read the full message and reply.
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `New message about your filing — ${llcLine}`,
    text:
      `You have a new message from our team about ${llcLine} (${yearsLabel}).\n\n` +
      `${bodyExcerpt}\n\n` +
      `Open your portal to read and reply: ${portalLink}\n\n— Form5472 Prep`,
    html: shell({
      preheader: `New message about ${llcLine} — open your portal to reply.`,
      heading: "You have a new message",
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

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      <strong>${escapeHtml(customerEmail)}</strong> sent a new message about filing
      <strong>${escapeHtml(llcLine)}</strong> (${escapeHtml(yearsLabel)}).
    </p>
    <blockquote style="margin:0 0 20px;padding:14px 18px;background:#f8fafc;border-left:3px solid #1e3a8a;color:#0f172a;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyExcerpt)}</blockquote>
    <p style="margin:0 0 20px;color:#475569;font-size:13px;">Filing ID: <code style="font-family:ui-monospace,monospace;">${escapeHtml(filingId)}</code></p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `[New message] ${llcLine} from ${customerEmail}`,
    text:
      `${customerEmail} sent a new message about ${llcLine} (${yearsLabel}).\n\n` +
      `${bodyExcerpt}\n\n` +
      `Filing ID: ${filingId}\n` +
      `Reply in admin: ${adminFilingUrl}\n`,
    html: shell({
      preheader: `New message from ${customerEmail} about ${llcLine}.`,
      heading: "New message from customer",
      bodyHtml,
      cta: { label: "Open in admin", url: adminFilingUrl },
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

// ---------- 7. Abandoned-draft reminder (one-shot) ----------

type AbandonedDraftArgs = {
  email: string;
  llcName: string | null;
  resumeLink: string;
  unsubscribeUrl: string;
};

export async function sendAbandonedDraftReminderEmail(args: AbandonedDraftArgs) {
  const { email, llcName, resumeLink, unsubscribeUrl } = args;
  const llcLine = llcName ? escapeHtml(llcName) : "your foreign-owned LLC";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;line-height:1.6;font-size:15px;">
      You started a Form 5472 filing for <strong>${llcLine}</strong> but didn't finish.
      Your progress is saved — you can pick up right where you left off.
    </p>
    <p style="margin:0 0 20px;color:#475569;line-height:1.6;font-size:15px;">
      Most customers finish in about <strong>15 minutes</strong>. The IRS penalty for a
      missing Form 5472 is <strong>$25,000</strong>, so it's worth completing today.
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;margin:0 0 24px;color:#334155;font-size:14px;line-height:1.5;">
      <strong style="color:#0f172a;">Need help?</strong> Just reply to this email and we'll
      walk you through whatever you got stuck on.
    </div>`;

  return sendEmail({
    to: email,
    subject: "Finish your Form 5472 filing — your progress is saved",
    text:
      `You started a Form 5472 filing for ${llcName ?? "your foreign-owned LLC"} but didn't finish.\n\n` +
      `Your progress is saved. Pick up where you left off (most customers finish in ~15 minutes):\n` +
      `${resumeLink}\n\n` +
      `The IRS penalty for missing Form 5472 is $25,000 — worth completing today.\n\n` +
      `Need help? Just reply to this email.\n\n— Form5472 Prep\n\n` +
      `Unsubscribe from these emails: ${unsubscribeUrl}`,
    html: shell({
      preheader: "Your progress is saved. Pick up where you left off — about 15 minutes left.",
      heading: "Finish your Form 5472 filing",
      bodyHtml,
      cta: { label: "Resume my filing", url: resumeLink },
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
