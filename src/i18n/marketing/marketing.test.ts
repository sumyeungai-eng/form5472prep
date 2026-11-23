import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import en from "./en.json";
import de from "./de.json";
import zh from "./zh-Hans.json";
import { getMarketingMessages, getMarketingTranslator } from "./index";
import { localizedPath, marketingLanguageAlternates } from "./config";
import { TIERS, STANDARD_TURNAROUND, EXPRESS_TURNAROUND, MULTI_YEAR_ADDON_CENTS } from "@/lib/pricing";
import { formatPrice } from "@/lib/utils";

function flatten(value: object, prefix = ""): Record<string, string> {
  return Object.fromEntries(Object.entries(value).flatMap(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof item === "string" ? [[path, item]] : Object.entries(flatten(item, path));
  }));
}
const english = flatten(en);
const placeholders = (text: string) => Array.from(new Set(Array.from(text.matchAll(/\{(\w+)(?:\}|,)/g), m => m[1]))).sort();
const tags = (text: string) => Array.from(new Set(Array.from(text.matchAll(/<\/?([A-Za-z][\w-]*)\s*\/?\s*>/g), m => m[1]))).sort();

describe("marketing catalog contracts", () => {
  it.each([["de", de], ["zh-Hans", zh]] as const)("%s has all keys, placeholders and rich tags", (_locale, catalog) => {
    const translated = flatten(catalog);
    expect(Object.keys(translated).sort()).toEqual(Object.keys(english).sort());
    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(translated[key]), key).toEqual(placeholders(text));
      expect(tags(translated[key]), key).toEqual(tags(text));
    }
  });
  it.each([["en", en], ["de", de], ["zh-Hans", zh]] as const)("%s keeps facts out of prose and every message renders", (locale, catalog) => {
    const errors: unknown[] = [];
    const strict = createTranslator({ locale, messages: catalog, onError: error => { errors.push(error); } });
    const t = getMarketingTranslator(locale);
    for (const [key, text] of Object.entries(flatten(catalog))) {
      expect(text, key).not.toMatch(/\$|USD/);
      expect(text, key).not.toMatch(/\d[\s-]*(?:day|Tag|天)/i);
      const values = Object.fromEntries(placeholders(text).map(name => [name,
        /days|period|grace|minutes/.test(name) ? STANDARD_TURNAROUND.match(/\d+/)![0] :
        name === "value3" ? EXPRESS_TURNAROUND :
        name === "amount3" ? formatPrice(MULTI_YEAR_ADDON_CENTS) : formatPrice(TIERS.standard.priceCents),
      ]));
      expect(() => t(key, values), key).not.toThrow();
      expect(strict(key, values), key).not.toBe(key);
    }
    expect(errors.map(String)).toEqual([]);
  });
  it.each([["de", de], ["zh-Hans", zh]] as const)("%s uses permitted professional wording", (_locale, catalog) => {
    for (const [key, text] of Object.entries(flatten(catalog))) {
      expect(text, key).not.toMatch(/Steuerberater|expert-comptable|注册会计师|註冊會計師|保证|保證|garantiert|zugelassen|licensed|certified|IRS-approved/i);
    }
  });
  it("falls back to English for missing and malformed messages", () => {
    const original = de.home.s050;
    try {
      de.home.s050 = "{invalid";
      expect(getMarketingTranslator("de")("home.s050")).toBe(en.home.s050);
      // Missing values also resolve through the English catalog.
      Reflect.deleteProperty(de.home, "s050");
      expect(getMarketingMessages("de").home.s050).toBe(en.home.s050);
    } finally { de.home.s050 = original; }
  });
  it("also recovers malformed calculator messages before the client provider", () => {
    const original = de.penalty.calculator.s001;
    try {
      de.penalty.calculator.s001 = "{invalid";
      expect(getMarketingMessages("de").penalty.calculator.s001).toBe(en.penalty.calculator.s001);
    } finally { de.penalty.calculator.s001 = original; }
  });
  it("localizes only supported routes and leaves the indexing gate closed", () => {
    expect(localizedPath("de", "/")).toBe("/de");
    expect(localizedPath("zh-Hans", "/faq")).toBe("/zh-hans/faq");
    expect(localizedPath("de", "/start")).toBe("/start");
    expect(localizedPath("en", "/pricing")).toBe("/pricing");
    expect(marketingLanguageAlternates("/pricing")).toBeUndefined();
  });
});
