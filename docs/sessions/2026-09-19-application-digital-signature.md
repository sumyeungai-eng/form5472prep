# 2026-09-19 — Digital signature for EIN (SS-4) and ITIN (W-7) applications

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned every path in
commit `eafcd98` (listed under "What shipped"). Not touched: `content/blog/**` (blog agent), untracked
`public/email/*`, root PNGs, `docs/marketing/*`, `src/lib/wizard/` (other sessions).

## What shipped (commit eafcd98; docs commit follows)
Owner request: "add the digital signature function for our EIN and ITIN application". Before this,
the repo had no SS-4/W-7 PDF handling at all; staff emailed a PDF to print, sign and scan.

Flow:
1. Staff prepare the form off-platform and upload it on `/admin/applications/{ein,itin}/[id]`
   (new "signature" card, `src/components/admin/ApplicationSignaturePanel.tsx`). PDF only, 4 MB cap
   (Vercel rejects bodies near 4.5 MB). We store the file and its SHA-256.
2. "Email signature request" sends `sendApplicationSignatureRequestEmail` with a magic link whose
   `next=` is `/applications/{type}/{id}/sign`. If the application has no `userId`, a User is upserted
   by the application email and linked first.
3. Customer page `/applications/{ein,itin}/[id]/sign`: PDF in a same-origin iframe plus an
   "Open the form in a new tab" button, typed legal name, consent checkbox, `SignaturePad`.
   POST `/api/applications/{type}/[id]/sign` stores the PNG and the audit trail: signer name, IP,
   user agent, consent version, and `signedDocSha256` (hash of the PDF reviewed). Staff get
   `sendApplicationSignedAdminEmail`. The portal page shows a status card
   (`ApplicationSignatureCard`), only once `paidAt` is set.
4. Staff open `/admin/applications/{type}/[id]/place-signature` (the Filing placement tool, reused
   through a new optional `endpoints` prop on `PlaceSignatureClient`) and stamp signature/date/text.
   Result is stored as the signed PDF; customer can download it from the portal.

Migration `20260919120000_application_signature`: 13 nullable columns on BOTH `EinApplication` and
`ItinApplication` (prepared*, signature*, signed*). Additive only.

Storage keys: `applications/{type}/{id}/prepared.pdf`, `.../signature-<first 16 of doc hash>.png`,
`.../signed.pdf`.

Refactor: stamping, placement validation and chroma-key moved from the Filing place-signature route
to `src/lib/pdf/stampPlacements.ts`. The Filing route keeps its auth, keys, status write and response.

Verified: tsc clean; vitest 426/426; `next build` 400/400 pages with all new routes listed; advisor
pre-ship review (4 defects found, all fixed, see Contracts). Deploy evidence: see bottom of this file.
NOT verified: a real end-to-end run in production (needs admin login, a paid application and a real
customer session). Owner should do one test run before relying on it.

## Contracts (read before editing)
- The application type NEVER comes from a request body or query. Each type has its own thin route
  file that hardcodes `"ein"` or `"itin"` and delegates to `src/lib/applications/{customer,admin}Signature.ts`.
- Customers sign only a document they have seen: `signState` is NOT_READY until paid AND a prepared
  PDF exists. Consent text lives in `consentText()`; bump `SIGNATURE_CONSENT_VERSION` if it changes.
- Re-uploading the prepared PDF discards the signature and the signed PDF (row reset happens BEFORE
  the file write, so old hashes can never point at a new file).
- Stamping requires a signature placement, `canStamp` (hashes equal), AND a re-hash of the stored
  prepared file equal to `signedDocSha256`. Both the sign write and the stamp write are conditional
  `updateMany` calls; a lost race returns 409. Do not replace them with unconditional updates.
- LOCKED (signed PDF exists) blocks re-signing. Stamping does not change the application `status`;
  statuses stay manual.
- `src/lib/applicationSignature.ts` imports `node:crypto`. Client components must import limits from
  `src/lib/applicationSignatureLimits.ts` instead, or `next build` fails (tsc and vitest do not catch it).
- Copy rules: never "IRS-approved", "legally binding", or tax advice.

## Open
Owner-gated:
- **IRS acceptance of a drawn signature on Form W-7.** SS-4 is faxed, so an image of a signature is
  common practice. W-7 goes by mail or through an acceptance agent with identity documents, and a
  handwritten signature is generally expected. This is unverified against current IRS instructions.
  Confirm with the acceptance agent before sending a stamped W-7; until then the ITIN flow is still
  useful as "review and approve online", with the customer wet-signing the printed form.
- Marketing copy on `/ein` and `/itin` was NOT changed. If wanted, say "sign online" for EIN only.
- One end-to-end production test (see "NOT verified").
Follow-ups:
- No delete path exists for applications, so prepared/signature/signed objects are never purged;
  `collectFilingStorageKeys` covers filings only. The privacy page promises deletion on request.
- An expired magic link drops its `next=` path (customer lands on the dashboard after re-login).
- `src/lib/pdf/embedSignature.ts` is dead code (no callers).
- SS-4/W-7 auto-fill from application data was out of scope.

## Lane notes
codex lane is back (credits reset). Three codex-implementer lanes (foundation, then customer + admin in
parallel on disjoint files) plus one fix lane. A parallel lane again reported the OTHER lane's files as
its own codex's "scope violation"; check mtimes and ownership lists before reacting. The one build
break (client component importing a node:crypto module) was only visible to `next build`.

## Deploy evidence (2026-09-19)
Feature commit is `eafcd98` before rebase; on `main` see `git log --grep "digital signature"`. Vercel build log:
"Applying migration `20260919120000_application_signature`" then "All migrations have been successfully
applied." Production probes without a session: POST `/api/applications/ein/x/sign` 401, GET
`/api/admin/applications/ein/x/prepared-pdf` 401, GET `/api/applications/itin/x/document` 401,
`/applications/ein/x/sign` 307 to login.
