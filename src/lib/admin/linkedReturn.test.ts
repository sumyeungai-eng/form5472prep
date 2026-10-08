import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { filing: { findUnique: db.findUnique, create: db.create } } }));
const log = vi.hoisted(() => ({ logFilingChange: vi.fn(async () => {}) }));
vi.mock("@/lib/admin/mutations", () => log);

import { createLinkedReturn, LINKED_RETURN_COPY_FIELDS, LinkedReturnError, parseLinkedTaxYears } from "./linkedReturn";

const original = {
  id: "orig",
  linkedToFilingId: null,
  supersededAt: null,
  status: "SIGNED_UPLOADED",
  userId: "u1",
  partnerId: null,
  tier: "standard",
  faxService: true,
  marketingConsent: false,
  llcName: "Synthetic Test LLC",
  llcEin: "12-3456789",
  ownerName: "Test Owner",
  ownerItin: null,
  // Must NOT be copied:
  priorForm5472Filed: "no",
  hasUsSourceIncome: false,
  usTaxWithheld: false,
  amountPaid: 14900,
  stripePaymentId: "pi_123",
  generatedPdfKey: "orig.pdf",
  signedPdfKey: "orig_signed.pdf",
  signaturePngKey: "sig.png",
  faxJobId: "fax_1",
  faxStatus: "delivered",
  taxYears: [2026],
  isFinalReturn: true,
  dissolvedAt: new Date("2026-05-01T00:00:00Z"),
  extensionFiled: "yes",
  reasonableCauseNarrative: "text",
  preflightStatus: "passed",
  reviewApprovedBy: "Form5472 Prep team (shared admin login)",
  funnelSource: "google",
  sessionId: "secret",
};

describe("createLinkedReturn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.create.mockResolvedValue({ id: "new" });
  });

  it("copies only client/LLC identity and starts a paid, in-review return linked to the original", async () => {
    db.findUnique.mockResolvedValue(original);
    const res = await createLinkedReturn({ sourceFilingId: "orig", taxYears: [2025], adminId: "a1" });
    expect(res).toEqual({ id: "new", rootId: "orig" });
    const data = db.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data).toMatchObject({
      linkedToFilingId: "orig",
      status: "PAID",
      amountPaid: 0,
      taxYears: [2025],
      inReview: true,
      userId: "u1",
      llcName: "Synthetic Test LLC",
      llcEin: "12-3456789",
    });
    for (const key of [
      "stripePaymentId", "generatedPdfKey", "signedPdfKey", "signaturePngKey", "faxJobId", "faxStatus",
      "isFinalReturn", "dissolvedAt", "extensionFiled", "reasonableCauseNarrative", "preflightStatus",
      "reviewApprovedBy", "funnelSource", "sessionId", "priorForm5472Filed", "hasUsSourceIncome", "usTaxWithheld",
    ]) {
      expect(data, key).not.toHaveProperty(key);
    }
    const allowed = new Set<string>([...LINKED_RETURN_COPY_FIELDS, "linkedToFilingId", "status", "amountPaid", "taxYears", "inReview", "reviewStartedAt"]);
    expect(Object.keys(data).filter((k) => !allowed.has(k))).toEqual([]);
    expect(log.logFilingChange).toHaveBeenCalledTimes(2);
  });

  it("attaches to the original order when started from an additional return", async () => {
    db.findUnique.mockResolvedValueOnce({ ...original, id: "child", linkedToFilingId: "orig" }).mockResolvedValueOnce(original);
    const res = await createLinkedReturn({ sourceFilingId: "child", taxYears: [2024], adminId: null });
    expect(res.rootId).toBe("orig");
    expect((db.create.mock.calls[0][0].data as Record<string, unknown>).linkedToFilingId).toBe("orig");
  });

  it("refuses drafts, superseded and unknown orders", async () => {
    db.findUnique.mockResolvedValueOnce({ ...original, status: "DRAFT" });
    await expect(createLinkedReturn({ sourceFilingId: "orig", taxYears: [2025], adminId: null })).rejects.toMatchObject({ status: 409 });
    db.findUnique.mockResolvedValueOnce({ ...original, supersededAt: new Date() });
    await expect(createLinkedReturn({ sourceFilingId: "orig", taxYears: [2025], adminId: null })).rejects.toBeInstanceOf(LinkedReturnError);
    db.findUnique.mockResolvedValueOnce(null);
    await expect(createLinkedReturn({ sourceFilingId: "x", taxYears: [2025], adminId: null })).rejects.toMatchObject({ status: 404 });
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe("parseLinkedTaxYears", () => {
  const now = new Date("2026-10-08T00:00:00Z");
  it("accepts 1-5 years from 2018 to this year, deduped and sorted", () => {
    expect(parseLinkedTaxYears([2025, "2024", 2025], now)).toEqual([2024, 2025]);
    expect(parseLinkedTaxYears([2026], now)).toEqual([2026]);
  });
  it.each([[[]], [[2017]], [[2027]], [["x"]], [[2020, 2021, 2022, 2023, 2024, 2025]], ["2025"], [null]])("rejects %o", (input) => {
    expect(parseLinkedTaxYears(input, now)).toBeNull();
  });
});
