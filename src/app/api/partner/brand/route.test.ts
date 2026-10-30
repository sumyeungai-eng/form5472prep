import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ partnerUpdate: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { partner: { update: db.partnerUpdate } } }));

const partnerAuth = vi.hoisted(() => ({ getCurrentPartner: vi.fn() }));
vi.mock("@/lib/partner/auth", () => ({ getCurrentPartner: partnerAuth.getCurrentPartner }));

import { PATCH } from "./route";

const req = (body: unknown) =>
  new Request("http://test.local/api/partner/brand", { method: "PATCH", body: JSON.stringify(body) });

describe("partner brand route", () => {
  beforeEach(() => {
    db.partnerUpdate.mockReset();
    partnerAuth.getCurrentPartner.mockReset().mockResolvedValue({ id: "p1", name: "Pat", company: "Acme LLC" });
  });

  it("requires a signed-in partner", async () => {
    partnerAuth.getCurrentPartner.mockResolvedValue(null);
    expect((await PATCH(req({ brandName: "X" }))).status).toBe(401);
    expect(db.partnerUpdate).not.toHaveBeenCalled();
  });

  it("saves a cleaned name on the partner's own row and returns the display name", async () => {
    db.partnerUpdate.mockResolvedValue({ brandName: "Acme Formations", company: "Acme LLC", name: "Pat" });
    const res = await PATCH(req({ brandName: "  Acme \n Formations\u0007 " }));
    expect(res.status).toBe(200);
    expect(db.partnerUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "p1" },
      data: { brandName: "Acme Formations" },
    }));
    expect(await res.json()).toEqual({ displayName: "Acme Formations" });
  });

  it("clears the name when blank, falling back to the company", async () => {
    db.partnerUpdate.mockResolvedValue({ brandName: null, company: "Acme LLC", name: "Pat" });
    const res = await PATCH(req({ brandName: "   " }));
    expect(db.partnerUpdate).toHaveBeenCalledWith(expect.objectContaining({ data: { brandName: null } }));
    expect(await res.json()).toEqual({ displayName: "Acme LLC" });
  });

  it("rejects a missing or overlong name", async () => {
    expect((await PATCH(req({}))).status).toBe(400);
    expect((await PATCH(req({ brandName: "x".repeat(121) }))).status).toBe(400);
    expect(db.partnerUpdate).not.toHaveBeenCalled();
  });
});
