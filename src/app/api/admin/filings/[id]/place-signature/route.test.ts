import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
const log = vi.hoisted(() => ({ logFilingChange: vi.fn() }));
vi.mock("@/lib/admin/mutations", () => log);
const stamp = vi.hoisted(() => ({ stampPlacements: vi.fn(async () => new Uint8Array([1, 2, 3])) }));
vi.mock("@/lib/pdf/stampPlacements", async (orig) => ({
  ...(await orig<typeof import("@/lib/pdf/stampPlacements")>()),
  stampPlacements: stamp.stampPlacements,
}));
const storage = vi.hoisted(() => ({
  get: vi.fn(async (key: string): Promise<Uint8Array> => new TextEncoder().encode(`bytes:${key}`)),
  put: vi.fn(async () => "url"),
  putPdf: vi.fn(async () => "url"),
}));
vi.mock("@/lib/storage", () => storage);
const db = vi.hoisted(() => ({
  filingFind: vi.fn(),
  filingUpdate: vi.fn(),
  adminFind: vi.fn(),
  adminUpdate: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findUnique: db.filingFind, update: db.filingUpdate },
    admin: { findUnique: db.adminFind, update: db.adminUpdate },
  },
}));

import { POST } from "./route";
import { MAX_PREPARER_SIGNATURE_BYTES } from "@/lib/pdf/preparerSignature";

const params = { params: { id: "filing_1" } };
const preparerPlacement = { kind: "preparerSignature", page: 2, x: 400, y: 80, width: 90, height: 30 };
const namePlacement = { ...preparerPlacement, kind: "preparerName", width: 200, height: 32 };
const clientPlacement = { kind: "signature", page: 1, x: 100, y: 80, width: 90, height: 30 };
let pngDataUrl = "";
let savedPng: Uint8Array;
let clientPng: Uint8Array;
let unsignedPdf: Uint8Array;

async function makePdf(version: string | null) {
  const doc = await PDFDocument.create();
  doc.addPage([612, 792]);
  doc.addPage([612, 792]);
  if (version !== null) {
    doc.setProducer(`generator ${version}`);
    doc.setCreator(`generator ${version}`);
    doc.setKeywords([`version=${version}`, "commit=test", "generatedAt=2026-11-27T00:00:00.000Z"]);
  }
  return doc.save();
}

function post(body: Record<string, unknown>) {
  return POST(new Request("https://x.test", { method: "POST", body: JSON.stringify(body) }), params);
}

describe("place-signature with a preparer signature", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "admin_1", email: "preparer@example.test", via: "cookie" });
    db.filingFind.mockResolvedValue({ id: "filing_1", generatedPdfKey: "unsigned.pdf", signaturePngKey: "client.png", generatorVersion: "2.5.2" });
    db.adminFind.mockResolvedValue({ preparerSignatureKey: "admin_admin_1_saved.png", preparerNameKey: "admin_admin_1_name.png" });
    const png = await sharp({ create: { width: 3, height: 3, channels: 4, background: "#fff" } }).png().toBuffer();
    savedPng = new Uint8Array(png);
    clientPng = new Uint8Array(await sharp({ create: { width: 4, height: 4, channels: 4, background: "#000" } }).png().toBuffer());
    pngDataUrl = `data:image/png;base64,${png.toString("base64")}`;
    unsignedPdf = await makePdf("2.5.2");
    storage.get.mockImplementation(async (key: string) =>
      key === "unsigned.pdf" ? unsignedPdf : key === "client.png" ? clientPng : savedPng,
    );
  });

  it("rejects non-admins", async () => {
    auth.getAdminPrincipal.mockResolvedValue(null);
    expect((await post({ placements: [clientPlacement] })).status).toBe(401);
  });

  it("refuses a preparer placement without a preparer signature", async () => {
    const res = await post({ placements: [clientPlacement, preparerPlacement] });
    expect(res.status).toBe(400);
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
  });

  it("stamps a freshly drawn preparer signature separately from the client's, keeps a copy and logs who signed", async () => {
    const res = await post({
      placements: [clientPlacement, preparerPlacement],
      preparerSignaturePng: pngDataUrl,
      rememberPreparerSignature: true,
    });
    expect(res.status).toBe(200);
    const [, stampedClientPng, , preparerPng] = stamp.stampPlacements.mock.calls[0] as unknown as [unknown, Uint8Array, unknown, Uint8Array];
    expect(stampedClientPng).toEqual(clientPng);
    expect(preparerPng).not.toEqual(clientPng);
    expect(preparerPng[0]).toBe(0x89); // the drawn PNG, not the client's
    const putKeys = storage.put.mock.calls.map((c) => (c as unknown as [string])[0]);
    expect(putKeys.some((k) => /^filing_1_preparer_signature_\d+_[0-9a-f]{8}\.png$/.test(k))).toBe(true);
    expect(putKeys.some((k) => /^admin_admin_1_preparer_signature_\d+_[0-9a-f]{8}\.png$/.test(k))).toBe(true);
    expect(db.adminUpdate).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "admin_1" } }));
    expect(log.logFilingChange).toHaveBeenCalledWith(
      expect.objectContaining({
        field: "preparer_signature",
        after: expect.objectContaining({ signedBy: "preparer@example.test", placements: 1 }),
      }),
    );
  });

  it("reuses the admin's saved preparer signature without re-saving it", async () => {
    const res = await post({ placements: [preparerPlacement], useSavedPreparerSignature: true });
    expect(res.status).toBe(200);
    const preparerPng = (stamp.stampPlacements.mock.calls[0] as unknown as [unknown, unknown, unknown, Uint8Array])[3];
    expect(preparerPng).toEqual(savedPng);
    expect(storage.get).toHaveBeenCalledWith("admin_admin_1_saved.png");
    expect(db.adminUpdate).not.toHaveBeenCalled();
  });

  it("rejects an invalid drawn image, including a corrupt file with a PNG header", async () => {
    const res = await post({ placements: [preparerPlacement], preparerSignaturePng: "data:image/png;base64,AAAA" });
    expect(res.status).toBe(400);
    const fake = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]);
    const res2 = await post({ placements: [preparerPlacement], preparerSignaturePng: `data:image/png;base64,${fake.toString("base64")}` });
    expect(res2.status).toBe(400);
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
  });

  it("leaves client-only signing unchanged", async () => {
    const res = await post({ placements: [clientPlacement] });
    expect(res.status).toBe(200);
    expect((stamp.stampPlacements.mock.calls[0] as unknown as unknown[])[3]).toBeNull();
    expect(log.logFilingChange).not.toHaveBeenCalled();
  });
  it("stamps and remembers the name separately, retaining an audit key without image data", async () => {
    const res = await post({ placements: [clientPlacement, preparerPlacement, namePlacement],
      preparerSignaturePng: pngDataUrl, preparerNamePng: pngDataUrl, rememberPreparerName: true });
    expect(res.status).toBe(200);
    const args = stamp.stampPlacements.mock.calls[0] as unknown as unknown[];
    expect(args[4]).toEqual(savedPng);
    const key = expect.stringMatching(/^filing_1_preparer_name_\d+_[0-9a-f]{8}\.png$/);
    expect(storage.put).toHaveBeenCalledWith(key, savedPng, "image/png");
    expect(db.adminUpdate).toHaveBeenCalledWith({ where: { id: "admin_1" }, data: {
      preparerNameKey: expect.stringMatching(/^admin_admin_1_preparer_name_\d+_[0-9a-f]{8}\.png$/),
    } });
    expect(log.logFilingChange).toHaveBeenCalledWith({ filingId: "filing_1", adminId: "admin_1", source: "admin",
      field: "preparer_name", before: null, after: { preparerNameKey: key, signedBy: "preparer@example.test", placements: 1 } });
  });

  it("reuses only the personal admin's saved name, without overwriting their signature", async () => {
    const res = await post({ placements: [namePlacement], useSavedPreparerName: true });
    expect(res.status).toBe(200);
    expect(storage.get).toHaveBeenCalledWith("admin_admin_1_name.png");
    expect(storage.get).not.toHaveBeenCalledWith("admin_admin_1_saved.png");
    const args = stamp.stampPlacements.mock.calls[0] as unknown as unknown[];
    expect(args[1]).toBeNull();
    expect(args[3]).toBeNull();
    expect(args[4]).toEqual(savedPng);
    expect(db.adminUpdate).not.toHaveBeenCalled();
  });

  it("shared-password sessions can draw a name, but cannot remember or reuse it", async () => {
    auth.getAdminPrincipal.mockResolvedValue({ adminId: null, email: null, via: "cookie" });
    expect((await post({ placements: [namePlacement], preparerNamePng: pngDataUrl, rememberPreparerName: true })).status).toBe(200);
    expect(db.adminUpdate).not.toHaveBeenCalled();
    expect(storage.put.mock.calls).toHaveLength(1); // filing audit copy only
    expect(log.logFilingChange).toHaveBeenCalledWith(expect.objectContaining({ adminId: null, field: "preparer_name" }));
    stamp.stampPlacements.mockClear();
    expect((await post({ placements: [namePlacement], useSavedPreparerName: true })).status).toBe(400);
    expect(db.adminFind).not.toHaveBeenCalled();
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
  });

  it("never substitutes a client signature, preparer signature or saved signature for a missing name", async () => {
    for (const body of [{}, { preparerSignaturePng: pngDataUrl }, { useSavedPreparerSignature: true }]) {
      expect((await post({ placements: [namePlacement], ...body })).status).toBe(400);
    }
    expect((await post({ placements: [preparerPlacement], preparerNamePng: pngDataUrl })).status).toBe(400);
    db.adminFind.mockResolvedValue({ preparerSignatureKey: "admin_admin_1_saved.png", preparerNameKey: null });
    expect((await post({ placements: [namePlacement], useSavedPreparerName: true })).status).toBe(400);
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
    expect(storage.putPdf).not.toHaveBeenCalled();
  });

  it("rejects corrupt, oversized and over-dimensioned names before saving anything", async () => {
    const fake = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 7)]);
    const big = Buffer.alloc(MAX_PREPARER_SIGNATURE_BYTES + 1);
    fake.subarray(0, 8).copy(big);
    const wide = await sharp({ create: { width: 4001, height: 1, channels: 4, background: "#fff" } }).png().toBuffer();
    for (const input of ["junk", ...[fake, big, wide].map((bytes) => `data:image/png;base64,${bytes.toString("base64")}`)]) {
      expect((await post({ placements: [namePlacement], preparerNamePng: input })).status).toBe(400);
    }
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
    expect(storage.putPdf).not.toHaveBeenCalled();
  });

  it("allows a name-only placement without a client signature on file", async () => {
    db.filingFind.mockResolvedValue({ id: "filing_1", generatedPdfKey: "unsigned.pdf", signaturePngKey: null, generatorVersion: "2.5.2" });
    expect((await post({ placements: [namePlacement], preparerNamePng: pngDataUrl })).status).toBe(200);
    const args = stamp.stampPlacements.mock.calls[0] as unknown as unknown[];
    expect(args[1]).toBeNull();
    expect(args[3]).toBeNull();
    expect(args[4]).toEqual(savedPng);
  });

  it("returns 400 when the saved name is unreadable or missing from storage", async () => {
    storage.get.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
    expect((await post({ placements: [namePlacement], useSavedPreparerName: true })).status).toBe(400);
    storage.get.mockRejectedValueOnce(new Error("not found"));
    expect((await post({ placements: [namePlacement], useSavedPreparerName: true })).status).toBe(400);
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
    expect(storage.putPdf).not.toHaveBeenCalled();
  });

  it.each([
    ["2.5.1", 409], ["2.5.2", 200], ["2.5.10", 200], ["2.10.0", 200],
    [null, 200], ["unknown", 200], ["2.5", 200],
  ])("uses the stamped PDF's generator metadata %s for status %s", async (version, status) => {
    unsignedPdf = await makePdf(version);
    const response = await post({ placements: [namePlacement], preparerNamePng: pngDataUrl });
    expect(response.status).toBe(status);
    expect(db.filingFind).toHaveBeenCalledWith({
      where: { id: "filing_1" }, select: { id: true, generatedPdfKey: true, signaturePngKey: true },
    });
    if (status === 409) {
      expect(await response.json()).toEqual({ error: "This PDF still has the typed preparer name, so a handwritten name would overlap it. Regenerate the PDF, or leave the name as typed." });
      expect(stamp.stampPlacements).not.toHaveBeenCalled();
      expect(storage.putPdf).not.toHaveBeenCalled();
      expect(db.filingUpdate).not.toHaveBeenCalled();
    } else {
      expect(stamp.stampPlacements).toHaveBeenCalledOnce();
      expect((stamp.stampPlacements.mock.calls[0] as unknown as unknown[])[0]).toEqual(unsignedPdf);
    }
  });

  it.each([
    ["2.5.1", "2.5.2", 200],
    ["2.5.2", "2.5.1", 409],
  ])("judges a reviewed upload's bytes, not filing version %s (PDF %s -> %s)", async (generatorVersion, pdfVersion, status) => {
    const reviewedKey = "filing_1_reviewed_123.pdf";
    const reviewedPdf = await makePdf(pdfVersion);
    db.filingFind.mockResolvedValue({ id: "filing_1", generatedPdfKey: reviewedKey,
      signaturePngKey: "client.png", generatorVersion });
    storage.get.mockImplementation(async (key: string) =>
      key === reviewedKey ? reviewedPdf : key === "unsigned.pdf" ? unsignedPdf : clientPng,
    );
    const response = await post({ placements: [namePlacement], preparerNamePng: pngDataUrl });
    expect(response.status).toBe(status);
    expect(storage.get).toHaveBeenCalledWith(reviewedKey);
    expect(storage.get).not.toHaveBeenCalledWith("unsigned.pdf");
    if (status === 200) {
      expect((stamp.stampPlacements.mock.calls[0] as unknown as unknown[])[0]).toEqual(reviewedPdf);
    } else {
      expect(await response.json()).toEqual({ error: "This PDF still has the typed preparer name, so a handwritten name would overlap it. Regenerate the PDF, or leave the name as typed." });
      expect(stamp.stampPlacements).not.toHaveBeenCalled();
      expect(storage.putPdf).not.toHaveBeenCalled();
      expect(storage.put).not.toHaveBeenCalled();
    }
  });

  it("still stamps a preparer signature on a 2.5.1 PDF", async () => {
    unsignedPdf = await makePdf("2.5.1");
    expect((await post({ placements: [preparerPlacement], preparerSignaturePng: pngDataUrl })).status).toBe(200);
    expect(stamp.stampPlacements).toHaveBeenCalledOnce();
  });

  it.each([
    { kind: "client", saved: true },
    { kind: "preparerSignature", saved: false },
    { kind: "preparerSignature", saved: true },
    { kind: "preparerName", saved: false },
    { kind: "preparerName", saved: true },
  ])("returns 400 before stamping a truncated $kind PNG (saved=$saved)", async ({ kind, saved }) => {
    const png = await sharp({ create: { width: 600, height: 160, channels: 4, background: "#fff" } }).png().toBuffer();
    const truncated = png.subarray(0, 80);
    expect(truncated).toHaveLength(80);
    const dataUrl = `data:image/png;base64,${truncated.toString("base64")}`;
    const body: Record<string, unknown> = {
      placements: [kind === "client" ? clientPlacement : kind === "preparerSignature" ? preparerPlacement : namePlacement],
    };
    if (kind === "client") clientPng = truncated;
    else if (saved) {
      savedPng = truncated;
      body[kind === "preparerName" ? "useSavedPreparerName" : "useSavedPreparerSignature"] = true;
    } else {
      body[kind === "preparerName" ? "preparerNamePng" : "preparerSignaturePng"] = dataUrl;
    }
    expect((await post(body)).status).toBe(400);
    expect(stamp.stampPlacements).not.toHaveBeenCalled();
    expect(storage.put).not.toHaveBeenCalled();
    expect(storage.putPdf).not.toHaveBeenCalled();
    expect(db.filingUpdate).not.toHaveBeenCalled();
    expect(db.adminUpdate).not.toHaveBeenCalled();
  });

});
