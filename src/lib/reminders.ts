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
        select: { llcName: true, taxYears: true },
      },
    },
  });

  return users
    .filter((u) => {
      // Skip if they already filed (paid) for this tax year.
      const alreadyFiled = u.filings.some((f) => f.taxYears.includes(taxYear));
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
      // Record success — unique constraint also prevents accidental double-sends.
      await prisma.reminderSent.create({
        data: { userId: u.userId, year: taxYear, campaign: args.campaign },
      });
      result.sent += 1;
    } catch (err) {
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
