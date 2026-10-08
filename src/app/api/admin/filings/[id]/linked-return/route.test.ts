import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
const lib = vi.hoisted(() => ({ createLinkedReturn: vi.fn() }));
vi.mock("@/lib/admin/linkedReturn", async (orig) => ({
  ...(await orig<typeof import("@/lib/admin/linkedReturn")>()),
  createLinkedReturn: lib.createLinkedReturn,
}));

import { LinkedReturnError } from "@/lib/admin/linkedReturn";
import { POST } from "./route";

const post = (body: unknown) =>
  POST(new Request("https://x.test", { method: "POST", body: JSON.stringify(body) }), { params: { id: "orig" } });

describe("POST /api/admin/filings/[id]/linked-return", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "a1", email: "a@x.test", via: "cookie" });
  });

  it("requires an admin and valid tax years", async () => {
    auth.getAdminPrincipal.mockResolvedValueOnce(null);
    expect((await post({ taxYears: [2025] })).status).toBe(401);
    expect((await post({ taxYears: [] })).status).toBe(400);
    expect(lib.createLinkedReturn).not.toHaveBeenCalled();
  });

  it("creates the linked return and returns its id", async () => {
    lib.createLinkedReturn.mockResolvedValue({ id: "new", rootId: "orig" });
    const res = await post({ taxYears: [2025] });
    expect(await res.json()).toEqual({ ok: true, id: "new", rootId: "orig" });
    expect(lib.createLinkedReturn).toHaveBeenCalledWith({ sourceFilingId: "orig", taxYears: [2025], adminId: "a1" });
  });

  it("passes refusals through with their status", async () => {
    lib.createLinkedReturn.mockRejectedValue(new LinkedReturnError(409, "Only a paid order can get another return."));
    const res = await post({ taxYears: [2025] });
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/paid order/);
  });
});
