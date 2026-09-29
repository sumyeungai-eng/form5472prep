import { describe, expect, it } from "vitest";
import {
  convert,
  findCurrency,
  isConversionDirection,
  rateFor,
  searchCurrencies,
} from "./convert";
import { EXCHANGE_RATES, SOURCE_TYPOS, YEARS } from "./data";

describe("convert — to-usd direction", () => {
  it("divides the foreign amount by the rate (IRS-style pin: 0.8-ish GBP/USD)", () => {
    // United Kingdom, 2022 rate is 0.811 GBP per USD (published exactly).
    // 811 GBP / 0.811 = 1,000.00 USD exactly — a clean pin using real data.
    const result = convert({ code: "GBP", year: 2022, amount: 811, direction: "to-usd" });
    expect(result).not.toBeNull();
    expect(result?.result).toBe(1000);
    expect(result?.rate).toBe(0.811);
    expect(result?.formula).toContain("811.00 GBP");
    expect(result?.formula).toContain("1,000.00 USD");
  });

  it("rounds to cents", () => {
    // Canada 2025: 1.398 CAD per USD. 100 / 1.398 = 71.5307... -> 71.53
    const result = convert({ code: "CAD", year: 2025, amount: 100, direction: "to-usd" });
    expect(result?.result).toBe(71.53);
  });

  it("handles a flat/pegged currency across years", () => {
    const result = convert({ code: "BHD", year: 2021, amount: 37.7, direction: "to-usd" });
    expect(result?.result).toBe(100);
  });
});

describe("convert — from-usd direction", () => {
  it("multiplies the USD amount by the rate", () => {
    const result = convert({ code: "GBP", year: 2022, amount: 1000, direction: "from-usd" });
    expect(result).not.toBeNull();
    expect(result?.result).toBe(811);
    expect(result?.formula).toContain("1,000.00 USD");
    expect(result?.formula).toContain("811.00 GBP");
  });

  it("rounds to cents", () => {
    const result = convert({ code: "JPY", year: 2025, amount: 10, direction: "from-usd" });
    // 149.632 * 10 = 1496.32
    expect(result?.result).toBe(1496.32);
  });
});

describe("convert — invalid input", () => {
  it("returns null for an unknown currency code", () => {
    expect(convert({ code: "ZZZ", year: 2025, amount: 100, direction: "to-usd" })).toBeNull();
  });

  it("returns null for a year the IRS page does not publish", () => {
    expect(convert({ code: "GBP", year: 2019, amount: 100, direction: "to-usd" })).toBeNull();
  });

  it("returns null for a negative amount", () => {
    expect(convert({ code: "GBP", year: 2025, amount: -5, direction: "to-usd" })).toBeNull();
  });

  it("returns null for a non-finite amount", () => {
    expect(convert({ code: "GBP", year: 2025, amount: Number.NaN, direction: "to-usd" })).toBeNull();
  });

  it("allows a zero amount and returns a zero result", () => {
    const result = convert({ code: "GBP", year: 2025, amount: 0, direction: "to-usd" });
    expect(result?.result).toBe(0);
  });

  it("is case-insensitive on currency code", () => {
    const result = convert({ code: "gbp", year: 2025, amount: 100, direction: "to-usd" });
    expect(result).not.toBeNull();
  });
});

describe("convert — corrected source typos", () => {
  it("uses the corrected Euro Zone 2024 rate (published as 0,924)", () => {
    const typo = SOURCE_TYPOS.find((t) => t.code === "EUR" && t.year === 2024);
    expect(typo?.published).toBe("0,924");
    expect(rateFor("EUR", 2024)).toBe(0.924);
  });

  it("uses the corrected Russia 2021 rate (published as .73.686)", () => {
    const typo = SOURCE_TYPOS.find((t) => t.code === "RUB" && t.year === 2021);
    expect(typo?.published).toBe(".73.686");
    expect(rateFor("RUB", 2021)).toBe(73.686);
  });
});

describe("findCurrency / rateFor", () => {
  it("finds a currency by code regardless of case", () => {
    expect(findCurrency("eur")?.country).toBe("Euro Zone");
    expect(findCurrency("EUR")?.country).toBe("Euro Zone");
  });

  it("returns null for an unknown code", () => {
    expect(findCurrency("XXX")).toBeNull();
  });

  it("returns null for an empty/nullish code", () => {
    expect(findCurrency("")).toBeNull();
    expect(findCurrency(null)).toBeNull();
    expect(findCurrency(undefined)).toBeNull();
  });

  it("looks up a rate for a given code and year", () => {
    expect(rateFor("JPY", 2025)).toBe(149.632);
  });

  it("returns null for an unpublished year", () => {
    expect(rateFor("JPY", 2010)).toBeNull();
  });
});

describe("searchCurrencies", () => {
  it("returns every currency for an empty query", () => {
    expect(searchCurrencies("")).toHaveLength(EXCHANGE_RATES.length);
  });

  it("matches by country name, case-insensitively", () => {
    const results = searchCurrencies("united king");
    expect(results.map((r) => r.code)).toContain("GBP");
  });

  it("matches by currency name", () => {
    const results = searchCurrencies("yen");
    expect(results.map((r) => r.code)).toContain("JPY");
  });

  it("matches by currency code", () => {
    const results = searchCurrencies("eur");
    expect(results.map((r) => r.code)).toContain("EUR");
  });

  it("returns no results for a query matching nothing", () => {
    expect(searchCurrencies("not-a-real-currency-query")).toHaveLength(0);
  });
});

describe("isConversionDirection", () => {
  it("accepts the two valid directions", () => {
    expect(isConversionDirection("to-usd")).toBe(true);
    expect(isConversionDirection("from-usd")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isConversionDirection("sideways")).toBe(false);
    expect(isConversionDirection(null)).toBe(false);
    expect(isConversionDirection(undefined)).toBe(false);
  });
});

describe("data integrity", () => {
  it("has no duplicate currency codes", () => {
    const codes = EXCHANGE_RATES.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("has a rate entry for every published year on every row", () => {
    for (const row of EXCHANGE_RATES) {
      for (const year of YEARS) {
        expect(row.rates).toHaveProperty(String(year));
      }
    }
  });

  it("captured the full published table (39 rows, 5 years)", () => {
    expect(EXCHANGE_RATES).toHaveLength(39);
    expect(YEARS).toHaveLength(5);
  });
});
