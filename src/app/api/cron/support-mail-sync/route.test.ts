import { afterEach, describe, expect, it, vi } from "vitest";

const run = vi.hoisted(() => ({ runSupportMailSync: vi.fn(), recentSince: vi.fn(() => new Date("2026-10-01T00:00:00Z")) }));
vi.mock("@/lib/supportMail/run", () => run);

import { GET } from "./route";

describe("GET /api/cron/support-mail-sync", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
    vi.clearAllMocks();
  });

  it("refuses without the cron secret, even when no secret is configured", async () => {
    expect((await GET(new Request("https://x.test/api/cron/support-mail-sync"))).status).toBe(401);
    process.env.CRON_SECRET = "s";
    expect((await GET(new Request("https://x.test/", { headers: { authorization: "Bearer nope" } }))).status).toBe(401);
    expect(run.runSupportMailSync).not.toHaveBeenCalled();
  });

  it("syncs the recent window when authorized", async () => {
    process.env.CRON_SECRET = "s";
    run.runSupportMailSync.mockResolvedValue({ configured: false });
    const res = await GET(new Request("https://x.test/", { headers: { authorization: "Bearer s" } }));
    expect(res.status).toBe(200);
    expect(run.runSupportMailSync).toHaveBeenCalledWith("cron", new Date("2026-10-01T00:00:00Z"));
  });
});
