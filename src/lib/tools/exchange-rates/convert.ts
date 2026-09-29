// Pure lookup + conversion helpers for the IRS yearly-average exchange rate
// tool. No DB, no framework imports — safe to unit test in isolation.
import {
  EXCHANGE_RATES,
  type CurrencyRate,
  isExchangeRateYear,
} from "./data";

export type ConversionDirection = "to-usd" | "from-usd";

export function isConversionDirection(
  value: string | null | undefined,
): value is ConversionDirection {
  return value === "to-usd" || value === "from-usd";
}

export function findCurrency(code: string | null | undefined): CurrencyRate | null {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  return EXCHANGE_RATES.find((row) => row.code === normalized) ?? null;
}

export function rateFor(
  code: string | null | undefined,
  year: number,
): number | null {
  const currency = findCurrency(code);
  if (!currency) return null;
  if (!isExchangeRateYear(year)) return null;
  return currency.rates[year];
}

/**
 * Search currencies by country name, currency name, or code — case
 * insensitive substring match — for the searchable select.
 */
export function searchCurrencies(query: string): readonly CurrencyRate[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return EXCHANGE_RATES;

  return EXCHANGE_RATES.filter((row) => {
    return (
      row.country.toLowerCase().includes(trimmed) ||
      row.currency.toLowerCase().includes(trimmed) ||
      row.code.toLowerCase().includes(trimmed)
    );
  });
}

export type ConversionResult = {
  /** The rate actually used, in units of foreign currency per 1 USD. */
  rate: number;
  /** Amount converted, rounded to cents (2 decimal places). */
  result: number;
  /** Human-readable formula string, e.g. "800 GBP ÷ 0.8 = 1,000.00 USD". */
  formula: string;
};

function roundToCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converts `amount` between a foreign currency and USD using the IRS
 * yearly-average rate (units of foreign currency per 1 USD) for the given
 * currency code and year.
 *
 * direction "to-usd": amount is in the foreign currency; divide by the rate.
 * direction "from-usd": amount is in USD; multiply by the rate.
 *
 * Returns null when the currency code is unknown, the year isn't published,
 * the cell is blank on the IRS page (null rate), or amount is not a finite
 * non-negative number.
 */
export function convert(input: {
  code: string;
  year: number;
  amount: number;
  direction: ConversionDirection;
}): ConversionResult | null {
  const { code, year, amount, direction } = input;

  if (!Number.isFinite(amount) || amount < 0) return null;

  const currency = findCurrency(code);
  if (!currency) return null;
  if (!isExchangeRateYear(year)) return null;

  const rate = currency.rates[year];
  if (rate === null || rate === undefined || !Number.isFinite(rate) || rate <= 0) {
    return null;
  }

  if (direction === "to-usd") {
    const result = roundToCents(amount / rate);
    const formula = `${formatNumber(amount)} ${currency.code} ÷ ${formatRate(rate)} = ${formatNumber(result)} USD`;
    return { rate, result, formula };
  }

  const result = roundToCents(amount * rate);
  const formula = `${formatNumber(amount)} USD × ${formatRate(rate)} = ${formatNumber(result)} ${currency.code}`;
  return { rate, result, formula };
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatRate(value: number): string {
  // Rates can carry more than 2 decimals (e.g. 0.886) — show up to 6
  // significant fractional digits without trailing zeros for the formula.
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(value);
}

