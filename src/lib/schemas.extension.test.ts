import { afterEach, describe, expect, it, vi } from "vitest";
import {
  effectiveDueDateUtc,
  extensionUnclear,
  filingDueDateUtc,
  formatDueDate,
  isExtensionValid,
  isYearDelinquent,
  type ExtensionFacts,
} from "./schemas";

afterEach(() => {
  vi.restoreAllMocks();
});

function pinNow(utcMs: number) {
  vi.spyOn(Date, "now").mockReturnValue(utcMs);
}

describe("filingDueDateUtc: ordinary due dates", () => {
  it("2025 calendar year is due April 15 2026 (a Wednesday — no weekend roll)", () => {
    expect(filingDueDateUtc(2025)).toBe(Date.UTC(2026, 3, 15));
  });

  it("rolls a Saturday due date to the following Monday (April 15 2028 is a Saturday)", () => {
    // taxYear 2027 -> raw due date April 15, 2028, which falls on a Saturday.
    expect(filingDueDateUtc(2027)).toBe(Date.UTC(2028, 3, 17));
  });
});

describe("filingDueDateUtc: short tax year (dissolution)", () => {
  it("dissolved 2026-07-14 is due Nov 16 2026 (Nov 15 2026 is a Sunday)", () => {
    expect(filingDueDateUtc(2026, "2026-07-14")).toBe(Date.UTC(2026, 10, 16));
  });

  it("dissolved on the last day of the year (2026-12-31) collapses to the full-year rule: April 15 2027", () => {
    expect(filingDueDateUtc(2026, "2026-12-31")).toBe(Date.UTC(2027, 3, 15));
    expect(filingDueDateUtc(2026, "2026-12-31")).toBe(filingDueDateUtc(2026));
  });
});

describe("extension math (effectiveDueDateUtc)", () => {
  it("valid 7004 on a full 2025 year extends April 15 2026 -> Oct 15 2026 (Thursday, no roll)", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-10" };
    expect(effectiveDueDateUtc(2025, null, extension)).toBe(Date.UTC(2026, 9, 15));
  });

  it("valid 7004 on the short year (dissolved 2026-07-14, filed by Nov 16) extends into May next year, rolled off Saturday May 15 2027 -> May 17 2027", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-11-16" };
    // Raw due date is Nov 15 2026; +6 months overflows into May 2027 (month-overflow case).
    expect(effectiveDueDateUtc(2026, "2026-07-14", extension)).toBe(Date.UTC(2027, 4, 17));
  });

  it("an invalid extension leaves the effective due date equal to the ordinary due date", () => {
    const extension: ExtensionFacts = { filed: "no", transmittedAt: null };
    expect(effectiveDueDateUtc(2025, null, extension)).toBe(filingDueDateUtc(2025));
  });
});

describe("isExtensionValid boundaries", () => {
  const dueDate2025 = filingDueDateUtc(2025); // April 15, 2026

  it("transmitted exactly ON the due date is valid", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-15" };
    expect(isExtensionValid(2025, null, extension)).toBe(true);
    expect(dueDate2025).toBe(Date.UTC(2026, 3, 15));
  });

  it("transmitted the day after the due date is invalid", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-16" };
    expect(isExtensionValid(2025, null, extension)).toBe(false);
  });

  it("filed 'no' is invalid even with a timely transmittedAt", () => {
    const extension: ExtensionFacts = { filed: "no", transmittedAt: "2026-04-10" };
    expect(isExtensionValid(2025, null, extension)).toBe(false);
  });

  it("filed 'not_sure' is invalid", () => {
    const extension: ExtensionFacts = { filed: "not_sure", transmittedAt: "2026-04-10" };
    expect(isExtensionValid(2025, null, extension)).toBe(false);
  });

  it("filed null (not yet asked) is invalid", () => {
    const extension: ExtensionFacts = { filed: null, transmittedAt: "2026-04-10" };
    expect(isExtensionValid(2025, null, extension)).toBe(false);
  });

  it("a missing transmittedAt is invalid even when filed is 'yes'", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: null };
    expect(isExtensionValid(2025, null, extension)).toBe(false);
  });
});

describe("isYearDelinquent: due-day inclusivity (whole due day is timely)", () => {
  it("is NOT delinquent at noon UTC on the due date itself (April 15 2026, no extension)", () => {
    pinNow(Date.UTC(2026, 3, 15, 12, 0, 0));
    expect(isYearDelinquent(2025)).toBe(false);
  });

  it("becomes delinquent one second after midnight the day after the due date", () => {
    pinNow(Date.UTC(2026, 3, 16, 0, 0, 1));
    expect(isYearDelinquent(2025)).toBe(true);
  });

  it("with a valid extension, is NOT delinquent at noon UTC on the extended due date (Oct 15 2026)", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-10" };
    pinNow(Date.UTC(2026, 9, 15, 12, 0, 0));
    expect(isYearDelinquent(2025, null, extension)).toBe(false);
  });

  it("with a valid extension, becomes delinquent the day after the extended due date (Oct 16 2026)", () => {
    const extension: ExtensionFacts = { filed: "yes", transmittedAt: "2026-04-10" };
    pinNow(Date.UTC(2026, 9, 16, 0, 0, 1));
    expect(isYearDelinquent(2025, null, extension)).toBe(true);
  });
});

describe("isYearDelinquent: 'not_sure' deferral applies only to the year it's passed for", () => {
  it("an old year with no extension facts passed is delinquent", () => {
    pinNow(Date.UTC(2026, 7, 1)); // pinned to Aug 2026, per the spec
    expect(isYearDelinquent(2023, null, null)).toBe(true);
  });

  it("the year the accountant is still confirming ('not_sure') is not marked delinquent", () => {
    pinNow(Date.UTC(2026, 7, 1));
    const extension: ExtensionFacts = { filed: "not_sure", transmittedAt: null };
    expect(isYearDelinquent(2025, null, extension)).toBe(false);
  });
});

describe("extensionUnclear", () => {
  it("is true only when filed === 'not_sure'", () => {
    expect(extensionUnclear({ filed: "not_sure", transmittedAt: null })).toBe(true);
  });

  it("is false for 'yes', 'no', null, and undefined", () => {
    expect(extensionUnclear({ filed: "yes", transmittedAt: null })).toBe(false);
    expect(extensionUnclear({ filed: "no", transmittedAt: null })).toBe(false);
    expect(extensionUnclear({ filed: null, transmittedAt: null })).toBe(false);
    expect(extensionUnclear(undefined)).toBe(false);
    expect(extensionUnclear(null)).toBe(false);
  });
});

describe("formatDueDate", () => {
  it("renders the UTC calendar date regardless of local timezone", () => {
    expect(formatDueDate(Date.UTC(2026, 10, 16))).toBe("November 16, 2026");
  });
});
