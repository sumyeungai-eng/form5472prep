import { beforeEach, describe, expect, it, vi } from "vitest";
import { POSTS_PER_PAGE } from "@/lib/blog-pagination";

const { getAllPosts } = vi.hoisted(() => ({ getAllPosts: vi.fn() }));
vi.mock("@/lib/blog", () => ({ getAllPosts, formatPostDate: (d: string) => d }));

import { dynamicParams, generateStaticParams, revalidate } from "./page";
import { revalidate as blogIndexRevalidate } from "../../page";

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
});
