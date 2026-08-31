import { describe, expect, it } from "vitest";
import { getParams } from "../tax/params";
import {
  computeQuickProfits,
  computeQuickProperty,
  computeQuickSalaries,
  type QuickProfitsInput,
  type QuickPropertyInput,
  type QuickSalariesInput,
} from "./quick";

const baseSalariesInput: QuickSalariesInput = {
  annualIncome: 600_000,
  mpfMandatory: 18_000,
  allowanceKind: "basic",
  children: 0,
  housingKind: "none",
  housingAmount: 0,
};

const basePropertyInput: QuickPropertyInput = {
  monthlyRent: 20_000,
  monthsRented: 12,
  ratesPaidByOwner: false,
  ratesAmount: 0,
  ownershipSharePercent: 100,
};

const baseProfitsInput: QuickProfitsInput = {
  revenue: 0,
  deductibleExpenses: 0,
  electedTwoTier: true,
};

describe("quick calculator mapping helpers", () => {
  it("maps the 2024/25 salaries quick input to the golden salaries tax result", () => {
    const result = computeQuickSalaries(baseSalariesInput, getParams("2024_25"));

    expect(result.netAssessableIncome).toBe(582_000);
    expect(result.netChargeableIncome).toBe(450_000);
    expect(result.taxAtProgressive).toBe(58_500);
    expect(result.taxAtStandard).toBe(87_300);
    expect(result.basisUsed).toBe("progressive");
    expect(result.reduction).toBe(1_500);
    expect(result.finalTax).toBe(57_000);
  });

  it("maps the 2025/26 salaries quick input to the year-specific reduction cap", () => {
    const result = computeQuickSalaries(baseSalariesInput, getParams("2025_26"));

    expect(result.reduction).toBe(3_000);
    expect(result.finalTax).toBe(55_500);
  });

  it("maps owner-paid rates into the 2025/26 property tax golden result", () => {
    const result = computeQuickProperty(
      { ...basePropertyInput, ratesPaidByOwner: true, ratesAmount: 12_000 },
      getParams("2025_26"),
    );

    expect(result.perProperty[0].nav).toBe(182_400);
    expect(result.perProperty[0].tax).toBe(27_360);
    expect(result.totalNav).toBe(182_400);
    expect(result.totalTax).toBe(27_360);
  });

  it("maps tenant-paid rates as no owner rates deduction for property tax", () => {
    const result = computeQuickProperty(basePropertyInput, getParams("2025_26"));

    expect(result.perProperty[0].nav).toBe(192_000);
    expect(result.perProperty[0].tax).toBe(28_800);
    expect(result.totalNav).toBe(192_000);
    expect(result.totalTax).toBe(28_800);
  });

  it("maps profits over the first-tier cap into the two-tier profits tax split", () => {
    const result = computeQuickProfits(
      { ...baseProfitsInput, revenue: 3_000_000, deductibleExpenses: 800_000 },
      getParams("2025_26"),
    );

    expect(result.perBusiness[0].assessableProfits).toBe(2_200_000);
    expect(result.tierOneTax).toBe(150_000);
    expect(result.standardRemainderTax).toBe(30_000);
    expect(result.perBusiness[0].tax).toBe(180_000);
    expect(result.reduction).toBe(3_000);
    expect(result.finalTax).toBe(177_000);
  });

  it("maps profits under the first-tier cap into the two-tier profits tax result", () => {
    const result = computeQuickProfits(
      { ...baseProfitsInput, revenue: 1_500_000, deductibleExpenses: 500_000 },
      getParams("2025_26"),
    );

    expect(result.perBusiness[0].assessableProfits).toBe(1_000_000);
    expect(result.tierOneTax).toBe(75_000);
    expect(result.finalTax).toBe(72_000);
  });
});
