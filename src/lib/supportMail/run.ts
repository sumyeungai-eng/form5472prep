import { prisma } from "@/lib/prisma";
import { supportImapConfig, withImapReader } from "./imap";
import { prismaQuestionStore } from "./store";
import { syncSupportMailbox } from "./sync";

// Entry point for the hourly cron and the admin "Check mailbox" buttons.
// Records every run in SupportMailSyncRun so the admin page can show when the
// mailbox was last read and why a run failed.

export const RECENT_SYNC_DAYS = 7;
// "Import past emails": the website-question box launched 2026-06-06.
export const FULL_SYNC_SINCE = new Date("2026-06-01T00:00:00Z");

export async function runSupportMailSync(trigger: "cron" | "admin" | "admin-full", since: Date) {
  const config = supportImapConfig();
  if (!config) return { configured: false as const };

  const run = await prisma.supportMailSyncRun.create({ data: { trigger, since }, select: { id: true } });
  try {
    const result = await withImapReader(config, (reader) =>
      syncSupportMailbox({ reader, store: prismaQuestionStore, since, ownAddresses: [config.user] }),
    );
    await prisma.supportMailSyncRun.update({
      where: { id: run.id },
      data: {
        ok: true,
        finishedAt: new Date(),
        questionsImported: result.questionsImported,
        questionsMatched: result.questionsMatched,
        answersImported: result.answersImported,
        followUpsImported: result.followUpsImported,
      },
    });
    return { configured: true as const, ok: true as const, ...result };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[support-mail-sync] failed", err);
    await prisma.supportMailSyncRun.update({
      where: { id: run.id },
      data: { ok: false, finishedAt: new Date(), error: message.slice(0, 1000) },
    });
    return { configured: true as const, ok: false as const, error: message };
  }
}

export function recentSince(now = new Date()): Date {
  return new Date(now.getTime() - RECENT_SYNC_DAYS * 86_400_000);
}
