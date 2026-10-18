import { describe, expect, it } from "vitest";
import {
  EIN_PRICE_CENTS,
  ITIN_PRICE_CENTS,
  MULTI_YEAR_ADDON_CENTS,
  TIERS,
} from "@/lib/pricing";
import { IRS_OGDEN_FAX } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import {
  ABOUT_LAST_REVIEWED,
  CTA_TEXT,
  KEY_FACTS,
  LEAD,
  SECTIONS,
  STEPS,
  TRUST_LINE,
} from "./content";

const ALL_TEXT = [
  LEAD,
  CTA_TEXT,
  ...KEY_FACTS.flatMap((f) => [f.term, f.detail]),
  ...STEPS.flatMap((s) => [s.title, s.body]),
  ...SECTIONS.flatMap((s) => [s.question, s.answer, ...(s.points ?? []), ...(s.links ?? []).map((l) => l.label)]),
].join("\n");

const words = (text: string) => text.trim().split(/\s+/).length;

describe("/about copy", () => {
  it("leads every section with a question and a standalone answer of at most 60 words", () => {
    for (const section of SECTIONS) {
      expect(section.question, section.id).toMatch(/\?$/);
      expect(words(section.answer), section.id).toBeLessThanOrEqual(60);
      expect(section.answer, section.id).not.toMatch(/:$/);
    }
  });

  it("uses the approved trust line verbatim", () => {
    expect(TRUST_LINE).toBe(
      "Every filing is reviewed by a tax accountant who holds an IRS Preparer Tax Identification Number (PTIN) before it is submitted.",
    );
    expect(LEAD).toContain(TRUST_LINE);
  });

  it("states only prices from pricing.ts", () => {
    const allowed = new Set(
      [TIERS.standard.priceCents, TIERS.express.priceCents, MULTI_YEAR_ADDON_CENTS, EIN_PRICE_CENTS, ITIN_PRICE_CENTS].map(
        formatPrice,
      ),
    );
    const amounts = ALL_TEXT.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d+)?/g) ?? [];
    expect(amounts.length).toBeGreaterThan(0);
    for (const amount of amounts) expect(allowed.has(amount), amount).toBe(true);
  });

  it("makes no credential, approval or outcome claims", () => {
    expect(ALL_TEXT).not.toMatch(/\blicensed\b/i);
    expect(ALL_TEXT).not.toMatch(/IRS[- ]approved/i);
    // "guarantee" only ever appears as "do not guarantee".
    for (const match of Array.from(ALL_TEXT.matchAll(/[^.]*\bguarantee[sd]?\b[^.]*/gi))) {
      expect(match[0]).toMatch(/\bdo not guarantee\b/i);
    }
    expect(ALL_TEXT).not.toMatch(/CP-15\b/);
    // "CPA" only ever appears to say what we are NOT.
    for (const match of Array.from(ALL_TEXT.matchAll(/[^.]*\bCPA\b[^.]*/g))) expect(match[0]).toMatch(/\bnot a CPA firm\b/);
  });

  it("labels the IRS fax number as the IRS's, never ours", () => {
    for (const match of Array.from(ALL_TEXT.matchAll(new RegExp(`[^.]*${IRS_OGDEN_FAX.replace(/[+]/g, "\\+")}[^.]*\\.`, "g")))) {
      expect(match[0]).toMatch(/IRS Ogden PIN Unit/);
    }
  });

  it("carries an ISO review date", () => {
    expect(ABOUT_LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
