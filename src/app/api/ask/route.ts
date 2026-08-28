import { NextResponse } from "next/server";
import { sendWebsiteQuestionAdminEmail } from "@/lib/email";
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

const TOPIC_LABELS = {
  service: "Pre-sales question",
  "in-progress": "Filing in progress",
  "late-years": "Late or past years (DIIRSP)",
  "ein-itin": "EIN or ITIN",
  "irs-notice": "IRS notice or penalty",
  billing: "Billing or refund",
  partner: "Partner enquiry",
  other: "Other",
} as const;

export async function POST(req: Request) {
  const rl = await rateLimit("ask", clientIp(req), 5, 600);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_EMAIL) : "";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE) : "";
  const topic =
    typeof body.topic === "string" && Object.prototype.hasOwnProperty.call(TOPIC_LABELS, body.topic)
      ? (body.topic as keyof typeof TOPIC_LABELS)
      : null;
  const topicLabel = topic ? TOPIC_LABELS[topic] : "";
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

  try {
    await sendWebsiteQuestionAdminEmail({
      adminEmail: env.adminEmail,
      name,
      email,
      message,
      topicLabel,
      pageUrl,
    });
  } catch (err) {
    console.error("[ask] email send failed", err);
    return NextResponse.json({ error: "Could not send. Please email support@form5472prep.com." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
