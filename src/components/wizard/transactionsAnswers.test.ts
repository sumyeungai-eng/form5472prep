import { describe, expect, it } from "vitest";
import {
  ALL_ZERO_CONFIRMATIONS,
  buildYearPayload,
  categoryTotals,
  deriveInitialAnswer,
  EMPTY_ANSWER_MESSAGE,
  EMPTY_LOAN,
  extractSimpleLoans,
  LOAN_DESCRIPTIONS,
  loanError,
  usdToCents,
  yesAnswerErrors,
  yesErrorMessages,
  type NonCashTransferRow,
  type OwnerPaidCostRow,
  type TxRow,
  type YearAnswerState,
} from "./transactionsAnswers";

type Row = TxRow & { rule: string };

function row(category: string, amountCents: number, extra: Partial<Row> = {}): Row {
  return {
    date: "2024-06-01",
    description: `${category} row`,
    counterparty: "",
    amountCents,
    category,
    rule: "Manually entered",
    ...extra,
  };
}

type FullYear = YearAnswerState<Row> & {
  totalAssetsYearEnd: number;
  nonCashTransfers: NonCashTransferRow[];
};

function yearState(overrides: Partial<FullYear> = {}): FullYear {
  return {
    taxYear: 2024,
    transactions: [],
    manualContributions: undefined,
    manualDistributions: undefined,
    loans: { loan_from_owner: { ...EMPTY_LOAN }, loan_to_owner: { ...EMPTY_LOAN } },
    otherTransactionsNote: "",
    ownerPaidCosts: [],
    totalAssetsYearEnd: 1234.5,
    nonCashTransfers: [],
    ...overrides,
  };
}

const LEGACY_COST: OwnerPaidCostRow = {
  category: "state_filing_fee",
  date: "2024-02-01",
  amountCents: 30000,
};

describe("usdToCents", () => {
  it("converts typed USD to integer cents and floors at zero", () => {
    expect(usdToCents("12.34")).toBe(1234);
    expect(usdToCents("")).toBe(0);
    expect(usdToCents("abc")).toBe(0);
    expect(usdToCents("-5")).toBe(0);
    expect(usdToCents(100)).toBe(10000);
  });
});

describe("deriveInitialAnswer", () => {
  const blank = {
    contributions: 0,
    distributions: 0,
    reportableRowCount: 0,
    ownerPaidCostCount: 0,
    otherTransactionsNote: "",
  };

  it("answers No when the year was saved as no reportable transactions", () => {
    expect(deriveInitialAnswer({ ...blank, noReportableTransactions: true })).toBe("no");
    // The flag wins even if stale amounts are somehow present.
    expect(
      deriveInitialAnswer({ ...blank, noReportableTransactions: true, contributions: 50 }),
    ).toBe("no");
  });

  it("answers Yes when any amount, row, legacy cost or note exists", () => {
    expect(deriveInitialAnswer({ ...blank, contributions: 10 })).toBe("yes");
    expect(deriveInitialAnswer({ ...blank, distributions: 10 })).toBe("yes");
    expect(deriveInitialAnswer({ ...blank, reportableRowCount: 1 })).toBe("yes");
    expect(deriveInitialAnswer({ ...blank, ownerPaidCostCount: 1 })).toBe("yes");
    expect(deriveInitialAnswer({ ...blank, otherTransactionsNote: "Rent paid to me" })).toBe("yes");
  });

  it("treats all five old None-this-year confirmations as No", () => {
    const all = { contributions: true, distributions: true, loansFromOwner: true, loansToOwner: true, ownerPaidCosts: true };
    expect(deriveInitialAnswer({ ...blank, zeroConfirmations: all })).toBe("no");
    expect(deriveInitialAnswer({ ...blank, zeroConfirmations: { ...all, loansToOwner: false } })).toBeNull();
    expect(deriveInitialAnswer({ ...blank, contributions: 10, zeroConfirmations: all })).toBe("yes");
  });

  it("leaves the question unanswered for a fresh year", () => {
    expect(deriveInitialAnswer(blank)).toBeNull();
    expect(deriveInitialAnswer({ ...blank, otherTransactionsNote: "   " })).toBeNull();
    expect(deriveInitialAnswer({ ...blank, otherTransactionsNote: null })).toBeNull();
  });
});

describe("extractSimpleLoans", () => {
  it("pulls a single loan-question row per direction back into the loan fields", () => {
    const rows = [
      row("contribution", 5000),
      row("loan_from_owner", 250000, {
        description: LOAN_DESCRIPTIONS.loan_from_owner,
        date: "2024-03-15",
      }),
      row("loan_to_owner", -10000, {
        description: LOAN_DESCRIPTIONS.loan_to_owner,
        date: "2024-09-01",
      }),
    ];
    const out = extractSimpleLoans(rows);
    expect(out.rows).toEqual([rows[0]]);
    expect(out.loans.loan_from_owner).toEqual({ amountUsd: "2500.00", date: "2024-03-15" });
    expect(out.loans.loan_to_owner).toEqual({ amountUsd: "100.00", date: "2024-09-01" });
  });

  it("leaves statement loan rows and ambiguous duplicates as detailed rows", () => {
    const rows = [
      row("loan_from_owner", 1000, { description: "Wire from J Smith" }),
      row("loan_to_owner", -100, { description: LOAN_DESCRIPTIONS.loan_to_owner }),
      row("loan_to_owner", -200, { description: LOAN_DESCRIPTIONS.loan_to_owner }),
    ];
    const out = extractSimpleLoans(rows);
    expect(out.rows).toEqual(rows);
    expect(out.loans.loan_from_owner).toEqual(EMPTY_LOAN);
    expect(out.loans.loan_to_owner).toEqual(EMPTY_LOAN);
  });

  it("round-trips a saved loan through buildYearPayload unchanged", () => {
    const saved = [
      row("loan_from_owner", 250000, {
        description: LOAN_DESCRIPTIONS.loan_from_owner,
        date: "2024-03-15",
      }),
    ];
    const { rows, loans } = extractSimpleLoans(saved);
    const payload = buildYearPayload("yes", yearState({ transactions: rows, loans }));
    expect(payload.reportableTransactions).toEqual([
      {
        date: "2024-03-15",
        description: LOAN_DESCRIPTIONS.loan_from_owner,
        counterparty: "",
        amountCents: 250000,
        category: "loan_from_owner",
        rule: "Loan question",
      },
    ]);
  });
});

describe("categoryTotals", () => {
  it("uses typed totals when there are no detailed rows", () => {
    expect(
      categoryTotals({ transactions: [], manualContributions: 500, manualDistributions: 20 }),
    ).toMatchObject({ contributions: 500, distributions: 20, contributionRowCount: 0 });
  });

  it("lets detailed rows win per category, like the generator", () => {
    const totals = categoryTotals({
      transactions: [row("contribution", 12345), row("contribution", 100), row("revenue", 99999)],
      manualContributions: 500,
      manualDistributions: 20,
    });
    expect(totals.contributions).toBeCloseTo(124.45);
    expect(totals.contributionRowCount).toBe(2);
    // No distribution rows → the typed distribution total still counts.
    expect(totals.distributions).toBe(20);
    expect(totals.distributionRowCount).toBe(0);
  });
});

describe("loanError / yesAnswerErrors", () => {
  it("requires a date inside the tax year once a loan amount is entered", () => {
    expect(loanError({ amountUsd: "", date: "" }, 2024)).toBeNull();
    expect(loanError({ amountUsd: "0", date: "" }, 2024)).toBeNull();
    expect(loanError({ amountUsd: "500", date: "" }, 2024)).toBe("Enter the loan date (within 2024).");
    expect(loanError({ amountUsd: "500", date: "2023-12-31" }, 2024)).toBe(
      "Enter the loan date (within 2024).",
    );
    expect(loanError({ amountUsd: "500", date: "2024-02-30" }, 2024)).toBe(
      "Enter the loan date (within 2024).",
    );
    expect(loanError({ amountUsd: "500", date: "2024-12-31" }, 2024)).toBeNull();
    expect(loanError({ amountUsd: "-1", date: "2024-01-01" }, 2024)).toBe(
      "Enter an amount of 0 or more.",
    );
  });

  it("flags a Yes answer with nothing entered", () => {
    const errors = yesAnswerErrors(yearState({ manualContributions: 0 }));
    expect(errors.empty).toBe(true);
    expect(yesErrorMessages(errors)).toEqual([EMPTY_ANSWER_MESSAGE]);
  });

  it("does not count non-reportable statement rows as an answer", () => {
    expect(yesAnswerErrors(yearState({ transactions: [row("revenue", 5000)] })).empty).toBe(true);
  });

  it("accepts any one of the Yes inputs", () => {
    const cases: Array<Partial<YearAnswerState<Row>>> = [
      { manualContributions: 1 },
      { manualDistributions: 1 },
      { transactions: [row("distribution", -100)] },
      { loans: { loan_from_owner: { amountUsd: "10", date: "2024-05-05" }, loan_to_owner: EMPTY_LOAN } },
      { loans: { loan_from_owner: EMPTY_LOAN, loan_to_owner: { amountUsd: "10", date: "2024-05-05" } } },
      { ownerPaidCosts: [LEGACY_COST] },
      { otherTransactionsNote: "LLC rented my office" },
    ];
    for (const c of cases) {
      const errors = yesAnswerErrors(yearState(c));
      expect(yesErrorMessages(errors), JSON.stringify(c)).toEqual([]);
    }
  });

  it("reports a loan without a date even when other amounts exist", () => {
    const errors = yesAnswerErrors(
      yearState({
        manualContributions: 100,
        loans: { loan_from_owner: EMPTY_LOAN, loan_to_owner: { amountUsd: "50", date: "" } },
      }),
    );
    expect(yesErrorMessages(errors)).toEqual(["The LLC lent you: Enter the loan date (within 2024)."]);
  });

  it("rejects negative typed totals", () => {
    const errors = yesAnswerErrors(yearState({ manualContributions: -5, manualDistributions: 3 }));
    expect(errors.contributions).toBe("Enter an amount of 0 or more.");
    expect(errors.distributions).toBeNull();
  });
});

describe("buildYearPayload", () => {
  const nonCash: NonCashTransferRow = {
    date: "2024-04-01",
    direction: "in",
    description: "100 shares of ACME",
    fairMarketValueCents: 500000,
    valuationMethod: "Closing price",
    alsoInPartV: false,
  };

  it("No: sends the no-reportable-transactions shape with every category confirmed", () => {
    const payload = buildYearPayload(
      "no",
      yearState({
        // Leftover Yes-side input must not leak into a No save.
        manualContributions: 900,
        transactions: [row("contribution", 100)],
        loans: { loan_from_owner: { amountUsd: "5", date: "2024-01-02" }, loan_to_owner: EMPTY_LOAN },
        otherTransactionsNote: "something",
        ownerPaidCosts: [LEGACY_COST],
        nonCashTransfers: [nonCash],
      }),
    );
    expect(payload).toEqual({
      taxYear: 2024,
      totalAssetsYearEnd: 1234.5,
      contributions: 0,
      distributions: 0,
      reportableTransactions: [],
      otherTransactionsNote: "",
      noReportableTransactions: true,
      replaceReportableTransactions: true,
      ownerPaidCosts: [],
      zeroConfirmations: ALL_ZERO_CONFIRMATIONS,
      // Part VI is a separate question and survives a No.
      nonCashTransfers: [nonCash],
    });
  });

  it("Yes with only contributions: blank categories are confirmed as $0", () => {
    const payload = buildYearPayload("yes", yearState({ manualContributions: 750 }));
    expect(payload).toEqual({
      taxYear: 2024,
      totalAssetsYearEnd: 1234.5,
      contributions: 750,
      distributions: 0,
      reportableTransactions: [],
      otherTransactionsNote: "",
      noReportableTransactions: false,
      replaceReportableTransactions: true,
      ownerPaidCosts: [],
      zeroConfirmations: {
        distributions: true,
        loansFromOwner: true,
        loansToOwner: true,
        ownerPaidCosts: true,
      },
      nonCashTransfers: [],
    });
  });

  it("Yes with a loan: stores one loan row with the right sign and confirms the rest", () => {
    const payload = buildYearPayload(
      "yes",
      yearState({
        loans: {
          loan_from_owner: EMPTY_LOAN,
          loan_to_owner: { amountUsd: "1500.25", date: "2024-08-09" },
        },
        otherTransactionsNote: "  Consulting fee paid to me, $300  ",
      }),
    );
    expect(payload.reportableTransactions).toEqual([
      {
        date: "2024-08-09",
        description: "Loan from LLC to owner",
        counterparty: "",
        amountCents: -150025,
        category: "loan_to_owner",
        rule: "Loan question",
      },
    ]);
    expect(payload.otherTransactionsNote).toBe("Consulting fee paid to me, $300");
    expect(payload.noReportableTransactions).toBe(false);
    expect(payload.zeroConfirmations).toEqual({
      contributions: true,
      distributions: true,
      loansFromOwner: true,
      ownerPaidCosts: true,
    });
  });

  it("Yes with statement rows: sends row-derived totals and only reportable rows", () => {
    const rows = [
      row("contribution", 10000),
      row("contribution", 2550),
      row("revenue", 400000),
      row("unknown", -300),
    ];
    const payload = buildYearPayload(
      "yes",
      yearState({ transactions: rows, manualContributions: 999, manualDistributions: 40 }),
    );
    expect(payload.contributions).toBeCloseTo(125.5);
    // No distribution rows → the typed total is kept (the generator adds it as one row).
    expect(payload.distributions).toBe(40);
    expect(payload.reportableTransactions).toEqual([rows[0], rows[1]]);
    expect(payload.zeroConfirmations).toEqual({
      loansFromOwner: true,
      loansToOwner: true,
      ownerPaidCosts: true,
    });
  });

  it("legacy owner-paid costs are kept as-is and not confirmed as zero", () => {
    const payload = buildYearPayload(
      "yes",
      yearState({ ownerPaidCosts: [LEGACY_COST], manualContributions: 200 }),
    );
    expect(payload.ownerPaidCosts).toEqual([LEGACY_COST]);
    expect(payload.contributions).toBe(200);
    expect(payload.zeroConfirmations).toEqual({
      distributions: true,
      loansFromOwner: true,
      loansToOwner: true,
    });
  });

  it("legacy owner-paid costs with no other money still confirm contributions as $0", () => {
    const payload = buildYearPayload("yes", yearState({ ownerPaidCosts: [LEGACY_COST] }));
    expect(payload.contributions).toBe(0);
    expect(payload.zeroConfirmations.contributions).toBe(true);
    expect(payload.zeroConfirmations.ownerPaidCosts).toBeUndefined();
  });

  it("never creates owner-paid cost rows", () => {
    const payload = buildYearPayload("yes", yearState({ manualContributions: 300 }));
    expect(payload.ownerPaidCosts).toEqual([]);
  });
});
