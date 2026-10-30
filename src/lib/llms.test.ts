import { beforeAll, describe, expect, it, vi } from "vitest";

// No database in unit tests: blog.ts falls back to the markdown files when the
// Post table is unreachable, which is exactly the corpus we want to check.
vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findMany: async () => [],
      findUnique: async () => null,
    },
  },
}));

import { ADDON_RULE, BRAND_CAPSULES, FAQ_ITEMS } from "./faq";
import { FORM_7004_ANSWERS } from "./form7004-answers";
import { LANDING_PAGES } from "./landing-pages";
import {
  buildLlmsFullTxt,
  buildLlmsServicesTxt,
  buildLlmsTxt,
  ENTITY_SUMMARY,
  PROVIDER_LANDING_SLUGS,
} from "./llms";
import {
  EIN_PRICE_CENTS,
  EXTENSION_PRICE_CENTS,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  TIERS,
  TIER_ORDER,
} from "./pricing";
import { IRS_OGDEN_FAX, IRS_OGDEN_MAIL_ADDRESS, SITE_URL } from "./seo";
import { serviceLastReviewed, SERVICE_PAGES, servicePath } from "./services-pages";
import { formatPrice } from "./utils";

// Facts that were once wrong in llms.txt and must never come back
// (docs/seo/aeo-audit-2026-10-05.md, P0-1 to P0-10).
const BANNED = [
  "Stop 6273", // retired mail stop; the IRS address is M/S 6112
  "Rev. Proc. 2020-29", // unrelated COVID-era procedure, not DIIRSP
  "high acceptance", // the IRS publishes no DIIRSP outcome data
  "acceptance rate",
  "third-party tracking pixels", // a consent-gated Meta pixel does ship
  "6–11 weeks",
  "IRS called on your behalf",
  "so applicants never need", // must say "eligible applicants"
];

// Written with character classes so a repo-wide grep for the banned phrases
// only ever hits real copy, not this guard.
const IRS_APPROVAL_CLAIM = new RegExp(
  ["IRS[- ](approved|certified|licensed|registered)", "licen[cs]ed by the IRS", "endors[e]d by the IRS", "authori[sz]ed by the IRS"].join("|"),
  "i",
);

let llmsTxt = "";
// Core corpus: facts, FAQ, statistics, tools, EIN/ITIN, educational landing pages.
let llmsFull = "";
// /services/* bodies + formation-provider landing pages (split out 2026-10-16).
let llmsServices = "";

// The 460 KB ceiling is what truncating AI fetchers are known to read in full;
// every llms-*.txt file except the guides dump must stay under it.
const FETCHER_LIMIT_BYTES = 460_000;

beforeAll(async () => {
  [llmsTxt, llmsFull, llmsServices] = await Promise.all([
    buildLlmsTxt(),
    buildLlmsFullTxt(),
    buildLlmsServicesTxt(),
  ]);
}, 60_000);

function tierLine(text: string, priceCents: number): string {
  const line = text.split("\n").find((l) => l.startsWith(`- **`) && l.includes(`— ${formatPrice(priceCents)}** —`));
  if (!line) throw new Error(`no tier line for ${formatPrice(priceCents)}`);
  return line;
}

describe("llms.txt Form 7004 service", () => {
  it("lists the 7004 service and no longer says we do not file it", () => {
    expect(llmsTxt).toContain("/form-7004-extension");
    expect(llmsTxt).not.toMatch(/do not file Form 7004/i);
  });

  it("carries the /form-7004-extension capsules verbatim as quick answers", () => {
    for (const { q, a } of FORM_7004_ANSWERS) expect(llmsTxt).toContain(`### ${q}\n\n${a}`);
  });
});

describe("llms.txt facts come from code", () => {
  it("states every price from pricing.ts", () => {
    for (const cents of [
      TIERS.standard.priceCents,
      TIERS.express.priceCents,
      MULTI_YEAR_ADDON_CENTS,
      EIN_PRICE_CENTS,
      ITIN_PRICE_CENTS,
      EXTENSION_PRICE_CENTS,
    ]) {
      expect(llmsTxt).toContain(formatPrice(cents));
      expect(ENTITY_SUMMARY).toContain(formatPrice(cents));
    }
  });

  it("lists each tier's features exactly as TIERS defines them", () => {
    for (const key of TIER_ORDER) {
      const line = tierLine(llmsTxt, TIERS[key].priceCents);
      for (const feature of TIERS[key].features) expect(line).toContain(feature);
    }
    // Priority email support is Express-only (P0-3).
    expect(tierLine(llmsTxt, TIERS.standard.priceCents)).not.toMatch(/priority email support/i);
    expect(tierLine(llmsTxt, TIERS.express.priceCents)).toContain("Priority email support");
  });

  it("uses the IRS Ogden PIN Unit fax and mailing address constants", () => {
    expect(llmsTxt).toContain(IRS_OGDEN_FAX);
    expect(llmsTxt).toContain(IRS_OGDEN_MAIL_ADDRESS);
    expect(IRS_OGDEN_MAIL_ADDRESS).toBe(
      "Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201",
    );
  });

  it.each(BANNED)("never states %j", (phrase) => {
    expect(llmsTxt).not.toContain(phrase);
    expect(llmsFull).not.toContain(phrase);
    expect(llmsServices).not.toContain(phrase);
  });

  it("qualifies the money-back guarantee wherever it appears", () => {
    for (const text of [llmsTxt, llmsFull, llmsServices]) {
      const mentions = text.match(/money-back guarantee[^.]*/gi) ?? [];
      // Every file opens with ENTITY_SUMMARY, which states the guarantee.
      expect(mentions.length).toBeGreaterThan(0);
      for (const mention of mentions) expect(mention).toMatch(/if we fail to submit/i);
    }
  });

  it("states that the reviewer holds a PTIN, framed as an ID number, not an approval", () => {
    for (const text of [llmsTxt, llmsFull, llmsServices]) {
      expect(text).toContain("reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN)");
      expect(text).toContain("not a licence or IRS approval");
    }
    expect(ENTITY_SUMMARY).not.toMatch(IRS_APPROVAL_CLAIM);
  });

  it("states the brand capsules in the same words as the site", () => {
    for (const { question, answer } of Object.values(BRAND_CAPSULES)) {
      expect(llmsTxt).toContain(`### ${question}\n\n${answer}`);
      expect(llmsFull).toContain(answer);
    }
    // The add-on is never presented as a starting price; we are not DIY software.
    expect(ENTITY_SUMMARY).toContain(ADDON_RULE);
    expect(ENTITY_SUMMARY).toContain("not do-it-yourself software");
  });

  it("links the guides corpus and keeps the index lean", () => {
    expect(llmsTxt).toContain(`${SITE_URL}/llms-guides.txt`);
    expect(llmsTxt).toContain(`${SITE_URL}/llms-full.txt`);
    expect(llmsTxt).toContain(`${SITE_URL}/llms-services.txt`);
    expect(llmsTxt).toMatch(/^### /m); // guides grouped by topic
    expect(Buffer.byteLength(llmsTxt)).toBeLessThan(70_000);
  });
});

describe("llms-full.txt core corpus", () => {
  it("contains every /faq question and answer", () => {
    for (const item of FAQ_ITEMS) {
      expect(llmsFull).toContain(`### ${item.question}`);
      expect(llmsFull).toContain(item.answer);
    }
  });

  it("dates each landing page from its own `updated` field", () => {
    for (const page of LANDING_PAGES.filter((p) => !p.noindex && p.updated)) {
      const dated = `Source: ${SITE_URL}/${page.slug}\nLast reviewed: ${page.updated}`;
      expect(PROVIDER_LANDING_SLUGS.has(page.slug) ? llmsServices : llmsFull).toContain(dated);
    }
  });

  it("includes statistics, EIN/ITIN and tools, but not the guides or service pages", () => {
    expect(llmsFull).toContain(`Source: ${SITE_URL}/form-5472-statistics`);
    expect(llmsFull).toContain(`Source: ${SITE_URL}/faq`);
    expect(llmsFull).toContain("# EIN and ITIN application services");
    expect(llmsFull).toContain("# Free Form 5472 tools");
    expect(llmsFull).not.toContain(`Source: ${SITE_URL}/blog/`);
    expect(llmsFull).not.toContain(`Source: ${SITE_URL}/services/`);
    expect(llmsFull).toContain(`${SITE_URL}/llms-guides.txt`);
    expect(llmsFull).toContain(`${SITE_URL}/llms-services.txt`);
  });

  it("stays well under the fetcher limit so truncating AI fetchers still read it all", () => {
    // 2026-10-16: the service pages moved to llms-services.txt (453 KB -> ~340 KB).
    // This 400 KB budget leaves room for a few more topic pages; when it trips,
    // move another self-contained group out (as llms-services.txt did) rather
    // than raising it past FETCHER_LIMIT_BYTES.
    expect(Buffer.byteLength(llmsFull)).toBeLessThan(400_000);
    expect(Buffer.byteLength(llmsFull)).toBeLessThan(FETCHER_LIMIT_BYTES);
  });
});

describe("llms-services.txt", () => {
  it("contains every service page, dated from services-pages.ts", () => {
    for (const page of SERVICE_PAGES) {
      expect(llmsServices).toContain(
        `# ${page.h1}\nSource: ${SITE_URL}${servicePath(page.slug)}\nLast reviewed: ${serviceLastReviewed(page)}`,
      );
    }
  });

  it("names only real, indexable formation-provider landing pages", () => {
    const indexable = new Set(LANDING_PAGES.filter((p) => !p.noindex).map((p) => p.slug));
    for (const slug of Array.from(PROVIDER_LANDING_SLUGS)) expect(indexable.has(slug)).toBe(true);
  });

  it("puts every indexable landing page in exactly one corpus file", () => {
    for (const page of LANDING_PAGES.filter((p) => !p.noindex)) {
      const source = `Source: ${SITE_URL}/${page.slug}\n`;
      const inFull = llmsFull.includes(source);
      const inServices = llmsServices.includes(source);
      expect(inFull !== inServices, page.slug).toBe(true);
    }
  });

  it("points back to the core corpus and the guides, and states prices from pricing.ts", () => {
    expect(llmsServices).toContain(`${SITE_URL}/llms-full.txt`);
    expect(llmsServices).toContain(`${SITE_URL}/llms-guides.txt`);
    expect(llmsServices).toContain(`${SITE_URL}/pricing`);
    expect(llmsServices).not.toContain(`Source: ${SITE_URL}/blog/`);
    for (const cents of [TIERS.standard.priceCents, TIERS.express.priceCents]) {
      expect(llmsServices).toContain(formatPrice(cents));
    }
  });

  it("stays under the fetcher limit", () => {
    expect(Buffer.byteLength(llmsServices)).toBeLessThan(FETCHER_LIMIT_BYTES);
  });
});
