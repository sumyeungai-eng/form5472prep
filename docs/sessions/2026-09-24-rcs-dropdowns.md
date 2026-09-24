# 2026-09-24 — Reasonable-cause step: dropdowns with "Other" free text

## Ownership
- Built in worktree `~/Documents/Claude work/form5472-rcs` on branch `feat/rcs-dropdowns`
  (cut from `origin/main` a0556d1), merged to `main`.
- The shared checkout `~/Documents/Claude work/form5472` was on `feat/seo-geo-aeo-sprint`
  with another session's uncommitted blog/pricing/schema edits — NOT touched.
- Files owned: `src/components/wizard/ReasonableCauseStep.tsx`,
  `src/lib/reasonableCauseOptions.ts`, `src/lib/reasonableCauseOptions.test.ts`, this log,
  the REPO-STATE.md index line.

## What shipped
- Owner request: "make it as drop down menu, and give option for them to input".
- Per tax year: "Why was the filing missed?" is a dropdown (not aware / little or no activity /
  no U.S. tax owed / formation service didn't tell me / accountant didn't tell me / thought
  someone filed it / hardship / Other). Optional details box for presets; required for hardship
  and Other.
- "How and when did you find out?" is a dropdown of sources + a month picker (required for
  presets, optional for Other) + details box (required for Other).
- Live "What your statement will say" preview; "Use the same answers as <previous year>" button.
- Evidence: 16 new unit tests + full suite 744/744; tsc + eslint clean; production build
  checked in the browser (validation messages, submitted values, 375px width with no sideways
  scroll).

## Contracts
- Storage is unchanged: the dropdowns compose finished third-person sentences ("The Owner …")
  into the existing `rcsWhyMissed` / `rcsWhenLearned` text fields. The generator, API, schema and
  admin editor are untouched and still see plain text.
- `parseWhyMissed` / `parseWhenLearned` recognise composed sentences by exact prefix. If you
  reword an option's `sentence`/`phrase`, older saved answers will reopen as "Other" (the text is
  kept, nothing is lost) — acceptable, but know it.
- Legacy free-text answers load as "Other" with the text intact and are saved unchanged unless the
  customer edits them.
- `validateReasonableCauseYears` (stored text non-empty) still runs; `validateSelections` adds the
  per-dropdown messages.

## Open
- Owner-gated: the option wording is ours; tweak labels/sentences in
  `src/lib/reasonableCauseOptions.ts` if the qualified accountant prefers different phrasing.
- Follow-up: none required.

## Lane notes
- Implemented directly (owner rejected a codex dispatch for this task earlier).
- Used a separate worktree because the shared checkout was on another session's branch.
