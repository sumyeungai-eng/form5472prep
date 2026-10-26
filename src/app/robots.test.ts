import { describe, expect, it } from "vitest";
import robots from "./robots";

// Moz's crawl (2026-10-11) reported the noindex login/application pages and
// ~110 /start?src=... variants. They are hidden from crawlers here; the public
// marketing surface must stay crawlable.
describe("robots.txt rules", () => {
  const rules = robots().rules;
  const list = Array.isArray(rules) ? rules : [rules];
  const wildcard = list.find((r) => r.userAgent === "*");
  const disallow = ([] as string[]).concat(wildcard?.disallow ?? []);

  it("hides the app, auth and tracked-CTA routes", () => {
    for (const route of [
      "/dashboard",
      "/filings",
      "/applications/",
      "/admin",
      "/api/",
      "/start?",
      "/sign-in",
      "/partner/sign-in",
      "/ein/apply",
      "/itin/apply",
      "/*?_rsc=",
    ]) {
      expect(disallow).toContain(route);
    }
  });

  it("keeps /start, the blog and its paginated pages crawlable", () => {
    const blocks = (path: string) => disallow.some((rule) => path.startsWith(rule));
    expect(blocks("/start")).toBe(false);
    expect(blocks("/ein")).toBe(false);
    expect(blocks("/itin")).toBe(false);
    expect(blocks("/blog")).toBe(false);
    expect(blocks("/blog/page/2")).toBe(false);
  });

  it("applies the same disallow list to every AI crawler", () => {
    for (const rule of list) {
      expect(([] as string[]).concat(rule.disallow ?? [])).toEqual(disallow);
    }
  });
});
