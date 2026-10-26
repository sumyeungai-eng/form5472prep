import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config.mjs";

// RSC payloads must never be indexed (Google picked other Next.js sites as the
// canonical of 11 pages, 2026-10-26). The rule must match only `RSC: 1`
// requests so normal HTML pages stay indexable.
describe("next.config headers: X-Robots-Tag on RSC payloads", () => {
  it("adds noindex only when the RSC: 1 request header is present", async () => {
    const rules = await nextConfig.headers!();
    const rsc = rules.filter((r) => r.headers.some((h) => h.key === "X-Robots-Tag"));
    expect(rsc).toHaveLength(1);
    expect(rsc[0].source).toBe("/:path*");
    expect(rsc[0].has).toEqual([{ type: "header", key: "rsc", value: "1" }]);
    expect(rsc[0].headers).toEqual([{ key: "X-Robots-Tag", value: "noindex" }]);
  });
});
