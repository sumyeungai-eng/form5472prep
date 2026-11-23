import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  alert: vi.fn(),
  categorize: vi.fn(),
  configured: vi.fn(),
  ownedFiling: vi.fn(),
  create: vi.fn(),
  exchange: vi.fn(),
  itemGet: vi.fn(),
  institutionGet: vi.fn(),
  transactionsGet: vi.fn(),
  itemRemove: vi.fn(),
}));

vi.mock("@/lib/errorAlert", () => ({ alertServerError: mocks.alert }));
vi.mock("@/lib/bank/categorize", () => ({ categorizeAll: mocks.categorize }));
vi.mock("@/lib/session", () => ({ getOwnedFiling: mocks.ownedFiling }));
vi.mock("@/lib/prisma", () => ({ prisma: { plaidConnection: { create: mocks.create } } }));
vi.mock("@/lib/plaid", () => ({
  plaidConfigured: mocks.configured,
  plaid: () => ({
    itemPublicTokenExchange: mocks.exchange,
    itemGet: mocks.itemGet,
    institutionsGetById: mocks.institutionGet,
    transactionsGet: mocks.transactionsGet,
    itemRemove: mocks.itemRemove,
  }),
}));

import { NextResponse } from "next/server";
import { POST } from "./route";

const accessToken = "access-test-secret-never-persist";
function request(input: unknown = { filingId: "filing-1", publicToken: "public-1", taxYear: 2025 }) {
  return new Request("https://www.form5472prep.com/api/plaid/exchange", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

describe("Plaid one-time import", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.alert.mockResolvedValue(undefined);
    mocks.categorize.mockImplementation((parsed) => parsed);
    mocks.configured.mockReturnValue(true);
    mocks.ownedFiling.mockResolvedValue({ id: "filing-1", ownerName: "Jane Doe" });
    mocks.exchange.mockResolvedValue({ data: { access_token: accessToken, item_id: "item-1" } });
    mocks.itemGet.mockResolvedValue({ data: { item: { institution_id: "inst-1" } } });
    mocks.institutionGet.mockResolvedValue({ data: { institution: { name: "Test Bank" } } });
    mocks.transactionsGet.mockResolvedValue({ data: { transactions: [{
      date: "2025-02-01", name: "Deposit", merchant_name: null,
      amount: -12.34, transaction_id: "tx-1",
    }] } });
    mocks.itemRemove.mockResolvedValue({ data: {} });
    mocks.create.mockResolvedValue({ id: "connection-1" });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it("removes the item after fetching and persists only metadata with revokedAt", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.transactionsGet).toHaveBeenCalledWith({
      access_token: accessToken, start_date: "2025-01-01", end_date: "2025-12-31",
      options: { count: 500 },
    });
    expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(mocks.transactionsGet.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.itemRemove.mock.invocationCallOrder[0]);
    expect(mocks.itemRemove.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.create.mock.invocationCallOrder[0]);
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({ data: {
      filingId: "filing-1", itemId: "item-1", institutionName: "Test Bank", revokedAt: expect.any(Date),
    } });
    expect(mocks.create.mock.calls[0][0].data).not.toHaveProperty("accessToken");
    const body = await response.json();
    expect(body).toMatchObject({ institutionName: "Test Bank", transactionCount: 1,
      transactions: [{ bankRef: "tx-1", amountCents: 1234 }] });
    expect(JSON.stringify(body)).not.toContain(accessToken);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("still returns transactions when revocation fails, without setting revokedAt", async () => {
    mocks.itemRemove.mockRejectedValue({
      response: { data: { error_code: "INTERNAL_SERVER_ERROR", error_message: accessToken } },
      config: { data: { access_token: accessToken } },
    });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ transactionCount: 1, transactions: [{ bankRef: "tx-1" }] });
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({ data: {
      filingId: "filing-1", itemId: "item-1", institutionName: "Test Bank",
    } });
    expect(mocks.create.mock.calls[0][0].data).not.toHaveProperty("accessToken");
    expect(mocks.create.mock.calls[0][0].data).not.toHaveProperty("revokedAt");
    expect(console.warn).toHaveBeenCalledWith("Plaid item removal failed", {
      itemId: "item-1", error_code: "INTERNAL_SERVER_ERROR",
    });
    expect(mocks.alert).toHaveBeenCalledExactlyOnceWith({
      path: "/api/plaid/exchange",
      digest: "plaid-item-remove-failed",
      message: "Plaid item removal failed: itemId=item-1, error_code=INTERNAL_SERVER_ERROR",
    });
    expect(JSON.stringify(mocks.alert.mock.calls)).not.toContain(accessToken);
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(accessToken);
  });

  it.each([false, true])("revokes even when fetching throws (removal also fails: %s)", async (removeFails) => {
    mocks.transactionsGet.mockRejectedValue({
      message: `raw request failed: ${accessToken}`,
      response: { data: { error_code: `ERROR_${accessToken}_public-1`, error_message: "raw Plaid error" } },
      config: { data: { access_token: accessToken, public_token: "public-1" } },
    });
    if (removeFails) mocks.itemRemove.mockRejectedValue(new Error(accessToken));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Could not import transactions from Plaid" });
    expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(mocks.transactionsGet.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.itemRemove.mock.invocationCallOrder[0]);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith("Plaid import failed", {
      itemId: "item-1", error_code: "ERROR_[redacted]_[redacted]",
    });
    expect(console.warn).toHaveBeenCalledTimes(removeFails ? 2 : 1);
    const output = JSON.stringify([vi.mocked(console.warn).mock.calls,
      vi.mocked(console.error).mock.calls, vi.mocked(console.log).mock.calls]);
    for (const value of [accessToken, "public-1", "raw request failed", "raw Plaid error", "config"])
      expect(output).not.toContain(value);
  });

  it("redacts the token even if it appears in the removal error code", async () => {
    mocks.itemRemove.mockRejectedValue({ response: { data: { error_code: `ERROR_${accessToken}` } } });
    expect((await POST(request())).status).toBe(200);
    expect(console.warn).toHaveBeenCalledWith("Plaid item removal failed", {
      itemId: "item-1", error_code: "ERROR_[redacted]",
    });
  });

  it.each(["item", "institution"])("continues importing when %s lookup fails", async (stage) => {
    const error = new Error(`request secret: ${accessToken}`);
    if (stage === "item") mocks.itemGet.mockRejectedValue(error);
    if (stage === "institution") mocks.institutionGet.mockRejectedValue(error);
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      institutionName: null, transactionCount: 1, transactions: [{ bankRef: "tx-1", amountCents: 1234 }],
    });
    expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(mocks.transactionsGet.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.itemRemove.mock.invocationCallOrder[0]);
    expect(mocks.create).toHaveBeenCalledExactlyOnceWith({ data: {
      filingId: "filing-1", itemId: "item-1", institutionName: null, revokedAt: expect.any(Date),
    } });
  });

  it.each(["mapping", "categorizing", "response"])(
    "revokes and returns a generic 502 after a post-exchange failure in %s", async (stage) => {
      const error = new Error(`request secret: ${accessToken}`);
      if (stage === "mapping") mocks.transactionsGet.mockResolvedValue({ data: { transactions: [null] } });
      if (stage === "categorizing") mocks.categorize.mockImplementation(() => { throw error; });
      if (stage === "response") vi.spyOn(NextResponse, "json").mockImplementationOnce(() => { throw error; });
      const response = await POST(request());
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ error: "Could not import transactions from Plaid" });
      expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
      expect(mocks.create).not.toHaveBeenCalled();
    },
  );

  it.each([
    { toString: null }, {}, [], null, true, "", "2025oops", "20.25", "2025.0",
    "02025", "2025-01-01", 1999, 10000, 2025.5, new Date().getUTCFullYear() + 2,
  ].map((taxYear: unknown) => ({ taxYear })))("rejects malformed taxYear $taxYear before exchanging", async ({ taxYear }) => {
    const response = await POST(request({ filingId: "filing-1", publicToken: "public-1", taxYear }));
    expect(response.status).toBe(400);
    expect(mocks.ownedFiling).not.toHaveBeenCalled();
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it.each([
    null, [], "invalid", {},
    { filingId: {}, publicToken: "public-1", taxYear: 2025 },
    { filingId: " ", publicToken: "public-1", taxYear: 2025 },
    ...[null, {}, 123, "", "  "].map((publicToken) => ({ filingId: "filing-1", publicToken, taxYear: 2025 })),
  ].map((input: unknown) => ({ input })))("rejects malformed request $input before exchanging", async ({ input }) => {
    expect((await POST(request(input))).status).toBe(400);
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON before exchanging", async () => {
    const req = new Request("https://example.test/api/plaid/exchange", { method: "POST", body: "{" });
    expect((await POST(req)).status).toBe(400);
    expect(mocks.exchange).not.toHaveBeenCalled();
  });

  it.each([2000, "2000", new Date().getUTCFullYear() + 1, String(new Date().getUTCFullYear() + 1)])(
    "accepts a sane numeric or string year %s", async (taxYear) => {
      expect((await POST(request({ filingId: "filing-1", publicToken: "public-1", taxYear }))).status).toBe(200);
      expect(mocks.transactionsGet).toHaveBeenCalledWith(expect.objectContaining({
        start_date: `${taxYear}-01-01`, end_date: `${taxYear}-12-31`,
      }));
    },
  );

  it.each([true, false])("returns a safe 502 when exchange fails (has error_code: %s)", async (hasCode) => {
    const secret = "plaid-secret-never-log";
    mocks.exchange.mockRejectedValue({
      response: { data: { error_code: hasCode ? "INVALID_PUBLIC_TOKEN" : { secret }, error_message: accessToken } },
      config: { data: { public_token: "public-1", secret, access_token: accessToken } },
    });
    const response = await POST(request());
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body).toEqual({ error: "Could not import transactions from Plaid" });
    expect(console.warn).toHaveBeenCalledExactlyOnceWith("Plaid token exchange failed", {
      error_code: hasCode ? "INVALID_PUBLIC_TOKEN" : undefined,
    });
    const output = JSON.stringify([body, vi.mocked(console.warn).mock.calls,
      vi.mocked(console.error).mock.calls, vi.mocked(console.log).mock.calls]);
    for (const value of [accessToken, secret, "public-1"]) expect(output).not.toContain(value);
    expect(mocks.itemRemove).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("returns the import with an alert when metadata persistence fails", async () => {
    mocks.create.mockRejectedValue(new Error(accessToken));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ transactionCount: 1, transactions: [{ bankRef: "tx-1" }] });
    expect(mocks.itemRemove.mock.invocationCallOrder[0]).toBeLessThan(mocks.create.mock.invocationCallOrder[0]);
    expect(mocks.alert).toHaveBeenCalledExactlyOnceWith({
      path: "/api/plaid/exchange",
      digest: "plaid-connection-persist-failed",
      message: "Plaid import metadata save failed: filingId=filing-1, itemId=item-1",
    });
    expect(JSON.stringify(mocks.alert.mock.calls)).not.toContain(accessToken);
  });

  it("keeps the import even if monitoring itself rejects", async () => {
    mocks.itemRemove.mockRejectedValue(new Error(accessToken));
    mocks.create.mockRejectedValue(new Error(accessToken));
    mocks.alert.mockRejectedValue(new Error("monitoring unavailable"));
    expect((await POST(request())).status).toBe(200);
  });

  it.each([
    { stage: "removal", digest: "plaid-item-remove-failed" },
    { stage: "persistence", digest: "plaid-connection-persist-failed" },
  ])("uses the same $stage alert digest for different items and filings", async ({ stage, digest }) => {
    if (stage === "removal") mocks.itemRemove.mockRejectedValue(new Error(accessToken));
    if (stage === "persistence") mocks.create.mockRejectedValue(new Error(accessToken));
    for (const suffix of ["1", "2"]) {
      mocks.exchange.mockResolvedValueOnce({ data: { access_token: accessToken, item_id: `item-${suffix}` } });
      mocks.ownedFiling.mockResolvedValueOnce({ id: `filing-${suffix}`, ownerName: "Jane Doe" });
      expect((await POST(request({ filingId: `filing-${suffix}`, publicToken: "public-1", taxYear: 2025 }))).status)
        .toBe(200);
    }
    expect(mocks.alert).toHaveBeenCalledTimes(2);
    expect(mocks.alert.mock.calls.map(([alert]) => alert.digest)).toEqual([digest, digest]);
    mocks.alert.mock.calls.forEach(([alert], index) => {
      expect(alert.message).toContain(`itemId=item-${index + 1}`);
      if (stage === "persistence") expect(alert.message).toContain(`filingId=filing-${index + 1}`);
    });
  });
});
