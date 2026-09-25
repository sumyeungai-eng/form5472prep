// Pure logic behind the "Transactions per year" wizard step.
//
// This file is imported by a client component, so it must stay free of React,
// Prisma and Node imports. Everything that decides WHAT gets saved for a tax
// year lives here so it can be unit-tested; TransactionsReview.tsx only renders
// the questions and calls into these helpers.
//
// The save payload must keep landing in the same FilingYearData fields the old
// step used (contributions, distributions, reportableTransactions,
// otherTransactionsNote, ownerPaidCosts, zeroConfirmations,
// noReportableTransactions, nonCashTransfers), because Form 5472 Part V / Part VI
// / line 1c and pro forma 1120 item D are generated from them.

export type YesNo = "yes" | "no" | null;

export const REPORTABLE_CATEGORIES = [
  "contribution",
  "distribution",
  "loan_from_owner",
  "loan_to_owner",
] as const;

export type ZeroConfirmationKey =
  | "contributions"
  | "distributions"
  | "loansFromOwner"
  | "loansToOwner"
  | "ownerPaidCosts";

export type ZeroConfirmations = Partial<Record<ZeroConfirmationKey, boolean>>;

// The server does NOT fill these in for a "no reportable transactions" year —
// it stores whatever the client sends — so the "No" answer sends all five.
export const ALL_ZERO_CONFIRMATIONS: Required<ZeroConfirmations> = {
  contributions: true,
  distributions: true,
  loansFromOwner: true,
  loansToOwner: true,
  ownerPaidCosts: true,
};

export type OwnerPaidCostCategory =
  | "state_filing_fee"
  | "registered_agent"
  | "formation_or_ein_service"
  | "software_subscriptions"
  | "initial_bank_funding"
  | "other";

// Legacy rows only: new saves never add these (the generator turns each one
// into an extra Part V contribution row).
export type OwnerPaidCostRow = {
  category: OwnerPaidCostCategory;
  date: string;
  amountCents: number;
  note?: string;
};

export type NonCashTransferRow = {
  date: string;
  direction: "in" | "out";
  description: string;
  fairMarketValueCents: number;
  valuationMethod: string;
  alsoInPartV: boolean;
};

// Minimal shape of a detailed Part V row (uploaded, manually added, or saved).
export type TxRow = {
  date: string;
  description: string;
  counterparty: string;
  amountCents: number;
  category: string;
};

export type LoanDirection = "loan_from_owner" | "loan_to_owner";

export type LoanDraft = { amountUsd: string; date: string };

export const EMPTY_LOAN: LoanDraft = { amountUsd: "", date: "" };

// Loans entered through the short "any loans?" question are stored as ordinary
// reportableTransactions rows with these descriptions. On reload, a single row
// with the matching description is pulled back into the loan field.
export const LOAN_DESCRIPTIONS: Record<LoanDirection, string> = {
  loan_from_owner: "Loan from owner to LLC",
  loan_to_owner: "Loan from LLC to owner",
};

export type LoanRow = {
  date: string;
  description: string;
  counterparty: string;
  amountCents: number;
  category: LoanDirection;
  rule: string;
};

// Same USD → cents conversion the step has always used for typed amounts.
export function usdToCents(value: string | number): number {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

export function isReportableCategory(category: string): boolean {
  return (REPORTABLE_CATEGORIES as readonly string[]).includes(category);
}

export function isDateInTaxYear(value: string, taxYear: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day &&
    year === taxYear
  );
}

// Pull the loan rows created by the loan question back out of the saved rows so
// they reappear in the loan fields instead of the statement table. Only done
// when exactly one such row exists for a direction; anything else stays a
// detailed row (and is still saved unchanged).
export function extractSimpleLoans<T extends TxRow>(
  rows: T[],
): { rows: T[]; loans: Record<LoanDirection, LoanDraft> } {
  const loans: Record<LoanDirection, LoanDraft> = {
    loan_from_owner: { ...EMPTY_LOAN },
    loan_to_owner: { ...EMPTY_LOAN },
  };
  let rest = rows;
  for (const direction of Object.keys(LOAN_DESCRIPTIONS) as LoanDirection[]) {
    const matches = rest.filter(
      (row) =>
        row.category === direction &&
        row.description.trim() === LOAN_DESCRIPTIONS[direction] &&
        row.amountCents !== 0,
    );
    if (matches.length !== 1) continue;
    const match = matches[0];
    loans[direction] = {
      amountUsd: (Math.abs(match.amountCents) / 100).toFixed(2),
      date: match.date,
    };
    rest = rest.filter((row) => row !== match);
  }
  return { rows: rest, loans };
}

export function buildLoanRow(direction: LoanDirection, loan: LoanDraft): LoanRow | null {
  const cents = usdToCents(loan.amountUsd);
  if (cents === 0) return null;
  return {
    date: loan.date,
    description: LOAN_DESCRIPTIONS[direction],
    counterparty: "",
    // Same sign convention as manually added rows: money into the LLC is
    // positive, money out of it negative.
    amountCents: direction === "loan_to_owner" ? -cents : cents,
    category: direction,
    rule: "Loan question",
  };
}

// Everything the user can have entered for a year once they answer "Yes".
export type YearAnswerState<T extends TxRow> = {
  taxYear: number;
  // Detailed rows from uploads, manual entry, paste, or a previous save. May
  // include non-reportable categories (revenue etc.); those are never saved.
  transactions: T[];
  manualContributions?: number;
  manualDistributions?: number;
  loans: Record<LoanDirection, LoanDraft>;
  otherTransactionsNote: string;
  ownerPaidCosts: OwnerPaidCostRow[];
};

export type CategoryTotals = {
  contributions: number;
  distributions: number;
  contributionRowCount: number;
  distributionRowCount: number;
};

// Per category, detailed rows win over the typed total — mirroring the
// generator, which ignores the bare total when rows of that category exist.
export function categoryTotals(y: {
  transactions: TxRow[];
  manualContributions?: number;
  manualDistributions?: number;
}): CategoryTotals {
  let contributionCents = 0;
  let distributionCents = 0;
  let contributionRowCount = 0;
  let distributionRowCount = 0;
  for (const tx of y.transactions) {
    if (tx.category === "contribution") {
      contributionCents += Math.abs(tx.amountCents);
      contributionRowCount++;
    } else if (tx.category === "distribution") {
      distributionCents += Math.abs(tx.amountCents);
      distributionRowCount++;
    }
  }
  return {
    contributions:
      contributionRowCount > 0 ? contributionCents / 100 : (y.manualContributions ?? 0),
    distributions:
      distributionRowCount > 0 ? distributionCents / 100 : (y.manualDistributions ?? 0),
    contributionRowCount,
    distributionRowCount,
  };
}

export function loanError(loan: LoanDraft, taxYear: number): string | null {
  const raw = loan.amountUsd.trim();
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return "Enter an amount of 0 or more.";
  if (usdToCents(raw) === 0) return null;
  if (!isDateInTaxYear(loan.date, taxYear)) return `Enter the loan date (within ${taxYear}).`;
  return null;
}

export type YesErrors = {
  // Nothing at all was entered after answering "Yes".
  empty: boolean;
  contributions: string | null;
  distributions: string | null;
  loans: Record<LoanDirection, string | null>;
};

export const EMPTY_ANSWER_MESSAGE = "Enter an amount, or answer No above.";

export function yesAnswerErrors<T extends TxRow>(y: YearAnswerState<T>): YesErrors {
  const totals = categoryTotals(y);
  const hasContent =
    totals.contributions > 0 ||
    totals.distributions > 0 ||
    y.transactions.some((tx) => isReportableCategory(tx.category)) ||
    usdToCents(y.loans.loan_from_owner.amountUsd) > 0 ||
    usdToCents(y.loans.loan_to_owner.amountUsd) > 0 ||
    y.ownerPaidCosts.length > 0 ||
    y.otherTransactionsNote.trim().length > 0;
  const negative = "Enter an amount of 0 or more.";
  return {
    empty: !hasContent,
    contributions:
      totals.contributionRowCount === 0 && (y.manualContributions ?? 0) < 0 ? negative : null,
    distributions:
      totals.distributionRowCount === 0 && (y.manualDistributions ?? 0) < 0 ? negative : null,
    loans: {
      loan_from_owner: loanError(y.loans.loan_from_owner, y.taxYear),
      loan_to_owner: loanError(y.loans.loan_to_owner, y.taxYear),
    },
  };
}

export function yesErrorMessages(errors: YesErrors): string[] {
  const out: string[] = [];
  if (errors.empty) out.push(EMPTY_ANSWER_MESSAGE);
  if (errors.contributions) out.push(`Money you put in: ${errors.contributions}`);
  if (errors.distributions) out.push(`Money you took out: ${errors.distributions}`);
  if (errors.loans.loan_from_owner) out.push(`You lent the LLC: ${errors.loans.loan_from_owner}`);
  if (errors.loans.loan_to_owner) out.push(`The LLC lent you: ${errors.loans.loan_to_owner}`);
  return out;
}

// Initial answer to "Did any money move between you and the LLC?" from what is
// already saved for the year.
export function deriveInitialAnswer(saved: {
  noReportableTransactions?: boolean;
  contributions: number;
  distributions: number;
  reportableRowCount: number;
  ownerPaidCostCount: number;
  otherTransactionsNote?: string | null;
  /** Saved per-category "None this year" answers from the old step. */
  zeroConfirmations?: unknown;
}): YesNo {
  if (saved.noReportableTransactions === true) return "no";
  if (
    saved.contributions > 0 ||
    saved.distributions > 0 ||
    saved.reportableRowCount > 0 ||
    saved.ownerPaidCostCount > 0 ||
    (saved.otherTransactionsNote ?? "").trim().length > 0
  ) {
    return "yes";
  }
  // Someone who ticked all five old "None this year" boxes already said no.
  const confirmed = saved.zeroConfirmations as Record<string, unknown> | null | undefined;
  if (confirmed && (Object.keys(ALL_ZERO_CONFIRMATIONS) as ZeroConfirmationKey[]).every((key) => confirmed[key] === true)) {
    return "no";
  }
  return null;
}

export type YearPayload<T extends TxRow> = {
  taxYear: number;
  totalAssetsYearEnd: number;
  contributions: number;
  distributions: number;
  reportableTransactions: Array<T | LoanRow>;
  otherTransactionsNote: string;
  noReportableTransactions: boolean;
  replaceReportableTransactions: boolean;
  ownerPaidCosts: OwnerPaidCostRow[];
  zeroConfirmations: ZeroConfirmations;
  nonCashTransfers: NonCashTransferRow[];
};

// Builds the per-year object handed to the wizard's onSubmit (and from there
// PATCHed to /api/filings/[id] as one yearData entry).
export function buildYearPayload<T extends TxRow>(
  answer: "yes" | "no",
  y: YearAnswerState<T> & {
    totalAssetsYearEnd: number;
    nonCashTransfers: NonCashTransferRow[];
  },
): YearPayload<T> {
  const common = {
    taxYear: y.taxYear,
    totalAssetsYearEnd: y.totalAssetsYearEnd,
    // Always replace: the step holds the full row list for the year, so an
    // empty list means "no rows", not "client didn't rehydrate".
    replaceReportableTransactions: true,
    // Independent of the money question (Part VI).
    nonCashTransfers: y.nonCashTransfers,
  };

  if (answer === "no") {
    // Same shape the old "I had no reportable transactions" path sent. The
    // server additionally zeroes contributions/distributions, rows, owner-paid
    // costs and the note when noReportableTransactions is true.
    return {
      ...common,
      contributions: 0,
      distributions: 0,
      reportableTransactions: [],
      otherTransactionsNote: "",
      noReportableTransactions: true,
      ownerPaidCosts: [],
      zeroConfirmations: { ...ALL_ZERO_CONFIRMATIONS },
    };
  }

  const totals = categoryTotals(y);
  const detailRows = y.transactions.filter((tx) => isReportableCategory(tx.category));
  const loanRows = (["loan_from_owner", "loan_to_owner"] as const)
    .map((direction) => buildLoanRow(direction, y.loans[direction]))
    .filter((row): row is LoanRow => row !== null);
  const reportableTransactions: Array<T | LoanRow> = [...detailRows, ...loanRows];

  const hasRows = (category: string) =>
    reportableTransactions.some((tx) => tx.category === category);

  // Answering "Yes" and leaving a question blank confirms $0 for it, which is
  // what keeps pre-flight W02 quiet. Categories with an amount are left out,
  // exactly as the old per-category checkboxes did.
  const zeroConfirmations: ZeroConfirmations = {};
  if (totals.contributions <= 0 && !hasRows("contribution")) zeroConfirmations.contributions = true;
  if (totals.distributions <= 0 && !hasRows("distribution")) zeroConfirmations.distributions = true;
  if (!hasRows("loan_from_owner")) zeroConfirmations.loansFromOwner = true;
  if (!hasRows("loan_to_owner")) zeroConfirmations.loansToOwner = true;
  if (y.ownerPaidCosts.length === 0) zeroConfirmations.ownerPaidCosts = true;

  return {
    ...common,
    contributions: Math.max(0, totals.contributions),
    distributions: Math.max(0, totals.distributions),
    reportableTransactions,
    otherTransactionsNote: y.otherTransactionsNote.trim(),
    noReportableTransactions: false,
    ownerPaidCosts: y.ownerPaidCosts,
    zeroConfirmations,
  };
}
