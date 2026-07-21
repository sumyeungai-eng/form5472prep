import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedDraftReminderEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { makeUnsubscribeLink } from "@/lib/unsubscribeToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Triggered daily by Vercel Cron. For each DRAFT filing that:
//   • has an associated user (email captured at /start),
//   • hasn't been touched for at least 24 hours (the user actually abandoned, not just stepped away),
//   • is not older than 14 days (don't bug people about ancient drafts),
//   • hasn't already been sent this nudge,
//   • belongs to a user who hasn't opted out of marketing,
// send a one-time "pick up where you left off" email with a magic-link.
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const drafts = await prisma.filing.findMany({
    where: {
      status: "DRAFT",
      userId: { not: null },
      abandonedReminderSentAt: null,
      updatedAt: { lte: oneDayAgo, gte: fourteenDaysAgo },
      user: { is: { emailMarketingOptOut: false } },
    },
    include: { user: true },
    take: 200, // safety cap per run
  });

  const results = { eligible: drafts.length, sent: 0, skipped: 0, errors: 0 as number, errorDetails: [] as string[] };

  for (const f of drafts) {
    if (!f.user?.email || !f.userId) {
      results.skipped++;
      continue;
    }
    // Claim the send slot BEFORE emailing so two overlapping cron runs can't
    // both pass the eligibility query and both email the same draft — the
    // conditional update only flips abandonedReminderSentAt when it's still
    // null, so exactly one claim wins.
    const claim = await prisma.filing.updateMany({
      where: { id: f.id, abandonedReminderSentAt: null },
      data: { abandonedReminderSentAt: new Date() },
    });
    if (claim.count === 0) {
      results.skipped++;
      continue;
    }
    try {
      const resumeLink = makeMagicLink(f.userId);
      const unsubscribeUrl = makeUnsubscribeLink(f.userId);
      await sendAbandonedDraftReminderEmail({
        email: f.user.email,
        llcName: f.llcName,
        resumeLink,
        unsubscribeUrl,
      });
      results.sent++;
    } catch (err) {
      // Roll the claim back so a later run retries instead of never reminding.
      await prisma.filing
        .updateMany({ where: { id: f.id }, data: { abandonedReminderSentAt: null } })
        .catch(() => {});
      results.errors++;
      results.errorDetails.push(`${f.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json(results);
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
