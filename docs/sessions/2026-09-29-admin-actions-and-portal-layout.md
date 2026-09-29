# 2026-09-29 — Admin actions panel + customer portal layout pass

## Ownership
- Worktree `~/Developer/f5472-wt/admin-layout`, branch `feat/admin-actions-layout` (from origin/main
  788ccfd), merged to `main` by the coordinating session. Files:
  `src/app/admin/filings/[id]/AdminActions.tsx`, `src/app/(app)/dashboard/DashboardRow.tsx`,
  `src/app/(app)/filings/[id]/page.tsx`, new `src/app/(app)/filings/[id]/FaxReceiptCard.tsx`,
  `src/components/wizard/FilingActions.tsx`, this log, REPO-STATE.md line.

## What shipped
- Admin filing actions (owner screenshot: "layout look weird"):
  - Sections in workflow order: Review approval → Sign the package → Fax submission → Customer emails →
    PDFs → Change the package (each labelled, own row; PDF links no longer stretch).
  - Delivered/in-flight fax: status line ("✓ Delivered to the IRS (sent …)") and a secondary
    "Fax again…" button behind a confirm — one click can no longer send the IRS a duplicate.
  - Review approval past signing: shows "✓ Approved …" only — no disabled button + amber warning.
- Customer portal:
  - My filings row stacks on phones (full LLC name, status/price/messages on one line below);
    desktop unchanged.
  - Filing page steps: "Signed and sent to the IRS." once faxed (self-fax: points to step 4);
    step 4 shows plain status (Delivered ✓ / sending / attempt failed — team notified) + small fax
    reference + one receipt link. Removed the duplicate receipt box and its "proof of on-time filing"
    wording (wrong for late DIIRSP filers — the receipt proves delivery, not timeliness).
  - Receipt card extracted to `FaxReceiptCard.tsx` (same markup as 8e8085b).
- Evidence: vitest 911/911, tsc 0, eslint 0 on changed files, production build 0; browser
  (prod build) previews of AdminActions (delivered + pre-approval states) and portal components at
  375px and desktop; 11 public pages at 375px have no page-level horizontal scroll.

## Contracts
- "Fax again…" only adds a client confirm; the server `retryFax` action is unchanged (reviewer
  follow-up to refuse in-flight retries server-side is still open).

## Open
- Follow-up: server-side guard on admin `retryFax` for FAXED/retrying filings.
- Follow-up: `/api/filings/[id]/fax-receipt` refuses partner viewers (owner-only).
