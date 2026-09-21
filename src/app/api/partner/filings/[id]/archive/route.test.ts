import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  filingFindUnique: vi.fn(),
  filingUpdate: vi.fn(),
  filingUpdateMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findUnique: db.filingFindUnique,
      update: db.filingUpdate,
      updateMany: db.filingUpdateMany,
    },
  },
}));

const partnerAuth = vi.hoisted(() => ({
  getCurrentPartner: vi.fn(),
}));

vi.mock("@/lib/partner/auth", () => ({
  getCurrentPartner: partnerAuth.getCurrentPartner,
}));

import { POST } from "./route";

function request(archived: boolean) {
  return new Request("http://test.local/archive", {
    method: "POST",
    body: JSON.stringify({ archived }),
  });
}

describe("partner filing archive route", () => {
  beforeEach(() => {
    db.filingFindUnique.mockReset();
    db.filingUpdate.mockReset();
    db.filingUpdateMany.mockReset();
    partnerAuth.getCurrentPartner.mockReset();
    partnerAuth.getCurrentPartner.mockResolvedValue({ id: "partner_1" });
  });

  it("allows unarchiving a paid filing", async () => {
    db.filingFindUnique.mockResolvedValue({ id: "filing_1", partnerId: "partner_1", status: "PAID" });
    db.filingUpdate.mockResolvedValue({});

    const res = await POST(request(false), { params: { id: "filing_1" } });

    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(res.status).toBe(200);
    expect(db.filingUpdate).toHaveBeenCalledWith({
      where: { id: "filing_1" },
      data: { partnerHidden: false },
    });
    expect(db.filingUpdateMany).not.toHaveBeenCalled();
  });

  it("refuses archiving a paid filing", async () => {
    db.filingFindUnique.mockResolvedValue({ id: "filing_1", partnerId: "partner_1", status: "PAID" });

    const res = await POST(request(true), { params: { id: "filing_1" } });

    await expect(res.json()).resolves.toEqual({ error: "Only drafts can be archived" });
    expect(res.status).toBe(409);
    expect(db.filingUpdateMany).not.toHaveBeenCalled();
  });

  it("allows archiving a draft filing with an atomic status guard", async () => {
    db.filingFindUnique.mockResolvedValue({ id: "filing_1", partnerId: "partner_1", status: "DRAFT" });
    db.filingUpdateMany.mockResolvedValue({ count: 1 });

    const res = await POST(request(true), { params: { id: "filing_1" } });

    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(res.status).toBe(200);
    expect(db.filingUpdateMany).toHaveBeenCalledWith({
      where: { id: "filing_1", partnerId: "partner_1", status: "DRAFT" },
      data: { partnerHidden: true },
    });
  });
});
