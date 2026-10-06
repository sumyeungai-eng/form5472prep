# 2026-10-06 — admin "Download all (ZIP)" on the filing page

**Checkout/branch:** worktree `~/Developer/f5472-wt/dlall`, branch `feat/admin-download-all` → `main`.
**Owned files:** `src/app/api/admin/filings/[id]/download-all/route.ts` (+test), `src/app/admin/filings/[id]/AdminActions.tsx` (one button), `package.json`/`package-lock.json` (fflate made a direct dependency), this log.

## What shipped
- **Button:** "Download all (ZIP) ↓" next to the PDF links on /admin/filings/[id].
- **Endpoint:** `GET /api/admin/filings/[id]/download-all` (admin-only; 401 otherwise) returns `<LLC>_<years>_<id>.zip`. It contains a folder with:
  - 01 current package
  - 02 signed
  - 03 faxed snapshot
  - 04 fax receipt (`faxReceiptKey`)
  - 05 client signature PNG
  - 06 extension proof
  - 07 dissolution certificate
  - 08_attachment_NN_* (message-thread attachments, oldest first)
  - README.txt listing what's included and what was not on file or not found in storage
- **Read-only:** nothing is regenerated. Files are STOREd (level 0) because PDFs and images are already compressed. `maxDuration` 60s.
- **Verified:** route test unzips the output (names, bytes, README, 401/404); vitest 2023/2023; tsc clean; `next build` passes.

## Contracts
- When a new stored document type is added to Filing, add it to the entries list in the route.

## Open
- Not clicked through on production (needs the admin login). Very large attachment sets could approach the 60s / memory limits; fine at current sizes.
