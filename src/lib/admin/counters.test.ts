import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  filingCount: vi.fn(),
  einApplicationCount: vi.fn(),
  itinApplicationCount: vi.fn(),
  messageCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      count: db.filingCount,
    },
    einApplication: {
      count: db.einApplicationCount,
    },
    itinApplication: {
      count: db.itinApplicationCount,
    },
    message: {
      count: db.messageCount,
    },
  },
}));

import { getAdminCounters } from "./counters";

describe("getAdminCounters", () => {
  beforeEach(() => {
    db.filingCount.mockReset();
    db.einApplicationCount.mockReset();
    db.itinApplicationCount.mockReset();
    db.messageCount.mockReset();
  });

  it("counts visible filings currently marked for review", async () => {
    db.filingCount.mockResolvedValueOnce(3).mockResolvedValueOnce(0);
    db.einApplicationCount.mockResolvedValue(0);
    db.itinApplicationCount.mockResolvedValue(0);
    db.messageCount.mockResolvedValue(0);

    await expect(getAdminCounters()).resolves.toMatchObject({ filingsInReview: 3 });

    expect(db.filingCount).toHaveBeenNthCalledWith(1, {
      where: {
        inReview: true,
        adminHidden: false,
        supersededAt: null,
      },
    });
  });

  it("counts all-time unfinished drafts that belong to a user and are not hidden or superseded", async () => {
    db.filingCount.mockResolvedValueOnce(0).mockResolvedValueOnce(7);
    db.einApplicationCount.mockResolvedValue(0);
    db.itinApplicationCount.mockResolvedValue(0);
    db.messageCount.mockResolvedValue(0);

    await expect(getAdminCounters()).resolves.toMatchObject({ unfinishedDrafts: 7 });

    expect(db.filingCount).toHaveBeenNthCalledWith(2, {
      where: {
        status: "DRAFT",
        userId: { not: null },
        adminHidden: false,
        supersededAt: null,
      },
    });
  });

  it("sums EIN and ITIN applications awaiting review", async () => {
    db.filingCount.mockResolvedValue(0);
    db.einApplicationCount.mockResolvedValue(2);
    db.itinApplicationCount.mockResolvedValue(5);
    db.messageCount.mockResolvedValue(0);

    await expect(getAdminCounters()).resolves.toMatchObject({ applicationsAwaiting: 7 });

    expect(db.einApplicationCount).toHaveBeenCalledWith({ where: { status: "IN_REVIEW" } });
    expect(db.itinApplicationCount).toHaveBeenCalledWith({ where: { status: "IN_REVIEW" } });
  });

  it("counts unread customer-authored messages and excludes admin-authored messages", async () => {
    db.filingCount.mockResolvedValue(0);
    db.einApplicationCount.mockResolvedValue(0);
    db.itinApplicationCount.mockResolvedValue(0);
    db.messageCount.mockResolvedValue(4);

    await expect(getAdminCounters()).resolves.toMatchObject({ unreadMessages: 4 });

    expect(db.messageCount).toHaveBeenCalledWith({
      where: {
        fromAdmin: false,
        readAt: null,
      },
    });
  });
});
