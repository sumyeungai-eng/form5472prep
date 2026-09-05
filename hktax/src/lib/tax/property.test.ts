import { describe, expect, it } from 'vitest';
import { getParams } from './params';
import { computePropertyTax, type PropertyInput } from './property';
import type { TaxYearParams } from './types';

const params = getParams('2025_26');

function simpleProperty(overrides: Partial<PropertyInput> = {}): PropertyInput {
  return {
    id: 'flat-a',
    rentReceived: 240000,
    ...overrides,
  };
}

describe('computePropertyTax', () => {
  it('computes sole-owner property tax for simple rent with no premium, rates, or irrecoverable rent', () => {
    const result = computePropertyTax([simpleProperty()], params);

    expect(result.perProperty).toHaveLength(1);
    expect(result.perProperty[0].nav).toBe(192000);
    expect(result.perProperty[0].tax).toBe(28800);
    expect(result.totalNav).toBe(192000);
    expect(result.totalTax).toBe(28800);
  });

  it('computes a 50% co-owner as exactly half of the equivalent sole-owner case', () => {
    const soleOwner = computePropertyTax([simpleProperty()], params);
    const halfOwner = computePropertyTax([simpleProperty({ ownershipShare: 0.5 })], params);

    expect(halfOwner.totalNav).toBe(soleOwner.totalNav / 2);
    expect(halfOwner.totalTax).toBe(soleOwner.totalTax / 2);
  });

  it('reduces assessable value for irrecoverable rent written off this year', () => {
    const result = computePropertyTax([simpleProperty({ irrecoverableRent: 30000 })], params);

    expect(result.perProperty[0].nav).toBe(168000);
    expect(result.perProperty[0].tax).toBe(25200);
  });

  it('adds back irrecoverable rent recovered from an earlier year in the year recovered', () => {
    const result = computePropertyTax([
      simpleProperty({ rentReceived: 200000, irrecoverableRentRecovered: 40000 }),
    ], params);

    expect(result.perProperty[0].nav).toBe(192000);
    expect(result.perProperty[0].tax).toBe(28800);
  });

  // rent = 240,000; owner-paid rates = 12,000
  // assessable value after rates = 240,000 - 12,000 = 228,000
  // repairs & outgoings allowance = 20% x 228,000 = 45,600
  // NAV = 228,000 - 45,600 = 182,400
  // tax = 182,400 x 15% = 27,360
  it('deducts owner-paid rates but makes no deduction when rates are paid by the tenant', () => {
    const tenantPaid = computePropertyTax([simpleProperty()], params);
    const ownerPaid = computePropertyTax([simpleProperty({ ratesPaidByOwner: 12000 })], params);

    expect(tenantPaid.perProperty[0].nav).toBe(192000);
    expect(tenantPaid.perProperty[0].tax).toBe(28800);
    expect(ownerPaid.perProperty[0].nav).toBe(182400);
    expect(ownerPaid.perProperty[0].tax).toBe(27360);
  });

  it('spreads a lease premium over a 24-month lease and counts only current-year months', () => {
    const result = computePropertyTax([
      simpleProperty({
        rentReceived: 120000,
        leasePremium: 240000,
        leaseTermMonths: 24,
        premiumMonthsInYear: 6,
      }),
    ], params);

    expect(result.perProperty[0].nav).toBe(144000);
    expect(result.perProperty[0].tax).toBe(21600);
  });

  it('caps the lease premium spreading divisor at 36 months for longer leases', () => {
    const result = computePropertyTax([
      simpleProperty({
        rentReceived: 0,
        leasePremium: 360000,
        leaseTermMonths: 60,
        premiumMonthsInYear: 12,
      }),
    ], params);

    expect(result.perProperty[0].nav).toBe(96000);
    expect(result.perProperty[0].tax).toBe(14400);
  });

  it('floors zero or negative computed NAV at zero and tax at zero', () => {
    const result = computePropertyTax([
      simpleProperty({
        rentReceived: 10000,
        irrecoverableRent: 12000,
      }),
    ], params);

    expect(result.perProperty[0].nav).toBe(0);
    expect(result.perProperty[0].tax).toBe(0);
    expect(result.totalNav).toBe(0);
    expect(result.totalTax).toBe(0);
  });

  it('does not apply tax reduction to property tax and asserts the params scope', () => {
    const result = computePropertyTax([simpleProperty()], params);

    expect(params.taxReduction.appliesTo).not.toContain('property' as never);
    expect(result.perProperty[0].lines).toContainEqual(
      expect.objectContaining({
        key: 'taxReduction',
        amount: 0,
        kind: 'info',
      }),
    );
    expect(result.totalTax).toBe(result.perProperty[0].tax);
  });

  it('throws if params unexpectedly include property tax in the reduction scope', () => {
    const badParams: TaxYearParams = {
      ...params,
      taxReduction: {
        ...params.taxReduction,
        appliesTo: [...params.taxReduction.appliesTo, 'property' as never],
      },
    };

    expect(() => computePropertyTax([simpleProperty()], badParams)).toThrow(
      'Unexpected property tax reduction configured in tax year params',
    );
  });

  it('defaults premiumMonthsInYear to a full year of the premium spread when omitted', () => {
    const result = computePropertyTax([
      simpleProperty({
        rentReceived: 0,
        leasePremium: 360000,
        leaseTermMonths: 36,
      }),
    ], params);

    // Omitting premiumMonthsInYear was silently discarding a real premium; the default now covers a full year of the spread.
    expect(result.perProperty[0].nav).toBe(96000);
    expect(result.perProperty[0].tax).toBe(14400);
  });

  it('honours an explicit premiumMonthsInYear value exactly', () => {
    const result = computePropertyTax([
      simpleProperty({
        rentReceived: 0,
        leasePremium: 360000,
        leaseTermMonths: 36,
        premiumMonthsInYear: 6,
      }),
    ], params);

    expect(result.perProperty[0].nav).toBe(48000);
    expect(result.perProperty[0].tax).toBe(7200);
  });
});
