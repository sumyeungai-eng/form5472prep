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

import { FAQ_ITEMS } from "./faq";
import { LANDING_PAGES } from "./landing-pages";
import { buildLlmsFullTxt, buildLlmsTxt, ENTITY_SUMMARY } from "./llms";
import {
  EIN_PRICE_CENTS,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  TIERS,
  TIER_ORDER,
} from "./pricing";
import { IRS_OGDEN_FAX, IRS_OGDEN_MAIL_ADDRESS, SITE_URL } from "./seo";
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

let llmsTxt = "";
let llmsFull = "";
// llms-full.txt minus the /services/* documents. Service-page copy lives in
// services-pages.ts and is policed by services-pages.test.ts; everything else
// in llms-full (facts, FAQ, statistics, tools, EIN/ITIN, landing pages) is
// checked here.
let llmsFullCore = "";

beforeAll(async () => {
  [llmsTxt, llmsFull] = await Promise.all([buildLlmsTxt(), buildLlmsFullTxt()]);
  llmsFullCore = llmsFull
    .split("\n\n---\n\n")
    .filter((doc) => !doc.includes(`Source: ${SITE_URL}/services/`))
    .join("\n\n---\n\n");
}, 60_000);

function tierLine(text: string, priceCents: number): string {
  const line = text.split("\n").find((l) => l.startsWith(`- **`) && l.includes(`— ${formatPrice(priceCents)}** —`));
  if (!line) throw new Error(`no tier line for ${formatPrice(priceCents)}`);
  return line;
}

describe("llms.txt facts come from code", () => {
  it("states every price from pricing.ts", () => {
    for (const cents of [
      TIERS.standard.priceCents,
      TIERS.express.priceCents,
      MULTI_YEAR_ADDON_CENTS,
      EIN_PRICE_CENTS,
      ITIN_PRICE_CENTS,
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
    expect(llmsFullCore).not.toContain(phrase);
  });

  it("qualifies the money-back guarantee wherever it appears", () => {
    for (const text of [llmsTxt, llmsFullCore]) {
      const mentions = text.match(/money-back guarantee[^.]*/gi) ?? [];
      expect(mentions.length).toBeGreaterThan(0);
      for (const mention of mentions) expect(mention).toMatch(/if we fail to submit/i);
    }
  });

  it("links the guides corpus and keeps the index lean", () => {
    expect(llmsTxt).toContain(`${SITE_URL}/llms-guides.txt`);
    expect(llmsTxt).toContain(`${SITE_URL}/llms-full.txt`);
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
      expect(llmsFull).toContain(`Source: ${SITE_URL}/${page.slug}\nLast reviewed: ${page.updated}`);
    }
  });

  it("includes statistics, EIN/ITIN and tools, but not the guides", () => {
    expect(llmsFull).toContain(`Source: ${SITE_URL}/form-5472-statistics`);
    expect(llmsFull).toContain(`Source: ${SITE_URL}/faq`);
    expect(llmsFull).toContain("# EIN and ITIN application services");
    expect(llmsFull).toContain("# Free Form 5472 tools");
    expect(llmsFull).not.toContain(`Source: ${SITE_URL}/blog/`);
    expect(llmsFull).toContain(`${SITE_URL}/llms-guides.txt`);
  });

  it("stays within ~400 KB so truncating AI fetchers still read it all", () => {
    expect(Buffer.byteLength(llmsFull)).toBeLessThan(420_000);
  });
});
