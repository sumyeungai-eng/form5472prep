import { FilingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendJanuaryReminderEmail,
  sendMarchReminderEmail,
} from "@/lib/email";
import { makeUnsubscribeLink } from "@/lib/unsubscribeToken";
import { env } from "@/lib/env";

export type Campaign = "january" | "march";

// Filing statuses that mean "they paid us money for this year" — used to
// 1) identify customers eligible for the reminder, and 2) skip users who
// have already filed for the year we'd be reminding about.
const PAID_STATUSES: FilingStatus[] = [
  FilingStatus.PAID,
  FilingStatus.PDF_GENERATED,
  FilingStatus.SIGNATURE_PENDING,
  FilingStatus.SIGNED_UPLOADED,
  FilingStatus.FAXED,
  FilingStatus.CONFIRMED,
  FilingStatus.FAILED,
];

export type EligibleUser = {
  userId: string;
  email: string;
  previousLlcNames: string[];
};

// Returns the tax year being reminded about for a given send date. Filings
// for tax year N are due April 15 of year N+1, so a January or March send
// in calendar year Y reminds about tax year Y-1.
export function taxYearForSend(sendDate = new Date()): number {
  return sendDate.getUTCFullYear() - 1;
}

// Find every user with at least one paid filing who:
//   • hasn't opted out,
//   • hasn't already been sent THIS campaign for THIS year,
//   • hasn't already filed (paid) for the tax year we'd remind them about.
export async function findEligibleUsers(
  campaign: Campaign,
  taxYear: number,
): Promise<EligibleUser[]> {
  // Users with any paid filing, eager-loading filings to compute previous
  // LLC names and the "already filed this year" exclusion in app code (one
  // query, no N+1).
  const users = await prisma.user.findMany({
    where: {
      emailMarketingOptOut: false,
      filings: { some: { status: { in: PAID_STATUSES } } },
      // Exclude users already sent this campaign for this year.
      NOT: {
        reminders: { some: { year: taxYear, campaign } },
      },
    },
    select: {
      id: true,
      email: true,
      filings: {
        where: { status: { in: PAID_STATUSES } },
        select: { llcName: true, taxYears: true, status: true },
      },
    },
  });

  return users
    .filter((u) => {
      // Skip if they already have an in-progress/completed filing for this tax
      // year. A FAILED filing does NOT count — the fax didn't go through, so
      // they still need to file and are exactly who the reminder should reach.
      const alreadyFiled = u.filings.some(
        (f) => f.status !== FilingStatus.FAILED && f.taxYears.includes(taxYear),
      );
      return !alreadyFiled;
    })
    .map((u) => ({
      userId: u.id,
      email: u.email,
      previousLlcNames: distinct(
        u.filings.map((f) => f.llcName).filter((n): n is string => !!n && n.trim().length > 0),
      ),
    }));
}

export type CampaignResult = {
  campaign: Campaign;
  taxYear: number;
  attempted: number;
  sent: number;
  failed: number;
  errors: { userId: string; message: string }[];
  dryRun: boolean;
};

export async function runCampaign(args: {
  campaign: Campaign;
  taxYear?: number;
  dryRun?: boolean;
}): Promise<CampaignResult> {
  const taxYear = args.taxYear ?? taxYearForSend();
  const dryRun = !!args.dryRun;
  const eligible = await findEligibleUsers(args.campaign, taxYear);
  const startLink = `${env.appUrl}/start?utm_source=email&utm_medium=lifecycle&utm_campaign=${args.campaign}-reminder`;

  const result: CampaignResult = {
    campaign: args.campaign,
    taxYear,
    attempted: eligible.length,
    sent: 0,
    failed: 0,
    errors: [],
    dryRun,
  };

  for (const u of eligible) {
    if (dryRun) {
      result.sent += 1;
      continue;
    }
    // Claim the send slot BEFORE emailing. The @@unique([userId,year,campaign])
    // constraint makes this atomic: if two runs overlap (the Vercel cron and the
    // admin "Run campaign" button), only one create() succeeds — the other
    // throws P2002 and skips, so the customer can't be emailed twice. (The old
    // order — send, then create — let both runs pass the eligibility filter and
    // both send before either wrote the row.)
    try {
      await prisma.reminderSent.create({
        data: { userId: u.userId, year: taxYear, campaign: args.campaign },
      });
    } catch {
      // Row already exists — another run (or a prior pass) already claimed and
      // sent this reminder. Skip without emailing.
      continue;
    }
    try {
      const sendFn =
        args.campaign === "january" ? sendJanuaryReminderEmail : sendMarchReminderEmail;
      await sendFn({
        email: u.email,
        taxYearToFile: taxYear,
        previousLlcNames: u.previousLlcNames,
        startLink,
        unsubscribeUrl: makeUnsubscribeLink(u.userId),
      });
      result.sent += 1;
    } catch (err) {
      // Send failed after claiming the slot — roll the claim back so a later
      // run can retry this user instead of silently never reminding them.
      await prisma.reminderSent
        .deleteMany({ where: { userId: u.userId, year: taxYear, campaign: args.campaign } })
        .catch(() => {});
      result.failed += 1;
      result.errors.push({
        userId: u.userId,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}

function distinct<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
