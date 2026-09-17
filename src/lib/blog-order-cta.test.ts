import { describe, expect, it } from "vitest";
import { orderCtaHref, orderProductsForPost } from "./blog-order-cta";

describe("orderProductsForPost", () => {
  it("matches the ein tag", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["ein"] })).toEqual(["ein"]);
  });

  it("matches the itin tag", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["itin"] })).toEqual(["itin"]);
  });

  it("matches both tags in stable order", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["ein", "itin"] })).toEqual(["ein", "itin"]);
  });

  it("matches the form-ss-4 tag as ein", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["form-ss-4"] })).toEqual(["ein"]);
  });

  it("matches the form-w-7 tag as itin", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["form-w-7"] })).toEqual(["itin"]);
  });

  it("matches the caa tag as itin", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["caa"] })).toEqual(["itin"]);
  });

  it("matches an ein slug with no tags", () => {
    expect(orderProductsForPost({ slug: "ein-application-checklist-foreign-owned-llc" })).toEqual(["ein"]);
  });

  it("matches an itin slug with no tags", () => {
    expect(orderProductsForPost({ slug: "itin-renewal-expired-itin-what-to-do" })).toEqual(["itin"]);
  });

  it("excludes itin for the slug where an ITIN CTA would contradict the article", () => {
    expect(
      orderProductsForPost({ slug: "itin-required-form-5472", tags: ["itin", "form-5472"] }),
    ).toEqual([]);
  });

  it("returns nothing for an unrelated post", () => {
    expect(orderProductsForPost({ slug: "form-5472-cost", tags: ["form-5472"] })).toEqual([]);
  });

  it("matches tags case-insensitively", () => {
    expect(orderProductsForPost({ slug: "some-post", tags: ["EIN"] })).toEqual(["ein"]);
  });
});

describe("orderCtaHref", () => {
  it("points ein at the clean /ein/apply url", () => {
    expect(orderCtaHref("ein")).toBe("/ein/apply");
    expect(orderCtaHref("ein")).not.toContain("?");
  });

  it("points itin at the clean /itin/apply url", () => {
    expect(orderCtaHref("itin")).toBe("/itin/apply");
    expect(orderCtaHref("itin")).not.toContain("?");
  });
});
