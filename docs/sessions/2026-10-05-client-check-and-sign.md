# 2026-10-05 — client check-and-sign flow

**Checkout/branch:** worktree `~/Developer/f5472-wt/clientsign`, branch `feat/client-check-sign` → pushed to `main`.

**Owned files:**
- **Admin:** `src/lib/admin/filingActions.ts` (+test), `src/app/admin/filings/[id]/AdminActions.tsx`
- **Email:** `src/lib/email.ts` (sendReadyToSignEmail only)
- **Customer sign page:** `src/app/(app)/filings/[id]/sign/{page,SignClient}.tsx`
- **APIs:** `src/app/api/filings/[id]/sign/route.ts` (+test), `src/app/api/filings/[id]/request-change/route.ts` (+test, new), `src/app/api/filings/[id]/pdf/route.ts`, `src/app/api/generate-pdf/route.ts`
- **Copy:** `src/components/FilingStatusBanner.tsx`, `src/components/wizard/FilingActions.tsx`, `src/app/(marketing)/page.tsx` and `partners/page.tsx` (copy only)
- this log

## Owner decisions (2026-10-05)
- **Approval and signing are the client's step.** Uploading the accountant-reviewed PDF is the ONLY trigger. It emails the client a magic link to check the PDF; if everything is correct they sign digitally, otherwise they request a change.
- **Admin "Approve for signature" button REMOVED.** The backend `approveForSignature` action is kept (tests and API) but has no UI.
- **Re-signing:** if the client already signed an earlier version, uploading a corrected reviewed PDF sets that signature aside and asks them to check and sign again.

## What shipped
- **`uploadReviewedPdf`:**
  - Always sets PDF_GENERATED and clears `signaturePngKey` (the old PNG is logged in the change log and stays in storage).
  - Emails the client with the partner brand (`resign` flag picks the "updated forms" copy).
  - Returns `emailSent` / `emailTo` / `emailError`, and the admin UI shows the outcome.
  - The admin UI asks for confirmation before setting aside an existing signature.
- **Email:** "Please check and sign your forms" with a checklist (LLC name/EIN/address; owner name/address/foreign tax ID; amounts and years) and a "Check & sign my forms" button.
- **Sign page (2 steps):** check the PDF and tick "everything is correct" (or "Request a change"), then sign.
  - The copy no longer claims the accountant signs on the client's behalf.
  - Invite-only partner clients get in-page done states instead of the dead-end `/filings/{id}` link.
- **Sign API:**
  - Requires `confirmed: true` and `pdfKey === generatedPdfKey`. The write is a conditional `updateMany` on that key, so a stale tab gets a 409 asking them to reload.
  - The signature PNG key is versioned (`{id}_signature_{ts}.png`).
- **request-change API (new):**
  - Access is sign scope (works from partner sign links).
  - Only available while the reviewed package is out for signature.
  - Saves a "Change requested before signing:" message and emails support, throttled to one email per filing per 10 min.
- **Locking the reviewed package** (from the independent review):
  - `regeneratePdf` now also clears the client signature.
  - `resendOrderConfirmation` no longer rebuilds the PDF once it's reviewed or signed.
  - The customer `generate-pdf` API refuses once reviewed.
  - `/api/filings/[id]/pdf` allows sign-invite access, so partner clients can see what they confirm.
- **Copy:** the SIGNATURE_PENDING banner now says "preparing to fax", and the partner copy order is now "accountant reviews → client checks & signs".
- **Verified:**
  - vitest 1747/1747, with new tests for upload/email/resign, sign confirmation + version lock, request-change gating/throttle, and the resend lock.
  - `tsc` is clean; `next build` passes.
  - Independent deep-reasoner review: findings #1–#6 addressed.
- **NOT verified:** the sign page and admin panel were not viewed in a browser (they need a real paid filing plus admin login).

## Contracts
- **Every path that changes `generatedPdfKey` must clear `signaturePngKey`.** Today these are uploadReviewedPdf, regeneratePdf, and generate-pdf (which only runs pre-review).
- **Only `uploadReviewedPdf` sets `reviewApprovedAt` from the UI.**
- **The sign API contract:** `{ pngDataUrl, confirmed: true, pdfKey }`.

## Open
- **Owner:** walk one real filing through the flow: upload reviewed PDF → email → check → sign; also try Request a change.
- **Owner/legal:** the IRS signature line on pro forma 1120 page 1 is the owner's. Confirm whether the package is signed by placing the client's drawn signature (place-signature) or by an accountant offline. Older code comments said "accountant signs offline", and that would need the client's authority (Form 2848 limits). Customer copy is now neutral ("authorize us to submit by fax").
- **Follow-up:** the change-request note isn't surfaced as a badge on the admin filings list (it's in the thread + email).
