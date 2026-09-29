import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// sendEmail() writes an EmailLog row after every Resend call. Prisma is
// mocked (lib/email imports it lazily, which vi.mock still intercepts) and
// fetch is stubbed — nothing here talks to Resend or a database.
const db = vi.hoisted(() => ({
  create: vi.fn(async (_args: unknown) => ({ id: "log_1" })),
}));
vi.mock("@/lib/prisma", () => ({ prisma: { emailLog: { create: db.create } } }));

import { sendEmail, sendFaxDeliveredEmail } from "@/lib/email";

const BASE = { to: "owner@example.test", subject: "Hello", html: "<p>x</p>", text: "x" };

type FetchInit = { body?: string; headers?: Record<string, string> };

describe("sendEmail → EmailLog", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    delete process.env.EMAIL_PREVIEW_DIR;
    process.env.RESEND_API_KEY = "re_test_key";
    db.create.mockReset();
    db.create.mockResolvedValue({ id: "log_1" });
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "resend-abc" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("records a 'sent' row with Resend's id and returns Resend's response unchanged", async () => {
    const result = await sendEmail({ ...BASE, log: { kind: "fax_delivered", filingId: "filing_1" } });

    expect(result).toEqual({ id: "resend-abc" });
    expect(db.create).toHaveBeenCalledTimes(1);
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        kind: "fax_delivered",
        filingId: "filing_1",
        to: "owner@example.test",
        subject: "Hello",
        status: "sent",
        resendId: "resend-abc",
        error: null,
      },
    }));
  });

  it("defaults kind to 'other' with no filing when the caller passes no tag", async () => {
    await sendEmail(BASE);
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ kind: "other", filingId: null, status: "sent" }),
    }));
  });

  it("records a 'failed' row with the Resend error and still throws the original error", async () => {
    fetchMock.mockResolvedValueOnce(new Response("domain not verified", { status: 403 }));

    await expect(sendEmail({ ...BASE, log: { kind: "ready_to_sign", filingId: "filing_2" } })).rejects.toThrow(
      "Resend send failed: 403 domain not verified",
    );
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        kind: "ready_to_sign",
        filingId: "filing_2",
        status: "failed",
        resendId: null,
        error: "Resend send failed: 403 domain not verified",
      }),
    }));
  });

  it("records a network failure and rethrows the same error object", async () => {
    const boom = new Error("socket hang up");
    fetchMock.mockRejectedValueOnce(boom);

    await expect(sendEmail({ ...BASE, log: { kind: "magic_link" } })).rejects.toBe(boom);
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ kind: "magic_link", status: "failed", error: "socket hang up" }),
    }));
  });

  it("keeps the audit row (unlinked) when the filingId is not a real filing", async () => {
    db.create.mockRejectedValueOnce(Object.assign(new Error("FK violation"), { code: "P2003" }));

    await sendEmail({ ...BASE, log: { kind: "order_confirmation", filingId: "sample" } });

    expect(db.create).toHaveBeenCalledTimes(2);
    expect(db.create).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ kind: "order_confirmation", filingId: null, status: "sent" }),
    }));
  });

  it("never lets a logging failure fail the send", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    db.create.mockRejectedValueOnce(new Error("relation \"EmailLog\" does not exist"));

    await expect(sendEmail({ ...BASE, log: { kind: "fax_delivered" } })).resolves.toEqual({ id: "resend-abc" });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("EmailLog write failed"),
      expect.any(Error),
    );
  });

  it("never lets a logging failure mask the send failure", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    db.create.mockRejectedValueOnce(new Error("db down"));
    fetchMock.mockResolvedValueOnce(new Response("rate limited", { status: 429 }));

    await expect(sendEmail(BASE)).rejects.toThrow("Resend send failed: 429 rate limited");
  });

  it("does not log in preview mode (no Resend call happens)", async () => {
    process.env.EMAIL_PREVIEW_DIR = (await import("node:os")).tmpdir() + "/emaillog-preview-" + Date.now();
    vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await sendEmail({ ...BASE, log: { kind: "other" } });
    } finally {
      const dir = process.env.EMAIL_PREVIEW_DIR;
      delete process.env.EMAIL_PREVIEW_DIR;
      await (await import("node:fs/promises")).rm(dir!, { recursive: true, force: true });
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe("sendFaxDeliveredEmail receipt attachment", () => {
  const receipt = new Uint8Array([37, 80, 68, 70, 45, 49]);
  const args = {
    email: "owner@example.test",
    llcName: "Acme LLC",
    taxYears: [2025],
    portalLink: "https://example.test/portal",
    proof: { faxId: "fax-1", deliveredAt: "2026-09-20T10:03:00.000Z", pageCount: 7 },
    receiptPdfBytes: receipt,
    filingId: "filing_1",
  };

  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    delete process.env.EMAIL_PREVIEW_DIR;
    process.env.RESEND_API_KEY = "re_test_key";
    db.create.mockReset();
    db.create.mockResolvedValue({ id: "log_1" });
    fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: "resend-xyz" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    vi.unstubAllGlobals();
  });

  function sentBody() {
    const init = fetchMock.mock.calls[0][1] as FetchInit;
    return JSON.parse(init.body!) as { attachments?: Array<{ filename: string; content: string }>; html: string; text: string };
  }

  it("keeps the automatic email attachment-free (portal copy) and tags it fax_delivered", async () => {
    await sendFaxDeliveredEmail(args);
    const body = sentBody();
    expect(body.attachments).toBeUndefined();
    expect(body.text).toContain("is saved in your portal");
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ kind: "fax_delivered", filingId: "filing_1", resendId: "resend-xyz" }),
    }));
  });

  it("attaches the receipt PDF and says so when attachReceipt is set (admin resend)", async () => {
    await sendFaxDeliveredEmail({ ...args, attachReceipt: true, logKind: "fax_delivered_resend" });
    const body = sentBody();
    expect(body.attachments).toEqual([
      { filename: "IRS-fax-receipt-Acme_LLC-2025.pdf", content: Buffer.from(receipt).toString("base64"), content_type: "application/pdf" },
    ]);
    expect(body.text).toContain("is attached to this email");
    expect(body.html).toContain("is attached to this email");
    expect(db.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ kind: "fax_delivered_resend", filingId: "filing_1" }),
    }));
  });
});
