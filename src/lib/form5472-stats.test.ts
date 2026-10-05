import { describe, expect, it } from "vitest";
import {
  FORM5472_STATS,
  OFFICIAL_SOURCE_DOMAINS,
  STAT_CATEGORIES,
  STATS_LAST_REVIEWED,
  isOfficialSourceUrl,
  statSourceUrls,
} from "@/lib/form5472-stats";

describe("form5472-stats data", () => {
  it("has at least 12 facts", () => {
    expect(FORM5472_STATS.length).toBeGreaterThanOrEqual(12);
  });

  it("has unique ids", () => {
    const ids = FORM5472_STATS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("marks exactly 5 facts as editors' picks", () => {
    expect(FORM5472_STATS.filter((s) => s.editorsPick)).toHaveLength(5);
  });

  it.each(FORM5472_STATS.map((s) => [s.id, s] as const))(
    "%s cites an https official source and a period",
    (_id, stat) => {
      expect(stat.sourceUrl.startsWith("https://")).toBe(true);
      expect(isOfficialSourceUrl(stat.sourceUrl)).toBe(true);
      expect(stat.period.trim().length).toBeGreaterThan(0);
      expect(stat.sourceLabel.trim().length).toBeGreaterThan(0);
      expect(stat.figure.trim().length).toBeGreaterThan(0);
      expect(stat.detail.trim().length).toBeGreaterThan(0);
      expect(stat.headline.trim().split(/\s+/).length).toBeLessThanOrEqual(20);
      expect(STAT_CATEGORIES.some((c) => c.id === stat.category)).toBe(true);
    },
  );

  it("every category has at least one fact", () => {
    for (const c of STAT_CATEGORIES) {
      expect(FORM5472_STATS.some((s) => s.category === c.id)).toBe(true);
    }
  });

  it("uses an ISO review date", () => {
    expect(STATS_LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("dedupes source urls for citation", () => {
    const urls = statSourceUrls();
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.length).toBeGreaterThan(5);
  });

  it("never states prices or banned claims", () => {
    const text = JSON.stringify(FORM5472_STATS);
    expect(text).not.toMatch(/\bCPA\b|licensed|IRS-approved|guarantee|\bbest\b|#1/i);
  });
});

describe("isOfficialSourceUrl", () => {
  it("accepts official hosts and subdomains", () => {
    expect(isOfficialSourceUrl("https://www.irs.gov/instructions/i5472")).toBe(true);
    expect(isOfficialSourceUrl("https://www.taxpayeradvocate.irs.gov/x.pdf")).toBe(true);
    expect(OFFICIAL_SOURCE_DOMAINS).toContain("ecfr.gov");
  });

  it("rejects http, look-alike hosts and junk", () => {
    expect(isOfficialSourceUrl("http://www.irs.gov/")).toBe(false);
    expect(isOfficialSourceUrl("https://irs.gov.example.com/")).toBe(false);
    expect(isOfficialSourceUrl("https://notirs.gov/")).toBe(false);
    expect(isOfficialSourceUrl("not a url")).toBe(false);
  });
});
