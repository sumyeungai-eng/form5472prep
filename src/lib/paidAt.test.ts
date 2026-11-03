import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ row: { id: "filing_1", paidAt: null as Date | null }, fail: false }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      // Honours the where clause like Postgres would.
      updateMany: async ({ where, data }: { where: { id: string; paidAt: null }; data: { paidAt: Date } }) => {
        if (db.fail) throw new Error("db down");
        if (where.id !== db.row.id || db.row.paidAt !== null) return { count: 0 };
        db.row.paidAt = data.paidAt;
        return { count: 1 };
      },
    },
  },
}));

import { stampPaidAt } from "./paidAt";

beforeEach(() => {
  db.row.paidAt = null;
  db.fail = false;
});

describe("stampPaidAt", () => {
  it("sets paidAt once and never overwrites it", async () => {
    const first = new Date("2026-11-02T10:00:00Z");
    expect(await stampPaidAt("filing_1", first)).toBe(true);
    expect(await stampPaidAt("filing_1", new Date("2026-11-03T10:00:00Z"))).toBe(false);
    expect(db.row.paidAt).toEqual(first);
  });

  it("never throws when the write fails", async () => {
    db.fail = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(stampPaidAt("filing_1")).resolves.toBe(false);
  });
});
