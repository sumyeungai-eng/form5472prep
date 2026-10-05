import { beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({ getOwnedFiling: vi.fn() }));
const db = vi.hoisted(() => ({ findUnique: vi.fn(), createMessage: vi.fn(), findFirstMessage: vi.fn() }));
const email = vi.hoisted(() => ({ sendNewMessageToAdminEmail: vi.fn() }));

vi.mock("@/lib/session", () => ({ getOwnedFiling: session.getOwnedFiling }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    filing: { findUnique: db.findUnique },
    message: { create: db.createMessage, findFirst: db.findFirstMessage },
  },
}));
vi.mock("@/lib/email", () => ({ sendNewMessageToAdminEmail: email.sendNewMessageToAdminEmail }));
vi.mock("@/lib/env", () => ({
  env: { supportEmail: "support@example.test", appUrl: "https://example.test" },
}));

import { POST } from "./route";

function request(body: unknown) {
  return new Request("https://example.test/api/filings/filing_1/request-change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const filing = {
  id: "filing_1",
  status: "PDF_GENERATED",
  generatedPdfKey: "filing_1_reviewed_1.pdf",
  reviewApprovedAt: new Date("2026-10-05T10:00:00Z"),
  llcName: "Demo LLC",
  taxYears: [2025],
  user: { email: "owner@example.test" },
};

describe("POST /api/filings/[id]/request-change", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.getOwnedFiling.mockResolvedValue({ id: "filing_1" });
    db.findUnique.mockResolvedValue(filing);
    db.createMessage.mockResolvedValue({ id: "msg_1", createdAt: new Date() });
    db.findFirstMessage.mockResolvedValue(null);
    email.sendNewMessageToAdminEmail.mockResolvedValue(undefined);
  });

  it("uses sign-scope access so invite-link clients can ask for changes", async () => {
    await POST(request({ body: "Address should be Suite 200" }), { params: { id: "filing_1" } });
    expect(session.getOwnedFiling).toHaveBeenCalledWith("filing_1", "sign");
  });

  it("saves the note to the thread and always emails support", async () => {
    const res = await POST(request({ body: "Address should be Suite 200" }), { params: { id: "filing_1" } });
    expect(res.status).toBe(200);
    expect(db.createMessage).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        filingId: "filing_1",
        fromAdmin: false,
        body: expect.stringContaining("Address should be Suite 200"),
      }),
    }));
    expect(email.sendNewMessageToAdminEmail).toHaveBeenCalledWith(expect.objectContaining({
      adminEmail: "support@example.test",
      customerEmail: "owner@example.test",
      filingId: "filing_1",
    }));
  });

  it("still succeeds when the notification email fails", async () => {
    email.sendNewMessageToAdminEmail.mockRejectedValueOnce(new Error("down"));
    const res = await POST(request({ body: "Wrong EIN" }), { params: { id: "filing_1" } });
    expect(res.status).toBe(200);
  });

  it("saves but does not re-email support within the throttle window", async () => {
    db.findFirstMessage.mockResolvedValueOnce({ id: "msg_0" });
    const res = await POST(request({ body: "One more thing: wrong zip" }), { params: { id: "filing_1" } });
    expect(res.status).toBe(200);
    expect(db.createMessage).toHaveBeenCalled();
    expect(email.sendNewMessageToAdminEmail).not.toHaveBeenCalled();
  });

  it("only works while the reviewed package is out for signature", async () => {
    db.findUnique.mockResolvedValueOnce({ ...filing, reviewApprovedAt: null });
    expect((await POST(request({ body: "Wrong EIN" }), { params: { id: "filing_1" } })).status).toBe(409);
    db.findUnique.mockResolvedValueOnce({ ...filing, status: "DRAFT" });
    expect((await POST(request({ body: "Wrong EIN" }), { params: { id: "filing_1" } })).status).toBe(409);
    expect(db.createMessage).not.toHaveBeenCalled();
  });

  it("rejects empty notes, unknown filings and already-faxed filings", async () => {
    expect((await POST(request({ body: " " }), { params: { id: "filing_1" } })).status).toBe(400);
    session.getOwnedFiling.mockResolvedValueOnce(null);
    expect((await POST(request({ body: "Wrong EIN" }), { params: { id: "filing_1" } })).status).toBe(404);
    db.findUnique.mockResolvedValueOnce({ ...filing, status: "FAXED" });
    expect((await POST(request({ body: "Wrong EIN" }), { params: { id: "filing_1" } })).status).toBe(409);
    expect(db.createMessage).not.toHaveBeenCalled();
  });
});
