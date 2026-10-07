import {
  QUESTION_SUBJECT_TAG,
  normalizeEmail,
  parseQuestionNotification,
  stripQuotedReply,
} from "./parse";

// Links the support@ mailbox to /admin/questions:
//  1. "[Website question]" notifications → WebsiteQuestion (imports the ones
//     asked before questions were stored; matches the rest).
//  2. Our answers in the Sent folder, and the visitor's follow-ups in the
//     inbox → WebsiteQuestionReply rows under the asker's latest question.
// Idempotent: every email is keyed by its Message-ID, so overlapping runs
// and re-scans never duplicate. Mailbox and database are injected (see
// imap.ts / store.ts) so the logic is testable without either.

export type MailEnvelope = {
  folder: string;
  uid: number;
  isSent: boolean;
  messageId: string;
  date: Date;
  from: string;
  to: string[];
  replyTo: string[];
  subject: string;
  // Message-ID this email answers, when the client set In-Reply-To.
  inReplyTo: string | null;
};

export interface MailboxReader {
  scan(since: Date): Promise<MailEnvelope[]>;
  fetchText(envelope: MailEnvelope): Promise<string>;
}

export type StoredQuestion = { id: string; email: string; createdAt: Date };

export interface QuestionStore {
  questionIdBySource(messageId: string): Promise<string | null>;
  // Id of the question if it exists and has no sourceMessageId yet.
  unsourcedQuestion(id: string): Promise<string | null>;
  findUnsourcedMatch(args: { email: string; message: string; from: Date; to: Date }): Promise<string | null>;
  setQuestionSource(id: string, messageId: string): Promise<void>;
  createQuestion(args: {
    name: string | null;
    email: string;
    topic: string | null;
    pageUrl: string | null;
    message: string;
    createdAt: Date;
    sourceMessageId: string;
  }): Promise<string>;
  questionsForEmails(emails: string[]): Promise<StoredQuestion[]>;
  // Question a Message-ID belongs to: its notification, or a stored reply.
  questionIdForMessage(messageId: string): Promise<string | null>;
  replyExists(messageId: string): Promise<boolean>;
  createReply(args: {
    questionId: string;
    body: string;
    sentBy: string;
    fromVisitor: boolean;
    createdAt: Date;
    sourceMessageId: string;
  }): Promise<boolean>; // false = already stored (a concurrent run won)
  refreshStatus(questionId: string, newVisitorMessage: boolean): Promise<void>;
  archiveIfUnanswered(questionIds: string[], createdBefore: Date): Promise<number>;
}

export type SyncResult = {
  questionsImported: number;
  questionsMatched: number;
  answersImported: number;
  followUpsImported: number;
  oldUnansweredArchived: number;
};

// A notification and the stored question are the same ask when the email and
// message match and the timestamps are this close.
const MATCH_WINDOW_MS = 30 * 60_000;
// Mail from/to the visitor this long after their question still belongs to it.
const THREAD_WINDOW_MS = 90 * 86_400_000;
// Clock skew between the question row and the mail server.
const SKEW_MS = 5 * 60_000;
// Imported questions older than this with no answer found are archived, so a
// first full import doesn't flood "To answer" with long-handled questions.
const STALE_IMPORT_MS = 30 * 86_400_000;

const MAX_BODY = 20_000;

export async function syncSupportMailbox(opts: {
  reader: MailboxReader;
  store: QuestionStore;
  since: Date;
  ownAddresses: string[];
  now?: Date;
}): Promise<SyncResult> {
  const { reader, store } = opts;
  const now = opts.now ?? new Date();
  const own = new Set(opts.ownAddresses.map(normalizeEmail));
  const isOwn = (a: string) => own.has(normalizeEmail(a)) || /@form5472prep\.com$/i.test(a.trim());
  const result: SyncResult = {
    questionsImported: 0,
    questionsMatched: 0,
    answersImported: 0,
    followUpsImported: 0,
    oldUnansweredArchived: 0,
  };

  const envelopes = (await reader.scan(opts.since))
    .filter((e) => e.messageId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  const isNotification = (e: MailEnvelope) => !e.isSent && e.subject.includes(QUESTION_SUBJECT_TAG);

  // 1. Questions.
  const imported: string[] = [];
  for (const env of envelopes.filter(isNotification)) {
    if (await store.questionIdBySource(env.messageId)) continue;
    const parsed = parseQuestionNotification(await reader.fetchText(env), env.replyTo.find((a) => !isOwn(a)));
    if (!parsed) continue;

    let id = parsed.questionId ? await store.unsourcedQuestion(parsed.questionId) : null;
    id ??= await store.findUnsourcedMatch({
      email: parsed.email,
      message: parsed.message,
      from: new Date(env.date.getTime() - MATCH_WINDOW_MS),
      to: new Date(env.date.getTime() + MATCH_WINDOW_MS),
    });
    if (id) {
      await store.setQuestionSource(id, env.messageId);
      result.questionsMatched += 1;
      continue;
    }
    imported.push(
      await store.createQuestion({
        name: parsed.name,
        email: parsed.email,
        topic: parsed.topic,
        pageUrl: parsed.pageUrl,
        message: parsed.message,
        createdAt: env.date,
        sourceMessageId: env.messageId,
      }),
    );
    result.questionsImported += 1;
  }

  // 2. Answers (Sent) and follow-ups (inbox) for anyone who asked a question.
  const candidates = new Set<string>();
  for (const env of envelopes) {
    if (isNotification(env)) continue;
    if (env.isSent) env.to.filter((a) => !isOwn(a)).forEach((a) => candidates.add(normalizeEmail(a)));
    else if (!isOwn(env.from)) candidates.add(normalizeEmail(env.from));
  }
  const byEmail = new Map<string, StoredQuestion[]>();
  for (const q of await store.questionsForEmails(Array.from(candidates))) {
    const key = normalizeEmail(q.email);
    byEmail.set(key, [...(byEmail.get(key) ?? []), q]);
  }

  const touched = new Map<string, boolean>();
  for (const env of envelopes) {
    if (isNotification(env)) continue;
    const visitor = env.isSent
      ? env.to.map(normalizeEmail).find((a) => byEmail.has(a))
      : byEmail.has(normalizeEmail(env.from)) ? normalizeEmail(env.from) : undefined;
    if (!visitor) continue;

    const asked = byEmail.get(visitor) ?? [];
    // Prefer the thread the email client recorded (In-Reply-To the question
    // notification or an earlier synced message), so an answer to an older
    // question isn't filed under the asker's newest one.
    const threadId = env.inReplyTo ? await store.questionIdForMessage(env.inReplyTo) : null;
    const question =
      asked.find((q) => q.id === threadId) ??
      asked
        .filter((q) => q.createdAt.getTime() <= env.date.getTime() + SKEW_MS)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    if (!question || env.date.getTime() - question.createdAt.getTime() > THREAD_WINDOW_MS) continue;
    if (await store.replyExists(env.messageId)) continue;

    const body = stripQuotedReply(await reader.fetchText(env)).slice(0, MAX_BODY);
    if (!body) continue;
    const fromVisitor = !env.isSent;
    const created = await store.createReply({
      questionId: question.id,
      body,
      sentBy: fromVisitor ? visitor : normalizeEmail(env.from) || "support@form5472prep.com",
      fromVisitor,
      createdAt: env.date,
      sourceMessageId: env.messageId,
    });
    if (!created) continue;
    if (fromVisitor) result.followUpsImported += 1;
    else result.answersImported += 1;
    touched.set(question.id, (touched.get(question.id) ?? false) || fromVisitor);
  }

  for (const [id, newVisitorMessage] of Array.from(touched)) await store.refreshStatus(id, newVisitorMessage);
  if (imported.length > 0) {
    result.oldUnansweredArchived = await store.archiveIfUnanswered(
      imported,
      new Date(now.getTime() - STALE_IMPORT_MS),
    );
  }
  return result;
}
