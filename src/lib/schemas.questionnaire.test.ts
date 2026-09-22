import { describe, expect, it } from "vitest";
import {
  ITIN_IN_FTIN_MESSAGE,
  entitySchema,
  makeYearDataSchema,
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
});
