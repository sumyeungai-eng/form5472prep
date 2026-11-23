import { beforeEach, describe, expect, it, vi } from "vitest";

// Importing the script must neither connect nor run main.
vi.mock("./prisma", () => ({ prisma: {} }));
vi.mock("./plaid", () => ({ plaid: vi.fn() }));
import { revokeStoredPlaidTokens } from "../../scripts/revoke-stored-plaid-tokens";

const accessToken = "access-legacy-secret";
const row = { id: "connection-1", itemId: "item-1", accessToken };
const findMany = vi.fn();
const update = vi.fn();
const itemRemove = vi.fn();
const plaid = vi.fn(() => ({ itemRemove }));
const log = vi.fn();
const deps = { prisma: { plaidConnection: { findMany, update } }, plaid, log };

describe("stored Plaid token revocation script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([row]);
    update.mockResolvedValue({});
    itemRemove.mockResolvedValue({});
  });

  it("defaults to dry-run: counts and item IDs only, no token read, Plaid calls or writes", async () => {
    expect(await revokeStoredPlaidTokens(deps)).toEqual({ found: 1, cleared: 0, failed: 0 });
    expect(findMany).toHaveBeenCalledExactlyOnceWith({
      where: { accessToken: { not: null } },
      select: { id: true, itemId: true, accessToken: false },
    });
    expect(log.mock.calls).toEqual([["DRY RUN: 1 stored Plaid token(s)"], ["item-1"]]);
    expect(plaid).not.toHaveBeenCalled();
    expect(itemRemove).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("clears and timestamps a successfully removed token only in apply mode", async () => {
    expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 1, cleared: 1, failed: 0 });
    expect(findMany.mock.calls[0][0].select.accessToken).toBe(true);
    expect(itemRemove).toHaveBeenCalledExactlyOnceWith({ access_token: accessToken });
    expect(update).toHaveBeenCalledExactlyOnceWith({
      where: { id: row.id }, data: { accessToken: null, revokedAt: expect.any(Date) },
    });
    expect(itemRemove.mock.invocationCallOrder[0]).toBeLessThan(update.mock.invocationCallOrder[0]);
    expect(JSON.stringify(log.mock.calls)).not.toContain(accessToken);
  });

  it.each(["ITEM_NOT_FOUND", "INVALID_ACCESS_TOKEN"])("also clears an already unusable token (%s)", async (code) => {
    itemRemove.mockRejectedValueOnce({ response: { data: { error_code: code } } });
    expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 1, cleared: 1, failed: 0 });
    expect(update).toHaveBeenCalledExactlyOnceWith({
      where: { id: row.id }, data: { accessToken: null, revokedAt: expect.any(Date) },
    });
  });

  it("leaves other failures unchanged, reports safely, and continues to the next row", async () => {
    findMany.mockResolvedValue([row, { ...row, id: "connection-2", itemId: "item-2" }]);
    itemRemove.mockRejectedValueOnce({
      response: { data: { error_code: "INTERNAL_SERVER_ERROR", error_message: accessToken } },
      config: { data: { access_token: accessToken } },
    });
    expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 2, cleared: 1, failed: 1 });
    expect(update).toHaveBeenCalledExactlyOnceWith({
      where: { id: "connection-2" }, data: { accessToken: null, revokedAt: expect.any(Date) },
    });
    expect(log).toHaveBeenCalledWith("item-1: INTERNAL_SERVER_ERROR; row unchanged");
    expect(JSON.stringify(log.mock.calls)).not.toContain(accessToken);
  });

  it.each([new Error(accessToken), { response: { data: { error_code: `ERROR_${accessToken}` } } }])(
    "never prints tokens from unexpected removal errors", async (error) => {
      itemRemove.mockRejectedValueOnce(error);
      expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 1, cleared: 0, failed: 1 });
      expect(update).not.toHaveBeenCalled();
      expect(JSON.stringify(log.mock.calls)).not.toContain(accessToken);
    },
  );

  it("reports a failed database update without exposing the error or token", async () => {
    update.mockRejectedValueOnce(new Error(accessToken));
    expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 1, cleared: 0, failed: 1 });
    expect(log).toHaveBeenCalledWith("item-1: database update failed; retry this script");
    expect(JSON.stringify(log.mock.calls)).not.toContain(accessToken);
  });
});
