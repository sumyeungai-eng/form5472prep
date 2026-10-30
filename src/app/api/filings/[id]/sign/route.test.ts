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
  get: vi.fn(),
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
      updateMany: db.update,
    },
  },
}));
vi.mock("@/lib/storage", () => ({ put: storage.put, get: storage.get }));

import { POST } from "./route";

const REVIEW_PENDING_MESSAGE = "Your forms are still being reviewed. We will email you when they are ready to sign.";

const VALID = { confirmed: true, pdfKey: "unsigned.pdf", signerName: "  Jane Q. Owner  " };

function request(extra: Record<string, unknown> = VALID, headers: Record<string, string> = {}) {
  return new Request("https://example.test/api/filings/filing_1/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      pngDataUrl: `data:image/png;base64,${Buffer.alloc(300, 1).toString("base64")}`,
      ...extra,
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
    storage.get.mockReset();
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));

    session.getOwnedFiling.mockResolvedValue({ id: "filing_1" });
    session.partnerOwnsFiling.mockResolvedValue(null);
    storage.put.mockResolvedValue(undefined);
    db.update.mockResolvedValue({ count: 1 });
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
    expect(body).toMatchObject({ ok: true, signatureKey: expect.stringMatching(/^filing_1_signature_\d+\.png$/) });
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

describe("POST /api/filings/[id]/sign check confirmation", () => {
  beforeEach(() => {
    session.getOwnedFiling.mockReset();
    session.partnerOwnsFiling.mockReset();
    db.findUnique.mockReset();
    db.update.mockReset();
    storage.put.mockReset();
    storage.get.mockReset();
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));
    session.getOwnedFiling.mockResolvedValue({ id: "filing_1" });
    session.partnerOwnsFiling.mockResolvedValue(null);
    db.findUnique.mockResolvedValue({ ...baseFiling, reviewApprovedAt: new Date("2026-10-05T10:00:00Z") });
  });

  it("refuses a signature for a PDF version the client was not shown", async () => {
    const res = await POST(request({ ...VALID, pdfKey: "old_version.pdf" }), { params: { id: "filing_1" } });
    expect(res.status).toBe(409);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it("asks for a reload when the PDF changed between read and write", async () => {
    storage.put.mockResolvedValue(undefined);
    storage.get.mockResolvedValue(new Uint8Array([1]));
    db.update.mockResolvedValueOnce({ count: 0 });
    const res = await POST(request(), { params: { id: "filing_1" } });
    expect(res.status).toBe(409);
    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ generatedPdfKey: "unsigned.pdf" }),
    }));
  });

  it("refuses to sign unless the client confirmed everything is correct", async () => {
    const res = await POST(request({}), { params: { id: "filing_1" } });
    expect(res.status).toBe(400);
    expect(storage.put).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });
});

describe("POST /api/filings/[id]/sign signing record", () => {
  beforeEach(() => {
    session.getOwnedFiling.mockReset();
    session.partnerOwnsFiling.mockReset();
    db.findUnique.mockReset();
    db.update.mockReset();
    storage.put.mockReset();
    storage.get.mockReset();
    session.getOwnedFiling.mockResolvedValue({ id: "filing_1" });
    session.partnerOwnsFiling.mockResolvedValue(null);
    storage.put.mockResolvedValue(undefined);
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));
    db.update.mockResolvedValue({ count: 1 });
    db.findUnique.mockResolvedValue({ ...baseFiling, reviewApprovedAt: new Date("2026-10-05T10:00:00Z") });
  });

  it("stores the five evidence fields and kills the invite link in the same update", async () => {
    const res = await POST(
      request(VALID, { "x-forwarded-for": "203.0.113.9, 10.0.0.1", "user-agent": "UA/1.0" }),
      { params: { id: "filing_1" } },
    );
    expect(res.status).toBe(200);
    expect(storage.get).toHaveBeenCalledWith("unsigned.pdf");
    const arg = db.update.mock.calls[0][0];
    expect(arg.data).toMatchObject({
      signerName: "Jane Q. Owner",
      signatureIp: "203.0.113.9",
      signatureUserAgent: "UA/1.0",
      signatureConsentVersion: "2026-10-30",
      // sha256 of bytes [1,2,3]
      signedPreparedPdfSha256: "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81",
      inviteTokenHash: null,
      inviteExpiresAt: null,
      status: "SIGNATURE_PENDING",
    });
    expect(arg.where).toMatchObject({ generatedPdfKey: "unsigned.pdf", status: { in: ["PDF_GENERATED", "SIGNATURE_PENDING"] } });
  });

  it.each([undefined, "", "   ", "x".repeat(201)])("rejects signerName %j with 400", async (signerName) => {
    const res = await POST(request({ ...VALID, signerName }), { params: { id: "filing_1" } });
    expect(res.status).toBe(400);
    expect(storage.put).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });
});
