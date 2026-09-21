import pba2023 from "./pba-2023.json";
import pba2024 from "./pba-2024.json";
import pba2025 from "./pba-2025.json";

export type PbaCode = { code: string; description: string };

export const NO_ACTIVITY_CODE = "999000";

const PBA_BY_YEAR = {
  2023: pba2023.codes,
  2024: pba2024.codes,
  2025: pba2025.codes,
} satisfies Record<2023 | 2024 | 2025, PbaCode[]>;

const AVAILABLE_YEARS = [2023, 2024, 2025] as const;

// Select the IRS Form 1120 PBA list for a filing tax year. Exact years use
// their matching list; years before our first extracted list use the oldest
// available list; years after our newest extracted list use the newest list.
export function pbaYearFor(taxYear: number): 2023 | 2024 | 2025 {
  if (taxYear <= AVAILABLE_YEARS[0]) return AVAILABLE_YEARS[0];
  if (taxYear >= AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1]) {
    return AVAILABLE_YEARS[AVAILABLE_YEARS.length - 1];
  }
  return taxYear as 2023 | 2024 | 2025;
}

export function pbaCodesFor(taxYear: number): PbaCode[] {
  return PBA_BY_YEAR[pbaYearFor(taxYear)];
}

export function isValidPbaCode(code: string, taxYear: number): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  return pbaCodesFor(taxYear).some((item) => item.code === code);
}

export function describePbaCode(code: string, taxYear: number): string | null {
  return pbaCodesFor(taxYear).find((item) => item.code === code)?.description ?? null;
}

export function searchPbaCodes(query: string, taxYear: number, limit = 20): PbaCode[] {
  const trimmed = query.trim().toLowerCase();
  const cappedLimit = Math.max(0, Math.floor(limit));
  if (cappedLimit === 0) return [];
  if (!trimmed) return pbaCodesFor(taxYear).slice(0, cappedLimit);

  const terms = trimmed.split(/\s+/).filter(Boolean);
  return pbaCodesFor(taxYear)
    .filter((item) => {
      const words = item.description.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      return terms.every((term) => item.code.startsWith(term) || words.some((word) => word.startsWith(term)));
    })
    .slice(0, cappedLimit);
}
