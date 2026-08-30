import { sendNewMessageToCustomerEmail } from "@/lib/email";
import { makeMagicLink } from "@/lib/magicLink";
import { prisma } from "@/lib/prisma";

export class FilingNotFoundError extends Error {
  constructor() {
    super("Filing not found");
    this.name = "FilingNotFoundError";
  }
}

type MessageAttachment = {
  key: string;
  name: string;
  type: string;
};

export async function postAdminMessage(filingId: string, body: string, attachment?: MessageAttachment) {
  const filing = await prisma.filing.findUnique({
    where: { id: filingId },
    select: {
      llcName: true,
      ownerName: true,
      taxYears: true,
      userId: true,
      user: { select: { email: true } },
    },
  });
  if (!filing) {
    throw new FilingNotFoundError();
  }

  // "First unread" rule: if the recipient currently has zero unread messages
  // from us in this thread, the message we're about to insert will be their
  // first unread one — so fire the email. Counting BEFORE insert avoids
  // racing ourselves. A small concurrent-send race could double-email; that's
  // acceptable for v1 vs. the complexity of a row lock.
  const priorUnreadFromSender = await prisma.message.count({
    where: { filingId, fromAdmin: true, readAt: null },
  });

  const message = await prisma.message.create({
    data: {
      filingId,
      fromAdmin: true,
      body,
      attachmentKey: attachment?.key,
      attachmentName: attachment?.name,
      attachmentType: attachment?.type,
    },
    select: {
      id: true,
      fromAdmin: true,
      body: true,
      attachmentKey: true,
      attachmentName: true,
      attachmentType: true,
      readAt: true,
      createdAt: true,
    },
  });

  if (priorUnreadFromSender === 0 && filing.user?.email && filing.userId) {
    const bodyExcerpt = body.length > 500 ? body.slice(0, 500) + "…" : body;
    try {
      await sendNewMessageToCustomerEmail({
        email: filing.user.email,
        recipientName: filing.ownerName,
        llcName: filing.llcName,
        taxYears: filing.taxYears,
        bodyExcerpt,
        portalLink: makeMagicLink(filing.userId),
      });
    } catch (err) {
      // Don't fail the POST if email delivery fails — the message itself
      // is persisted and will show up in-portal. Log so we can investigate.
      console.error("[messages POST] notification email failed", err);
    }
  }

  return { message };
}
