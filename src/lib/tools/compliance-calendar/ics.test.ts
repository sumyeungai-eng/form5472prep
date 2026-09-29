import { describe, expect, it } from "vitest";
import { buildIcs, escapeIcsText, foldIcsLine } from "./ics";

const NOW = new Date("2026-09-29T12:34:56.789Z");

describe("escapeIcsText", () => {
  it("escapes backslash, semicolon, comma and newlines (RFC 5545 §3.3.11)", () => {
    expect(escapeIcsText("a\\b;c,d\ne\r\nf")).toBe("a\\\\b\\;c\\,d\\ne\\nf");
  });
});

describe("foldIcsLine", () => {
  it("leaves lines of 75 octets or fewer untouched", () => {
    const line = "X".repeat(75);
    expect(foldIcsLine(line)).toBe(line);
  });

  it("folds long lines so every physical line is at most 75 octets", () => {
    const line = `DESCRIPTION:${"é".repeat(60)}${"a".repeat(80)}`;
    const folded = foldIcsLine(line);
    const physical = folded.split("\r\n");
    expect(physical.length).toBeGreaterThan(1);
    physical.forEach((part, i) => {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
      if (i > 0) expect(part.startsWith(" ")).toBe(true);
    });
    // Unfolding (remove CRLF + one space) restores the original line exactly.
    expect(folded.replace(/\r\n /g, "")).toBe(line);
  });
});

describe("buildIcs", () => {
  const ics = buildIcs(
    [
      {
        uid: "fed-5472-2026-12-31@form5472prep.com",
        date: "2027-04-15",
        summary: "Form 5472 + pro forma Form 1120 due",
        description: "Tax year 1 Jan 2026 – 31 Dec 2026; fax or mail, see irs.gov",
        url: "https://www.irs.gov/instructions/i5472",
        reminderDays: 14,
      },
      {
        uid: "de-annual-tax-2027-06-01@form5472prep.com",
        date: "2027-06-01",
        summary: "Delaware LLC annual tax ($400)",
      },
    ],
    { now: NOW, calendarName: "LLC deadlines, Delaware" },
  );

  it("uses CRLF line endings throughout and ends with CRLF", () => {
    expect(ics.endsWith("\r\n")).toBe(true);
    expect(ics.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("wraps events in a VCALENDAR with VERSION and PRODID", () => {
    const lines = ics.split("\r\n");
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines.some((l) => l.startsWith("PRODID:"))).toBe(true);
    expect(lines[lines.length - 2]).toBe("END:VCALENDAR");
    expect(lines).toContain("X-WR-CALNAME:LLC deadlines\\, Delaware");
  });

  it("emits balanced all-day VEVENTs with UID, DTSTAMP and an exclusive DTEND", () => {
    const lines = ics.split("\r\n");
    expect(lines.filter((l) => l === "BEGIN:VEVENT")).toHaveLength(2);
    expect(lines.filter((l) => l === "END:VEVENT")).toHaveLength(2);
    expect(lines).toContain("UID:fed-5472-2026-12-31@form5472prep.com");
    expect(lines).toContain("DTSTART;VALUE=DATE:20270415");
    expect(lines).toContain("DTEND;VALUE=DATE:20270416");
    expect(lines).toContain("DTSTART;VALUE=DATE:20270601");
    expect(lines).toContain("DTEND;VALUE=DATE:20270602");
    expect(lines.filter((l) => l === "DTSTAMP:20260929T123456Z")).toHaveLength(2);
  });

  it("escapes text values and includes the reminder alarm only when requested", () => {
    const unfolded = ics.replace(/\r\n /g, "");
    expect(unfolded).toContain(
      "DESCRIPTION:Tax year 1 Jan 2026 – 31 Dec 2026\\; fax or mail\\, see irs.gov",
    );
    expect(unfolded.match(/BEGIN:VALARM/g)).toHaveLength(1);
    expect(unfolded).toContain("TRIGGER:-P14D");
  });

  it("keeps every physical line within 75 octets", () => {
    for (const line of ics.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});
