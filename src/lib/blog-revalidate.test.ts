import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { BLOG_ROUTE_GROUP, revalidateBlogIndex } from "./blog-revalidate";

describe("revalidateBlogIndex", () => {
  beforeEach(() => revalidatePath.mockClear());

  it("refreshes page 1, the older index pages and every topic hub page together", () => {
    revalidateBlogIndex();
    expect(revalidatePath.mock.calls).toEqual([
      ["/blog"],
      ["/blog/page/[n]", "page"],
      ["/(marketing)/blog/page/[n]", "page"],
      ["/blog/topics", "layout"],
      ["/(marketing)/blog/topics", "layout"],
    ]);
  });

  it("names the route group the blog routes actually live in", () => {
    const app = path.join(process.cwd(), "src", "app", BLOG_ROUTE_GROUP, "blog");
    expect(fs.existsSync(path.join(app, "page", "[n]", "page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(app, "topics", "[tag]", "page", "[n]", "page.tsx"))).toBe(true);
  });
});
