import { describe, expect, it } from "vitest";
import {
  EIN_ITIN_LINKS,
  FORMATION_PROVIDER_SLUGS,
  SERVICES_HUB,
  SERVICE_PAGES,
  serviceHubCategories,
  servicePlainBody,
  serviceSitemapEntries,
  toPlainText,
} from "./services-pages";
import { readdirSync } from "node:fs";
import path from "node:path";
import { LANDING_PAGES, getLandingPage } from "./landing-pages";
import { TIERS, MULTI_YEAR_ADDON_CENTS } from "./pricing";
import { formatPrice } from "./utils";

// The compact-keywords on-page checklist (playbook §6), asserted per page.
// Keyword spelling is matched as typed (lower-cased, whitespace-normalised).

// Every top-level marketing route (directories under src/app/(marketing)) plus
// the [seoSlug] landing pages.
const KNOWN_TOP_LEVEL_ROUTES = new Set([
  ...readdirSync(path.join(__dirname, "../app/(marketing)"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("[") && !d.name.startsWith("("))
    .map((d) => d.name),
  ...LANDING_PAGES.filter((p) => !p.noindex).map((p) => p.slug),
]);
const STOPWORDS = new Set(["for", "a", "the", "of", "to", "with"]);
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const words = (s: string) =>
  toPlainText(s)
    .toLowerCase()
    .split(/[^a-z0-9§$.,]+/)
    .map((w) => w.replace(/[.,]+$/g, "").replace(/^[.,]+/g, ""))
    .filter(Boolean);
const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

function firstSentence(markup: string): string {
  const plain = toPlainText(markup).split(/\n\s*\n/)[0];
  return plain.split(/(?<=[.!?])\s+/)[0];
}

function indexOfPhrase(haystack: string[], needle: string[]): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

describe("services pages: on-page rules", () => {
  it("has the 8 pages from docs/seo/keyword-sheet.csv", () => {
    expect(SERVICE_PAGES.map((p) => p.slug).sort()).toEqual(
      [
        "dormant-llc-form-5472-filing",
        "final-form-5472-dissolved-llc",
        "foreign-owned-llc-tax-filing-service",
        "form-5472-fax-filing-service",
        "form-5472-filing-service",
        "late-form-5472-filing-service",
        "pro-forma-1120-filing-service",
        "white-label-form-5472-filing",
      ].sort(),
    );
  });

  for (const page of SERVICE_PAGES) {
    describe(page.slug, () => {
      const kw = norm(page.keyword);

      it("URL contains the keyword's words", () => {
        const slugWords = page.slug.split("-");
        for (const w of kw.split(" ").filter((w) => !STOPWORDS.has(w))) expect(slugWords).toContain(w);
      });

      it("title starts with the keyword and is ≤60 chars", () => {
        expect(norm(page.title).startsWith(kw)).toBe(true);
        expect(page.title.length).toBeLessThanOrEqual(60);
      });

      it("meta description starts with the keyword and is ≤160 chars", () => {
        expect(norm(page.metaDescription).startsWith(kw)).toBe(true);
        expect(page.metaDescription.length).toBeLessThanOrEqual(160);
        expect(page.longDescription.length).toBeGreaterThan(page.metaDescription.length);
      });

      it("H1 contains the keyword in exact word order", () => {
        expect(indexOfPhrase(words(page.h1), kw.split(" "))).toBeGreaterThanOrEqual(0);
      });

      it("keyword starts within the first 6 words of the first sentence", () => {
        const idx = indexOfPhrase(words(firstSentence(page.intro)), kw.split(" "));
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(6);
      });

      it("keyword appears in at least one H2", () => {
        expect(page.sections.some((s) => indexOfPhrase(words(s.heading), kw.split(" ")) >= 0)).toBe(true);
      });

      it("opens with a bold direct answer and has a CTA", () => {
        expect(page.intro).toMatch(/\*\*[^*]{40,}\*\*/);
        expect(page.cta.href).toMatch(page.slug === "white-label-form-5472-filing" ? /^\/partners/ : /^\/start\?src=/);
      });

      it("has a 'what it is not / nobody can promise' section", () => {
        expect(page.sections.some((s) => /\bnot\b|nobody|cannot/i.test(s.heading))).toBe(true);
      });

      it("has 4 FAQs of ≤50 words", () => {
        expect(page.faqs).toHaveLength(4);
        for (const f of page.faqs) expect(wordCount(toPlainText(f.a))).toBeLessThanOrEqual(50);
      });

      it("links to at least 4 related pages, none to itself", () => {
        expect(page.related.length).toBeGreaterThanOrEqual(4);
        expect(page.related.map((r) => r.href)).not.toContain(`/services/${page.slug}`);
        expect(new Set(page.related.map((r) => r.href)).size).toBe(page.related.length);
      });

      it("body is 800–1,200 words", () => {
        const n = wordCount(servicePlainBody(page));
        expect(n).toBeGreaterThanOrEqual(800);
        expect(n).toBeLessThanOrEqual(1200);
      });

      it("follows the copy rules", () => {
        const text = [page.title, page.metaDescription, page.longDescription, page.h1, servicePlainBody(page)].join(" ");
        expect(text).not.toMatch(/\bCPA\b/);
        expect(text).not.toMatch(/licensed|IRS[- ]approved|guarantee|best\b|leading\b/i);
      });

      it("quotes only the prices in pricing.ts", () => {
        const allowed = new Set(
          [
            TIERS.standard.priceCents,
            TIERS.express.priceCents,
            MULTI_YEAR_ADDON_CENTS,
            TIERS.standard.priceCents + MULTI_YEAR_ADDON_CENTS,
            TIERS.standard.priceCents + 2 * MULTI_YEAR_ADDON_CENTS,
          ].map(formatPrice),
        );
        // $25,000 (§6038A(d)) and $20,000,000 (§1.6038A-4(b)(2)(ii)) are statutory, not prices.
        const prices = (servicePlainBody(page).match(/\$\d{1,3}(?:,\d{3})*/g) ?? []).filter(
          (p) => p !== "$25,000" && p !== "$20,000,000",
        );
        for (const p of prices) expect(allowed).toContain(p);
        if (!page.showOffer) expect(prices).toEqual([]);
      });

      it("internal links point at known routes", () => {
        const hrefs: string[] = [];
        const all = [page.intro, ...page.sections.map((s) => s.body), ...page.faqs.map((f) => f.a)].join("\n");
        for (const m of Array.from(all.matchAll(/\]\((\/[^)\s]+)\)/g))) hrefs.push(m[1]);
        for (const r of page.related) hrefs.push(r.href);
        for (const href of hrefs) {
          const path = href.split(/[?#]/)[0];
          if (path.startsWith("/services/")) {
            expect(SERVICE_PAGES.map((p) => `/services/${p.slug}`)).toContain(path);
          } else {
            expect(KNOWN_TOP_LEVEL_ROUTES.has(path.slice(1)), href).toBe(true);
          }
        }
      });
    });
  }

  it("titles and meta descriptions are unique", () => {
    expect(new Set(SERVICE_PAGES.map((p) => p.title)).size).toBe(SERVICE_PAGES.length);
    expect(new Set(SERVICE_PAGES.map((p) => p.metaDescription)).size).toBe(SERVICE_PAGES.length);
  });
});

describe("services hub", () => {
  it("title and meta fit", () => {
    expect(SERVICES_HUB.title.length).toBeLessThanOrEqual(60);
    expect(SERVICES_HUB.metaDescription.length).toBeLessThanOrEqual(160);
    expect(norm(SERVICES_HUB.metaDescription).startsWith(norm(SERVICES_HUB.h1))).toBe(true);
  });

  it("links every service page once, with the child's H1 as anchor", () => {
    const links = serviceHubCategories().flatMap((c) => c.links);
    expect(links).toHaveLength(SERVICE_PAGES.length);
    for (const p of SERVICE_PAGES) {
      expect(links).toContainEqual(expect.objectContaining({ href: `/services/${p.slug}`, label: p.h1 }));
    }
  });

  it("formation-provider pages and EIN/ITIN targets exist and are indexable", () => {
    for (const slug of FORMATION_PROVIDER_SLUGS) {
      const lp = getLandingPage(slug);
      expect(lp, slug).not.toBeNull();
      expect(lp?.noindex).toBeFalsy();
    }
    expect(EIN_ITIN_LINKS.map((l) => l.href)).toEqual(["/ein", "/itin"]);
  });

  it("sitemap rows cover the hub and all 8 pages", () => {
    const rows = serviceSitemapEntries("https://www.example.com", new Date(0));
    expect(rows).toHaveLength(SERVICE_PAGES.length + 1);
    expect(rows[0].url).toBe("https://www.example.com/services");
  });
});
