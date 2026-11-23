import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LOCALIZED_MARKETING_PATHS, localizedPath } from "./config";
import { marketingLanguageAlternates } from "./languageAlternates";
import { SITE_URL } from "@/lib/seo";
import { localizedMetadata } from "@/components/marketing/translation";
import { homeMetadata } from "@/components/marketing/pages/HomePage";
import { pricingMetadata } from "@/components/marketing/pages/PricingPage";
import { servicesMetadata } from "@/components/marketing/pages/ServicesPage";
import { faqMetadata } from "@/components/marketing/pages/FaqPage";
import { penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";

const state = vi.hoisted(() => ({ enabled: true, pathname: "/" }));
vi.mock("./config", async original => ({
  ...await original<typeof import("./config")>(),
  get MARKETING_LOCALES_INDEXABLE() { return state.enabled; },
}));
vi.mock("next/navigation", () => ({ usePathname: () => state.pathname }));
vi.mock("@/lib/stats", () => ({ getConfirmedFilingsCount: async () => 147, formatFilingCount: () => "147" }));
afterEach(() => { state.enabled = true; state.pathname = "/"; });

describe.each([false, true])("real marketing indexing gate: %s", enabled => {
  it("gates the real hreflang helper and all page metadata", () => {
    state.enabled = enabled;
    const metadata = [homeMetadata, pricingMetadata, servicesMetadata, faqMetadata, penaltyMetadata];
    for (const [index, path] of Array.from(LOCALIZED_MARKETING_PATHS.entries())) {
      const languages = enabled ? {
        en: SITE_URL + path, de: SITE_URL + localizedPath("de", path),
        "zh-Hans": SITE_URL + localizedPath("zh-Hans", path), "x-default": SITE_URL + path,
      } : undefined;
      expect(marketingLanguageAlternates(path)).toEqual(languages);
      for (const locale of ["en", "de", "zh-Hans"] as const) {
        for (const meta of [localizedMetadata(locale, path, { title: "Test" }), metadata[index](locale)]) {
          expect(meta.alternates?.languages).toEqual(languages);
          if (locale === "en") continue;
          expect(meta.alternates?.canonical).toBe(SITE_URL + localizedPath(locale, path));
          if (enabled) expect("robots" in meta).toBe(false);
          else expect(meta.robots).toEqual({ index: false, follow: true });
        }
      }
    }
  });

  it("gates English chrome and limits its switcher to the five localized paths", () => {
    state.enabled = enabled;
    for (const path of [...LOCALIZED_MARKETING_PATHS, "/blog", "/blog/a-post", "/ein", "/start", "/pricing/extra"]) {
      state.pathname = path;
      const html = renderToStaticMarkup(<MarketingChrome><p>Content</p></MarketingChrome>);
      const supported = LOCALIZED_MARKETING_PATHS.some(localized => localized === path);
      expect(html.includes('aria-label="Language"'), path).toBe(enabled && supported);
      expect(html.includes('hrefLang="de"'), path).toBe(enabled && supported);
    }
  });
});
