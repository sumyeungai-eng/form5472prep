import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { htmlToText } from "./parse";
import type { MailboxReader, MailEnvelope } from "./sync";

// support@form5472prep.com is a Hostinger mailbox. Credentials come from
// Vercel env: SUPPORT_IMAP_PASSWORD (required; set by the owner), with
// SUPPORT_IMAP_USER / SUPPORT_IMAP_HOST / SUPPORT_IMAP_PORT defaulting to the
// Hostinger values. Read-only: folders are opened readOnly and nothing is
// flagged, moved or deleted, so the mailbox looks exactly as before.

export type ImapConfig = { host: string; port: number; user: string; password: string };

export function supportImapConfig(): ImapConfig | null {
  const password = process.env.SUPPORT_IMAP_PASSWORD;
  if (!password) return null;
  return {
    host: process.env.SUPPORT_IMAP_HOST || "imap.hostinger.com",
    port: Number(process.env.SUPPORT_IMAP_PORT || 993),
    user: process.env.SUPPORT_IMAP_USER || "support@form5472prep.com",
    password,
  };
}

const SKIP_SPECIAL_USE = new Set(["\\Trash", "\\Junk", "\\Drafts", "\\All"]);

export async function withImapReader<T>(config: ImapConfig, run: (reader: MailboxReader) => Promise<T>): Promise<T> {
  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.port === 993,
    auth: { user: config.user, pass: config.password },
    logger: false,
  });
  await client.connect();
  try {
    const reader: MailboxReader = {
      async scan(since) {
        const out: MailEnvelope[] = [];
        for (const box of await client.list()) {
          if (box.flags?.has("\\Noselect")) continue;
          if (box.specialUse && SKIP_SPECIAL_USE.has(box.specialUse)) continue;
          if (/^(trash|spam|junk|drafts?|deleted)/i.test(box.name)) continue;
          const isSent = box.specialUse === "\\Sent" || /^sent/i.test(box.name);
          // Server logs only (names, no content): confirms Sent detection on Hostinger.
          console.log(`[support-mail-sync] folder ${box.path}${box.specialUse ? ` ${box.specialUse}` : ""} sent=${isSent}`);
          const lock = await client.getMailboxLock(box.path, { readOnly: true });
          try {
            const uids = await client.search({ since }, { uid: true });
            if (!uids || uids.length === 0) continue;
            for await (const msg of client.fetch(uids, { envelope: true, uid: true }, { uid: true })) {
              const e = msg.envelope;
              if (!e?.messageId) continue;
              out.push({
                folder: box.path,
                uid: msg.uid,
                isSent,
                messageId: e.messageId,
                date: e.date ? new Date(e.date) : new Date(0),
                from: e.from?.[0]?.address ?? "",
                to: [...(e.to ?? []), ...(e.cc ?? [])].map((a) => a.address ?? "").filter(Boolean),
                replyTo: (e.replyTo ?? []).map((a) => a.address ?? "").filter(Boolean),
                subject: e.subject ?? "",
                inReplyTo: e.inReplyTo?.trim() || null,
              });
            }
          } finally {
            lock.release();
          }
        }
        return out;
      },

      async fetchText(envelope) {
        const lock = await client.getMailboxLock(envelope.folder, { readOnly: true });
        try {
          const msg = await client.fetchOne(String(envelope.uid), { source: true }, { uid: true });
          if (!msg || !msg.source) return "";
          const parsed = await simpleParser(msg.source);
          if (parsed.text?.trim()) return parsed.text;
          return typeof parsed.html === "string" ? htmlToText(parsed.html) : "";
        } finally {
          lock.release();
        }
      },
    };
    return await run(reader);
  } finally {
    await client.logout().catch(() => client.close());
  }
}
