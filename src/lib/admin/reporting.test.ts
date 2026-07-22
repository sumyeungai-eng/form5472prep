import { describe, expect, it } from "vitest";
import {
  bucketDate,
  calculateChangePct,
  fillRevenueBuckets,
  periodComparison,
  rangeToDates,
} from "./reporting";

describe("rangeToDates", () => {
  const now = new Date("2026-07-22T12:34:56.789Z");

  it.each([
    ["7d", "2026-07-15T12:34:56.789Z", "2026-07-08T12:34:56.789Z"],
    ["30d", "2026-06-22T12:34:56.789Z", "2026-05-23T12:34:56.789Z"],
    ["90d", "2026-04-23T12:34:56.789Z", "2026-01-23T12:34:56.789Z"],
  ] as const)("computes the %s period and equal-length previous period", (range, start, previousStart) => {
    const result = rangeToDates(range, now);
    expect(result.start.toISOString()).toBe(start);
    expect(result.end.toISOString()).toBe(now.toISOString());
    expect(result.previousStart.toISOString()).toBe(previousStart);
  });

  it("computes consecutive 12-month calendar periods", () => {
    const result = rangeToDates("12m", now);
    expect(result.start.toISOString()).toBe("2025-07-22T12:34:56.789Z");
    expect(result.previousStart.toISOString()).toBe("2024-07-22T12:34:56.789Z");
  });

  it("clamps month subtraction at the end of a leap month", () => {
    const result = rangeToDates("12m", new Date("2024-02-29T08:00:00.000Z"));
    expect(result.start.toISOString()).toBe("2023-02-28T08:00:00.000Z");
    expect(result.previousStart.toISOString()).toBe("2022-02-28T08:00:00.000Z");
  });

  it("uses epoch for both all-time starts", () => {
    const result = rangeToDates("all", now);
    expect(result.start.getTime()).toBe(0);
    expect(result.previousStart.getTime()).toBe(0);
    expect(result.end.toISOString()).toBe(now.toISOString());
  });

  it("does not mutate the supplied date", () => {
    rangeToDates("12m", now);
    expect(now.toISOString()).toBe("2026-07-22T12:34:56.789Z");
  });
});

describe("calculateChangePct", () => {
  it("uses the standard period-over-period formula", () => {
    expect(calculateChangePct(150, 100)).toBe(50);
    expect(calculateChangePct(75, 100)).toBe(-25);
  });

  it("returns deterministic values when the previous period is zero", () => {
    expect(calculateChangePct(0, 0)).toBe(0);
    expect(calculateChangePct(250, 0)).toBe(100);
  });

  it("marks all-time totals as non-comparable", () => {
    expect(periodComparison("all", 99_500, 42_000)).toEqual({
      period: 99_500,
      previousPeriod: 0,
      changePct: 0,
    });
  });
});

describe("revenue buckets", () => {
  it("formats UTC day, Monday-start week, and month bucket dates", () => {
    const date = new Date("2026-07-19T23:30:00.000Z");
    expect(bucketDate(date, "day")).toBe("2026-07-19");
    expect(bucketDate(date, "week")).toBe("2026-07-13");
    expect(bucketDate(date, "month")).toBe("2026-07-01");
  });

  it("fills missing buckets and keeps chronological order", () => {
    const result = fillRevenueBuckets(
      new Date("2026-07-15T12:00:00.000Z"),
      new Date("2026-07-18T10:00:00.000Z"),
      "day",
      [{ date: "2026-07-16", revenueCents: 19_900, orders: 1 }],
    );

    expect(result).toEqual([
      { date: "2026-07-15", revenueCents: 0, orders: 0 },
      { date: "2026-07-16", revenueCents: 19_900, orders: 1 },
      { date: "2026-07-17", revenueCents: 0, orders: 0 },
      { date: "2026-07-18", revenueCents: 0, orders: 0 },
    ]);
  });

  it("does not add a bucket when the exclusive end is exactly on its boundary", () => {
    const result = fillRevenueBuckets(
      new Date("2026-07-01T00:00:00.000Z"),
      new Date("2026-07-03T00:00:00.000Z"),
      "day",
      [],
    );
    expect(result.map((point) => point.date)).toEqual(["2026-07-01", "2026-07-02"]);
  });
});
