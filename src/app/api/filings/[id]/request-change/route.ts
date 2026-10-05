import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOwnedFiling } from "@/lib/session";
import { env } from "@/lib/env";
import { sendNewMessageToAdminEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_LEN = 5;
const MAX_LEN = 5000;
const CHANGE_REQUEST_PREFIX = "Change requested before signing:";
// One support email per filing per window; later notes in the window are
// still saved to the thread (admin sees them on the filing page).
const EMAIL_THROTTLE_MS = 10 * 60 * 1000;

// POST /api/filings/[id]/request-change  { body: string }
//
// "Something's not right? Request a change" on the check-and-sign page. Same
// access as signing (owner session, partner, or the client's sign invite), so
// a partner's client who arrived by sign link can use it too. Stores the note
// in the filing's message thread and emails support — unlike ordinary
// messages (first-unread rule), a change request blocks filing, so it is
// announced even when older messages are unread (throttled to one email per
// filing per 10 minutes). Only available while the reviewed package is out
// for signature, which is the only time the check-and-sign page shows it. Admin fixes the data and uploads a new reviewed PDF, which
// emails the client to check and sign again.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const owned = await getOwnedFiling(params.id, "sign");
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payload = (await req.json().catch(() => ({}))) as { body?: unknown };
  const text = typeof payload.body === "string" ? payload.body.trim() : "";
  if (text.length < MIN_LEN) {
    return NextResponse.json({ error: "Tell us briefly what needs changing." }, { status: 400 });
  }
  if (text.length > MAX_LEN) {
    return NextResponse.json({ error: `Please keep it under ${MAX_LEN} characters.` }, { status: 400 });
  }

  const filing = await prisma.filing.findUnique({
    where: { id: owned.id },
    select: {
      id: true,
      status: true,
      generatedPdfKey: true,
      reviewApprovedAt: true,
      llcName: true,
      taxYears: true,
      user: { select: { email: true } },
    },
  });
  if (!filing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (
    !filing.generatedPdfKey ||
    !filing.reviewApprovedAt ||
    !["PDF_GENERATED", "SIGNATURE_PENDING"].includes(filing.status)
  ) {
    return NextResponse.json(
      { error: "Your forms aren't out for signature right now. Please message us from your filing page." },
      { status: 409 },
    );
  }

  const recentRequest = await prisma.message.findFirst({
    where: {
      filingId: filing.id,
      fromAdmin: false,
      body: { startsWith: CHANGE_REQUEST_PREFIX },
      createdAt: { gte: new Date(Date.now() - EMAIL_THROTTLE_MS) },
    },
    select: { id: true },
  });

  const body = `${CHANGE_REQUEST_PREFIX}\n\n${text}`;
  const message = await prisma.message.create({
    data: { filingId: filing.id, fromAdmin: false, body },
    select: { id: true, createdAt: true },
  });

  if (!recentRequest) try {
    await sendNewMessageToAdminEmail({
      adminEmail: env.supportEmail,
      customerEmail: filing.user?.email ?? "(client email not on file)",
      llcName: filing.llcName,
      taxYears: filing.taxYears,
      filingId: filing.id,
      adminFilingUrl: `${env.appUrl}/admin/filings/${filing.id}`,
      bodyExcerpt: body.length > 500 ? `${body.slice(0, 500)}…` : body,
    });
  } catch (err) {
    // The note is saved in the thread either way; admin sees it on the filing.
    console.error("[request-change] admin notification email failed", err);
  }

  return NextResponse.json({ ok: true, messageId: message.id });
}
