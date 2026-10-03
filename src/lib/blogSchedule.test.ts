import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { describe, expect, it } from "vitest";
import {
  formatLondon,
  isUnresolvedPublishAt,
  londonHhmm,
  londonInstant,
  londonYmd,
  nextFreeSlots,
} from "./blogSchedule";

describe("londonInstant", () => {
  it("uses BST (+01:00) in summer and GMT (+00:00) in winter", () => {
    expect(londonInstant("2026-10-04")).toBe("2026-10-04T09:00:00+01:00");
    expect(londonInstant("2026-12-01")).toBe("2026-12-01T09:00:00+00:00");
  });

  it("gets both sides of the October clock change right", () => {
    // UK clocks go back at 01:00 UTC on Sunday 25 Oct 2026.
    expect(londonInstant("2026-10-24")).toBe("2026-10-24T09:00:00+01:00");
    expect(londonInstant("2026-10-25")).toBe("2026-10-25T09:00:00+00:00");
    expect(londonHhmm(new Date(londonInstant("2026-10-25")))).toBe("09:00");
  });

  it("round-trips through londonYmd / londonHhmm", () => {
    const at = new Date(londonInstant("2026-03-29", "18:30"));
    expect(londonYmd(at)).toBe("2026-03-29");
    expect(londonHhmm(at)).toBe("18:30");
  });
});

describe("nextFreeSlots", () => {
  const morning = new Date("2026-10-03T07:00:00Z"); // 08:00 London, before the slot
  const evening = new Date("2026-10-03T18:00:00Z"); // after today's slot

  it("starts today before 09:00 London, tomorrow after", () => {
    expect(nextFreeSlots([], 1, morning)).toEqual(["2026-10-03T09:00:00+01:00"]);
    expect(nextFreeSlots([], 1, evening)).toEqual(["2026-10-04T09:00:00+01:00"]);
  });

  it("gives one slot per day, weekends included, filling gaps first", () => {
    const taken = ["2026-10-04T09:00:00+01:00", "2026-10-06T09:00:00+01:00"];
    expect(nextFreeSlots(taken, 3, evening)).toEqual([
      "2026-10-05T09:00:00+01:00",
      "2026-10-07T09:00:00+01:00",
      "2026-10-08T09:00:00+01:00",
    ]);
  });

  it("treats any future post on a London day as taking that day, and ignores past/invalid ones", () => {
    const taken = ["2026-10-04T18:00:00+01:00", "2026-09-01T09:00:00+01:00", "auto", undefined];
    expect(nextFreeSlots(taken, 1, evening)).toEqual(["2026-10-05T09:00:00+01:00"]);
  });

  it("queues 30 posts across the clock change without skipping or doubling a day", () => {
    const slots = nextFreeSlots([], 30, evening);
    const days = slots.map((s) => londonYmd(new Date(s)));
    expect(new Set(days).size).toBe(30);
    expect(days[0]).toBe("2026-10-04");
    expect(days[29]).toBe("2026-11-02");
    for (const s of slots) expect(londonHhmm(new Date(s))).toBe("09:00");
  });
});

describe("helpers", () => {
  it("flags unresolved publishAt values", () => {
    expect(isUnresolvedPublishAt("auto")).toBe(true);
    expect(isUnresolvedPublishAt("2026-10-04T09:00:00+01:00")).toBe(false);
    expect(isUnresolvedPublishAt(undefined)).toBe(false);
  });

  it("formats in London time", () => {
    expect(formatLondon("2026-10-04T08:00:00Z")).toBe("Sun 4 Oct 2026, 09:00 London");
  });
});

// Guard: a post left as `publishAt: auto` (queue script not run) would never
// go live. Fail loudly instead.
describe("content/blog schedule guard", () => {
  it("has no unresolved publishAt values", async () => {
    const dir = path.join(process.cwd(), "content", "blog");
    const bad: string[] = [];
    for (const file of (await readdir(dir)).filter((f) => f.endsWith(".md"))) {
      const { data } = matter(await readFile(path.join(dir, file), "utf8"));
      const value = data.publishAt instanceof Date ? data.publishAt.toISOString() : data.publishAt;
      if (isUnresolvedPublishAt(value == null ? undefined : String(value))) bad.push(file);
    }
    expect(bad, "run `npm run blog:schedule` to assign slots").toEqual([]);
  });
});
