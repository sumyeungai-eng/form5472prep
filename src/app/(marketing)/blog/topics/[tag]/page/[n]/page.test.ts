import { beforeEach, describe, expect, it, vi } from "vitest";
import { POSTS_PER_PAGE } from "@/lib/blog-pagination";
import { MIN_INDEXABLE_TAG_POSTS } from "@/lib/blog-tags";

const { getAllPosts } = vi.hoisted(() => ({ getAllPosts: vi.fn() }));
vi.mock("@/lib/blog", () => ({
  getAllPosts,
  formatPostDate: (d: string) => d,
  // blog-tags.ts imports slugify from the loader.
  slugify: (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
}));

import { dynamicParams, generateMetadata, generateStaticParams, revalidate } from "./page";
import { revalidate as hubRevalidate } from "../../page";
import { resolveTopicPage } from "../../../../_components/TopicHubView";

type Fake = { slug: string; tags: string[]; title: string; date: string };
const fakePosts = (tag: string, n: number): Fake[] =>
  Array.from({ length: n }, (_, i) => ({ slug: `${tag}-${i}`, tags: [tag], title: `${tag} ${i}`, date: "2026-10-01" }));

describe("/blog/topics/[tag]/page/[n]", () => {
  beforeEach(() => getAllPosts.mockReset());

  it("refreshes on the same ISR window as the hub's page 1", () => {
    expect(revalidate).toBe(hubRevalidate);
  });

  it("lets pages created after the build render on demand", () => {
    expect(dynamicParams).toBe(true);
  });

  it("prerenders pages 2..N of indexable hubs only", async () => {
    getAllPosts.mockResolvedValue([
      ...fakePosts("form-5472", POSTS_PER_PAGE * 3 + 1),
      ...fakePosts("ein", MIN_INDEXABLE_TAG_POSTS),
      ...fakePosts("thin", MIN_INDEXABLE_TAG_POSTS - 1),
    ]);
    expect(await generateStaticParams()).toEqual([
      { tag: "form-5472", n: "2" },
      { tag: "form-5472", n: "3" },
      { tag: "form-5472", n: "4" },
    ]);
  });

  it("is self-canonical and indexable for an indexable hub", async () => {
    getAllPosts.mockResolvedValue(fakePosts("form-5472", POSTS_PER_PAGE + 5));
    const meta = await generateMetadata({ params: { tag: "form-5472", n: "2" } });
    expect(meta.alternates?.canonical).toMatch(/\/blog\/topics\/form-5472\/page\/2$/);
    expect(meta.robots).toBeUndefined();
    expect(meta.description).toContain("guides 25–29 of 29");
  });

  it.each(["1", "02", "3", "x"])("404s page %s of a two-page hub", async (n) => {
    getAllPosts.mockResolvedValue(fakePosts("form-5472", POSTS_PER_PAGE + 5));
    const meta = await generateMetadata({ params: { tag: "form-5472", n } });
    expect(meta.title).toBe("Page not found");
  });
});

describe("resolveTopicPage", () => {
  const posts = fakePosts("form-5472", POSTS_PER_PAGE * 2 + 3) as never[];

  it("puts every hub post on exactly one page", () => {
    const pages = resolveTopicPage(posts, "form-5472", 1)!.pages;
    expect(pages).toBe(3);
    expect(resolveTopicPage(posts, "form-5472", 3)!.entry.count).toBe(POSTS_PER_PAGE * 2 + 3);
  });

  it("rejects unknown tags and out-of-range pages", () => {
    expect(resolveTopicPage(posts, "nope", 1)).toBeNull();
    expect(resolveTopicPage(posts, "form-5472", 4)).toBeNull();
    expect(resolveTopicPage(posts, "form-5472", 0)).toBeNull();
  });

  it("keeps a thin hub noindex", async () => {
    getAllPosts.mockResolvedValue(fakePosts("thin", 3));
    const { generateMetadata: hubMeta } = await import("../../page");
    const meta = await hubMeta({ params: { tag: "thin" } });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});
