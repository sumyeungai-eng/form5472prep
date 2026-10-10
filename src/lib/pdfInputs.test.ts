import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { filingCompletionIssues, type CompletionInput } from "./completeness";
import { PDF_TEXT_MESSAGE } from "./pdfText";

const fake = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(), bindFilingToEmail: vi.fn(), update: vi.fn(),
  upsert: vi.fn(), transaction: vi.fn(), count: vi.fn(), create: vi.fn(),
  put: vi.fn(), parse: vi.fn(), findUnique: vi.fn(), stripeCreate: vi.fn(),
}));
// Partial mock: the route serialises through the real toClientFiling.
vi.mock("@/lib/session", async (orig) => ({
  ...(await orig<typeof import("@/lib/session")>()),
  getOwnedFiling: fake.getOwnedFiling,
  bindFilingToEmail: fake.bindFilingToEmail,
}));
vi.mock("@/lib/prisma", () => ({ prisma: {
  filing: { update: fake.update, findUnique: fake.findUnique },
  filingYearData: { upsert: fake.upsert },
  bankStatement: { count: fake.count, create: fake.create },
  $transaction: fake.transaction,
} }));
vi.mock("@/lib/storage", () => ({ put: fake.put, makeKey: (key: string) => key, putPdf: vi.fn() }));
vi.mock("@/lib/bank/parsers", () => ({ parseBankCsv: fake.parse, parseBankExcel: fake.parse }));
vi.mock("@/lib/stripe", () => ({ stripe: () => ({ checkout: { sessions: { create: fake.stripeCreate } } }) }));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://example.test", adminEmail: "admin@example.test" } }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendOrderConfirmationEmail: vi.fn(), sendNewOrderAdminEmail: vi.fn() }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: vi.fn() }));
vi.mock("@/lib/partnerBrand", () => ({ brandForFiling: async () => null }));

import { PATCH } from "@/app/api/filings/[id]/route";
import { POST as uploadStatement } from "@/app/api/filings/[id]/statements/route";
import { POST as checkout } from "@/app/api/checkout/route";

const filing: CompletionInput & { id: string; status: string; tier: string; stripeSessionId: null } = {
  id: "filing_1", status: "DRAFT", tier: "budget", stripeSessionId: null,
  llcCountryBusiness: "USA", llcName: "Example LLC", llcEin: "12-3456789", llcAddress: "123 Main Street",
  llcCity: "Cheyenne", llcState: "WY", llcZip: "82001", llcCountry: "USA",
  llcDateIncorporated: new Date("2023-01-01"), llcBusinessActivity: "Software",
  llcBusinessCode: "541512", ownerName: "José Müller", ownerAddress: "123 Main Street",
  ownerCountryCitizenship: "Germany", ownerCountryTaxResidence: "Germany",
  ownerCountryBusiness: "Germany", ownerFtin: "DE12345", ownerItin: "", ownerReferenceId: "JOSE123",
  taxYears: [2023], isFinalReturn: false, dissolvedAt: null,
  isDiirsp: true, reasonableCauseNarrative: "I did not know about the filing requirement.",
  extensionFiled: "no", extensionTransmittedAt: null,
};
const transaction = { date: "2023-03-01", description: "Services from José Müller", counterparty: "José Müller", amountCents: 10000, category: "contribution" };
const params = { params: { id: filing.id } };
function patch(body: unknown) {
  return PATCH(new Request("https://example.test/api/filings/filing_1", { method: "PATCH", body: JSON.stringify(body) }), params);
}
function upload(excel = false) {
  const form = new FormData();
  form.set("file", new Blob(["mocked bank data"], { type: excel ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv" }), excel ? "statement.xlsx" : "statement.csv");
  form.set("taxYear", "2023");
  return uploadStatement(new Request("https://example.test/api/filings/filing_1/statements", { method: "POST", body: form }), params);
}
function pay() {
  return checkout(new Request("https://example.test/api/checkout", { method: "POST", body: JSON.stringify({ filingId: filing.id, email: "customer@example.test" }) }));
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  fake.getOwnedFiling.mockResolvedValue({ ...filing });
  fake.bindFilingToEmail.mockResolvedValue({ id: "user_1", email: "customer@example.test" });
  fake.update.mockResolvedValue({ ...filing });
  fake.upsert.mockResolvedValue({ id: "year_1" });
  fake.transaction.mockImplementation(async (fn) => fn({ filing: { update: fake.update }, filingYearData: { upsert: fake.upsert } }));
  fake.count.mockResolvedValue(0);
  fake.create.mockResolvedValue({ id: "statement_1" });
  fake.parse.mockReturnValue({ provider: "generic", transactions: [{ ...transaction }], warnings: [] });
  fake.findUnique.mockResolvedValue({ user: { email: "customer@example.test" }, yearData: [{ taxYear: 2023, otherTransactionsNote: "Consulting fees" }] });
  fake.stripeCreate.mockResolvedValue({ id: "cs_new", url: "https://example.test/pay" });
});
afterEach(() => vi.restoreAllMocks());

describe("PATCH PDF text validation", () => {
  it.each(["reasonableCauseNarrative", "llcCountry", "ownerAddressStreet", "ownerAddressCity", "ownerAddressState", "ownerAddressPostal", "ownerAddressCountry"])("rejects non-encodable %s with C4 guidance before writing", async (field) => {
    const response = await patch({ [field]: "王小明" });
    expect(response.status).toBe(400);
    expect((await response.json()).issues).toContainEqual({ field, message: PDF_TEXT_MESSAGE });
    expect(fake.transaction).not.toHaveBeenCalled();
    expect(fake.update).not.toHaveBeenCalled();
  });
  it("rejects supporting-statement notes before any transaction is saved", async () => {
    const response = await patch({ yearData: [{ taxYear: 2023, otherTransactionsNote: "Paid 王小明" }] });
    expect(response.status).toBe(400);
    expect((await response.json()).issues).toContainEqual({ field: "otherTransactionsNote", message: PDF_TEXT_MESSAGE });
    expect(fake.transaction).not.toHaveBeenCalled();
    expect(fake.upsert).not.toHaveBeenCalled();
  });
  it("preserves Latin narrative, country, address components, notes and transaction text", async () => {
    const text = "Services from José Müller — consulting";
    const body = { reasonableCauseNarrative: text, llcCountry: "USA", ownerAddressStreet: "123 Main Street", ownerAddressCity: "Berlin", ownerAddressState: "Berlin", ownerAddressPostal: "10115", ownerAddressCountry: "Germany", yearData: [{ taxYear: 2023, otherTransactionsNote: text, reportableTransactions: [transaction] }] };
    expect((await patch(body)).status).toBe(200);
    expect(fake.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ reasonableCauseNarrative: text, llcCountry: "USA", ownerAddressCountry: "Germany" }) }));
    expect(fake.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: expect.objectContaining({ otherTransactionsNote: text, reportableTransactions: [transaction] }) }));
  });
  it("keeps explicit no-transactions clearing and absent/null notes working", async () => {
    for (const note of [undefined, null, "王小明"]) {
      expect((await patch({ yearData: [{ taxYear: 2023, otherTransactionsNote: note, noReportableTransactions: true }] })).status).toBe(200);
    }
    expect(fake.upsert).toHaveBeenLastCalledWith(expect.objectContaining({ update: expect.objectContaining({ otherTransactionsNote: "", reportableTransactions: [] }) }));
  });
});

// The exact body the wizard's reasonable-cause step sends when the year has
// no saved row yet (incident 2026-10-10: every answer failed with a bare
// "Invalid input" because an over-long answer hit the then 2,000-char cap).
function rcsStepBody(rcsWhyMissed: string) {
  return { yearData: [{
    taxYear: 2023, totalAssetsYearEnd: 0, contributions: 0, distributions: 0,
    otherTransactionsNote: "", noReportableTransactions: false, reportableTransactions: [],
    nonCashTransfers: [], ownerPaidCosts: [], zeroConfirmations: {},
    rcsWhyMissed, rcsWhenLearned: "", rcsNoIrsNoticeConfirmed: true,
  }] };
}

describe("PATCH reasonable-cause step", () => {
  it("accepts a long multi-paragraph statement under the 20,000 cap", async () => {
    const why = "The Owner was not aware of the filing requirement. ".repeat(60).trim();
    expect(why.length).toBeGreaterThan(2000);
    expect((await patch(rcsStepBody(why))).status).toBe(200);
  });
  it("accepts the wizard's reasonable-cause body", async () => {
    const why = "The Owner was not aware that a foreign-owned single-member LLC must file Form 5472 with a pro forma Form 1120, even when no U.S. tax is owed.";
    expect((await patch(rcsStepBody(why))).status).toBe(200);
    expect(fake.upsert).toHaveBeenCalledWith(expect.objectContaining({ update: expect.objectContaining({ rcsWhyMissed: why, rcsNoIrsNoticeConfirmed: true }) }));
  });
  it("rejects an over-long answer with a readable limit message before writing", async () => {
    const response = await patch(rcsStepBody("x".repeat(20050)));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.issues).toContainEqual({ field: "rcsWhyMissed", message: "Keep this to 20,000 characters or fewer (it is 20,050)." });
    expect(fake.upsert).not.toHaveBeenCalled();
  });
  it("gives built-in checks an English message, not a bare 'Invalid input'", async () => {
    const response = await patch({ yearData: [{ ...rcsStepBody("Reason.").yearData[0], totalAssetsYearEnd: -5 }] });
    expect(response.status).toBe(400);
    const [issue] = (await response.json()).issues;
    expect(issue.field).toBe("totalAssetsYearEnd");
    expect(issue.message).not.toBe("Invalid input");
  });
});

describe("stored PDF text completeness", () => {
  it("reports the narrative field even when reasonable cause is not required", () => {
    expect(filingCompletionIssues(filing, [2023])).toEqual([]);
    expect(filingCompletionIssues({ ...filing, reasonableCauseNarrative: "王小明" }, [2023])).toEqual(["reasonableCauseNarrative"]);
  });
  it("reports notes from any stored year once by field name", () => {
    expect(filingCompletionIssues(filing, [{ taxYear: 2023, otherTransactionsNote: "Latin" }, { taxYear: 2023, otherTransactionsNote: "王小明" }, { taxYear: 2023, otherTransactionsNote: "王小明" }])).toEqual(["otherTransactionsNote"]);
  });
  it.each(["date", "description", "counterparty", "category"])("rejects stored non-encodable transaction %s", (field) => {
    expect(filingCompletionIssues(filing, [{ taxYear: 2023, reportableTransactions: [{ ...transaction, [field]: "王小明" }] }])).toEqual([field]);
  });
  it("accepts Latin text, blank/null notes and filings with no optional notes", () => {
    expect(filingCompletionIssues(filing, [{ taxYear: 2023, otherTransactionsNote: "José Müller — consulting", reportableTransactions: [transaction] }, { taxYear: 2023, otherTransactionsNote: "" }, { taxYear: 2023, otherTransactionsNote: null }])).toEqual([]);
    expect(filingCompletionIssues(filing, [2023])).toEqual([]);
  });
  it("checks notes provided on the filing and country text", () => {
    expect(filingCompletionIssues({ ...filing, yearData: [{ taxYear: 2023, otherTransactionsNote: "王小明" }] }, [2023])).toEqual(["otherTransactionsNote"]);
    expect(filingCompletionIssues({ ...filing, llcCountry: "中国" }, [2023])).toEqual(["llcCountry"]);
  });
});

describe("statement imports", () => {
  it.each([false, true])("rejects non-encodable imported descriptions before saving (Excel=%s)", async (excel) => {
    fake.parse.mockReturnValue({ provider: "generic", transactions: [{ ...transaction, description: "Paid 王小明" }], warnings: [] });
    const response = await upload(excel);
    expect(response.status).toBe(400);
    expect((await response.json()).issues).toContainEqual({ field: "transactions.0.description", message: PDF_TEXT_MESSAGE });
    expect(fake.put).not.toHaveBeenCalled();
    expect(fake.create).not.toHaveBeenCalled();
  });
  it.each([false, true])("accepts and preserves Latin statement descriptions (Excel=%s)", async (excel) => {
    const response = await upload(excel);
    expect(response.status).toBe(200);
    expect((await response.json()).transactions[0].description).toBe(transaction.description);
    expect(fake.put).toHaveBeenCalledOnce();
    expect(fake.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ parseResult: expect.objectContaining({ transactions: [expect.objectContaining({ description: transaction.description })] }) }) }));
  });
});

describe("checkout PDF text gate", () => {
  it("rejects a stored Chinese narrative before creating a payment session", async () => {
    fake.getOwnedFiling.mockResolvedValue({ ...filing, reasonableCauseNarrative: "王小明" });
    const response = await pay();
    expect(response.status).toBe(400);
    expect((await response.json()).issues).toContain("reasonableCauseNarrative");
    expect(fake.stripeCreate).not.toHaveBeenCalled();
  });
  it("accepts Latin narrative and stored notes", async () => {
    expect((await pay()).status).toBe(200);
    expect(fake.stripeCreate).toHaveBeenCalledOnce();
  });
});


describe("newer stored year text at PATCH and checkout", () => {
  const cases = [
    ["rcsWhyMissed", { rcsWhyMissed: "王小明" }],
    ["rcsWhenLearned", { rcsWhenLearned: "王小明" }],
    ["otherTransactionsNote", { otherTransactionsNote: "王小明" }],
    ["description", { reportableTransactions: [{ ...transaction, description: "王小明" }] }],
    ["valuationMethod", { nonCashTransfers: [{ date: "2023-01-01", direction: "in", description: "Equipment", fairMarketValueCents: 100, valuationMethod: "王小明" }] }],
    ["note", { ownerPaidCosts: [{ date: "2023-01-01", category: "other", amountCents: 100, note: "王小明" }] }],
  ] as const;
  it.each(cases)("refuses %s before saving or charging", async (field, data) => {
    const row = { taxYear: 2023, ...data };
    const response = await patch({ yearData: [row] });
    expect(response.status).toBe(400);
    expect((await response.json()).issues).toEqual(expect.arrayContaining([expect.objectContaining({ message: PDF_TEXT_MESSAGE })]));
    expect(fake.transaction).not.toHaveBeenCalled();
    fake.findUnique.mockResolvedValue({ yearData: [row] });
    const payment = await pay();
    expect(payment.status).toBe(400);
    expect((await payment.json()).issues).toContain(field);
    expect(fake.stripeCreate).not.toHaveBeenCalled();
  });
  it("uses the stored per-year reasonable cause answers when deciding completeness", async () => {
    fake.getOwnedFiling.mockResolvedValue({ ...filing, reasonableCauseNarrative: null });
    fake.findUnique.mockResolvedValue({ yearData: [{ taxYear: 2023, rcsWhyMissed: "Jose Muller did not know", rcsNoIrsNoticeConfirmed: true }] });
    expect((await pay()).status).toBe(200);
    expect(fake.stripeCreate).toHaveBeenCalledOnce();
  });
});
