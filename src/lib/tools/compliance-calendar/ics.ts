// RFC 5545 (iCalendar) builder for the compliance calendar download.
// All-day events (DTSTART;VALUE=DATE), CRLF line endings, TEXT escaping
// (§3.3.11) and 75-octet line folding (§3.1). Pure: the caller supplies `now`
// for DTSTAMP so the output is deterministic under test.

import type { IsoDate } from "@/lib/tools/state-fees/dates";
import { addDays } from "@/lib/tools/state-fees/dates";

export type IcsEvent = {
  uid: string; // globally unique, stable across downloads
  date: IsoDate; // all-day event date
  summary: string;
  description?: string;
  url?: string;
  // Days before the event to show a reminder. Omit for no alarm.
  reminderDays?: number;
};

export type IcsOptions = {
  now: Date;
  calendarName?: string;
  prodId?: string;
};

const CRLF = "\r\n";
export const ICS_PRODID = "-//Form5472 Prep//LLC Compliance Calendar//EN";

// TEXT value escaping: backslash first, then ; and , and newlines.
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

const encoder = new TextEncoder();

// Folds a content line so no physical line exceeds 75 octets; continuation
// lines start with a single space. Never splits a UTF-8 multi-byte character.
export function foldIcsLine(line: string): string {
  if (encoder.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let currentBytes = 0;
  let limit = 75;
  // Array.from iterates by code point, so surrogate pairs stay together.
  for (const ch of Array.from(line)) {
    const chBytes = encoder.encode(ch).length;
    if (currentBytes + chBytes > limit) {
      parts.push(current);
      current = "";
      currentBytes = 0;
      limit = 74; // the leading space of a continuation line counts toward 75
    }
    current += ch;
    currentBytes += chBytes;
  }
  if (current) parts.push(current);
  return parts.join(`${CRLF} `);
}

function icsDate(date: IsoDate): string {
  return date.replace(/-/g, "");
}

function icsUtcStamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(events: IcsEvent[], options: IcsOptions): string {
  const stamp = icsUtcStamp(options.now);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${options.prodId ?? ICS_PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  if (options.calendarName) lines.push(`X-WR-CALNAME:${escapeIcsText(options.calendarName)}`);

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(event.date)}`,
      // DTEND is exclusive for all-day events: the next calendar day.
      `DTEND;VALUE=DATE:${icsDate(addDays(event.date, 1))}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    lines.push("TRANSP:TRANSPARENT");
    if (event.reminderDays && event.reminderDays > 0) {
      lines.push(
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        `DESCRIPTION:${escapeIcsText(event.summary)}`,
        `TRIGGER:-P${Math.round(event.reminderDays)}D`,
        "END:VALARM",
      );
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldIcsLine).join(CRLF) + CRLF;
}
