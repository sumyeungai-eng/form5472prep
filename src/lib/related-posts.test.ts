import { describe, expect, it } from "vitest";
import type { PostMeta } from "./blog";
import { relatedPosts, topicFamily } from "./related-posts";

function post(slug: string, date: string, tags: string[], extra: Partial<PostMeta> = {}): PostMeta {
  return {
    slug,
    title: slug,
    description: slug,
    date,
    tags,
    readingMinutes: 5,
    image: "/x.jpg",
    imageAlt: "",
    ...extra,
  };
}

const NOW = new Date("2026-10-04T12:00:00Z");

describe("relatedPosts", () => {
  const current = post("cur", "2026-09-01", ["form-5472", "late-filing", "penalty"]);

  it("ranks by shared specific tags, ties go to the nearest post in release order", () => {
    const all = [
      current,
      post("old-two", "2026-01-01", ["form-5472", "late-filing", "penalty"]),
      post("new-one", "2026-08-01", ["form-5472", "late-filing"]),
      post("old-one", "2026-02-01", ["form-5472", "penalty"]),
      post("none", "2026-09-30", ["form-5472", "ein"]),
    ];
    expect(relatedPosts(current, all, 4, NOW).map((p) => p.slug)).toEqual([
      "old-two", // 2 shared
      "new-one", // 1 shared, nearer
      "old-one", // 1 shared, further
      "none", // fallback
    ]);
  });

  it("does not count the generic tags every post carries", () => {
    const all = [
      current,
      post("generic-new", "2026-09-30", ["form-5472", "foreign-owned-llc"]),
      post("topical-old", "2026-01-01", ["penalty"]),
    ];
    expect(relatedPosts(current, all, 2, NOW).map((p) => p.slug)).toEqual(["topical-old", "generic-new"]);
  });

  it("falls back to the nearest posts when nothing is shared", () => {
    const lone = post("lone", "2026-09-01", ["wise"]);
    const all = [lone, post("a", "2026-03-01", ["x"]), post("b", "2026-05-01", ["y"]), post("c", "2026-04-01", [])];
    expect(relatedPosts(lone, all, 2, NOW).map((p) => p.slug)).toEqual(["b", "c"]);
  });

  it("excludes the current post, drafts and posts scheduled for the future", () => {
    const all = [
      current,
      post("draft", "2026-09-20", ["late-filing"], { draft: true }),
      post("scheduled", "2026-10-01", ["late-filing"], { publishAt: "2026-10-20T09:00:00-04:00" }),
      post("released", "2026-09-10", ["late-filing"], { publishAt: "2026-09-10T09:00:00-04:00" }),
    ];
    expect(relatedPosts(current, all, 4, NOW).map((p) => p.slug)).toEqual(["released"]);
  });

  it("returns at most `limit` posts and is empty when there are no others", () => {
    const all = Array.from({ length: 9 }, (_, i) => post(`p${i}`, `2026-0${(i % 9) + 1}-01`, ["penalty"]));
    expect(relatedPosts(current, all, 4, NOW)).toHaveLength(4);
    expect(relatedPosts(current, [current], 4, NOW)).toEqual([]);
  });

  it("normalises tag aliases (digital-nomads == digital-nomad)", () => {
    const c = post("c", "2026-09-01", ["digital-nomad"]);
    const all = [c, post("alias", "2026-01-01", ["digital-nomads"]), post("other", "2026-09-02", ["ein"])];
    expect(relatedPosts(c, all, 1, NOW).map((p) => p.slug)).toEqual(["alias"]);
  });

  it("puts posts from the same series first (country guides next to country guides)", () => {
    const c = post("form-5472-spain-residents-us-llc", "2026-08-25", ["spain", "nif"]);
    const all = [
      c,
      post("form-5472-cost", "2026-08-26", ["spain"]),
      post("form-5472-france-residents-us-llc", "2026-01-01", ["france"]),
      post("barcelona-digital-nomad-visa-us-llc-tax-election", "2026-02-01", []),
    ];
    expect(relatedPosts(c, all, 3, NOW).map((p) => p.slug)).toEqual([
      "barcelona-digital-nomad-visa-us-llc-tax-election", // same series, nearer
      "form-5472-france-residents-us-llc", // same series
      "form-5472-cost", // shares a tag but another series
    ]);
  });

  it("spreads picks over neighbours instead of every post picking the newest", () => {
    const all = Array.from({ length: 12 }, (_, i) =>
      post(`form-5472-c${String.fromCharCode(97 + i)}-residents-us-llc`, `2026-09-${String(i + 1).padStart(2, "0")}`, ["ftin"]),
    );
    const inbound = new Map<string, number>();
    for (const p of all) for (const r of relatedPosts(p, all, 4, NOW)) inbound.set(r.slug, (inbound.get(r.slug) ?? 0) + 1);
    expect(all.filter((p) => (inbound.get(p.slug) ?? 0) < 2)).toEqual([]);
  });
});

describe("topicFamily", () => {
  it("recognises country, city and US-state series", () => {
    expect(topicFamily("form-5472-vietnam-residents-us-llc")).toBe("residence");
    expect(topicFamily("chiang-mai-digital-nomad-llc-coworking-owner-paid-costs")).toBe("residence");
    expect(topicFamily("texas-llc-foreign-owner-tax-filing")).toBe("us-state");
    expect(topicFamily("form-5472-digital-nomad-us-llc")).toBeUndefined();
    expect(topicFamily("us-llc-tax-free-digital-nomads-myth")).toBeUndefined();
  });
});
