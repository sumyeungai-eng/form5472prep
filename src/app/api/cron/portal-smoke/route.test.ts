import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  alertServerError: vi.fn(),
  cookieJar: new Map<string, string>(),
  env: { appUrl: "https://www.form5472prep.com" },
}));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findFirst: mocks.findFirst } } }));
vi.mock("@/lib/errorAlert", () => ({ alertServerError: mocks.alertServerError }));
vi.mock("@/lib/env", () => ({ env: mocks.env }));
vi.mock("next/headers", () => ({
  cookies: () => ({ get: (name: string) => {
    const value = mocks.cookieJar.get(name);
    return value === undefined ? undefined : { value };
  } }),
}));

// Keep the real session issuer AND verifier so the test proves the HTTP
// check authenticates using the same signed cookie the customer portal reads.
import { getCurrentUserId, getSessionId } from "@/lib/session";
import { GET } from "./route";

const statuses = ["PDF_GENERATED", "SIGNATURE_PENDING", "SIGNED_UPLOADED", "FAXED", "CONFIRMED", "FAILED"];
const request = (authorization = "Bearer cron-secret") => new Request(
  "https://www.form5472prep.com/api/cron/portal-smoke", { headers: { authorization } },
);
const filing = { id: "filing-one", userId: "user-one", sessionId: "existing-anonymous-session" };

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CRON_SECRET", "cron-secret");
  mocks.cookieJar.clear();
  mocks.env.appUrl = "https://www.form5472prep.com";
  mocks.findFirst.mockResolvedValue(null);
  mocks.alertServerError.mockResolvedValue(undefined);
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response("<html><body>Filing page</body></html>")));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("GET /api/cron/portal-smoke", () => {
  it("returns 401 without a configured secret or matching bearer token", async () => {
    vi.stubEnv("CRON_SECRET", undefined);
    expect((await GET(request())).status).toBe(401);
    vi.stubEnv("CRON_SECRET", "cron-secret");
    expect((await GET(new Request("https://example.com/api/cron/portal-smoke"))).status).toBe(401);
    expect((await GET(request("Bearer wrong"))).status).toBe(401);
    expect(mocks.findFirst).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("checks the most recently updated retail filing for all six statuses with real customer sessions", async () => {
    mocks.findFirst.mockImplementation(async ({ where }) => ({
      ...filing, id: `filing-${where.status}`, userId: `user-${where.status}`,
    }));
    vi.mocked(fetch).mockImplementation(async (url, options) => {
      const status = new URL(String(url)).pathname.replace("/filings/filing-", "");
      for (const cookie of new Headers(options?.headers).get("cookie")!.split("; ")) {
        const [name, value] = cookie.split("=");
        mocks.cookieJar.set(name, decodeURIComponent(value));
      }
      expect(getCurrentUserId()).toBe(`user-${status}`);
      expect(getSessionId()).toBe(filing.sessionId);
      expect(options).toMatchObject({ redirect: "manual", cache: "no-store" });
      expect(options?.signal).toBeInstanceOf(AbortSignal);
      return new Response("<html><body>Filing page</body></html>");
    });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(await response.json()).toEqual({ checked: 6, failures: [] });
    expect(mocks.findFirst.mock.calls.map(([query]) => query.where)).toEqual(
      statuses.map((status) => ({ status, partnerId: null })),
    );
    for (const [query] of mocks.findFirst.mock.calls) {
      expect(query).toMatchObject({ orderBy: { updatedAt: "desc" }, select: { id: true, userId: true, sessionId: true } });
    }
    expect(fetch).toHaveBeenCalledTimes(6);
    expect(mocks.alertServerError).not.toHaveBeenCalled();
  });

  it.each([500, 404, 302])("alerts on HTTP %s without exposing the response body or credentials", async (httpStatus) => {
    mocks.findFirst.mockResolvedValueOnce(filing);
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Private Customer private@example.com", { status: httpStatus }));
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ checked: 1, failures: [{ status: "PDF_GENERATED", reason: `HTTP ${httpStatus}` }] });
    expect(mocks.alertServerError).toHaveBeenCalledExactlyOnceWith({
      path: "/filings/filing-one", message: `Portal smoke PDF_GENERATED: HTTP ${httpStatus}`,
    });
    expect(JSON.stringify(mocks.alertServerError.mock.calls)).not.toMatch(/private|Customer|fs_user|fs_session|user-one/);
  });

  it.each([
    '<html id="__next_error__"></html>',
    '<html><script>self.__next_f.push([1,"9:E{\\"digest\\":\\"123\\"}\\n"])</script></html>',
    "<html>Something went wrong loading this page.</html>",
    "<html>Sign in to continue your filing</html>",
    "<html>truncated stream",
  ])("alerts when HTTP 200 contains a failed or locked render: %s", async (html) => {
    mocks.findFirst.mockResolvedValueOnce(filing);
    vi.mocked(fetch).mockResolvedValueOnce(new Response(html));
    expect((await GET(request())).status).toBe(500);
    expect(mocks.alertServerError).toHaveBeenCalledOnce();
  });

  it("alerts on network errors with a fixed diagnostic and continues other checks", async () => {
    mocks.findFirst.mockResolvedValueOnce(filing).mockResolvedValueOnce({ ...filing, id: "filing-two", sessionId: null });
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Private Name private@example.com cookie=secret"));
    const response = await GET(request());
    expect(await response.json()).toEqual({ checked: 2, failures: [{ status: "PDF_GENERATED", reason: "Status lookup or page request failed" }] });
    expect(JSON.stringify(mocks.alertServerError.mock.calls)).not.toMatch(/Private|private|secret/);
    const headers = new Headers(vi.mocked(fetch).mock.calls[1][1]?.headers);
    expect(headers.get("cookie")).not.toContain("fs_session");
  });

  it("skips statuses with no filing and reports missing customer accounts without inventing access", async () => {
    expect(await (await GET(request())).json()).toEqual({ checked: 0, failures: [] });
    expect(fetch).not.toHaveBeenCalled();
    mocks.findFirst.mockResolvedValueOnce({ ...filing, userId: null });
    const result = await (await GET(request())).json();
    expect(result.checked).toBe(0);
    expect(result.failures).toEqual([{ status: "PDF_GENERATED", reason: "No customer account available for authentication" }]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("alerts on a failed status lookup without exposing Prisma errors", async () => {
    mocks.findFirst.mockRejectedValueOnce(new Error("query contains private@example.com"));
    expect((await GET(request())).status).toBe(500);
    expect(mocks.alertServerError).toHaveBeenCalledWith({ path: "/api/cron/portal-smoke", message: "Portal smoke PDF_GENERATED: Status lookup or page request failed" });
  });

  it("refuses to send customer credentials over HTTP in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "configured");
    mocks.env.appUrl = "http://example.com";
    mocks.findFirst.mockResolvedValueOnce(filing);
    expect((await GET(request())).status).toBe(500);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses production's development session-secret fallback", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", undefined);
    mocks.findFirst.mockResolvedValueOnce(filing);
    expect((await GET(request())).status).toBe(500);
    expect(fetch).not.toHaveBeenCalled();
  });
});
