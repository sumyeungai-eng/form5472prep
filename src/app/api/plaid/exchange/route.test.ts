import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  configured: vi.fn(),
  ownedFiling: vi.fn(),
  create: vi.fn(),
  exchange: vi.fn(),
  itemGet: vi.fn(),
  institutionGet: vi.fn(),
  transactionsGet: vi.fn(),
  itemRemove: vi.fn(),
}));

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

import { POST } from "./route";

const accessToken = "access-test-secret-never-persist";
function request() {
  return new Request("https://www.form5472prep.com/api/plaid/exchange", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filingId: "filing-1", publicToken: "public-1", taxYear: 2025 }),
  });
}

describe("Plaid one-time import", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
      itemId: "item-1", error: "INTERNAL_SERVER_ERROR",
    });
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(accessToken);
  });

  it.each([false, true])("revokes even when fetching throws (removal also fails: %s)", async (removeFails) => {
    mocks.transactionsGet.mockRejectedValue(new Error(`request failed: ${accessToken}`));
    if (removeFails) mocks.itemRemove.mockRejectedValue(new Error(accessToken));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Could not import transactions from Plaid" });
    expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(mocks.transactionsGet.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.itemRemove.mock.invocationCallOrder[0]);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.warn).mock.calls)).not.toContain(accessToken);
  });

  it("redacts the token even if it appears in the removal error code", async () => {
    mocks.itemRemove.mockRejectedValue({ response: { data: { error_code: `ERROR_${accessToken}` } } });
    expect((await POST(request())).status).toBe(200);
    expect(console.warn).toHaveBeenCalledWith("Plaid item removal failed", {
      itemId: "item-1", error: "ERROR_[redacted]",
    });
  });

  it("still disconnects when the optional institution lookup fails", async () => {
    mocks.itemGet.mockRejectedValue(new Error(accessToken));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(mocks.create.mock.calls[0][0].data.institutionName).toBeNull();
  });
});
