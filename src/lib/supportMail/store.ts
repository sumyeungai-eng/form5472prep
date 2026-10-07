import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { QuestionStore } from "./sync";

// Prisma implementation of the mailbox-sync store (see sync.ts). Creates are
// race-safe: the cron and the admin button can overlap, and the loser of a
// Message-ID unique race treats the row as already stored.

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}
export const prismaQuestionStore: QuestionStore = {
  async questionIdBySource(messageId) {
    const q = await prisma.websiteQuestion.findUnique({ where: { sourceMessageId: messageId }, select: { id: true } });
    return q?.id ?? null;
  },

  async unsourcedQuestion(id) {
    const q = await prisma.websiteQuestion.findFirst({ where: { id, sourceMessageId: null }, select: { id: true } });
    return q?.id ?? null;
  },

  async findUnsourcedMatch({ email, message, from, to }) {
    const q = await prisma.websiteQuestion.findFirst({
      where: {
        sourceMessageId: null,
        email: { equals: email, mode: "insensitive" },
        message,
        createdAt: { gte: from, lte: to },
      },
      select: { id: true },
    });
    return q?.id ?? null;
  },

  async setQuestionSource(id, messageId) {
    try {
      await prisma.websiteQuestion.update({ where: { id }, data: { sourceMessageId: messageId } });
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
    }
  },

  async createQuestion(args) {
    try {
      // Explicit fields: a stray key (e.g. the parser's questionId) makes
      // Prisma reject the whole create.
      const q = await prisma.websiteQuestion.create({
        data: {
          name: args.name,
          email: args.email,
          topic: args.topic,
          pageUrl: args.pageUrl,
          message: args.message,
          createdAt: args.createdAt,
          sourceMessageId: args.sourceMessageId,
          // Already seen in the mailbox, so not "unread" in admin.
          readAt: args.createdAt,
        },
        select: { id: true },
      });
      return q.id;
    } catch (err) {
      if (!isUniqueViolation(err)) throw err;
      const existing = await prisma.websiteQuestion.findUnique({
        where: { sourceMessageId: args.sourceMessageId },
        select: { id: true },
      });
      if (!existing) throw err;
      return existing.id;
    }
  },

  async questionsForEmails(emails) {
    if (emails.length === 0) return [];
    return prisma.websiteQuestion.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: { id: true, email: true, createdAt: true },
    });
  },

  async questionIdForMessage(messageId) {
    const q = await prisma.websiteQuestion.findUnique({ where: { sourceMessageId: messageId }, select: { id: true } });
    if (q) return q.id;
    const r = await prisma.websiteQuestionReply.findUnique({
      where: { sourceMessageId: messageId },
      select: { questionId: true },
    });
    return r?.questionId ?? null;
  },

  async replyExists(messageId) {
    const r = await prisma.websiteQuestionReply.findUnique({ where: { sourceMessageId: messageId }, select: { id: true } });
    return r !== null;
  },

  async createReply(args) {
    try {
      await prisma.websiteQuestionReply.create({
        data: {
          questionId: args.questionId,
          body: args.body,
          sentBy: args.sentBy,
          fromVisitor: args.fromVisitor,
          createdAt: args.createdAt,
          sourceMessageId: args.sourceMessageId,
          source: "email",
        },
      });
      return true;
    } catch (err) {
      if (isUniqueViolation(err)) return false;
      throw err;
    }
  },

  // Answered = our latest message is newer than the visitor's latest. A new
  // follow-up from the visitor reopens the question (and marks it unread).
  async refreshStatus(questionId, newVisitorMessage) {
    const q = await prisma.websiteQuestion.findUnique({
      where: { id: questionId },
      select: {
        createdAt: true,
        repliedAt: true,
        readAt: true,
        replies: { select: { createdAt: true, fromVisitor: true } },
      },
    });
    if (!q) return;
    const latest = (fromVisitor: boolean) =>
      q.replies
        .filter((r) => r.fromVisitor === fromVisitor)
        .reduce<Date | null>((max, r) => (!max || r.createdAt > max ? r.createdAt : max), null);
    const ours = latest(false);
    const theirs = [q.createdAt, latest(true)].reduce<Date>((max, d) => (d && d > max ? d : max), q.createdAt);

    if (ours && ours >= theirs) {
      if (!q.repliedAt || q.repliedAt < ours) {
        await prisma.websiteQuestion.update({
          where: { id: questionId },
          data: { repliedAt: ours, readAt: q.readAt ?? ours },
        });
      }
    } else if (newVisitorMessage) {
      await prisma.websiteQuestion.update({ where: { id: questionId }, data: { repliedAt: null, readAt: null } });
    }
  },

  async archiveIfUnanswered(questionIds, createdBefore) {
    const { count } = await prisma.websiteQuestion.updateMany({
      where: { id: { in: questionIds }, repliedAt: null, archivedAt: null, createdAt: { lt: createdBefore } },
      data: { archivedAt: new Date() },
    });
    return count;
  },
};
