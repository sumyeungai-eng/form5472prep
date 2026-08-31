export const PENALTY_PER_FORM_CENTS = 2_500_000; // $25,000 — IRC §6038A(d)(1)
export const CONTINUATION_PER_PERIOD_CENTS = 2_500_000; // §6038A(d)(2)
export const CONTINUATION_GRACE_DAYS = 90;

export const PENALTY_CITATIONS: ReadonlyArray<{
  label: string;
  url: string;
}> = [
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
];

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1_000;
const CONTINUATION_PERIOD_DAYS = 30;

function normalizedCount(count: number): number {
  // Counts are floored first, then non-positive (and non-finite) results clamp to 0.
  const flooredCount = Math.floor(count);
  return Number.isFinite(flooredCount) && flooredCount > 0 ? flooredCount : 0;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export function initialPenaltyCents(
  formCount: number,
  yearCount: number,
): number {
  return (
    PENALTY_PER_FORM_CENTS *
    normalizedCount(formCount) *
    normalizedCount(yearCount)
  );
}

export function continuationPeriods(noticeDate: Date, asOf: Date): number {
  if (!isValidDate(noticeDate) || !isValidDate(asOf)) return 0;

  const millisecondsSinceNotice = asOf.getTime() - noticeDate.getTime();
  const gracePeriodMilliseconds =
    CONTINUATION_GRACE_DAYS * MILLISECONDS_PER_DAY;

  if (millisecondsSinceNotice <= gracePeriodMilliseconds) return 0;

  const daysSinceGraceEnd =
    (millisecondsSinceNotice - gracePeriodMilliseconds) /
    MILLISECONDS_PER_DAY;

  // Day 91 is day 1 after grace and therefore period 1; each started 30-day block
  // adds another period, so periods = ceil(days since the grace ended / 30).
  return Math.ceil(daysSinceGraceEnd / CONTINUATION_PERIOD_DAYS);
}

export function continuationPenaltyCents(
  formCount: number,
  yearCount: number,
  noticeDate: Date | null,
  asOf: Date,
): number {
  if (noticeDate === null) return 0;

  // IRC §6038A(d)(2) continuation penalties are uncapped, unlike some other
  // IRC penalty provisions.
  return (
    CONTINUATION_PER_PERIOD_CENTS *
    continuationPeriods(noticeDate, asOf) *
    normalizedCount(formCount) *
    normalizedCount(yearCount)
  );
}

export function totalExposureCents(
  formCount: number,
  yearCount: number,
  noticeDate: Date | null,
  asOf: Date,
): number {
  return (
    initialPenaltyCents(formCount, yearCount) +
    continuationPenaltyCents(
      formCount,
      yearCount,
      noticeDate,
      asOf,
    )
  );
}
