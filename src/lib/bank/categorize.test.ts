import { describe, it, expect } from "vitest";
import { categorize, categorizeAll, totals } from "./categorize";
import type { ParsedTransaction } from "./types";

const owner = { fullName: "Jane Smith", aliases: ["my chase"] };

function tx(partial: Partial<ParsedTransaction>): ParsedTransaction {
  return {
    date: "2024-06-01",
    description: "",
    counterparty: "",
    amountCents: 0,
    ...partial,
  };
}

describe("categorize", () => {
  it("flags owner inflow as contribution", () => {
    const r = categorize(
      tx({ description: "Wire from Jane Smith", amountCents: 5_000_00 }),
      owner,
    );
    expect(r.category).toBe("contribution");
  });

  it("flags owner outflow as distribution", () => {
    const r = categorize(
      tx({ description: "Transfer to Jane Smith personal", amountCents: -2_000_00 }),
      owner,
    );
    expect(r.category).toBe("distribution");
  });

  it("flags Stripe inflow as revenue", () => {
    const r = categorize(
      tx({ description: "STRIPE TRANSFER", amountCents: 1_234_56 }),
      owner,
    );
    expect(r.category).toBe("revenue");
  });

  it("flags AMEX outflow as card reimbursement", () => {
    const r = categorize(
      tx({ description: "American Express Autopay", amountCents: -800_00 }),
      owner,
    );
    expect(r.category).toBe("card_reimbursement");
  });

  it("treats internal transfers between Mercury accounts as non-reportable", () => {
    const r = categorize(
      tx({ description: "Transfer between accounts: Mercury Checking → Mercury Treasury", amountCents: -10_000_00 }),
      owner,
    );
    expect(r.category).toBe("internal_transfer");
  });

  it("defaults unmatched outflows to vendor expense", () => {
    const r = categorize(
      tx({ description: "Acme Software LLC", amountCents: -49_00 }),
      owner,
    );
    expect(r.category).toBe("vendor_expense");
  });

  it("flags unmatched inflows as unknown", () => {
    const r = categorize(
      tx({ description: "Unknown payer", amountCents: 100_00 }),
      owner,
    );
    expect(r.category).toBe("unknown");
  });

  it("respects rule order: owner match beats card issuer text", () => {
    // Edge case: owner's name happens to overlap card text — owner rule fires.
    const r = categorize(
      tx({ description: "Jane Smith Chase", amountCents: -500_00 }),
      owner,
    );
    expect(r.category).toBe("distribution");
  });

  it("matches owner aliases (e.g. 'My Chase')", () => {
    const r = categorize(
      tx({ description: "ACH from My Chase 1234", amountCents: 10_000_00 }),
      owner,
    );
    expect(r.category).toBe("contribution");
  });
});

describe("totals", () => {
  it("sums by category in dollars", () => {
    const cats = categorizeAll(
      [
        tx({ description: "From Jane Smith", amountCents: 10_000_00 }),
        tx({ description: "To Jane Smith", amountCents: -3_000_00 }),
        tx({ description: "STRIPE", amountCents: 1_500_00 }),
        tx({ description: "AMEX autopay", amountCents: -750_00 }),
        tx({ description: "Vendor X", amountCents: -200_00 }),
      ],
      owner,
    );
    const t = totals(cats);
    expect(t.contributions).toBe(10_000);
    expect(t.distributions).toBe(3_000);
    expect(t.revenue).toBe(1_500);
    expect(t.cardReimbursement).toBe(750);
    expect(t.vendorExpense).toBe(200);
  });
});
