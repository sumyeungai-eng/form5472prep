import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Prisma is mocked so the updateField tests below assert on the exact `data`
// object handed to the DB — the grouped extension rules (cascade + isDiirsp
// recompute) live entirely in that object, so this is the cheapest place to
// pin them without a database.
const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn((args: unknown) => ({ op: "filing.update", args })),
  yearFindUnique: vi.fn(),
  yearUpdate: vi.fn((args: unknown) => ({ op: "filingYearData.update", args })),
  createLog: vi.fn((args: unknown) => ({ op: "log.create", args })),
  transaction: vi.fn(async (ops: unknown[]) => ops),
}));
const fax = vi.hoisted(() => ({
  submitFax: vi.fn(async () => ({ id: "fax_job_1", status: "queued" })),
}));
const storage = vi.hoisted(() => ({
  get: vi.fn(async () => new Uint8Array([1, 2, 3])),
  put: vi.fn(),
  putPdf: vi.fn(),
  publicUrl: vi.fn(async () => "https://example.test/faxed.pdf"),
}));
const email = vi.hoisted(() => ({
  sendMagicLinkEmail: vi.fn(),
  sendOrderConfirmationEmail: vi.fn(),
  sendReadyToSignEmail: vi.fn(),
}));
const pdf = vi.hoisted(() => ({
  generatePackage: vi.fn(async () => ({
    bytes: new Uint8Array([37, 80, 68, 70]),
    signatures: [],
    record: { generatorVersion: "test-version", commit: "test-commit" },
  })),
  runPreflight: vi.fn(async () => ({ ok: true, failures: [], warnings: [] })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findUnique: db.findUnique, update: db.update },
    filingYearData: { findUnique: db.yearFindUnique, update: db.yearUpdate },
    filingChangeLog: { create: db.createLog },
    $transaction: db.transaction,
  },
}));
vi.mock("@/lib/fax", () => ({ submitFax: fax.submitFax }));
vi.mock("@/lib/storage", () => ({
  get: storage.get,
  put: storage.put,
  putPdf: storage.putPdf,
  publicUrl: storage.publicUrl,
}));
vi.mock("@/lib/email", () => ({
  sendMagicLinkEmail: email.sendMagicLinkEmail,
  sendOrderConfirmationEmail: email.sendOrderConfirmationEmail,
  sendReadyToSignEmail: email.sendReadyToSignEmail,
}));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: () => "https://example.test/magic" }));
vi.mock("@/lib/pdf/generatePackage", () => ({
  generatePackage: pdf.generatePackage,
}));
vi.mock("@/lib/pdf/preflight", () => ({ runPreflight: pdf.runPreflight }));
vi.mock("@/lib/env", () => ({
  env: {
    appUrl: "https://example.test",
    telnyx: { destination: "+18558877737" },
  },
}));

import {
  FilingActionError,
  isValidForceOverride,
  runFilingAction,
  SIDE_EFFECTING_ACTIONS,
} from "./filingActions";
import { filingToPackageInput } from "@/lib/pdf/packageInput";

describe("SIDE_EFFECTING_ACTIONS", () => {
  it("contains exactly the four externally side-effecting filing actions", () => {
    expect(Array.from(SIDE_EFFECTING_ACTIONS).sort()).toEqual([
      "approveForSignature",
      "regeneratePdf",
      "resendMagicLink",
      "resendOrderConfirmation",
      "retryFax",
    ]);
  });
});

describe("isValidForceOverride", () => {
  it.each([
    [{ force: true, reason: "legacy admin override" }, true],
    [{ force: true, reason: "  documented override  " }, true],
    [{ force: true, reason: "" }, false],
    [{ force: true, reason: "   " }, false],
    [{ force: true }, false],
    [{ force: false, reason: "documented override" }, false],
    [{ reason: "documented override" }, false],
  ] as const)("returns %s for %o", (ctx, expected) => {
    expect(isValidForceOverride(ctx)).toBe(expected);
  });
});

describe("updateField — Form 7004 grouped rules", () => {
  // Delinquency reads the clock, so pin it: 2024 is long past due, 2025 is past
  // its April 15 2026 due date but still inside the extended (Oct 15 2026)
  // window — which is the whole point of the extension gate.
  const NOW = new Date("2026-08-25T12:00:00.000Z");

  const baseFiling = {
    id: "filing_1",
    status: "PAID",
    llcName: "Acme LLC",
    taxYears: [2025],
    isDiirsp: true,
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: null as string | null,
    extensionTransmittedAt: null as Date | null,
    extensionMethod: null as string | null,
    extensionDestination: null as string | null,
    extensionProofKey: null as string | null,
    user: { id: "u1", email: "a@b.com" },
  };

  function givenFiling(overrides: Partial<typeof baseFiling> = {}) {
    db.findUnique.mockResolvedValue({ ...baseFiling, ...overrides });
  }

  // The `data` object the single filing.update in the transaction received.
  function updatedData(): Record<string, unknown> {
    const call = db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> };
    return call.data;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("cascades: setting extensionFiled to 'no' clears the details, the proof and re-derives isDiirsp", async () => {
    givenFiling({
      extensionFiled: "yes",
      extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
      extensionMethod: "fax",
      extensionDestination: "ogden",
      extensionProofKey: "filing_1_7004.pdf",
      isDiirsp: false,
    });

    const res = await runFilingAction(
      "filing_1",
      "updateField",
      { field: "extensionFiled", value: "no" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({
      extensionFiled: "no",
      extensionTransmittedAt: null,
      extensionMethod: null,
      extensionDestination: null,
      extensionProofKey: null,
      // No extension → 2025 is past its April 15 2026 deadline → late again.
      isDiirsp: true,
    });
    expect(res).toMatchObject({ ok: true, field: "extensionFiled", after: "no" });
    // One row for the named field + one per derived column, so the change log
    // explains the values nobody typed.
    expect(db.createLog).toHaveBeenCalledTimes(6);
  });

  it("rejects an extensionTransmittedAt that is not a real YYYY-MM-DD calendar date", async () => {
    givenFiling();

    for (const bad of ["2026-02-31", "2026-13-01", "2026-04-10T12:00:00Z", "April 10 2026"]) {
      await expect(
        runFilingAction(
          "filing_1",
          "updateField",
          { field: "extensionTransmittedAt", value: bad },
          { adminId: "admin_1" },
        ),
      ).rejects.toBeInstanceOf(FilingActionError);
    }
    expect(db.update).not.toHaveBeenCalled();
  });

  it("accepts extensionFiled='yes' when no transmittal date is stored or provided", async () => {
    givenFiling({ extensionFiled: null, extensionTransmittedAt: null });

    await expect(
      runFilingAction(
        "filing_1",
        "updateField",
        { field: "extensionFiled", value: "yes" },
        { adminId: "admin_1" },
      ),
    ).resolves.toMatchObject({ ok: true, field: "extensionFiled", after: "yes" });

    expect(updatedData()).toEqual({ extensionFiled: "yes", isDiirsp: false });
  });

  it("recomputes isDiirsp: a valid stored 7004 makes the latest year timely again", async () => {
    givenFiling({
      extensionFiled: null,
      // Sent before the original April 15 2026 deadline → valid, extends to
      // October 15 2026, which is still ahead of the pinned clock.
      extensionTransmittedAt: new Date("2026-04-10T00:00:00.000Z"),
      isDiirsp: true,
    });

    await runFilingAction(
      "filing_1",
      "updateField",
      { field: "extensionFiled", value: "yes" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({ extensionFiled: "yes", isDiirsp: false });
  });

  it("does not recompute when the admin sets isDiirsp explicitly — the manual override wins", async () => {
    givenFiling({ isDiirsp: true });

    await runFilingAction(
      "filing_1",
      "updateField",
      { field: "isDiirsp", value: "false" },
      { adminId: "admin_1" },
    );

    expect(updatedData()).toEqual({ isDiirsp: false });
  });
});

describe("regeneratePdf", () => {
  const initialFiling = {
    id: "filing_1",
    status: "PDF_GENERATED",
    llcName: "Acme LLC",
    taxYears: [2026],
    signedPdfKey: "signed.pdf",
    generatedPdfKey: "old.pdf",
    preflightStatus: "passed",
    preflightOverrideBy: "admin_old",
    preflightOverrideAt: new Date("2026-09-20T00:00:00.000Z"),
    preflightOverrideReason: "Prior override reason.",
    reviewApprovedAt: new Date("2026-09-21T00:00:00.000Z"),
    reviewApprovedBy: "admin_old",
    user: { id: "u1", email: "a@b.com" },
  };

  const packageFiling = {
    llcName: "Acme LLC",
    llcEin: "12-3456789",
    llcAddress: "123 Main St",
    llcCity: "Miami",
    llcState: "FL",
    llcZip: "33101",
    llcCountry: "USA",
    llcCountryBusiness: "United States",
    llcDateIncorporated: new Date("2026-01-01T00:00:00.000Z"),
    llcBusinessActivity: "Investment holding",
    llcBusinessCode: "523900",
    ownerName: "Owner One",
    ownerAddress: "1 Queen Road, Hong Kong",
    ownerCountryCitizenship: "Hong Kong",
    ownerCountryTaxResidence: "Hong Kong",
    ownerCountryBusiness: "Hong Kong",
    ownerFtin: "HK123",
    ownerItin: null,
    ownerReferenceId: "OWNER1",
    taxYears: [2026],
    isDiirsp: false,
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: "no",
    extensionTransmittedAt: null,
    reasonableCauseNarrative: null,
    yearData: [],
  };

  beforeEach(() => {
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
    pdf.generatePackage.mockClear();
    pdf.runPreflight.mockClear();
    storage.putPdf.mockClear();
  });

  it.each(["SIGNED_UPLOADED", "FAXED", "CONFIRMED"] as const)(
    "throws 409 for %s filings",
    async (status) => {
      db.findUnique.mockResolvedValue({ ...initialFiling, status });

      await expect(
        runFilingAction("filing_1", "regeneratePdf", {}, { adminId: "admin_1" }),
      ).rejects.toMatchObject({
        status: 409,
        code: "already_signed_or_filed",
        message: "This filing has been signed or faxed. Its package cannot be regenerated.",
      });
      expect(pdf.generatePackage).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    },
  );

  it("allows PDF_GENERATED regeneration and clears the pre-flight override", async () => {
    db.findUnique
      .mockResolvedValueOnce(initialFiling)
      .mockResolvedValueOnce(packageFiling);

    await expect(
      runFilingAction("filing_1", "regeneratePdf", {}, { adminId: "admin_1" }),
    ).resolves.toMatchObject({ ok: true });

    const data = (db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> }).data;
    expect(data).toMatchObject({
      signedPdfKey: null,
      preflightOverrideBy: null,
      preflightOverrideAt: null,
      preflightOverrideReason: null,
      reviewApprovedAt: null,
      reviewApprovedBy: null,
      status: "PDF_GENERATED",
    });
  });
});

describe("approveForSignature", () => {
  const filing = {
    id: "filing_1",
    status: "PDF_GENERATED",
    llcName: "Acme LLC",
    ownerName: "Owner One",
    taxYears: [2026],
    generatedPdfKey: "unsigned.pdf",
    preflightStatus: "passed",
    preflightOverrideBy: null,
    reviewApprovedAt: null,
    reviewApprovedBy: null,
    user: { id: "u1", email: "owner@example.test" },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T12:00:00.000Z"));
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    email.sendReadyToSignEmail.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records review approval, logs it, and emails the customer", async () => {
    db.findUnique.mockResolvedValue(filing);

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: "admin_1" }),
    ).resolves.toMatchObject({ ok: true, emailSent: true });

    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "filing_1" },
      data: {
        reviewApprovedAt: new Date("2026-09-22T12:00:00.000Z"),
        reviewApprovedBy: "admin_1",
      },
      select: { id: true },
    }));
    expect(db.createLog).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filingId: "filing_1",
        adminId: "admin_1",
        field: "reviewApproval",
      }),
    }));
    expect(email.sendReadyToSignEmail).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@example.test",
      filingId: "filing_1",
      portalLink: "https://example.test/magic",
    }));
  });

  it("lets the shared admin login approve, attributed to its sign-in email", async () => {
    db.findUnique.mockResolvedValue(filing);

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: null, approver: "admin@example.test" }),
    ).resolves.toMatchObject({ ok: true });

    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ reviewApprovedBy: "admin@example.test" }),
    }));
  });

  it("still refuses when the admin cannot be identified at all", async () => {
    db.findUnique.mockResolvedValue(filing);

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: null }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("allows approval when failed pre-flight has an override", async () => {
    db.findUnique.mockResolvedValue({
      ...filing,
      preflightStatus: "failed",
      preflightOverrideBy: "admin_override",
    });

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: "admin_1" }),
    ).resolves.toMatchObject({ ok: true });
  });

  it("reports approval success with email failure details when the ready-to-sign email fails", async () => {
    db.findUnique.mockResolvedValue(filing);
    email.sendReadyToSignEmail.mockRejectedValueOnce(new Error("SMTP unavailable"));

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: "admin_1" }),
    ).resolves.toMatchObject({
      ok: true,
      emailSent: false,
      emailError: "SMTP unavailable",
    });

    expect(db.update).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        reviewApprovedAt: new Date("2026-09-22T12:00:00.000Z"),
        reviewApprovedBy: "admin_1",
      },
    }));
  });

  it("rejects approval when pre-flight failed without an override", async () => {
    db.findUnique.mockResolvedValue({
      ...filing,
      preflightStatus: "failed",
      preflightOverrideBy: null,
    });

    await expect(
      runFilingAction("filing_1", "approveForSignature", {}, { adminId: "admin_1" }),
    ).rejects.toMatchObject({ status: 409, code: "preflight_not_approved" });
    expect(db.update).not.toHaveBeenCalled();
    expect(email.sendReadyToSignEmail).not.toHaveBeenCalled();
  });

  it.each(["SIGNED_UPLOADED", "FAXED", "CONFIRMED"] as const)(
    "rejects %s filings",
    async (status) => {
      db.findUnique.mockResolvedValue({ ...filing, status });

      await expect(
        runFilingAction("filing_1", "approveForSignature", {}, { adminId: "admin_1" }),
      ).rejects.toMatchObject({ status: 409, code: "already_signed_or_filed" });
      expect(db.update).not.toHaveBeenCalled();
    },
  );
});

describe("updateYearField", () => {
  const filing = {
    id: "filing_1",
    status: "PDF_GENERATED",
    llcName: "Acme LLC",
    taxYears: [2025, 2026],
    user: { id: "u1", email: "a@b.com" },
  };

  beforeEach(() => {
    db.findUnique.mockReset();
    db.yearFindUnique.mockReset();
    db.update.mockClear();
    db.yearUpdate.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
  });

  it("writes rcsWhyMissed for the correct filing year and logs the change", async () => {
    db.findUnique.mockResolvedValue(filing);
    db.yearFindUnique.mockResolvedValue({
      id: "year_2025",
      rcsWhyMissed: "Old reason",
      rcsWhenLearned: null,
      rcsNoIrsNoticeConfirmed: null,
      nonCashTransfers: null,
      ownerPaidCosts: null,
      zeroConfirmations: null,
    });

    await expect(
      runFilingAction(
        "filing_1",
        "updateYearField",
        { taxYear: 2025, field: "rcsWhyMissed", value: "New reason", reason: "customer correction" },
        { adminId: "admin_1" },
      ),
    ).resolves.toEqual({ ok: true });

    expect(db.yearUpdate).toHaveBeenCalledWith({
      where: { filingId_taxYear: { filingId: "filing_1", taxYear: 2025 } },
      data: { rcsWhyMissed: "New reason" },
      select: { id: true },
    });
    expect(db.createLog).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filingId: "filing_1",
        adminId: "admin_1",
        field: "year:2025:rcsWhyMissed",
        beforeJson: "Old reason",
        afterJson: "New reason",
        reason: "customer correction",
      }),
    }));
  });

  it.each(["SIGNED_UPLOADED", "FAXED", "CONFIRMED"] as const)(
    "refuses %s filings",
    async (status) => {
      db.findUnique.mockResolvedValue({ ...filing, status });

      await expect(
        runFilingAction(
          "filing_1",
          "updateYearField",
          { taxYear: 2025, field: "rcsWhyMissed", value: "New reason" },
          { adminId: "admin_1" },
        ),
      ).rejects.toMatchObject({ status: 409, code: "already_signed_or_filed" });
      expect(db.yearUpdate).not.toHaveBeenCalled();
      expect(db.createLog).not.toHaveBeenCalled();
    },
  );

  it("rejects an invalid ownerPaidCosts JSON shape with no write", async () => {
    db.findUnique.mockResolvedValue(filing);

    await expect(
      runFilingAction(
        "filing_1",
        "updateYearField",
        {
          taxYear: 2025,
          field: "ownerPaidCosts",
          value: JSON.stringify([{ category: "invalid", date: "2025-01-01", amountCents: 100 }]),
        },
        { adminId: "admin_1" },
      ),
    ).rejects.toMatchObject({ status: 400, code: "invalid_value" });
    expect(db.yearUpdate).not.toHaveBeenCalled();
    expect(db.createLog).not.toHaveBeenCalled();
  });
});

describe("filingToPackageInput per-year reasonable cause", () => {
  it("passes edited rcsWhyMissed through to the package input year record", () => {
    const input = filingToPackageInput({
      llcName: "Acme LLC",
      llcEin: "12-3456789",
      llcAddress: "123 Main St",
      llcCity: "Miami",
      llcState: "FL",
      llcZip: "33101",
      llcCountry: "USA",
      llcCountryBusiness: "United States",
      llcMemberCount: 1,
      llcAddressIsRegisteredAgentOnly: false,
      priorForm5472Filed: "yes",
      hasUsSourceIncome: false,
      usTaxWithheld: false,
      llcDateIncorporated: new Date("2024-01-01T00:00:00.000Z"),
      llcBusinessActivity: "Investment holding",
      llcBusinessCode: "523900",
      ownerName: "Owner One",
      ownerAddress: "1 Queen Road, Hong Kong",
      ownerHasFtin: true,
      ownerNoPostalCode: false,
      ownerCountryCitizenship: "Hong Kong",
      ownerCountryTaxResidence: "Hong Kong",
      ownerCountryBusiness: "Hong Kong",
      ownerFtin: "HK123",
      ownerItin: null,
      ownerReferenceId: "OWNER1",
      taxYears: [2025],
      isDiirsp: true,
      isFinalReturn: false,
      dissolvedAt: null,
      extensionFiled: "no",
      extensionTransmittedAt: null,
      reasonableCauseNarrative: null,
      yearData: [{
        taxYear: 2025,
        totalAssetsYearEnd: 1000,
        contributions: 0,
        distributions: 0,
        otherTransactionsNote: null,
        reportableTransactions: [],
        nonCashTransfers: [],
        rcsWhyMissed: "The owner relied on an incorrect filing calendar.",
        rcsWhenLearned: null,
        rcsNoIrsNoticeConfirmed: null,
      }],
    });

    expect(input.yearData[0]).toMatchObject({
      taxYear: 2025,
      rcsWhyMissed: "The owner relied on an incorrect filing calendar.",
    });
  });
});

describe("resendOrderConfirmation", () => {
  const initialFiling = {
    id: "filing_1",
    status: "PDF_GENERATED",
    tier: "standard",
    amountPaid: 19900,
    llcName: "Acme LLC",
    taxYears: [2026],
    ownerName: "Owner One",
    faxService: true,
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: "no",
    extensionTransmittedAt: null,
    preflightOverrideBy: "admin_old",
    preflightOverrideAt: new Date("2026-09-20T00:00:00.000Z"),
    preflightOverrideReason: "Prior override reason.",
    reviewApprovedAt: new Date("2026-09-21T00:00:00.000Z"),
    reviewApprovedBy: "admin_old",
    user: { id: "u1", email: "owner@example.test" },
  };

  const packageFiling = {
    llcName: "Acme LLC",
    llcEin: "12-3456789",
    llcAddress: "123 Main St",
    llcCity: "Miami",
    llcState: "FL",
    llcZip: "33101",
    llcCountry: "USA",
    llcCountryBusiness: "United States",
    llcDateIncorporated: new Date("2026-01-01T00:00:00.000Z"),
    llcBusinessActivity: "Investment holding",
    llcBusinessCode: "523900",
    ownerName: "Owner One",
    ownerAddress: "1 Queen Road, Hong Kong",
    ownerCountryCitizenship: "Hong Kong",
    ownerCountryTaxResidence: "Hong Kong",
    ownerCountryBusiness: "Hong Kong",
    ownerFtin: "HK123",
    ownerItin: null,
    ownerReferenceId: "OWNER1",
    taxYears: [2026],
    isDiirsp: false,
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: "no",
    extensionTransmittedAt: null,
    reasonableCauseNarrative: null,
    yearData: [],
  };

  beforeEach(() => {
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
    email.sendOrderConfirmationEmail.mockClear();
    pdf.generatePackage.mockClear();
    pdf.runPreflight.mockClear();
    storage.putPdf.mockClear();
  });

  it("regenerates the attached PDF and clears the pre-flight override", async () => {
    db.findUnique
      .mockResolvedValueOnce(initialFiling)
      .mockResolvedValueOnce(packageFiling);

    await expect(
      runFilingAction("filing_1", "resendOrderConfirmation", {}, { adminId: "admin_1" }),
    ).resolves.toMatchObject({ ok: true, pdfAttached: true });

    const data = (db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> }).data;
    expect(data).toMatchObject({
      preflightOverrideBy: null,
      preflightOverrideAt: null,
      preflightOverrideReason: null,
      reviewApprovedAt: null,
      reviewApprovedBy: null,
      preflightStatus: "passed",
    });
    expect(email.sendOrderConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({
      requiresReasonableCause: false,
      extensionUnclear: false,
    }));
  });
});

describe("retryFax pre-flight gate", () => {
  const filing = {
    id: "filing_1",
    status: "SIGNED_UPLOADED",
    llcName: "Acme LLC",
    taxYears: [2026],
    isFinalReturn: false,
    dissolvedAt: null,
    extensionFiled: "no",
    extensionTransmittedAt: null,
    reasonableCauseNarrative: null,
    signedPdfKey: "signed.pdf",
    faxedPdfKey: null,
    faxJobId: null,
    faxStatus: null,
    preflightStatus: "passed",
    preflightOverrideBy: null,
    user: { id: "u1", email: "a@b.com" },
  };

  beforeEach(() => {
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
    fax.submitFax.mockClear();
    storage.get.mockClear();
    storage.putPdf.mockClear();
    storage.publicUrl.mockClear();
  });

  it("throws 409 and does not call submitFax when failed pre-flight has no override", async () => {
    db.findUnique.mockResolvedValue({
      ...filing,
      preflightStatus: "failed",
      preflightOverrideBy: null,
    });

    await expect(
      runFilingAction("filing_1", "retryFax", {}, { adminId: "admin_1" }),
    ).rejects.toMatchObject({ status: 409, code: "preflight_failed" });
    expect(fax.submitFax).not.toHaveBeenCalled();
  });

  it("calls submitFax when failed pre-flight has an override", async () => {
    db.findUnique.mockResolvedValue({
      ...filing,
      preflightStatus: "failed",
      preflightOverrideBy: "admin_1",
    });

    await runFilingAction("filing_1", "retryFax", {}, { adminId: "admin_1" });

    expect(fax.submitFax).toHaveBeenCalledWith({
      mediaUrl: "https://example.test/faxed.pdf",
      to: "+18558877737",
    });
  });

  it("calls submitFax when pre-flight passed without an override", async () => {
    db.findUnique.mockResolvedValue({
      ...filing,
      preflightStatus: "passed",
      preflightOverrideBy: null,
    });

    await runFilingAction("filing_1", "retryFax", {}, { adminId: "admin_1" });

    expect(fax.submitFax).toHaveBeenCalled();
  });
});

describe("approvePreflightOverride", () => {
  const filing = {
    id: "filing_1",
    status: "PDF_GENERATED",
    llcName: "Acme LLC",
    taxYears: [2026],
    preflightStatus: "failed",
    preflightOverrideBy: null,
    preflightOverrideAt: null,
    preflightOverrideReason: null,
    user: { id: "u1", email: "a@b.com" },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T12:00:00.000Z"));
    db.findUnique.mockReset();
    db.update.mockClear();
    db.createLog.mockClear();
    db.transaction.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws when pre-flight has not failed", async () => {
    db.findUnique.mockResolvedValue({ ...filing, preflightStatus: "passed" });

    await expect(
      runFilingAction("filing_1", "approvePreflightOverride", {}, { adminId: "admin_1" }),
    ).rejects.toMatchObject({ status: 409, code: "preflight_not_failed" });
    expect(db.update).not.toHaveBeenCalled();
  });

  it("records admin approval and logs the change", async () => {
    db.findUnique.mockResolvedValue(filing);
    const reason = "Confirmed with the customer by phone, package is accurate.";

    await runFilingAction("filing_1", "approvePreflightOverride", { reason }, { adminId: "admin_1" });

    const data = (db.update.mock.calls.at(-1)?.[0] as { data: Record<string, unknown> }).data;
    expect(data.preflightOverrideBy).toBe("admin_1");
    expect(data.preflightOverrideAt).toBeInstanceOf(Date);
    expect(data.preflightOverrideReason).toBe(reason);
    expect(db.createLog).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filingId: "filing_1",
        adminId: "admin_1",
        field: "preflightOverride",
        beforeJson: expect.objectContaining({
          preflightOverrideReason: null,
        }),
        afterJson: expect.objectContaining({
          preflightOverrideReason: reason,
        }),
        reason,
      }),
    }));
  });

  it.each([{}, { reason: "too short" }])("rejects missing or short override reason: %o", async (body) => {
    db.findUnique.mockResolvedValue(filing);

    await expect(
      runFilingAction("filing_1", "approvePreflightOverride", body, { adminId: "admin_1" }),
    ).rejects.toMatchObject({ status: 400, code: "reason_required" });
    expect(db.update).not.toHaveBeenCalled();
  });
});
