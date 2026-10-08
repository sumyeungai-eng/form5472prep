import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(async (_args: unknown) => ({ count: 1 })),
  createMany: vi.fn(async (_args: unknown) => ({ count: 0 })),
  transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>): Promise<unknown> =>
    fn({ filing: { updateMany: db.updateMany }, filingChangeLog: { createMany: db.createMany } }),
  ),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findMany: db.findMany, updateMany: db.updateMany },
    filingChangeLog: { createMany: db.createMany },
    $transaction: db.transaction,
  },
}));

import { POST } from "./route";

function post(body: unknown) {
  return POST(new Request("https://x.test/api/admin/filings/archive", { method: "POST", body: JSON.stringify(body) }));
}

describe("POST /api/admin/filings/archive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "admin_1", email: "a@x.test", via: "cookie" });
  });

  it("rejects non-admins and bad input", async () => {
    auth.getAdminPrincipal.mockResolvedValueOnce(null);
    expect((await post({ ids: ["f1"], archive: true })).status).toBe(401);
    expect((await post({ ids: [], archive: true })).status).toBe(400);
    expect((await post({ ids: ["f1"] })).status).toBe(400);
    expect((await post({ ids: Array.from({ length: 201 }, (_, i) => `f${i}`), archive: true })).status).toBe(400);
  });

  it("archives only drafts and finished orders, skips in-progress ones, and logs each change", async () => {
    db.findMany.mockResolvedValue([
      { id: "draft", status: "DRAFT" },
      { id: "done", status: "CONFIRMED" },
    ]);
    const res = await post({ ids: ["draft", "done", "inprogress", "draft"], archive: true });
    expect(await res.json()).toEqual({ ok: true, updated: 2, skipped: 1 });
    expect(db.findMany.mock.calls[0][0].where).toEqual({
      id: { in: ["draft", "done", "inprogress"] },
      adminHidden: false,
      status: { in: ["DRAFT", "CONFIRMED", "FAILED"] },
    });
    const update = db.updateMany.mock.calls[0][0] as { where: Record<string, unknown>; data: unknown };
    expect(update.where).toMatchObject({ id: "draft", adminHidden: false, status: { in: ["DRAFT", "CONFIRMED", "FAILED"] } });
    expect(update.data).toEqual({ adminHidden: true });
    const logs = (db.createMany.mock.calls[0][0] as { data: Array<Record<string, unknown>> }).data;
    expect(logs.map((l) => l.filingId)).toEqual(["draft", "done"]);
    expect(logs[0]).toMatchObject({ field: "adminHidden", adminId: "admin_1", afterJson: { adminHidden: true } });
  });

  it("does not count or log a row that became in-progress before the update", async () => {
    db.findMany.mockResolvedValue([
      { id: "draft", status: "DRAFT" },
      { id: "just_paid", status: "DRAFT" },
    ]);
    db.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const res = await post({ ids: ["draft", "just_paid"], archive: true });
    expect(await res.json()).toEqual({ ok: true, updated: 1, skipped: 1 });
    const logs = (db.createMany.mock.calls[0][0] as { data: Array<Record<string, unknown>> }).data;
    expect(logs.map((l) => l.filingId)).toEqual(["draft"]);
  });

  it("unarchives any archived order", async () => {
    db.findMany.mockResolvedValue([{ id: "paid_old", status: "PAID" }]);
    const res = await post({ ids: ["paid_old"], archive: false });
    expect(await res.json()).toEqual({ ok: true, updated: 1, skipped: 0 });
    expect(db.findMany.mock.calls[0][0].where).toEqual({ id: { in: ["paid_old"] }, adminHidden: true });
    expect((db.updateMany.mock.calls[0][0] as { data: unknown }).data).toEqual({ adminHidden: false });
  });

  it("writes nothing when none of the selection can be archived", async () => {
    db.findMany.mockResolvedValue([]);
    const res = await post({ ids: ["inprogress"], archive: true });
    expect(await res.json()).toEqual({ ok: true, updated: 0, skipped: 1 });
    expect(db.updateMany).not.toHaveBeenCalled();
    expect(db.createMany).not.toHaveBeenCalled();
  });
});
