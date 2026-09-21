import type { PackageInput, ReportableTx, NonCashTransfer } from "./generatePackage";

type NullablePartial<T> = { [K in keyof T]?: T[K] | null };

type PackageFilingRow = NullablePartial<Omit<PackageInput, "yearData">> & {
  yearData: Array<{
    taxYear: number;
    totalAssetsYearEnd: unknown;
    contributions: unknown;
    distributions: unknown;
    otherTransactionsNote: string | null;
    reportableTransactions?: unknown;
    nonCashTransfers?: unknown;
    rcsWhyMissed?: string | null;
    rcsWhenLearned?: string | null;
    rcsNoIrsNoticeConfirmed?: boolean | null;
  }>;
};

export function filingToPackageInput(filing: PackageFilingRow): PackageInput {
  return {
    llcName: requiredString(filing.llcName),
    llcEin: requiredString(filing.llcEin),
    llcAddress: requiredString(filing.llcAddress),
    llcCity: requiredString(filing.llcCity),
    llcState: requiredString(filing.llcState),
    llcZip: requiredString(filing.llcZip),
    llcCountry: filing.llcCountry ?? "USA",
    llcCountryBusiness: filing.llcCountryBusiness,
    llcMemberCount: filing.llcMemberCount,
    llcAddressIsRegisteredAgentOnly: filing.llcAddressIsRegisteredAgentOnly,
    priorForm5472Filed: filing.priorForm5472Filed,
    hasUsSourceIncome: filing.hasUsSourceIncome,
    usTaxWithheld: filing.usTaxWithheld,
    llcDateIncorporated: requiredDate(filing.llcDateIncorporated),
    llcBusinessActivity: requiredString(filing.llcBusinessActivity),
    llcBusinessCode: requiredString(filing.llcBusinessCode),
    ownerName: requiredString(filing.ownerName),
    ownerAddress: requiredString(filing.ownerAddress),
    ownerAddressStreet: filing.ownerAddressStreet,
    ownerAddressCity: filing.ownerAddressCity,
    ownerAddressState: filing.ownerAddressState,
    ownerAddressPostal: filing.ownerAddressPostal,
    ownerAddressCountry: filing.ownerAddressCountry,
    ownerHasFtin: filing.ownerHasFtin,
    ownerNoPostalCode: filing.ownerNoPostalCode,
    ownerCountryCitizenship: requiredString(filing.ownerCountryCitizenship),
    ownerCountryTaxResidence: requiredString(filing.ownerCountryTaxResidence),
    ownerCountryBusiness: requiredString(filing.ownerCountryBusiness),
    ownerFtin: filing.ownerHasFtin === false ? (filing.ownerFtin ?? "None") : requiredString(filing.ownerFtin),
    ownerItin: filing.ownerItin ?? null,
    ownerReferenceId: filing.ownerReferenceId ?? null,
    taxYears: filing.taxYears ?? [],
    isDiirsp: filing.isDiirsp ?? false,
    isFinalReturn: filing.isFinalReturn ?? undefined,
    dissolvedAt: filing.dissolvedAt ?? null,
    extensionFiled: filing.extensionFiled ?? null,
    extensionTransmittedAt: filing.extensionTransmittedAt,
    reasonableCauseNarrative: filing.reasonableCauseNarrative ?? null,
    yearData: filing.yearData.map((year) => ({
      taxYear: year.taxYear,
      totalAssetsYearEnd: Number(year.totalAssetsYearEnd),
      contributions: Number(year.contributions),
      distributions: Number(year.distributions),
      otherTransactionsNote: year.otherTransactionsNote,
      reportableTransactions: parseReportableTransactions(year.reportableTransactions),
      nonCashTransfers: parseNonCashTransfers(year.nonCashTransfers),
      rcsWhyMissed: year.rcsWhyMissed ?? null,
      rcsWhenLearned: year.rcsWhenLearned ?? null,
      rcsNoIrsNoticeConfirmed: year.rcsNoIrsNoticeConfirmed ?? null,
    })),
  };
}

function requiredString(value: string | null | undefined): string {
  return value ?? "";
}

function requiredDate(value: Date | string | null | undefined): Date {
  return value instanceof Date ? value : new Date(value ?? 0);
}

function parseReportableTransactions(value: unknown): ReportableTx[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ReportableTx => {
    if (!item || typeof item !== "object") return false;
    const tx = item as Record<string, unknown>;
    return (
      typeof tx.date === "string" &&
      typeof tx.description === "string" &&
      typeof tx.amountCents === "number" &&
      Number.isFinite(tx.amountCents) &&
      typeof tx.category === "string" &&
      (tx.counterparty === undefined || typeof tx.counterparty === "string")
    );
  });
}

function parseNonCashTransfers(value: unknown): NonCashTransfer[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is NonCashTransfer => {
    if (!item || typeof item !== "object") return false;
    const transfer = item as Record<string, unknown>;
    return (
      typeof transfer.date === "string" &&
      (transfer.direction === "in" || transfer.direction === "out") &&
      typeof transfer.description === "string" &&
      typeof transfer.fairMarketValueCents === "number" &&
      Number.isFinite(transfer.fairMarketValueCents) &&
      typeof transfer.valuationMethod === "string" &&
      typeof transfer.alsoInPartV === "boolean"
    );
  });
}
