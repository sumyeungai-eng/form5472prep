import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { HomePage, homeMetadata } from "@/components/marketing/pages/HomePage";
import { PricingPage, pricingMetadata } from "@/components/marketing/pages/PricingPage";
import { ServicesPage, servicesMetadata } from "@/components/marketing/pages/ServicesPage";
import { FaqPage, faqMetadata } from "@/components/marketing/pages/FaqPage";
import { PenaltyPage, penaltyMetadata } from "@/components/marketing/pages/PenaltyPage";
import { LocalizedMarketingLayout } from "@/components/marketing/LocalizedMarketingLayout";
import { localizedPath } from "./config";
import { SITE_URL, ORG_ID } from "@/lib/seo";

vi.mock("@/lib/stats", () => ({ getConfirmedFilingsCount: async () => 147, formatFilingCount: () => "147" }));
const navigation = vi.hoisted(() => ({ pathname: "/de/pricing" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname }));
beforeAll(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-23T12:00:00Z")); });
afterAll(() => vi.useRealTimers());

const pages = [
  ["/", HomePage, homeMetadata], ["/pricing", PricingPage, pricingMetadata],
  ["/services", ServicesPage, servicesMetadata], ["/faq", FaqPage, faqMetadata],
  ["/form-5472-penalty-calculator", PenaltyPage, penaltyMetadata],
] as const;
const textOf = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

describe.each(["de", "zh-Hans"] as const)("%s public marketing routes", locale => {
  it.each(pages)("%s renders with matching visible FAQ schema and gated metadata", async (path, Page, metadata) => {
    const html = renderToStaticMarkup(await Page({ locale }));
    expect(html).not.toMatch(/(?:home|pricing|services|faq|penalty|shared)\.s\d{3}/);
    const visible = textOf(html.replace(/<script[\s\S]*?<\/script>/g, ""));
    const headings = new Set(Array.from(html.matchAll(/<(h2|h3|dt|summary)\b[^>]*>([\s\S]*?)<\/\1>/g), match => textOf(match[2]).replace(/[▾+]$/, "").trim()));
    const schemas = Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1]));
    const faqs = schemas.filter(node => node["@type"] === "FAQPage");
    expect(faqs).toHaveLength(1);
    expect(faqs[0].mainEntity.length).toBeGreaterThanOrEqual(3);
    expect(faqs[0].inLanguage).toBe(locale);
    for (const question of faqs[0].mainEntity) {
      expect(headings.has(question.name), question.name).toBe(true);
      expect(visible.includes(question.acceptedAnswer.text), question.acceptedAnswer.text).toBe(true);
    }
    expect(JSON.stringify(schemas)).not.toContain('"@type":"Organization"');
    // Shared organization identity is retained rather than localized.
    if (path !== "/faq") expect(JSON.stringify(schemas)).toContain(ORG_ID);
    const meta = metadata(locale);
    expect(meta.alternates?.canonical).toBe(SITE_URL + localizedPath(locale, path));
    expect(meta.alternates?.languages).toBeUndefined();
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.openGraph).toHaveProperty("locale", locale === "de" ? "de_DE" : "zh_CN");
    if (path === "/form-5472-penalty-calculator") {
      expect(html).not.toContain("/embed/form-5472-penalty-calculator");
      expect(html).toContain(new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(25000).replace(/\u00a0/g, " "));
    }
  });
  it("wraps the chrome and page in the language and links to the same page", () => {
    navigation.pathname = localizedPath(locale, "/pricing");
    const html = renderToStaticMarkup(<LocalizedMarketingLayout locale={locale}><p>Page content</p></LocalizedMarketingLayout>);
    expect(html.startsWith(`<div lang="${locale}">`)).toBe(true);
    for (const path of ["/pricing", "/de/pricing", "/zh-hans/pricing"]) expect(html).toContain(`href="${path}"`);
    expect(html).toContain(locale === "de" ? "Maßgeblich ist die englische Fassung" : "以英文版本为准");
  });
});
