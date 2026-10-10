import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/auth", () => ({ isAdmin: vi.fn(async () => true) }));
const db = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: db.findUnique } } }));
vi.mock("@/lib/storage", () => ({ getPdf: vi.fn(async () => new Uint8Array([37, 80, 68, 70])) }));

import { downloadFileName } from "@/lib/pdf/downloadFileName";
import { GET } from "./route";

const get = (qs: string) => GET(new Request(`https://x.test/api/admin/filings/f1/pdf${qs}`), { params: { id: "f1" } });

describe("admin filing PDF route", () => {
  beforeEach(() => {
    db.findUnique.mockResolvedValue({
      generatedPdfKey: "f1_reviewed_123.pdf",
      signedPdfKey: null,
      faxedPdfKey: null,
      llcName: "Acme Holdings, LLC",
      taxYears: [2024, 2025],
    });
  });

  it("opens inline by default (View unsigned PDF)", async () => {
    const res = await get("?t=1");
    expect(res.headers.get("Content-Disposition")).toBe('inline; filename="f1_reviewed_123.pdf"');
  });

  it("downloads as an attachment with a readable name (Download unsigned PDF)", async () => {
    const res = await get("?download=1&t=1");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Form5472_Acme-Holdings-LLC_2024-2025_unsigned.pdf"',
    );
  });

  it("builds a safe file name for any LLC name", () => {
    expect(downloadFileName('Café "Ñandú" / Ltd', [2025], "unsigned")).toBe("Form5472_Cafe-Nandu-Ltd_2025_unsigned.pdf");
    expect(downloadFileName(null, [], "signed")).toBe("Form5472_filing_signed.pdf");
  });
});
