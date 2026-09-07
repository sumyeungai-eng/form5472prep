import type { AdminCounters } from "@/lib/admin/counters";
import { getAdminCounters } from "@/lib/admin/counters";
import { prisma } from "@/lib/prisma";

export type RecentFiling = {
  id: string;
  llcName: string | null;
  status: string;
  updatedAt: Date;
  userEmail: string | null;
};

export type RecentApplication = {
  id: string;
  type: "ein" | "itin";
  name: string;
  status: string;
  updatedAt: Date;
};

export type UnreadThread = {
  href: string;
  label: string;
  count: number;
  updatedAt: Date;
};

export type AdminOverview = {
  counters: AdminCounters;
  recentFilings: RecentFiling[];
  recentApplications: RecentApplication[];
  unreadThreads: UnreadThread[];
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [counters, recentFilings, recentEinApplications, recentItinApplications, unreadMessages] =
    await Promise.all([
      getAdminCounters(),
      prisma.filing.findMany({
        where: { adminHidden: false, supersededAt: null },
        select: {
          id: true,
          llcName: true,
          status: true,
          updatedAt: true,
          user: { select: { email: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.einApplication.findMany({
        select: { id: true, llcName: true, status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.itinApplication.findMany({
        select: { id: true, fullName: true, status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.message.findMany({
        where: {
          fromAdmin: false,
          readAt: null,
          OR: [
            { filingId: { not: null } },
            { einApplicationId: { not: null } },
            { itinApplicationId: { not: null } },
          ],
        },
        select: {
          id: true,
          filingId: true,
          filing: { select: { id: true, llcName: true } },
          einApplicationId: true,
          einApplication: { select: { id: true, llcName: true } },
          itinApplicationId: true,
          itinApplication: { select: { id: true, fullName: true } },
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const recentApplications: RecentApplication[] = [
    ...recentEinApplications.map((app) => ({
      id: app.id,
      type: "ein" as const,
      name: app.llcName,
      status: app.status,
      updatedAt: app.updatedAt,
    })),
    ...recentItinApplications.map((app) => ({
      id: app.id,
      type: "itin" as const,
      name: app.fullName,
      status: app.status,
      updatedAt: app.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const unreadThreads = groupUnreadThreads(unreadMessages).slice(0, 10);

  return {
    counters,
    recentFilings: recentFilings.map((filing) => ({
      id: filing.id,
      llcName: filing.llcName,
      status: filing.status,
      updatedAt: filing.updatedAt,
      userEmail: filing.user?.email ?? null,
    })),
    recentApplications,
    unreadThreads,
  };
}

function groupUnreadThreads(
  messages: Array<{
    filingId: string | null;
    filing: { id: string; llcName: string | null } | null;
    einApplicationId: string | null;
    einApplication: { id: string; llcName: string } | null;
    itinApplicationId: string | null;
    itinApplication: { id: string; fullName: string } | null;
    createdAt: Date;
  }>,
): UnreadThread[] {
  const byThread = new Map<string, UnreadThread>();

  for (const message of messages) {
    const thread = threadForMessage(message);
    if (!thread) continue;

    const existing = byThread.get(thread.key);
    if (existing) {
      existing.count += 1;
      if (message.createdAt > existing.updatedAt) existing.updatedAt = message.createdAt;
    } else {
      byThread.set(thread.key, {
        href: thread.href,
        label: thread.label,
        count: 1,
        updatedAt: message.createdAt,
      });
    }
  }

  return Array.from(byThread.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

function threadForMessage(message: {
  filingId: string | null;
  filing: { id: string; llcName: string | null } | null;
  einApplicationId: string | null;
  einApplication: { id: string; llcName: string } | null;
  itinApplicationId: string | null;
  itinApplication: { id: string; fullName: string } | null;
}): { key: string; href: string; label: string } | null {
  if (message.filingId && message.filing) {
    return {
      key: `filing:${message.filingId}`,
      href: `/admin/filings/${message.filingId}`,
      label: `Filing: ${message.filing.llcName || "(no LLC name)"}`,
    };
  }
  if (message.einApplicationId && message.einApplication) {
    return {
      key: `ein:${message.einApplicationId}`,
      href: `/admin/applications/ein/${message.einApplicationId}`,
      label: `EIN: ${message.einApplication.llcName}`,
    };
  }
  if (message.itinApplicationId && message.itinApplication) {
    return {
      key: `itin:${message.itinApplicationId}`,
      href: `/admin/applications/itin/${message.itinApplicationId}`,
      label: `ITIN: ${message.itinApplication.fullName}`,
    };
  }
  return null;
}
