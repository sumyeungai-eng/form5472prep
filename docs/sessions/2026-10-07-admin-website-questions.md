# 2026-10-07 — Admin "Questions" inbox for website questions

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/admin-questions` / `admin-questions` → `origin/main` | `prisma/schema.prisma` (WebsiteQuestion, WebsiteQuestionReply), `prisma/migrations/20261007120000_website_questions/`, `src/app/api/ask/route.ts` (+test), `src/app/api/admin/questions/[id]/route.ts` (+test), `src/app/admin/questions/**` (+pages.test.tsx), `src/lib/email.ts` (`sendWebsiteQuestionReplyEmail`, admin-link line in `sendWebsiteQuestionAdminEmail`), `src/lib/email.test.ts`, `src/lib/admin/counters.ts` (+test), `src/app/admin/_components/adminNavConfig.ts` |

The main checkout `~/Documents/Codex/form5472` has unrelated uncommitted blog/OG work from another session — untouched.

## What shipped
- `/api/ask` (the "Ask a question" widget + /contact form) now **stores** each question in `WebsiteQuestion` before emailing the admin inbox. The admin email gains an "answer it in admin" link to `/admin/questions/<id>`.
- New admin page **Questions** (`/admin/questions`, sidebar under Work, badge = open count): tabs To answer / Answered / All / Archived.
- Detail page `/admin/questions/[id]`: the question, earlier replies, reply box (emails the visitor via Resend, kind `website_question_reply`, Reply-To support@), Mark answered (for replies sent from Gmail), Move back to To answer, Mark unread, Archive/Unarchive. Sidebar shows whether the email belongs to an existing customer (links their filings) and their earlier questions.
- Evidence: targeted vitest (ask route, admin questions route, admin pages render, email, admin counters) 222/222 pass; `tsc` clean; eslint clean on touched files; `next build` OK with the three new routes listed.

## Contracts
- **Never lose a question:** the DB write is best-effort (email still goes out if it fails); the visitor only gets the 500 fallback when the question was neither stored nor emailed.
- Honeypot spam and invalid emails are **not** stored.
- Reply POST sends the email **first** and records the reply only on success (no "sent" record for an unsent email).
- "To answer" / sidebar badge = `repliedAt IS NULL AND archivedAt IS NULL`.
- `shell()` inserts `preheader` raw — any admin/user-typed preheader must be `escapeHtml`-ed (done for the reply email).
- `?view=` is checked with `hasOwnProperty` (plain `in` let `constructor` through).
- Schema change is additive only (two new tables); migration runs via `vercel-build` `prisma migrate deploy`.

## Open
- Owner-gated: none.
- Follow-ups: questions asked before this deploy were never stored (they exist only in the support inbox). Replies the visitor sends back land in support@ Gmail, not in the admin thread. The iPhone admin app (`/api/admin/v1`) does not show questions yet.

## Lane notes
Single lane (this session), no subagents. Deploy = `git push origin main` (never `vercel --prod`).
