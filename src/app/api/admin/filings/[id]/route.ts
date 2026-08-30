import { NextResponse } from "next/server";
import { getAdminPrincipal, isAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/prisma";
import { sendAbandonedDraftReminderEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { makeUnsubscribeLink } from "@/lib/unsubscribeToken";
import {
  FilingActionError,
  runFilingAction,
  type FilingActionName,
} from "@/lib/admin/filingActions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// AI check takes 15-30s end-to-end; the regenerate-and-resend-confirmation
// case can be similar. Default 10s isn't enough.
export const maxDuration = 120;

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  if (!action) return NextResponse.json({ error: "missing action" }, { status: 400 });

  // Review coordination applies independently of the customer-facing filing
  // workflow, so these actions deliberately bypass the DRAFT-only helper.
  if (action === "startReview" || action === "endReview") {
    return handleReviewAction(req, params.id, action);
  }

  // Draft-only actions (archive / unarchive / destroy / manual nudge) live here
  // rather than in runFilingAction: they touch no filing workflow state and must
  // stay behind a status guard that the workflow actions don't share.
  if (
    action === "hideDraft" ||
    action === "unhideDraft" ||
    action === "deleteDraft" ||
    action === "sendDraftReminder"
  ) {
    return handleDraftAction(params.id, action);
  }

  try {
    const result = await runFilingAction(
      params.id,
      action as FilingActionName,
      body,
      {
        adminId: null,
        force: true,
        reason: "legacy admin override",
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof FilingActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}

async function handleReviewAction(
  req: Request,
  filingId: string,
  action: "startReview" | "endReview",
) {
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: { id: true },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  const principal = action === "startReview" ? await getAdminPrincipal(req) : null;
  await prisma.filing.update({
    where: { id: filing.id },
    data:
      action === "startReview"
        ? {
            inReview: true,
            reviewStartedAt: new Date(),
            reviewedBy: principal?.email ?? principal?.adminId ?? null,
          }
        : {
            inReview: false,
            reviewStartedAt: null,
            reviewedBy: null,
          },
    select: { id: true },
  });
  return NextResponse.json({ ok: true });
}

async function handleDraftAction(
  filingId: string,
  action: "hideDraft" | "unhideDraft" | "deleteDraft" | "sendDraftReminder",
) {
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: {
      id: true,
      status: true,
      userId: true,
      llcName: true,
      abandonedReminderSentAt: true,
      user: { select: { email: true, emailMarketingOptOut: true } },
    },
  });
  if (!filing) return NextResponse.json({ error: "filing not found" }, { status: 404 });

  // Hard guard for every action below, deliberately checked once before the
  // switch so no branch can be added later that forgets it. Only abandoned
  // wizard drafts are disposable: anything past DRAFT is taxpayer data tied to
  // a payment and (often) to a fax we may have to prove we sent, so it must
  // never be hideable or destroyable — whatever the client posts. The same
  // guard keeps the "finish your filing" nudge off filings already paid for.
  if (filing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "only draft filings can be reminded, hidden, or deleted" },
      { status: 400 },
    );
  }

  switch (action) {
    case "hideDraft":
    case "unhideDraft": {
      await prisma.filing.update({
        where: { id: filing.id },
        data: { adminHidden: action === "hideDraft" },
        select: { id: true },
      });
      return NextResponse.json({ ok: true });
    }

    case "deleteDraft": {
      // Every relation pointing at Filing (FilingYearData, PlaidConnection,
      // Message, FilingChangeLog) declares onDelete: Cascade, and BankStatement
      // cascades off FilingYearData — so one delete takes the whole subtree.
      // Wrapped in a transaction anyway so that if a non-cascading relation is
      // added later, its explicit cleanup lands atomically with the row.
      await prisma.$transaction(async (tx) => {
        await tx.filing.delete({ where: { id: filing.id } });
      });
      return NextResponse.json({ ok: true });
    }

    case "sendDraftReminder": {
      // Manual version of the daily abandoned-draft cron: same template, same
      // magic link, same opt-out rules — just triggered the moment an admin
      // spots a hot half-finished draft instead of waiting for the nightly run.
      if (!filing.userId || !filing.user?.email) {
        return NextResponse.json(
          { error: "draft has no email — nothing to send to" },
          { status: 400 },
        );
      }
      // An admin's hunch does not outrank an unsubscribe.
      if (filing.user.emailMarketingOptOut) {
        return NextResponse.json(
          { error: "customer has unsubscribed from reminder emails" },
          { status: 400 },
        );
      }

      try {
        await sendAbandonedDraftReminderEmail({
          email: filing.user.email,
          llcName: filing.llcName,
          resumeLink: makeMagicLink(filing.userId),
          unsubscribeUrl: makeUnsubscribeLink(filing.userId),
          variant: "first",
        });
      } catch (error) {
        // Nothing is stamped on failure, so the cron (and the admin) can retry.
        return NextResponse.json(
          { error: error instanceof Error ? error.message : "failed to send reminder" },
          { status: 500 },
        );
      }

      // Stamp unconditionally, even if the cron already claimed this slot: the
      // field's job is "when was this customer last nudged", and writing it now
      // also stops tonight's cron double-nudging someone we just chased.
      // abandonedReminderSent2At is left alone — the final nudge is still owed.
      const sentAt = new Date();
      await prisma.filing.update({
        where: { id: filing.id },
        data: { abandonedReminderSentAt: sentAt },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, sentAt: sentAt.toISOString() });
    }
  }
}
