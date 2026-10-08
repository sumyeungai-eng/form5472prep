# 2026-10-08 — Choose orders to archive on /admin/filings

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/bulk-archive` / `bulk-archive` → `origin/main` | `src/lib/admin/archive.ts` (new), `src/app/api/admin/filings/archive/route.ts` (+test, new), `src/app/admin/filings/BulkArchive.tsx` (new), `src/app/admin/filings/page.tsx` |

## What shipped
- Tick boxes on the filings list + "Archive selected (n)" (main list) / "Unarchive selected (n)" (Archive view, `?hidden=1`), select-all for the boxes on the page. Archive = `adminHidden: true` (hidden from the main list; nothing deleted).
- Owner decision: archivable = DRAFT + finished (CONFIRMED, FAILED). In-progress orders (PAID, PDF_GENERATED, SIGNATURE_PENDING, SIGNED_UPLOADED, FAXED) get no box and the server refuses them (skipped). Unarchive works on any archived row.
- `POST /api/admin/filings/archive { ids, archive }`: ≤200 ids, per-row conditional update inside a transaction; only rows actually changed are counted and logged to FilingChangeLog (`field: "adminHidden"`).
- Evidence: route tests 19/19 (incl. race where a draft becomes PAID mid-request), tsc 0, eslint 0, build OK. Codex: MEDIUM audit/count race + LOW stale select-all → fixed, re-check "ship it".

## Contracts
- Never hide an in-progress order; the status filter is enforced in the UPDATE itself, not only in the UI.
- The existing single-draft Hide/Unhide (`hideDraft`) is unchanged and still drafts-only.

## Open
- None.
