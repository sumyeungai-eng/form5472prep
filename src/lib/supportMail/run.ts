import { prisma } from "@/lib/prisma";
import { hasMailSince, supportImapConfig, withImapReader } from "./imap";
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
    // Prisma errors echo the whole record (customer text) — keep the last
    // line, which names the actual problem.
    const full = err instanceof Error ? err.message : String(err);
    const lines = full.split("\n").map((l) => l.trim()).filter(Boolean);
    const message = (lines.length > 1 ? lines[lines.length - 1] : full).slice(0, 300);
    console.error("[support-mail-sync] failed", err);
    await prisma.supportMailSyncRun.update({
      where: { id: run.id },
      data: { ok: false, finishedAt: new Date(), error: message },
    });
    return { configured: true as const, ok: false as const, error: message };
  }
}

export function recentSince(now = new Date()): Date {
  return new Date(now.getTime() - RECENT_SYNC_DAYS * 86_400_000);
}

// The cron runs every 10 minutes; look back further than that so a slow or
// skipped run never leaves a gap.
export const PROBE_WINDOW_MS = 25 * 60_000;

// Cron entry: only sync (and wake the database) when the mailbox has mail
// newer than the probe window. Missed mail is still caught by the next sync,
// which always re-reads the last RECENT_SYNC_DAYS days.
export async function runSupportMailSyncIfNewMail(now = new Date()) {
  const config = supportImapConfig();
  if (!config) return { configured: false as const };
  try {
    if (!(await hasMailSince(config, new Date(now.getTime() - PROBE_WINDOW_MS)))) {
      return { configured: true as const, ok: true as const, skipped: true as const };
    }
  } catch (err) {
    console.error("[support-mail-sync] probe failed", err);
    // Fall through to a full run so the failure is recorded for the admin page.
  }
  return runSupportMailSync("cron", recentSince(now));
}
