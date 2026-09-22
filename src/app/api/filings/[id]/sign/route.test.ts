import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(),
  getCurrentUser: vi.fn(),
  hasFilingInviteAccess: vi.fn(),
  partnerOwnsFiling: vi.fn(),
}));

const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
}));

const storage = vi.hoisted(() => ({
  put: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  getOwnedFiling: session.getOwnedFiling,
  getCurrentUser: session.getCurrentUser,
  hasFilingInviteAccess: session.hasFilingInviteAccess,
  partnerOwnsFiling: session.partnerOwnsFiling,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: {
      findUnique: db.findUnique,
      update: db.update,
    },
  },
}));
vi.mock("@/lib/storage", () => ({ put: storage.put }));

import { POST } from "./route";

const REVIEW_PENDING_MESSAGE = "Your forms are still being reviewed. We will email you when they are ready to sign.";

function request() {
  return new Request("https://example.test/api/filings/filing_1/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pngDataUrl: `data:image/png;base64,${Buffer.alloc(300, 1).toString("base64")}`,
    }),
  });
}

const baseFiling = {
  id: "filing_1",
  userId: "user_1",
  status: "PDF_GENERATED",
  generatedPdfKey: "unsigned.pdf",
  reviewApprovedAt: null as Date | null,
  signaturePngKey: null,
  signedPdfKey: null,
  validationStatus: "passed",
  user: { id: "user_1", email: "owner@example.test" },
  yearData: [],
};

describe("POST /api/filings/[id]/sign review gate", () => {
  beforeEach(() => {
    session.getOwnedFiling.mockReset();
    session.getCurrentUser.mockReset();
    session.hasFilingInviteAccess.mockReset();
    session.partnerOwnsFiling.mockReset();
    db.findUnique.mockReset();
    db.update.mockReset();
    storage.put.mockReset();

    session.getOwnedFiling.mockResolvedValue({ id: "filing_1" });
    session.partnerOwnsFiling.mockResolvedValue(null);
    storage.put.mockResolvedValue(undefined);
    db.update.mockResolvedValue({ id: "filing_1" });
  });

  it("blocks signing when the package is not approved and signing has not started", async () => {
    db.findUnique.mockResolvedValue(baseFiling);

    const res = await POST(request(), { params: { id: "filing_1" } });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body).toEqual({ error: REVIEW_PENDING_MESSAGE });
    expect(storage.put).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("allows signing when the package is approved", async () => {
    db.findUnique.mockResolvedValue({
      ...baseFiling,
      reviewApprovedAt: new Date("2026-09-22T12:00:00.000Z"),
    });

    const res = await POST(request(), { params: { id: "filing_1" } });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, signatureKey: "filing_1_signature.png" });
    expect(storage.put).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: "SIGNATURE_PENDING" }),
    }));
  });

  it("allows signing for pre-existing SIGNATURE_PENDING filings without approval", async () => {
    db.findUnique.mockResolvedValue({
      ...baseFiling,
      status: "SIGNATURE_PENDING",
      reviewApprovedAt: null,
    });

    const res = await POST(request(), { params: { id: "filing_1" } });

    expect(res.status).toBe(200);
    expect(storage.put).toHaveBeenCalled();
    expect(db.update).toHaveBeenCalled();
  });
});
