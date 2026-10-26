import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// RSC payloads must never be indexed (Google picked other Next.js sites as the
// canonical of 11 pages, 2026-10-26); normal HTML pages must stay indexable.
describe("middleware X-Robots-Tag on RSC payloads", () => {
  const url = "https://www.form5472prep.com/compare/form-5472-filing-services";

  it("marks an RSC request noindex", () => {
    const res = middleware(new NextRequest(url, { headers: { RSC: "1" } }));
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex");
  });

  it("marks a ?_rsc= prefetch noindex", () => {
    const res = middleware(new NextRequest(`${url}?_rsc=abc12`));
    expect(res.headers.get("X-Robots-Tag")).toBe("noindex");
  });

  it("leaves the normal HTML page indexable", () => {
    const res = middleware(new NextRequest(url));
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
  });
});
