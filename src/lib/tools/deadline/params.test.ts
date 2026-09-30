import { describe, expect, it } from "vitest";
import { effectiveDueDateUtc, filingDueRule, formatDueDate } from "@/lib/schemas";
import {
  deadlineQuery,
  defaultTaxYear,
  hasDeadlineParams,
  isDissolutionInYear,
  isIsoDate,
  parseDeadlineParams,
  taxYearOptions,
  type DeadlineInput,
} from "./params";

const YEARS = taxYearOptions(2026);
const OPTIONS = { years: YEARS, defaultYear: defaultTaxYear(YEARS, 2025) };

describe("deadline tax-year options", () => {
  it("offers this year and the six before it, defaulting to the last completed year", () => {
    expect(YEARS).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020]);
    expect(OPTIONS.defaultYear).toBe(2025);
    expect(defaultTaxYear(YEARS, 2010)).toBe(2026);
  });
});

describe("deadline shareable URL", () => {
  it("round-trips every year with and without a dissolution date and extension", () => {
    for (const taxYear of YEARS) {
      for (const dissolvedAt of [null, `${taxYear}-01-01`, `${taxYear}-06-30`, `${taxYear}-12-31`]) {
        for (const extension of [false, true]) {
          const input: DeadlineInput = { taxYear, dissolvedAt, extension };
          const query = deadlineQuery(input);
          expect(parseDeadlineParams(query, OPTIONS)).toEqual(input);
          expect(parseDeadlineParams(`?${query}`, OPTIONS)).toEqual(input);
        }
      }
    }
  });

  it("writes short readable keys, year always, the rest only when set", () => {
    expect(deadlineQuery({ taxYear: 2025, dissolvedAt: null, extension: false })).toBe("year=2025");
    expect(deadlineQuery({ taxYear: 2025, dissolvedAt: "2025-06-30", extension: true })).toBe(
      "year=2025&dissolved=2025-06-30&ext=1",
    );
    // A dissolution date outside the tax year is never written.
    expect(deadlineQuery({ taxYear: 2025, dissolvedAt: "2024-06-30", extension: false })).toBe(
      "year=2025",
    );
  });

  it("keeps unrelated params and replaces its own", () => {
    expect(
      deadlineQuery(
        { taxYear: 2024, dissolvedAt: null, extension: true },
        "?utm_source=news&year=2020&dissolved=2020-01-01",
      ),
    ).toBe("utm_source=news&year=2024&ext=1");
  });

  it("falls back safely on invalid or out-of-range values", () => {
    const fallback = { taxYear: 2025, dissolvedAt: null, extension: false };
    expect(parseDeadlineParams("", OPTIONS)).toEqual(fallback);
    expect(parseDeadlineParams("year=1999", OPTIONS)).toEqual(fallback);
    expect(parseDeadlineParams("year=2030", OPTIONS)).toEqual(fallback);
    expect(parseDeadlineParams("year=20x5&ext=yes", OPTIONS)).toEqual(fallback);
    expect(parseDeadlineParams("year=2025.0", OPTIONS)).toEqual(fallback);
    // Dissolution date must be a real date inside the chosen year.
    expect(parseDeadlineParams("year=2025&dissolved=2024-12-31", OPTIONS).dissolvedAt).toBeNull();
    expect(parseDeadlineParams("year=2024&dissolved=2024-02-30", OPTIONS).dissolvedAt).toBeNull();
    expect(parseDeadlineParams("year=2024&dissolved=June", OPTIONS).dissolvedAt).toBeNull();
    // With the year invalid, the date is checked against the default year.
    expect(parseDeadlineParams("year=1999&dissolved=2025-03-10", OPTIONS)).toEqual({
      taxYear: 2025,
      dissolvedAt: "2025-03-10",
      extension: false,
    });
    expect(parseDeadlineParams("year=1999&dissolved=1999-03-10", OPTIONS).dissolvedAt).toBeNull();
  });

  it("detects whether a URL carries calculator params", () => {
    expect(hasDeadlineParams("")).toBe(false);
    expect(hasDeadlineParams("?utm_source=x")).toBe(false);
    expect(hasDeadlineParams("?ext=1")).toBe(true);
  });

  it("validates ISO dates strictly", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2025-02-29")).toBe(false);
    expect(isIsoDate("2025-6-30")).toBe(false);
    expect(isDissolutionInYear("2025-12-31", 2025)).toBe(true);
    expect(isDissolutionInYear("2026-01-01", 2025)).toBe(false);
  });
});

// The "How we calculate this" section states these rules; pin them to the
// shared due-date code the calculator calls.
describe("deadline rules shown on the page", () => {
  const due = (taxYear: number, dissolvedAt: string | null, extension: boolean) => {
    const ext = extension ? { filed: "yes" as const, transmittedAt: null } : null;
    return formatDueDate(effectiveDueDateUtc(taxYear, dissolvedAt, ext));
  };

  it("calendar year: April 15 of the next year", () => {
    expect(due(2025, null, false)).toBe("April 15, 2026");
  });

  it("rolls past a weekend and a DC legal holiday (Emancipation Day)", () => {
    // April 15, 2023 was a Saturday; Monday April 17 was the observed DC holiday.
    expect(due(2022, null, false)).toBe("April 18, 2023");
    // April 15, 2029 is a Sunday and Monday April 16 is Emancipation Day.
    expect(due(2028, null, false)).toBe("April 17, 2029");
  });

  it("final short year: 15th day of the 4th month after the month of dissolution", () => {
    expect(due(2025, "2025-03-10", false)).toBe("July 15, 2025");
    expect(due(2025, "2025-12-02", false)).toBe("April 15, 2026");
  });

  it("a timely Form 7004 adds six months to the unrolled date", () => {
    expect(due(2025, null, true)).toBe("October 15, 2026");
    expect(due(2025, "2025-03-10", true)).toBe("January 15, 2026");
  });
});

describe("June rule shown on the page", () => {
  const due = (taxYear: number, dissolvedAt: string | null, extension: boolean) => {
    const ext = extension ? { filed: "yes" as const, transmittedAt: null } : null;
    return formatDueDate(effectiveDueDateUtc(taxYear, dissolvedAt, ext));
  };

  it("a final year ending anytime in June that began before 2026: 3rd month, 7-month extension", () => {
    expect(due(2025, "2025-06-30", false)).toBe("September 15, 2025");
    expect(due(2025, "2025-06-30", true)).toBe("April 15, 2026");
    // Treated as ending June 30 whatever the day in June.
    expect(due(2025, "2025-06-01", false)).toBe("September 15, 2025");
    // September 15, 2024 was a Sunday.
    expect(due(2024, "2024-06-12", false)).toBe("September 16, 2024");
    expect(filingDueRule(2025, "2025-06-30").june30Transition).toBe(true);
  });

  it("from tax year 2026 a June dissolution uses the 4th month and 6 months", () => {
    expect(due(2026, "2026-06-30", false)).toBe("October 15, 2026");
    expect(due(2026, "2026-06-30", true)).toBe("April 15, 2027");
    expect(filingDueRule(2026, "2026-06-30").june30Transition).toBe(false);
  });

  it("does not touch other months or a full calendar year", () => {
    expect(due(2025, "2025-05-31", false)).toBe("September 15, 2025");
    expect(due(2025, "2025-07-01", false)).toBe("November 17, 2025");
    expect(filingDueRule(2025, "2025-05-31").june30Transition).toBe(false);
    expect(filingDueRule(2025, null).june30Transition).toBe(false);
    // A dissolution date outside the tax year does not shorten it.
    expect(filingDueRule(2025, "2024-06-30").june30Transition).toBe(false);
  });
});
