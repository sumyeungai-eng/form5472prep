import { beforeEach, describe, expect, it, vi } from "vitest";
import { POSTS_PER_PAGE } from "@/lib/blog-pagination";

const { getAllPosts } = vi.hoisted(() => ({ getAllPosts: vi.fn() }));
vi.mock("@/lib/blog", () => ({ getAllPosts, formatPostDate: (d: string) => d }));

import { dynamicParams, generateMetadata, generateStaticParams, revalidate } from "./page";
import { metadata as blogIndexMetadata, revalidate as blogIndexRevalidate } from "../../page";

const fakePosts = (n: number) => Array.from({ length: n }, (_, i) => ({ slug: `p${i}` }));

describe("/blog/page/[n] freshness", () => {
  beforeEach(() => getAllPosts.mockReset());

  it("refreshes on the same ISR window as /blog", () => {
    expect(revalidate).toBe(blogIndexRevalidate);
  });

  it("lets pages created after the build render on demand", () => {
    expect(dynamicParams).toBe(true);
  });

  it("prerenders pages 2..N for the posts that exist", async () => {
    getAllPosts.mockResolvedValue(fakePosts(POSTS_PER_PAGE * 3));
    expect(await generateStaticParams()).toEqual([{ n: "2" }, { n: "3" }]);
  });

  it("adds a new last page when the post count crosses a page boundary", async () => {
    getAllPosts.mockResolvedValue(fakePosts(POSTS_PER_PAGE * 8));
    expect((await generateStaticParams()).at(-1)).toEqual({ n: "8" });
    getAllPosts.mockResolvedValue(fakePosts(POSTS_PER_PAGE * 8 + 1));
    expect((await generateStaticParams()).at(-1)).toEqual({ n: "9" });
  });

  it("has no extra pages while everything fits on /blog", async () => {
    getAllPosts.mockResolvedValue(fakePosts(POSTS_PER_PAGE));
    expect(await generateStaticParams()).toEqual([]);
  });
  // Moz 2026-10-25: /blog/page/N outranked the posts it lists and was flagged
  // Duplicate Content. Pages 2+ stay crawlable (follow) but are never indexed.
  it("is noindex,follow and self-canonical on page 2+", async () => {
    getAllPosts.mockResolvedValue(fakePosts(POSTS_PER_PAGE * 3));
    const meta = await generateMetadata({ params: { n: "3" } });
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.alternates?.canonical).toMatch(/\/blog\/page\/3$/);
  });

  it("leaves /blog itself indexable (inherits the root robots)", () => {
    expect(blogIndexMetadata.robots).toBeUndefined();
    expect(blogIndexMetadata.alternates?.canonical).toMatch(/\/blog$/);
  });
});
