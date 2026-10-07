# 2026-10-07 — Link support@ email answers to admin Questions

Follows `2026-10-07-admin-website-questions.md` (Questions inbox, 3b95af3 / 75a2b12).

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/support-mail-sync` / `support-mail-sync` → `origin/main` | `src/lib/supportMail/*` (new: parse, sync, store, imap, run + tests), `src/app/api/cron/support-mail-sync/*`, `src/app/api/admin/questions/sync/route.ts`, `src/app/admin/questions/{page.tsx,MailboxSync.tsx,pages.test.tsx}`, `src/app/admin/questions/[id]/page.tsx`, `prisma/schema.prisma` + `prisma/migrations/20261007150000_support_mail_sync/`, `vercel.json` (one cron), `package.json` / `package-lock.json` (imapflow, mailparser, @types/mailparser) |

## What shipped
- The site reads the Hostinger mailbox **support@form5472prep.com** over IMAP (read-only: folders opened readOnly, nothing flagged/moved/deleted).
- "[Website question]" notifications → `WebsiteQuestion`: questions asked before 2026-10-07 are **imported**; ones already stored are **matched** (admin link id, else email + message within 30 min) via `sourceMessageId`.
- Our answers in the **Sent** folder → `WebsiteQuestionReply` (source `email`), visitor follow-ups in the inbox → `fromVisitor` replies. Filed under the asker's latest question created before the email, within 90 days.
- Status: answered when our latest message is newer than the visitor's; a new follow-up reopens + marks unread. Imported questions >30 days old with no answer found are archived.
- Hourly cron `/api/cron/support-mail-sync` (minute 41, last 7 days); admin buttons "Check mailbox now" (7 days) and "Import past emails" (since 2026-06-01). Every run logged in `SupportMailSyncRun`; the Questions page shows last check / failure.
- Evidence: targeted vitest 45/45 (parse, sync with fake mailbox, store status rules, cron auth, admin pages/API, /api/ask); `tsc` + eslint clean; `next build` OK (routes listed). Hostinger IMAP reachable at imap.hostinger.com:993 (AUTH=PLAIN/LOGIN). **Not yet run against the real mailbox** — needs the password.

### Fix (same day)
- First live run: IMAP login + parsing worked, but `createQuestion` failed — the sync spread the parser result (incl. `questionId`) into Prisma ("Unknown argument `questionId`"). Store/sync now pass explicit fields; the in-memory test store rejects unknown keys like Prisma (verified: fails on the old code, passes on the fix). Sync errors stored/shown are now the last line only (no customer text).
- Owner step done: `SUPPORT_IMAP_PASSWORD` added in Vercel (Production, secret) and redeployed.

## Contracts
- Store methods write explicit Prisma fields only — never spread caller objects into `data`.
- Every mailbox item is keyed by Message-ID (`@unique` on both tables) — sync is idempotent; never key on anything else.
- Cron requires `CRON_SECRET` (no dev fallback).
- `stripQuotedReply` keeps only the new text (Gmail/Apple/Roundcube/Outlook quote headers); the original email stays in the mailbox.
- Schema change is additive (nullable/defaulted columns + one table).

## Open
- `SUPPORT_IMAP_PASSWORD` is set (2026-10-07). Optional overrides: `SUPPORT_IMAP_USER`, `SUPPORT_IMAP_HOST`, `SUPPORT_IMAP_PORT`.
- Follow-ups: first real run should be eyeballed (folder names on Hostinger, quote stripping on real replies). Emails to/from a visitor about other matters within 90 days attach to their question thread.

## Lane notes
Single lane, no subagents. Deploy = `git push origin main`.
