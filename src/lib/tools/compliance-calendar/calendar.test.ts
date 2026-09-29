import { describe, expect, it } from "vitest";
import { buildComplianceCalendar } from "./calendar";
import { buildIcs } from "./ics";

const TODAY = "2026-09-29";

describe("buildComplianceCalendar", () => {
  it("lists federal and Delaware dates in order for a calendar-year DE LLC", () => {
    const result = buildComplianceCalendar(
      { state: "DE", formed: "2024-03-10", fyeMonth: 12, extension: false },
      TODAY,
    );
    expect(result.windowStart).toBe("2026-09-29");
    expect(result.windowEnd).toBe("2028-03-28");
    expect(result.events.map((e) => [e.date, e.kind, e.id])).toEqual([
      ["2027-04-15", "federal-return", "fed-5472-2026-12-31"],
      ["2027-06-01", "state", "de-annual-tax-2027-06-01"],
    ]);
    // Tax year 2025 was due 15 April 2026 — before the window.
    expect(result.recentlyPassed?.date).toBe("2026-04-15");
    expect(result.recentlyPassed?.id).toBe("fed-5472-2025-12-31");
  });

  it("adds the Form 7004 date and the extended deadline when the extension toggle is on", () => {
    const result = buildComplianceCalendar(
      { state: "WY", formed: "2024-03-10", fyeMonth: 12, extension: true },
      TODAY,
    );
    const federal = result.events.filter((e) => e.jurisdiction === "Federal");
    expect(federal.map((e) => [e.date, e.kind])).toEqual([
      ["2026-10-15", "federal-extended-return"], // tax year 2025, if a 7004 was filed by 15 April 2026
      ["2027-04-15", "federal-extension"],
      ["2027-10-15", "federal-extended-return"],
    ]);
    expect(federal[0].detail).toContain("Only if Form 7004 was filed by 15 April 2026");
    const wy = result.events.filter((e) => e.jurisdiction === "WY").map((e) => e.date);
    expect(wy).toEqual(["2027-03-01", "2028-03-01"]);
  });

  it("shows a rolled date with the §7503 note", () => {
    // Tax year 2027 → statutory Saturday 15 April 2028 → Tuesday 18 April (Emancipation Day observed Monday).
    const result = buildComplianceCalendar(
      { state: "NM", formed: "2026-01-10", fyeMonth: 12, extension: false },
      "2027-12-01",
    );
    const april = result.events.find((e) => e.id === "fed-5472-2027-12-31")!;
    expect(april.date).toBe("2028-04-18");
    expect(april.note).toContain("15 April 2028 falls on a Saturday");
  });

  it("covers a newly formed LLC's short first year and one-time state filings", () => {
    const result = buildComplianceCalendar(
      { state: "CA", formed: "2026-08-03", fyeMonth: 12, extension: false },
      TODAY,
    );
    const byId = Object.fromEntries(result.events.map((e) => [e.id, e.date]));
    expect(byId["ca-soi-initial-2026-11-01"]).toBe("2026-11-01"); // formation + 90 days
    expect(byId["ca-annual-tax-2026-11-15"]).toBe("2026-11-15"); // Aug = month 1 → Nov 15
    expect(byId["fed-5472-2026-12-31"]).toBe("2027-04-15"); // short year 3 Aug – 31 Dec 2026
    expect(byId["ca-568-2027-04-15"]).toBe("2027-04-15");
    expect(byId["ca-annual-tax-2027-04-15"]).toBe("2027-04-15");
    expect(result.recentlyPassed).toBeNull();
    expect(result.notScheduled.map((o) => o.id)).toEqual(["ca-llc-fee"]);
    const first = result.events.find((e) => e.id === "fed-5472-2026-12-31")!;
    expect(first.detail).toContain("first, short year from formation");
  });

  it("lists a biennial filing that falls just after the window as 'later'", () => {
    const result = buildComplianceCalendar(
      { state: "NY", formed: "2024-03-10", fyeMonth: 12, extension: false },
      TODAY,
    );
    expect(result.events.some((e) => e.jurisdiction === "NY")).toBe(false);
    expect(result.later.map((e) => [e.id, e.date])).toEqual([["ny-biennial-2028-03-31", "2028-03-31"]]);
  });

  it("says New Mexico has no recurring state filing and dates only federal items", () => {
    const result = buildComplianceCalendar(
      { state: "NM", formed: "2025-05-20", fyeMonth: 12, extension: false },
      TODAY,
    );
    expect(result.stateNote).toMatch(/New Mexico has no annual report/);
    expect(result.events.every((e) => e.jurisdiction === "Federal")).toBe(true);
    expect(result.events.map((e) => e.date)).toEqual(["2027-04-15"]);
  });

  it("keeps Colorado's undated periodic report under 'also check'", () => {
    const result = buildComplianceCalendar(
      { state: "CO", formed: "2023-06-01", fyeMonth: 12, extension: false },
      TODAY,
    );
    expect(result.events.some((e) => e.jurisdiction === "CO")).toBe(false);
    expect(result.notScheduled.map((o) => o.id)).toEqual(["co-periodic"]);
  });

  it("uses a fiscal year end for federal dates", () => {
    const result = buildComplianceCalendar(
      { state: "TX", formed: "2025-02-01", fyeMonth: 6, extension: false },
      TODAY,
    );
    const federal = result.events.filter((e) => e.jurisdiction === "Federal").map((e) => e.date);
    // FY ending 30 Jun 2027 begins 1 Jul 2026 (after 2025) → 15 Oct 2027.
    expect(federal).toEqual(["2027-10-15"]);
    // FY ending 30 Jun 2026 began 1 Jul 2025 → old June rule, 15 Sep 2026 (passed).
    expect(result.recentlyPassed?.date).toBe("2026-09-15");
    expect(result.events.find((e) => e.jurisdiction === "TX")?.date).toBe("2027-05-15");
  });

  it("produces an .ics that contains one VEVENT per calendar entry", () => {
    const result = buildComplianceCalendar(
      { state: "NV", formed: "2024-03-10", fyeMonth: 12, extension: true },
      TODAY,
    );
    const ics = buildIcs(
      result.events.map((e) => ({ uid: `${e.id}@form5472prep.com`, date: e.date, summary: e.title })),
      { now: new Date("2026-09-29T00:00:00Z") },
    );
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(result.events.length);
    expect(ics).toContain("DTSTART;VALUE=DATE:20270331");
  });
});
