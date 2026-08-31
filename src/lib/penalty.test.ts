import { describe, expect, it } from "vitest";
import {
  CONTINUATION_PER_PERIOD_CENTS,
  PENALTY_CITATIONS,
  continuationPenaltyCents,
  continuationPeriods,
  initialPenaltyCents,
  totalExposureCents,
} from "./penalty";

const noticeDate = new Date("2026-01-01T00:00:00.000Z");

function daysAfterNotice(days: number): Date {
  return new Date(noticeDate.getTime() + days * 24 * 60 * 60 * 1_000);
}

describe("initialPenaltyCents", () => {
  it("calculates one form for one year", () => {
    expect(initialPenaltyCents(1, 1)).toBe(2_500_000);
  });

  it("multiplies the penalty by forms and years", () => {
    expect(initialPenaltyCents(2, 3)).toBe(15_000_000);
  });

  it("returns zero for zero forms", () => {
    expect(initialPenaltyCents(0, 5)).toBe(0);
  });

  it("clamps a negative form count to zero", () => {
    expect(initialPenaltyCents(-1, 5)).toBe(0);
  });

  it("floors non-integer counts before calculating", () => {
    // The count rule floors 1.5 to 1 before applying the $25,000 penalty.
    expect(initialPenaltyCents(1.5, 1)).toBe(2_500_000);
  });
});

describe("continuationPeriods and continuationPenaltyCents", () => {
  it("returns zero when there is no notice", () => {
    expect(continuationPenaltyCents(1, 1, null, daysAfterNotice(91))).toBe(
      0,
    );
  });

  it("returns zero 89 days after notice", () => {
    expect(continuationPeriods(noticeDate, daysAfterNotice(89))).toBe(0);
  });

  it("returns zero exactly 90 days after notice", () => {
    expect(continuationPeriods(noticeDate, daysAfterNotice(90))).toBe(0);
  });

  it("starts period 1 on day 91 and applies it per form and year", () => {
    expect(continuationPeriods(noticeDate, daysAfterNotice(91))).toBe(1);
    expect(continuationPenaltyCents(2, 1, noticeDate, daysAfterNotice(91))).toBe(
      5_000_000,
    );
  });

  it("keeps day 150 in period 2", () => {
    // Day 150 is 60 days since grace end: ceil(60 / 30) = 2 periods.
    expect(continuationPeriods(noticeDate, daysAfterNotice(150))).toBe(2);
  });

  it("starts period 3 on day 151", () => {
    // Day 151 is 61 days since grace end: ceil(61 / 30) = 3 periods.
    expect(continuationPeriods(noticeDate, daysAfterNotice(151))).toBe(3);
  });

  it("returns zero for an invalid notice date", () => {
    expect(
      continuationPenaltyCents(
        1,
        1,
        new Date("invalid-string"),
        daysAfterNotice(151),
      ),
    ).toBe(0);
  });

  it("returns zero for an invalid as-of date", () => {
    expect(
      continuationPenaltyCents(
        1,
        1,
        noticeDate,
        new Date("invalid-string"),
      ),
    ).toBe(0);
  });
});

describe("totalExposureCents", () => {
  it("adds initial and continuation penalties when continuation is present", () => {
    const formCount = 2;
    const yearCount = 1;
    const asOf = daysAfterNotice(91);

    expect(totalExposureCents(formCount, yearCount, noticeDate, asOf)).toBe(
      initialPenaltyCents(formCount, yearCount) +
        continuationPenaltyCents(
          formCount,
          yearCount,
          noticeDate,
          asOf,
        ),
    );
    expect(totalExposureCents(formCount, yearCount, noticeDate, asOf)).toBe(
      10_000_000,
    );
  });
});

describe("PENALTY_CITATIONS", () => {
  it("contains exactly the required citations in order", () => {
    expect(PENALTY_CITATIONS).toEqual([
      {
        label: "IRC §6038A(d)",
        url: "https://www.law.cornell.edu/uscode/text/26/6038A",
      },
      {
        label: "Instructions for Form 5472 – Penalties",
        url: "https://www.irs.gov/instructions/i5472",
      },
      {
        label: "IRS Penalty Relief for Reasonable Cause",
        url: "https://www.irs.gov/payments/penalty-relief-for-reasonable-cause",
      },
    ]);
    expect(PENALTY_CITATIONS).toHaveLength(3);
    expect(PENALTY_CITATIONS[0]?.url).toContain("cornell.edu");
    expect(PENALTY_CITATIONS[1]?.url).toBe(
      "https://www.irs.gov/instructions/i5472",
    );
  });
});

describe("continuation penalty amount", () => {
  it("uses the exported per-period amount", () => {
    expect(
      continuationPenaltyCents(1, 1, noticeDate, daysAfterNotice(151)),
    ).toBe(CONTINUATION_PER_PERIOD_CENTS * 3);
  });
});
