import { describe, expect, it } from "vitest";
import { filingDueDateUtc, formatDueDate } from "@/lib/schemas";
import { extensionDueDateUtc, formatExtensionDate, isExtensionStatus, openExtensionTaxYears } from "./form7004";

const at = (iso: string) => new Date(iso);

describe("openExtensionTaxYears", () => {
  it("offers only the current year once last year's April due date has passed", () => {
    expect(openExtensionTaxYears(at("2026-10-28T12:00:00Z"))).toEqual([2026]);
  });

  it("offers last year and the current year before the April due date", () => {
    expect(openExtensionTaxYears(at("2027-04-10T12:00:00Z"))).toEqual([2026, 2027]);
  });

  it("keeps last year open through the whole due day and closes it the next day", () => {
    // Tax year 2026 is due Thursday 15 April 2027 (no roll).
    expect(openExtensionTaxYears(at("2027-04-15T23:59:59Z"))).toEqual([2026, 2027]);
    expect(openExtensionTaxYears(at("2027-04-16T00:00:00Z"))).toEqual([2027]);
  });

  it("follows a weekend/holiday-shifted due date", () => {
    // Tax year 2027: 15 April 2028 is a Saturday and DC Emancipation Day is
    // observed Monday 17 April, so the due date rolls to Tuesday 18 April 2028.
    expect(openExtensionTaxYears(at("2028-04-17T12:00:00Z"))).toEqual([2027, 2028]);
    expect(openExtensionTaxYears(at("2028-04-18T12:00:00Z"))).toEqual([2027, 2028]);
    expect(openExtensionTaxYears(at("2028-04-19T00:00:00Z"))).toEqual([2028]);
  });

  it("is never empty (the current year is always open)", () => {
    expect(openExtensionTaxYears(at("2026-12-31T23:59:59Z"))).toEqual([2026]);
    expect(openExtensionTaxYears(at("2027-01-01T00:00:00Z"))).toEqual([2026, 2027]);
  });
});

describe("isExtensionStatus (admin PATCH guard)", () => {
  it("accepts only the 7004 workflow statuses", () => {
    for (const s of ["PAYMENT_PENDING", "IN_REVIEW", "PROCESSING", "COMPLETED", "CANCELLED"]) expect(isExtensionStatus(s)).toBe(true);
    for (const s of ["DOCS_REQUESTED", "RECEIVED", "toString", "", 1, null]) expect(isExtensionStatus(s)).toBe(false);
  });
});

describe("extensionDueDateUtc / formatExtensionDate", () => {
  it("match the shared filing due-date helpers for every year", () => {
    for (let y = 2018; y <= 2045; y++) {
      expect(extensionDueDateUtc(y)).toBe(filingDueDateUtc(y));
      expect(formatExtensionDate(extensionDueDateUtc(y))).toBe(formatDueDate(filingDueDateUtc(y)));
    }
  });
});
