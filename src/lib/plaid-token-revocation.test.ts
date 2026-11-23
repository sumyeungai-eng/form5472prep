import { beforeEach, describe, expect, it, vi } from "vitest";

// Importing the script must neither connect nor run main.
vi.mock("./prisma", () => ({ prisma: {} }));
vi.mock("./plaid", () => ({ plaid: vi.fn(), plaidEnvName: () => "production" }));
import { revokeStoredPlaidTokens } from "../../scripts/revoke-stored-plaid-tokens";

const accessToken = "access-production-legacy-secret";
const row = { id: "connection-1", itemId: "item-1", accessToken };
const findMany = vi.fn();
const update = vi.fn();
const itemRemove = vi.fn();
const plaid = vi.fn(() => ({ itemRemove }));
const log = vi.fn();
const deps = { prisma: { plaidConnection: { findMany, update } }, plaid, log,
  databaseUrl: "postgresql://user:password@db.example.test:5432/filings?secret=query-secret" };

describe("stored Plaid token revocation script", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([row]);
    update.mockResolvedValue({});
    itemRemove.mockResolvedValue({});
  });

  it("defaults to dry-run: environment, host, counts and item IDs only; no Plaid calls or writes", async () => {
    expect(await revokeStoredPlaidTokens(deps)).toEqual({ found: 1, cleared: 0, failed: 0 });
    expect(findMany).toHaveBeenCalledExactlyOnceWith({
      where: { accessToken: { not: null } },
      select: { id: true, itemId: true, accessToken: true },
    });
    expect(log.mock.calls).toEqual([
      ["PLAID_ENV: production"], ["Database host: db.example.test:5432"],
      ["Token prefixes: sandbox=0, development=0, production=1, unknown=0"],
      ["DRY RUN: 1 stored Plaid token(s)"], ["item-1"],
    ]);
    for (const secret of [accessToken, "user", "password", "filings", "query-secret"]) {
      expect(JSON.stringify(log.mock.calls)).not.toContain(secret);
    }
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

  it.each(["sandbox", "development", "unknown"])(
    "leaves a mismatched %s row untouched even if Plaid would return INVALID_ACCESS_TOKEN", async (prefix) => {
      findMany.mockResolvedValue([{ ...row, accessToken: prefix === "unknown" ? "legacy-secret" : `access-${prefix}-secret` }]);
      itemRemove.mockRejectedValueOnce({ response: { data: { error_code: "INVALID_ACCESS_TOKEN" } } });
      expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 1, cleared: 0, failed: 1 });
      expect(log).toHaveBeenCalledWith(expect.stringContaining("ABORT:"));
      expect(plaid).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    },
  );

  it("preflights every prefix before applying even the first matching row", async () => {
    findMany.mockResolvedValue([row, { ...row, itemId: "item-2", accessToken: "access-sandbox-secret" }]);
    expect(await revokeStoredPlaidTokens(deps, true)).toEqual({ found: 2, cleared: 0, failed: 2 });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("no Plaid calls or writes; all rows unchanged"));
    expect(plaid).not.toHaveBeenCalled();
    expect(itemRemove).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("reports every prefix and item ID in dry run without printing tokens", async () => {
    const tokens = [accessToken, "access-sandbox-secret", "access-development-secret", "unrecognized-secret"];
    findMany.mockResolvedValue(tokens.map((token, i) => ({ id: `connection-${i}`, itemId: `item-${i}`, accessToken: token })));
    expect(await revokeStoredPlaidTokens(deps)).toEqual({ found: 4, cleared: 0, failed: 0 });
    expect(log).toHaveBeenCalledWith("Token prefixes: sandbox=1, development=1, production=1, unknown=1");
    for (const token of tokens) expect(JSON.stringify(log.mock.calls)).not.toContain(token);
    for (let i = 0; i < 4; i++) expect(log).toHaveBeenCalledWith(`item-${i}`);
    expect(plaid).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it.each([
    ["", "missing"], ["not a url with password", "invalid"], ["file:///tmp/private", "invalid"],
  ])("reports a missing or invalid database URL safely (%s)", async (databaseUrl, host) => {
    await revokeStoredPlaidTokens({ ...deps, databaseUrl });
    expect(log).toHaveBeenCalledWith(`Database host: ${host}`);
    expect(JSON.stringify(log.mock.calls)).not.toContain("password");
    expect(JSON.stringify(log.mock.calls)).not.toContain("/tmp/private");
  });

});
