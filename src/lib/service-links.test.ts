import { describe, expect, it } from "vitest";
import { LANDING_PAGES } from "./landing-pages";
import { SERVICE_PAGES } from "./services-pages";
import { LANDING_SERVICE_MAP, serviceForBlogTags, serviceForLanding } from "./service-links";

const serviceSlugs = new Set(SERVICE_PAGES.map((p) => p.slug));

describe("serviceForLanding", () => {
  it("maps every landing page, and only to real service pages", () => {
    for (const p of LANDING_PAGES) {
      const target = serviceForLanding(p.slug);
      expect(target, `landing page "${p.slug}" has no service mapping`).not.toBeNull();
      expect(serviceSlugs.has(target as string), `${p.slug} -> ${target}`).toBe(true);
    }
  });

  it("has no mapping for a slug that is not a landing page", () => {
    const landing = new Set(LANDING_PAGES.map((p) => p.slug));
    for (const slug of Object.keys(LANDING_SERVICE_MAP)) expect(landing.has(slug), slug).toBe(true);
    expect(serviceForLanding("nope")).toBeNull();
  });

  it("sends the topical pages to the matching service", () => {
    expect(serviceForLanding("late-form-5472")).toBe("late-form-5472-filing-service");
    expect(serviceForLanding("form-5472-penalty")).toBe("late-form-5472-filing-service");
    expect(serviceForLanding("diirsp")).toBe("late-form-5472-filing-service");
    expect(serviceForLanding("form-5472-fax-number")).toBe("form-5472-fax-filing-service");
    expect(serviceForLanding("pro-forma-1120")).toBe("pro-forma-1120-filing-service");
    expect(serviceForLanding("foreign-owned-llc-tax")).toBe("foreign-owned-llc-tax-filing-service");
    expect(serviceForLanding("file-form-5472")).toBe("form-5472-filing-service");
  });
});

describe("serviceForBlogTags", () => {
  it("routes by topic tag", () => {
    expect(serviceForBlogTags(["form-5472", "late-filing", "foreign-owned-llc"])).toBe("late-form-5472-filing-service");
    expect(serviceForBlogTags(["form-5472", "penalty"])).toBe("late-form-5472-filing-service");
    expect(serviceForBlogTags(["form-5472", "llc-dissolution", "final-return"])).toBe("final-form-5472-for-dissolved-llc");
    expect(serviceForBlogTags(["form-5472", "dormant-llc", "no-income"])).toBe("form-5472-filing-for-dormant-llc");
    expect(serviceForBlogTags(["form-5472", "how-to", "fax", "irs-ogden"])).toBe("form-5472-fax-filing-service");
    expect(serviceForBlogTags(["form-5472", "pro-forma-1120"])).toBe("pro-forma-1120-filing-service");
    expect(serviceForBlogTags(["partner-program", "form-5472"])).toBe("white-label-form-5472-filing");
    expect(serviceForBlogTags(["us-tax", "foreign-owned-llc"])).toBe("foreign-owned-llc-tax-filing-service");
  });

  it("prefers late-filing over dissolution when both are tagged", () => {
    expect(
      serviceForBlogTags(["form-5472", "administrative-dissolution", "llc-reinstatement", "late-filing"]),
    ).toBe("late-form-5472-filing-service");
  });

  it("matches tags exactly, not by substring", () => {
    expect(serviceForBlogTags(["partnership", "taking-on-a-partner"])).toBeNull();
    expect(serviceForBlogTags(["form-5472", "partnership"])).toBe("form-5472-filing-service");
  });

  it("falls back to the annual filing for generic Form 5472 / foreign-owned LLC posts", () => {
    expect(serviceForBlogTags(["form-5472", "foreign-owned-llc"])).toBe("form-5472-filing-service");
    expect(serviceForBlogTags(["foreign-owned-llc", "recordkeeping"])).toBe("form-5472-filing-service");
  });

  it("gives EIN/ITIN-only posts no card, but keeps it when also tagged form-5472", () => {
    expect(serviceForBlogTags(["itin", "form-w-7"])).toBeNull();
    expect(serviceForBlogTags(["ein", "foreign-owned-llc"])).toBeNull();
    expect(serviceForBlogTags(["itin", "form-5472"])).toBe("form-5472-filing-service");
  });

  it("is null for untagged or unrelated posts and always returns a real service", () => {
    expect(serviceForBlogTags([])).toBeNull();
    expect(serviceForBlogTags(undefined)).toBeNull();
    expect(serviceForBlogTags(["wise", "paypal"])).toBeNull();
    for (const tags of [["late-filing"], ["fax"], ["partner-program"], ["form-5472"], ["us-tax"]]) {
      expect(serviceSlugs.has(serviceForBlogTags(tags) as string)).toBe(true);
    }
  });
});
