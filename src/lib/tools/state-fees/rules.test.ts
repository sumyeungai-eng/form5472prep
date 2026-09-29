import { describe, expect, it } from "vitest";
import { ruleOccurrences } from "./rules";

const CTX = { formed: "2024-03-10", fyeMonth: 12 };

describe("ruleOccurrences", () => {
  it("returns nothing for the 'none' rule", () => {
    expect(ruleOccurrences({ kind: "none" }, CTX, "2024-01-01", "2030-12-31")).toEqual([]);
  });

  it("lists a fixed date every year from the year after formation", () => {
    expect(
      ruleOccurrences(
        { kind: "fixed-date", month: 6, day: 1, firstYearOffset: 1 },
        CTX,
        "2024-01-01",
        "2027-12-31",
      ),
    ).toEqual(["2025-06-01", "2026-06-01", "2027-06-01"]);
  });

  it("clips occurrences to the window", () => {
    expect(
      ruleOccurrences(
        { kind: "fixed-date", month: 5, day: 1, firstYearOffset: 1 },
        CTX,
        "2026-09-29",
        "2028-03-28",
      ),
    ).toEqual(["2027-05-01"]);
  });

  it("handles first-day and last-day anniversary-month rules", () => {
    expect(
      ruleOccurrences(
        { kind: "anniversary-month", day: "first", everyYears: 1, firstYearOffset: 1 },
        CTX,
        "2024-01-01",
        "2026-12-31",
      ),
    ).toEqual(["2025-03-01", "2026-03-01"]);
    expect(
      ruleOccurrences(
        { kind: "anniversary-month", day: "last", everyYears: 1, firstYearOffset: 1 },
        { formed: "2024-02-29", fyeMonth: 12 },
        "2024-01-01",
        "2028-12-31",
      ),
    ).toEqual(["2025-02-28", "2026-02-28", "2027-02-28", "2028-02-29"]);
  });

  it("steps biennial anniversary rules two years at a time", () => {
    expect(
      ruleOccurrences(
        { kind: "anniversary-month", day: "last", everyYears: 2, firstYearOffset: 2 },
        CTX,
        "2024-01-01",
        "2030-12-31",
      ),
    ).toEqual(["2026-03-31", "2028-03-31", "2030-03-31"]);
  });

  it("dates tax-year rules from formation, then from each fiscal-year start", () => {
    // 15th day of the 4th month of each taxable year; first year starts 10 March 2024.
    expect(
      ruleOccurrences({ kind: "tax-year-month", monthOfTaxYear: 4, day: 15 }, CTX, "2024-01-01", "2026-12-31"),
    ).toEqual(["2024-06-15", "2025-04-15", "2026-04-15"]);
    // Fiscal year ending 30 June: later years start 1 July → due 15 October.
    expect(
      ruleOccurrences(
        { kind: "tax-year-month", monthOfTaxYear: 4, day: 15 },
        { formed: "2024-03-10", fyeMonth: 6 },
        "2024-01-01",
        "2026-12-31",
      ),
    ).toEqual(["2024-06-15", "2024-10-15", "2025-10-15", "2026-10-15"]);
  });

  it("dates a one-time filing a fixed number of days after formation", () => {
    expect(
      ruleOccurrences({ kind: "days-after-formation", days: 90 }, CTX, "2024-01-01", "2030-12-31"),
    ).toEqual(["2024-06-08"]);
    expect(
      ruleOccurrences({ kind: "days-after-formation", days: 90 }, CTX, "2026-09-29", "2030-12-31"),
    ).toEqual([]);
  });
});

describe("ruleOccurrences — after-tax-year-end", () => {
  it("dates a return from each tax-year end, starting with the short first year", () => {
    expect(
      ruleOccurrences({ kind: "after-tax-year-end", monthsAfter: 4, day: 15 }, CTX, "2024-01-01", "2026-12-31"),
    ).toEqual(["2025-04-15", "2026-04-15"]);
    expect(
      ruleOccurrences(
        { kind: "after-tax-year-end", monthsAfter: 4, day: 15 },
        { formed: "2024-08-01", fyeMonth: 6 },
        "2024-01-01",
        "2026-12-31",
      ),
    ).toEqual(["2025-10-15", "2026-10-15"]);
  });
});
