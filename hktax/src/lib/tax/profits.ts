import type { ComputationLine, TaxYearParams } from './types';

export interface BusinessInput {
  id: string;
  name?: string;
  revenue: number;
  deductibleExpenses: number;
  addBacks?: {
    privatePortion?: number;
    capitalExpenditure?: number;
    proprietorSalaries?: number;
    nonDeductibleDonations?: number;
  };
  capitalAllowances?: {
    pmInitialAdditions?: number;
    pools?: {
      rate: 0.1 | 0.2 | 0.3;
      broughtForward: number;
      additions: number;
    }[];
    buildingAllowance?: number;
  };
  lossBroughtForward?: number;
  electedTwoTier?: boolean;
}

export interface ProfitsComputation {
  perBusiness: {
    id: string;
    lines: ComputationLine[];
    assessableProfits: number;
    lossCarriedForward: number;
    tax: number;
  }[];
  totalAssessableProfits: number;
  totalTax: number;
  reduction: number;
  finalTax: number;
  lines: ComputationLine[];
}

function line(
  key: string,
  labelZh: string,
  labelEn: string,
  amount: number,
  kind: ComputationLine['kind'],
): ComputationLine {
  return { key, labelZh, labelEn, amount, kind };
}

function present(value: number | undefined): value is number {
  return value !== undefined && value !== 0;
}

function formatRate(rate: number): string {
  return `${rate * 100}%`;
}

function computeBusinessTax(
  assessableProfits: number,
  electedTwoTier: boolean,
  params: TaxYearParams,
  lines: ComputationLine[],
): number {
  if (assessableProfits <= 0) {
    lines.push(line('tax-none', '應課稅利潤不多於零，利得稅為零', 'No profits tax where assessable profits are zero or below', 0, 'tax'));
    return 0;
  }

  if (electedTwoTier) {
    const tierOneAmount = Math.min(assessableProfits, params.profitsTax.tierOneCap);
    const tierOneTax = tierOneAmount * params.profitsTax.tierOneRate;
    lines.push(
      line(
        'tax-tier-one',
        `兩級制第一級稅款（${formatRate(params.profitsTax.tierOneRate)}）`,
        `Two-tier first tier tax (${formatRate(params.profitsTax.tierOneRate)})`,
        tierOneTax,
        'tax',
      ),
    );

    const remainder = Math.max(assessableProfits - params.profitsTax.tierOneCap, 0);
    if (remainder > 0) {
      const remainderTax = remainder * params.profitsTax.standardRate;
      lines.push(
        line(
          'tax-standard-remainder',
          `超出第一級上限的稅款（${formatRate(params.profitsTax.standardRate)}）`,
          `Tax on profits above first tier cap (${formatRate(params.profitsTax.standardRate)})`,
          remainderTax,
          'tax',
        ),
      );
      return tierOneTax + remainderTax;
    }

    return tierOneTax;
  }

  const tax = assessableProfits * params.profitsTax.standardRate;
  lines.push(
    line(
      'tax-standard',
      `標準稅率稅款（${formatRate(params.profitsTax.standardRate)}）`,
      `Tax at standard rate (${formatRate(params.profitsTax.standardRate)})`,
      tax,
      'tax',
    ),
  );
  return tax;
}

export function computeProfitsTax(
  businesses: BusinessInput[],
  params: TaxYearParams,
): ProfitsComputation {
  assertFiniteBusinessInputs(businesses);

  // Loss years follow the interface convention: assessableProfits keeps any negative
  // post-set-off figure, while lossCarriedForward reports that positive loss plus unused b/f losses.
  const electedCount = businesses.filter((business) => business.electedTwoTier === true).length;
  if (electedCount > 1) {
    throw new Error('Only one business may elect the two-tiered profits tax rates.');
  }

  const businessComputations = businesses.map((business) => {
    const lines: ComputationLine[] = [];
    const businessLabelZh = business.name ? `（${business.name}）` : '';
    const businessLabelEn = business.name ? ` (${business.name})` : '';

    lines.push(line('revenue', `營業收入${businessLabelZh}`, `Revenue${businessLabelEn}`, business.revenue, 'income'));
    lines.push(line('deductible-expenses', '可扣除開支', 'Deductible expenses', -business.deductibleExpenses, 'deduction'));

    const addBacks = business.addBacks ?? {};
    const addBackItems = [
      ['add-back-private-portion', '私人用途部分加回', 'Add-back: private portion', addBacks.privatePortion],
      ['add-back-capital-expenditure', '資本開支加回', 'Add-back: capital expenditure', addBacks.capitalExpenditure],
      ['add-back-proprietor-salaries', '東主或配偶薪金加回', 'Add-back: proprietor or spouse salaries', addBacks.proprietorSalaries],
      ['add-back-non-deductible-donations', '不可扣除捐款加回', 'Add-back: non-deductible donations', addBacks.nonDeductibleDonations],
    ] as const;

    const totalAddBacks = addBackItems.reduce((total, [key, labelZh, labelEn, amount]) => {
      const safeAmount = amount ?? 0;
      if (present(amount)) {
        lines.push(line(key, labelZh, labelEn, safeAmount, 'income'));
      }
      return total + safeAmount;
    }, 0);

    const adjustedProfit = business.revenue - business.deductibleExpenses + totalAddBacks;
    lines.push(line('adjusted-profit', '經調整利潤', 'Adjusted profit', adjustedProfit, 'subtotal'));

    const capitalAllowances = business.capitalAllowances;
    const pmInitialAdditions = capitalAllowances?.pmInitialAdditions ?? 0;
    const pmInitialAllowance = pmInitialAdditions * 0.6;
    if (pmInitialAllowance > 0) {
      lines.push(line('pm-initial-allowance', '機械及工業裝置初期免稅額', 'Plant and machinery initial allowance', -pmInitialAllowance, 'deduction'));
    }

    // Simplified capital allowances: this year's P&M additions are deemed to enter each pool
    // net of the 60% initial allowance already claimed on them (additions * 0.40). True IRD
    // pooling mechanics are more detailed; PLAN.md Step 5 accepts this simplified treatment.
    const poolAllowances = (capitalAllowances?.pools ?? []).map((pool, index) => {
      const poolBase = pool.broughtForward + pool.additions * 0.4;
      const annualAllowance = pool.rate * poolBase;
      const carriedForward = poolBase - annualAllowance;
      lines.push(
        line(
          `pm-pool-${index + 1}-annual-allowance`,
          `機械及工業裝置免稅額組別 ${index + 1}（${formatRate(pool.rate)}）`,
          `Plant and machinery pool ${index + 1} annual allowance (${formatRate(pool.rate)})`,
          -annualAllowance,
          'deduction',
        ),
      );
      lines.push(
        line(
          `pm-pool-${index + 1}-carried-forward`,
          `機械及工業裝置組別 ${index + 1} 結轉餘額`,
          `Plant and machinery pool ${index + 1} balance carried forward`,
          carriedForward,
          'info',
        ),
      );
      return annualAllowance;
    });

    const buildingAllowance = capitalAllowances?.buildingAllowance ?? 0;
    if (buildingAllowance > 0) {
      lines.push(line('building-allowance', '工業／商業建築物免稅額', 'Industrial/commercial building allowance', -buildingAllowance, 'deduction'));
    }

    const totalCapitalAllowances = pmInitialAllowance + poolAllowances.reduce((total, amount) => total + amount, 0) + buildingAllowance;
    if (totalCapitalAllowances > 0) {
      lines.push(line('total-capital-allowances', '資本免稅額總額', 'Total capital allowances', -totalCapitalAllowances, 'subtotal'));
    }

    const currentYearAssessableProfits = adjustedProfit - totalCapitalAllowances;
    lines.push(line('assessable-profits-before-loss', '扣除承前虧損前的應評稅利潤', 'Assessable profits before brought-forward loss', currentYearAssessableProfits, 'subtotal'));

    const lossBroughtForward = business.lossBroughtForward ?? 0;
    let assessableProfits = currentYearAssessableProfits;
    let unusedLossBroughtForward = lossBroughtForward;
    let currentYearLossRemaining = 0;

    if (currentYearAssessableProfits < 0) {
      currentYearLossRemaining = Math.abs(currentYearAssessableProfits);
      assessableProfits = -currentYearLossRemaining;
    } else {
      const lossApplied = Math.min(lossBroughtForward, currentYearAssessableProfits);
      if (lossApplied > 0) {
        lines.push(line('loss-brought-forward-applied', '已抵銷承前虧損', 'Loss brought forward applied', -lossApplied, 'deduction'));
      }
      assessableProfits = currentYearAssessableProfits - lossApplied;
      unusedLossBroughtForward = lossBroughtForward - lossApplied;
    }

    return {
      id: business.id,
      lines,
      electedTwoTier: business.electedTwoTier === true,
      assessableProfits,
      currentYearLossRemaining,
      unusedLossBroughtForward,
    };
  });

  const profitIndexes = businessComputations
    .map((business, index) => ({ business, index }))
    .filter(({ business }) => business.assessableProfits > 0)
    .sort((left, right) => {
      if (left.business.electedTwoTier !== right.business.electedTwoTier) {
        return left.business.electedTwoTier ? 1 : -1;
      }
      return left.index - right.index;
    })
    .map(({ index }) => index);

  businessComputations.forEach((lossBusiness, lossIndex) => {
    let lossAvailable = lossBusiness.currentYearLossRemaining;
    if (lossAvailable <= 0) {
      return;
    }

    for (const profitIndex of profitIndexes) {
      if (profitIndex === lossIndex || lossAvailable <= 0) {
        continue;
      }

      const profitBusiness = businessComputations[profitIndex];
      if (profitBusiness.assessableProfits <= 0) {
        continue;
      }

      const lossApplied = Math.min(lossAvailable, profitBusiness.assessableProfits);
      if (lossApplied > 0) {
        // IRO s.19C(1) is silent on ordering among multiple other-trade profits;
        // documented assumption: apply losses to non-two-tier businesses first as taxpayer-favourable.
        profitBusiness.lines.push(line('same-year-other-trade-loss-applied', '已抵銷同年度其他行業虧損', 'Same-year loss from another trade applied', -lossApplied, 'deduction'));
        profitBusiness.assessableProfits -= lossApplied;
        lossAvailable -= lossApplied;
      }
    }

    lossBusiness.currentYearLossRemaining = lossAvailable;
    lossBusiness.assessableProfits = lossAvailable > 0 ? -lossAvailable : 0;
  });

  const perBusiness = businessComputations.map((business) => {
    const { assessableProfits, lines } = business;
    const lossCarriedForward = business.currentYearLossRemaining + business.unusedLossBroughtForward;

    lines.push(line('assessable-profits', '應評稅利潤', 'Assessable profits', assessableProfits, 'subtotal'));

    if (lossCarriedForward > 0) {
      lines.push(line('loss-carried-forward', '結轉虧損', 'Loss carried forward', lossCarriedForward, 'info'));
    }

    const tax = computeBusinessTax(assessableProfits, business.electedTwoTier, params, lines);
    lines.push(line('business-tax', '本業務利得稅', 'Profits tax for this business', tax, 'tax'));

    return {
      id: business.id,
      lines,
      assessableProfits,
      lossCarriedForward,
      tax,
    };
  });

  const totalAssessableProfits = perBusiness.reduce((total, business) => total + Math.max(business.assessableProfits, 0), 0);
  const totalTax = perBusiness.reduce((total, business) => total + business.tax, 0);
  const reduction = params.taxReduction.appliesTo.includes('profits')
    ? perBusiness.reduce(
        (total, business) => total + Math.min(params.taxReduction.percent * business.tax, params.taxReduction.cap),
        0,
      )
    : 0;
  const finalTax = Math.max(Math.floor(totalTax - reduction), 0);

  const lines: ComputationLine[] = [
    line('total-assessable-profits', '應評稅利潤總額', 'Total assessable profits', totalAssessableProfits, 'subtotal'),
    line('total-tax', '寬減前利得稅總額', 'Total profits tax before reduction', totalTax, 'tax'),
    line('tax-reduction', '稅款寬減', 'Tax reduction', -reduction, 'tax'),
    line('final-tax', '應繳利得稅', 'Final profits tax payable', finalTax, 'tax'),
  ];

  return {
    perBusiness,
    totalAssessableProfits,
    totalTax,
    reduction,
    finalTax,
    lines,
  };
}

function assertFiniteBusinessInputs(businesses: BusinessInput[]): void {
  businesses.forEach((business, index) => {
    const prefix = `businesses[${index}]`;
    assertFiniteNumber(business.revenue, `${prefix}.revenue`);
    assertFiniteNumber(business.deductibleExpenses, `${prefix}.deductibleExpenses`);

    const addBacks = business.addBacks;
    if (addBacks !== undefined) {
      assertFiniteOptionalNumber(addBacks.privatePortion, `${prefix}.addBacks.privatePortion`);
      assertFiniteOptionalNumber(addBacks.capitalExpenditure, `${prefix}.addBacks.capitalExpenditure`);
      assertFiniteOptionalNumber(addBacks.proprietorSalaries, `${prefix}.addBacks.proprietorSalaries`);
      assertFiniteOptionalNumber(addBacks.nonDeductibleDonations, `${prefix}.addBacks.nonDeductibleDonations`);
    }

    const capitalAllowances = business.capitalAllowances;
    if (capitalAllowances !== undefined) {
      assertFiniteOptionalNumber(capitalAllowances.pmInitialAdditions, `${prefix}.capitalAllowances.pmInitialAdditions`);
      capitalAllowances.pools?.forEach((pool, poolIndex) => {
        assertFiniteNumber(pool.rate, `${prefix}.capitalAllowances.pools[${poolIndex}].rate`);
        assertFiniteNumber(pool.broughtForward, `${prefix}.capitalAllowances.pools[${poolIndex}].broughtForward`);
        assertFiniteNumber(pool.additions, `${prefix}.capitalAllowances.pools[${poolIndex}].additions`);
      });
      assertFiniteOptionalNumber(capitalAllowances.buildingAllowance, `${prefix}.capitalAllowances.buildingAllowance`);
    }

    assertFiniteOptionalNumber(business.lossBroughtForward, `${prefix}.lossBroughtForward`);
  });
}

function assertFiniteOptionalNumber(value: number | undefined, field: string): void {
  if (value !== undefined) {
    assertFiniteNumber(value, field);
  }
}

function assertFiniteNumber(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}
