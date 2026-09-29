import { describe, expect, it } from "vitest";
import { effectiveDueDateUtc, filingDueDateUtc } from "@/lib/schemas";
import { isoFromUtcMs } from "@/lib/tools/state-fees/dates";
import {
  federalDueDates,
  federalDueFor,
  rollToBusinessDay,
  taxYearsFrom,
} from "./federal";

describe("taxYearsFrom", () => {
  it("starts a short first year on the formation date and ends it at the first fiscal-year end", () => {
    const years = taxYearsFrom("2024-03-10", 12, "2026-12-31");
    expect(years).toEqual([
      { start: "2024-03-10", end: "2024-12-31", first: true },
      { start: "2025-01-01", end: "2025-12-31", first: false },
      { start: "2026-01-01", end: "2026-12-31", first: false },
    ]);
  });

  it("rolls the first year-end into the next year when formed after this year's fiscal-year end", () => {
    const years = taxYearsFrom("2025-08-20", 6, "2027-06-30");
    expect(years[0]).toEqual({ start: "2025-08-20", end: "2026-06-30", first: true });
    expect(years[1]).toEqual({ start: "2026-07-01", end: "2027-06-30", first: false });
  });

  it("uses the true last day of February for a February fiscal-year end", () => {
    const years = taxYearsFrom("2027-05-01", 2, "2029-03-01");
    expect(years.map((y) => y.end)).toEqual(["2028-02-29", "2029-02-28"]);
  });

  it("returns nothing for an invalid month or date", () => {
    expect(taxYearsFrom("2024-02-30", 12, "2030-12-31")).toEqual([]);
    expect(taxYearsFrom("2024-02-01", 13, "2030-12-31")).toEqual([]);
  });
});

describe("federalDueFor — calendar year", () => {
  it("is April 15 after the year end, extended to October 15", () => {
    const due = federalDueFor({ start: "2026-01-01", end: "2026-12-31", first: false });
    expect(due.originalStatutory).toBe("2027-04-15");
    expect(due.originalDue).toBe("2027-04-15"); // Thursday
    expect(due.extensionMonths).toBe(6);
    expect(due.extendedDue).toBe("2027-10-15"); // Friday
  });

  it("rolls Saturday 15 April 2023 past observed DC Emancipation Day to Tuesday 18 April", () => {
    const due = federalDueFor({ start: "2022-01-01", end: "2022-12-31", first: false });
    expect(due.originalStatutory).toBe("2023-04-15");
    // Sat 15 Apr → Sun 16 Apr is Emancipation Day, observed Mon 17 Apr → Tue 18 Apr.
    expect(due.originalDue).toBe("2023-04-18");
  });

  it("rolls a Sunday October 15 to Monday October 16 (tax year 2027 extended)", () => {
    const due = federalDueFor({ start: "2027-01-01", end: "2027-12-31", first: false });
    // Sat 15 Apr 2028; Emancipation Day (Sun 16 Apr) is observed Mon 17 Apr → Tue 18 Apr.
    expect(due.originalDue).toBe("2028-04-18");
    expect(due.extendedStatutory).toBe("2028-10-15"); // Sunday
    expect(due.extendedDue).toBe("2028-10-16");
  });

  it("agrees with the existing Form 5472 deadline calculator for every calendar year 2018-2035", () => {
    for (let year = 2018; year <= 2035; year += 1) {
      const due = federalDueFor({ start: `${year}-01-01`, end: `${year}-12-31`, first: false });
      expect(due.originalDue).toBe(isoFromUtcMs(filingDueDateUtc(year)));
      const original = filingDueDateUtc(year);
      const extended = effectiveDueDateUtc(year, null, {
        filed: "yes",
        transmittedAt: new Date(original),
      });
      expect(due.extendedDue).toBe(isoFromUtcMs(extended));
    }
  });
});

describe("federalDueFor — fiscal years", () => {
  it("is the 15th day of the 4th month after a September 30 year end", () => {
    const due = federalDueFor({ start: "2025-10-01", end: "2026-09-30", first: false });
    expect(due.originalStatutory).toBe("2027-01-15");
    expect(due.originalDue).toBe("2027-01-15"); // Friday
    expect(due.extendedStatutory).toBe("2027-07-15");
  });

  it("rolls a due date that lands on Martin Luther King Jr. Day to the Tuesday", () => {
    // FYE 30 Sep 2028 → 15 Jan 2029, the third Monday of January 2029.
    const due = federalDueFor({ start: "2027-10-01", end: "2028-09-30", first: false });
    expect(due.originalStatutory).toBe("2029-01-15");
    expect(due.originalDue).toBe("2029-01-16");
  });

  it("applies the June 30 rule (3rd month, 7-month extension) to years beginning before 2026", () => {
    const due = federalDueFor({ start: "2025-07-01", end: "2026-06-30", first: false });
    expect(due.june30Transition).toBe(true);
    expect(due.originalStatutory).toBe("2026-09-15");
    expect(due.extensionMonths).toBe(7);
    expect(due.extendedStatutory).toBe("2027-04-15");
  });

  it("drops the June 30 rule for years beginning in 2026 or later", () => {
    const due = federalDueFor({ start: "2026-07-01", end: "2027-06-30", first: false });
    expect(due.june30Transition).toBe(false);
    expect(due.originalStatutory).toBe("2027-10-15");
    expect(due.extensionMonths).toBe(6);
    expect(due.extendedStatutory).toBe("2028-04-15");
    expect(due.extendedDue).toBe("2028-04-18"); // Sat → past observed Emancipation Day
  });

  it("treats a short first year formed in 2026 and ending June 30 as a post-2025 year", () => {
    const [first] = federalDueDates("2026-03-10", 6, "2026-06-30");
    expect(first.taxYear).toEqual({ start: "2026-03-10", end: "2026-06-30", first: true });
    expect(first.june30Transition).toBe(false);
    expect(first.originalStatutory).toBe("2026-10-15");
  });
});

describe("rollToBusinessDay", () => {
  it("leaves a business day alone and skips weekends and DC holidays", () => {
    expect(rollToBusinessDay("2027-04-15")).toBe("2027-04-15");
    expect(rollToBusinessDay("2026-11-14")).toBe("2026-11-16"); // Sat → Mon
    expect(rollToBusinessDay("2026-12-25")).toBe("2026-12-28"); // Fri holiday → Mon
  });
});
