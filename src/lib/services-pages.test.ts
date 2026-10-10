import { describe, expect, it } from "vitest";
import {
  EIN_ITIN_LINKS,
  FORMATION_PROVIDER_SLUGS,
  SERVICES_HUB,
  SERVICE_PAGES,
  serviceHowTo,
  serviceHubCategories,
  servicePlainBody,
  serviceSitemapEntries,
  toPlainText,
} from "./services-pages";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { LANDING_PAGES, getLandingPage } from "./landing-pages";
import { TIERS, MULTI_YEAR_ADDON_CENTS, STANDARD_TURNAROUND, EXPRESS_TURNAROUND } from "./pricing";
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
// The four short audience pages (docs/seo/audience-keywords-2026-10-05.md):
// 400–700 words instead of 800–1,200.
const AUDIENCE_PAGES = new Set([
  "hire-someone-to-file-form-5472",
  "form-5472-preparer",
  "form-5472-for-accountants",
  "form-5472-for-bookkeepers",
]);
const wordCount = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;

function firstSentence(markup: string): string {
  const plain = toPlainText(markup).split(/\n\s*\n/)[0];
  return plain.split(/(?<=[.!?])\s+/)[0];
}

// Answer-engine contract: the first block under each H2 is a standalone answer
// ("capsule"): a prose paragraph, 12-60 words, that is not a list, does not end
// on a colon and does not point elsewhere ("This ...", "Here ...", "Below ...").
const plain = (s: string) => s.replace(/\[([^\]]+)\]\((\/[^)\s]*)\)/g, "$1").replace(/\*\*/g, "");
const firstBlock = (body: string) => body.split(/\n\s*\n/)[0].trim();
const LIST_START = /^(?:[-•–]|\d+\.)\s/;
const POINTER_START = /^(this|these|here|below|everything below|have these)\b/i;

function indexOfPhrase(haystack: string[], needle: string[]): number {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

describe("services pages: on-page rules", () => {
  it("has the 8 keyword-sheet pages plus the 4 audience pages", () => {
    expect(SERVICE_PAGES.map((p) => p.slug).sort()).toEqual(
      [
        "form-5472-filing-for-dormant-llc",
        "final-form-5472-for-dissolved-llc",
        "foreign-owned-llc-tax-filing-service",
        "form-5472-fax-filing-service",
        "form-5472-filing-service",
        "late-form-5472-filing-service",
        "pro-forma-1120-filing-service",
        "white-label-form-5472-filing",
        "hire-someone-to-file-form-5472",
        "form-5472-preparer",
        "form-5472-for-accountants",
        "form-5472-for-bookkeepers",
      ].sort(),
    );
  });

  it("hero images are unique per page", () => {
    const srcs = SERVICE_PAGES.map((p) => p.heroImage.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  for (const page of SERVICE_PAGES) {
    describe(page.slug, () => {
      const kw = norm(page.keyword);

      it("URL contains the keyword's words", () => {
        const slugWords = page.slug.split("-");
        for (const w of kw.split(" ").filter((w) => !STOPWORDS.has(w))) expect(slugWords).toContain(w);
      });

      it("has a hero image: file exists, name carries the slug, alt carries the keyword", () => {
        const { src, alt } = page.heroImage;
        expect(src.startsWith("/services/")).toBe(true);
        const file = path.join(__dirname, "../../public", src);
        expect(existsSync(file)).toBe(true);
        expect(statSync(file).size).toBeLessThan(120 * 1024);
        expect(path.basename(src)).toMatch(new RegExp(`^services_${page.slug}_[a-z0-9-]+\\.webp$`));
        expect(norm(alt)).toContain(kw);
        expect(alt.length).toBeLessThanOrEqual(125);
      });

      it("title starts with the keyword and is ≤60 chars", () => {
        expect(norm(page.title).startsWith(kw)).toBe(true);
        expect(page.title.length).toBeLessThanOrEqual(60);
      });

      it("meta description starts with the keyword and is ≤160 chars", () => {
        expect(norm(page.metaDescription).startsWith(kw)).toBe(true);
        expect(page.metaDescription.length).toBeLessThanOrEqual(160);
        expect(page.longDescription.length).toBeGreaterThan(page.metaDescription.length);
        if (AUDIENCE_PAGES.has(page.slug)) {
          expect(page.metaDescription.length).toBeGreaterThanOrEqual(120);
          expect(page.metaDescription.length).toBeLessThanOrEqual(155);
        }
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
        expect(page.cta.href).toMatch(page.category === "partners" ? /^\/partners/ : /^\/start\?src=/);
      });

      it("every section H2 is a question that ends in '?'", () => {
        for (const s of page.sections) expect(s.heading, s.heading).toMatch(/\?$/);
        for (const f of page.faqs) expect(f.q, f.q).toMatch(/\?$/);
      });

      it("every section opens with a standalone answer of 12-60 words", () => {
        for (const s of page.sections) {
          const first = firstBlock(s.body);
          expect(first, `${s.heading}: opens with a list`).not.toMatch(LIST_START);
          expect(first, `${s.heading}: ends on a colon`).not.toMatch(/:\s*$/);
          expect(first, `${s.heading}: opens with a pointer`).not.toMatch(POINTER_START);
          const n = wordCount(plain(first));
          expect(n, `${s.heading}: ${n} words`).toBeGreaterThanOrEqual(12);
          expect(n, `${s.heading}: ${n} words`).toBeLessThanOrEqual(60);
        }
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

      const [minWords, maxWords] = AUDIENCE_PAGES.has(page.slug) ? [400, 700] : [800, 1200];
      it(`body is ${minWords}–${maxWords} words`, () => {
        const n = wordCount(servicePlainBody(page));
        expect(n).toBeGreaterThanOrEqual(minWords);
        expect(n).toBeLessThanOrEqual(maxWords);
      });

      it("follows the copy rules", () => {
        let text = [page.title, page.metaDescription, page.longDescription, page.h1, servicePlainBody(page)].join(" ");
        // "CPA firms" is allowed only as an audience word on the accountants page.
        if (page.slug === "form-5472-for-accountants") text = text.replace(/\bCPA firms\b/g, "");
        expect(text).not.toMatch(/\bCPA\b/);
        expect(text).not.toMatch(/licensed|IRS[- ]approved|guarantee|best\b|leading\b|enrolled agent|US-based|#1\b/i);
        // We never sign for the client.
        expect(text).not.toMatch(/\bwe sign\b|\bwe will sign\b|sign on your behalf/i);
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
      });

      // Every page, partner pages included, states both plans' prices and
      // turnarounds so an answer engine can quote them from this page alone.
      it("states the Standard and Express prices and turnarounds", () => {
        const body = servicePlainBody(page);
        expect(body).toContain(formatPrice(TIERS.standard.priceCents));
        expect(body).toContain(formatPrice(TIERS.express.priceCents));
        expect(body).toContain(STANDARD_TURNAROUND);
        expect(body).toContain(EXPRESS_TURNAROUND);
      });

      it("shows the IRS Ogden mailing address only in its current form", () => {
        const text = servicePlainBody(page);
        expect(text).not.toMatch(/6273/);
        if (/1973 Rulon White/.test(text)) {
          expect(text).toContain("Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201");
        }
      });

      it("links out to at least 2 distinct official IRS pages", () => {
        const urls = page.irsSources.map((s) => s.url);
        expect(new Set(urls).size).toBe(urls.length);
        expect(urls.length).toBeGreaterThanOrEqual(2);
        for (const s of page.irsSources) {
          expect(s.url, s.label).toMatch(/^https:\/\/www\.irs\.gov\/[a-z0-9\-/_.]+$/);
          expect(s.label.length).toBeGreaterThan(10);
          expect(s.blurb.length).toBeGreaterThan(20);
        }
        // Copy rules apply to the outbound-link copy too.
        const copy = page.irsSources.map((s) => `${s.label} ${s.blurb}`).join(" ");
        expect(copy).not.toMatch(/\bCPA\b|licensed|IRS[- ]approved|guarantee/i);
      });

      it("HowTo steps come only from a real numbered list on the page", () => {
        const howTo = serviceHowTo(page);
        const hasList = page.sections.some((s) => /^\s*1\.\s/m.test(s.body));
        expect(howTo !== null).toBe(hasList);
        if (!howTo) return;
        expect(page.sections.map((s) => s.heading)).toContain(howTo.heading);
        expect(howTo.steps.length).toBeGreaterThanOrEqual(2);
        for (const step of howTo.steps) {
          expect(step.name.length).toBeGreaterThan(0);
          expect(step.text).not.toMatch(/\*\*/);
        }
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
  it("opens with a capsule that states both prices, at most 60 words", () => {
    expect(SERVICES_HUB.intro).toContain(formatPrice(TIERS.standard.priceCents));
    expect(SERVICES_HUB.intro).toContain(formatPrice(TIERS.express.priceCents));
    expect(wordCount(SERVICES_HUB.intro)).toBeLessThanOrEqual(60);
  });

  it("category H2s are questions and each opens with a standalone answer", () => {
    for (const c of serviceHubCategories()) {
      expect(c.heading, c.heading).toMatch(/\?$/);
      expect(c.description, c.heading).not.toMatch(POINTER_START);
      expect(wordCount(c.description), c.heading).toBeLessThanOrEqual(60);
    }
  });

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

  it("sitemap rows cover the hub and every page", () => {
    const rows = serviceSitemapEntries("https://www.example.com", new Date(0));
    expect(rows).toHaveLength(SERVICE_PAGES.length + 1);
    expect(rows[0].url).toBe("https://www.example.com/services");
  });

  it("pages carry their own sitemap date; the hub takes the newest", () => {
    const base = new Date("2026-10-01T00:00:00Z");
    const rows = serviceSitemapEntries("https://www.example.com", base);
    const at = (slug: string) => rows.find((r) => r.url.endsWith(`/services/${slug}`))?.lastModified.toISOString();
    // Audience pages went live 2026-10-05; the Moz keyword-gap pass edited
    // two of them (plus two original pages) on 2026-10-06.
    for (const slug of ["form-5472-for-bookkeepers", "hire-someone-to-file-form-5472"]) {
      expect(at(slug), slug).toBe("2026-10-05T00:00:00.000Z");
    }
    for (const slug of [
      "form-5472-preparer",
      "form-5472-for-accountants",
      "form-5472-filing-service",
      "late-form-5472-filing-service",
    ]) {
      expect(at(slug), slug).toBe("2026-10-06T00:00:00.000Z");
    }
    expect(at("foreign-owned-llc-tax-filing-service")).toBe(base.toISOString());
    expect(rows[0].lastModified.toISOString()).toBe("2026-10-06T00:00:00.000Z");
  });
});
