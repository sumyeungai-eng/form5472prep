import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), createReply: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    websiteQuestion: { findUnique: db.findUnique, update: db.update, create: db.create },
    websiteQuestionReply: { create: db.createReply },
  },
}));

import { prismaQuestionStore } from "./store";

const t = (h: number) => new Date(Date.UTC(2026, 9, 1, h));

function question(replies: Array<[number, boolean]>, repliedAt: Date | null = null) {
  return { createdAt: t(1), repliedAt, readAt: null, replies: replies.map(([h, fromVisitor]) => ({ createdAt: t(h), fromVisitor })) };
}

describe("prismaQuestionStore.refreshStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("marks answered at our latest reply when it is newer than the visitor's latest message", async () => {
    db.findUnique.mockResolvedValue(question([[2, false], [3, true], [4, false]]));
    await prismaQuestionStore.refreshStatus("q", true);
    expect(db.update).toHaveBeenCalledWith({ where: { id: "q" }, data: { repliedAt: t(4), readAt: t(4) } });
  });

  it("reopens (and marks unread) when the visitor wrote last", async () => {
    db.findUnique.mockResolvedValue(question([[2, false], [3, true]], t(2)));
    await prismaQuestionStore.refreshStatus("q", true);
    expect(db.update).toHaveBeenCalledWith({ where: { id: "q" }, data: { repliedAt: null, readAt: null } });
  });

  it("leaves a manual 'answered' mark alone when no new visitor message arrived", async () => {
    db.findUnique.mockResolvedValue(question([[0, false]], t(5)));
    await prismaQuestionStore.refreshStatus("q", false);
    expect(db.update).not.toHaveBeenCalled();
  });
});

describe("prismaQuestionStore writes only schema fields", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createQuestion drops extra keys such as the parser's questionId", async () => {
    db.create.mockResolvedValue({ id: "q" });
    const args = {
      name: "Ana", email: "ana@example.test", topic: null, pageUrl: null, message: "Hi",
      createdAt: t(1), sourceMessageId: "<m@x>", questionId: null,
    };
    await prismaQuestionStore.createQuestion(args as Parameters<typeof prismaQuestionStore.createQuestion>[0]);
    expect(Object.keys(db.create.mock.calls[0][0].data).sort()).toEqual(
      ["createdAt", "email", "message", "name", "pageUrl", "readAt", "sourceMessageId", "topic"],
    );
  });

  it("createReply records the email source", async () => {
    await prismaQuestionStore.createReply({
      questionId: "q", body: "b", sentBy: "s", fromVisitor: false, createdAt: t(1), sourceMessageId: "<r@x>",
    });
    expect(db.createReply.mock.calls[0][0].data).toEqual({
      questionId: "q", body: "b", sentBy: "s", fromVisitor: false, createdAt: t(1), sourceMessageId: "<r@x>", source: "email",
    });
  });
});
