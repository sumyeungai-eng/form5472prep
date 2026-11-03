import { describe, expect, it } from "vitest";
import { generatePackage } from "./generatePackage";
import { filingToPackageInput } from "./packageInput";
import { runPreflight } from "./preflight";
import { readPageLines } from "./validatePackage";
import { F1, finalisedAt } from "./__fixtures__/filings";
import { isAmbiguousDecimal, parseDecimalAmount, partVRowWarnings, toPartVRow } from "@/lib/partV";

// P0-4 Part V line items. Synthetic data only. F1 is a timely 2025 filing, so
// no reasonable cause statement gets in the way of the Part V checks.
const PDF_TIMEOUT = 60_000;

// The spec fixture: 7 customer-typed items, one in EUR.
const SEVEN_ITEMS = [
  { date: "2025-01-10", description: "Initial bank funding", amountInput: "5,000.00", category: "contribution", paidVia: "TRANSFER" },
  { date: "2025-02-01", description: "State formation fee", amountInput: "300", category: "contribution", paidVia: "OWNER_PAID_PERSONALLY" },
  { date: "2025-02-01", description: "Registered agent", amountInput: "49", category: "contribution", paidVia: "OWNER_PAID_PERSONALLY" },
  { date: "2025-03-15", description: "Mailroom service", amountInput: "100.00", category: "contribution", paidVia: "OWNER_PAID_PERSONALLY", currency: "EUR", originalAmountInput: "92,00" },
  { date: "2025-05-01", description: "Loan to the LLC", amountInput: "2000", category: "loan_from_owner", paidVia: "TRANSFER" },
  { date: "2025-06-30", description: "Owner draw", amountInput: "1.500,00", category: "distribution", paidVia: "TRANSFER" },
  { date: "2025-09-09", description: "Software licence resold to the LLC", amountInput: "250", category: "other", paidVia: "OTHER" },
];

// Rows are customer drafts (DB shape), so the patch is loosely typed on purpose.
const pkgFor = (patch: Record<string, unknown>) =>
  generatePackage(
    filingToPackageInput({ ...F1, yearData: [{ ...F1.yearData[0], contributions: 0, distributions: 0, ...patch }] } as never),
    finalisedAt,
  );
type Pkg = Awaited<ReturnType<typeof pkgFor>>;
const statement = (pkg: Pkg) =>
  pkg.record.authoredDocuments.find((d) => d.kind === "partVStatement")!.lines.join(" ");
const ids = (issues: Array<{ id: string }>) => issues.map((i) => i.id);

describe("P0-4 Part V line items", () => {
  it("the spec fixture: 7 items (one EUR) → 7 rows, 1f = 1h = statement total, FX sentence, A41 passes", async () => {
    const pkg = await pkgFor({ reportableTransactions: SEVEN_ITEMS });
    const year = pkg.record.taxYears[0];
    expect(year.partVRows).toHaveLength(7);
    // 5,000 + 300 + 49 + 100 + 2,000 + 1,500 + 250 (sum the cents, round once).
    expect(year.line1f).toBe(9199);
    expect(year.line1h).toBe(9199);
    const text = statement(pkg);
    expect(text).toContain("Form 5472 lines 1f and 1h: $9,199.");
    expect(text).toContain("Mailroom service: 92.00 EUR converted to $100.00 at 1.0870 USD per EUR.");
    expect(text).toContain("Other Transactions with Foreign Owner");
    expect(text).toContain("Software licence resold to the LLC");
    expect(text).toContain("Initial bank funding, transferred from my personal account");
    expect(text).toContain("Registered agent, paid from my personal funds");
    expect(text).toContain("Owner draw, transferred to my personal account");
    expect(text).not.toMatch(/NaN|Infinity|MISSING/);
    // A distribution exists, so no "no distributions" sentence.
    expect(text).not.toContain("I received no distributions");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    // Includes the post-generation validator: A41 (1f = 1h = printed total) and A48 (dates).
    expect(preflight.failures).toEqual([]);
    expect(ids(preflight.warnings)).not.toEqual(expect.arrayContaining(["W43", "W44", "W45"]));
    // Read back from the PDF bytes: the FX sentence really printed.
    const page = pkg.record.pageOrder.find((p) => p.label === "Part V Statement")!;
    const printed: string[] = [];
    for (let p = page.startPage; p <= page.endPage; p++) printed.push(...(await readPageLines(pkg.bytes, p)));
    expect(printed.join(" ")).toContain("1.0870 USD per EUR");
  }, PDF_TIMEOUT);

  it("a missing USD amount is kept, prints MISSING, stays out of the totals and fails A38 (never $0)", async () => {
    const pkg = await pkgFor({
      reportableTransactions: [
        { date: "2025-01-10", description: "Owner capital", amountInput: "1000", category: "contribution", paidVia: "TRANSFER" },
        { date: "2025-02-10", description: "Second transfer", amountInput: "", category: "contribution", paidVia: "TRANSFER" },
      ],
    });
    const year = pkg.record.taxYears[0];
    expect(year.partVRows[1]).toMatchObject({ amountMissing: true, amountCents: 0 });
    expect(year.line1f).toBe(1000);
    expect(statement(pkg)).toContain("MISSING");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(ids(preflight.failures)).toEqual(["A38"]);
    expect(preflight.failures[0].message).toContain('"Second transfer" (2025-02-10)');
  }, PDF_TIMEOUT);

  it("a EUR row without an original amount prints no FX sentence (no NaN) and warns W45", async () => {
    const pkg = await pkgFor({
      reportableTransactions: [
        { date: "2025-03-15", description: "Mailroom", amountInput: "100", category: "contribution", currency: "EUR" },
        { date: "2025-03-16", description: "Bad rate", amountInput: "100", category: "contribution", currency: "EUR", originalAmountInput: "0" },
      ],
    });
    const text = statement(pkg);
    expect(text).not.toMatch(/NaN|Infinity|converted to/);
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toEqual([]);
    expect(ids(preflight.warnings)).toContain("W45");
  }, PDF_TIMEOUT);

  it("detailed rows, a totals-only figure, legacy owner-paid costs and Part VI are each counted once", async () => {
    const pkg = await pkgFor({
      reportableTransactions: [{ date: "2025-01-10", description: "Owner capital", amountCents: 1_000_00, category: "contribution" }],
      distributions: 700,
      ownerPaidCosts: [{ category: "registered_agent", date: "2025-02-01", amountCents: 49_00 }],
      nonCashTransfers: [
        { date: "2025-04-01", direction: "in", description: "Laptop", fairMarketValueCents: 800_00, valuationMethod: "Purchase invoice", alsoInPartV: false },
        { date: "2025-04-02", direction: "in", description: "Shares", fairMarketValueCents: 500_00, valuationMethod: "Broker statement", alsoInPartV: true },
      ],
    });
    const year = pkg.record.taxYears[0];
    // 1,000 (row) + 700 (distributions total) + 49 (legacy cost) + 800 (Part VI not in Part V).
    expect(year.line1f).toBe(2549);
    // Legacy costs render as today.
    expect(statement(pkg)).toContain("During tax year 2025, I paid $49.00 of registered agent fees for");
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    expect(preflight.failures).toEqual([]);
    expect(preflight.warnings).toContainEqual({ id: "W44", message: "Tax year 2025: Part V has only a total — ask the client for line items." });
  }, PDF_TIMEOUT);

  it("W43 flags a transfer under $100 (decimal hint), not a small fee paid personally", async () => {
    const pkg = await pkgFor({
      reportableTransactions: [
        { date: "2025-01-10", description: "Capital", amountInput: "5.000", category: "contribution", paidVia: "TRANSFER" },
        { date: "2025-02-01", description: "Registered agent", amountInput: "49", category: "contribution", paidVia: "OWNER_PAID_PERSONALLY" },
      ],
    });
    const preflight = await runPreflight(pkg.record, pkg.bytes);
    const w43 = preflight.warnings.filter((w) => w.id === "W43");
    expect(w43).toHaveLength(1);
    expect(w43[0].message).toContain('"Capital"');
    expect(w43[0].message).not.toContain("Registered agent");
  }, PDF_TIMEOUT);

  it("prints 'no distributions' only when the total is 0 AND the step was answered", async () => {
    const rows = [{ date: "2025-01-10", description: "Capital", amountInput: "1000", category: "contribution" }];
    const answered = await pkgFor({ reportableTransactions: rows, zeroConfirmations: { distributions: true } });
    expect(statement(answered)).toContain("I received no distributions from Example Holdings LLC during tax year 2025.");
    expect((await runPreflight(answered.record, answered.bytes)).failures).toEqual([]);
    const unanswered = await pkgFor({ reportableTransactions: rows, zeroConfirmations: {} });
    expect(statement(unanswered)).not.toContain("I received no distributions");
  }, PDF_TIMEOUT * 2);
});

describe("P0-4 customer capture helpers", () => {
  it("parses comma and dot decimals", () => {
    expect(parseDecimalAmount("1.234,56")).toBe(1234.56);
    expect(parseDecimalAmount("1,234.56")).toBe(1234.56);
    expect(parseDecimalAmount("12,50")).toBe(12.5);
    expect(parseDecimalAmount("1,500")).toBe(1500);
    expect(parseDecimalAmount("1.500")).toBe(1.5);
    expect(parseDecimalAmount("€ 92,00")).toBe(92);
    expect(parseDecimalAmount("(12)")).toBe(-12);
    expect(parseDecimalAmount("abc")).toBeNull();
    expect(parseDecimalAmount("1.2.3")).toBeNull();
  });

  it("flags ambiguous decimals instead of silently accepting them", () => {
    expect(isAmbiguousDecimal("1.500")).toBe(true);
    expect(isAmbiguousDecimal("5,000")).toBe(false); // reads as 5,000: over $100
    expect(isAmbiguousDecimal("1500")).toBe(false);
  });

  it("never throws and never defaults a missing amount to 0", () => {
    expect(toPartVRow(null)).toMatchObject({ amountCents: null });
    expect(toPartVRow({ amountCents: Number.NaN, amountInput: "" })).toMatchObject({ amountCents: null });
    expect(toPartVRow({ amountInput: "200", category: "distribution" })).toMatchObject({ amountCents: -200_00 });
  });

  it("warns (never blocks) about the date, a missing amount, currency and the decimal hint", () => {
    const warnings = partVRowWarnings(
      toPartVRow({ date: "2024-12-31", amountInput: "1.500", category: "contribution", currency: "EUR" }),
      2025,
      "2020-01-01",
    );
    expect(warnings).toEqual([
      "The date is outside 2025.",
      "For a payment in another currency, enter the currency and the original amount.",
      'Check the amount "1.500": it reads as under $100. If you meant thousands, type it without the separator.',
    ]);
    expect(partVRowWarnings(toPartVRow({ date: "2025-01-01", category: "contribution" }), 2025, "2025-03-01")).toEqual([
      "The date is before the LLC was formed.",
      "Enter the amount in US dollars.",
    ]);
  });
});
