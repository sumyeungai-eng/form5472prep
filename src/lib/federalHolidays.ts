/*
 * 26 U.S.C. section 7503, retrieved from
 * https://www.law.cornell.edu/uscode/text/26/7503 with:
 * curl -s https://www.law.cornell.edu/uscode/text/26/7503
 *
 * Verbatim statutory definition used here:
 * "the term “legal holiday” means a legal holiday in the District of Columbia;"
 *
 * Because section 7503 uses District of Columbia legal holidays, this module
 * includes DC Emancipation Day with the same fixed-date observed shift used for
 * other fixed-date holidays.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function utcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function utcDate(year: number, monthIndex: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex, day));
}

function nthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number,
): Date {
  const first = utcDate(year, monthIndex, 1);
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return utcDate(year, monthIndex, 1 + offset + (nth - 1) * 7);
}

function lastWeekdayOfMonth(year: number, monthIndex: number, weekday: number): Date {
  const last = utcDate(year, monthIndex + 1, 0);
  const offset = (last.getUTCDay() - weekday + 7) % 7;
  return utcDate(year, monthIndex, last.getUTCDate() - offset);
}

function addObservedFixedHoliday(holidays: Set<string>, year: number, monthIndex: number, day: number) {
  const actual = utcDate(year, monthIndex, day);
  holidays.add(utcDateKey(actual));

  const weekday = actual.getUTCDay();
  if (weekday === 6) {
    holidays.add(utcDateKey(new Date(actual.getTime() - ONE_DAY_MS)));
  } else if (weekday === 0) {
    holidays.add(utcDateKey(new Date(actual.getTime() + ONE_DAY_MS)));
  }
}

function holidayKeysForYear(year: number): Set<string> {
  const holidays = new Set<string>();

  addObservedFixedHoliday(holidays, year, 0, 1);
  holidays.add(utcDateKey(nthWeekdayOfMonth(year, 0, 1, 3)));
  holidays.add(utcDateKey(nthWeekdayOfMonth(year, 1, 1, 3)));
  holidays.add(utcDateKey(lastWeekdayOfMonth(year, 4, 1)));
  addObservedFixedHoliday(holidays, year, 5, 19);
  addObservedFixedHoliday(holidays, year, 6, 4);
  holidays.add(utcDateKey(nthWeekdayOfMonth(year, 8, 1, 1)));
  holidays.add(utcDateKey(nthWeekdayOfMonth(year, 9, 1, 2)));
  addObservedFixedHoliday(holidays, year, 10, 11);
  holidays.add(utcDateKey(nthWeekdayOfMonth(year, 10, 4, 4)));
  addObservedFixedHoliday(holidays, year, 11, 25);
  addObservedFixedHoliday(holidays, year, 3, 16);

  return holidays;
}

export function isLegalHoliday(date: Date): boolean {
  const year = date.getUTCFullYear();
  const key = utcDateKey(date);
  return (
    holidayKeysForYear(year - 1).has(key) ||
    holidayKeysForYear(year).has(key) ||
    holidayKeysForYear(year + 1).has(key)
  );
}

export function nextBusinessDay(date: Date): Date {
  let cursor = utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6 || isLegalHoliday(cursor)) {
    cursor = new Date(cursor.getTime() + ONE_DAY_MS);
  }
  return cursor;
}
