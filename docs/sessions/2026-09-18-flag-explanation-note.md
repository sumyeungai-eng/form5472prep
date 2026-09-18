# 2026-09-18 (part 4) — Customers can explain a flagged late/timely determination

Owner report: a customer clicked "This doesn't match my situation" under the wizard's
determination ("We've recorded this as a timely filing under your Form 7004 extension, due
October 15, 2026") and the message reaching staff said only that it didn't match, with no reason,
forcing an email round trip. Commit `3d27e3e`, rebased on the blog agent's `81943ed`.

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. Files:
`src/lib/flagMessage.ts` (+test), `src/components/wizard/DeterminationFlag.tsx` (new),
`src/components/wizard/FilingWizard.tsx` (inline flag block replaced by the component), this log,
`REPO-STATE.md`.

## What shipped
- Clicking the link no longer sends immediately. It opens a panel: label "Tell us what is different
  (optional)", a textarea capped at 500 characters with a counter past 400, the placeholder "For
  example: my accountant e-filed the 7004 on March 12, or the LLC dissolved in June.", then
  "Send to our team" (always enabled, so sending without a note is one extra click) and "Cancel".
- Message body (`buildFlagMessage`): the old fixed line, unchanged, plus "Shown: <sentence>", then
  when a note exists a newline and "They added: <note>" (trimmed, 3+ newlines collapsed, cut at 500).
  The messages endpoint caps bodies at 5000, well above the worst case (~830).
- Confirmation: "Thanks. We have flagged this for review and will email you before anything is filed."
- Staff visibility needed no work: a customer message already raises the admin unread badge
  (`src/lib/admin/counters.ts`, `fromAdmin: false, readAt: null`).
- `DeterminationFlag` takes three preview-only props (`initialOpen`, `initialNote`, `initialState`)
  that only seed initial state; `FilingWizard` passes none. They exist so the component can be
  rendered in isolation for screenshots.

Verified: 396/396 vitest and a 400-page production build on the COMBINED code after rebasing onto
the blog agent's five commits (no file overlap); deploy Ready. The flag only appears inside a live
draft, so it was reviewed from a rendered isolation preview (screenshot sent to the owner), not by
creating a production draft. The preview route was deleted before commit.

## Contracts
- The note is advisory only. Nothing may branch on it; it routes to a human.
- Keep the fixed first line of the message verbatim: older and newer flags must read alike in the
  thread and in any future search.

## Open
- Owner-gated: reply to the customer who flagged today (a draft reply was provided in chat: asks
  which tax year, whether and when a 7004 was sent, and how and where it was sent).
- Proposed, not built: add "Private courier (FedEx, UPS)" and "E-filed by my accountant" to the 7004
  method list, plus "Something else" with a short note routed to review. Courier matters because
  an IRS-designated private delivery service is treated as timely mailed.
- Pre-existing site-wide dev hydration warning (see part 3) still open.

## Lane notes
Both CLI lanes still down; Claude subagent lanes. Two process lessons, recorded in
`~/.claude/doctrine/lessons.md`: a SendMessage that widens a lane's file scope is (rightly) treated
as a prompt injection, so scope changes need a fresh dispatch; and moving text from a JS string into
JSX text can introduce an unescaped apostrophe that only `next build`'s lint catches, not tsc or
vitest. Lanes told not to build must run `next lint` on their files.
