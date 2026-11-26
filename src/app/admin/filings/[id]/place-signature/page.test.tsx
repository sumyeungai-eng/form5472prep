import { PDFDocument } from "pdf-lib";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: db } }));
const storage = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/storage", () => storage);
vi.mock("./PlaceSignatureClient", () => ({ PlaceSignatureClient: () => null }));

import PlaceSignaturePage from "./page";

describe("place-signature page PDF compatibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "admin_1" });
  });

  it.each([
    ["2.5.1", "2.5.2", true, false],
    ["2.5.2", "2.5.1", false, false],
    ["2.5.1", null, true, true],
  ])("uses reviewed PDF metadata instead of filing version %s (PDF %s)", async (
    generatorVersion, pdfVersion, allowPreparerName, preparerNameVersionUnknown,
  ) => {
    const key = "filing_1_reviewed_123.pdf";
    db.findUnique.mockResolvedValue({
      id: "filing_1", llcName: "Test LLC", taxYears: [2025], generatedPdfKey: key,
      generatorVersion, signaturePngKey: "client.png", signedPdfKey: null,
    });
    const pdf = await PDFDocument.create();
    pdf.addPage();
    if (pdfVersion) pdf.setProducer(`generator ${pdfVersion}`);
    storage.get.mockResolvedValue(await pdf.save());

    const result = await PlaceSignaturePage({ params: { id: "filing_1" } });
    expect(storage.get).toHaveBeenCalledExactlyOnceWith(key);
    expect(db.findUnique).toHaveBeenCalledWith({
      where: { id: "filing_1" },
      select: { id: true, llcName: true, taxYears: true, generatedPdfKey: true,
        signaturePngKey: true, signedPdfKey: true },
    });
    expect(result.props).toMatchObject({ allowPreparerName, preparerNameVersionUnknown });
  });
});
