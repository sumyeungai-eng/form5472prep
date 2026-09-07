import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  filingFindMany: vi.fn(),
  einApplicationFindMany: vi.fn(),
  itinApplicationFindMany: vi.fn(),
  messageFindMany: vi.fn(),
  getAdminCounters: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findMany: db.filingFindMany,
    },
    einApplication: {
      findMany: db.einApplicationFindMany,
    },
    itinApplication: {
      findMany: db.itinApplicationFindMany,
    },
    message: {
      findMany: db.messageFindMany,
    },
  },
}));

vi.mock("@/lib/admin/counters", () => ({
  getAdminCounters: db.getAdminCounters,
}));

import { getAdminOverview } from "./overview";

describe("getAdminOverview", () => {
  beforeEach(() => {
    db.filingFindMany.mockReset();
    db.einApplicationFindMany.mockReset();
    db.itinApplicationFindMany.mockReset();
    db.messageFindMany.mockReset();
    db.getAdminCounters.mockReset();

    db.getAdminCounters.mockResolvedValue({
      filingsInReview: 0,
      unfinishedDrafts: 0,
      applicationsAwaiting: 0,
      unreadMessages: 0,
    });
    db.filingFindMany.mockResolvedValue([]);
    db.einApplicationFindMany.mockResolvedValue([]);
    db.itinApplicationFindMany.mockResolvedValue([]);
    db.messageFindMany.mockResolvedValue([]);
  });

  it("groups unread customer-authored messages by thread and excludes admin-authored messages", async () => {
    db.messageFindMany.mockResolvedValue([
      {
        id: "msg-1",
        filingId: "filing-1",
        filing: { id: "filing-1", llcName: "Atlas LLC" },
        einApplicationId: null,
        einApplication: null,
        itinApplicationId: null,
        itinApplication: null,
        createdAt: new Date("2026-09-07T10:00:00.000Z"),
      },
      {
        id: "msg-2",
        filingId: "filing-1",
        filing: { id: "filing-1", llcName: "Atlas LLC" },
        einApplicationId: null,
        einApplication: null,
        itinApplicationId: null,
        itinApplication: null,
        createdAt: new Date("2026-09-07T11:00:00.000Z"),
      },
      {
        id: "msg-3",
        filingId: null,
        filing: null,
        einApplicationId: "ein-1",
        einApplication: { id: "ein-1", llcName: "Beacon LLC" },
        itinApplicationId: null,
        itinApplication: null,
        createdAt: new Date("2026-09-07T09:00:00.000Z"),
      },
      {
        id: "msg-4",
        filingId: null,
        filing: null,
        einApplicationId: null,
        einApplication: null,
        itinApplicationId: "itin-1",
        itinApplication: { id: "itin-1", fullName: "Casey Chen" },
        createdAt: new Date("2026-09-07T08:00:00.000Z"),
      },
    ]);

    const overview = await getAdminOverview();

    expect(db.messageFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          fromAdmin: false,
          readAt: null,
          OR: [
            { filingId: { not: null } },
            { einApplicationId: { not: null } },
            { itinApplicationId: { not: null } },
          ],
        },
      }),
    );
    expect(overview.unreadThreads).toEqual([
      {
        href: "/admin/filings/filing-1",
        label: "Filing: Atlas LLC",
        count: 2,
        updatedAt: new Date("2026-09-07T11:00:00.000Z"),
      },
      {
        href: "/admin/applications/ein/ein-1",
        label: "EIN: Beacon LLC",
        count: 1,
        updatedAt: new Date("2026-09-07T09:00:00.000Z"),
      },
      {
        href: "/admin/applications/itin/itin-1",
        label: "ITIN: Casey Chen",
        count: 1,
        updatedAt: new Date("2026-09-07T08:00:00.000Z"),
      },
    ]);
  });
});
