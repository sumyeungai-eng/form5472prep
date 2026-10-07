import { prisma } from "@/lib/prisma";
import type { QuestionStore } from "./sync";

// Prisma implementation of the mailbox-sync store (see sync.ts).
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
    await prisma.websiteQuestion.update({ where: { id }, data: { sourceMessageId: messageId } });
  },

  async createQuestion(args) {
    // Already seen in the mailbox, so not "unread" in admin.
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
        readAt: args.createdAt,
      },
      select: { id: true },
    });
    return q.id;
  },

  async questionsForEmails(emails) {
    if (emails.length === 0) return [];
    return prisma.websiteQuestion.findMany({
      where: { email: { in: emails, mode: "insensitive" } },
      select: { id: true, email: true, createdAt: true },
    });
  },

  async replyExists(messageId) {
    const r = await prisma.websiteQuestionReply.findUnique({ where: { sourceMessageId: messageId }, select: { id: true } });
    return r !== null;
  },

  async createReply(args) {
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
