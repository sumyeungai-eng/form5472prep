import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, LOCALE_LABELS, localeFromAcceptLanguage, localeFromCountry, normalizeLocale } from "./locales";

describe("portal locale normalization", () => {
  it.each([
    [undefined, "en"], [null, "en"], ["", "en"], ["unknown", "en"], ["EN-us", "en"],
    ["zh-TW", "zh-Hant"], ["zh-HK", "zh-Hant"], ["zh-MO", "zh-Hant"],
    ["zh-Hant-TW", "zh-Hant"], ["zh-Hant", "zh-Hant"], ["zh-Hans", "zh-Hans"],
    ["zh-CN", "zh-Hans"], ["zh-SG", "zh-Hans"], ["zh", "zh-Hans"],
    [" DE-at ", "de"], ["fr-CA", "fr"], ["es-MX", "es"], ["deceptive", "en"],
  ])("normalizes %s to %s", (input, expected) => expect(normalizeLocale(input)).toBe(expected));

  it("has a native label for every locale", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect(Object.keys(LOCALE_LABELS).sort()).toEqual([...LOCALES].sort());
  });
});

describe("Accept-Language", () => {
  it.each([
    [undefined, "en"], [null, "en"], ["", "en"], ["*", "en"], ["ja,ko;q=0.8", "en"],
    ["en;q=0.3,zh-TW;q=0.9,de;q=0.5", "zh-Hant"],
    ["es-MX;q=0.2,fr-FR;q=0.8,de;q=0.9", "de"],
    ["en-US,en;q=0.8,fr;q=0.5", "en"], ["ja,en;q=0.8,fr;q=0.5", "en"],
    ["es;q=0,fr;q=0.2", "fr"], ["de;q=invalid,fr;q=0.3", "fr"],
    ["de;q=2,es;q=-1,fr;q=0", "en"], ["zh-HK; Q = 0.8, en; q=0.7", "zh-Hant"],
    ["es;q=0.7,fr;q=0.7", "es"],
  ])("selects %s → %s", (input, expected) => expect(localeFromAcceptLanguage(input)).toBe(expected));
});

describe("owner country defaults", () => {
  it.each([
    ["China", "zh-Hans"], ["cn", "zh-Hans"], ["Singapore", "zh-Hans"], ["SG", "zh-Hans"],
    ["Hong Kong", "zh-Hant"], ["hk", "zh-Hant"], ["Taiwan", "zh-Hant"], ["TW", "zh-Hant"],
    ["Macau", "zh-Hant"], ["Macao", "zh-Hant"], ["MO", "zh-Hant"],
    ["Germany", "de"], ["AT", "de"], ["Liechtenstein", "de"],
    ["France", "fr"], ["be", "fr"], ["Luxembourg", "fr"],
    ["Spain", "es"], ["Mexico", "es"], ["AR", "es"], ["Dominican Republic", "es"],
    ["  colombia  ", "es"], ["Peru", "es"], ["Puerto Rico", "es"],
    ["Brazil", "en"], ["BR", "en"], ["United States", "en"], ["United Kingdom", "en"],
    [null, "en"], [undefined, "en"], ["", "en"], ["__proto__", "en"], ["constructor", "en"],
  ])("maps %s → %s", (input, expected) => expect(localeFromCountry(input)).toBe(expected));
});
