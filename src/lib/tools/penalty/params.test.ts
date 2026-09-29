import { describe, expect, it } from "vitest";
import {
  continuationPeriods,
  initialPenaltyCents,
  totalExposureCents,
} from "@/lib/penalty";
import {
  DEFAULT_PENALTY_INPUT,
  FORM_COUNT_OPTIONS,
  YEAR_COUNT_OPTIONS,
  isIsoDate,
  parsePenaltyParams,
  penaltyQuery,
  type PenaltyInput,
} from "./params";

const TODAY = "2026-09-29";

describe("penalty shareable URL", () => {
  it("round-trips every choice the form offers, with and without a notice date", () => {
    for (const formCount of FORM_COUNT_OPTIONS) {
      for (const yearCount of YEAR_COUNT_OPTIONS) {
        for (const noticeDate of [null, "2026-01-02", TODAY]) {
          const input: PenaltyInput = { formCount, yearCount, noticeDate };
          const query = penaltyQuery(input);
          expect(parsePenaltyParams(query, TODAY)).toEqual(input);
          expect(parsePenaltyParams(`?${query}`, TODAY)).toEqual(input);
        }
      }
    }
  });

  it("writes short readable keys and leaves defaults out", () => {
    expect(penaltyQuery(DEFAULT_PENALTY_INPUT)).toBe("");
    expect(penaltyQuery({ formCount: 2, yearCount: 3, noticeDate: "2026-03-02" })).toBe(
      "llcs=2&years=3&notice=2026-03-02",
    );
    expect(penaltyQuery({ formCount: 1, yearCount: 4, noticeDate: null })).toBe("years=4");
  });

  it("keeps unrelated params and replaces its own", () => {
    expect(
      penaltyQuery({ formCount: 3, yearCount: 1, noticeDate: null }, "?utm_source=x&years=5&notice=2020-01-01"),
    ).toBe("utm_source=x&llcs=3");
  });

  it("falls back to defaults on invalid values", () => {
    expect(parsePenaltyParams("", TODAY)).toEqual(DEFAULT_PENALTY_INPUT);
    expect(parsePenaltyParams("llcs=0&years=7", TODAY)).toEqual(DEFAULT_PENALTY_INPUT);
    expect(parsePenaltyParams("llcs=11&years=-1", TODAY)).toEqual(DEFAULT_PENALTY_INPUT);
    expect(parsePenaltyParams("llcs=2.5&years=abc", TODAY)).toEqual(DEFAULT_PENALTY_INPUT);
    expect(parsePenaltyParams("llcs=1e1&years=0x2", TODAY)).toEqual(DEFAULT_PENALTY_INPUT);
    // A notice date must be a real date and not after today.
    expect(parsePenaltyParams("notice=2026-09-30", TODAY).noticeDate).toBeNull();
    expect(parsePenaltyParams("notice=2026-02-30", TODAY).noticeDate).toBeNull();
    expect(parsePenaltyParams("notice=yesterday", TODAY).noticeDate).toBeNull();
    // Valid keys survive next to invalid ones.
    expect(parsePenaltyParams("llcs=4&years=99&notice=bad", TODAY)).toEqual({
      formCount: 4,
      yearCount: 1,
      noticeDate: null,
    });
  });

  it("validates ISO dates strictly", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
    expect(isIsoDate("2026-02-29")).toBe(false);
    expect(isIsoDate("2026-9-29")).toBe(false);
  });
});

// The "How we calculate this" section states these rules; pin them to the
// shared penalty code the calculator calls.
describe("penalty rules shown on the page", () => {
  it("initial penalty is $25,000 × LLCs × unfiled years", () => {
    expect(initialPenaltyCents(1, 1)).toBe(2_500_000);
    expect(initialPenaltyCents(2, 3)).toBe(15_000_000);
  });

  it("no continuation periods until more than 90 days after the notice; then one per started 30 days", () => {
    const notice = new Date("2026-01-01T00:00:00");
    const at = (days: number) => new Date(notice.getTime() + days * 24 * 60 * 60 * 1000);
    expect(continuationPeriods(notice, at(90))).toBe(0);
    expect(continuationPeriods(notice, at(91))).toBe(1);
    expect(continuationPeriods(notice, at(120))).toBe(1);
    expect(continuationPeriods(notice, at(121))).toBe(2);
    // Per LLC per year, on top of the initial penalty.
    expect(totalExposureCents(2, 1, notice, at(121))).toBe(2 * 2_500_000 + 2 * 2 * 2_500_000);
  });
});
