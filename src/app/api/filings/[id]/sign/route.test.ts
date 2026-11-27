import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  getOwnedFiling: vi.fn(),
  getCurrentUser: vi.fn(),
  hasFilingInviteAccess: vi.fn(),
  partnerOwnsFiling: vi.fn(),
}));

const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  partnerFindUnique: vi.fn(),
}));

const notifications = vi.hoisted(() => ({ email: vi.fn(), telegram: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendFilingSignedAdminEmail: notifications.email, sendApplicationSignedAdminEmail: vi.fn() }));
vi.mock("@/lib/telegram", () => ({ sendAdminTelegram: notifications.telegram }));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://example.test" } }));

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
    partner: { findUnique: db.partnerFindUnique },
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
  llcName: "Pat Personal pat.personal@example.test",
  taxYears: [2024, 2025],
  partnerId: null,
  signedAt: null,
  userId: "user_1",
  status: "PDF_GENERATED",
  generatedPdfKey: "unsigned.pdf",
  reviewApprovedAt: null as Date | null,
  reviewApprovedPdfKey: "unsigned.pdf" as string | null,
  signaturePngKey: null,
  signedPdfKey: null,
  validationStatus: "passed",
  user: { id: "user_1", email: "owner@example.test" },
  yearData: [],
};

beforeEach(() => {
  notifications.email.mockReset().mockResolvedValue(undefined);
  notifications.telegram.mockReset().mockResolvedValue(true);
  db.partnerFindUnique.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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
    expect(notifications.email).not.toHaveBeenCalled();
    expect(notifications.telegram).not.toHaveBeenCalled();
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

  // Release gate: the grandfathered-status bypass is gone (the D11 backfill
  // released every filing that was already past PDF_GENERATED).
  it("refuses a former-grandfathered SIGNATURE_PENDING filing that was never released", async () => {
    db.findUnique.mockResolvedValue({
      ...baseFiling,
      status: "SIGNATURE_PENDING",
      reviewApprovedAt: null,
      reviewApprovedPdfKey: null,
    });

    const res = await POST(request(), { params: { id: "filing_1" } });

    expect(res.status).toBe(409);
    expect(storage.put).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it("refuses to sign a package other than the released one", async () => {
    db.findUnique.mockResolvedValue({
      ...baseFiling,
      reviewApprovedAt: new Date("2026-09-22T12:00:00.000Z"),
      reviewApprovedPdfKey: "older_released.pdf",
    });

    const res = await POST(request(), { params: { id: "filing_1" } });

    expect(res.status).toBe(409);
    expect(db.update).not.toHaveBeenCalled();
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
    expect(notifications.email).not.toHaveBeenCalled();
    expect(notifications.telegram).not.toHaveBeenCalled();
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

  it("notifies admin with filing details after the successful conditional write", async () => {
    db.findUnique.mockResolvedValue({
      ...baseFiling,
      partnerId: "partner_1",
      reviewApprovedAt: new Date("2026-10-05T10:00:00Z"),
    });
    db.partnerFindUnique.mockResolvedValue({ name: "Example Agency" });
    const res = await POST(
      request(VALID, { "x-forwarded-for": "203.0.113.9", "user-agent": "Private UA" }),
      { params: { id: "filing_1" } },
    );

    expect(res.status).toBe(200);
    expect(notifications.email).toHaveBeenCalledExactlyOnceWith({
      filingId: "filing_1",
      llcName: baseFiling.llcName,
      taxYears: [2024, 2025],
      signerName: "Jane Q. Owner",
      reSign: false,
      partnerName: "Example Agency",
      adminLink: "https://example.test/admin/filings/filing_1",
      placeSignatureLink: "https://example.test/admin/filings/filing_1/place-signature",
    });
    expect(db.partnerFindUnique).toHaveBeenCalledWith({ where: { id: "partner_1" }, select: { name: true } });
    expect(notifications.telegram).toHaveBeenCalledExactlyOnceWith([
      "✍️ Form 5472 signed",
      "Tax years: 2024, 2025",
      "Ref: filing_1",
      "https://example.test/admin/filings/filing_1",
    ]);
    const telegram = JSON.stringify(notifications.telegram.mock.calls);
    for (const privateValue of [baseFiling.llcName, "Pat Personal", "pat.personal@example.test", "Jane Q. Owner", "203.0.113.9", "owner@example.test", "Private UA", "data:image", "_signature_"]) {
      expect(telegram).not.toContain(privateValue);
    }
    expect(notifications.email.mock.invocationCallOrder[0]).toBeGreaterThan(db.update.mock.invocationCallOrder[0]);
    expect(notifications.telegram.mock.invocationCallOrder[0]).toBeGreaterThan(db.update.mock.invocationCallOrder[0]);
  });

  it.each([
    { signedAt: new Date("2026-10-04T10:00:00Z"), signaturePngKey: null },
    { signedAt: null, signaturePngKey: "earlier-signature.png" },
  ])("uses the pre-write signature evidence for re-sign alerts (%j)", async (previous) => {
    db.findUnique.mockResolvedValue({ ...baseFiling, ...previous, reviewApprovedAt: new Date(), status: "SIGNATURE_PENDING" });

    const res = await POST(request(), { params: { id: "filing_1" } });

    expect(res.status).toBe(200);
    expect(notifications.email).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ reSign: true }));
    expect(notifications.telegram).toHaveBeenCalledExactlyOnceWith([
      "✍️ Form 5472 re-signed",
      "Tax years: 2024, 2025",
      "Ref: filing_1",
      "https://example.test/admin/filings/filing_1",
    ]);
  });

  it.each(["email", "telegram", "partner"] as const)("keeps signing successful when %s throws", async (failure) => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    const privateError = new Error("Private signer owner@example.test 203.0.113.9");
    if (failure === "partner") {
      db.findUnique.mockResolvedValue({ ...baseFiling, partnerId: "partner_1", reviewApprovedAt: new Date() });
      db.partnerFindUnique.mockRejectedValue(privateError);
    } else {
      notifications[failure].mockRejectedValue(privateError);
    }

    const res = await POST(request(), { params: { id: "filing_1" } });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, signatureKey: expect.any(String) });
    expect(notifications.telegram).toHaveBeenCalledTimes(1);
    expect(notifications.email).toHaveBeenCalledTimes(failure === "partner" ? 0 : 1);
    expect(errorLog).toHaveBeenCalledExactlyOnceWith("[admin notify] task failed");
  });

  it.each(["email", "telegram", "partner"] as const)("returns success within 4000 ms when %s never resolves", async (pending) => {
    vi.useFakeTimers();
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    if (pending === "partner") {
      db.findUnique.mockResolvedValue({ ...baseFiling, partnerId: "partner_1", reviewApprovedAt: new Date() });
      db.partnerFindUnique.mockImplementation(() => new Promise(() => {}));
    } else {
      notifications[pending].mockImplementation(() => new Promise(() => {}));
    }
    const response = POST(request(), { params: { id: "filing_1" } });
    const returned = vi.fn();
    void response.then(returned);

    await vi.advanceTimersByTimeAsync(3999);
    expect(returned).not.toHaveBeenCalled();
    expect(notifications.telegram).toHaveBeenCalledTimes(1);
    expect(notifications.email).toHaveBeenCalledTimes(pending === "partner" ? 0 : 1);
    await vi.advanceTimersByTimeAsync(1);

    const res = await response;
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, signatureKey: expect.any(String) });
    expect(errorLog).toHaveBeenCalledExactlyOnceWith("[admin notify] timed out");
    expect(vi.getTimerCount()).toBe(0);
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
