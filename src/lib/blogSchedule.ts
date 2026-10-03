// Blog drip scheduling: one post per day at 09:00 London time, weekends
// included. Pure date math only (no fs, no DB) so the admin editor (browser),
// the queue script and the release cron all compute identical slots.
//
// A post is scheduled by its `publishAt` ISO instant (see blog.ts
// isPubliclyAvailable). Writers who don't want to pick dates put
// `publishAt: auto` in the frontmatter and run `npm run blog:schedule`, which
// rewrites it to the next free slot. An unresolved "auto" never publishes.

export const PUBLISH_TIMEZONE = "Europe/London";
export const PUBLISH_TIME = "09:00";
export const AUTO_PUBLISH = "auto";

const DAY_MS = 24 * 60 * 60 * 1000;

// "GMT+01:00" / "GMT+00:00" / "GMT" (some browsers) -> "+01:00".
function londonOffset(at: Date): string {
  const name = new Intl.DateTimeFormat("en-GB", {
    timeZone: PUBLISH_TIMEZONE,
    timeZoneName: "longOffset",
  })
    .formatToParts(at)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!m) return "+00:00";
  return `${m[1]}${m[2].padStart(2, "0")}:${m[3] ?? "00"}`;
}

// London wall-clock date + time -> ISO instant with the London offset, e.g.
// ("2026-10-04", "09:00") -> "2026-10-04T09:00:00+01:00". The offset is read at
// noon UTC that day; UK clocks change at 01:00 UTC, so any time after ~02:00
// gets the right offset.
export function londonInstant(ymd: string, hhmm: string = PUBLISH_TIME): string {
  const offset = londonOffset(new Date(`${ymd}T12:00:00Z`));
  return `${ymd}T${hhmm}:00${offset}`;
}

// The London calendar date (YYYY-MM-DD) of an instant.
export function londonYmd(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PUBLISH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

// London wall-clock "HH:MM" of an instant.
export function londonHhmm(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PUBLISH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

function addDays(ymd: string, days: number): string {
  return new Date(Date.parse(`${ymd}T12:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export function parsePublishAt(value: string | undefined | null): Date | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t) : null;
}

// True when publishAt is set but can never release (e.g. an unresolved
// "auto"): the post is silently invisible, so admin and tests flag it.
export function isUnresolvedPublishAt(value: string | undefined | null): boolean {
  return !!value && parsePublishAt(value) === null;
}

// Next `count` free daily slots. A day is taken when any post already has a
// future publishAt on that London date. The first candidate is today if
// today's 09:00 London slot hasn't passed yet, otherwise tomorrow. Gaps in the
// queue are filled before the end is extended.
export function nextFreeSlots(
  publishAts: Array<string | undefined | null>,
  count: number,
  now: Date = new Date(),
): string[] {
  const taken = new Set<string>();
  for (const value of publishAts) {
    const at = parsePublishAt(value);
    if (at && at.getTime() > now.getTime()) taken.add(londonYmd(at));
  }

  const today = londonYmd(now);
  let day = Date.parse(londonInstant(today)) > now.getTime() ? today : addDays(today, 1);
  const slots: string[] = [];
  while (slots.length < count) {
    if (!taken.has(day)) {
      slots.push(londonInstant(day));
      taken.add(day);
    }
    day = addDays(day, 1);
  }
  return slots;
}

// "Sun 4 Oct 2026, 09:00 London". Assembled from parts so server (Node ICU)
// and browser render identical text — the editor is SSR'd then hydrated.
export function formatLondon(value: string): string {
  const at = parsePublishAt(value);
  if (!at) return value;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PUBLISH_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("weekday")} ${part("day")} ${part("month")} ${part("year")}, ${londonHhmm(at)} London`;
}
