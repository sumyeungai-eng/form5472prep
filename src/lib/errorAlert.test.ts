import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const telegram = vi.hoisted(() => ({ sendAdminTelegram: vi.fn() }));
vi.mock("@/lib/telegram", () => telegram);

let alertServerError: typeof import("./errorAlert").alertServerError;

beforeEach(async () => {
  vi.resetModules();
  telegram.sendAdminTelegram.mockReset().mockResolvedValue(true);
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-23T00:00:00Z"));
  ({ alertServerError } = await import("./errorAlert"));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

describe("alertServerError", () => {
  it("deduplicates simultaneous errors by digest across paths for one hour", async () => {
    const error = { path: "/filings/one", digest: "123", message: "render failed" };
    await Promise.all([alertServerError(error), alertServerError({ ...error, path: "/filings/two" })]);
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60 * 60 * 1000 - 1);
    await alertServerError(error);
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    await alertServerError(error);
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(2);
  });

  it("uses the path and first 80 message characters when there is no digest", async () => {
    const message = "a".repeat(80);
    await alertServerError({ path: "/filings/one?secret=one", message: `${message}one` });
    await alertServerError({ path: "/filings/one?secret=two", message: `${message}two` });
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
    await alertServerError({ path: "/filings/two", message });
    await alertServerError({ path: "/filings/one", message: "different error" });
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(3);
  });

  it("never throws when Telegram throws, including concurrent retries", async () => {
    telegram.sendAdminTelegram.mockRejectedValue(new Error("Telegram unavailable"));
    const error = { path: "/filings/one", message: "render failed" };
    await expect(alertServerError(error)).resolves.toBeUndefined();
    await expect(alertServerError(error)).resolves.toBeUndefined();
    expect(telegram.sendAdminTelegram).toHaveBeenCalledTimes(1);
  });

  it("removes query strings and fragments and masks plain and encoded emails", async () => {
    await alertServerError({
      path: "https://www.form5472prep.com/filings/one?email=private@example.com&token=secret#fragment",
      message: "Failed for Owner+tag@Example.com and other%40example.com at https://example.com/page?token=private-token",
    });
    const lines = telegram.sendAdminTelegram.mock.calls[0][0] as string[];
    expect(lines).toContain("Path: /filings/one");
    expect(lines).toContain("Message: Failed for [email] and [email] at https://example.com/page");
    expect(lines.join("\n")).not.toMatch(/@|secret|private-token|fragment|\?/);
    await alertServerError({ path: "/filings/owner%40example.com", message: "another error" });
    expect(telegram.sendAdminTelegram.mock.calls[1][0].join("\n")).not.toContain("example.com");
  });

  it("uses deployment ID, falls back to commit SHA, and accepts an explicit value", async () => {
    vi.stubEnv("VERCEL_DEPLOYMENT_ID", "deployment-one");
    vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "commit-one");
    await alertServerError({ path: "/one", message: "failed" });
    expect(telegram.sendAdminTelegram.mock.calls[0][0]).toContain("Deployment: deployment-one");
    vi.stubEnv("VERCEL_DEPLOYMENT_ID", undefined);
    await alertServerError({ path: "/two", message: "failed" });
    expect(telegram.sendAdminTelegram.mock.calls[1][0]).toContain("Deployment: commit-one");
    await alertServerError({ path: "/three", message: "failed", deploymentId: "explicit" });
    expect(telegram.sendAdminTelegram.mock.calls[2][0]).toContain("Deployment: explicit");
  });
});
