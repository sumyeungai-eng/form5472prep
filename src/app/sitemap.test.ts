import { describe, expect, it, vi } from "vitest";
import { POSTS_PER_PAGE } from "@/lib/blog-pagination";

const { getAllPosts } = vi.hoisted(() => ({ getAllPosts: vi.fn() }));
vi.mock("@/lib/blog", () => ({
  getAllPosts,
  slugify: (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
}));

import sitemap from "./sitemap";

const fakePosts = (tag: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({ slug: `${tag}-${i}`, tags: [tag], title: `${tag} ${i}`, date: "2026-10-01" }));

// 2026-10-26: listing pages 2+ are noindex,follow, so the sitemap advertises
// only page 1 of /blog and of each indexable, non-duplicate topic hub.
describe("sitemap listing pages", () => {
  it("lists page 1 of the blog and of indexable hubs only", async () => {
    getAllPosts.mockResolvedValue([
      ...fakePosts("form-5472", POSTS_PER_PAGE * 3),
      ...fakePosts("itin", 15),
      ...fakePosts("form-w-7", 14),
      ...fakePosts("thin", 3),
    ]);
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(urls.filter((u) => u.includes("/page/"))).toEqual([]);
    expect(urls).toContain("/blog");
    expect(urls).toContain("/blog/topics/form-5472");
    expect(urls).toContain("/blog/topics/itin");
    expect(urls).not.toContain("/blog/topics/form-w-7");
    expect(urls).not.toContain("/blog/topics/thin");
    expect(urls).toContain("/blog/form-5472-0");
  });
});

describe("sitemap Form 7004 service", () => {
  it("lists the landing page with its date, never the noindex apply page", async () => {
    getAllPosts.mockResolvedValue([]);
    const rows = await sitemap();
    const row = rows.find((r) => new URL(r.url).pathname === "/form-7004-extension");
    expect(row).toBeDefined();
    expect(new Date(row!.lastModified as Date | string).toISOString().slice(0, 10)).toBe("2026-10-28");
    expect(rows.some((r) => r.url.includes("/form-7004-extension/apply"))).toBe(false);
  });
});
