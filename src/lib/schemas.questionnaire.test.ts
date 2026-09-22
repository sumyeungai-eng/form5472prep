import { describe, expect, it } from "vitest";
import {
  EIN_DEGENERATE_MESSAGE,
  ITIN_IN_FTIN_MESSAGE,
  einSchema,
  entitySchema,
  makeOwnerPaidCostsSchema,
  makeYearDataSchema,
  selectableTaxYears,
  ownerSchema,
} from "./schemas";

const ownerBase = {
  ownerName: "Example Owner",
  ownerAddress: "1 Example Street, Example City, Province 10000, Canada",
  ownerCountryCitizenship: "Canada",
  ownerCountryTaxResidence: "Canada",
  ownerCountryBusiness: "Canada",
  ownerHasFtin: true,
  ownerFtin: "CA12345",
  ownerItin: "",
  ownerReferenceId: "EXAMPLE123",
};

describe("questionnaire schemas", () => {
  it("rejects a U.S. ITIN pattern in the FTIN field", () => {
    const parsed = ownerSchema.safeParse({ ...ownerBase, ownerFtin: "912-34-5678" });
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe(ITIN_IN_FTIN_MESSAGE);
  });

  it("accepts non-ITIN FTIN values even when the length warning would show", () => {
    expect(ownerSchema.safeParse({ ...ownerBase, ownerFtin: "AB12" }).success).toBe(true);
    expect(
      ownerSchema.safeParse({
        ...ownerBase,
        ownerFtin: "ABCDEFGHIJKLMNOPQRSTU",
      }).success,
    ).toBe(true);
  });

  it("allows no FTIN when ownerHasFtin is false", () => {
    expect(
      ownerSchema.safeParse({
        ...ownerBase,
        ownerHasFtin: false,
        ownerFtin: "",
      }).success,
    ).toBe(true);
    expect(
      ownerSchema.safeParse({
        ...ownerBase,
        ownerHasFtin: false,
        ownerFtin: null,
      }).success,
    ).toBe(true);
  });

  it("validates the prior Form 5472 enum", () => {
    const entity = {
      llcName: "Example LLC",
      llcEin: "12-3456789",
      llcAddress: "123 Main St",
      llcCity: "Miami",
      llcState: "FL",
      llcZip: "33101",
      llcCountryBusiness: "United States",
      llcAddressIsRegisteredAgentOnly: false,
      priorForm5472Filed: "not_sure",
      llcDateIncorporated: "2024-01-01",
      llcBusinessActivity: "Investment activities",
      llcBusinessCode: "523900",
    };
    const valid = entitySchema.safeParse(entity);
    expect(valid.success).toBe(true);

    const invalid = entitySchema.safeParse({
      ...entity,
      priorForm5472Filed: "maybe",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects degenerate EINs while preserving the normal format rule", () => {
    expect(einSchema.safeParse("12-3456789").success).toBe(true);
    for (const value of ["00-0000000", "111111111", "22-2222222"]) {
      const parsed = einSchema.safeParse(value);
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0]?.message).toBe(EIN_DEGENERATE_MESSAGE);
    }
    expect(einSchema.safeParse("12-345678").success).toBe(false);
  });

  it("builds selectable tax years from formation year and an injected clock", () => {
    expect(selectableTaxYears(false, null, new Date("2026-12-31T23:59:59.000Z"))).toEqual([
      2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ]);
    expect(selectableTaxYears(false, null, new Date("2027-01-01T00:00:00.000Z"))).toEqual([
      2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(selectableTaxYears(false, "2021-05-10", new Date("2026-09-22T00:00:00.000Z"))).toEqual([
      2021, 2022, 2023, 2024, 2025,
    ]);
    expect(selectableTaxYears(false, "2016-05-10", new Date("2026-09-22T00:00:00.000Z"))).toEqual([
      2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ]);
    expect(selectableTaxYears(true, "2021-05-10", new Date("2026-09-22T00:00:00.000Z"))).toEqual([
      2021, 2022, 2023, 2024, 2025, 2026,
    ]);
  });

  it("validates non-cash transfer direction, date format, and non-negative cents", () => {
    const schema = makeYearDataSchema(false);
    const base = {
      taxYear: 2025,
      totalAssetsYearEnd: 0,
      contributions: 0,
      distributions: 0,
      nonCashTransfers: [
        {
          date: "2025-06-01",
          direction: "in",
          description: "Shares",
          fairMarketValueCents: 100_00,
          valuationMethod: "Broker statement",
          alsoInPartV: false,
        },
      ],
    };
    expect(schema.safeParse(base).success).toBe(true);
    expect(
      schema.safeParse({
        ...base,
        nonCashTransfers: [{ ...base.nonCashTransfers[0], fairMarketValueCents: -1 }],
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        ...base,
        nonCashTransfers: [{ ...base.nonCashTransfers[0], direction: "sideways" }],
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        ...base,
        nonCashTransfers: [{ ...base.nonCashTransfers[0], date: "06/01/2025" }],
      }).success,
    ).toBe(false);
  });

  it("validates owner-paid costs by shape, note, and tax-year date", () => {
    const schema = makeOwnerPaidCostsSchema(2025);
    expect(
      schema.safeParse([
        { category: "state_filing_fee", date: "2025-01-15", amountCents: 150_00 },
        { category: "other", date: "2025-02-01", amountCents: 25_00, note: "Courier" },
      ]).success,
    ).toBe(true);
    expect(
      schema.safeParse([{ category: "other", date: "2025-02-01", amountCents: 25_00 }]).success,
    ).toBe(false);
    expect(
      schema.safeParse([{ category: "registered_agent", date: "2024-12-31", amountCents: 25_00 }]).success,
    ).toBe(false);
    expect(
      schema.safeParse([{ category: "registered_agent", date: "2025-02-30", amountCents: 25_00 }]).success,
    ).toBe(false);
  });
});
