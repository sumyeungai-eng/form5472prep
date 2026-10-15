import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath }));

import { revalidateBlogIndex } from "./blog-revalidate";

describe("revalidateBlogIndex", () => {
  beforeEach(() => revalidatePath.mockClear());

  it("refreshes page 1 and the dynamic older-page route together", () => {
    revalidateBlogIndex();
    expect(revalidatePath.mock.calls).toEqual([["/blog"], ["/blog/page/[n]", "page"]]);
  });
});
