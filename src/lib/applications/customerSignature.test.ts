import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clientIp, handleSign, parseSignBody } from "./customerSignature";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  einFindFirst: vi.fn(),
  itinFindFirst: vi.fn(),
  einUpdateMany: vi.fn(),
  itinUpdateMany: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  email: vi.fn(),
  telegram: vi.fn(),
}));
vi.mock("@/lib/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/prisma", () => ({ prisma: {
  einApplication: { findFirst: mocks.einFindFirst, updateMany: mocks.einUpdateMany },
  itinApplication: { findFirst: mocks.itinFindFirst, updateMany: mocks.itinUpdateMany },
} }));
vi.mock("@/lib/storage", () => ({ put: mocks.put, del: mocks.del, get: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendApplicationSignedAdminEmail: mocks.email }));
vi.mock("@/lib/telegram", () => ({ sendAdminTelegram: mocks.telegram }));
vi.mock("@/lib/env", () => ({ env: { appUrl: "https://example.test" } }));

const SHA = "a".repeat(64);
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function pngDataUrl(size = 200) {
  const bytes = new Uint8Array(size);
  PNG_MAGIC.forEach((byte, index) => {
    bytes[index] = byte;
  });
  return `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`;
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    signaturePngDataUrl: pngDataUrl(),
    signerName: "  Alex   Chen ",
    consent: true,
    docSha256: SHA,
    ...overrides,
  };
}

describe("parseSignBody", () => {
  it("rejects missing consent", () => {
    const result = parseSignBody(validBody({ consent: undefined }));
    expect(result.ok).toBe(false);
  });

  it("rejects consent as a string", () => {
    const result = parseSignBody(validBody({ consent: "true" }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad PNG data URL prefix", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: "data:image/jpeg;base64,abcd" }));
    expect(result.ok).toBe(false);
  });

  it("rejects non-PNG bytes", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: `data:image/png;base64,${Buffer.from("not png".repeat(40)).toString("base64")}` }));
    expect(result.ok).toBe(false);
  });

  it("rejects a PNG that is too small", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: pngDataUrl(199) }));
    expect(result.ok).toBe(false);
  });

  it("rejects a PNG that is too large", () => {
    const result = parseSignBody(validBody({ signaturePngDataUrl: pngDataUrl(2 * 1024 * 1024 + 1) }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad signer name", () => {
    const result = parseSignBody(validBody({ signerName: "   " }));
    expect(result.ok).toBe(false);
  });

  it("rejects a bad document SHA", () => {
    const result = parseSignBody(validBody({ docSha256: "A".repeat(64) }));
    expect(result.ok).toBe(false);
  });

  it("accepts a valid signature payload", () => {
    const result = parseSignBody(validBody());
    expect(result).toMatchObject({ ok: true, signerName: "Alex Chen", docSha256: SHA });
    expect(result.ok && result.pngBytes?.byteLength).toBe(200);
  });

  it("accepts an intake signature reuse payload", () => {
    const result = parseSignBody({
      useIntakeSignature: true,
      signerName: "  Alex   Chen ",
      consent: true,
      docSha256: SHA,
    });

    expect(result).toEqual({ ok: true, pngBytes: null, signerName: "Alex Chen", docSha256: SHA });
  });

  it("rejects an intake signature reuse payload without consent", () => {
    expect(parseSignBody(validBody({ useIntakeSignature: true, consent: undefined }))).toEqual({
      ok: false,
      error: "Please confirm your consent before signing.",
    });
  });

  it("rejects an intake signature reuse payload without a valid signer name", () => {
    expect(parseSignBody(validBody({ useIntakeSignature: true, signerName: "   " }))).toEqual({
      ok: false,
      error: "Enter your full legal name.",
    });
  });

  it("rejects an intake signature reuse payload without a valid document SHA", () => {
    expect(parseSignBody(validBody({ useIntakeSignature: true, docSha256: "A".repeat(64) }))).toEqual({
      ok: false,
      error: "Invalid document version.",
    });
  });

  it("still requires a PNG when intake signature reuse is absent", () => {
    expect(parseSignBody(validBody({ signaturePngDataUrl: undefined }))).toEqual({
      ok: false,
      error: "Malformed signature image.",
    });
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": " 203.0.113.10, 198.51.100.7 " });
    expect(clientIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": " 203.0.113.11 " });
    expect(clientIp(headers)).toBe("203.0.113.11");
  });

  it("returns null without IP headers", () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});

describe("handleSign admin notifications", () => {
  const app = {
    id: "application_1",
    fullName: "Alex Chen",
    email: "private@example.test",
    responsiblePartyTin: "123-45-6789",
    paidAt: new Date("2026-10-01T10:00:00Z"),
    preparedPdfKey: "prepared.pdf",
    preparedPdfSha256: SHA,
    intakeSignaturePngKey: null,
    intakeSignerName: null,
    signaturePngKey: null,
    signedAt: null,
    signerName: null,
    signedPdfKey: null,
  };

  function signRequest() {
    return new Request("https://example.test/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9", "user-agent": "Private UA" },
      body: JSON.stringify(validBody()),
    });
  }

  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.getCurrentUser.mockResolvedValue({ id: "user_1" });
    mocks.einFindFirst.mockResolvedValue({ ...app, llcName: "Example Holdings LLC" });
    mocks.itinFindFirst.mockResolvedValue(app);
    mocks.einUpdateMany.mockResolvedValue({ count: 1 });
    mocks.itinUpdateMany.mockResolvedValue({ count: 1 });
    mocks.put.mockResolvedValue(undefined);
    mocks.del.mockResolvedValue(undefined);
    mocks.email.mockResolvedValue(undefined);
    mocks.telegram.mockResolvedValue(true);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each(["ein", "itin"] as const)("alerts on %s signing without personal data", async (type) => {
    const res = await handleSign(type, app.id, signRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.email).toHaveBeenCalledExactlyOnceWith({
      type,
      applicationId: app.id,
      fullName: app.fullName,
      adminLink: `https://example.test/admin/applications/${type}/${app.id}`,
    });
    expect(mocks.telegram).toHaveBeenCalledExactlyOnceWith([
      `✍️ ${type.toUpperCase()} application signed`,
      ...(type === "ein" ? ["LLC name: Example Holdings LLC"] : []),
      `https://example.test/admin/applications/${type}/${app.id}`,
    ]);
    const telegram = JSON.stringify(mocks.telegram.mock.calls);
    for (const privateValue of [app.fullName, app.email, app.responsiblePartyTin, "203.0.113.9", "Private UA", "data:image", SHA]) {
      expect(telegram).not.toContain(privateValue);
    }
    const find = type === "ein" ? mocks.einFindFirst : mocks.itinFindFirst;
    if (type === "ein") expect(find.mock.calls[0][0].select.llcName).toBe(true);
    else expect(find.mock.calls[0][0].select).not.toHaveProperty("llcName");
  });

  it.each(["ein", "itin"] as const)("uses pre-write signaturePngKey for %s re-sign alerts", async (type) => {
    const find = type === "ein" ? mocks.einFindFirst : mocks.itinFindFirst;
    find.mockResolvedValue({ ...app, ...(type === "ein" ? { llcName: "Example Holdings LLC" } : {}), signaturePngKey: "earlier.png" });

    const res = await handleSign(type, app.id, signRequest());

    expect(res.status).toBe(200);
    expect(mocks.telegram).toHaveBeenCalledExactlyOnceWith([
      `✍️ ${type.toUpperCase()} application re-signed`,
      ...(type === "ein" ? ["LLC name: Example Holdings LLC"] : []),
      `https://example.test/admin/applications/${type}/${app.id}`,
    ]);
  });

  it("omits the entity line when EIN has no business name", async () => {
    mocks.einFindFirst.mockResolvedValue({ ...app, llcName: "" });
    const res = await handleSign("ein", app.id, signRequest());
    expect(res.status).toBe(200);
    expect(mocks.telegram).toHaveBeenCalledExactlyOnceWith([
      "✍️ EIN application signed",
      "https://example.test/admin/applications/ein/application_1",
    ]);
  });

  it.each(["ein", "itin"] as const)("keeps %s signing successful when Telegram throws", async (type) => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.telegram.mockRejectedValue(new Error("private@example.test 123-45-6789"));

    const res = await handleSign(type, app.id, signRequest());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.email).toHaveBeenCalledExactlyOnceWith({
      type,
      applicationId: app.id,
      fullName: app.fullName,
      adminLink: `https://example.test/admin/applications/${type}/${app.id}`,
    });
    expect(errorLog).toHaveBeenCalledExactlyOnceWith("[application sign] admin Telegram failed");
  });

  it("still sends Telegram when the existing email call throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.email.mockRejectedValue(new Error("Email failed"));
    const res = await handleSign("ein", app.id, signRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.telegram).toHaveBeenCalledTimes(1);
  });

  it.each(["ein", "itin"] as const)("sends no notifications when the %s conditional write loses", async (type) => {
    const update = type === "ein" ? mocks.einUpdateMany : mocks.itinUpdateMany;
    update.mockResolvedValue({ count: 0 });
    const res = await handleSign(type, app.id, signRequest());
    expect(res.status).toBe(409);
    expect(mocks.email).not.toHaveBeenCalled();
    expect(mocks.telegram).not.toHaveBeenCalled();
  });
});
