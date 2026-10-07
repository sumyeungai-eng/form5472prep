import { NextResponse } from "next/server";
import { sendWebsiteQuestionAdminEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public "Ask a question" widget endpoint. Collects a visitor's question
// (+ their email so we can reply), stores it for /admin/questions and emails
// it to the admin inbox. No auth —
// it's a contact form — so we validate + cap lengths to keep it tidy and
// reply-to the visitor's address so the operator can answer directly.

const MAX_MESSAGE = 4000;
const MAX_EMAIL = 320;
const MAX_NAME = 200;

// One plausible address: something@domain.tld, no spaces or list separators.
// The visitor's address becomes the email's Reply-To, and Resend rejects the
// whole send for an invalid Reply-To — so "jose@altorven" or two addresses
// used to lose the question with a generic 500 (customer report 2026-10-05).
const EMAIL_RE = /^[^\s@,;<>()]+@[^\s@,;<>()]+\.[a-z]{2,}$/i;
const INVALID_EMAIL_ERROR =
  "Please check your email address. It should look like name@company.com, so we can reply to you.";

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

  if (!email || !message) {
    return NextResponse.json({ error: "Email and message are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: INVALID_EMAIL_ERROR }, { status: 400 });
  }

  if (honeypot) {
    // Pretend success; drop the spam.
    return NextResponse.json({ ok: true });
  }

  // Store it for the admin Questions page. Best-effort: a database hiccup must
  // never lose the question, which still reaches the inbox by email below.
  let adminLink: string | undefined;
  try {
    const saved = await prisma.websiteQuestion.create({
      data: { name: name || null, email, message, topic: topicLabel || null, pageUrl: pageUrl || null },
      select: { id: true },
    });
    adminLink = `${env.appUrl}/admin/questions/${saved.id}`;
  } catch (err) {
    console.error("[ask] could not store question; emailing only", err);
  }

  const question = { adminEmail: env.adminEmail, name, email, message, topicLabel, pageUrl, adminLink };
  try {
    await sendWebsiteQuestionAdminEmail(question);
  } catch (err) {
    console.error("[ask] email send failed; retrying without Reply-To", err);
    // Never lose the question: retry once without the visitor as Reply-To
    // (the usual rejection cause). Their address is still in the body.
    try {
      await sendWebsiteQuestionAdminEmail({ ...question, replyToVisitor: false });
    } catch (retryErr) {
      console.error("[ask] email send failed on retry", retryErr);
      // Stored questions still show up in /admin/questions, so only fail the
      // visitor when the question exists nowhere.
      if (!adminLink) {
        return NextResponse.json({ error: "Could not send. Please email support@form5472prep.com." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
