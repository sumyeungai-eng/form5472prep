import type { TaxYearParams, YearOfAssessment } from '../types';
import { ya2024_25 } from './ya2024_25';
import { ya2025_26 } from './ya2025_26';

export const ALL_YEARS = ['2024_25', '2025_26'] as const satisfies readonly YearOfAssessment[];

export const DEFAULT_YEAR: YearOfAssessment = '2025_26';

export function getParams(year: YearOfAssessment): TaxYearParams {
  switch (year) {
    case '2024_25':
      return ya2024_25;
    case '2025_26':
      return ya2025_26;
    default: {
      const exhaustive: never = year;
      throw new Error(`Unrecognized year of assessment: ${exhaustive}`);
    }
  }
}
