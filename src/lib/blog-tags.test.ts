import { describe, expect, it } from "vitest";
import type { PostMeta } from "@/lib/blog";
import {
  buildTagIndex,
  findTag,
  formatTag,
  indexableTagSlugs,
  MIN_INDEXABLE_TAG_POSTS,
  TAG_SLUG_ALIASES,
  tagHref,
  tagSlug,
} from "@/lib/blog-tags";

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

  it("collapses tag-slug aliases onto one canonical topic", () => {
    const entries = buildTagIndex([
      post("one", ["non-resident"]),
      post("two", ["nonresident"]),
      post("three", ["digital-nomads", "digital-nomad"]),
    ]);

    expect(entries).toEqual([
      expect.objectContaining({ tag: "non-resident", label: "Non-resident", count: 2 }),
      expect.objectContaining({ tag: "digital-nomad", count: 1 }),
    ]);
    expect(tagSlug("Nonresident")).toBe("non-resident");
    expect(tagHref("nonresident")).toBe("/blog/topics/non-resident");
  });

  it("every tag alias has a permanent redirect in next.config.mjs", async () => {
    const { default: nextConfig } = await import("../../next.config.mjs");
    const redirects = (await nextConfig.redirects?.()) ?? [];
    for (const [alias, canonical] of Object.entries(TAG_SLUG_ALIASES)) {
      expect(redirects).toContainEqual({
        source: `/blog/topics/${alias}`,
        destination: `/blog/topics/${canonical}`,
        permanent: true,
      });
    }
  });

  it("thin-tag threshold keeps small topics out of the index", () => {
    expect(MIN_INDEXABLE_TAG_POSTS).toBeGreaterThanOrEqual(7);
  });

  it("returns undefined when a slug has no posts", () => {
    expect(findTag([post("one", ["ein"])], "missing")).toBeUndefined();
  });

  it("normalises tag hrefs from non-slug database tags", () => {
    expect(tagHref("Form 5472")).toBe("/blog/topics/form-5472");
  });

  it("only tags at or above the threshold are indexable (link targets)", () => {
    const hub = Array.from({ length: MIN_INDEXABLE_TAG_POSTS }, (_, i) => post(`hub-${i}`, ["Form 5472"]));
    const thin = Array.from({ length: MIN_INDEXABLE_TAG_POSTS - 1 }, (_, i) => post(`thin-${i}`, ["dormant-llc"]));
    const slugs = indexableTagSlugs([...hub, ...thin]);
    expect(slugs.has("form-5472")).toBe(true);
    expect(slugs.has("dormant-llc")).toBe(false);
  });
});
