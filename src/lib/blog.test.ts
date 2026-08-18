import { describe, expect, it } from "vitest";
import { blogSlugFromHref, isPubliclyAvailable } from "./blog";

describe("isPubliclyAvailable", () => {
  const now = new Date("2026-07-27T13:00:00.000Z");

  it("keeps drafts private even after their release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: true, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("keeps a scheduled post private before its release time", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:01-04:00" },
        now,
      ),
    ).toBe(false);
  });

  it("publishes at the exact scheduled instant", () => {
    expect(
      isPubliclyAvailable(
        { draft: false, publishAt: "2026-07-27T09:00:00-04:00" },
        now,
      ),
    ).toBe(true);
  });

  it("continues to publish older posts without a schedule", () => {
    expect(isPubliclyAvailable({ draft: false }, now)).toBe(true);
  });
});

describe("blogSlugFromHref", () => {
  it.each([
    ["/blog/foo", "foo"],
    ["/blog/foo/", "foo"],
    ["/blog/foo?utm=x#h", "foo"],
    ["/blog", null],
    ["/blog/", null],
    ["/start", null],
    ["https://www.form5472prep.com/blog/foo", null],
    [undefined, null],
  ])("parses %s as %s", (href, expected) => {
    expect(blogSlugFromHref(href)).toBe(expected);
  });
});
