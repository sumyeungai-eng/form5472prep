import crypto from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Admin SSN actions (docs/reviews/2026-10-15-ssn-capture-spec.md): Reveal is
// identity-gated and change-logged before the number is returned; "Ask client
// for SSN" sends a brand-aware email whose link lands on the order page #ssn
// and which carries no digits; admin entry uses the same encrypted path.
// The email template and sendEmail are REAL (Resend's HTTP API is stubbed).
// Synthetic SSN only.

const DIGITS = "123456789";

const state = vi.hoisted(() => ({
  row: null as null | Record<string, unknown>,
  logs: [] as Array<Record<string, unknown>>,
}));

const prismaMock = vi.hoisted(() => {
  const client = {
    filing: {
      findUnique: vi.fn(async () => (state.row ? { ...state.row } : null)),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(state.row!, data);
        return { id: state.row!.id };
      }),
      updateMany: vi.fn(
        async ({ where, data }: { where: { status?: { notIn?: string[] } }; data: Record<string, unknown> }) => {
          if (!state.row || where.status?.notIn?.includes(state.row.status as string)) return { count: 0 };
          Object.assign(state.row, data);
          return { count: 1 };
        },
      ),
    },
    filingChangeLog: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        state.logs.push(data);
        return { id: `log_${state.logs.length}` };
      }),
      findFirst: vi.fn(async () => null),
      findMany: vi.fn(async (): Promise<Array<{ changedAt: Date; afterJson: unknown }>> => []),
    },
    emailLog: { create: vi.fn(async () => ({ id: "email_log_1" })) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(client)),
  };
  return client;
});
const brand = vi.hoisted(() => ({
  brandForFiling: vi.fn(async (): Promise<{ name: string; replyTo?: string } | null> => null),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/fax", () => ({ submitFax: vi.fn(), TelnyxSubmitRejectedError: class extends Error {} }));
vi.mock("@/lib/storage", () => ({ get: vi.fn(), put: vi.fn(), putPdf: vi.fn(), publicUrl: vi.fn() }));
vi.mock("@/lib/partnerBrand", () => ({ brandForFiling: brand.brandForFiling }));
vi.mock("@/lib/magicLink", () => ({ makeMagicLink: () => "https://example.test/auth/token123" }));
vi.mock("@/lib/pdf/generatePackage", () => ({ generatePackage: vi.fn() }));
vi.mock("@/lib/pdf/preflight", () => ({ runPreflight: vi.fn() }));
vi.mock("@/lib/env", () => ({
  env: {
    appUrl: "https://example.test",
    adminEmail: "admin@example.test",
    supportEmail: "support@example.test",
    telnyx: { destination: "+18558877737" },
  },
}));

import { runFilingAction } from "./filingActions";
import { latestSignedPdfUploadAt, ownerSsnNewerThanPackage } from "@/lib/ownerSsn";
import { decryptPii, encryptPii } from "@/lib/crypto/pii";

const sent: Array<{ to: unknown; subject: string; html: string; text: string; from: string; reply_to?: string }> = [];
const realFetch = globalThis.fetch;
beforeAll(() => {
  process.env.RESEND_API_KEY = "re_test_dummy";
  globalThis.fetch = vi.fn(async (_url: unknown, init?: RequestInit) => {
    sent.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: "resend_1" }), { status: 200 });
  }) as typeof fetch;
});
afterAll(() => {
  globalThis.fetch = realFetch;
  delete process.env.RESEND_API_KEY;
});

function seed(extra: Record<string, unknown> = {}) {
  state.row = {
    id: "filing_1",
    status: "PDF_GENERATED",
    llcName: "Test Widgets LLC",
    ownerName: "Alex Example",
    taxYears: [2025],
    user: { id: "user_1", email: "client@example.test" },
    ownerSsnCiphertext: null,
    ownerSsnLast4: null,
    ownerSsnSubmittedAt: null,
    ownerSsnRequestedAt: null,
    ...extra,
  };
}

beforeEach(() => {
  state.logs.length = 0;
  sent.length = 0;
  brand.brandForFiling.mockResolvedValue(null);
  process.env.PII_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
});

describe("revealOwnerSsn", () => {
  it("returns the number to an identified admin and change-logs the reveal (who, when) without the digits", async () => {
    seed({ ownerSsnCiphertext: encryptPii(DIGITS), ownerSsnLast4: "6789" });
    const result = await runFilingAction("filing_1", "revealOwnerSsn", {}, { adminId: "admin_1", approver: "admin_1" });
    expect(result).toMatchObject({ ok: true, ssn: "123-45-6789" });
    expect(state.logs).toHaveLength(1);
    expect(state.logs[0]).toMatchObject({ field: "ownerSsnReveal", adminId: "admin_1", source: "admin" });
    const after = state.logs[0].afterJson as Record<string, unknown>;
    expect(after).toMatchObject({ action: "reveal", revealedBy: "admin_1", ssn: "•••-••-6789" });
    expect(typeof after.revealedAt).toBe("string");
    expect(JSON.stringify(state.logs[0])).not.toContain(DIGITS);
  });

  it("refuses when the admin cannot be identified", async () => {
    seed({ ownerSsnCiphertext: encryptPii(DIGITS), ownerSsnLast4: "6789" });
    await expect(runFilingAction("filing_1", "revealOwnerSsn", {}, { adminId: null })).rejects.toMatchObject({
      status: 403,
      code: "identity_required",
    });
    expect(state.logs).toHaveLength(0);
  });

  it("reports a value that cannot be decrypted (key changed) without crashing or logging a reveal", async () => {
    seed({ ownerSsnCiphertext: encryptPii(DIGITS), ownerSsnLast4: "6789" });
    process.env.PII_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
    await expect(
      runFilingAction("filing_1", "revealOwnerSsn", {}, { adminId: "admin_1", approver: "admin_1" }),
    ).rejects.toMatchObject({ status: 500, code: "decrypt_failed" });
    expect(state.logs).toHaveLength(0);
  });

  it("says the setting is missing when PII_ENCRYPTION_KEY is absent", async () => {
    seed({ ownerSsnCiphertext: "v1:a:b:c", ownerSsnLast4: "6789" });
    delete process.env.PII_ENCRYPTION_KEY;
    await expect(
      runFilingAction("filing_1", "revealOwnerSsn", {}, { adminId: "admin_1", approver: "admin_1" }),
    ).rejects.toMatchObject({ status: 503, code: "not_configured" });
  });
});

describe("requestOwnerSsn", () => {
  it("emails a sign-in link to the order page #ssn, with no digits, stamps ownerSsnRequestedAt and logs it", async () => {
    seed();
    const result = await runFilingAction("filing_1", "requestOwnerSsn", {}, { adminId: "admin_1" });
    expect(result).toMatchObject({ ok: true, emailTo: "client@example.test" });
    expect(sent).toHaveLength(1);
    const mail = sent[0];
    expect(mail.to).toBe("client@example.test");
    const url = new URL(mail.text.match(/https:\/\/example\.test\/auth\/\S+/)![0]);
    expect(url.searchParams.get("next")).toBe("/filings/filing_1#ssn");
    expect(mail.html).toContain("next=%2Ffilings%2Ffiling_1%23ssn");
    for (const part of [mail.subject, mail.html, mail.text]) {
      expect(part).not.toMatch(/\d{3}-?\d{2}-?\d{4}/);
    }
    expect(state.row!.ownerSsnRequestedAt).toBeInstanceOf(Date);
    expect(state.logs.at(-1)).toMatchObject({ field: "ownerSsnRequest", adminId: "admin_1" });
  });

  it("uses the partner brand for partner filings (S8)", async () => {
    seed();
    brand.brandForFiling.mockResolvedValue({ name: "Acme Filings", replyTo: "help@acme.test" });
    await runFilingAction("filing_1", "requestOwnerSsn", {}, { adminId: "admin_1" });
    expect(sent[0].from).toContain("Acme Filings");
    expect(sent[0].reply_to).toBe("help@acme.test");
    expect(sent[0].text).toContain("The Acme Filings team");
  });

  it.each(["FAXED", "CONFIRMED", "DRAFT"])("refuses for a %s filing and sends nothing", async (status) => {
    seed({ status });
    await expect(runFilingAction("filing_1", "requestOwnerSsn", {}, { adminId: "admin_1" })).rejects.toMatchObject({
      status: 409,
    });
    expect(sent).toHaveLength(0);
  });

  it("refuses when PII_ENCRYPTION_KEY is missing (the client's box would be unavailable)", async () => {
    seed();
    delete process.env.PII_ENCRYPTION_KEY;
    await expect(runFilingAction("filing_1", "requestOwnerSsn", {}, { adminId: "admin_1" })).rejects.toMatchObject({
      status: 503,
      code: "not_configured",
    });
    expect(sent).toHaveLength(0);
  });
});

describe("setOwnerSsn (admin entry, S6)", () => {
  it("stores the number encrypted with a masked change log and attributes it to the admin", async () => {
    seed({ status: "DRAFT" });
    await expect(
      runFilingAction("filing_1", "setOwnerSsn", { ssn: "123-45-6789", confirm: "123456789" }, { adminId: "admin_1", approver: "admin_1" }),
    ).rejects.toMatchObject({ status: 409, code: "not_paid" });

    seed({ status: "SIGNATURE_PENDING" });
    const result = await runFilingAction(
      "filing_1",
      "setOwnerSsn",
      { ssn: "123-45-6789", confirm: "123456789" },
      { adminId: null, approver: "Form5472 Prep team (shared admin login)" },
    );
    expect(result).toMatchObject({ ok: true, last4: "6789", replaced: false });
    expect(JSON.stringify(result)).not.toContain(DIGITS);
    expect(decryptPii(String(state.row!.ownerSsnCiphertext))).toBe(DIGITS);
    expect(state.row!.ownerSsnSubmittedBy).toBe("Form5472 Prep team (shared admin login)");
    const log = state.logs.find((l) => l.field === "ownerSsn")!;
    expect(log).toMatchObject({ source: "admin", afterJson: { ssn: "•••-••-6789", submittedBy: "admin" } });
    expect(JSON.stringify(state.logs)).not.toContain(DIGITS);
  });

  it("rejects a mismatched confirm", async () => {
    seed();
    await expect(
      runFilingAction("filing_1", "setOwnerSsn", { ssn: "123-45-6789", confirm: "123-45-6780" }, { adminId: "admin_1" }),
    ).rejects.toMatchObject({ status: 400, code: "ssn_mismatch" });
    expect(state.row!.ownerSsnCiphertext).toBeNull();
  });
});

describe("ownerSsnNewerThanPackage", () => {
  const d = (iso: string) => new Date(iso);
  it("is true only when the SSN came after the reviewed (or, without review, signed) package", () => {
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: null, reviewApprovedAt: d("2026-10-10"), signedAt: null })).toBe(false);
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: d("2026-10-12"), reviewApprovedAt: null, signedAt: null })).toBe(false);
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: d("2026-10-12"), reviewApprovedAt: d("2026-10-10"), signedAt: d("2026-10-13") })).toBe(true);
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: d("2026-10-09"), reviewApprovedAt: d("2026-10-10"), signedAt: null })).toBe(false);
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: d("2026-10-12"), reviewApprovedAt: null, signedAt: d("2026-10-11") })).toBe(true);
  });

  it("counts a later signed-PDF upload by staff (uploadSignedPdf), not a portal/placed signature", () => {
    const f = { ownerSsnSubmittedAt: d("2026-10-12"), reviewApprovedAt: d("2026-10-10"), signedAt: d("2026-10-13") };
    expect(ownerSsnNewerThanPackage(f)).toBe(true);
    expect(ownerSsnNewerThanPackage(f, d("2026-10-14"))).toBe(false);
    expect(ownerSsnNewerThanPackage(f, d("2026-10-11"))).toBe(true);
    // An upload with no review stamp at all.
    expect(ownerSsnNewerThanPackage({ ownerSsnSubmittedAt: d("2026-10-12"), reviewApprovedAt: null, signedAt: null }, d("2026-10-14"))).toBe(false);
  });

  it("finds the latest signed-PDF upload in the change log (ignores reviewed uploads and regenerates)", async () => {
    prismaMock.filingChangeLog.findMany.mockResolvedValueOnce([
      { changedAt: d("2026-10-15"), afterJson: { draftOnly: true } },
      { changedAt: d("2026-10-14"), afterJson: { generatedPdfKey: "r.pdf", status: "PDF_GENERATED" } },
      { changedAt: d("2026-10-13"), afterJson: { signedPdfKey: "s.pdf", status: "SIGNED_UPLOADED", bytes: 99 } },
    ]);
    expect(await latestSignedPdfUploadAt("filing_1")).toEqual(d("2026-10-13"));
    prismaMock.filingChangeLog.findMany.mockRejectedValueOnce(new Error("db down"));
    expect(await latestSignedPdfUploadAt("filing_1")).toBeNull();
  });
});

describe("setOwnerSsn with the number already on file", () => {
  it("is a no-op: keeps the timestamp, writes nothing, logs nothing, re-runs nothing", async () => {
    const firstAt = new Date("2026-10-01T00:00:00Z");
    seed({ ownerSsnCiphertext: encryptPii(DIGITS), ownerSsnLast4: "6789", ownerSsnSubmittedAt: firstAt });
    prismaMock.filing.updateMany.mockClear();
    const result = await runFilingAction(
      "filing_1",
      "setOwnerSsn",
      { ssn: "123 45 6789", confirm: "123-45-6789" },
      { adminId: "admin_1", approver: "admin_1" },
    );
    expect(result).toMatchObject({ ok: true, last4: "6789", unchanged: true, replaced: false, preflightRerun: null });
    expect(result.submittedAt).toBe(firstAt.toISOString());
    expect(prismaMock.filing.updateMany).not.toHaveBeenCalled();
    expect(state.logs).toHaveLength(0);
  });
});
