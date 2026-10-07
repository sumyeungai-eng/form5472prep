import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ getAdminPrincipal: vi.fn() }));
vi.mock("@/lib/admin/auth", () => auth);
const email = vi.hoisted(() => ({ sendWebsiteQuestionReplyEmail: vi.fn() }));
vi.mock("@/lib/email", () => email);
const db = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn((args: unknown) => ({ op: "update", args })),
  createReply: vi.fn((args: unknown) => ({ op: "create", args })),
  transaction: vi.fn(async (ops: unknown[]) => ops),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    websiteQuestion: { findUnique: db.findUnique, update: db.update },
    websiteQuestionReply: { create: db.createReply },
    $transaction: db.transaction,
  },
}));

import { PATCH, POST } from "./route";

const params = { params: { id: "q_1" } };
const question = {
  id: "q_1",
  email: "visitor@example.test",
  name: "Ana Lopez",
  message: "Do I need to file?",
  createdAt: new Date("2026-10-01T10:00:00Z"),
  readAt: null,
};

function req(method: string, body: unknown) {
  return new Request("https://example.test/api/admin/questions/q_1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/admin/questions/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getAdminPrincipal.mockResolvedValue({ adminId: "a1", email: "admin@example.test", via: "session" });
    db.findUnique.mockResolvedValue(question);
    email.sendWebsiteQuestionReplyEmail.mockResolvedValue({ id: "re_1" });
  });

  it("rejects non-admins", async () => {
    auth.getAdminPrincipal.mockResolvedValue(null);
    expect((await POST(req("POST", { reply: "Hi" }), params)).status).toBe(401);
    expect((await PATCH(req("PATCH", { action: "archive" }), params)).status).toBe(401);
    expect(email.sendWebsiteQuestionReplyEmail).not.toHaveBeenCalled();
  });

  it("emails the reply, then records it and marks the question answered", async () => {
    const res = await POST(req("POST", { reply: "  Yes, you do.  " }), params);
    expect(res.status).toBe(200);
    expect(email.sendWebsiteQuestionReplyEmail).toHaveBeenCalledWith({
      to: "visitor@example.test",
      name: "Ana Lopez",
      reply: "Yes, you do.",
      originalMessage: "Do I need to file?",
      askedAt: question.createdAt,
    });
    expect(db.createReply).toHaveBeenCalledWith({
      data: { questionId: "q_1", body: "Yes, you do.", sentBy: "admin@example.test" },
    });
    const updateData = (db.update.mock.calls[0][0] as { data: { repliedAt: Date; readAt: Date } }).data;
    expect(updateData.repliedAt).toBeInstanceOf(Date);
    expect(updateData.readAt).toBeInstanceOf(Date);
  });

  it("saves nothing when the email fails", async () => {
    email.sendWebsiteQuestionReplyEmail.mockRejectedValue(new Error("resend down"));
    const res = await POST(req("POST", { reply: "Yes" }), params);
    expect(res.status).toBe(502);
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it("refuses an empty reply and unknown questions", async () => {
    expect((await POST(req("POST", { reply: "   " }), params)).status).toBe(400);
    db.findUnique.mockResolvedValue(null);
    expect((await POST(req("POST", { reply: "Hi" }), params)).status).toBe(404);
    expect(email.sendWebsiteQuestionReplyEmail).not.toHaveBeenCalled();
  });

  it.each([
    ["answered", "repliedAt"],
    ["archive", "archivedAt"],
    ["read", "readAt"],
  ])("PATCH %s sets %s", async (action, field) => {
    const res = await PATCH(req("PATCH", { action }), params);
    expect(res.status).toBe(200);
    const data = (db.update.mock.calls[0][0] as { data: Record<string, unknown> }).data;
    expect(data[field]).toBeInstanceOf(Date);
  });

  it.each([
    ["unanswered", "repliedAt"],
    ["unarchive", "archivedAt"],
    ["unread", "readAt"],
  ])("PATCH %s clears %s", async (action, field) => {
    await PATCH(req("PATCH", { action }), params);
    expect((db.update.mock.calls[0][0] as { data: Record<string, unknown> }).data).toEqual({ [field]: null });
  });

  it("rejects unknown PATCH actions", async () => {
    expect((await PATCH(req("PATCH", { action: "delete" }), params)).status).toBe(400);
    expect((await PATCH(req("PATCH", { action: "toString" }), params)).status).toBe(400);
    expect(db.update).not.toHaveBeenCalled();
  });
});
