// Date-only helpers shared by the state-fees table and the compliance
// calendar. Every date is a calendar day with no time zone: we carry it as an
// ISO "YYYY-MM-DD" string and do arithmetic on UTC midnight so the reader's
// time zone can never shift a deadline by a day.

export type IsoDate = string; // "YYYY-MM-DD"

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export type Ymd = { y: number; m: number; d: number }; // m is 1-12

export function parseIsoDate(value: string | null | undefined): Ymd | null {
  if (!value) return null;
  const match = ISO_RE.exec(value.trim());
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

export function isValidIsoDate(value: string | null | undefined): value is IsoDate {
  return parseIsoDate(value) !== null;
}

export function daysInMonth(y: number, m: number): number {
  // Day 0 of the next month is the last day of month m.
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Normalises month overflow (m = 13 → January of y + 1, m = 0 → December of
// y - 1) exactly like Date.UTC, then clamps the day to the month's length.
export function ymd(y: number, m: number, d: number): Ymd {
  const first = new Date(Date.UTC(y, m - 1, 1));
  const ny = first.getUTCFullYear();
  const nm = first.getUTCMonth() + 1;
  return { y: ny, m: nm, d: Math.min(Math.max(d, 1), daysInMonth(ny, nm)) };
}

export function toIso({ y, m, d }: Ymd): IsoDate {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function isoFromUtcMs(ms: number): IsoDate {
  const date = new Date(ms);
  return toIso({ y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() });
}

export function utcMs(date: IsoDate | Ymd): number {
  const p = typeof date === "string" ? parseIsoDate(date) : date;
  if (!p) throw new Error(`Invalid date: ${String(date)}`);
  return Date.UTC(p.y, p.m - 1, p.d);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return isoFromUtcMs(utcMs(date) + days * ONE_DAY_MS);
}

// Adds whole months and pins the result to `day` (clamped to month length).
export function monthsAfter(y: number, m: number, months: number, day: number): IsoDate {
  return toIso(ymd(y, m + months, day));
}

export function lastDayOfMonth(y: number, m: number): IsoDate {
  return toIso({ y, m, d: daysInMonth(y, m) });
}

// Adds months to an ISO date, clamping the day (Jan 31 + 1 month → Feb 28/29).
export function addMonths(date: IsoDate, months: number): IsoDate {
  const p = parseIsoDate(date);
  if (!p) throw new Error(`Invalid date: ${date}`);
  const target = ymd(p.y, p.m + months, 1);
  return toIso({ ...target, d: Math.min(p.d, daysInMonth(target.y, target.m)) });
}

export function compareIso(a: IsoDate, b: IsoDate): number {
  // ISO dates compare correctly as strings.
  return a < b ? -1 : a > b ? 1 : 0;
}

export function todayIsoUtc(now: Date = new Date()): IsoDate {
  return toIso({ y: now.getUTCFullYear(), m: now.getUTCMonth() + 1, d: now.getUTCDate() });
}

// The reader's own calendar date — what "today" means to someone planning deadlines.
export function todayIsoLocal(now: Date = new Date()): IsoDate {
  return toIso({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() });
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(m: number): string {
  return MONTH_NAMES[m - 1] ?? "";
}

// "15 April 2027" — the site's British-style long date used in page copy.
export function formatLongDate(date: IsoDate): string {
  const p = parseIsoDate(date);
  if (!p) return date;
  return `${p.d} ${monthName(p.m)} ${p.y}`;
}

// "Thu 15 Apr 2027" for dense lists.
export function formatShortDate(date: IsoDate): string {
  const p = parseIsoDate(date);
  if (!p) return date;
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(utcMs(p)).getUTCDay()
  ];
  return `${weekday} ${p.d} ${monthName(p.m).slice(0, 3)} ${p.y}`;
}

export function weekdayOf(date: IsoDate): number {
  return new Date(utcMs(date)).getUTCDay();
}
