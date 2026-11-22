import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ alertServerError: vi.fn() }));
vi.mock("@/lib/errorAlert", () => mocks);

let POST: typeof import("./route").POST;
const request = (body: string, contentLength?: string) => new Request(
  "https://example.com/api/client-error", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(contentLength === undefined ? {} : { "content-length": contentLength }),
    },
    body,
  },
);
const report = (body: unknown) => request(JSON.stringify(body));

beforeEach(async () => {
  vi.resetModules();
  mocks.alertServerError.mockReset().mockResolvedValue(undefined);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-23T00:00:00Z"));
  vi.stubEnv("VERCEL_DEPLOYMENT_ID", "deployment-one");
  vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "commit-one");
  ({ POST } = await import("./route"));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("POST /api/client-error", () => {
  it.each(["", "garbage", "{", "null", "[]", "42", '"/filings/one"']) (
    "returns an empty 204 without alerting for malformed body %s", async (body) => {
      const response = await POST(request(body));
      expect(response.status).toBe(204);
      expect(await response.text()).toBe("");
      expect(mocks.alertServerError).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, null, 42, "", "filings/one", "https://example.com/one", "//example.com/one", `/${"a".repeat(200)}`])(
    "does not alert for invalid path %s", async (path) => {
      expect((await POST(report({ path }))).status).toBe(204);
      expect(mocks.alertServerError).not.toHaveBeenCalled();
    },
  );

  it("rejects oversized content-length before reading the body", async () => {
    const req = report({ path: "/filings/one" });
    req.headers.set("content-length", "2049");
    const read = vi.spyOn(req, "text");
    expect((await POST(req)).status).toBe(204);
    expect(read).not.toHaveBeenCalled();
    expect(mocks.alertServerError).not.toHaveBeenCalled();
  });

  it.each([undefined, "1"])("rejects actual oversized bodies with content-length %s", async (length) => {
    const body = JSON.stringify({ path: "/filings/one", padding: "a".repeat(2048) });
    expect((await POST(request(body, length))).status).toBe(204);
    expect(mocks.alertServerError).not.toHaveBeenCalled();
  });

  it("enforces the byte limit for multibyte text too", async () => {
    const body = JSON.stringify({ path: "/filings/one", padding: "é".repeat(1024) });
    expect(body.length).toBeLessThan(2048);
    expect((await POST(request(body))).status).toBe(204);
    expect(mocks.alertServerError).not.toHaveBeenCalled();
  });

  it.each(["/filings/one?token=secret#fragment", "/filings/one#fragment?token=secret"])(
    "alerts with sanitised path and digest for %s", async (path) => {
      expect((await POST(report({ path, digest: "abc_123-XYZ" }))).status).toBe(204);
      expect(mocks.alertServerError).toHaveBeenCalledExactlyOnceWith({
        path: "/filings/one", digest: "abc_123-XYZ", message: "client error boundary shown", deploymentId: "deployment-one",
      });
    },
  );

  it.each([undefined, null, 123, "", "a".repeat(65), "bad digest", "bad@digest", "bad\ndigest"])(
    "drops invalid digest %s and still alerts", async (digest) => {
      expect((await POST(report({ path: "/filings/one", digest }))).status).toBe(204);
      expect(mocks.alertServerError).toHaveBeenCalledExactlyOnceWith({
        path: "/filings/one", digest: undefined, message: "client error boundary shown", deploymentId: "deployment-one",
      });
    },
  );

  it("accepts the path, digest and body size limits", async () => {
    const body = JSON.stringify({ path: `/${"a".repeat(199)}`, digest: "a".repeat(64) });
    expect((await POST(request(body.padEnd(2048), "2048"))).status).toBe(204);
    expect(mocks.alertServerError).toHaveBeenCalledOnce();
  });

  it("falls back to the commit SHA for deployment identification", async () => {
    vi.stubEnv("VERCEL_DEPLOYMENT_ID", undefined);
    await POST(report({ path: "/filings/one" }));
    expect(mocks.alertServerError).toHaveBeenCalledWith(expect.objectContaining({ deploymentId: "commit-one" }));
  });

  it("caps concurrent valid reports at 20 per instance and resets after one hour", async () => {
    const responses = await Promise.all(Array.from({ length: 21 }, (_, i) =>
      POST(report({ path: `/filings/${i}`, digest: `digest-${i}` })),
    ));
    expect(responses.every((response) => response.status === 204)).toBe(true);
    expect(mocks.alertServerError).toHaveBeenCalledTimes(20);
    expect(mocks.alertServerError).not.toHaveBeenCalledWith(expect.objectContaining({ path: "/filings/20" }));
    vi.advanceTimersByTime(60 * 60 * 1000 - 1);
    await POST(report({ path: "/still-capped" }));
    expect(mocks.alertServerError).toHaveBeenCalledTimes(20);
    vi.advanceTimersByTime(1);
    expect((await POST(report({ path: "/new-window" }))).status).toBe(204);
    expect(mocks.alertServerError).toHaveBeenCalledTimes(21);
  });

  it("does not spend the alert cap on invalid reports", async () => {
    for (let i = 0; i < 21; i += 1) await POST(report({ path: "invalid" }));
    await POST(report({ path: "/valid" }));
    expect(mocks.alertServerError).toHaveBeenCalledOnce();
  });

  it("returns 204 when reading the body fails", async () => {
    const req = report({ path: "/filings/one" });
    vi.spyOn(req, "text").mockRejectedValue(new Error("read failed"));
    expect((await POST(req)).status).toBe(204);
    expect(mocks.alertServerError).not.toHaveBeenCalled();
  });

  it("returns 204 when alerting fails", async () => {
    mocks.alertServerError.mockRejectedValue(new Error("alert failed"));
    const response = await POST(report({ path: "/filings/one" }));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });
});
