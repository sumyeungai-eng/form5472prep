import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import en from "./en.json";
import { messageFacts } from "./facts";
import { HomePage, homeMetadata } from "@/components/marketing/pages/HomePage";
import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
import { MarketingChrome } from "@/components/marketing/MarketingChrome";
import { SERVICE_PAGES, servicePath } from "@/lib/services-pages";

const { sources } = vi.hoisted(() => ({ sources: new Map<string, Set<string>>() }));
vi.mock("@/lib/stats", () => ({ getConfirmedFilingsCount: async () => 147, formatFilingCount: () => "147" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/de" }));
vi.mock("@/components/marketing/translation", async original => {
  const actual = await original<typeof import("@/components/marketing/translation")>();
  // Observe the real page call sites, including nested data and new fields.
  function record(key: string, value: unknown) {
    if (typeof value === "string") {
      const values = sources.get(key) ?? new Set<string>();
      values.add(value);
      sources.set(key, values);
    } else if (value && typeof value === "object") {
      for (const [field, item] of Object.entries(value)) record(`${key}.${field}`, item);
    }
  }
  return {
    ...actual,
    catalogText: (...args: Parameters<typeof actual.catalogText>) => {
      record(args[2], args[3]);
      return actual.catalogText(...args);
    },
    translateData: <T,>(...args: Parameters<typeof actual.translateData<T>>) => {
      record(args[2], args[3]);
      return actual.translateData(...args);
    },
  };
});

function englishAt(key: string): unknown {
  return key.split(".").reduce<unknown>((node, field) =>
    node && typeof node === "object" ? (node as Record<string, unknown>)[field] : undefined, en);
}

beforeEach(() => sources.clear());
describe("code-owned marketing source parity", () => {
  it("matches every catalog-backed source on all five pages and shared chrome", async () => {
    for (const [Page, metadata] of [
      [HomePage, homeMetadata], [PricingPage, pricingMetadata],
      [ServicesPage, servicesMetadata], [FaqPage, faqMetadata], [PenaltyPage, penaltyMetadata],
    ] as const) {
      renderToStaticMarkup(await Page({ locale: "de" }));
      metadata("de");
    }
    renderToStaticMarkup(<MarketingChrome locale="de"><p>Content</p></MarketingChrome>);

    for (const [key, values] of Array.from(sources)) {
      let catalogKey = key;
      // The services page replaces category link prose using service keys,
      // rather than translating it under the category's array position.
      const link = key.match(/^(services\.categories\.\d+\.links\.\d+)\.(label|blurb)$/);
      if (link) {
        const href = Array.from(sources.get(`${link[1]}.href`) ?? [])[0];
        const service = SERVICE_PAGES.find(page => servicePath(page.slug) === href);
        expect(service, key).toBeDefined();
        catalogKey = `services.pages.${service!.slug}.${link[2] === "label" ? "h1" : "shortBlurb"}`;
      }
      for (const source of Array.from(values)) {
        const template = messageFacts(source).template;
        // These leaves deliberately bypass the catalog: structural fields,
        // source annotations, bare prices and blank table headers.
        if (englishAt(catalogKey) === undefined) {
          if (source === "" || /\.(id|href)$/.test(key) || /^shared\.serviceFaqs\.\d+\.(category|source)$/.test(key)) continue;
          if (/^\{amount\d+\}(?:[ –-]+\{amount\d+\})*$/.test(template)) continue;
        }
        expect(typeof englishAt(catalogKey), `Missing catalog: ${catalogKey}`).toBe("string");
        expect(template, `${key} -> ${catalogKey}`).toBe(englishAt(catalogKey));
      }
    }
    expect(sources.has("faq.items.standard-vs-express.a")).toBe(true);
    for (const prefix of ["shared.tiers.", "shared.capsules.", "shared.comparison.", "shared.serviceFaqs.", "faq.items.", "faq.categories.", "services.hub.", "services.identifiers.", "services.categories.", "services.pages.", "services.formation."]) {
      expect(Array.from(sources.keys()).some(key => key.startsWith(prefix)), prefix).toBe(true);
    }
  });
});

// Keep translated behavior covered while the production switch is disabled.
vi.mock("@/config/i18n-switch.mjs", async original => ({
  ...await original<typeof import("@/config/i18n-switch.mjs")>(), I18N_ENABLED: true,
}));
