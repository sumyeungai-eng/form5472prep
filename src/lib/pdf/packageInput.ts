import {
  NeedsReviewError,
  type PackageInput,
  type ReportableTx,
  type NonCashTransfer,
  type OwnerPaidCost,
  type ZeroConfirmations,
} from "./generatePackage";

type NullablePartial<T> = { [K in keyof T]?: T[K] | null };

export type PackageFilingRow = NullablePartial<Omit<PackageInput, "yearData">> & {
  yearData: Array<{
    taxYear: number;
    totalAssetsYearEnd: unknown;
    contributions: unknown;
    distributions: unknown;
    otherTransactionsNote: string | null;
    reportableTransactions?: unknown;
    nonCashTransfers?: unknown;
    ownerPaidCosts?: unknown;
    zeroConfirmations?: unknown;
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
    llcCountry: requiredString(filing.llcCountry),
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
    ownerFtin: filing.ownerHasFtin === false
      ? ((filing.ownerFtin ?? "").trim() || "None")
      : requiredString(filing.ownerFtin),
    ownerItin: filing.ownerItin ?? null,
    ownerReferenceId: filing.ownerReferenceId ?? null,
    taxYears: filing.taxYears ?? [],
    isDiirsp: filing.isDiirsp ?? false,
    isFinalReturn: filing.isFinalReturn ?? false,
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
      reportableTransactions: parseReportableTransactions(year.reportableTransactions, year.taxYear),
      nonCashTransfers: parseNonCashTransfers(year.nonCashTransfers, year.taxYear),
      ownerPaidCosts: parseOwnerPaidCosts(year.ownerPaidCosts, year.taxYear),
      zeroConfirmations: parseZeroConfirmations(year.zeroConfirmations),
      rcsWhyMissed: year.rcsWhyMissed ?? null,
      rcsWhenLearned: year.rcsWhenLearned ?? null,
      rcsNoIrsNoticeConfirmed: year.rcsNoIrsNoticeConfirmed ?? null,
    })),
  };
}

function parseOwnerPaidCosts(value: unknown, taxYear: number): OwnerPaidCost[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new NeedsReviewError(`Tax year ${taxYear}: owner-paid cost row ${index + 1} is malformed.`);
    }
    const cost = item as Record<string, unknown>;
    const validCategory = [
      "state_filing_fee",
      "registered_agent",
      "formation_or_ein_service",
      "software_subscriptions",
      "initial_bank_funding",
      "other",
    ].includes(cost.category as string);
    const valid =
      validCategory &&
      typeof cost.category === "string" &&
      typeof cost.date === "string" &&
      typeof cost.amountCents === "number" &&
      Number.isFinite(cost.amountCents) &&
      (cost.note === undefined || typeof cost.note === "string");
    if (!valid) {
      throw new NeedsReviewError(`Tax year ${taxYear}: owner-paid cost row ${index + 1} is malformed.`);
    }
    return {
      category: cost.category as OwnerPaidCost["category"],
      date: cost.date as string,
      amountCents: cost.amountCents as number,
      note: cost.note as string | undefined,
    };
  });
}

function parseZeroConfirmations(value: unknown): ZeroConfirmations {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  const out: ZeroConfirmations = {};
  for (const key of [
    "contributions",
    "distributions",
    "loansFromOwner",
    "loansToOwner",
    "ownerPaidCosts",
  ] as const) {
    if (raw[key] === true) out[key] = true;
  }
  return out;
}

function requiredString(value: string | null | undefined): string {
  return value ?? "";
}

function requiredDate(value: Date | string | null | undefined): Date {
  return value instanceof Date ? value : new Date(value ?? 0);
}

function parseReportableTransactions(value: unknown, taxYear: number): ReportableTx[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index): ReportableTx => {
    if (!item || typeof item !== "object") {
      throw new NeedsReviewError(`Tax year ${taxYear}: reportable transaction row ${index + 1} is malformed.`);
    }
    const tx = item as Record<string, unknown>;
    const valid =
      typeof tx.date === "string" &&
      typeof tx.description === "string" &&
      typeof tx.amountCents === "number" &&
      Number.isFinite(tx.amountCents) &&
      typeof tx.category === "string" &&
      (tx.counterparty === undefined || typeof tx.counterparty === "string");
    if (!valid) {
      throw new NeedsReviewError(`Tax year ${taxYear}: reportable transaction row ${index + 1} is malformed.`);
    }
    return tx as ReportableTx;
  });
}

function parseNonCashTransfers(value: unknown, taxYear: number): NonCashTransfer[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index): NonCashTransfer => {
    if (!item || typeof item !== "object") {
      throw new NeedsReviewError(`Tax year ${taxYear}: non-cash transfer row ${index + 1} is malformed.`);
    }
    const transfer = item as Record<string, unknown>;
    const valid =
      typeof transfer.date === "string" &&
      (transfer.direction === "in" || transfer.direction === "out") &&
      typeof transfer.description === "string" &&
      typeof transfer.fairMarketValueCents === "number" &&
      Number.isFinite(transfer.fairMarketValueCents) &&
      typeof transfer.valuationMethod === "string" &&
      typeof transfer.alsoInPartV === "boolean";
    if (!valid) {
      throw new NeedsReviewError(`Tax year ${taxYear}: non-cash transfer row ${index + 1} is malformed.`);
    }
    return transfer as NonCashTransfer;
  });
}
