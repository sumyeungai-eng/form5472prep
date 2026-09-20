# 2026-09-20 — Form SS-4 auto-generation (plus small admin/marketing changes the same day)

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned every path in the
commits named below. Not touched: `content/blog/**`, untracked `public/email/*`, root PNGs,
`docs/marketing/*`, `src/lib/wizard/`.

## What shipped
**SS-4 generator** (`git log --grep "auto-generate Form SS-4"`). Owner supplied the blank form; it is the
official Form SS-4 Rev. 12-2025, committed at `public/forms/fss4.pdf` (89 AcroForm fields, all page 1).
- `docs/reviews/ss4-field-map.md`: every field mapped to its line, proven with a calibration render
  (each field filled with its own name). Authoritative; do not re-derive.
- `src/lib/pdf/ss4Options.ts` (pure): `Ss4Options`, `defaultSs4Options`, `parseSs4Options` (bounded,
  never throws), `ss4Warnings`, `splitAddress`, `normalizeUsDate`, `toFormText`, `unencodableChars`.
- `src/lib/pdf/ss4Fit.ts` (pure): cell widths, `fitsCell`, `ss4FitWarnings`, line 10 continuation routing.
- `src/lib/pdf/ss4.ts`: `ss4FieldValues` (pure) and `generateSs4Pdf` (pdf-lib fill + flatten).
- `POST /api/admin/applications/ein/[id]/generate-ss4`: saves options to `EinApplication.ss4Options`,
  generates, then `storePreparedPdf("ein", id, bytes, "generated")`.
- `src/components/admin/Ss4Panel.tsx`: "Form SS-4 draft" card on the EIN admin page.
- Migration `20260920140000_ein_ss4_options`: `ss4Options JSONB`, `preparedPdfSource TEXT` (EIN only).
- `storePreparedPdf` extracted from `handleUploadPrepared` in `src/lib/applications/adminSignature.ts`;
  upload behaviour unchanged.
The generated form lands in the SAME prepared-PDF slot as a manual upload, so the 2026-09-19 signature
chain continues: generate, staff review, request signature, customer signs, staff stamp.

Verified: tsc clean, vitest 473/473, `next build` 434/434, template present in the route's traced
files. Two rendered samples inspected line by line (a plain case and a stress case with accented and
Vietnamese names, a long reason, and a "partnership" sentence in the purpose). Advisor pre-ship review
found 4 defects, all fixed; a further 2 found in the stress render (single-line address not split into
4a/4b; default reason cut mid-word) also fixed. NOT verified: a real generation in production (needs
admin login). Deploy evidence at the bottom.

**Other changes this day**: `/admin/filings?paid=1` filter (and its fix: `Filing.amountPaid` is the
QUOTED price, so paid = post-DRAFT status or `stripePaymentId`, via exported `PAID_FILING_STATUSES`);
fax number card on `/admin/faxes`; Partners link removed from the header and mobile menu (footer keeps
"Become a Partner" and "Partner sign in"). DNS: the `rua=` tag was removed from the `_dmarc` TXT record
at Hostinger at the owner's request (daily DMARC reports stopped; policy `p=quarantine` unchanged).

## Contracts
- Owner-approved DRAFT defaults (2026-09-20, "you can decide"): 8a Yes, 8b 1, 8c Yes; 9a Other
  "Foreign-owned U.S. disregarded entity" for one member, Partnership for more; line 10 Started new
  business with the business type; 12 December; 13 zeros; 18 No; 7b blank; designee off; title "Member".
  Staff can change every one per application. They are drafts for staff review, not tax advice.
- Member count is inferred ONLY from explicit patterns in `businessType` ("3-member"). Never from
  `businessPurpose`, and never from the bare word "partnership".
- Never fill the EIN box `f1_1[0]`. Exclusive groups (8a, 8c, 9a, 10, 16, 18) are independent
  checkboxes in the PDF, not radio groups: code must emit at most one per group.
- All text goes through `toFormText` and is reduced to printable ASCII before `setText`; generation
  must never throw on encoding. A failed `flatten()` must fail generation (the customer signs it).
- Client components import only `ss4Options.ts` / `ss4Fit.ts`, never `ss4.ts` (pdf-lib, fs).
- Generating replaces the prepared PDF and discards any signature, same as an upload.

## Open
Owner-gated: one real test generation in production; line 7b practice for owners with no US tax
number (left blank, panel warns); whether to use the third-party designee block with our fax number so
IRS replies reach `/admin/faxes` (inbound fax still needs `TELNYX_PUBLIC_KEY`).
Follow-ups: the EIN apply form does not collect county, member count or responsible-party tax number,
so staff type them each time; W-7 generation for ITIN not built; foreign single-line addresses are not
split into 4a/4b.

## Lane notes
A codex run launched through the wrapper's background flag was killed when the wrapper ended its turn
(no files written, log held only the prompt echo). Fix: `nohup ... &` + `disown`, and the wrapper polls
inside its turn. Headless Chrome screenshots of a PDF fired before the viewer painted; PyMuPDF
(`python3 -c "import fitz"`) renders reliably. A spec error of mine (single-line address left whole)
was only caught by looking at a stress render: always render a second, hostile sample.
