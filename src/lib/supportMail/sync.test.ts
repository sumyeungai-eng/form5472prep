import { describe, expect, it } from "vitest";
import { syncSupportMailbox, type MailEnvelope, type MailboxReader, type QuestionStore } from "./sync";

type Q = { id: string; email: string; message: string; createdAt: Date; sourceMessageId: string | null; name: string | null };
type R = { questionId: string; body: string; fromVisitor: boolean; createdAt: Date; sourceMessageId: string; sentBy: string };

function memoryStore(initial: Q[] = []) {
  const questions = [...initial];
  const replies: R[] = [];
  const refreshed: Array<[string, boolean]> = [];
  const archived: string[] = [];
  let n = 0;
  const store: QuestionStore = {
    async questionIdBySource(mid) { return questions.find((q) => q.sourceMessageId === mid)?.id ?? null; },
    async unsourcedQuestion(id) { return questions.find((q) => q.id === id && !q.sourceMessageId)?.id ?? null; },
    async findUnsourcedMatch({ email, message, from, to }) {
      return questions.find((q) => !q.sourceMessageId && q.email.toLowerCase() === email.toLowerCase() && q.message === message && q.createdAt >= from && q.createdAt <= to)?.id ?? null;
    },
    async setQuestionSource(id, mid) { questions.find((q) => q.id === id)!.sourceMessageId = mid; },
    async createQuestion(a) {
      const id = `imp_${++n}`;
      questions.push({ id, email: a.email, message: a.message, createdAt: a.createdAt, sourceMessageId: a.sourceMessageId, name: a.name });
      return id;
    },
    async questionsForEmails(emails) {
      return questions.filter((q) => emails.includes(q.email.toLowerCase())).map(({ id, email, createdAt }) => ({ id, email, createdAt }));
    },
    async replyExists(mid) { return replies.some((r) => r.sourceMessageId === mid); },
    async createReply(a) { replies.push(a); },
    async refreshStatus(id, v) { refreshed.push([id, v]); },
    async archiveIfUnanswered(ids, before) {
      const stale = ids.filter((id) => {
        const q = questions.find((x) => x.id === id)!;
        return q.createdAt < before && !replies.some((r) => r.questionId === id && !r.fromVisitor);
      });
      archived.push(...stale);
      return stale.length;
    },
  };
  return { store, questions, replies, refreshed, archived };
}

function reader(mails: Array<MailEnvelope & { text: string }>): MailboxReader & { fetched: string[] } {
  const fetched: string[] = [];
  return {
    fetched,
    async scan(since) { return mails.filter((m) => m.date >= since); },
    async fetchText(e) { fetched.push(e.messageId); return mails.find((m) => m.messageId === e.messageId)!.text; },
  };
}

let uid = 0;
function mail(p: Partial<MailEnvelope> & { text: string; date: Date; messageId: string }): MailEnvelope & { text: string } {
  return { folder: p.isSent ? "INBOX.Sent" : "INBOX", uid: ++uid, isSent: false, from: "", to: [], replyTo: [], subject: "", ...p };
}

const notification = (id: string, date: Date, email: string, message: string, link = "") =>
  mail({
    messageId: id,
    date,
    from: "donotreply@form5472prep.com",
    to: ["support@form5472prep.com"],
    replyTo: [email],
    subject: `[Website question] ${message.slice(0, 20)}`,
    text: `New question from the website\n\nName: Ana\nEmail: ${email}\n\nMessage:\n${message}\n\nReply directly to this email to answer the visitor.${link ? `\nOr answer it in admin: https://x.test/admin/questions/${link}` : ""}`,
  });

const d = (s: string) => new Date(`${s}Z`);
const opts = { ownAddresses: ["support@form5472prep.com"], since: d("2026-06-01T00:00:00"), now: d("2026-10-07T12:00:00") };

describe("syncSupportMailbox", () => {
  it("imports a past question with the answer sent from support@ and is idempotent", async () => {
    const mem = memoryStore();
    const box = reader([
      notification("<q1@x>", d("2026-09-01T10:00:00"), "ana@example.test", "Do I need to file?"),
      mail({ messageId: "<a1@x>", isSent: true, date: d("2026-09-01T12:00:00"), from: "support@form5472prep.com", to: ["Ana@Example.test"], text: "Yes you do.\n\nOn 2026-09-01 10:00, Ana wrote:\n> Do I need to file?" }),
    ]);
    const first = await syncSupportMailbox({ reader: box, store: mem.store, ...opts });
    expect(first).toMatchObject({ questionsImported: 1, answersImported: 1, followUpsImported: 0, oldUnansweredArchived: 0 });
    expect(mem.questions[0]).toMatchObject({ email: "ana@example.test", message: "Do I need to file?", createdAt: d("2026-09-01T10:00:00") });
    expect(mem.replies).toEqual([
      expect.objectContaining({ questionId: "imp_1", body: "Yes you do.", fromVisitor: false, sentBy: "support@form5472prep.com" }),
    ]);
    expect(mem.refreshed).toEqual([["imp_1", false]]);

    const second = await syncSupportMailbox({ reader: box, store: mem.store, ...opts });
    expect(second).toMatchObject({ questionsImported: 0, questionsMatched: 0, answersImported: 0 });
    expect(mem.questions).toHaveLength(1);
    expect(mem.replies).toHaveLength(1);
  });

  it("matches questions already stored by the website: by admin link, else by email + message + time", async () => {
    const mem = memoryStore([
      { id: "cmlinked0000001", email: "ana@example.test", message: "Linked?", createdAt: d("2026-10-07T09:00:00"), sourceMessageId: null, name: "Ana" },
      { id: "cmcontent000001", email: "li@example.test", message: "Content?", createdAt: d("2026-10-07T09:00:00"), sourceMessageId: null, name: null },
    ]);
    const res = await syncSupportMailbox({
      reader: reader([
        notification("<n1@x>", d("2026-10-07T09:00:05"), "ana@example.test", "Linked?", "cmlinked0000001"),
        notification("<n2@x>", d("2026-10-07T09:00:07"), "LI@example.test", "Content?"),
      ]),
      store: mem.store,
      ...opts,
    });
    expect(res).toMatchObject({ questionsImported: 0, questionsMatched: 2 });
    expect(mem.questions.map((q) => q.sourceMessageId)).toEqual(["<n1@x>", "<n2@x>"]);
  });

  it("links a customer follow-up and reopens the question", async () => {
    const mem = memoryStore([
      { id: "q1", email: "ana@example.test", message: "Q", createdAt: d("2026-10-01T09:00:00"), sourceMessageId: "<n@x>", name: null },
    ]);
    const res = await syncSupportMailbox({
      reader: reader([
        mail({ messageId: "<a@x>", isSent: true, date: d("2026-10-01T10:00:00"), from: "support@form5472prep.com", to: ["ana@example.test"], text: "Answer" }),
        mail({ messageId: "<f@x>", date: d("2026-10-02T10:00:00"), from: "ana@example.test", to: ["support@form5472prep.com"], text: "Thanks, one more thing?\n\nOn Wed, Oct 1 Form5472 Prep wrote:\n> Answer" }),
      ]),
      store: mem.store,
      ...opts,
    });
    expect(res).toMatchObject({ answersImported: 1, followUpsImported: 1 });
    expect(mem.replies.map((r) => [r.body, r.fromVisitor])).toEqual([["Answer", false], ["Thanks, one more thing?", true]]);
    expect(mem.refreshed).toEqual([["q1", true]]);
  });

  it("files mail under the asker's latest earlier question and ignores unrelated or out-of-window mail", async () => {
    const mem = memoryStore([
      { id: "old", email: "ana@example.test", message: "Old", createdAt: d("2026-06-10T09:00:00"), sourceMessageId: "<o@x>", name: null },
      { id: "new", email: "ana@example.test", message: "New", createdAt: d("2026-10-01T09:00:00"), sourceMessageId: "<n@x>", name: null },
    ]);
    const box = reader([
      mail({ messageId: "<s1@x>", isSent: true, date: d("2026-10-01T11:00:00"), from: "support@form5472prep.com", to: ["ana@example.test"], text: "For new" }),
      mail({ messageId: "<s2@x>", isSent: true, date: d("2026-06-11T11:00:00"), from: "support@form5472prep.com", to: ["ana@example.test"], text: "For old" }),
      mail({ messageId: "<s3@x>", isSent: true, date: d("2026-06-01T11:00:00"), from: "support@form5472prep.com", to: ["ana@example.test"], text: "Before any question" }),
      mail({ messageId: "<s4@x>", isSent: true, date: d("2026-09-20T11:00:00"), from: "support@form5472prep.com", to: ["ana@example.test"], text: "Over 90 days after old" }),
      mail({ messageId: "<s5@x>", isSent: true, date: d("2026-10-02T11:00:00"), from: "support@form5472prep.com", to: ["stranger@example.test"], text: "Unrelated" }),
      mail({ messageId: "<i1@x>", date: d("2026-10-02T11:00:00"), from: "stranger@example.test", to: ["support@form5472prep.com"], text: "Spam" }),
    ]);
    await syncSupportMailbox({ reader: box, store: mem.store, ...opts });
    expect(mem.replies.map((r) => [r.questionId, r.body])).toEqual([["old", "For old"], ["new", "For new"]]);
    expect(box.fetched).not.toContain("<s5@x>");
    expect(box.fetched).not.toContain("<i1@x>");
  });

  it("archives imported questions older than 30 days when no answer is found", async () => {
    const mem = memoryStore();
    const res = await syncSupportMailbox({
      reader: reader([
        notification("<q-old@x>", d("2026-07-01T10:00:00"), "old@example.test", "Old unanswered"),
        notification("<q-recent@x>", d("2026-10-01T10:00:00"), "recent@example.test", "Recent unanswered"),
      ]),
      store: mem.store,
      ...opts,
    });
    expect(res.oldUnansweredArchived).toBe(1);
    expect(mem.archived).toEqual(["imp_1"]);
  });
});
