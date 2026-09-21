import { PDFDocument } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PREPARED_PDF_MAX_BYTES,
  preparedKeyFor,
  sha256Hex,
  signedKeyFor,
} from "@/lib/applicationSignature";

const auth = vi.hoisted(() => ({
  isAdmin: vi.fn(),
}));

const storage = vi.hoisted(() => ({
  put: vi.fn(),
  putPdf: vi.fn(),
  get: vi.fn(),
  getPdf: vi.fn(),
  del: vi.fn(),
}));

const db = vi.hoisted(() => ({
  einFindUnique: vi.fn(),
  einUpdate: vi.fn(),
  einUpdateMany: vi.fn(),
  itinFindUnique: vi.fn(),
  itinUpdate: vi.fn(),
  itinUpdateMany: vi.fn(),
}));

const pdfStamping = vi.hoisted(() => ({
  parsePlacements: vi.fn(),
  stampPlacements: vi.fn(),
}));

vi.mock("@/lib/admin/auth", () => ({
  isAdmin: auth.isAdmin,
}));

vi.mock("@/lib/email", () => ({
  sendApplicationSignatureRequestEmail: vi.fn(),
}));

vi.mock("@/lib/magicLink", () => ({
  makeMagicLink: vi.fn(() => "https://example.test/magic"),
}));

vi.mock("@/lib/storage", () => ({
  put: storage.put,
  putPdf: storage.putPdf,
  get: storage.get,
  getPdf: storage.getPdf,
  del: storage.del,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    einApplication: {
      findUnique: db.einFindUnique,
      update: db.einUpdate,
      updateMany: db.einUpdateMany,
    },
    itinApplication: {
      findUnique: db.itinFindUnique,
      update: db.itinUpdate,
      updateMany: db.itinUpdateMany,
    },
    user: {
      upsert: vi.fn(),
    },
  },
}));

vi.mock("@/lib/pdf/stampPlacements", () => ({
  parsePlacements: pdfStamping.parsePlacements,
  stampPlacements: pdfStamping.stampPlacements,
}));

import { handlePlaceSignature, signedLinkPath, storePreparedPdf, validatePreparedPdf } from "./adminSignature";

function pdfBytes(size = 2048): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes.set(new TextEncoder().encode("%PDF-1.7\n"));
  return bytes;
}

describe("validatePreparedPdf", () => {
  it("rejects bytes that do not start with the PDF header", () => {
    const bytes = pdfBytes();
    bytes[0] = 0x78;

    expect(validatePreparedPdf(bytes, "application/pdf")).toEqual({
      ok: false,
      error: "file must start with %PDF-",
    });
  });

  it("rejects PDFs that are too small", () => {
    expect(validatePreparedPdf(pdfBytes(1024), "application/pdf")).toEqual({
      ok: false,
      error: "PDF is too small",
    });
  });

  it("rejects PDFs that are too large", () => {
    expect(validatePreparedPdf(pdfBytes(PREPARED_PDF_MAX_BYTES + 1), "application/pdf")).toEqual({
      ok: false,
      error: "PDF must be 4 MB or smaller",
    });
  });

  it("accepts PDFs at the maximum size", () => {
    expect(validatePreparedPdf(pdfBytes(PREPARED_PDF_MAX_BYTES), "application/pdf")).toEqual({ ok: true });
  });

  it("rejects the wrong content type", () => {
    expect(validatePreparedPdf(pdfBytes(), "text/plain")).toEqual({
      ok: false,
      error: "file must be a PDF",
    });
  });

  it("accepts a valid PDF with PDF content type or no content type", () => {
    expect(validatePreparedPdf(pdfBytes(), "application/pdf")).toEqual({ ok: true });
    expect(validatePreparedPdf(pdfBytes(), "")).toEqual({ ok: true });
    expect(validatePreparedPdf(pdfBytes(), null)).toEqual({ ok: true });
  });
});

describe("signedLinkPath", () => {
  it("returns the customer application signing path", () => {
    expect(signedLinkPath("ein", "ein_123")).toBe("/applications/ein/ein_123/sign");
    expect(signedLinkPath("itin", "itin_456")).toBe("/applications/itin/itin_456/sign");
  });
});

describe("storePreparedPdf", () => {
  const now = new Date("2026-09-21T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    resetMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uploads the prepared PDF before updating the database", async () => {
    const calls: string[] = [];
    const bytes = new Uint8Array([1, 2, 3, 4]);
    const sha256 = sha256Hex(bytes);
    const key = preparedKeyFor("ein", "ein_123", sha256);

    db.einFindUnique.mockResolvedValue(signedApp());
    storage.put.mockImplementation(async () => {
      calls.push("put");
      return key;
    });
    db.einUpdate.mockImplementation(async () => {
      calls.push("update");
      return signedApp();
    });

    await storePreparedPdf("ein", "ein_123", bytes, "upload");

    expect(calls.slice(0, 2)).toEqual(["put", "update"]);
    expect(storage.put).toHaveBeenCalledWith(key, bytes, "application/pdf");
  });

  it("uses one database update to replace the prepared PDF and clear signature fields", async () => {
    const bytes = new Uint8Array([5, 6, 7, 8]);
    const sha256 = sha256Hex(bytes);
    const key = preparedKeyFor("ein", "ein_123", sha256);

    db.einFindUnique.mockResolvedValue(signedApp());
    storage.put.mockResolvedValue(key);
    db.einUpdate.mockResolvedValue(signedApp());
    storage.del.mockResolvedValue(undefined);

    const result = await storePreparedPdf("ein", "ein_123", bytes, "generated");

    expect(result).toEqual({ sha256, replacedSignature: true });
    expect(db.einUpdate).toHaveBeenCalledTimes(1);
    expect(db.einUpdate).toHaveBeenCalledWith({
      where: { id: "ein_123" },
      data: {
        preparedPdfKey: key,
        preparedPdfSha256: sha256,
        preparedPdfUploadedAt: now,
        preparedPdfSource: "generated",
        signatureRequestedAt: null,
        signaturePngKey: null,
        signedAt: null,
        signerName: null,
        signatureIp: null,
        signatureUserAgent: null,
        signatureConsentVersion: null,
        signedDocSha256: null,
        signedPdfKey: null,
        signedPdfAt: null,
      },
      select: expect.any(Object),
    });
  });

  it("does not update the database when the prepared PDF upload fails", async () => {
    const bytes = new Uint8Array([9, 10, 11, 12]);

    db.einFindUnique.mockResolvedValue(signedApp());
    storage.put.mockRejectedValue(new Error("upload failed"));

    await expect(storePreparedPdf("ein", "ein_123", bytes, "upload")).rejects.toThrow("upload failed");

    expect(db.einUpdate).not.toHaveBeenCalled();
    expect(db.itinUpdate).not.toHaveBeenCalled();
    expect(storage.del).not.toHaveBeenCalled();
  });
});

describe("handlePlaceSignature", () => {
  beforeEach(() => {
    resetMocks();
    auth.isAdmin.mockResolvedValue(true);
  });

  it("deletes only the newly written signed PDF and returns 409 when the claim loses", async () => {
    const { app, pdfBytes, pdfSha256 } = await stampableApp();
    const outBytes = new Uint8Array([8, 7, 6]);
    const key = signedKeyFor("ein", app.id, pdfSha256);

    db.einFindUnique.mockResolvedValue(app);
    storage.getPdf.mockResolvedValue(pdfBytes);
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));
    storage.putPdf.mockResolvedValue(key);
    storage.del.mockResolvedValue(undefined);
    db.einUpdateMany.mockResolvedValue({ count: 0 });
    pdfStamping.parsePlacements.mockReturnValue({
      ok: true,
      placements: [{ kind: "signature", page: 1, x: 10, y: 10, width: 100, height: 40 }],
    });
    pdfStamping.stampPlacements.mockResolvedValue(outBytes);

    const res = await handlePlaceSignature("ein", app.id, placementRequest());

    expect(storage.putPdf).toHaveBeenCalledWith(key, outBytes);
    expect(storage.del).toHaveBeenCalledWith(key);
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({
      error: "The application changed while stamping. Reload and try again.",
    });
  });

  it("returns the new versioned signed key and does not delete it when the claim succeeds", async () => {
    const { app, pdfBytes, pdfSha256 } = await stampableApp();
    const outBytes = new Uint8Array([4, 5, 6, 7]);
    const key = signedKeyFor("itin", app.id, pdfSha256);

    db.itinFindUnique.mockResolvedValue(app);
    storage.getPdf.mockResolvedValue(pdfBytes);
    storage.get.mockResolvedValue(new Uint8Array([1, 2, 3]));
    storage.putPdf.mockResolvedValue(key);
    db.itinUpdateMany.mockResolvedValue({ count: 1 });
    pdfStamping.parsePlacements.mockReturnValue({
      ok: true,
      placements: [{ kind: "signature", page: 1, x: 10, y: 10, width: 100, height: 40 }],
    });
    pdfStamping.stampPlacements.mockResolvedValue(outBytes);

    const res = await handlePlaceSignature("itin", app.id, placementRequest());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      pagesSigned: 1,
      signedKey: key,
      bytes: outBytes.length,
    });
    expect(storage.del).not.toHaveBeenCalled();
  });
});

function resetMocks(): void {
  auth.isAdmin.mockReset();
  storage.put.mockReset();
  storage.putPdf.mockReset();
  storage.get.mockReset();
  storage.getPdf.mockReset();
  storage.del.mockReset();
  db.einFindUnique.mockReset();
  db.einUpdate.mockReset();
  db.einUpdateMany.mockReset();
  db.itinFindUnique.mockReset();
  db.itinUpdate.mockReset();
  db.itinUpdateMany.mockReset();
  pdfStamping.parsePlacements.mockReset();
  pdfStamping.stampPlacements.mockReset();
}

function signedApp(overrides: Record<string, unknown> = {}) {
  return {
    id: "ein_123",
    email: "alex@example.test",
    fullName: "Alex Chen",
    paidAt: new Date("2026-09-20T12:00:00.000Z"),
    userId: "user_123",
    preparedPdfKey: "applications/ein/ein_123/prepared-old.pdf",
    preparedPdfSha256: "old-sha",
    signaturePngKey: "applications/ein/ein_123/signature-old.png",
    signedAt: new Date("2026-09-20T13:00:00.000Z"),
    signedDocSha256: "old-doc-sha",
    signedPdfKey: "applications/ein/ein_123/signed-old.pdf",
    ...overrides,
  };
}

async function stampableApp() {
  const pdf = await PDFDocument.create();
  pdf.addPage([400, 400]);
  const pdfBytes = await pdf.save();
  const pdfSha256 = sha256Hex(pdfBytes);
  const app = signedApp({
    id: "stamp_123",
    preparedPdfKey: "applications/ein/stamp_123/prepared-current.pdf",
    preparedPdfSha256: pdfSha256,
    signaturePngKey: "applications/ein/stamp_123/signature-current.png",
    signedDocSha256: pdfSha256,
    signedPdfKey: "applications/ein/stamp_123/signed-current.pdf",
  });

  return { app, pdfBytes, pdfSha256 };
}

function placementRequest(): Request {
  return new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify({
      placements: [{ kind: "signature", page: 1, x: 10, y: 10, width: 100, height: 40 }],
    }),
  });
}
