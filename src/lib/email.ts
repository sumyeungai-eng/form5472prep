import { getEmailTranslator, englishEmailTranslator, emailLocale, type EmailTranslator } from "@/i18n/server";
import { downloadFileName } from "@/lib/pdf/downloadFileName";
import { MAX_FAX_COPY_BYTES } from "@/lib/fax/clientCopy";
// Transactional email. Uses Resend if RESEND_API_KEY is set; otherwise
// falls through to console.log so dev works without an account.
//
// Get a key at https://resend.com — free tier sends 3,000/month.

import { formatUsd } from "@/lib/utils";
import { multiYearAddonCents, tierInfo, type Tier } from "@/lib/pricing";
import { effectiveDueDateUtc, filingDueDateUtc, formatDueDate } from "@/lib/schemas";
import type { EmailBrand } from "@/lib/partnerBrand";
import { partnerClientRoute, redirectForPartner, type PartnerClientRoute } from "@/lib/partner/clientMail";
import { formLabel } from "@/lib/applicationSignature";
import { env } from "@/lib/env";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Keep delivery independent of translation, including an unexpected throw
// from the translator factory or a single message formatter.
function safeEmailTranslator(locale?: string | null): EmailTranslator {
  let translator: EmailTranslator;
  try { translator = getEmailTranslator(locale); }
  catch (error) { console.warn("[email i18n] English fallback", error); translator = englishEmailTranslator; }
  return (key, values) => {
    try { return translator(key, values); }
    catch (error) { console.warn("[email i18n] English fallback", error); return englishEmailTranslator(key, values); }
  };
}

function emailDate(value: string, locale?: string | null, timestamp = false): string {
  if (emailLocale(locale) === "en") return value;
  try {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return value;
    return new Intl.DateTimeFormat(emailLocale(locale), {
      dateStyle: "long", ...(timestamp ? { timeStyle: "long" as const } : {}), timeZone: "UTC",
    }).format(date);
  } catch (error) {
    console.warn("[email i18n] English date fallback", error);
    return value;
  }
}

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

// Audit-trail tag for the EmailLog row sendEmail() writes after every Resend
// call. `kind` names the email ("fax_delivered", "order_confirmation", ...);
// `filingId` ties it to a filing so the admin filing page can list it.
export type EmailLogTag = { kind: string; filingId?: string | null };

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  bcc?: string;
  attachments?: SendAttachment[];
  headers?: Record<string, string>;
  fromName?: string;
  log?: EmailLogTag;
};

// How long a (best-effort) EmailLog write may hold up the caller after the
// email itself has already been handed to Resend.
const EMAIL_LOG_TIMEOUT_MS = 5_000;

// Record one send attempt in EmailLog. Best-effort by contract: the email has
// already been sent (or has already failed) by the time this runs, so any
// error or slowness here is swallowed and logged — it must never change what
// sendEmail() returns or throws. Prisma is imported lazily so render-only
// callers (preview script, EMAIL_PREVIEW_DIR tests) never load a DB client.
async function recordEmailLog(entry: {
  log: EmailLogTag | undefined;
  to: string;
  subject: string;
  status: "sent" | "failed" | "dropped";
  resendId?: string | null;
  error?: string | null;
}): Promise<void> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const insert = (filingId: string | null) =>
      prisma.emailLog.create({
        data: {
          kind: entry.log?.kind || "other",
          filingId,
          to: entry.to,
          subject: entry.subject,
          status: entry.status,
          resendId: entry.resendId ?? null,
          error: entry.error ? entry.error.slice(0, 2000) : null,
        },
        select: { id: true },
      });
    const filingId = entry.log?.filingId ?? null;
    // A filingId that isn't a real Filing (e.g. the admin test-email route's
    // "sample") fails the foreign key (P2003): keep the audit row, unlinked.
    const write = insert(filingId).catch((err: unknown) => {
      if (filingId && (err as { code?: unknown } | null)?.code === "P2003") return insert(null);
      throw err;
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("EmailLog write timed out")), EMAIL_LOG_TIMEOUT_MS);
      if (typeof timer === "object" && timer && "unref" in timer) timer.unref();
    });
    try {
      await Promise.race([write, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch (err) {
    console.error("[email] EmailLog write failed (email send unaffected)", err);
  }
}

// Sender address. Must NOT match any inbox we monitor — sending FROM and TO
// the same mailbox (e.g. orders@ → orders@ for admin alerts) is a classic
// spam-filter trigger and was burying every admin notification in our own
// Gmail spam folder. `donotreply@` is a send-only alias on the same verified
// Resend domain, so no extra DNS/verification is needed. Replies still go to
// support@ via Reply-To, which is the inbox we actually read.
const FROM = process.env.RESEND_FROM || "Form5472 Prep <donotreply@form5472prep.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@form5472prep.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://form5472prep.com";

function fromAddress(from: string): string {
  return from.match(/<([^>]+)>/)?.[1]?.trim() || from.trim();
}

function brandedFrom(fromName: string | undefined): string {
  if (!fromName) return FROM;
  return `"${fromName.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}" <${fromAddress(FROM)}>`;
}

// Email subjects must be a single line: Resend rejects CR/LF with a 422
// ("The `\\n` is not allowed in the `subject` field"), which silently cost
// every website-question alert whose message contained a line break.
export function singleLineSubject(subject: string): string {
  const flat = subject.replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
  return flat.length > 250 ? `${flat.slice(0, 249).trimEnd()}…` : flat;
}

export async function sendEmail({ to, subject: rawSubject, html, text, replyTo, bcc, attachments, headers, fromName, log }: SendArgs) {
  let subject = singleLineSubject(rawSubject);
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

  // Partner clients never get mail from us; see src/lib/partner/clientMail.ts.
  let route: PartnerClientRoute | null = null;
  try {
    route = await partnerClientRoute(to, log);
  } catch (err) {
    // Fail closed, like a Resend failure: callers already handle a throw, and
    // a partner's client must never receive our mail because a lookup failed.
    const failure = new Error(`partner-client lookup failed: ${err instanceof Error ? err.message : String(err)}`);
    await recordEmailLog({ log, to, subject, status: "failed", error: failure.message });
    throw failure;
  }
  if (route?.action === "drop") {
    await recordEmailLog({ log, to, subject, status: "dropped" });
    return { dropped: true };
  }
  if (route) {
    ({ to, subject, html, text } = redirectForPartner({ to, subject, html, text }, route, APP_URL, escapeHtml));
    subject = singleLineSubject(subject);
    replyTo = undefined;
    bcc = undefined; // never a Trustpilot invite on a partner filing
    fromName = undefined;
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

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: brandedFrom(fromName),
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
  } catch (err) {
    // Network-level failure: record it, then surface the ORIGINAL error.
    await recordEmailLog({
      log,
      to,
      subject,
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
  if (!res.ok) {
    const failure = new Error(`Resend send failed: ${res.status} ${await res.text()}`);
    await recordEmailLog({ log, to, subject, status: "failed", error: failure.message });
    throw failure;
  }
  const json = await res.json();
  const resendId =
    json && typeof json === "object" && typeof (json as { id?: unknown }).id === "string"
      ? (json as { id: string }).id
      : null;
  await recordEmailLog({ log, to, subject, status: "sent", resendId });
  return json;
}

// ---------- Shared email shell ----------
// All transactional emails wrap their body in this template so the brand
// look stays consistent. Inline styles only — most email clients strip <style>.

type ShellArgs = {
  locale?: string | null;
  preheader: string; // ~90 chars hidden preview shown in inbox before opening
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  // Only set on marketing emails (yearly reminders). Transactional emails
  // omit this — CAN-SPAM only requires unsubscribe on commercial messages.
  unsubscribeUrl?: string;
  closingHtml?: string;
  internal?: boolean;
  brand?: { name: string };
};

function shell({ preheader, heading, bodyHtml, cta, unsubscribeUrl, closingHtml = "", internal = false, brand, locale }: ShellArgs) {
  const t = safeEmailTranslator(locale);
  const footerUrl = internal ? "https://www.form5472prep.com" : APP_URL;
  const headerHtml = brand
    ? `          <!-- Brand header: partner wordmark. -->
          <tr>
            <td style="background:#0d1b3d;border-bottom:1px solid ${EMAIL_STYLES.border};padding:20px 32px;color:${EMAIL_STYLES.white};font-size:20px;line-height:1.3;font-weight:600;">
              ${escapeHtml(brand.name)}
            </td>
          </tr>`
    : `          <!-- Brand header: hosted banner. The navy cell background + white alt text
               keep the header on-brand in clients that block remote images. -->
          <tr>
            <td style="background:#0d1b3d;border-bottom:1px solid ${EMAIL_STYLES.border};">
              <img src="https://www.form5472prep.com/email/banner.png" width="560" alt="Form5472 Prep"
                style="display:block;width:100%;height:auto;border:0;color:${EMAIL_STYLES.white};font-size:18px;font-weight:600;" />
            </td>
          </tr>`;
  const processedByLine = brand ? `\n              <br/>${t("shared.processedBy")}` : "";
  const ctaBlock = cta
    ? `<tr><td style="padding:8px 0 24px;">
         <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${EMAIL_STYLES.brand};color:${EMAIL_STYLES.white};text-decoration:none;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(cta.label)}</a>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="${emailLocale(locale)}">
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
${headerHtml}
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
              ${t("shared.questions")} <a href="mailto:support@form5472prep.com" style="color:${EMAIL_STYLES.brand};text-decoration:none;">support@form5472prep.com</a>.${processedByLine}
              <br/>Form5472 Prep · <a href="${footerUrl}" style="color:${EMAIL_STYLES.brand};text-decoration:none;">form5472prep.com</a>
              ${unsubscribeUrl ? `<br/><br/><a href="${escapeHtml(unsubscribeUrl)}" style="color:${EMAIL_STYLES.muted};text-decoration:underline;">${t("shared.unsubscribe")}</a>` : ""}
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
  locale,
  heading,
  salutation,
  bodyHtml,
  cta,
  footnoteHtml,
  unsubscribeUrl,
  preheader,
  brand,
}: {
  locale?: string | null;
  heading: string;
  salutation: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  footnoteHtml?: string;
  unsubscribeUrl?: string;
  preheader?: string;
  brand?: { name: string };
}) {
  const t = safeEmailTranslator(locale);
  const greeting = `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("shared.greeting", { name: escapeHtml(salutation) })}</p>`;
  const teamName = brand?.name ?? "Form5472 Prep";
  const closingHtml = `${footnoteHtml ? `<div style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">${footnoteHtml}</div>` : ""}
    <p style="margin:0;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("shared.thanks")}<br/>${t("shared.team", { name: escapeHtml(teamName) })}</p>`;
  return shell({ preheader: preheader ?? heading, heading, bodyHtml: `${greeting}${bodyHtml}`, cta, closingHtml, unsubscribeUrl, brand, locale });
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

function customerText(salutation: string, body: string, footnote?: string, brand?: EmailBrand, locale?: string | null) {
  const t = safeEmailTranslator(locale);
  return `${t("shared.greeting", { name: salutation })}\n\n${body}${footnote ? `\n\n${footnote}` : ""}\n\n${t("shared.thanks")}\n${t("shared.team", { name: brand?.name ?? "Form5472 Prep" })}`;
}

export function firstNameFrom(name: string | null | undefined): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : null;
}

// ---------- 1. Magic-link email (existing) ----------

export async function sendMagicLinkEmail(
  email: string,
  link: string,
  filingLabel: string,
  brand?: EmailBrand,
  // Optional: ties the EmailLog audit row to the filing this link opens.
  filingId?: string | null,
  locale?: string | null
) {
  const t = safeEmailTranslator(locale);
  const heading = t("magicLink.heading");
  const brandName = brand?.name ?? "Form5472 Prep";
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("magicLink.bodyHtml", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(filingLabel) })}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;">${t("magicLink.bodyHtml2")}</p>`;

  return sendEmail({
    log: { kind: "magic_link", filingId: filingId ?? null },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: t("magicLink.subject", { v0: brandName }),
    text: customerText(
      t("magicLink.salutation"),
      t("magicLink.text", { v0: filingLabel, v1: link }),
      undefined,
      brand,
      locale,
    ),
    html: customerShell({ locale,
      heading,
      salutation: t("magicLink.salutation"),
      bodyHtml,
      cta: { label: t("magicLink.label"), url: link },
      brand,
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
    log: { kind: "partner_login" },
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
    log: { kind: "partner_application_ack" },
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
  locale?: string | null;
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
  // Callers MUST pass the LIVE decision from requiresReasonableCause() in
  // src/lib/completeness.ts (or the equivalent per-year check), NEVER the
  // stored stale wizard snapshot; when omitted/false, no line is rendered,
  // so every existing caller is unaffected.
  requiresReasonableCause?: boolean;
  extensionUnclear?: boolean;
  brand?: EmailBrand;
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

export const ORDER_CONFIRMATION_INTRO =
  "Our team is reviewing your package. We'll email you a link to check and sign it when it's ready.";

export async function sendOrderConfirmationEmail(args: OrderConfirmationArgs) {
  const t = safeEmailTranslator(args.locale);
  const {
    email, recipientName, llcName, taxYears, tier, amountPaidCents, portalLink, receiptUrl,
    pdfBytes, isFinalReturn, dueDateText: originalDueDateText, requiresReasonableCause, extensionUnclear, brand,
  } = args;
  const dueDateText = originalDueDateText ? emailDate(originalDueDateText, args.locale) : originalDueDateText;
  const salutation = firstNameFrom(recipientName) ?? t("orderConfirmation.salutation");
  const brandName = brand?.name ?? "Form5472 Prep";
  // Resolve the tier through pricing.ts so legacy tier values from old
  // filings still render a sensible label rather than crashing.
  const plan = tierInfo(tier);
  const tierKey = ["standard", "express", "priority", "rush", "premium", "single_year", "two_year_diirsp", "multi_year_diirsp"].includes(tier) ? tier : "standard";
  const tierLabel = t(`orderConfirmation.tier_${tierKey}`);
  const tierPrice = formatUsd(plan.priceCents);
  // Express orders: reviewed package ready to check and sign in under 3 days
  // of the order, 7 days a week (2026-10-11). Standard gets no timeframe.
  // Legacy "rush" resolves to standard.
  const isExpress = tier === "express";
  const expressReviewText =
    t("orderConfirmation.expressReviewText");
  const reviewStepText = isExpress
    ? t("orderConfirmation.reviewStepText2")
    : t("orderConfirmation.reviewStepText");
  const reviewStepPlain = isExpress
    ? t("orderConfirmation.reviewStepPlain2")
    : t("orderConfirmation.reviewStepPlain");
  const yearCount = taxYears.length || 1;
  const extraYears = Math.max(0, yearCount - 1);
  const addOnCents = multiYearAddonCents(yearCount);
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? t("orderConfirmation.llcLine");
  const hasPdf = !!pdfBytes && pdfBytes.byteLength > 0;

  // ----- Post-purchase sequencing -----
  // Deadline line, shown high in the email so the customer can sanity-check
  // that what they just bought lands before the date they were worried about.
  const dueDateHtml = dueDateText
    ? `<p style="margin:0 0 12px;color:${EMAIL_STYLES.slate};line-height:1.6;font-size:14px;">${t("orderConfirmation.dueDateHtml", { tag0: "<strong style=\"color:" + (EMAIL_STYLES.ink) + ";\">", tag1: "</strong>", v2: escapeHtml(dueDateText) })}</p>`
    : "";
  const filingStatusNoticeText = requiresReasonableCause
    ? t("orderConfirmation.filingStatusNoticeText2")
    : extensionUnclear
      ? t("orderConfirmation.filingStatusNoticeText")
      : "";
  const expressReviewHtml = isExpress
    ? `<div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-left:4px solid ${EMAIL_STYLES.brand};border-radius:8px;padding:12px 16px;margin:0 0 12px;color:${EMAIL_STYLES.ink};font-size:14px;line-height:1.6;">${t("orderConfirmation.expressReviewHtml", { tag0: "<strong>", tag1: "</strong>" })}</div>`
    : "";
  const filingStatusNoticeHtml = filingStatusNoticeText
    ? `<p style="margin:0 0 12px;color:${EMAIL_STYLES.slate};line-height:1.6;font-size:14px;">${filingStatusNoticeText}</p>`
    : "";

  // Amber warning — FINAL RETURNS ONLY, and deliberately the loudest block in
  // the "what happens next" section.
  const einWarningHtml = isFinalReturn
    ? `<div style="background:${EMAIL_STYLES.amberBg};border:1px solid ${EMAIL_STYLES.amberBorder};border-radius:8px;padding:14px 18px;margin:0 0 16px;color:${EMAIL_STYLES.amber};font-size:14px;line-height:1.6;">${t("orderConfirmation.einWarningHtml", { tag0: "<strong style=\"display:block;margin:0 0 6px;color:" + (EMAIL_STYLES.amberDark) + ";font-size:15px;\">", tag1: "</strong>" })}</div>`
    : "";

  const nextImportantHtml = `
    <!-- What happens next — important -->
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("orderConfirmation.nextImportantHtml")}</p>
    ${einWarningHtml}
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 12px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.6;">${t("orderConfirmation.nextImportantHtml2", { tag0: "<strong style=\"display:block;margin:0 0 6px;color:" + (EMAIL_STYLES.ink) + ";\">", tag1: "</strong>" })}</div>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">${t("orderConfirmation.nextImportantHtml3")}</p>
  `;

  // Fax delivery is included on every tier — the row just states that
  // explicitly so the customer can see what they got.
  const faxFeeRowHtml = `<tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">${t("orderConfirmation.faxFeeRowHtml")}</td><td align="right" style="padding:4px 0;">${t("orderConfirmation.faxFeeRowHtml2")}</td></tr>`;
  const multiYearRowHtml = extraYears > 0
    ? `<tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">${t("orderConfirmation.multiYearRowHtml", { v1: extraYears, v2: extraYears === 1 ? "" : t("shared.pluralSuffix") })}</td><td align="right" style="padding:4px 0;">${formatUsd(addOnCents)}</td></tr>`
    : "";

  const step3Html = `<li style="margin-bottom:6px;">${t("orderConfirmation.body2")}</li>`;
  const step3Text = t("orderConfirmation.body");

  // Release gate: the client sees nothing until staff release the package.
  const introCopy = t("orderConfirmation.intro");

  const bodyHtml = `
    <p style="margin:0 0 12px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${introCopy}
    </p>
    ${expressReviewHtml}
    ${dueDateHtml}
    ${filingStatusNoticeHtml}
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.muted};font-size:13px;">${t("orderConfirmation.bodyHtml2", { tag0: "<strong>", tag1: "</strong>" })}</p>


    <!-- Receipt -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:16px 20px;border-bottom:1px solid ${EMAIL_STYLES.border};font-size:13px;color:${EMAIL_STYLES.muted};text-transform:uppercase;letter-spacing:0.04em;font-weight:600;">${t("orderConfirmation.bodyHtml3")}</td></tr>
      <tr><td style="padding:14px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${EMAIL_STYLES.ink};">
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">LLC</td><td align="right" style="padding:4px 0;">${escapeHtml(llcLine)}</td></tr>
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">${t("orderConfirmation.bodyHtml4", { v14: taxYears.length > 1 ? t("shared.pluralSuffix") : "" })}</td><td align="right" style="padding:4px 0;">${escapeHtml(yearsLabel)}</td></tr>
          <tr><td style="padding:4px 0;color:${EMAIL_STYLES.muted};">${t("orderConfirmation.bodyHtml5")}</td><td align="right" style="padding:4px 0;">${escapeHtml(tierLabel)} — ${tierPrice}</td></tr>
          ${faxFeeRowHtml}
          ${multiYearRowHtml}
          <tr><td style="padding:10px 0 4px;border-top:1px solid ${EMAIL_STYLES.border};font-weight:600;">${t("orderConfirmation.bodyHtml6")}</td><td align="right" style="padding:10px 0 4px;border-top:1px solid ${EMAIL_STYLES.border};font-weight:600;">${formatUsd(amountPaidCents)}</td></tr>
        </table>
      </td></tr>
    </table>

    <!-- What happens next -->
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("orderConfirmation.bodyHtml7")}</p>
    <ol style="margin:0 0 24px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
      <li style="margin-bottom:6px;">${t("orderConfirmation.bodyHtml8", { tag0: "<strong>", tag1: "</strong>" })}</li>
      <li style="margin-bottom:6px;">${reviewStepText}</li>
      <li style="margin-bottom:6px;">${t("orderConfirmation.bodyHtml9")}</li>
      ${step3Html}
    </ol>

    ${nextImportantHtml}

    ${receiptUrl ? `<p style="margin:0 0 20px;font-size:13px;color:${EMAIL_STYLES.muted};">${t("orderConfirmation.bodyHtml", { tag0: "<a href=\"" + (receiptUrl) + "\" style=\"color:" + (EMAIL_STYLES.brand) + ";text-decoration:none;\">", tag1: "</a>" })}</p>` : ""}
  `;

  const faxFeeTextLine = t("orderConfirmation.faxFeeTextLine");
  const multiYearTextLine = extraYears > 0
    ? t("orderConfirmation.multiYearTextLine", { v0: extraYears, v1: extraYears === 1 ? "" : t("shared.pluralSuffix"), v2: formatUsd(addOnCents) })
    : "";


  const nextStepsText = hasPdf
    ? t("orderConfirmation.nextStepsText4") +
      t("orderConfirmation.nextStepsText3", { v0: portalLink }) +
      `  2. ${reviewStepPlain}\n` +
      t("orderConfirmation.nextStepsText") +
      step3Text + "\n"
    : t("orderConfirmation.nextStepsText2") +
      `  2. ${reviewStepPlain}\n` +
      t("orderConfirmation.nextStepsText") +
      step3Text + "\n";

  // Plain-text mirror of the post-purchase sequencing section above.
  const dueDateLineText = dueDateText
    ? t("orderConfirmation.dueDateLineText", { v0: dueDateText })
    : "";
  const filingStatusNoticeLineText = filingStatusNoticeText
    ? `${filingStatusNoticeText}\n\n`
    : "";
  const nextImportantText =
    t("orderConfirmation.nextImportantText7") +
    (isFinalReturn
      ? t("orderConfirmation.nextImportantText6")
      : "") +
    t("orderConfirmation.proofText") +
    t("orderConfirmation.nextImportantText");

  return sendEmail({
    log: { kind: "order_confirmation", filingId: args.filingId ?? null },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: hasPdf
      ? t("orderConfirmation.subject2")
      : t("orderConfirmation.subject", { v0: brandName, v1: yearsLabel }),
    text: customerText(
      salutation,
      t("orderConfirmation.text8", { v0: introCopy }) +
      (isExpress ? `${expressReviewText}\n\n` : "") +
      dueDateLineText +
      filingStatusNoticeLineText +
      t("orderConfirmation.text7") +
      t("orderConfirmation.text6") +
      t("orderConfirmation.text5", { v0: llcLine }) +
      t("orderConfirmation.text4", { v0: yearsLabel }) +
      t("orderConfirmation.text3", { v0: tierLabel, v1: tierPrice }) +
      faxFeeTextLine +
      multiYearTextLine +
      t("orderConfirmation.text2", { v0: formatUsd(amountPaidCents) }) +
      "\n" +
      nextStepsText + "\n" +
      nextImportantText + "\n" +
      t("orderConfirmation.text", { v0: portalLink }),
      undefined,
      brand,
      args.locale,
    ),
    html: customerShell({ locale: args.locale,
      heading: hasPdf ? t("orderConfirmation.heading2") : t("orderConfirmation.heading"),
      salutation,
      bodyHtml,
      // The package is generated, but signing opens only after accountant
      // review. Send customers to the filing overview, not the signature pad.
      cta: hasPdf
        ? { label: t("orderConfirmation.label"), url: portalLinkWithNext(portalLink, `/filings/${args.filingId ?? ""}`) }
        : { label: t("orderConfirmation.label"), url: portalLink },
      brand,
    }),
  });
}

// ---------- 2b. Check-and-sign email ----------
//
// Sent when admin uploads the accountant-reviewed PDF. The magic link logs the
// client in and lands on /filings/{id}/sign, where they check the exact PDF,
// confirm it's correct, and sign — or ask for a change instead.

export async function sendReadyToSignEmail(args: {
  locale?: string | null;
  email: string;
  recipientName?: string | null;
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
  brand?: EmailBrand;
  // True when the client had signed an earlier version: we uploaded a
  // corrected package, so their earlier signature no longer applies.
  resign?: boolean;
  // Admin "Send signing reminder": same email, reminder subject + log kind.
  reminder?: boolean;
}) {
  const t = safeEmailTranslator(args.locale);
  const salutation = firstNameFrom(args.recipientName) ?? t("readyToSign.salutation");
  const yearsLabel = args.taxYears.join(", ");
  const llcLine = args.llcName ?? t("readyToSign.llcLine");
  const yearsSuffix = yearsLabel ? t("readyToSign.yearsSuffix", { v0: args.taxYears.length === 1 ? "" : t("shared.pluralSuffix"), v1: yearsLabel }) : "";
  const signLink = portalLinkWithNext(args.portalLink, `/filings/${args.filingId}/sign`);
  const subject = args.resign
    ? t("readyToSign.subject2")
    : args.reminder
      ? t("readyToSign.subject")
      : t("readyToSign.heading");
  const intro = args.resign
    ? t("readyToSign.intro3", { v0: llcLine, v1: yearsSuffix })
    : t("readyToSign.intro2", { v0: args.reminder ? t("readyToSign.intro") : "", v1: llcLine, v2: yearsSuffix });
  const checks = [
    t("readyToSign.checks3"),
    t("readyToSign.checks2"),
    t("readyToSign.checks"),
  ];
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${escapeHtml(intro)}
    </p>
    <p style="margin:0 0 8px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("readyToSign.bodyHtml")}</p>
    <ul style="margin:0 0 14px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${checks.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}
    </ul>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("readyToSign.bodyHtml2")}</p>`;

  return sendEmail({
    log: { kind: args.reminder ? "sign_reminder" : "ready_to_sign", filingId: args.filingId },
    to: args.email,
    fromName: args.brand?.name,
    replyTo: args.brand?.replyTo,
    subject,
    text: customerText(
      salutation,
      `${intro}\n\n` +
      t("readyToSign.text3", { v0: checks.map((c) => `- ${c}`).join("\n") }) +
      t("readyToSign.text2") +
      t("readyToSign.text", { v0: signLink }),
      undefined,
      args.brand,
      args.locale,
    ),
    html: customerShell({ locale: args.locale,
      heading: args.resign ? t("readyToSign.heading2") : t("readyToSign.heading"),
      salutation,
      bodyHtml,
      cta: { label: t("readyToSign.label"), url: signLink },
      brand: args.brand,
    }),
  });
}

// ---------- 2b. Owner SSN (docs/reviews/2026-10-15-ssn-capture-spec.md) ----------
//
// NEITHER email ever carries the number, its last four digits, or a field for
// it: the client enters it only on their order page (encrypted at rest).

// Admin "Ask client for SSN": a sign-in link straight to the secure box on the
// order page (#ssn). Partner-branded like every other client email (S8).
export async function sendOwnerSsnRequestEmail(args: {
  locale?: string | null;
  email: string;
  recipientName?: string | null;
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
  brand?: EmailBrand;
}) {
  const t = safeEmailTranslator(args.locale);
  const salutation = firstNameFrom(args.recipientName) ?? t("ownerSsnRequest.salutation");
  const yearsLabel = args.taxYears.join(", ");
  const llcLine = args.llcName ?? t("ownerSsnRequest.llcLine");
  const yearsSuffix = yearsLabel ? t("ownerSsnRequest.yearsSuffix", { v0: args.taxYears.length === 1 ? "" : t("shared.pluralSuffix"), v1: yearsLabel }) : "";
  const link = portalLinkWithNext(args.portalLink, `/filings/${args.filingId}#ssn`);
  const intro =
    t("ownerSsnRequest.intro2", { v0: llcLine, v1: yearsSuffix }) +
    t("ownerSsnRequest.intro");
  const how =
    t("ownerSsnRequest.how");
  const noSsn = t("ownerSsnRequest.noSsn");
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(intro)}</p>
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(how)}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(noSsn)}</p>`;

  return sendEmail({
    log: { kind: "ssn_request", filingId: args.filingId },
    to: args.email,
    fromName: args.brand?.name,
    replyTo: args.brand?.replyTo,
    subject: t("ownerSsnRequest.subject"),
    text: customerText(
      salutation,
      t("ownerSsnRequest.text", { v0: intro, v1: how, v2: noSsn, v3: link }),
      undefined,
      args.brand,
      args.locale,
    ),
    html: customerShell({ locale: args.locale,
      heading: t("ownerSsnRequest.heading"),
      salutation,
      bodyHtml,
      cta: { label: t("ownerSsnRequest.label"), url: link },
      brand: args.brand,
    }),
  });
}

// Admin notification after the CLIENT saved their SSN (S5). No digits at all —
// the admin reads the number on the admin page (Reveal, change-logged).
export async function sendOwnerSsnAddedAdminEmail(args: {
  adminEmail: string;
  llcName: string | null;
  taxYears: number[];
  filingId: string;
  adminFilingUrl: string;
  replaced: boolean;
}) {
  const llcLine = args.llcName ?? "(no LLC name)";
  const yearsLabel = args.taxYears.join(", ");
  const what = args.replaced ? "replaced their SSN" : "added their SSN";
  const heading = `${llcLine}: the client ${what} — regenerate the package`;
  return sendEmail({
    log: { kind: "admin_ssn_added", filingId: args.filingId },
    to: args.adminEmail,
    subject: `[SSN ${args.replaced ? "replaced" : "added"}] ${heading}`,
    text:
      `${heading}.\n\n` +
      `The number is stored encrypted and is not included in this email. ` +
      `Open the filing to regenerate the package (lines 4b(1)/8b(1)); use Reveal on the admin page if you need to see it.\n\n` +
      `LLC:         ${llcLine}\n` +
      `Tax year(s): ${yearsLabel}\n` +
      `Filing ID:   ${args.filingId}\n` +
      `Admin view:  ${args.adminFilingUrl}\n`,
    html: adminShell({
      tag: "Client SSN",
      heading,
      rows: [
        ["LLC", llcLine],
        ["Tax years", yearsLabel],
        ["Filing ID", args.filingId],
        ["Next step", "Regenerate the package so lines 4b(1)/8b(1) show the SSN."],
        ["Admin view", args.adminFilingUrl],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">The number is stored encrypted and is not included in this email.</p>`,
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

function formatFaxProofRows(proof: FaxProof, locale?: string | null): string {
  const t = safeEmailTranslator(locale);
  const rows: Array<[string, string]> = [
    [t("shared.faxNumber"), proof.to ?? "+1 (855) 887-7737 (Ogden PIN Unit)"],
    [t("shared.deliveredAt"), emailDate(new Date(proof.deliveredAt).toUTCString(), locale, true)],
  ];
  if (proof.pageCount != null) rows.push([t("shared.pages"), String(proof.pageCount)]);
  if (proof.durationSecs != null) rows.push([t("shared.duration"), `${proof.durationSecs}s`]);
  if (proof.from) rows.push([t("shared.sentFrom"), proof.from]);
  rows.push([t("shared.confirmationId"), proof.faxId]);

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

function withTrustpilotSnippet(html: string, snippet: string | undefined): string {
  if (!snippet) return html;
  return html.includes("</body>") ? html.replace("</body>", `${snippet}\n</body>`) : `${html}${snippet}`;
}

// ---------- Trustpilot review invitations ----------
//
// Trustpilot Automatic Feedback Service: BCC'ing this address on an email makes
// Trustpilot send the recipient one review invitation. The structured-data
// snippet tells Trustpilot exactly who the customer is (the BCC copy would
// otherwise be parsed for To/name) and gives a reference to dedupe on.
// Set TRUSTPILOT_AFS_BCC="" to switch invitations off without a deploy.
export const TRUSTPILOT_AFS_BCC_DEFAULT = "form5472prep.com+70ae06b610@invite.trustpilot.com";

export function trustpilotInvite(args: {
  recipientEmail: string;
  recipientName?: string | null;
  referenceId?: string | null;
  brand?: EmailBrand;
}): { bcc: string; snippet: string } | null {
  const bcc = (process.env.TRUSTPILOT_AFS_BCC ?? TRUSTPILOT_AFS_BCC_DEFAULT).trim();
  // White-label partner clients are the partner's customers: never invite
  // them to review Form5472 Prep.
  if (!bcc || args.brand) return null;
  const payload: Record<string, string> = { recipientEmail: args.recipientEmail };
  if (args.recipientName?.trim()) payload.recipientName = args.recipientName.trim();
  if (args.referenceId) payload.referenceId = args.referenceId;
  // Escape "<" so customer-supplied text can't close the script tag.
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return { bcc, snippet: `<script type="application/json+trustpilot">${json}</script>` };
}

export async function sendFaxDeliveredEmail(args: {
  locale?: string | null;
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  portalLink: string;
  proof?: FaxProof;
  signedPdfBytes?: Uint8Array | Buffer;
  // Defense in depth: forms carrying an SSN stay in the authenticated portal.
  ownerSsnLast4?: string | null;
  ownerSsnCiphertext?: string | null;
  // Generated IRS Fax Transmission Receipt PDF. Attached separately from
  // the signed-package PDF so the customer can keep / forward / file the
  // proof-of-delivery document on its own.
  receiptPdfBytes?: Uint8Array | Buffer;
  brand?: EmailBrand;
  isFinalReturn?: boolean;
  dissolvedAt?: Date | string | null;
  // Receipts contain no SSN and attach by default, including automatic delivery.
  attachReceipt?: boolean;
  // EmailLog audit tag. logKind defaults to "fax_delivered"; the admin resend
  // passes "fax_delivered_resend".
  filingId?: string | null;
  logKind?: string;
  // BCC Trustpilot so the customer gets one review invitation. Only the
  // automatic first delivery email sets this — admin resends don't.
  reviewInvite?: boolean;
}) {
  const t = safeEmailTranslator(args.locale);
  const { email, recipientName, llcName, taxYears, portalLink, proof, signedPdfBytes, receiptPdfBytes, brand, isFinalReturn } = args;
  const attachCopy = !!(!args.ownerSsnLast4 && !args.ownerSsnCiphertext && signedPdfBytes && signedPdfBytes.byteLength > 0 && signedPdfBytes.byteLength <= MAX_FAX_COPY_BYTES);
  const invite = args.reviewInvite && !attachCopy
    ? trustpilotInvite({ recipientEmail: email, recipientName, referenceId: args.filingId, brand })
    : null;
  const attachReceipt = !!(args.attachReceipt !== false && receiptPdfBytes && receiptPdfBytes.byteLength > 0);
  const documentsLink = args.filingId
    ? portalLinkWithNext(portalLink, `/filings/${args.filingId}#documents`)
    : portalLink;
  const salutation = firstNameFrom(recipientName) ?? t("faxDelivered.salutation");
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? t("faxDelivered.llcLine");
  const latestYear = taxYears.length ? Math.max(...taxYears) : null;
  const nextTaxYear = latestYear != null ? latestYear + 1 : null;
  const nextDueDateLabel = nextTaxYear != null ? emailDate(formatDueDate(filingDueDateUtc(nextTaxYear)), args.locale) : null;

  const proofTable = proof
    ? `
      <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("faxDelivered.proofTable")}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-collapse:collapse;">
        ${formatFaxProofRows(proof, args.locale)}
      </table>
    `
    : "";

  const closingHtml =
    nextTaxYear == null || nextDueDateLabel == null
      ? ""
      : isFinalReturn
        ? `
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("faxDelivered.closingHtml4")}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.closingHtml5")}</p>
  `
        : `
    <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("faxDelivered.closingHtml")}</p>
    <p style="margin:0 0 12px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.closingHtml2", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v2: escapeHtml(llcLine), v3: escapeHtml(String(nextTaxYear)), v4: escapeHtml(nextDueDateLabel) })}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.closingHtml3", { tag0: "<strong>", tag1: "</strong>", v6: escapeHtml(String(nextTaxYear + 1)) })}</p>
  `;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("faxDelivered.bodyHtml4", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(llcLine), v2: taxYears.length > 1 ? t("shared.pluralSuffix") : "", v3: escapeHtml(yearsLabel) })}</p>
    <div style="background:${EMAIL_STYLES.greenBg};border:1px solid ${EMAIL_STYLES.greenBorder};border-radius:8px;padding:14px 18px;margin:0 0 20px;color:${EMAIL_STYLES.greenDark};font-size:14px;">${t("faxDelivered.bodyHtml5", { tag0: "<strong>", tag1: "</strong>" })}</div>
    ${proofTable}
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.bodyHtml6")}</p>
    ${attachCopy ? `<p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.bodyHtml")}</p>` : ""}
    ${attachReceipt ? `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.bodyHtml3", { tag0: "<strong>", tag1: "</strong>" })}</p>` : receiptPdfBytes ? `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.bodyHtml2", { tag0: "<strong>", tag1: "</strong>" })}</p>` : ""}
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("faxDelivered.bodyHtml7")}</p>
    ${closingHtml}
  `;

  const proofText = proof
    ? t("faxDelivered.proofText7") +
      t("faxDelivered.proofText6", { v0: proof.to ?? "+1 (855) 887-7737 (Ogden PIN Unit)" }) +
      t("faxDelivered.proofText5", { v0: emailDate(new Date(proof.deliveredAt).toUTCString(), args.locale, true) }) +
      (proof.pageCount != null ? t("faxDelivered.proofText4", { v0: proof.pageCount }) : "") +
      (proof.durationSecs != null ? t("faxDelivered.proofText3", { v0: proof.durationSecs }) : "") +
      (proof.from ? t("faxDelivered.proofText2", { v0: proof.from }) : "") +
      t("faxDelivered.proofText", { v0: proof.faxId })
    : "";
  const receiptText = attachReceipt
    ? t("faxDelivered.receiptText2")
    : receiptPdfBytes
      ? t("faxDelivered.receiptText")
      : "";
  // Same filename scheme as the admin copy (sendFaxDeliveredAdminEmail).
  const receiptAttachment = attachReceipt && receiptPdfBytes
    ? [{
        filename: downloadFileName(llcName, taxYears, "fax receipt"),
        content: receiptPdfBytes,
      }]
    : undefined;
  // Final returns do not promise next-year reminders because the entity has dissolved.
  const closingText =
    nextTaxYear == null || nextDueDateLabel == null
      ? ""
      : isFinalReturn
        ? t("faxDelivered.closingText4")
        : t("faxDelivered.closingText3") +
          t("faxDelivered.closingText2", { v0: llcLine, v1: nextTaxYear, v2: nextDueDateLabel }) +
          t("faxDelivered.closingText", { v0: nextTaxYear + 1 });

  return sendEmail({
    log: { kind: args.logKind ?? "fax_delivered", filingId: args.filingId ?? null },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: t("faxDelivered.subject", { v0: llcLine, v1: taxYears.length > 1 ? t("shared.pluralSuffix") : "", v2: yearsLabel }),
    text: customerText(
      salutation,
      t("faxDelivered.text6", { v0: llcLine, v1: taxYears.length > 1 ? t("shared.pluralSuffix") : "", v2: yearsLabel }) +
      t("faxDelivered.text5") +
      proofText +
      `\n` +
      receiptText +
      t("faxDelivered.text4") +
      (attachCopy ? t("faxDelivered.text3") : "") +
      t("faxDelivered.text2") +
      closingText +
      t("faxDelivered.text", { v0: documentsLink }),
      undefined,
      brand,
      args.locale,
    ),
    html: withTrustpilotSnippet(
      customerShell({ locale: args.locale,
        heading: t("faxDelivered.heading"),
        salutation,
        bodyHtml,
        cta: { label: t("faxDelivered.label"), url: documentsLink },
        brand,
      }),
      invite?.snippet,
    ),
    attachments: attachCopy && signedPdfBytes
      ? [...(receiptAttachment ?? []), { filename: downloadFileName(llcName, taxYears, "filed"), content: signedPdfBytes }]
      : receiptAttachment,
    ...(invite ? { bcc: invite.bcc } : {}),
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
    log: { kind: "admin_new_order", filingId },
    to: adminEmail,
    // Express orders carry an under-3-days ready-to-sign promise — flag them.
    subject: `${isTestOrder ? "[Test order]" : tier === "express" ? "[New order · EXPRESS under 3 days]" : "[New order]"} ${llcLine} (${yearsLabel})`,
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
  // Outcome of the customer's own "delivered" email, sent just before this
  // one. "failed" puts a loud action line in the subject and body so the
  // operator knows the customer has NOT been told.
  customerEmailStatus?: "sent" | "failed" | "no_customer";
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
    customerEmailStatus,
  } = args;
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? "(no LLC name)";
  const customerNotice =
    customerEmailStatus === "failed"
      ? FAX_CUSTOMER_EMAIL_FAILED_NOTICE
      : customerEmailStatus === "no_customer"
        ? "No customer email on file — the customer was not emailed."
        : null;

  const attachments: Array<{ filename: string; content: Uint8Array | Buffer }> = [];
  if (receiptPdfBytes) {
    attachments.push({
      filename: downloadFileName(llcName, taxYears, "fax receipt"),
      content: receiptPdfBytes,
    });
  }
  if (signedPdfBytes) {
    attachments.push({
      filename: downloadFileName(llcName, taxYears, "filed"),
      content: signedPdfBytes,
    });
  }

  return sendEmail({
    log: { kind: "admin_fax_delivered", filingId },
    to: adminEmail,
    subject: `${customerEmailStatus === "failed" ? "[Fax delivered — customer email FAILED]" : "[Fax delivered]"} ${llcLine} (${yearsLabel})`,
    text:
      `Fax delivered to IRS.\n\n` +
      (customerNotice ? `>>> ${customerNotice}\n\n` : "") +
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
      extraHtml:
        (customerNotice
          ? `<div style="margin:0 0 16px;padding:12px 14px;background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:6px;color:${EMAIL_STYLES.redDark};font-size:14px;font-weight:600;">${escapeHtml(customerNotice)}</div>`
          : "") +
        (attachments.length > 0
          ? `<p style="margin:0;color:${EMAIL_STYLES.subtle};font-size:13px;line-height:1.6;"><strong>Attachments:</strong> ${escapeHtml(attachments.map((attachment) => attachment.filename).join(", "))}</p>`
          : "") || undefined,
    }),
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

export const FAX_CUSTOMER_EMAIL_FAILED_NOTICE =
  "Customer email FAILED — use \u201cResend fax confirmation\u201d on the admin page.";

// Operator alert for a fax the automatic retry could not account for: the
// resubmission outcome is unknown, or Telnyx accepted it but we could not
// record the new fax id. Either way a human must check Telnyx before anyone
// re-faxes — a second IRS fax must never be sent blind.
export async function sendFaxAttentionAdminEmail(args: {
  adminEmail: string;
  filingId: string;
  llcName: string | null;
  adminFilingUrl: string;
  headline: string;
  details: Array<[label: string, value: string]>;
}) {
  const { adminEmail, filingId, llcName, adminFilingUrl, headline, details } = args;
  const llcLine = llcName ?? "(no LLC name)";
  const rows: Array<[string, string]> = [["LLC", llcLine], ["Filing ID", filingId], ...details, ["Admin view", adminFilingUrl]];
  return sendEmail({
    log: { kind: "admin_fax_attention", filingId },
    to: adminEmail,
    subject: `[Fax needs attention] ${llcLine}`,
    text: `${headline}\n\n` + rows.map(([k, v]) => `${k}: ${v}`).join("\n") + "\n",
    html: adminShell({ tag: "Fax delivery", heading: "Fax needs attention", rows, extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.redDark};font-size:14px;line-height:1.6;">${escapeHtml(headline)}</p>` }),
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
    log: { kind: "admin_fax_failed", filingId: args.filingId },
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

export async function sendFaxReceivedAdminEmail(args: {
  fromNumber: string;
  pageCount: number | null;
  receivedAt: Date;
  adminLink: string;
}) {
  const pageCount = args.pageCount == null ? "unknown" : String(args.pageCount);
  const receivedAt = args.receivedAt.toUTCString();

  return sendEmail({
    log: { kind: "admin_fax_received" },
    to: env.adminEmail,
    subject: `Fax received from ${args.fromNumber}`,
    text:
      `Inbound fax received.\n\n` +
      `From:        ${args.fromNumber}\n` +
      `Pages:       ${pageCount}\n` +
      `Received:    ${receivedAt}\n` +
      `\nAdmin view: ${args.adminLink}\n` +
      `\nNo PDF is attached because inbound faxes may contain taxpayer data.\n`,
    html: adminShell({
      tag: "Inbound fax",
      heading: "Fax received",
      rows: [
        ["From", args.fromNumber],
        ["Pages", pageCount],
        ["Received at", receivedAt],
        ["Admin view", args.adminLink],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.subtle};font-size:13px;line-height:1.6;">No PDF is attached because inbound faxes may contain taxpayer data.</p>`,
    }),
  });
}


// ---------- 5a. New portal message — admin → customer ----------

// Fires when admin posts a message into a filing's thread AND the customer
// currently has zero unread admin messages (so we don't double-notify on a
// rapid back-and-forth). Email is intentionally light on content — the
// portal thread is the source of truth.
export async function sendNewMessageToCustomerEmail(args: {
  locale?: string | null;
  filingId?: string;
  email: string;
  recipientName?: string | null;
  llcName: string | null;
  taxYears: number[];
  bodyExcerpt: string;
  portalLink: string;
  brand?: EmailBrand;
}) {
  const t = safeEmailTranslator(args.locale);
  const { email, recipientName, llcName, taxYears, bodyExcerpt, portalLink, brand } = args;
  const salutation = firstNameFrom(recipientName) ?? t("newMessageToCustomer.salutation");
  const yearsLabel = taxYears.join(", ");
  const llcLine = llcName ?? t("newMessageToCustomer.llcLine");

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("newMessageToCustomer.bodyHtml", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(llcLine), v2: taxYears.length > 1 ? t("shared.pluralSuffix") : "", v3: escapeHtml(yearsLabel) })}</p>
    <blockquote style="margin:0 0 20px;padding:14px 18px;background:${EMAIL_STYLES.bg};border-left:3px solid ${EMAIL_STYLES.brand};color:${EMAIL_STYLES.ink};font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyExcerpt)}</blockquote>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("newMessageToCustomer.bodyHtml2")}</p>
  `;

  return sendEmail({
    log: { kind: "new_message_customer", filingId: args.filingId },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: t("newMessageToCustomer.subject", { v0: llcLine }),
    text: customerText(
      salutation,
      t("newMessageToCustomer.text2", { v0: llcLine, v1: yearsLabel }) +
      `${bodyExcerpt}\n\n` +
      t("newMessageToCustomer.text", { v0: portalLink }),
      undefined,
      brand,
      args.locale,
    ),
    html: customerShell({ locale: args.locale,
      heading: t("newMessageToCustomer.heading"),
      salutation,
      bodyHtml,
      cta: { label: t("newMessageToCustomer.label"), url: portalLink },
      brand,
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
    log: { kind: "admin_new_message", filingId },
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

// ---------- 5c. New application message — admin/customer ----------

export async function sendNewApplicationMessageAdminEmail(args: {
  adminEmail: string;
  customerEmail: string;
  kind: "EIN" | "ITIN";
  subjectLabel: string;
  applicationId: string;
  adminUrl: string;
  bodyExcerpt: string;
}): Promise<unknown> {
  const { adminEmail, customerEmail, kind, subjectLabel, applicationId, adminUrl, bodyExcerpt } = args;

  return sendEmail({
    log: { kind: "admin_application_message" },
    to: adminEmail,
    subject: `[${kind} application] New message from ${customerEmail}`,
    text:
      `${customerEmail} sent a new message about ${subjectLabel}.\n\n` +
      `${bodyExcerpt}\n\n` +
      `Application ID: ${applicationId}\n` +
      `Reply in admin: ${adminUrl}\n`,
    html: adminShell({
      tag: `${kind} application message`,
      heading: "New message from customer",
      rows: [
        ["Customer", customerEmail],
        ["Application", subjectLabel],
        ["Kind", kind],
        ["Application ID", applicationId],
        ["Message", bodyExcerpt],
        ["Admin view", adminUrl],
      ],
    }),
  });
}

export async function sendNewApplicationMessageCustomerEmail(args: {
  locale?: string | null;
  email: string;
  recipientName?: string | null;
  kind: "EIN" | "ITIN";
  subjectLabel: string;
  bodyExcerpt: string;
  portalLink: string;
}): Promise<unknown> {
  const t = safeEmailTranslator(args.locale);
  const { email, recipientName, kind, subjectLabel, bodyExcerpt, portalLink } = args;
  const salutation = firstNameFrom(recipientName) ?? t("newApplicationMessageCustomer.salutation");

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("newApplicationMessageCustomer.bodyHtml", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v1: escapeHtml(kind), v2: escapeHtml(subjectLabel) })}</p>
    <blockquote style="margin:0 0 20px;padding:14px 18px;background:${EMAIL_STYLES.bg};border-left:3px solid ${EMAIL_STYLES.brand};color:${EMAIL_STYLES.ink};font-size:14px;line-height:1.5;white-space:pre-wrap;">${escapeHtml(bodyExcerpt)}</blockquote>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">${t("newApplicationMessageCustomer.bodyHtml2")}</p>
  `;

  return sendEmail({
    log: { kind: "application_message_customer" },
    to: email,
    subject: t("newApplicationMessageCustomer.subject", { v0: kind }),
    text: customerText(
      salutation,
      t("newApplicationMessageCustomer.text2", { v0: kind, v1: subjectLabel }) +
      `${bodyExcerpt}\n\n` +
      t("newApplicationMessageCustomer.text", { v0: portalLink }), undefined, undefined, args.locale
    ),
    html: customerShell({ locale: args.locale,
      heading: t("newApplicationMessageCustomer.heading"),
      salutation,
      bodyHtml,
      cta: { label: t("newApplicationMessageCustomer.label"), url: portalLink },
    }),
  });
}

// ---------- 6. January reminder (annual marketing email) ----------

type ReminderArgs = {
  locale?: string | null;
  email: string;
  taxYearToFile: number; // e.g. 2025 if reminding in January 2026 about the 2025 tax year
  previousLlcNames: string[]; // distinct LLCs the customer has filed for before
  startLink: string; // CTA to start a new filing
  unsubscribeUrl: string;
};

export async function sendJanuaryReminderEmail(args: ReminderArgs) {
  const t = safeEmailTranslator(args.locale);
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  // Shared rule owns the date — never a hardcoded April 15. Prospect mail, so
  // there are no extension facts to apply: this is the original due date.
  const deadline = emailDate(formatDueDate(filingDueDateUtc(taxYearToFile)), args.locale);
  const llcLine =
    previousLlcNames.length === 0
      ? t("januaryReminder.llcLine2")
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : t("januaryReminder.llcLine", { v0: previousLlcNames.slice(0, -1).join(", "), v1: previousLlcNames[previousLlcNames.length - 1] });

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("januaryReminder.bodyHtml", { tag0: "<strong>", tag1: "</strong>" })}</p>
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("januaryReminder.bodyHtml2", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v2: escapeHtml(llcLine), v3: taxYearToFile, v4: deadline })}</p>
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 24px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.5;">${t("januaryReminder.bodyHtml3", { tag0: "<strong style=\"color:" + (EMAIL_STYLES.ink) + ";\">", tag1: "</strong>" })}</div>
  `;

  return sendEmail({
    log: { kind: "january_reminder" },
    to: email,
    subject: t("januaryReminder.heading", { v0: taxYearToFile }),
    text:
      t("januaryReminder.text5", { v0: taxYearToFile, v1: llcLine, v2: deadline }) +
      t("januaryReminder.text4", { v0: startLink }) +
      t("januaryReminder.text3") +
      t("januaryReminder.text2") +
      t("januaryReminder.text", { v0: unsubscribeUrl }),
    html: customerShell({ locale: args.locale,
      heading: t("januaryReminder.heading", { v0: taxYearToFile }),
      salutation: t("januaryReminder.salutation"),
      bodyHtml,
      cta: { label: t("januaryReminder.label", { v0: taxYearToFile }), url: startLink },
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
  const t = safeEmailTranslator(args.locale);
  const { email, taxYearToFile, previousLlcNames, startLink, unsubscribeUrl } = args;
  // Never hardcode April 15: the shared rule owns the date (and rolls a
  // weekend deadline forward, e.g. tax year 2027 is really due April 17 2028).
  // No extension facts here — this reminder goes to a prospect with no filing
  // on record, so it is the ordinary original due date by definition.
  const deadline = emailDate(formatDueDate(filingDueDateUtc(taxYearToFile)), args.locale);
  const llcLine =
    previousLlcNames.length === 0
      ? t("marchReminder.llcLine2")
      : previousLlcNames.length === 1
        ? previousLlcNames[0]
        : t("marchReminder.llcLine", { v0: previousLlcNames.slice(0, -1).join(", "), v1: previousLlcNames[previousLlcNames.length - 1] });

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("marchReminder.bodyHtml", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v1: taxYearToFile, v2: escapeHtml(llcLine), v3: deadline })}</p>
    <div style="background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:8px;padding:14px 18px;margin:0 0 20px;color:${EMAIL_STYLES.redDark};font-size:14px;line-height:1.5;">${t("marchReminder.bodyHtml2", { tag0: "<strong>", tag1: "</strong>" })}</div>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("marchReminder.bodyHtml3")}</p>
  `;

  return sendEmail({
    log: { kind: "march_reminder" },
    to: email,
    subject: t("marchReminder.subject", { v0: taxYearToFile, v1: deadline }),
    text:
      t("marchReminder.text4", { v0: taxYearToFile, v1: llcLine, v2: deadline }) +
      t("marchReminder.text3", { v0: startLink }) +
      t("marchReminder.text2") +
      t("marchReminder.text", { v0: unsubscribeUrl }),
    html: customerShell({ locale: args.locale,
      heading: t("marchReminder.heading", { v0: taxYearToFile }),
      salutation: t("marchReminder.salutation"),
      bodyHtml,
      cta: { label: t("marchReminder.label", { v0: taxYearToFile }), url: startLink },
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
  locale?: string | null;
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
  const t = safeEmailTranslator(args.locale);
  const { email, recipientName, llcName, resumeLink, unsubscribeUrl, variant = "first" } = args;
  const salutation = firstNameFrom(recipientName) ?? t("abandonedDraftReminder.salutation");
  const llcLine = llcName ? escapeHtml(llcName) : t("abandonedDraftReminder.llcPlain");
  const llcPlain = llcName ?? t("abandonedDraftReminder.llcPlain");
  const isFinal = variant === "final";

  const subject = isFinal
    ? t("abandonedDraftReminder.subject2")
    : t("abandonedDraftReminder.subject");
  const heading = isFinal ? t("abandonedDraftReminder.heading2") : t("abandonedDraftReminder.heading");
  const preheader = isFinal
    ? t("abandonedDraftReminder.preheader2")
    : t("abandonedDraftReminder.preheader");
  const introHtml = isFinal
    ? t("abandonedDraftReminder.introHtml2", { tag0: "<strong>", tag1: "</strong>", v0: llcLine })
    : t("abandonedDraftReminder.introHtml", { tag0: "<strong>", tag1: "</strong>", v0: llcLine });
  const introText = isFinal
    ? t("abandonedDraftReminder.introText2", { v0: llcPlain })
    : t("abandonedDraftReminder.introText", { v0: llcPlain });

  const bodyHtml = `
    <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">
      ${introHtml}
    </p>
    <p style="margin:0 0 20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("abandonedDraftReminder.bodyHtml", { tag0: "<strong>", tag1: "</strong>" })}</p>
    <div style="background:${EMAIL_STYLES.bg};border:1px solid ${EMAIL_STYLES.border};border-radius:8px;padding:14px 18px;margin:0 0 24px;color:${EMAIL_STYLES.slate};font-size:14px;line-height:1.5;">${t("abandonedDraftReminder.bodyHtml2", { tag0: "<strong style=\"color:" + (EMAIL_STYLES.ink) + ";\">", tag1: "</strong>" })}</div>`;

  return sendEmail({
    log: { kind: "abandoned_draft_reminder" },
    to: email,
    subject,
    text:
      t("abandonedDraftReminder.text5", { v0: salutation, v1: introText }) +
      t("abandonedDraftReminder.text4") +
      `${resumeLink}\n\n` +
      t("abandonedDraftReminder.text3") +
      t("abandonedDraftReminder.text2") +
      t("abandonedDraftReminder.text", { v0: unsubscribeUrl }),
    html: customerShell({ locale: args.locale, preheader,
      heading,
      salutation,
      bodyHtml,
      cta: { label: t("abandonedDraftReminder.label"), url: resumeLink },
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
  businessMailingAddress?: string;
  businessType?: string;
  businessPurpose?: string;
  principalProducts?: string;
  ownerName?: string;
  dateOfBirth?: string | null;
  ownerHomeAddress?: string;
  ownerCitizenship?: string;
  ownerResidence?: string;
  notes?: string;
};

export async function sendEinApplicationAdminEmail(args: EinApplicationEmailArgs & { adminEmail: string; amountPaidCents?: number }) {
  const value = (input?: string | null, fallback = "(not provided)") => input || fallback;
  const paymentText = args.amountPaidCents && args.amountPaidCents > 0 ? `Payment: ${formatUsd(args.amountPaidCents)} received` : null;
  return sendEmail({
    log: { kind: "admin_ein_application" },
    to: args.adminEmail,
    replyTo: args.email,
    subject: `${paymentText ? "[Paid] " : ""}[EIN Application] ${args.fullName} — ${args.llcName}`,
    text: [
      "New EIN application",
      "",
      ...(paymentText ? [paymentText] : []),
      `Name: ${args.fullName}`,
      `Email: ${args.email}`,
      `Phone: ${value(args.phone)}`,
      `LLC name: ${args.llcName}`,
      `State: ${value(args.llcState)}`,
      `Formed date: ${value(args.llcFormedDate)}`,
      `Company business mailing address: ${value(args.businessMailingAddress)}`,
      `Business type: ${value(args.businessType)}`,
      `Business purpose: ${value(args.businessPurpose)}`,
      `Principal line of products or services sold: ${value(args.principalProducts)}`,
      `Owner name: ${value(args.ownerName, "(same as contact)")}`,
      `Date of birth: ${value(args.dateOfBirth)}`,
      `Owner home address: ${value(args.ownerHomeAddress)}`,
      `Citizenship: ${value(args.ownerCitizenship)}`,
      `Residence: ${value(args.ownerResidence)}`,
      `Notes: ${value(args.notes, "(none)")}`,
      "",
      "Reply directly to this email to contact the applicant.",
    ].join("\n"),
    html: adminShell({
      tag: "EIN application",
      heading: "New EIN application",
      rows: [
        ...(paymentText ? [["Payment", `${formatUsd(args.amountPaidCents ?? 0)} received`] as [string, string]] : []),
        ["Name", args.fullName],
        ["Email", args.email],
        ["Phone", value(args.phone)],
        ["LLC name", args.llcName],
        ["State", value(args.llcState)],
        ["Formed date", value(args.llcFormedDate)],
        ["Company business mailing address", value(args.businessMailingAddress)],
        ["Business type", value(args.businessType)],
        ["Business purpose", value(args.businessPurpose)],
        ["Principal line of products or services sold", value(args.principalProducts)],
        ["Owner name", value(args.ownerName, "(same as contact)")],
        ["Date of birth", value(args.dateOfBirth)],
        ["Owner home address", value(args.ownerHomeAddress)],
        ["Citizenship", value(args.ownerCitizenship)],
        ["Residence", value(args.ownerResidence)],
        ["Notes", value(args.notes, "(none)")],
      ],
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to contact the applicant.</p>`,
    }),
  });
}

export async function sendEinApplicationConfirmationEmail(args: {
  locale?: string | null;
  email: string;
  fullName: string;
  llcName: string;
  amountPaidCents: number;
  portalLink: string;
}) {
  const t = safeEmailTranslator(args.locale);
  const amount = formatUsd(args.amountPaidCents);
  const body = t("einApplicationConfirmation.body8", { v0: args.llcName, v1: amount }) +
    t("einApplicationConfirmation.body7") +
    t("einApplicationConfirmation.body6") +
    t("einApplicationConfirmation.body5") +
    t("einApplicationConfirmation.body4") +
    t("einApplicationConfirmation.body3") +
    t("einApplicationConfirmation.body2") +
    t("einApplicationConfirmation.body") +
    `${args.portalLink}\n\n` +
    t("einApplicationConfirmation.footnoteHtml");
  return sendEmail({
    log: { kind: "ein_application_confirmation" },
    to: args.email,
    subject: t("einApplicationConfirmation.subject", { v0: args.llcName }),
    text: customerText(args.fullName, body, undefined, undefined, args.locale),
    html: customerShell({ locale: args.locale,
      heading: t("einApplicationConfirmation.heading"),
      salutation: args.fullName,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("einApplicationConfirmation.bodyHtml", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v1: escapeHtml(args.llcName), v2: escapeHtml(amount) })}</p>
        <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("einApplicationConfirmation.bodyHtml2")}</p>
        <ol style="margin:0 0 24px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
          <li style="margin-bottom:8px;">${t("einApplicationConfirmation.bodyHtml3", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:8px;">${t("einApplicationConfirmation.bodyHtml4", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:8px;">${t("einApplicationConfirmation.bodyHtml5", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:0;">${t("einApplicationConfirmation.bodyHtml6", { tag0: "<strong>", tag1: "</strong>" })}</li>
        </ol>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("einApplicationConfirmation.bodyHtml7", { tag0: "<strong>", tag1: "</strong>" })}</p>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("einApplicationConfirmation.bodyHtml8")}</p>`,
      cta: { label: t("einApplicationConfirmation.label"), url: args.portalLink },
      footnoteHtml: t("einApplicationConfirmation.footnoteHtml"),
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

export async function sendItinApplicationAdminEmail(args: ItinApplicationEmailArgs & { adminEmail: string; amountPaidCents?: number }) {
  const value = (input?: string, fallback = "(not provided)") => input || fallback;
  const paymentText = args.amountPaidCents && args.amountPaidCents > 0 ? `Payment: ${formatUsd(args.amountPaidCents)} received` : null;
  return sendEmail({
    log: { kind: "admin_itin_application" },
    to: args.adminEmail,
    replyTo: args.email,
    subject: `${paymentText ? "[Paid] " : ""}[ITIN Application] ${args.fullName} — ${args.itinReason}`,
    text: [
      "New ITIN application",
      "",
      ...(paymentText ? [paymentText] : []),
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
        ...(paymentText ? [["Payment", `${formatUsd(args.amountPaidCents ?? 0)} received`] as [string, string]] : []),
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
  locale?: string | null;
  email: string;
  fullName: string;
  amountPaidCents: number;
  portalLink: string;
}) {
  const t = safeEmailTranslator(args.locale);
  const amount = formatUsd(args.amountPaidCents);
  const body = t("itinApplicationConfirmation.body7", { v0: amount }) +
    t("itinApplicationConfirmation.body6") +
    t("itinApplicationConfirmation.body5") +
    t("itinApplicationConfirmation.body4") +
    t("itinApplicationConfirmation.body3") +
    t("itinApplicationConfirmation.body2") +
    t("itinApplicationConfirmation.body") +
    `${args.portalLink}\n\n` +
    t("itinApplicationConfirmation.footnoteHtml");
  return sendEmail({
    log: { kind: "itin_application_confirmation" },
    to: args.email,
    subject: t("itinApplicationConfirmation.subject", { v0: args.fullName }),
    text: customerText(args.fullName, body, undefined, undefined, args.locale),
    html: customerShell({ locale: args.locale,
      heading: t("itinApplicationConfirmation.heading"),
      salutation: args.fullName,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("itinApplicationConfirmation.bodyHtml", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(amount) })}</p>
        <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("itinApplicationConfirmation.bodyHtml2")}</p>
        <ol style="margin:0 0 24px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
          <li style="margin-bottom:8px;">${t("itinApplicationConfirmation.bodyHtml3", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:8px;">${t("itinApplicationConfirmation.bodyHtml4", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:8px;">${t("itinApplicationConfirmation.bodyHtml5", { tag0: "<strong>", tag1: "</strong>" })}</li>
          <li style="margin-bottom:0;">${t("itinApplicationConfirmation.bodyHtml6", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>" })}</li>
        </ol>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("itinApplicationConfirmation.bodyHtml7")}</p>`,
      cta: { label: t("itinApplicationConfirmation.label"), url: args.portalLink },
      footnoteHtml: t("itinApplicationConfirmation.footnoteHtml"),
    }),
  });
}

// ---------- Form 7004 extension filing orders ----------

type ExtensionApplicationEmailArgs = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  llcName?: string | null;
  ein?: string | null;
  llcStreet?: string | null;
  llcCity?: string | null;
  llcState?: string | null;
  llcZip?: string | null;
  taxYear?: number | null;
  notes?: string | null;
};

// "April 15, 2027" for a calendar tax year; null when the customer left it blank.
function extensionDueText(taxYear: number | null | undefined): string | null {
  return taxYear ? formatDueDate(filingDueDateUtc(taxYear)) : null;
}

export async function sendExtensionApplicationAdminEmail(args: ExtensionApplicationEmailArgs & { adminEmail: string; amountPaidCents?: number }) {
  const value = (input?: string | null, fallback = "(not provided)") => input || fallback;
  const paymentText = args.amountPaidCents && args.amountPaidCents > 0 ? `Payment: ${formatUsd(args.amountPaidCents)} received` : null;
  const address = [args.llcStreet, args.llcCity, args.llcState, args.llcZip].filter(Boolean).join(", ");
  const due = extensionDueText(args.taxYear);
  const adminUrl = `${APP_URL}/admin/applications/extension/${args.id}`;
  const rows: Array<[string, string]> = [
    ...(paymentText ? [["Payment", `${formatUsd(args.amountPaidCents ?? 0)} received`] as [string, string]] : []),
    ["Tax year", args.taxYear ? String(args.taxYear) : "(not provided — confirm with the client)"],
    ["IRS due date (fax by)", value(due)],
    ["LLC name", value(args.llcName)],
    ["EIN", value(args.ein)],
    ["LLC US address", value(address)],
    ["Name", value(args.fullName)],
    ["Email", args.email],
    ["Phone", value(args.phone)],
    ["Notes", value(args.notes, "(none)")],
  ];
  return sendEmail({
    log: { kind: "admin_extension_application" },
    to: args.adminEmail,
    replyTo: args.email,
    subject: `${paymentText ? "[Paid] " : ""}[Form 7004] ${args.llcName || args.fullName || args.email}${args.taxYear ? ` — tax year ${args.taxYear}` : ""}`,
    text: [
      "New Form 7004 extension order",
      "",
      ...(paymentText ? [paymentText] : []),
      ...rows.filter(([label]) => label !== "Payment").map(([label, v]) => `${label}: ${v}`),
      "",
      `Prepare Form 7004 ("Foreign-owned U.S. DE" across the top, Form 1120 code 12), fax it to the IRS Ogden PIN Unit, email the client the fax confirmation, then mark the order Completed: ${adminUrl}`,
      "",
      "Reply directly to this email to contact the client.",
    ].join("\n"),
    html: adminShell({
      tag: "Form 7004 extension",
      heading: "New Form 7004 extension order",
      rows,
      extraHtml: `<p style="margin:0 0 12px;color:${EMAIL_STYLES.subtle};font-size:13px;line-height:1.6;">Prepare Form 7004 (&quot;Foreign-owned U.S. DE&quot; across the top, Form 1120 code 12), fax it to the IRS Ogden PIN Unit, email the client the fax confirmation, then mark the order Completed: <a href="${escapeHtml(adminUrl)}">${escapeHtml(adminUrl)}</a></p>
        <p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to contact the client.</p>`,
    }),
  });
}

export async function sendExtensionApplicationConfirmationEmail(args: {
  locale?: string | null;
  email: string;
  fullName: string;
  llcName?: string | null;
  taxYear?: number | null;
  amountPaidCents: number;
}) {
  const t = safeEmailTranslator(args.locale);
  const amount = formatUsd(args.amountPaidCents);
  const salutation = args.fullName || t("extensionApplicationConfirmation.salutation");
  const llc = args.llcName || t("extensionApplicationConfirmation.llc");
  const originalDue = extensionDueText(args.taxYear);
  const due = originalDue ? emailDate(originalDue, args.locale) : null;
  const extended = args.taxYear
    ? emailDate(formatDueDate(effectiveDueDateUtc(args.taxYear, null, { filed: "yes", transmittedAt: null })), args.locale)
    : null;
  const deadlineText = args.taxYear && due && extended
    ? t("extensionApplicationConfirmation.deadlineText2", { v0: args.taxYear, v1: due, v2: extended })
    : t("extensionApplicationConfirmation.deadlineText");
  const steps: Array<[string, string]> = [
    [t("extensionApplicationConfirmation.steps8"), t("extensionApplicationConfirmation.steps7")],
    [t("extensionApplicationConfirmation.steps6"), t("extensionApplicationConfirmation.steps5")],
    [t("extensionApplicationConfirmation.steps4"), t("extensionApplicationConfirmation.steps3")],
    [t("extensionApplicationConfirmation.steps2"), t("extensionApplicationConfirmation.steps")],
  ];
  const body = t("extensionApplicationConfirmation.body2", { v0: llc, v1: amount }) +
    t("extensionApplicationConfirmation.body") +
    steps.map(([title, text], i) => `${i + 1}. ${title} ${text}`).join("\n") + "\n\n" +
    `${deadlineText}\n\n` +
    t("extensionApplicationConfirmation.footnoteHtml");
  return sendEmail({
    log: { kind: "extension_application_confirmation" },
    to: args.email,
    subject: t("extensionApplicationConfirmation.subject", { v0: llc }),
    text: customerText(salutation, body, undefined, undefined, args.locale),
    html: customerShell({ locale: args.locale,
      heading: t("extensionApplicationConfirmation.heading"),
      salutation,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("extensionApplicationConfirmation.bodyHtml", { tag0: "<strong>", tag1: "</strong>", tag2: "<strong>", tag3: "</strong>", v1: escapeHtml(llc), v2: escapeHtml(amount) })}</p>
        <p style="margin:0 0 8px;font-weight:600;color:${EMAIL_STYLES.ink};font-size:15px;">${t("extensionApplicationConfirmation.bodyHtml2")}</p>
        <ol style="margin:0 0 24px;padding-left:20px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:14px;">
          ${steps.map(([title, text], i) => `<li style="margin-bottom:${i === steps.length - 1 ? 0 : 8}px;"><strong>${escapeHtml(title)}</strong> ${escapeHtml(text)}</li>`).join("\n          ")}
        </ol>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(deadlineText)}</p>`,
      footnoteHtml: t("extensionApplicationConfirmation.footnoteHtml"),
    }),
  });
}

// Form 7004 fax delivered (lib/fax/extension.ts). Transmission evidence only:
// never says the IRS accepted or approved the extension.
function extensionAttachmentName(prefix: string, llcName: string | null | undefined, taxYear: number | null | undefined) {
  return `${prefix}-${(llcName || "LLC").replace(/[^a-zA-Z0-9-]+/g, "_")}${taxYear ? `-${taxYear}` : ""}.pdf`;
}

export async function sendExtensionFaxedEmail(args: {
  locale?: string | null;
  email: string;
  fullName: string;
  llcName?: string | null;
  taxYear?: number | null;
  deliveredAtIso: string;
  receiptPdfBytes?: Uint8Array;
  formPdfBytes?: Uint8Array;
}) {
  const t = safeEmailTranslator(args.locale);
  const salutation = args.fullName || t("extensionFaxed.salutation");
  const llc = args.llcName || t("extensionFaxed.llc");
  const faxedOn = emailDate(new Date(args.deliveredAtIso).toUTCString(), args.locale, true);
  const extended = args.taxYear
    ? emailDate(formatDueDate(effectiveDueDateUtc(args.taxYear, null, { filed: "yes", transmittedAt: null })), args.locale)
    : null;
  const attachments = [
    ...(args.receiptPdfBytes ? [{ filename: extensionAttachmentName("IRS-fax-receipt-Form-7004", args.llcName, args.taxYear), content: args.receiptPdfBytes }] : []),
    ...(args.formPdfBytes ? [{ filename: extensionAttachmentName("Form-7004", args.llcName, args.taxYear), content: args.formPdfBytes }] : []),
  ];
  const paragraphs = [
    t("extensionFaxed.paragraphs7", { v0: llc, v1: args.taxYear ? t("extensionFaxed.paragraphs6", { v0: args.taxYear }) : "", v2: faxedOn }),
    attachments.length
      ? t("extensionFaxed.paragraphs5")
      : t("extensionFaxed.paragraphs4"),
    t("extensionFaxed.paragraphs3"),
    extended
      ? t("extensionFaxed.paragraphs2", { v0: extended })
      : t("extensionFaxed.paragraphs"),
  ];
  return sendEmail({
    log: { kind: "extension_fax_delivered" },
    to: args.email,
    subject: t("extensionFaxed.subject", { v0: llc }),
    text: customerText(salutation, paragraphs.join("\n\n"), t("extensionFaxed.footnoteHtml"), undefined, args.locale),
    html: customerShell({ locale: args.locale,
      heading: t("extensionFaxed.heading"),
      salutation,
      bodyHtml: paragraphs
        .map((p) => `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(p)}</p>`)
        .join("\n        "),
      footnoteHtml: t("extensionFaxed.footnoteHtml"),
    }),
    attachments: attachments.length ? attachments : undefined,
  });
}

type ExtensionFaxAdminArgs = {
  adminEmail: string;
  id: string;
  llcName: string | null;
  taxYear: number | null;
  customerEmail: string;
  faxId: string;
};

export async function sendExtensionFaxDeliveredAdminEmail(args: ExtensionFaxAdminArgs & {
  deliveredAtIso: string;
  pageCount: number | null;
  customerEmailStatus: "sent" | "failed";
  receiptPdfBytes?: Uint8Array;
  formPdfBytes?: Uint8Array;
}) {
  const adminUrl = `${APP_URL}/admin/applications/extension/${args.id}`;
  const llc = args.llcName || "(no LLC name)";
  const notice = args.customerEmailStatus === "failed"
    ? "Customer email FAILED — the client has NOT been told. Email them the attached receipt and Form 7004 by hand."
    : null;
  const attachments = [
    ...(args.receiptPdfBytes ? [{ filename: extensionAttachmentName("IRS-fax-receipt-Form-7004", args.llcName, args.taxYear), content: args.receiptPdfBytes }] : []),
    ...(args.formPdfBytes ? [{ filename: extensionAttachmentName("Form-7004", args.llcName, args.taxYear), content: args.formPdfBytes }] : []),
  ];
  const rows: Array<[string, string]> = [
    ["LLC", llc],
    ["Tax year", args.taxYear ? String(args.taxYear) : "(not set)"],
    ["Customer", args.customerEmail],
    ["Delivered at", new Date(args.deliveredAtIso).toUTCString()],
    ...(args.pageCount != null ? [["Pages", String(args.pageCount)] as [string, string]] : []),
    ["Telnyx fax ID", args.faxId],
    ["Customer email", args.customerEmailStatus === "sent" ? "Sent (receipt + Form 7004 attached)" : "FAILED"],
    ["Admin view", adminUrl],
  ];
  return sendEmail({
    log: { kind: "admin_extension_fax_delivered" },
    to: args.adminEmail,
    subject: `${notice ? "[Form 7004 fax delivered — customer email FAILED]" : "[Form 7004 fax delivered]"} ${llc}${args.taxYear ? ` (${args.taxYear})` : ""}`,
    text: [
      "Form 7004 fax delivered to the IRS. Order marked Completed.",
      ...(notice ? ["", `>>> ${notice}`] : []),
      "",
      ...rows.map(([label, v]) => `${label}: ${v}`),
    ].join("\n"),
    html: adminShell({
      tag: "Form 7004 fax",
      heading: "Form 7004 fax delivered",
      rows,
      extraHtml: notice
        ? `<div style="margin:0 0 16px;padding:12px 14px;background:${EMAIL_STYLES.redBg};border:1px solid ${EMAIL_STYLES.redBorder};border-radius:6px;color:${EMAIL_STYLES.redDark};font-size:14px;font-weight:600;">${escapeHtml(notice)}</div>`
        : undefined,
    }),
    attachments: attachments.length ? attachments : undefined,
  });
}

export async function sendExtensionFaxFailedAdminEmail(args: ExtensionFaxAdminArgs & { failureReason: string | null }) {
  const adminUrl = `${APP_URL}/admin/applications/extension/${args.id}`;
  const llc = args.llcName || "(no LLC name)";
  const rows: Array<[string, string]> = [
    ["LLC", llc],
    ["Tax year", args.taxYear ? String(args.taxYear) : "(not set)"],
    ["Customer", args.customerEmail],
    ["Telnyx fax ID", args.faxId],
    ["Failure reason", args.failureReason ?? "(not given)"],
    ["Admin view", adminUrl],
  ];
  return sendEmail({
    log: { kind: "admin_extension_fax_failed" },
    to: args.adminEmail,
    subject: `[Form 7004 fax FAILED] ${llc}${args.taxYear ? ` (${args.taxYear})` : ""}`,
    text: [
      "The Form 7004 fax to the IRS failed. The order is back to In review and the client was NOT emailed.",
      "Fax it again from the admin page (before the IRS due date).",
      "",
      ...rows.map(([label, v]) => `${label}: ${v}`),
    ].join("\n"),
    html: adminShell({
      tag: "Form 7004 fax",
      heading: "Form 7004 fax failed",
      rows,
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.subtle};font-size:13px;line-height:1.6;">The order is back to In review and the client was NOT emailed. Fax it again from the admin page before the IRS due date.</p>`,
    }),
  });
}

export async function sendApplicationSignatureRequestEmail(args: {
  locale?: string | null;
  email: string;
  fullName: string;
  type: "ein" | "itin";
  signLink: string;
}) {
  const t = safeEmailTranslator(args.locale);
  const label = formLabel(args.type);
  const body = t("applicationSignatureRequest.body2", { v0: label }) +
    t("applicationSignatureRequest.body") +
    `${args.signLink}\n\n` +
    t("applicationSignatureRequest.footnoteHtml");

  return sendEmail({
    log: { kind: "application_signature_request" },
    to: args.email,
    subject: t("applicationSignatureRequest.heading", { v0: label }),
    text: customerText(args.fullName, body, undefined, undefined, args.locale),
    html: customerShell({ locale: args.locale,
      heading: t("applicationSignatureRequest.heading", { v0: label }),
      salutation: args.fullName,
      bodyHtml: `
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("applicationSignatureRequest.bodyHtml", { v1: escapeHtml(label) })}</p>
        <p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("applicationSignatureRequest.bodyHtml2")}</p>`,
      cta: { label: t("applicationSignatureRequest.label"), url: args.signLink },
      footnoteHtml: t("applicationSignatureRequest.footnoteHtml"),
    }),
  });
}

export async function sendFilingSignedAdminEmail(args: {
  filingId: string;
  llcName: string | null;
  taxYears: number[];
  signerName: string;
  reSign: boolean;
  partnerName?: string;
  adminLink: string;
  placeSignatureLink: string;
}) {
  const heading = args.reSign ? "Filing re-signed" : "Filing signed";
  const llcName = args.llcName || "(no LLC name)";
  const years = args.taxYears.join(", ");
  const rows: Array<[string, string]> = [
    ["LLC name", llcName],
    ["Tax years", years],
    ["Signer name", args.signerName],
    ["Re-sign", args.reSign ? "Yes" : "No"],
    ...(args.partnerName ? [["Partner name", args.partnerName] as [string, string]] : []),
    ["Admin link", args.adminLink],
    ["Place signature link", args.placeSignatureLink],
    ["Next step", "Place the preparer signature and fax."],
  ];

  return sendEmail({
    log: { kind: "admin_filing_signed", filingId: args.filingId },
    to: env.adminEmail,
    subject: `[${heading}] ${llcName} — ${years}`,
    text: [heading, "", ...rows.map(([label, value]) => `${label}: ${value}`)].join("\n"),
    html: adminShell({
      tag: heading,
      heading,
      rows,
      extraHtml: `<p><a href="${escapeHtml(args.adminLink)}">Open filing</a> · <a href="${escapeHtml(args.placeSignatureLink)}">Place signature</a></p>`,
    }),
  });
}

export async function sendApplicationSignedAdminEmail(args: {
  type: "ein" | "itin";
  applicationId: string;
  fullName: string;
  adminLink: string;
}) {
  const label = formLabel(args.type);

  return sendEmail({
    log: { kind: "admin_application_signed" },
    to: env.adminEmail,
    subject: `[Application signed] ${label} ${args.fullName}`,
    text: [
      "Application signed",
      "",
      `Type: ${label}`,
      `Application ID: ${args.applicationId}`,
      `Name: ${args.fullName}`,
      `Admin link: ${args.adminLink}`,
    ].join("\n"),
    html: adminShell({
      tag: "Application signed",
      heading: "Application signed",
      rows: [
        ["Type", label],
        ["Application ID", args.applicationId],
        ["Name", args.fullName],
        ["Admin link", args.adminLink],
      ],
    }),
  });
}

function subjectSnippet(rawMessage: string, maxLength = 60) {
  const message = rawMessage.replace(/\s+/g, " ").trim();
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
  // /admin/questions/<id> — set when the question was stored.
  adminLink?: string;
  // False = don't set the visitor as Reply-To (fallback when Resend rejects
  // their address); the address still appears in the body.
  replyToVisitor?: boolean;
}) {
  const displayName = args.name || "(not provided)";
  const subjectParts = [args.topicLabel, args.name, subjectSnippet(args.message)].filter(Boolean).join(" — ");
  return sendEmail({
    log: { kind: "admin_website_question" },
    to: args.adminEmail,
    ...(args.replyToVisitor === false ? {} : { replyTo: args.email }),
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
      args.adminLink ? `Or answer it in admin: ${args.adminLink}` : "",
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
      extraHtml: `<p style="margin:0;color:${EMAIL_STYLES.muted};font-size:13px;">Reply directly to this email to answer the visitor.${
        args.adminLink
          ? ` Or <a href="${escapeHtml(args.adminLink)}" style="color:${EMAIL_STYLES.brand};text-decoration:none;">answer it in admin</a>.`
          : ""
      }</p>`,
    }),
  });
}

// Admin's answer to a website question, sent from /admin/questions/[id].
// Replies to it land in support@ (the default Reply-To), so the conversation
// can continue by email.
export async function sendWebsiteQuestionReplyEmail(args: {
  locale?: string | null;
  to: string;
  name?: string | null;
  reply: string;
  originalMessage: string;
  askedAt: Date;
}) {
  const t = safeEmailTranslator(args.locale);
  const salutation = firstNameFrom(args.name) ?? t("websiteQuestionReply.salutation");
  const askedOn = emailDate(args.askedAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }), args.locale);
  const paragraphs = args.reply
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const quoted = `<div style="margin:8px 0 24px;padding:12px 16px;border-left:3px solid ${EMAIL_STYLES.border};background:${EMAIL_STYLES.bg};color:${EMAIL_STYLES.muted};font-size:13px;line-height:1.6;">
      <div style="margin:0 0 6px;font-weight:600;">${t("websiteQuestionReply.quoted", { v3: escapeHtml(askedOn) })}</div>
      ${escapeHtml(args.originalMessage).replace(/\n/g, "<br/>")}
    </div>`;
  const quotedText = args.originalMessage.split("\n").map((line) => `> ${line}`).join("\n");
  return sendEmail({
    log: { kind: "website_question_reply" },
    to: args.to,
    subject: t("websiteQuestionReply.subject"),
    text: customerText(
      salutation,
      t("websiteQuestionReply.text", { v0: args.reply.trim(), v1: askedOn, v2: quotedText }),
      t("websiteQuestionReply.footnoteHtml"), undefined, args.locale
    ),
    html: customerShell({ locale: args.locale,
      heading: t("websiteQuestionReply.heading"),
      salutation,
      // shell() inserts the preheader raw, so escape the admin-typed text.
      preheader: escapeHtml(subjectSnippet(args.reply.trim(), 90)),
      bodyHtml: `${paragraphs}${quoted}`,
      footnoteHtml: t("websiteQuestionReply.footnoteHtml"),
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
    log: { kind: "admin_login" },
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
    log: { kind: "admin_partner_application" },
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

// ---------- 6. Client intake link — partner → client ----------

// Fires when a partner hands off a DRAFT filing to their client so the
// client can fill in the wizard and upload their own documents. Mirrors
// sendMagicLinkEmail's structure exactly (same helpers, same shell, same
// sendEmail call shape) — the only difference is the copy, which names the
// preparer and is explicit that the filing still needs the client's input.
export async function sendClientIntakeEmail(
  email: string,
  link: string,
  filingLabel: string,
  preparerName: string,
  brand?: EmailBrand,
  locale?: string | null
): Promise<unknown> {
  const t = safeEmailTranslator(locale);
  const heading = t("clientIntake.heading");
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("clientIntake.bodyHtml", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(preparerName), v2: escapeHtml(filingLabel) })}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;">${t("clientIntake.bodyHtml2")}</p>`;

  return sendEmail({
    log: { kind: "client_intake" },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: t("clientIntake.subject", { v0: filingLabel }),
    text: customerText(
      t("clientIntake.salutation"),
      t("clientIntake.text", { v0: preparerName, v1: filingLabel, v2: link }),
      undefined,
      brand,
      locale,
    ),
    html: customerShell({ locale,
      heading,
      salutation: t("clientIntake.salutation"),
      bodyHtml,
      cta: { label: t("clientIntake.label"), url: link },
      brand,
    }),
  });
}

// ---------- 7. Resume link — anonymous "save for later" draft ----------

// Fires when an anonymous customer leaves a draft filing partway through the
// wizard and gives us an email to send themselves back to it. Mirrors
// sendMagicLinkEmail's structure exactly (same helpers, same shell, same
// sendEmail call shape) — the copy differs because the filing here is an
// unfinished DRAFT, not a completed package: there is nothing to download,
// sign, or fax yet, so the copy only ever promises that the answers already
// given are saved and that the link reopens the filing to finish it.
export async function sendResumeFilingEmail(
  email: string,
  link: string,
  filingLabel: string,
  brand?: EmailBrand,
  locale?: string | null
): Promise<unknown> {
  const t = safeEmailTranslator(locale);
  const heading = t("resumeFiling.heading");
  const bodyHtml = `
    <p style="margin:0 0 14px;color:${EMAIL_STYLES.subtle};line-height:1.6;font-size:15px;">${t("resumeFiling.bodyHtml", { tag0: "<strong>", tag1: "</strong>", v1: escapeHtml(filingLabel) })}</p>
    <p style="margin:0 0 24px;color:${EMAIL_STYLES.muted};font-size:13px;">${t("resumeFiling.bodyHtml2")}</p>`;

  return sendEmail({
    log: { kind: "resume_filing" },
    to: email,
    fromName: brand?.name,
    replyTo: brand?.replyTo,
    subject: t("resumeFiling.subject"),
    text: customerText(
      t("resumeFiling.salutation"),
      t("resumeFiling.text", { v0: filingLabel, v1: link }),
      undefined,
      brand,
      locale,
    ),
    html: customerShell({ locale,
      heading,
      salutation: t("resumeFiling.salutation"),
      bodyHtml,
      cta: { label: t("resumeFiling.label"), url: link },
      brand,
    }),
  });
}
