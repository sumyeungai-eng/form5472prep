import { describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn(async (): Promise<unknown[]> => []));
vi.mock("@/lib/prisma", () => ({ prisma: { filingChangeLog: { findMany } } }));

import { latestGeneratedDraftKey, newUnsignedPdfKey, releasedPdfKey } from "./packageKeys";

describe("packageKeys", () => {
  it("versions every generated key", () => {
    expect(newUnsignedPdfKey("f1")).toMatch(/^f1_unsigned_\d+\.pdf$/);
  });

  it("releases a key only with both the approval time and the key", () => {
    expect(releasedPdfKey({ reviewApprovedAt: null, reviewApprovedPdfKey: "k.pdf" })).toBeNull();
    expect(releasedPdfKey({ reviewApprovedAt: new Date(), reviewApprovedPdfKey: null })).toBeNull();
    expect(releasedPdfKey({ reviewApprovedAt: new Date(), reviewApprovedPdfKey: "k.pdf" })).toBe("k.pdf");
  });

  it("finds the latest draft behind a reviewed upload, else the legacy key", async () => {
    findMany.mockResolvedValueOnce([
      { beforeJson: { generatedPdfKey: "f1_reviewed_2.pdf" }, afterJson: { generatedPdfKey: "f1_reviewed_3.pdf" } },
      { beforeJson: { generatedPdfKey: "f1_unsigned_1.pdf" }, afterJson: { generatedPdfKey: "f1_reviewed_2.pdf" } },
    ]);
    await expect(latestGeneratedDraftKey("f1", "f1_reviewed_3.pdf")).resolves.toBe("f1_unsigned_1.pdf");
    await expect(latestGeneratedDraftKey("f1", "f1_reviewed_3.pdf")).resolves.toBe("f1_unsigned.pdf");
  });
});
