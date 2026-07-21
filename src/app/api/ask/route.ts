import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public "Ask a question" widget endpoint. Collects a visitor's question
// (+ their email so we can reply) and emails it to the admin inbox. No auth —
// it's a contact form — so we validate + cap lengths to keep it tidy and
// reply-to the visitor's address so the operator can answer directly.

const MAX_MESSAGE = 4000;
const MAX_EMAIL = 320;
const MAX_NAME = 200;

export async function POST(req: Request) {
  const rl = await rateLimit("ask", clientIp(req), 5, 600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_EMAIL) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  // Honeypot — bots fill hidden fields; humans never see it. Silently accept
  // (so the bot thinks it worked) but don't email.
  const honeypot = typeof body.company === "string" ? body.company.trim() : "";
  // Optional context: which page they asked from.
  const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.trim().slice(0, 500) : "";

  if (!email || !email.includes("@") || !message) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
  }

  if (honeypot) {
    // Pretend success; drop the spam.
    return NextResponse.json({ ok: true });
  }

  const safe = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const displayName = name || "(not provided)";

  try {
    await sendEmail({
      to: env.adminEmail,
      replyTo: email,
      subject: `[Website question] ${name ? name + " — " : ""}${message.slice(0, 60)}${message.length > 60 ? "…" : ""}`,
      text: [
        "New question from the website widget",
        "",
        `Name:  ${displayName}`,
        `Email: ${email}`,
        pageUrl ? `Page:  ${pageUrl}` : "",
        "",
        "Message:",
        message,
        "",
        "— Reply directly to this email to answer the visitor.",
      ]
        .filter(Boolean)
        .join("\n"),
      html: `
        <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a;">New question from the website</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Name</td><td style="color:#0f172a;font-weight:600;">${safe(displayName)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748b;">Email</td><td><a href="mailto:${safe(email)}" style="color:#1e3a8a;">${safe(email)}</a></td></tr>
          ${pageUrl ? `<tr><td style="padding:6px 16px 6px 0;color:#64748b;">Page</td><td style="color:#0f172a;">${safe(pageUrl)}</td></tr>` : ""}
        </table>
        <p style="margin:16px 0 4px;color:#64748b;font-size:13px;">Message</p>
        <p style="margin:0;color:#0f172a;font-size:15px;white-space:pre-wrap;">${safe(message)}</p>
        <p style="margin:24px 0 0;font-size:13px;color:#64748b;">Reply directly to this email to answer the visitor.</p>
      `,
    });
  } catch (err) {
    console.error("[ask] email send failed", err);
    return NextResponse.json({ error: "Could not send. Please email support@form5472prep.com." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
