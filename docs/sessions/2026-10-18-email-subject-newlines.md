# 2026-10-18 — Website-question alerts were silently failing

## What happened
- Owner did not receive the admin email for question cmvamxact0008l506pwutbabd.
- Vercel runtime logs: every POST /api/ask whose message contained a line break failed twice at Resend with 422 "The `\n` is not allowed in the `subject` field." (2026-10-16 07:16 + 07:17, 2026-10-18 07:56 UTC — logs only cover 3 days; earlier multi-line questions likely failed too). The questions were stored, so they are in /admin/questions; only the alert email was lost.
- Cause: `subjectSnippet(message)` put raw message text (with newlines) into the subject.

## Fix (worktree ~/Developer/f5472-wt/subject-fix, branch fix/email-subject-newlines → main)
- `subjectSnippet` collapses whitespace first.
- `sendEmail` now runs every subject through exported `singleLineSubject()` (CR/LF/tab → space, collapse spaces, cap 250 chars) — a safety net for all transactional emails.
- Tests: `src/lib/email.subject.test.ts` (multi-line message → single-line subject in the Resend request). email tests 12/12, tsc 0, eslint 0, next build 0.

## Contracts
- Never put user-supplied text into a subject without `singleLineSubject` (sendEmail does it centrally now).

## Open
- Owner: check /admin/questions for questions from 16 and 18 Oct (and any older multi-line ones) that never produced an alert.
