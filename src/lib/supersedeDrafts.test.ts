import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findUnique: db.findUnique,
      findMany: db.findMany,
      updateMany: db.updateMany,
    },
  },
}));

import { supersedeDraftsFor } from "./supersedeDrafts";

type MockFiling = {
  id: string;
  status: string;
  userId: string | null;
  sessionId: string | null;
  partnerId: string | null;
  llcName: string | null;
  taxYears: number[];
  supersededAt: Date | null;
  supersededById: string | null;
};

let filings: MockFiling[];

function filing(overrides: Partial<MockFiling>): MockFiling {
  return {
    id: "filing",
    status: "DRAFT",
    userId: null,
    sessionId: null,
    partnerId: null,
    llcName: null,
    taxYears: [],
    supersededAt: null,
    supersededById: null,
    ...overrides,
  };
}

function ownerMatches(row: MockFiling, clauses: Array<{ userId?: string | null; sessionId?: string }>): boolean {
  return clauses.some((clause) => {
    if ("sessionId" in clause) return row.userId === null && row.sessionId === clause.sessionId;
    return row.userId === clause.userId;
  });
}

function seed(rows: MockFiling[]) {
  filings = rows;

  db.findUnique.mockImplementation(({ where }: { where: { id: string } }) => (
    filings.find((row) => row.id === where.id) ?? null
  ));

  db.findMany.mockImplementation(({ where }: { where: { id: { not: string }; OR: Array<{ userId?: string | null; sessionId?: string }> } }) => (
    filings.filter((row) => (
      row.status === "DRAFT" &&
      row.supersededAt === null &&
      row.id !== where.id.not &&
      ownerMatches(row, where.OR)
    ))
  ));

  db.updateMany.mockImplementation(({ where, data }: { where: { id: { in: string[] } }; data: { supersededAt: Date; supersededById: string } }) => {
    let count = 0;
    for (const row of filings) {
      if (where.id.in.includes(row.id) && row.status === "DRAFT" && row.supersededAt === null) {
        row.supersededAt = data.supersededAt;
        row.supersededById = data.supersededById;
        count++;
      }
    }
    return { count };
  });
}

describe("supersedeDraftsFor", () => {
  beforeEach(() => {
    db.findUnique.mockReset();
    db.findMany.mockReset();
    db.updateMany.mockReset();
    filings = [];
  });

  it("archives a nameless empty false-start draft belonging to the same user", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_1", llcName: "   ", taxYears: [] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(1);
    expect(filings.find((row) => row.id === "draft")).toMatchObject({ supersededById: "paid" });
  });

  it("archives a same-LLC draft whose taxYears are a subset of the paid filing's", async () => {
    seed([
      filing({ id: "paid", status: "PDF_GENERATED", userId: "user_1", llcName: "Acme LLC", taxYears: [2023, 2024] }),
      filing({ id: "draft", userId: "user_1", llcName: " acme llc ", taxYears: [2023] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(1);
    expect(filings.find((row) => row.id === "draft")?.supersededAt).toBeInstanceOf(Date);
  });

  it("does NOT archive a draft for a DIFFERENT llcName", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_1", llcName: "Beta LLC", taxYears: [2024] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
    expect(filings.find((row) => row.id === "draft")?.supersededAt).toBeNull();
  });

  it("does NOT archive a same-LLC draft whose taxYears include a year the paid filing does not cover", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_1", llcName: "Acme LLC", taxYears: [2024, 2025] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
    expect(filings.find((row) => row.id === "draft")?.supersededAt).toBeNull();
  });

  it("does NOT archive a draft belonging to a different user", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_2", llcName: "Acme LLC", taxYears: [2024] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
    expect(filings.find((row) => row.id === "draft")?.supersededAt).toBeNull();
  });

  it("is idempotent: a second call archives 0 rows", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_1", llcName: null, taxYears: [] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(1);
    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
  });

  it("does NOT archive drafts for a failed filing", async () => {
    seed([
      filing({ id: "paid", status: "FAILED", userId: "user_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: "user_1", llcName: null, taxYears: [] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
    expect(db.findMany).not.toHaveBeenCalled();
  });

  it("archives an anonymous false start that shares the paying customer's browser session", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: "user_1", sessionId: "sess_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: null, sessionId: "sess_1", llcName: null, taxYears: [] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(1);
  });

  it("does NOT archive a partner's other client draft just because it shares the partner's session", async () => {
    seed([
      filing({ id: "paid", status: "PAID", userId: null, sessionId: "partner_sess", partnerId: "partner_1", llcName: "Acme LLC", taxYears: [2024] }),
      filing({ id: "draft", userId: null, sessionId: "partner_sess", partnerId: "partner_1", llcName: null, taxYears: [] }),
    ]);

    await expect(supersedeDraftsFor("paid")).resolves.toBe(0);
    expect(filings.find((row) => row.id === "draft")?.supersededAt).toBeNull();
  });
});
