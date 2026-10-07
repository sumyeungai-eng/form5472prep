import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const imap = vi.hoisted(() => ({
  hasMailSince: vi.fn(),
  withImapReader: vi.fn(),
  supportImapConfig: vi.fn(),
}));
vi.mock("./imap", () => imap);
const db = vi.hoisted(() => ({ create: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { supportMailSyncRun: { create: db.create, update: db.update } } }));
vi.mock("./store", () => ({ prismaQuestionStore: {} }));

import { PROBE_WINDOW_MS, runSupportMailSyncIfNewMail } from "./run";

const now = new Date("2026-10-07T12:00:00Z");
const config = { host: "h", port: 993, user: "support@x.test", password: "p" };

describe("runSupportMailSyncIfNewMail (10-minute cron)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    imap.supportImapConfig.mockReturnValue(config);
    db.create.mockResolvedValue({ id: "run1" });
    imap.withImapReader.mockResolvedValue({
      questionsImported: 0, questionsMatched: 0, answersImported: 1, followUpsImported: 1, oldUnansweredArchived: 0,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it("does nothing when the mailbox is not connected", async () => {
    imap.supportImapConfig.mockReturnValue(null);
    await expect(runSupportMailSyncIfNewMail(now)).resolves.toEqual({ configured: false });
    expect(imap.hasMailSince).not.toHaveBeenCalled();
  });

  it("skips without touching the database when there is no new mail", async () => {
    imap.hasMailSince.mockResolvedValue(false);
    await expect(runSupportMailSyncIfNewMail(now)).resolves.toMatchObject({ skipped: true, ok: true });
    expect(imap.hasMailSince).toHaveBeenCalledWith(config, new Date(now.getTime() - PROBE_WINDOW_MS));
    expect(db.create).not.toHaveBeenCalled();
    expect(imap.withImapReader).not.toHaveBeenCalled();
  });

  it("runs a recorded 7-day sync when new mail has arrived", async () => {
    imap.hasMailSince.mockResolvedValue(true);
    await expect(runSupportMailSyncIfNewMail(now)).resolves.toMatchObject({ ok: true, followUpsImported: 1 });
    expect(db.create).toHaveBeenCalledWith({
      data: { trigger: "cron", since: new Date("2026-09-30T12:00:00Z") },
      select: { id: true },
    });
  });

  it("still runs (and records any failure) when the probe itself fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    imap.hasMailSince.mockRejectedValue(new Error("auth failed"));
    imap.withImapReader.mockRejectedValue(new Error("Login failed: auth failed"));
    await expect(runSupportMailSyncIfNewMail(now)).resolves.toMatchObject({ ok: false });
    expect(db.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ ok: false, error: "Login failed: auth failed" }) }),
    );
  });
});
