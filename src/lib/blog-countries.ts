// Data for the "Form 5472 by country" hub (/form-5472-by-country): one line per
// country-of-residence guide, grouped by region, with any city guide for that
// country listed under it. Why: the country posts rank (#1-#7 in Moz, Oct 2026)
// but most had 0-2 inbound links, and the paginated /blog pages that used to
// carry them are noindex (page audit 2026-10-30).
import type { PostMeta } from "@/lib/blog";

export const COUNTRY_HUB_PATH = "/form-5472-by-country";

export const REGIONS = ["Europe", "Asia", "Americas", "Middle East and Africa", "Oceania"] as const;
export type Region = (typeof REGIONS)[number];

/** Country key (the <key> in form-5472-<key>-residents-us-llc) -> label and region. */
export const COUNTRIES: Record<string, [label: string, region: Region]> = {
  croatia: ["Croatia", "Europe"],
  estonia: ["Estonia", "Europe"],
  france: ["France", "Europe"],
  "georgia-country": ["Georgia (the country)", "Europe"],
  germany: ["Germany", "Europe"],
  hungary: ["Hungary", "Europe"],
  italy: ["Italy", "Europe"],
  netherlands: ["Netherlands", "Europe"],
  portugal: ["Portugal", "Europe"],
  spain: ["Spain", "Europe"],
  switzerland: ["Switzerland", "Europe"],
  turkey: ["Türkiye", "Europe"],
  uk: ["United Kingdom", "Europe"],
  china: ["China", "Asia"],
  "hong-kong": ["Hong Kong", "Asia"],
  india: ["India", "Asia"],
  "indonesia-bali": ["Indonesia and Bali", "Asia"],
  japan: ["Japan", "Asia"],
  malaysia: ["Malaysia", "Asia"],
  pakistan: ["Pakistan", "Asia"],
  philippines: ["Philippines", "Asia"],
  singapore: ["Singapore", "Asia"],
  "south-korea": ["South Korea", "Asia"],
  taiwan: ["Taiwan", "Asia"],
  thailand: ["Thailand", "Asia"],
  vietnam: ["Vietnam", "Asia"],
  argentina: ["Argentina", "Americas"],
  brazil: ["Brazil", "Americas"],
  canada: ["Canada", "Americas"],
  colombia: ["Colombia", "Americas"],
  "costa-rica": ["Costa Rica", "Americas"],
  mexico: ["Mexico", "Americas"],
  "uae-dubai": ["UAE and Dubai", "Middle East and Africa"],
  nigeria: ["Nigeria", "Middle East and Africa"],
  australia: ["Australia", "Oceania"],
  "new-zealand": ["New Zealand", "Oceania"],
};

/** City digital-nomad guide slug -> city name and the COUNTRIES key it sits under. */
export const CITY_GUIDES: Record<string, [city: string, countryKey: string]> = {
  "bangkok-digital-nomad-llc-transfer-remittance-records": ["Bangkok", "thailand"],
  "chiang-mai-digital-nomad-llc-coworking-owner-paid-costs": ["Chiang Mai", "thailand"],
  "barcelona-digital-nomad-visa-us-llc-tax-election": ["Barcelona", "spain"],
  "buenos-aires-digital-nomad-llc-usd-ars-reconciliation": ["Buenos Aires", "argentina"],
  "dubai-digital-nomad-us-llc-corporate-tax-review-pack": ["Dubai", "uae-dubai"],
  "kuala-lumpur-digital-nomad-cross-year-tax-records": ["Kuala Lumpur", "malaysia"],
  "lisbon-digital-nomad-us-llc-accountant-handoff": ["Lisbon", "portugal"],
  "medellin-digital-nomad-rolling-365-day-tax-log": ["Medellín", "colombia"],
  "mexico-city-digital-nomad-us-llc-work-location-log": ["Mexico City", "mexico"],
  "tbilisi-digital-nomad-georgian-ie-us-llc-records": ["Tbilisi", "georgia-country"],
};

export const countryGuideSlug = (key: string) => `form-5472-${key}-residents-us-llc`;

const HUB_SLUGS = new Set([...Object.keys(COUNTRIES).map(countryGuideSlug), ...Object.keys(CITY_GUIDES)]);

/** True for a post the country hub lists (a country or city residency guide). */
export function isCountryHubPost(slug: string): boolean {
  return HUB_SLUGS.has(slug);
}

export type CountryEntry = { country: string; post: PostMeta; cities: { city: string; post: PostMeta }[] };
export type RegionSection = { region: Region; entries: CountryEntry[] };

/**
 * Published country guides grouped by region (REGIONS order), countries A-Z,
 * each with its published city guides. `posts` is getAllPosts(), so drafts and
 * scheduled posts are already gone; a country whose guide is missing drops out
 * along with its city guides.
 */
export function countryHubSections(posts: PostMeta[]): RegionSection[] {
  const bySlug = new Map(posts.map((post) => [post.slug, post]));
  const cityEntries = Object.entries(CITY_GUIDES);
  return REGIONS.map((region) => ({
    region,
    entries: Object.entries(COUNTRIES)
      .filter(([, [, r]]) => r === region)
      .flatMap(([key, [country]]) => {
        const post = bySlug.get(countryGuideSlug(key));
        if (!post) return [];
        const cities = cityEntries
          .filter(([, [, countryKey]]) => countryKey === key)
          .flatMap(([slug, [city]]) => {
            const cityPost = bySlug.get(slug);
            return cityPost ? [{ city, post: cityPost }] : [];
          })
          .sort((a, b) => a.city.localeCompare(b.city));
        return [{ country, post, cities }];
      })
      .sort((a, b) => a.country.localeCompare(b.country)),
  })).filter((section) => section.entries.length > 0);
}
