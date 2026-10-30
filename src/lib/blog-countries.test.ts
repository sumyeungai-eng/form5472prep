import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { PostMeta } from "./blog";
import { CITY_GUIDES, COUNTRIES, countryGuideSlug, countryHubSections, isCountryHubPost } from "./blog-countries";

function post(slug: string): PostMeta {
  return { slug, title: slug, description: slug, date: "2026-09-01", tags: [], readingMinutes: 5, image: "/x.jpg", imageAlt: "" };
}

const slugs = readdirSync(path.join(process.cwd(), "content/blog")).map((f) => f.replace(/\.md$/, ""));

describe("country hub data", () => {
  it("covers every country and city residency guide in content/blog", () => {
    const countryFiles = slugs.filter((s) => s.endsWith("-residents-us-llc"));
    const cityFiles = slugs.filter((s) => /^[a-z]+(?:-[a-z]+)?-digital-nomad-/.test(s));
    expect(countryFiles.filter((s) => !isCountryHubPost(s))).toEqual([]);
    expect(cityFiles.filter((s) => !isCountryHubPost(s))).toEqual([]);
  });

  it("points only at posts that exist and city guides at known countries", () => {
    const missing = [...Object.keys(COUNTRIES).map(countryGuideSlug), ...Object.keys(CITY_GUIDES)].filter(
      (s) => !slugs.includes(s),
    );
    expect(missing).toEqual([]);
    expect(Object.values(CITY_GUIDES).filter(([, key]) => !(key in COUNTRIES))).toEqual([]);
  });
});

describe("countryHubSections", () => {
  it("groups by region in order, sorts countries A-Z and nests city guides", () => {
    const posts = [
      post("form-5472-spain-residents-us-llc"),
      post("form-5472-france-residents-us-llc"),
      post("form-5472-vietnam-residents-us-llc"),
      post("barcelona-digital-nomad-visa-us-llc-tax-election"),
      post("form-5472-cost"),
    ];
    const sections = countryHubSections(posts);
    expect(sections.map((s) => s.region)).toEqual(["Europe", "Asia"]);
    expect(sections[0].entries.map((e) => e.country)).toEqual(["France", "Spain"]);
    expect(sections[0].entries[1].cities.map((c) => c.city)).toEqual(["Barcelona"]);
    expect(sections[1].entries.map((e) => e.post.slug)).toEqual(["form-5472-vietnam-residents-us-llc"]);
  });

  it("drops unpublished guides and a city guide whose country guide is missing", () => {
    expect(countryHubSections([post("lisbon-digital-nomad-us-llc-accountant-handoff")])).toEqual([]);
  });
});
