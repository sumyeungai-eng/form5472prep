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

const params = { params: { id: "filing_1" } };
const preparerPlacement = { kind: "preparerSignature", page: 2, x: 400, y: 80, width: 90, height: 30 };
const clientPlacement = { kind: "signature", page: 1, x: 100, y: 80, width: 90, height: 30 };
let pngDataUrl = "";

function post(body: Record<string, unknown>) {
  return POST(new Request("https://x.test", { method: "POST", body: JSON.stringify(body) }), params);
}

describe("place-signature with a preparer signature", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "admin_1", email: "preparer@example.test", via: "cookie" });
    db.filingFind.mockResolvedValue({ id: "filing_1", generatedPdfKey: "unsigned.pdf", signaturePngKey: "client.png" });
    db.adminFind.mockResolvedValue({ preparerSignatureKey: "admin_admin_1_saved.png" });
    const png = await sharp({ create: { width: 3, height: 3, channels: 4, background: "#fff" } }).png().toBuffer();
    pngDataUrl = `data:image/png;base64,${png.toString("base64")}`;
    const doc = await PDFDocument.create();
    doc.addPage([612, 792]);
    doc.addPage([612, 792]);
    const unsigned = await doc.save();
    storage.get.mockImplementation(async (key: string) =>
      key === "unsigned.pdf" ? unsigned : new TextEncoder().encode(`bytes:${key}`),
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
    const [, clientPng, , preparerPng] = stamp.stampPlacements.mock.calls[0] as unknown as [unknown, Uint8Array, unknown, Uint8Array];
    expect(new TextDecoder().decode(clientPng)).toBe("bytes:client.png");
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
    expect(new TextDecoder().decode(preparerPng)).toBe("bytes:admin_admin_1_saved.png");
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
});
