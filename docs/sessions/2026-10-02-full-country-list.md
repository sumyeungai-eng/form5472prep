# 2026-10-02 — full country list (Serbia missing)

**Checkout/branch:** worktree `~/Developer/f5472-wt/countries`, branch `fix/full-country-list` → pushed to `main`. Owned file: `src/lib/countries.ts` (+ this log).

## What happened
A customer could not find Serbia in the wizard. `COUNTRIES` was a curated top-50 list, and its header comment claimed an "Other (enter manually)" escape hatch that does not exist in `FilingWizard.tsx` (owner address country, LLC business country, related-party countries). Any owner outside the 50 was blocked.

## What shipped
- `COUNTRIES` expanded to 210 entries: all sovereign countries + Kosovo, Palestine, Taiwan, Hong Kong, Macau, Jersey, Guernsey, Isle of Man, Gibraltar, Bermuda, Cayman, BVI, Anguilla, Aruba, Curaçao, Turks and Caicos.
- All 50 previous spellings are kept verbatim (verified by script), so saved filings still match their select value.
- Verified: vitest 1679/1679 pass. `tsc` shows 3 pre-existing `emailLog` errors from a stale generated Prisma client in the shared node_modules — not from this change.

## Contracts
- The stored value is the display name, and it flows straight into the PDF. Never rename an existing entry without handling the saved values.
- The wizard has no free-text fallback, so any missing country blocks the customer.

## Open
- Follow-up (optional): a searchable combobox instead of a 210-option `<select>`.
