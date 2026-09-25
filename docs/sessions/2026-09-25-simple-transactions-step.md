# 2026-09-25 — Transactions step rebuilt as short questions

## Ownership
- Built in worktree `~/Documents/Claude work/form5472-tx`, branch `feat/simple-transactions`
  (from `origin/main` 03b9d62), merged to `main`. Implementation by a Claude (opus) subagent
  to a written spec; reviewed, patched and browser-verified by the orchestrating session.
- Files: `src/components/wizard/TransactionsReview.tsx` (2,116 → ~1,860 lines),
  new `src/components/wizard/transactionsAnswers.ts` (+ `.test.ts`), this log, REPO-STATE.md line.
- NOTE on checkouts: `~/Documents/Codex/form5472` is the live working clone. On 24 Sep an orphaned
  codex run (from a dispatch the owner rejected) switched it to `feat/rcs-dropdowns` and left a
  stale reasonable-cause draft. This session backed that draft up (session scratchpad), removed it,
  deleted the branch and fast-forwarded the clone to `main`. Uncommitted blog edits there
  (`src/lib/blog.ts`, `blog.test.ts`, `blog/[slug]/opengraph-image.tsx`) belong to another session
  and were left untouched. `~/Documents/Claude work/form5472` is a stale checkout (old May branch,
  July leftovers) — nobody works there.

## What shipped (owner-approved layout)
Per tax year: (1) "Did any money move between you and the LLC?" Yes/No — Yes reveals "Money you put
in (incl. costs you paid)", "Money you took out", and collapsible loans / anything else / bank
statement upload; (2) total assets at year-end; (3) non-cash transfers Yes/No. Once per filing:
U.S.-source income Yes/No (+ withheld follow-up). Removed: global "no reportable transactions" block,
five "None this year" checkboxes, formation-funding panel, summary boxes, owner-paid-costs section,
long USD paragraph.
- Evidence: vitest 765/765 (23 new), tsc + eslint clean, production build; browser (prod build):
  legacy all-confirmed year opens as No; Yes + $750 + $1,500 loan saved as expected payload; phone
  width 375px no horizontal scroll.

## Contracts
- Data model, route, generator and pre-flight unchanged. "No" sends the exact old none-path
  payload (incl. all five zeroConfirmations — the server does NOT set them itself).
- "Yes" derives zeroConfirmations: every category with no amount/rows is confirmed $0 (keeps W02 quiet).
- Loans are stored as one `reportableTransactions` row per direction with fixed descriptions
  "Loan from owner to LLC" / "Loan from LLC to owner" (loan_to_owner negative, like distributions);
  reload recognises them by that description.
- New saves never create `ownerPaidCosts`; legacy rows are shown read-only with remove, and the
  contributions label switches to "Other money you put in (not listed above)".
- Behaviour change: typed contribution/distribution totals now yield to statement rows per category
  (matching `partVRowsForYear`), instead of being wiped by any upload.

## Open
- Follow-up: loan dates are validated against the calendar year only; pre-flight A13 also checks
  formation/dissolution bounds (same gap existed for old manual rows).
- Follow-up: the "Enter an amount, or answer No above." hint shows as soon as Yes is picked (amber,
  not red) — owner may prefer it only after Continue.
