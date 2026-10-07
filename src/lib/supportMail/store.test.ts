import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { websiteQuestion: { findUnique: db.findUnique, update: db.update } } }));

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
