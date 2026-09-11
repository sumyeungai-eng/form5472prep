import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  pageViewFindMany: vi.fn(),
  pageViewCount: vi.fn(),
  pageViewGroupBy: vi.fn(),
  visitorFindMany: vi.fn(),
  visitorGroupBy: vi.fn(),
  visitorFindFirst: vi.fn(),
  filingFindMany: vi.fn(),
  einApplicationFindMany: vi.fn(),
  itinApplicationFindMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pageView: {
      findMany: db.pageViewFindMany,
      count: db.pageViewCount,
      groupBy: db.pageViewGroupBy,
    },
    visitor: {
      findMany: db.visitorFindMany,
      findFirst: db.visitorFindFirst,
      groupBy: db.visitorGroupBy,
    },
    filing: {
      findMany: db.filingFindMany,
    },
    einApplication: {
      findMany: db.einApplicationFindMany,
    },
    itinApplication: {
      findMany: db.itinApplicationFindMany,
    },
  },
}));

import { getRecentViews, getTrafficSummary } from "./traffic";

describe("admin traffic queries", () => {
  beforeEach(() => {
    db.pageViewFindMany.mockReset();
    db.pageViewCount.mockReset();
    db.pageViewGroupBy.mockReset();
    db.visitorFindMany.mockReset();
    db.visitorGroupBy.mockReset();
    db.visitorFindFirst.mockReset();
    db.filingFindMany.mockReset();
    db.einApplicationFindMany.mockReset();
    db.itinApplicationFindMany.mockReset();

    db.pageViewFindMany.mockResolvedValue([]);
    db.pageViewCount.mockResolvedValue(0);
    db.pageViewGroupBy.mockResolvedValue([]);
    db.visitorFindMany.mockResolvedValue([]);
    db.visitorGroupBy.mockResolvedValue([]);
    db.filingFindMany.mockResolvedValue([]);
    db.einApplicationFindMany.mockResolvedValue([]);
    db.itinApplicationFindMany.mockResolvedValue([]);
  });

  it("excludes bots by default and does not constrain isBot when includeBots is true", async () => {
    await getRecentViews({}, 1);

    expect(db.pageViewFindMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { AND: [{ isBot: false }] },
      }),
    );

    await getRecentViews({ includeBots: true }, 1);

    expect(db.pageViewFindMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it("prefers a userId-matching filing over a different sessionId-matching filing", async () => {
    const createdAt = new Date("2026-09-10T12:00:00Z");
    db.pageViewFindMany.mockResolvedValueOnce([
      {
        id: "view_1",
        createdAt,
        path: "/pricing",
        referrer: null,
        ip: "203.0.113.8",
        country: "US",
        city: "Austin",
        device: "desktop",
        isBot: false,
        visitorId: "visitor_1",
        sessionId: "session_1",
        userId: "user_1",
        visitor: { attrSource: "google-ads", attrMedium: "cpc" },
      },
    ]);
    db.pageViewCount.mockResolvedValueOnce(1);
    db.filingFindMany.mockResolvedValueOnce([
      {
        id: "filing_user",
        userId: "user_1",
        sessionId: null,
        llcName: "User LLC",
        status: "PAID",
        updatedAt: new Date("2026-09-01T00:00:00Z"),
      },
      {
        id: "filing_session",
        userId: null,
        sessionId: "session_1",
        llcName: "Session LLC",
        status: "PAID",
        updatedAt: new Date("2026-09-09T00:00:00Z"),
      },
    ]);

    const result = await getRecentViews({}, 1);

    expect(result.rows[0].linked).toMatchObject({ kind: "filing", id: "filing_user" });
    expect(db.filingFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { userId: { in: ["user_1"] } },
            { sessionId: { in: ["session_1"] } },
          ],
        },
        orderBy: { updatedAt: "desc" },
      }),
    );
  });

  it("summary counts distinct visitors instead of raw page views", async () => {
    db.pageViewFindMany
      .mockResolvedValueOnce([{ visitorId: "today_1" }])
      .mockResolvedValueOnce([{ visitorId: "week_1" }, { visitorId: "week_2" }])
      .mockResolvedValueOnce([{ visitorId: "customer_1" }]);
    db.pageViewCount.mockResolvedValueOnce(9);

    const summary = await getTrafficSummary({ from: new Date("2026-09-01"), to: new Date("2026-09-11") });

    expect(summary.visitorsToday).toBe(1);
    expect(summary.visitors7d).toBe(2);
    expect(summary.views7d).toBe(9);
    expect(summary.customers7d).toBe(1);
    expect(db.pageViewFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ distinct: ["visitorId"], select: { visitorId: true } }),
    );
    expect(db.pageViewFindMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ distinct: ["visitorId"], select: { visitorId: true } }),
    );
    expect(db.pageViewFindMany).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ distinct: ["visitorId"], select: { visitorId: true } }),
    );
  });
});
