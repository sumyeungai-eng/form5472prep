import { describe, expect, it } from "vitest";
import { addBusinessDays, dueAt, dueLabel, isNotReleased, orderByIds, reviewQueueSql, showsDueChip } from "./reviewQueue";

describe("due-by", () => {
  it("express = paidAt + 72 hours (3 days, weekends included)", () => {
    const paidAt = new Date("2026-11-06T15:00:00Z"); // Friday
    expect(dueAt({ tier: "express", paidAt })).toEqual(new Date("2026-11-09T15:00:00Z"));
  });

  it("standard = 7 business days, skipping the weekend", () => {
    // Thu 2026-10-29 -> Fri 30, Mon 2, Tue 3, Wed 4, Thu 5, Fri 6, Mon 9
    const paidAt = new Date("2026-10-29T09:30:00Z");
    expect(dueAt({ tier: "standard", paidAt })).toEqual(new Date("2026-11-09T09:30:00Z"));
  });

  it("standard skips legal holidays too (Veterans Day, Wed 2026-11-11)", () => {
    // Mon 9 -> Tue 10, (Wed 11 holiday), Thu 12, Fri 13, Mon 16, Tue 17, Wed 18, Thu 19
    expect(addBusinessDays(new Date("2026-11-09T12:00:00Z"), 7)).toEqual(new Date("2026-11-19T12:00:00Z"));
  });

  it("payment on a Saturday starts counting on Monday", () => {
    expect(addBusinessDays(new Date("2026-11-07T08:00:00Z"), 1)).toEqual(new Date("2026-11-09T08:00:00Z"));
  });

  it("is unknown without paidAt", () => {
    expect(dueAt({ tier: "express", paidAt: null })).toBeNull();
    expect(dueLabel(null).text).toBe("—");
  });

  it("labels hours under 48h, days beyond, and overdue", () => {
    const now = new Date("2026-11-03T00:00:00Z");
    expect(dueLabel(new Date("2026-11-03T05:30:00Z"), now)).toEqual({ text: "due in 5h", overdue: false });
    expect(dueLabel(new Date("2026-11-06T01:00:00Z"), now)).toEqual({ text: "due in 3d", overdue: false });
    expect(dueLabel(new Date("2026-11-02T22:00:00Z"), now)).toEqual({ text: "overdue 2h", overdue: true });
    expect(dueLabel(new Date("2026-10-30T00:00:00Z"), now)).toEqual({ text: "overdue 4d", overdue: true });
  });
});

describe("badges", () => {
  const at = new Date();
  it("Not released = at/past PDF_GENERATED with no release", () => {
    expect(isNotReleased({ status: "PDF_GENERATED", reviewApprovedAt: null })).toBe(true);
    expect(isNotReleased({ status: "SIGNATURE_PENDING", reviewApprovedAt: null })).toBe(true);
    expect(isNotReleased({ status: "PDF_GENERATED", reviewApprovedAt: at })).toBe(false);
    expect(isNotReleased({ status: "PAID", reviewApprovedAt: null })).toBe(false);
    expect(isNotReleased({ status: "DRAFT", reviewApprovedAt: null })).toBe(false);
  });
  it("due chip only until release, never on drafts", () => {
    expect(showsDueChip({ status: "PAID", reviewApprovedAt: null })).toBe(true);
    expect(showsDueChip({ status: "PDF_GENERATED", reviewApprovedAt: at })).toBe(false);
    expect(showsDueChip({ status: "DRAFT", reviewApprovedAt: null })).toBe(false);
  });
});

describe("review queue order", () => {
  it("sorts in SQL before LIMIT: express, pre-flight failed, oldest paidAt", () => {
    const sql = reviewQueueSql().sql.replace(/\s+/g, " ");
    const express = sql.indexOf(`CASE WHEN f."tier" = 'express'`);
    const failed = sql.indexOf(`CASE WHEN f."preflightStatus" = 'failed'`);
    const paid = sql.indexOf(`f."paidAt" ASC NULLS LAST`);
    const limit = sql.indexOf("LIMIT");
    expect(sql).toContain("ORDER BY");
    expect(express).toBeGreaterThan(sql.indexOf("ORDER BY"));
    expect(express).toBeLessThan(failed);
    expect(failed).toBeLessThan(paid);
    expect(paid).toBeLessThan(limit);
    expect(sql).toContain(`f."reviewApprovedAt" IS NULL`);
    expect(reviewQueueSql().values).toEqual([100]);
  });

  it("applies search/status/partner/review filters inside the SQL, before LIMIT, as bound params", () => {
    const q = "Acme%_'; DROP TABLE x;--";
    const built = reviewQueueSql({ q, status: "PDF_GENERATED", partner: true, inReview: true });
    const sql = built.sql.replace(/\s+/g, " ");
    const where = sql.indexOf("WHERE");
    const order = sql.indexOf("ORDER BY");
    for (const frag of [`f."llcName" ILIKE`, `u."email" ILIKE`, `f."id" =`, `f."partnerId" IS NOT NULL`, `f."inReview" = true`, `CAST(`]) {
      const at = sql.indexOf(frag);
      expect(at, frag).toBeGreaterThan(where);
      expect(at, frag).toBeLessThan(order);
    }
    expect(sql).not.toContain("Acme"); // never interpolated
    expect(built.values).toEqual(["PDF_GENERATED", "%Acme\\%\\_'; DROP TABLE x;--%", "%Acme\\%\\_'; DROP TABLE x;--%", q, 100]);
  });

  it("direct-only filter and no-filter variants", () => {
    expect(reviewQueueSql({ partner: false }).sql).toContain(`f."partnerId" IS NULL`);
    const plain = reviewQueueSql();
    expect(plain.sql).not.toContain("ILIKE");
    expect(plain.values).toEqual([100]);
  });

  it("restores the SQL order after findMany", () => {
    const rows = [{ id: "c" }, { id: "a" }, { id: "b" }];
    expect(orderByIds(rows, ["a", "b", "c"]).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });
});
