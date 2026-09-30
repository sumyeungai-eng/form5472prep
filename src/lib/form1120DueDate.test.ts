import { describe, expect, it } from "vitest";
import { nextBusinessDay } from "@/lib/federalHolidays";
import { form1120DueRule, form1120StatutoryDue } from "@/lib/form1120DueDate";
import { effectiveDueDateUtc, filingDueDateUtc, filingDueRule } from "@/lib/schemas";
import { federalDueDates, federalDueFor } from "@/lib/tools/compliance-calendar/federal";
import { isoFromUtcMs, lastDayOfMonth } from "@/lib/tools/state-fees/dates";

const iso = (ms: number) => isoFromUtcMs(ms);
const rolled = (ms: number) => iso(nextBusinessDay(new Date(ms)).getTime());

// The deadline calculator's own path: a Form 7004 counted as sent on the
// original due date, so it is timely and effectiveDueDateUtc owns the math.
function calculatorDates(taxYear: number, dissolvedAt: string | null) {
  const original = filingDueDateUtc(taxYear, dissolvedAt);
  const extended = effectiveDueDateUtc(taxYear, dissolvedAt, {
    filed: "yes",
    transmittedAt: new Date(original),
  });
  return { original: iso(original), extended: iso(extended) };
}

describe("form1120DueRule", () => {
  it("applies the June rule only to a June year-end that begins before 2026", () => {
    expect(form1120DueRule("2024-07-01", 6)).toEqual({
      june30Transition: true,
      monthsAfterEnd: 3,
      extensionMonths: 7,
    });
    expect(form1120DueRule("2025-12-31", 6).june30Transition).toBe(true);
    expect(form1120DueRule("2026-01-01", 6)).toEqual({
      june30Transition: false,
      monthsAfterEnd: 4,
      extensionMonths: 6,
    });
    for (let month = 1; month <= 12; month += 1) {
      if (month === 6) continue;
      expect(form1120DueRule("2020-01-01", month).june30Transition).toBe(false);
    }
  });
});

describe("June 30 fiscal year (compliance calendar and shared rule)", () => {
  it("year ending 30 Jun 2025, begun 1 Jul 2024: due 15 Sep 2025, extended 7 months to 15 Apr 2026", () => {
    const shared = form1120StatutoryDue("2024-07-01", 2025, 6);
    expect(iso(shared.originalStatutoryUtc)).toBe("2025-09-15");
    expect(iso(shared.extendedStatutoryUtc)).toBe("2026-04-15");

    const due = federalDueFor({ start: "2024-07-01", end: "2025-06-30", first: false });
    expect(due.june30Transition).toBe(true);
    expect(due.originalDue).toBe("2025-09-15"); // Monday
    expect(due.extensionMonths).toBe(7);
    expect(due.extendedDue).toBe("2026-04-15"); // Wednesday
  });

  it("year ending 30 Jun 2026 but begun 1 Jul 2025 still uses the 3rd month", () => {
    const due = federalDueFor({ start: "2025-07-01", end: "2026-06-30", first: false });
    expect(due.originalDue).toBe("2026-09-15"); // Tuesday
    expect(due.extendedDue).toBe("2027-04-15");
  });

  it("a June 30 year begun on or after 1 Jan 2026 uses the 4th month and 6 months", () => {
    const short = federalDueFor({ start: "2026-01-01", end: "2026-06-30", first: true });
    expect(short.june30Transition).toBe(false);
    expect(short.originalDue).toBe("2026-10-15");
    expect(short.extendedDue).toBe("2027-04-15");
    const full = federalDueFor({ start: "2026-07-01", end: "2027-06-30", first: false });
    expect(full.originalDue).toBe("2027-10-15");
    expect(full.extensionMonths).toBe(6);
  });
});

describe("dissolution short year ending in June (filing workflow and deadline calculator)", () => {
  it("dissolved 30 Jun 2025 (year began 1 Jan 2025): due 15 Sep 2025, extended to 15 Apr 2026", () => {
    expect(calculatorDates(2025, "2025-06-30")).toEqual({
      original: "2025-09-15",
      extended: "2026-04-15",
    });
    expect(filingDueRule(2025, "2025-06-30").extensionMonths).toBe(7);
  });

  it("treats a dissolution anytime in June as ending June 30", () => {
    expect(calculatorDates(2025, "2025-06-01").original).toBe("2025-09-15");
    expect(calculatorDates(2025, new Date(Date.UTC(2025, 5, 17)).toISOString()).original).toBe(
      "2025-09-15",
    );
  });

  it("dissolved in June 2026 or later: 15 Oct with a 6-month extension", () => {
    expect(calculatorDates(2026, "2026-06-30")).toEqual({
      original: "2026-10-15",
      extended: "2027-04-15",
    });
    expect(filingDueRule(2026, "2026-06-30").extensionMonths).toBe(6);
  });

  it("a 7004 sent after the 3rd-month date no longer extends a pre-2026 June year", () => {
    const lateExtension = { filed: "yes", transmittedAt: new Date(Date.UTC(2025, 9, 1)) };
    // 1 Oct 2025 is after the 15 Sep 2025 original due date, so no extension.
    expect(iso(effectiveDueDateUtc(2025, "2025-06-15", lateExtension))).toBe("2025-09-15");
  });
});

describe("everything outside the June rule is unchanged", () => {
  // The pre-change formula, kept here as a regression pin.
  const oldOriginal = (taxYear: number, dissolvedMonthIndex: number | null) =>
    dissolvedMonthIndex === null
      ? Date.UTC(taxYear + 1, 3, 15)
      : Date.UTC(taxYear, dissolvedMonthIndex + 4, 15);

  it("calendar years 2018-2035 keep April 15 and a 6-month extension", () => {
    for (let year = 2018; year <= 2035; year += 1) {
      const raw = oldOriginal(year, null);
      expect(calculatorDates(year, null)).toEqual({
        original: rolled(raw),
        extended: rolled(Date.UTC(year + 1, 9, 15)),
      });
      expect(filingDueRule(year, null).june30Transition).toBe(false);
    }
  });

  it("dissolutions in every other month, and June from 2026, keep the 4th month and 6 months", () => {
    for (let year = 2018; year <= 2035; year += 1) {
      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        if (monthIndex === 5 && year < 2026) continue;
        const dissolvedAt = lastDayOfMonth(year, monthIndex + 1);
        const raw = oldOriginal(year, monthIndex);
        expect(calculatorDates(year, dissolvedAt)).toEqual({
          original: rolled(raw),
          extended: rolled(Date.UTC(year, monthIndex + 4 + 6, 15)),
        });
      }
    }
  });
});

describe("deadline calculator and compliance calendar agree", () => {
  it("on June 30 short years 2018-2035 (LLC formed 1 January, year ends 30 June)", () => {
    for (let year = 2018; year <= 2035; year += 1) {
      const [first] = federalDueDates(`${year}-01-01`, 6, `${year}-06-30`);
      expect(first.taxYear).toEqual({ start: `${year}-01-01`, end: `${year}-06-30`, first: true });
      expect(first.june30Transition).toBe(year < 2026);
      expect(calculatorDates(year, `${year}-06-30`)).toEqual({
        original: first.originalDue,
        extended: first.extendedDue,
      });
    }
  });

  it("on every month-end short year 2018-2035", () => {
    for (let year = 2018; year <= 2035; year += 1) {
      for (let month = 1; month <= 12; month += 1) {
        const end = lastDayOfMonth(year, month);
        const due = federalDueFor({ start: `${year}-01-01`, end, first: true });
        expect(calculatorDates(year, month === 12 ? null : end)).toEqual({
          original: due.originalDue,
          extended: due.extendedDue,
        });
      }
    }
  });
});
