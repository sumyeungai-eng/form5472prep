import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FAQ_CATEGORIES, FAQ_ITEMS } from "./faq";
import { LANDING_PAGES } from "./landing-pages";

const FORBIDDEN_PHRASES = [
  "our CPA",
  "we are a CPA",
  "our CAA",
  "our in-house",
  "we are a Certifying Acceptance Agent",
  "independent CAA",
  "independent agent",
  "IRS-approved",
  "guaranteed acceptance",
];

const ATTRIBUTED_PAGE_SOURCE_PATTERNS = [
  /\bform5472 prep (says|describes|states|notes|explains)\b/i,
  /according to (the|this) site/i,
  /\b(the|this|our) (site|homepage|home page|page|faq|guide|calculator|email|terms|steps|policy)('s)?\b[^.]{0,40}\b(say|says|describe|describes|state|states|note|notes|explain|explains|list|lists|link|links|give|gives|mention|mentions)\b/i,
  /\bon (the|this) site\b/i,
  /\b(the|this) site's\b/i,
  /\bwe describe\b/i,
  /\b(the|this) (ein|itin|contact|pricing|partners?) (page|faq)\b/i,
  /\b(the|this|our) [a-z0-9-]+ (site|homepage|home page|page|faq|guide|calculator|email|terms|steps|policy|section)('s)?\b[^.]{0,40}\b(say|says|describe|describes|state|states|note|notes|explain|explains|list|lists|link|links|give|gives|mention|mentions)\b/i,
  /\b(the|this) source\b[^.]{0,40}\b(say|says|describe|describes|state|states|note|notes|explain|explains|list|lists|link|links|give|gives|mention|mentions)\b/i,
];

const ROOT = process.cwd();
const MARKETING_ROOT = join(ROOT, "src/app/(marketing)");
const APP_ROOT = join(ROOT, "src/app");
const CATEGORY_IDS = new Set(FAQ_CATEGORIES.map((category) => category.id));
const LANDING_SLUGS = new Set(LANDING_PAGES.map((page) => page.slug));

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function normalizeQuestion(value: string): string {
  return value.toLowerCase().trim().replace(/[?.!]+$/, "");
}

function routeExists(href: string): boolean {
  const pathname = href.split(/[?#]/)[0]?.replace(/^\/+|\/+$/g, "") ?? "";
  if (!pathname) return existsSync(join(APP_ROOT, "page.tsx"));
  if (LANDING_SLUGS.has(pathname)) return true;
  return (
    existsSync(join(MARKETING_ROOT, pathname, "page.tsx")) ||
    existsSync(join(APP_ROOT, pathname, "page.tsx"))
  );
}

function sentenceContainingTaxAdvice(value: string): string | null {
  return value
    .split(/[.!?]\s+/)
    .find((sentence) => sentence.toLowerCase().includes("tax advice")) ?? null;
}

function normalizeApostrophes(value: string): string {
  return value.replace(/\u2019/g, "'");
}

describe("central FAQ content", () => {
  it("has complete, categorized items with stable ids", () => {
    for (const item of FAQ_ITEMS) {
      expect(item.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(item.question.trim()).not.toBe("");
      expect(item.answer.trim()).not.toBe("");
      expect(item.source.trim()).not.toBe("");
      expect(CATEGORY_IDS.has(item.category)).toBe(true);
    }
  });

  it("keeps ids and normalized questions unique", () => {
    expect(new Set(FAQ_ITEMS.map((item) => item.id)).size).toBe(FAQ_ITEMS.length);
    expect(new Set(FAQ_ITEMS.map((item) => normalizeQuestion(item.question))).size).toBe(
      FAQ_ITEMS.length,
    );
  });

  it("keeps answers concise enough for answer engines", () => {
    for (const item of FAQ_ITEMS) {
      expect(wordCount(item.answer), item.id).toBeGreaterThanOrEqual(25);
      expect(wordCount(item.answer), item.id).toBeLessThanOrEqual(110);
    }
  });

  it("links only to resolvable internal deep pages", () => {
    for (const item of FAQ_ITEMS) {
      if (!item.learnMore) continue;
      expect(item.learnMore.href, item.id).toMatch(/^\//);
      expect(item.learnMore.href, item.id).not.toBe("/faq");
      expect(routeExists(item.learnMore.href), item.id).toBe(true);
    }
  });

  it("does not use restricted trust or credential language", () => {
    for (const item of FAQ_ITEMS) {
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(item.answer.toLowerCase(), item.id).not.toContain(phrase.toLowerCase());
      }

      const taxAdviceSentence = sentenceContainingTaxAdvice(item.answer);
      if (taxAdviceSentence) {
        expect(taxAdviceSentence.toLowerCase(), item.id).toMatch(/\b(not|do not|don't)\b/);
      }
    }
  });

  it("does not hedge company answers in third person", () => {
    for (const item of FAQ_ITEMS) {
      const normalizedAnswer = normalizeApostrophes(item.answer);

      for (const pattern of ATTRIBUTED_PAGE_SOURCE_PATTERNS) {
        expect.soft(normalizedAnswer, item.id).not.toMatch(pattern);
      }
    }
  });

  it("limits brand-name self-references in answers", () => {
    const brandNameAnswerCount = FAQ_ITEMS.filter((item) =>
      item.answer.includes("Form5472 Prep"),
    ).length;

    expect(brandNameAnswerCount).toBeLessThanOrEqual(2);
  });

  it("describes Certifying Acceptance Agent handling without implying in-house credentialing", () => {
    const item = FAQ_ITEMS.find((faqItem) =>
      faqItem.id.includes("certifying-acceptance-agent"),
    );

    expect(item).toBeDefined();
    expect(item?.answer, item?.id).toMatch(/forward/i);
    expect(item?.answer, item?.id).not.toMatch(/our CAA|our own CAA|in-house/i);
  });

  it("states the non-CPA boundary and keeps balanced coverage", () => {
    expect(FAQ_ITEMS.some((item) => item.answer.includes("not a CPA firm"))).toBe(true);
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(35);
    expect(FAQ_ITEMS.length).toBeLessThanOrEqual(55);

    for (const category of FAQ_CATEGORIES) {
      expect(
        FAQ_ITEMS.filter((item) => item.category === category.id).length,
        category.id,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it("marks a bounded set of speakable answers", () => {
    const count = FAQ_ITEMS.filter((item) => item.speakable).length;
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(8);
  });
});
