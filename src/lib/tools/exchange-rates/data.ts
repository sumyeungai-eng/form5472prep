// IRS "Yearly average currency exchange rates" — data captured verbatim from
// the published table. Do not hand-edit numbers here without re-reading the
// source; see docs/research/irs-exchange-rates.md for the full retrieval
// notes, including two source typos this file corrects transparently (see
// SOURCE_TYPOS below).
//
// Source: https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates
// The IRS page states its own "Page Last Reviewed or Updated: 17-Sep-2026".
export const SOURCE_URL =
  "https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates";
export const RELATED_SOURCE_URL =
  "https://www.irs.gov/individuals/international-taxpayers/foreign-currency-and-currency-exchange-rates";
export const FORM_5472_INSTRUCTIONS_URL =
  "https://www.irs.gov/instructions/i5472";

// When we pulled the page (curl + programmatic table parse, not an LLM
// summary, so every row/column matches the source exactly).
export const RETRIEVED_DATE = "2026-09-29";

// The IRS page's own "Page Last Reviewed or Updated" footer, as published.
export const IRS_PAGE_LAST_REVIEWED = "17-Sep-2026";

// The five years currently published on the IRS page, newest first. The IRS
// keeps only a rolling window (currently 5 years) and rolls it forward each
// January — refreshing this list is an owner-gated follow-up, not part of
// this build.
export const YEARS = [2025, 2024, 2023, 2022, 2021] as const;
export type ExchangeRateYear = (typeof YEARS)[number];

export function isExchangeRateYear(value: number): value is ExchangeRateYear {
  return (YEARS as readonly number[]).includes(value);
}

export type CurrencyRate = {
  /** Currency code we assign for lookup/URL use (not published by the IRS). */
  code: string;
  /** Country/jurisdiction label exactly as published by the IRS, including
   * its own wording choices (e.g. "South Korean", "Euro Zone"). */
  country: string;
  /** Currency name exactly as published by the IRS. */
  currency: string;
  /** Units of this foreign currency per 1 U.S. dollar, by year. A null value
   * means the IRS page left that cell blank — we never fill blanks in. */
  rates: Record<ExchangeRateYear, number | null>;
};

// Cells where the published HTML itself contains a transcription typo. We
// still show the literal published string on the page (for source fidelity)
// alongside the corrected number the calculator uses. See the research note
// for the raw-HTML evidence.
export const SOURCE_TYPOS: ReadonlyArray<{
  code: string;
  year: ExchangeRateYear;
  published: string;
  corrected: number;
}> = [
  { code: "EUR", year: 2024, published: "0,924", corrected: 0.924 },
  { code: "RUB", year: 2021, published: ".73.686", corrected: 73.686 },
];

// Data rows in the exact order the IRS table publishes them (alphabetical by
// country). `code` values are our own stable identifiers for URLs/lookups —
// they are ISO-4217-style where an obvious code exists, otherwise a short
// mnemonic; they are not themselves published by the IRS.
export const EXCHANGE_RATES: readonly CurrencyRate[] = [
  { code: "AFN", country: "Afghanistan", currency: "Afghani", rates: { 2025: 69.637, 2024: 70.649, 2023: 82.635, 2022: 90.084, 2021: 83.484 } },
  { code: "DZD", country: "Algeria", currency: "Dinar", rates: { 2025: 131.627, 2024: 134.124, 2023: 135.933, 2022: 142.123, 2021: 135.011 } },
  { code: "ARS", country: "Argentina", currency: "Peso", rates: { 2025: 1243.369, 2024: 915.161, 2023: 296.154, 2022: 130.792, 2021: 95.098 } },
  { code: "AUD", country: "Australia", currency: "Dollar", rates: { 2025: 1.551, 2024: 1.516, 2023: 1.506, 2022: 1.442, 2021: 1.332 } },
  { code: "BHD", country: "Bahrain", currency: "Dinar", rates: { 2025: 0.377, 2024: 0.377, 2023: 0.377, 2022: 0.377, 2021: 0.377 } },
  { code: "BRL", country: "Brazil", currency: "Real", rates: { 2025: 5.593, 2024: 5.392, 2023: 4.994, 2022: 5.165, 2021: 5.395 } },
  { code: "CAD", country: "Canada", currency: "Dollar", rates: { 2025: 1.398, 2024: 1.370, 2023: 1.350, 2022: 1.301, 2021: 1.254 } },
  { code: "KYD", country: "Cayman Islands", currency: "Dollar", rates: { 2025: 0.821, 2024: 0.833, 2023: 0.833, 2022: 0.833, 2021: 0.833 } },
  { code: "CNY", country: "China", currency: "Yuan", rates: { 2025: 7.129, 2024: 7.189, 2023: 7.075, 2022: 6.730, 2021: 6.452 } },
  { code: "DKK", country: "Denmark", currency: "Krone", rates: { 2025: 6.617, 2024: 6.896, 2023: 6.890, 2022: 7.077, 2021: 6.290 } },
  { code: "EGP", country: "Egypt", currency: "Pound", rates: { 2025: 49.233, 2024: 45.345, 2023: 30.651, 2022: 19.208, 2021: 15.697 } },
  { code: "EUR", country: "Euro Zone", currency: "Euro", rates: { 2025: 0.886, 2024: 0.924, 2023: 0.924, 2022: 0.951, 2021: 0.846 } },
  { code: "HKD", country: "Hong Kong", currency: "Dollar", rates: { 2025: 7.796, 2024: 7.803, 2023: 7.829, 2022: 7.831, 2021: 7.773 } },
  { code: "HUF", country: "Hungary", currency: "Forint", rates: { 2025: 352.869, 2024: 365.603, 2023: 353.020, 2022: 372.775, 2021: 303.292 } },
  { code: "ISK", country: "Iceland", currency: "Krona", rates: { 2025: 128.262, 2024: 137.958, 2023: 137.857, 2022: 135.296, 2021: 126.986 } },
  { code: "INR", country: "India", currency: "Rupee", rates: { 2025: 87.133, 2024: 83.677, 2023: 82.572, 2022: 78.598, 2021: 73.936 } },
  { code: "IQD", country: "Iraq", currency: "Dinar", rates: { 2025: 1309.753, 2024: 1309.744, 2023: 1376.529, 2022: 1459.51, 2021: 1460.133 } },
  { code: "ILS", country: "Israel", currency: "New Shekel", rates: { 2025: 3.451, 2024: 3.701, 2023: 3.687, 2022: 3.361, 2021: 3.232 } },
  { code: "JPY", country: "Japan", currency: "Yen", rates: { 2025: 149.632, 2024: 151.353, 2023: 140.511, 2022: 131.454, 2021: 109.817 } },
  { code: "LBP", country: "Lebanon", currency: "Pound", rates: { 2025: 89568.540, 2024: 78958.611, 2023: 13730.988, 2022: 1515.669, 2021: 1519.228 } },
  { code: "MXN", country: "Mexico", currency: "Peso", rates: { 2025: 19.212, 2024: 18.330, 2023: 17.733, 2022: 20.110, 2021: 20.284 } },
  { code: "MAD", country: "Morocco", currency: "Dirham", rates: { 2025: 9.344, 2024: 9.937, 2023: 10.134, 2022: 10.275, 2021: 8.995 } },
  { code: "NZD", country: "New Zealand", currency: "Dollar", rates: { 2025: 1.719, 2024: 1.654, 2023: 1.630, 2022: 1.578, 2021: 1.415 } },
  { code: "NOK", country: "Norway", currency: "Kroner", rates: { 2025: 10.392, 2024: 10.756, 2023: 10.564, 2022: 9.619, 2021: 8.598 } },
  { code: "QAR", country: "Qatar", currency: "Rial", rates: { 2025: 3.643, 2024: 3.643, 2023: 3.643, 2022: 3.644, 2021: 3.644 } },
  { code: "RUB", country: "Russia", currency: "Ruble", rates: { 2025: 83.755, 2024: 92.837, 2023: 85.509, 2022: 69.896, 2021: 73.686 } },
  { code: "SAR", country: "Saudi Arabia", currency: "Riyal", rates: { 2025: 3.751, 2024: 3.752, 2023: 3.752, 2022: 3.755, 2021: 3.751 } },
  { code: "SGD", country: "Singapore", currency: "Dollar", rates: { 2025: 1.307, 2024: 1.336, 2023: 1.343, 2022: 1.379, 2021: 1.344 } },
  { code: "ZAR", country: "South Africa", currency: "Rand", rates: { 2025: 17.884, 2024: 18.326, 2023: 18.457, 2022: 16.377, 2021: 14.789 } },
  { code: "KRW", country: "South Korean", currency: "Won", rates: { 2025: 1421.779, 2024: 1364.153, 2023: 1306.686, 2022: 1291.729, 2021: 1144.883 } },
  { code: "SEK", country: "Sweden", currency: "Krona", rates: { 2025: 9.813, 2024: 10.577, 2023: 10.613, 2022: 10.122, 2021: 8.584 } },
  { code: "CHF", country: "Switzerland", currency: "Franc", rates: { 2025: 0.831, 2024: 0.881, 2023: 0.899, 2022: 0.955, 2021: 0.914 } },
  { code: "TWD", country: "Taiwan", currency: "Dollar", rates: { 2025: 31.167, 2024: 32.117, 2023: 31.160, 2022: 29.813, 2021: 27.932 } },
  { code: "THB", country: "Thailand", currency: "Baht", rates: { 2025: 32.870, 2024: 35.267, 2023: 34.802, 2022: 35.044, 2021: 31.997 } },
  { code: "TND", country: "Tunisia", currency: "Dinar", rates: { 2025: 2.996, 2024: 3.111, 2023: 3.103, 2022: 3.082, 2021: 2.778 } },
  { code: "TRY", country: "Turkey", currency: "New Lira", rates: { 2025: 39.546, 2024: 32.867, 2023: 23.824, 2022: 16.572, 2021: 8.904 } },
  { code: "AED", country: "United Arab Emirates", currency: "Dirham", rates: { 2025: 3.673, 2024: 3.673, 2023: 3.673, 2022: 3.673, 2021: 3.673 } },
  { code: "GBP", country: "United Kingdom", currency: "Pound", rates: { 2025: 0.759, 2024: 0.783, 2023: 0.804, 2022: 0.811, 2021: 0.727 } },
  { code: "VEF", country: "Venezuela", currency: "Bolivar (Fuerte)", rates: { 2025: 13057596875331350.0, 2024: 3833558362078.0, 2023: 2863377461538.5, 2022: 666470505836.6, 2021: 232298866894.8 } },
];
