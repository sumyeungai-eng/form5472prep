import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendAbandonedDraftReminderEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { makeUnsubscribeLink } from "@/lib/unsubscribeToken";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Triggered daily by Vercel Cron. Sends up to two "pick up where you left off"
// nudges to abandoned DRAFT filings — each nudge at most once per draft:
//   • first  — draft idle 1–14 days   (tracked by abandonedReminderSentAt)
//   • final  — draft idle ~1 month, 30–45 days (abandonedReminderSent2At)
// Each cohort requires a captured email and an opted-in user, and has an upper
// idle bound so we never blast very old drafts (e.g. on first deploy).
export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const first = await processCohort({
    claimField: "abandonedReminderSentAt",
    idleAtLeast: new Date(now - 1 * day), // untouched ≥ 1 day
    notOlderThan: new Date(now - 14 * day), // but ≤ 14 days old
    variant: "first",
  });

  const final = await processCohort({
    claimField: "abandonedReminderSent2At",
    idleAtLeast: new Date(now - 30 * day), // untouched ≥ ~1 month
    notOlderThan: new Date(now - 45 * day), // but ≤ 45 days old
    variant: "final",
  });

  return NextResponse.json({ first, final });
}

type ClaimField = "abandonedReminderSentAt" | "abandonedReminderSent2At";

type CohortOpts = {
  claimField: ClaimField;
  idleAtLeast: Date;
  notOlderThan: Date;
  variant: "first" | "final";
};

// Typed helpers so the "which reminder column" choice stays type-safe (no
// dynamic object keys, which Prisma's generated input types reject).
function unsentFilter(field: ClaimField): Prisma.FilingWhereInput {
  return field === "abandonedReminderSentAt"
    ? { abandonedReminderSentAt: null }
    : { abandonedReminderSent2At: null };
}
function stamp(field: ClaimField, value: Date | null): Prisma.FilingUpdateManyMutationInput {
  return field === "abandonedReminderSentAt"
    ? { abandonedReminderSentAt: value }
    : { abandonedReminderSent2At: value };
}

async function processCohort(opts: CohortOpts) {
  const { claimField, idleAtLeast, notOlderThan, variant } = opts;

  const drafts = await prisma.filing.findMany({
    where: {
      status: "DRAFT",
      userId: { not: null },
      updatedAt: { lte: idleAtLeast, gte: notOlderThan },
      user: { is: { emailMarketingOptOut: false } },
      ...unsentFilter(claimField),
    },
    include: { user: true },
    take: 200, // safety cap per run
  });

  const results = {
    eligible: drafts.length,
    sent: 0,
    skipped: 0,
    errors: 0 as number,
    errorDetails: [] as string[],
  };

  for (const f of drafts) {
    if (!f.user?.email || !f.userId) {
      results.skipped++;
      continue;
    }
    // Claim the send slot BEFORE emailing so two overlapping cron runs can't
    // both pass the eligibility query and both email the same draft — the
    // conditional update only flips the field when it's still null, so exactly
    // one claim wins.
    const claim = await prisma.filing.updateMany({
      where: { id: f.id, ...unsentFilter(claimField) },
      data: stamp(claimField, new Date()),
    });
    if (claim.count === 0) {
      results.skipped++;
      continue;
    }
    try {
      await sendAbandonedDraftReminderEmail({
        email: f.user.email,
        recipientName: f.ownerName,
        llcName: f.llcName,
        resumeLink: makeMagicLink(f.userId),
        unsubscribeUrl: makeUnsubscribeLink(f.userId),
        variant,
      });
      results.sent++;
    } catch (err) {
      // Roll the claim back so a later run retries instead of never reminding.
      await prisma.filing
        .updateMany({ where: { id: f.id }, data: stamp(claimField, null) })
        .catch(() => {});
      results.errors++;
      results.errorDetails.push(`${f.id}: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return results;
}

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // dev fallback
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}
