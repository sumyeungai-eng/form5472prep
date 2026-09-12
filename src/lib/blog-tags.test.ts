import { describe, expect, it } from "vitest";
import type { PostMeta } from "@/lib/blog";
import { buildTagIndex, findTag, formatTag, tagHref } from "@/lib/blog-tags";

function post(slug: string, tags: string[]): PostMeta {
  return {
    slug,
    title: slug,
    description: `${slug} description`,
    date: "2026-01-01",
    tags,
    readingMinutes: 3,
    image: `/blog/${slug}.webp`,
    imageAlt: `${slug} image`,
  };
}

describe("blog tag helpers", () => {
  it("formats acronym and special-case tag labels", () => {
    expect(formatTag("ein")).toBe("EIN");
    expect(formatTag("itin")).toBe("ITIN");
    expect(formatTag("form-w-7")).toBe("Form W-7");
    expect(formatTag("foreign-owned-llc")).toBe("Foreign-owned LLC");
  });

  it("falls back to title casing unmapped tags", () => {
    expect(formatTag("late-filing")).toBe("Late Filing");
  });

  it("counts tags correctly and sorts by count desc", () => {
    const entries = buildTagIndex([
      post("one", ["form-5472", "ein"]),
      post("two", ["form-5472"]),
      post("three", ["itin"]),
    ]);

    expect(entries.map((entry) => [entry.tag, entry.count])).toEqual([
      ["form-5472", 2],
      ["ein", 1],
      ["itin", 1],
    ]);
  });

  it("keeps non-resident and nonresident separate while sharing the label", () => {
    const entries = buildTagIndex([
      post("one", ["non-resident"]),
      post("two", ["nonresident"]),
    ]);

    expect(entries).toEqual([
      expect.objectContaining({ tag: "non-resident", label: "Non-resident", count: 1 }),
      expect.objectContaining({ tag: "nonresident", label: "Non-resident", count: 1 }),
    ]);
  });

  it("returns undefined when a slug has no posts", () => {
    expect(findTag([post("one", ["ein"])], "missing")).toBeUndefined();
  });

  it("normalises tag hrefs from non-slug database tags", () => {
    expect(tagHref("Form 5472")).toBe("/blog/topics/form-5472");
  });
});
