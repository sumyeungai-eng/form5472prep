import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MARKETING_LOCALES_INDEXABLE, LOCALIZED_MARKETING_PATHS } from "./config";
import { marketingLanguageAlternates } from "./languageAlternates";
import { getMarketingMessages } from "./index";
import { HomePage, homeMetadata } from "@/components/marketing/pages/HomePage";
import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
import sitemap from "@/app/sitemap";

vi.mock("@/lib/blog", () => ({ getAllPosts: async () => [] }));
vi.mock("@/lib/stats", () => ({ getConfirmedFilingsCount: async () => 147, formatFilingCount: () => "147" }));

describe("disabled marketing SEO", () => {
  it("disables indexing and hreflang centrally for every localized path", () => {
    expect(MARKETING_LOCALES_INDEXABLE).toBe(false);
    for (const path of LOCALIZED_MARKETING_PATHS) expect(marketingLanguageAlternates(path)).toBeUndefined();
  });

  it.each([
    ["home", HomePage, homeMetadata], ["pricing", PricingPage, pricingMetadata],
    ["services", ServicesPage, servicesMetadata], ["faq", FaqPage, faqMetadata],
    ["penalty", PenaltyPage, penaltyMetadata],
  ] as const)("keeps %s metadata and markup free of hreflang", async (_name, Page, metadata) => {
    for (const locale of ["en", "de", "zh-Hans"] as const) expect(metadata(locale).alternates?.languages).toBeUndefined();
    expect(renderToStaticMarkup(await Page())).not.toMatch(/hrefLang=|hreflang=|lang="(?:de|zh-Hans)"/);
  });

  it("omits every translated URL and language alternate from the sitemap", async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.some(entry => /^\/(?:de|zh-hans)(?:\/|$)/.test(new URL(entry.url).pathname))).toBe(false);
    for (const entry of entries) expect(entry.alternates?.languages).toBeUndefined();
  });

  it.each(["de", "zh-Hans"] as const)("only supplies English marketing messages for %s", locale => {
    expect(getMarketingMessages(locale)).toEqual(getMarketingMessages("en"));
  });
});
