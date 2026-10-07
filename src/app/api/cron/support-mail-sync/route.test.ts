import { afterEach, describe, expect, it, vi } from "vitest";

const run = vi.hoisted(() => ({ runSupportMailSyncIfNewMail: vi.fn() }));
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
    expect(run.runSupportMailSyncIfNewMail).not.toHaveBeenCalled();
  });

  it("runs the new-mail check when authorized and reports a failed sync as 500", async () => {
    process.env.CRON_SECRET = "s";
    const authed = () => GET(new Request("https://x.test/", { headers: { authorization: "Bearer s" } }));
    run.runSupportMailSyncIfNewMail.mockResolvedValueOnce({ configured: true, ok: true, skipped: true });
    expect((await authed()).status).toBe(200);
    run.runSupportMailSyncIfNewMail.mockResolvedValueOnce({ configured: true, ok: false, error: "x" });
    expect((await authed()).status).toBe(500);
  });
});
