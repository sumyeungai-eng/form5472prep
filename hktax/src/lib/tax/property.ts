import type { ComputationLine, TaxYearParams } from './types';

export type PropertyInput = {
  id: string;
  rentReceived: number;
  leasePremium?: number;
  leaseTermMonths?: number;
  premiumMonthsInYear?: number;
  irrecoverableRent?: number;
  irrecoverableRentRecovered?: number;
  ratesPaidByOwner?: number;
  ownershipShare?: number;
};

export type PropertyComputation = {
  perProperty: { id: string; lines: ComputationLine[]; nav: number; tax: number }[];
  totalNav: number;
  totalTax: number;
  lines: ComputationLine[];
};

function line(
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  kind: ComputationLine['kind'],
): ComputationLine {
  return { key, labelZh, labelEn, amount, kind };
}

function assertNoPropertyTaxReduction(params: TaxYearParams): void {
  const appliesTo = params.taxReduction.appliesTo as readonly string[];

  if (appliesTo.includes('property') || appliesTo.includes('propertyTax')) {
    throw new Error('Unexpected property tax reduction configured in tax year params');
  }
}

function getOwnershipShare(property: PropertyInput): number {
  const share = property.ownershipShare ?? 1;

  if (!Number.isFinite(share) || share < 0 || share > 1) {
    throw new Error(`Invalid ownershipShare for property ${property.id}: ${share}`);
  }

  return share;
}

function computePremiumForYear(property: PropertyInput): {
  spreadingMonths: number;
  monthsInYear: number;
  amount: number;
} {
  const premium = property.leasePremium ?? 0;
  const leaseTermMonths = property.leaseTermMonths ?? 0;

  if (premium <= 0 || leaseTermMonths <= 0) {
    return { spreadingMonths: 0, monthsInYear: 0, amount: 0 };
  }

  const spreadingMonths = Math.min(leaseTermMonths, 36);
  const monthsInYear = property.premiumMonthsInYear ?? 0;
  const amount = (premium / spreadingMonths) * monthsInYear;

  return { spreadingMonths, monthsInYear, amount };
}

function computeOneProperty(
  property: PropertyInput,
  params: TaxYearParams,
): { id: string; lines: ComputationLine[]; nav: number; tax: number } {
  const premium = computePremiumForYear(property);
  const irrecoverableRent = property.irrecoverableRent ?? 0;
  const recoveredRent = property.irrecoverableRentRecovered ?? 0;
  const ratesPaidByOwner = property.ratesPaidByOwner ?? 0;
  const ownershipShare = getOwnershipShare(property);

  const consideration = property.rentReceived + premium.amount + recoveredRent;
  const assessableValue = consideration - irrecoverableRent;
  const afterRates = assessableValue - ratesPaidByOwner;
  const repairsAllowance = afterRates * params.propertyTax.repairsAllowancePercent;
  const navBeforeShare = Math.max(0, afterRates - repairsAllowance);
  const taxBeforeShare = navBeforeShare * params.propertyTax.rate;
  const nav = navBeforeShare * ownershipShare;
  const tax = Math.floor(taxBeforeShare * ownershipShare);

  const lines: ComputationLine[] = [
    line(
      'rentReceived',
      '已收租金',
      'Rent received',
      property.rentReceived,
      'income',
    ),
    line(
      'leasePremiumSpread',
      `租約頂手費攤分（${premium.monthsInYear} / ${premium.spreadingMonths || 0} 個月）`,
      `Lease premium spread (${premium.monthsInYear} / ${premium.spreadingMonths || 0} months)`,
      premium.amount,
      'income',
    ),
    line(
      'irrecoverableRentRecovered',
      '已追回往年不能追回租金',
      'Irrecoverable rent recovered from prior years',
      recoveredRent,
      'income',
    ),
    line('consideration', '總代價', 'Total consideration', consideration, 'subtotal'),
    line(
      'irrecoverableRent',
      '扣除本年度不能追回租金',
      'Less irrecoverable rent written off this year',
      -irrecoverableRent,
      'deduction',
    ),
    line('assessableValue', '應評稅值', 'Assessable value', assessableValue, 'subtotal'),
    line(
      'ratesPaidByOwner',
      '扣除業主繳付差餉',
      'Less rates paid by owner',
      -ratesPaidByOwner,
      'deduction',
    ),
    line(
      'assessableValueAfterRates',
      '扣除差餉後應評稅值',
      'Assessable value after rates',
      afterRates,
      'subtotal',
    ),
    line(
      'repairsAllowance',
      '扣除修葺及支出法定免稅額',
      'Less statutory repairs and outgoings allowance',
      -repairsAllowance,
      'allowance',
    ),
    line(
      'netAssessableValueBeforeShare',
      '業權份額前應評稅淨值',
      'Net assessable value before ownership share',
      navBeforeShare,
      'subtotal',
    ),
    line(
      'ownershipShare',
      '業權份額',
      'Ownership share',
      ownershipShare,
      'info',
    ),
    line(
      'netAssessableValue',
      '應評稅淨值',
      'Net assessable value',
      nav,
      'subtotal',
    ),
    line('taxBeforeReduction', '扣減前物業稅', 'Property tax before reduction', tax, 'tax'),
    line('taxReduction', '物業稅不適用稅款寬減', 'No tax reduction applies to property tax', 0, 'info'),
    line('propertyTax', '物業稅', 'Property tax', tax, 'tax'),
  ];

  return { id: property.id, lines, nav, tax };
}

export function computePropertyTax(
  properties: PropertyInput[],
  params: TaxYearParams,
): PropertyComputation {
  assertNoPropertyTaxReduction(params);

  const perProperty = properties.map((property) => computeOneProperty(property, params));
  const totalNav = perProperty.reduce((sum, property) => sum + property.nav, 0);
  const totalTax = perProperty.reduce((sum, property) => sum + property.tax, 0);
  const detailLines = perProperty.flatMap((property) =>
    property.lines.map((propertyLine) => ({
      ...propertyLine,
      key: `${property.id}.${propertyLine.key}`,
      labelZh: `${property.id}：${propertyLine.labelZh}`,
      labelEn: `${property.id}: ${propertyLine.labelEn}`,
    })),
  );
  const aggregateLines: ComputationLine[] = [
    ...detailLines,
    line('totalNav', '物業應評稅淨值總額', 'Total net assessable value', totalNav, 'subtotal'),
    line('taxReduction', '物業稅不適用稅款寬減', 'No tax reduction applies to property tax', 0, 'info'),
    line('totalTax', '物業稅總額', 'Total property tax', totalTax, 'tax'),
  ];

  return { perProperty, totalNav, totalTax, lines: aggregateLines };
}
