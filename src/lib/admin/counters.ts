import { prisma } from "@/lib/prisma";

export type AdminCounters = {
  filingsInReview: number;
  unfinishedDrafts: number;
  applicationsAwaiting: number;
  unreadMessages: number;
};

export async function getAdminCounters(): Promise<AdminCounters> {
  const [
    filingsInReview,
    unfinishedDrafts,
    einApplicationsAwaiting,
    itinApplicationsAwaiting,
    unreadMessages,
  ] = await Promise.all([
    prisma.filing.count({
      where: {
        inReview: true,
        adminHidden: false,
        supersededAt: null,
      },
    }),
    prisma.filing.count({
      where: {
        status: "DRAFT",
        userId: { not: null },
        adminHidden: false,
        supersededAt: null,
        // Mirrors the admin filings page's unfinished-draft audience, but the
        // sidebar badge is all-time so an old recovery lead does not disappear.
      },
    }),
    prisma.einApplication.count({ where: { status: "IN_REVIEW" } }),
    prisma.itinApplication.count({ where: { status: "IN_REVIEW" } }),
    prisma.message.count({
      where: {
        fromAdmin: false,
        readAt: null,
      },
    }),
  ]);

  return {
    filingsInReview,
    unfinishedDrafts,
    applicationsAwaiting: einApplicationsAwaiting + itinApplicationsAwaiting,
    unreadMessages,
  };
}
