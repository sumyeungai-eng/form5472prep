# 2026-11-03 — Admin Filings list: grouped by whose turn it is

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/filings-list-triage` (`feat/filings-list-triage`, pushed to `origin/main`) | `src/app/admin/filings/page.tsx`, `src/lib/admin/reviewQueue.ts` (+ test), this log |

## Owner request
"A bit messy… make the unfinished work on my side more obvious; Awaiting
review and Awaiting signature should be different colours."

## What shipped
- `turnOf(filing, canFax)` in `reviewQueue.ts` decides whose move it is:
  - **staff**: paid and not released, a failed fax, or a signed package that
    can be faxed now.
  - **client**: released and waiting for the signature.
  - **other**: drafts, fax in flight, delivered.
- `canFax` is `refaxDecision(f, now).kind === "allowed"`, so claims, unknown
  outcomes and deliveries never count as "ready to fax". This came from Codex
  P2: `faxJobId` alone was wrong.
- The list view (not the review queue) sorts by turn (staff → client →
  other), newest first within each group, with a header row per group
  ("Your turn · n", "Waiting on the client · n", "Everything else · n") and
  orange-tinted staff rows.
- Open paid orders (`OPEN_WORK_STATUSES`) are fetched separately with the same
  filters and merged, so drafts can't push them past the 100-row cap. The
  footer now says "newest 100, plus every open paid order" (Codex P3).
- Badge colours: "Awaiting review" is orange (your move); "Awaiting
  signature" is sky blue (the client's move).

## Contracts
- `?queue=1` keeps its own SQL order and gets no grouping.
- If a new status or fax state is added, update `turnOf` and its test.

## Open
- Visual check is on the live page after deploy (the list needs the
  production DB).
