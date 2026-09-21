import type { generatePackage } from "../generatePackage";

export const finalisedAt = new Date("2026-09-22T12:00:00.000Z");

export type FilingFixture = Parameters<typeof generatePackage>[0];

const base: FilingFixture = {
  llcName: "Example Holdings LLC",
  llcEin: "12-3456789",
  llcAddress: "123 Market Street Suite 400",
  llcCity: "Miami",
  llcState: "FL",
  llcZip: "33101",
  llcCountry: "USA",
  llcCountryBusiness: "United States",
  llcDateIncorporated: new Date("2020-01-01T00:00:00.000Z"),
  llcBusinessActivity: "Investment holding",
  llcBusinessCode: "523900",
  ownerName: "Example Owner",
  ownerAddress: "88 Queen Road Central, Suite 1200, Central, Hong Kong",
  ownerCountryCitizenship: "Hong Kong",
  ownerCountryTaxResidence: "Hong Kong",
  ownerCountryBusiness: "Hong Kong",
  ownerFtin: "HK1234567",
  ownerItin: null,
  ownerReferenceId: "EXAMPLEOWNER1",
  taxYears: [2025],
  isDiirsp: false,
  isFinalReturn: false,
  dissolvedAt: null,
  extensionFiled: "yes",
  extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
  reasonableCauseNarrative: null,
  yearData: [],
};

function tx(date: string, description: string, amountCents: number, category: "contribution" | "distribution") {
  return { date, description, counterparty: "Example Owner", amountCents, category };
}

function year(taxYear: number, rows = [tx(`${taxYear}-02-15`, "Owner capital contribution", 100_00, "contribution")]) {
  return {
    taxYear,
    totalAssetsYearEnd: 1000,
    contributions: 0,
    distributions: 0,
    otherTransactionsNote: null,
    reportableTransactions: rows,
  };
}

export const F1: FilingFixture = {
  ...base,
  taxYears: [2025],
  yearData: [year(2025, [
    tx("2025-01-10", "Owner capital contribution", 10_000_00, "contribution"),
    tx("2025-06-15", "Owner distribution", -2_500_00, "distribution"),
  ])],
};

export const F2: FilingFixture = {
  ...base,
  llcDateIncorporated: new Date("2025-04-13T00:00:00.000Z"),
  ownerName: "Mei Example",
  ownerAddress:
    "Flat 1208, Example Tower, 999 Very Long Harbour View Road, Central District, Hong Kong SAR, Hong Kong",
  ownerFtin: "None",
  ownerReferenceId: "MEIEXAMPLE2025",
  taxYears: [2025],
  yearData: [year(2025, [
    tx("2025-04-13", "Owner paid state formation costs", 800_00, "contribution"),
    tx("2025-04-15", "Initial bank funding", 5_000_00, "contribution"),
  ])],
};

export const F3: FilingFixture = {
  ...base,
  llcName: "Example Short Year LLC",
  llcBusinessActivity: "Unclassified establishments",
  llcBusinessCode: "999000",
  llcDateIncorporated: new Date("2025-03-10T00:00:00.000Z"),
  isFinalReturn: true,
  dissolvedAt: new Date("2025-12-20T00:00:00.000Z"),
  taxYears: [2025],
  yearData: [year(2025, [tx("2025-03-10", "Initial funding", 1_000_00, "contribution")])],
};

export const F4: FilingFixture = {
  ...base,
  taxYears: [2025],
  extensionFiled: "yes",
  extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
  yearData: [year(2025, [tx("2025-05-01", "Owner capital contribution", 7_500_00, "contribution")])],
};

export const F5: FilingFixture = {
  ...base,
  llcName: "Example Portfolio LLC",
  taxYears: [2022, 2023, 2024],
  extensionFiled: "no",
  reasonableCauseNarrative:
    "The owner learned of the Form 5472 filing requirement after the due dates and promptly arranged this submission.",
  yearData: [
    year(2022, [tx("2022-02-01", "Securities contribution by owner", 25_000_00, "contribution")]),
    year(2023, [tx("2023-03-01", "Owner capital contribution", 15_000_00, "contribution")]),
    year(2024, [tx("2024-07-01", "Owner distribution", -3_000_00, "distribution")]),
  ],
};

export const F6: FilingFixture = {
  ...base,
  taxYears: [2025],
  extensionFiled: "not_sure",
  extensionTransmittedAt: null,
  yearData: [year(2025, [tx("2025-08-01", "Owner capital contribution", 6_000_00, "contribution")])],
};

export const F7: FilingFixture = {
  ...base,
  llcAddress: "251 Little Falls Drive",
  llcCity: "Wilmington",
  llcState: "DE",
  llcZip: "19808",
  llcCountryBusiness: "United States",
  taxYears: [2025],
  yearData: [year(2025, [tx("2025-01-05", "Owner capital contribution", 2_500_00, "contribution")])],
};

export const F8: FilingFixture = {
  ...base,
  llcName: "Example Historical LLC",
  llcDateIncorporated: new Date("2015-01-01T00:00:00.000Z"),
  taxYears: [2018, 2019],
  extensionFiled: "no",
  reasonableCauseNarrative:
    "The owner learned of the Form 5472 filing requirement after the due dates and promptly arranged this submission.",
  yearData: [
    year(2018, [tx("2018-02-01", "Owner capital contribution", 12_000_00, "contribution")]),
    year(2019, [tx("2019-03-01", "Owner distribution", -4_500_00, "distribution")]),
  ],
};

export const fixtures = { F1, F2, F3, F4, F5, F6, F7, F8 };
