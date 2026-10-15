import { describe, expect, it } from "vitest";
import {
  POSTS_PER_PAGE,
  blogPagePath,
  pageRange,
  pageSlice,
  pageWindow,
  parsePageParam,
  topicPagePath,
  totalPages,
} from "./blog-pagination";

const posts = (n: number) => Array.from({ length: n }, (_, i) => `post-${i + 1}`);

describe("totalPages", () => {
  it.each([
    [0, 1],
    [1, 1],
    [POSTS_PER_PAGE, 1],
    [POSTS_PER_PAGE + 1, 2],
    [POSTS_PER_PAGE * 8, 8],
    [POSTS_PER_PAGE * 8 + 1, 9],
  ])("%i posts -> %i pages", (count, expected) => {
    expect(totalPages(count)).toBe(expected);
  });
});

describe("pageSlice", () => {
  it("puts every post on exactly one page, in order", () => {
    const all = posts(100);
    const pages = totalPages(all.length);
    const seen = Array.from({ length: pages }, (_, i) => pageSlice(all, i + 1)).flat();
    expect(seen).toEqual(all);
  });

  it("never exceeds the page size and returns the remainder on the last page", () => {
    const all = posts(POSTS_PER_PAGE * 2 + 5);
    expect(pageSlice(all, 1)).toHaveLength(POSTS_PER_PAGE);
    expect(pageSlice(all, 2)).toHaveLength(POSTS_PER_PAGE);
    expect(pageSlice(all, 3)).toHaveLength(5);
  });

  it("returns nothing for pages that do not exist", () => {
    expect(pageSlice(posts(10), 0)).toEqual([]);
    expect(pageSlice(posts(10), 2)).toEqual([]);
    expect(pageSlice(posts(10), 1.5)).toEqual([]);
  });
});

describe("blogPagePath", () => {
  it("keeps page 1 at /blog and numbers the rest under /blog/page", () => {
    expect(blogPagePath(1)).toBe("/blog");
    expect(blogPagePath(2)).toBe("/blog/page/2");
    expect(blogPagePath(12)).toBe("/blog/page/12");
  });
});

describe("parsePageParam", () => {
  it.each([
    ["2", 2],
    ["10", 10],
  ])("accepts %s", (raw, expected) => {
    expect(parsePageParam(raw)).toBe(expected);
  });

  it.each(["1", "0", "02", "2.0", "+2", "-3", "abc", "", "2abc", "9999999999999999999"])(
    "rejects %j (one URL per page; page 1 is /blog)",
    (raw) => {
      expect(parsePageParam(raw)).toBeNull();
    },
  );
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
  });

  it("elides the middle and always keeps first, last and the current neighbours", () => {
    expect(pageWindow(1, 8)).toEqual([1, 2, "gap", 8]);
    expect(pageWindow(4, 8)).toEqual([1, "gap", 3, 4, 5, "gap", 8]);
    expect(pageWindow(8, 8)).toEqual([1, "gap", 7, 8]);
  });

  it("does not elide a single missing page", () => {
    expect(pageWindow(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the pager to at most 5 numbers however many pages exist", () => {
    for (let total = 1; total <= 60; total += 1) {
      for (let current = 1; current <= total; current += 1) {
        const numbers = pageWindow(current, total).filter((p) => p !== "gap");
        expect(numbers.length).toBeLessThanOrEqual(5);
        expect(numbers).toContain(current);
      }
    }
  });
});

describe("pageRange", () => {
  it("reports the human 1-based range, clipped to the post count", () => {
    expect(pageRange(1, 100)).toEqual({ from: 1, to: POSTS_PER_PAGE });
    expect(pageRange(2, 100)).toEqual({ from: POSTS_PER_PAGE + 1, to: POSTS_PER_PAGE * 2 });
    expect(pageRange(5, 100)).toEqual({ from: POSTS_PER_PAGE * 4 + 1, to: 100 });
  });
});

describe("topicPagePath", () => {
  it("keeps page 1 on the hub URL and nests older pages under /page/n", () => {
    expect(topicPagePath("form-5472", 1)).toBe("/blog/topics/form-5472");
    expect(topicPagePath("form-5472", 2)).toBe("/blog/topics/form-5472/page/2");
    expect(topicPagePath("ein", 7)).toBe("/blog/topics/ein/page/7");
  });
});
