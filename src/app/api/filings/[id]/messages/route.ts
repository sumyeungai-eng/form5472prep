import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling } from "@/lib/session";
import { isAdmin } from "@/lib/admin/auth";
import { env } from "@/lib/env";
import { makeMagicLink } from "@/lib/magicLink";
import {
  sendNewMessageToCustomerEmail,
  sendNewMessageToAdminEmail,
} from "@/lib/email";

export const runtime = "nodejs";

const MAX_BODY_LEN = 5000;

// Resolve the caller for this request. The client tells us which view it's
// rendering (?as=admin or ?as=customer) and we validate that claim against
// the appropriate cookie. This matters because a single browser may hold
// BOTH cookies simultaneously (e.g. you log in as admin to /admin and then
// open your own customer-side view), and without the explicit ?as= hint we'd
// always promote to admin — labelling your customer-page messages as admin.
//
// If ?as= is omitted, fall back to "admin first, then customer" so older
// callers (and curl tests) keep working.
async function resolveCaller(
  filingId: string,
  requestedAs: "admin" | "customer" | null,
): Promise<
  | { role: "admin"; filing: { id: string; llcName: string | null; taxYears: number[]; userId: string | null; user: { email: string } | null } }
  | { role: "customer"; filing: { id: string; llcName: string | null; taxYears: number[]; userId: string | null; user: { email: string } | null } }
  | { role: "denied" }
> {
  const tryAdmin = requestedAs === null || requestedAs === "admin";
  const tryCustomer = requestedAs === null || requestedAs === "customer";

  if (tryAdmin && (await isAdmin())) {
    const filing = await prisma.filing.findUnique({
      where: { id: filingId },
      select: { id: true, llcName: true, taxYears: true, userId: true, user: { select: { email: true } } },
    });
    if (!filing) return { role: "denied" };
    return { role: "admin", filing };
  }
  if (tryCustomer) {
    const owned = await getOwnedFiling(filingId);
    if (!owned) return { role: "denied" };
    const filing = await prisma.filing.findUnique({
      where: { id: owned.id },
      select: { id: true, llcName: true, taxYears: true, userId: true, user: { select: { email: true } } },
    });
    if (!filing) return { role: "denied" };
    return { role: "customer", filing };
  }
  return { role: "denied" };
}

function parseAs(req: Request): "admin" | "customer" | null {
  const v = new URL(req.url).searchParams.get("as");
  return v === "admin" || v === "customer" ? v : null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const caller = await resolveCaller(params.id, parseAs(req));
  if (caller.role === "denied") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { filingId: params.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });

  // Auto-mark messages from the OTHER party as read. Admin viewing the
  // thread reads customer messages; customer viewing reads admin messages.
  // This is what makes the "first unread" email rule self-rearm.
  const otherDirection = caller.role === "admin" ? false : true;
  const unreadIds = messages.filter((m) => m.fromAdmin === otherDirection && m.readAt === null).map((m) => m.id);
  if (unreadIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadIds } },
      data: { readAt: new Date() },
    });
    for (const m of messages) if (unreadIds.includes(m.id)) m.readAt = new Date();
  }

  return NextResponse.json({ messages, role: caller.role });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const caller = await resolveCaller(params.id, parseAs(req));
  if (caller.role === "denied") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { body: rawBody } = (await req.json().catch(() => ({}))) as { body?: unknown };
  const body = typeof rawBody === "string" ? rawBody.trim() : "";
  if (!body) return NextResponse.json({ error: "Message is empty" }, { status: 400 });
  if (body.length > MAX_BODY_LEN) {
    return NextResponse.json({ error: `Message too long (max ${MAX_BODY_LEN} characters)` }, { status: 400 });
  }

  const fromAdmin = caller.role === "admin";

  // "First unread" rule: if the recipient currently has zero unread messages
  // from us in this thread, the message we're about to insert will be their
  // first unread one — so fire the email. Counting BEFORE insert avoids
  // racing ourselves. A small concurrent-send race could double-email; that's
  // acceptable for v1 vs. the complexity of a row lock.
  const priorUnreadFromSender = await prisma.message.count({
    where: { filingId: params.id, fromAdmin, readAt: null },
  });

  const message = await prisma.message.create({
    data: { filingId: params.id, fromAdmin, body },
    select: { id: true, fromAdmin: true, body: true, readAt: true, createdAt: true },
  });

  // AI conversation loop is retired — your accountant handles customer
  // replies directly now. The respond-to-customer endpoint file is left
  // in the codebase as dormant code (nothing fires it).

  if (priorUnreadFromSender === 0) {
    const bodyExcerpt = body.length > 500 ? body.slice(0, 500) + "…" : body;
    try {
      if (fromAdmin) {
        // Admin → customer: needs a user with an email to notify.
        if (caller.filing.user?.email && caller.filing.userId) {
          await sendNewMessageToCustomerEmail({
            email: caller.filing.user.email,
            llcName: caller.filing.llcName,
            taxYears: caller.filing.taxYears,
            bodyExcerpt,
            portalLink: makeMagicLink(caller.filing.userId),
          });
        }
      } else {
        // Customer → admin: customer must be signed-in (anonymous filings
        // can't post via UI), but defend the check anyway.
        if (caller.filing.user?.email) {
          await sendNewMessageToAdminEmail({
            adminEmail: env.supportEmail,
            customerEmail: caller.filing.user.email,
            llcName: caller.filing.llcName,
            taxYears: caller.filing.taxYears,
            filingId: caller.filing.id,
            adminFilingUrl: `${env.appUrl}/admin/filings/${caller.filing.id}`,
            bodyExcerpt,
          });
        }
      }
    } catch (err) {
      // Don't fail the POST if email delivery fails — the message itself
      // is persisted and will show up in-portal. Log so we can investigate.
      console.error("[messages POST] notification email failed", err);
    }
  }

  return NextResponse.json({ message });
}
