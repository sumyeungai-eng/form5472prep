# 2026-10-08 — One order, two returns, two separate faxes

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/linked-return` / `linked-return` → `origin/main` | `prisma/schema.prisma` (Filing.linkedToFilingId + index) + `prisma/migrations/20261008150000_filing_linked_return/`, `src/lib/admin/linkedReturn.ts` (+test), `src/app/api/admin/filings/[id]/linked-return/route.ts` (+test), `src/app/admin/filings/[id]/{LinkedReturns.tsx,page.tsx}`, `src/app/admin/filings/page.tsx`, `src/lib/admin/reporting.ts`, `src/app/admin/sources/page.tsx`, `src/lib/admin/websiteQuestions.ts`, `src/app/admin/questions/pages.test.tsx`, `src/app/partner/page.tsx`, `src/app/(app)/filings/[id]/page.tsx`, `src/app/(app)/dashboard/{page.tsx,DashboardRow.tsx}` |

## What shipped
- Owner: order Slim & Strong LLC (cmuwbffky0005l6043a40uuyi) needs two separate returns, each faxed separately (owner chose "two separate returns" + "two separate faxes").
- Admin filing page → "Returns on this order" card → "Add another return to this order" (tax years) creates a Filing linked to the original (`linkedToFilingId`), status PAID, amountPaid 0, inReview, copying ONLY client/LLC identity (`LINKED_RETURN_COPY_FIELDS`). It then uses the existing pipeline unchanged: Upload reviewed PDF → client check & sign → place signature → fax → receipt.
- Linked returns are excluded from sales/revenue/source/partner reports, the "Paid (30d)" stat and the Questions order summary; customer page skips the Google Ads purchase conversion; customer dashboard shows "Included in your order"; partner list labels "Additional return (included in the order)"; admin list badge "Additional return".
- Evidence: 234 targeted tests pass, tsc 0, eslint 0, build OK. Codex: HIGH per-return answers copied + MEDIUM/LOW counting surfaces → fixed, re-check "ship".

## Contracts
- Copy allowlist only; per-year answers (priorForm5472Filed, hasUsSourceIncome, usTaxWithheld, 7004/final/RCS, figures) are never copied.
- Any new order-counting/revenue surface must exclude `linkedToFilingId != null`.
- Extra returns always hang off the ORIGINAL filing (flat list, one root).

## Open
- No yearData is created for a linked return: use "Upload reviewed PDF" (Regenerate PDF needs figures entered first).
- Each delivered fax sends its own "delivered" email.
