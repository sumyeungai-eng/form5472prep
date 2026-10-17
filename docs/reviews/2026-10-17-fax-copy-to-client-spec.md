# Spec: let staff email the client a copy of the faxed forms (2026-10-17)

Owner request: "when admin click fax to IRS button, can admin have an option to choose if the customer could get the copy of what we fax? currently customer only got the confirmation."

## Today
- Admin clicks "Send fax to IRS" → `retryFax` (src/lib/admin/filingActions.ts) submits via Telnyx; delivery is confirmed later by the fax webhook, and `src/lib/fax/finalize.ts` sends the customer `sendFaxDeliveredEmail` (src/lib/email.ts ~L980-1150) and the admin email.
- The customer email does NOT attach the faxed forms; it only says "The exact PDF transmitted to the IRS is available for download in your portal." The receipt is attached only when `attachReceipt` is set (resend path).
- SSN rule (2026-10-15): a package that prints the owner's SSN (Filing.ownerSsnLast4 / ownerSsnCiphertext set) is NEVER emailed as an attachment.

## Required behaviour
F1. In the admin "Fax submission" area (src/app/admin/filings/[id]/AdminActions.tsx), next to "Send fax to IRS" (and "Fax again…"), add a checkbox: "Email the client a copy of the faxed forms (PDF) when delivery is confirmed". Default: unchecked (current behaviour). If the filing has an SSN on file, render it disabled and unchecked with the note: "Not available — this package shows the client's SSN, so it is never emailed. The client can download it from their portal."
F2. The choice is sent with the `retryFax` request (`sendCopyToClient: boolean`), validated server-side (SSN on file → forced false regardless of the request), stored on the filing in a new additive nullable column `Filing.faxCopyToClient Boolean?` (migration `prisma/migrations/20261017120000_fax_copy_to_client/migration.sql`; never run `prisma migrate dev` — hand-write SQL), and included in the existing retryFax change-log entry.
F3. When the fax is confirmed delivered (finalize.ts), if `faxCopyToClient === true` and no SSN is on file, attach the exact faxed bytes (the frozen faxed snapshot `faxedPdfKey`; fall back to `signedPdfKey` only if the snapshot is missing) to the customer's fax-delivered email, as `Form5472_<LLC>_<years>_filed.pdf` (reuse the existing download-filename helper in src/lib/pdf/downloadFileName.ts if it fits). The email copy says the faxed forms are attached (keep the portal sentence too). If the storage read fails, send the email without the attachment (never fail or delay the confirmation) and log only the error name.
F4. "Resend fax confirmation" (admin) gets the same checkbox (default unchecked, same SSN rule); when ticked, the resent email attaches the faxed copy the same way.
F5. Partner / white-label clients: no special case beyond what the email already does (brand helper stays as is). Admin email unchanged.
F6. Attachment size: if the PDF is larger than 20 MB, skip the attachment and keep the portal sentence.
F7. Never touch the payment path or customer checkout.

## Tests (vitest; synthetic data only)
- retryFax stores faxCopyToClient from the request; SSN on file forces false; change log records it.
- finalize: attaches the faxed snapshot when true; not when false/null; not when SSN on file; storage failure → email still sent without attachment; >20 MB → no attachment.
- sendFaxDeliveredEmail: attachment present + copy text when bytes passed; absent otherwise.
- Resend path with and without the checkbox.
- AdminActions renders the checkbox; disabled with the SSN note when an SSN is on file.
