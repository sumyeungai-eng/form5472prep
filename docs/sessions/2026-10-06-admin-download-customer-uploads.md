# 2026-10-06 — "Download all" = customer uploads only (correction)

**Checkout/branch:** worktree `~/Developer/f5472-wt/dlall2`, branch `fix/download-customer-uploads` → `main`.
**Owned files:** `src/app/api/admin/filings/[id]/download-all/route.ts` (+test), `src/app/admin/filings/[id]/page.tsx` (Customer documents card), `src/app/admin/filings/[id]/AdminActions.tsx` (old button removed), this log.

## Owner correction
"Download all" must give the admin everything the CUSTOMER uploaded for review, not our own generated documents. This supersedes `docs/sessions/2026-10-06-admin-download-all.md`.

## What shipped
- **ZIP contents:** `GET /api/admin/filings/[id]/download-all` (admin-only) now zips only customer uploads, in folders:
  - `Documents/` (FilingDocument with uploadedBy "customer")
  - `Bank statements/<year>/`
  - `Message attachments/` (client messages only, date-prefixed)
  - `Extension proof/`
  - `Dissolution certificate/`
- **File names and README:** customers' original file names are kept; duplicates get " (2)". The README lists contents and any file missing from storage. Generated packages, signed/faxed PDFs, receipts and signatures are excluded.
- **No uploads:** returns 404 JSON, but the UI never links to it then.
- **Button:** moved into the "Customer documents" card: "Download all customer uploads (ZIP)", with the file count. It's disabled when nothing is uploaded. The count in `page.tsx` uses the same sources as the route.
- **Verified:**
  - Route test (folders, names, duplicates, select filters exclude our docs, empty case).
  - vitest 2023/2024: one generatePackage test timed out at 20s under machine load (load average ~35); it passes in isolation and is unrelated.
  - tsc clean; `next build` passes.

## Contract
- Adding a new customer-upload type: update BOTH the route's entries and the `customerUploadCount` in page.tsx.
