import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin/auth";
import {
  sendOrderConfirmationEmail,
  sendEinApplicationConfirmationEmail,
  sendItinApplicationConfirmationEmail,
} from "@/lib/email";
import { DEFAULT_TIER } from "@/lib/pricing";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin-only: renders a customer-facing transactional email with obviously
// fake sample data and sends it to an address the admin names, so email copy
// and layout can be reviewed in a real inbox (Gmail/Apple Mail render very
// differently from a local HTML preview, and RESEND_API_KEY is marked
// sensitive in Vercel so it cannot be pulled to a laptop to send from there).
//
// Sample data only — this route never reads a real filing or application, so
// it cannot leak customer data to the address supplied. It also cannot mark
// anything as sent: the real senders are driven by the Stripe webhook.
const TEMPLATES = ["order", "ein", "itin"] as const;
type Template = (typeof TEMPLATES)[number];

function isTemplate(value: unknown): value is Template {
  return typeof value === "string" && (TEMPLATES as readonly string[]).includes(value);
}

// A magic-link-shaped URL that is deliberately NOT a real token: the point is
// to review layout, and a live token in a sample email would be a standing
// credential sitting in an inbox.
const SAMPLE_PORTAL_LINK = `${env.appUrl}/admin/filings`;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { to?: unknown; templates?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const to = typeof body.to === "string" ? body.to.trim() : "";
  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ error: "a valid `to` address is required" }, { status: 400 });
  }

  const requested = Array.isArray(body.templates) ? body.templates : TEMPLATES;
  const templates = requested.filter(isTemplate);
  if (templates.length === 0) {
    return NextResponse.json(
      { error: `templates must be a subset of ${TEMPLATES.join(", ")}` },
      { status: 400 },
    );
  }

  const sent: string[] = [];
  const failed: { template: Template; error: string }[] = [];

  for (const template of templates) {
    try {
      if (template === "order") {
        await sendOrderConfirmationEmail({
          email: to,
          recipientName: "Alex Chen",
          llcName: "Acme Holdings LLC (sample)",
          taxYears: [2025],
          tier: DEFAULT_TIER,
          amountPaidCents: 14900,
          faxService: true,
          portalLink: SAMPLE_PORTAL_LINK,
          receiptUrl: null,
          filingId: "sample",
          dueDateText: "April 15, 2026",
        });
      } else if (template === "ein") {
        await sendEinApplicationConfirmationEmail({
          email: to,
          fullName: "Alex Chen",
          llcName: "Acme Holdings LLC (sample)",
          amountPaidCents: 14900,
          portalLink: SAMPLE_PORTAL_LINK,
        });
      } else {
        await sendItinApplicationConfirmationEmail({
          email: to,
          fullName: "Alex Chen",
          amountPaidCents: 34900,
          portalLink: SAMPLE_PORTAL_LINK,
        });
      }
      sent.push(template);
    } catch (err) {
      failed.push({ template, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({ to, sent, failed }, { status: failed.length > 0 ? 207 : 200 });
}
