# 2026-10-10 — Cover letter no longer "Signed under penalties of perjury" (generator 2.2.0)

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/cover-closing` / `cover-letter-closing` → `origin/main` | `src/config/filingPackage.ts` (COVER_LETTER_CLOSING, GENERATOR_VERSION 2.2.0), `src/lib/pdf/generatePackage.ts` (cover letter only), `src/lib/pdf/preflight.ts` (A25), `src/lib/pdf/{generatePackage,preflight}.test.ts` |

## What shipped
- Owner: no "Signed under penalties of perjury" on the generated cover letter. The cover letter now closes "Sincerely," above the signature line, owner name and "Sole Member".
- Part V, Part VI and reasonable-cause statements still carry "Signed under penalties of perjury:" (RCS requires it).
- Pre-flight A25: statements must carry the heading; the cover letter must carry the closing and must NOT carry the heading.
- Applies to newly generated / regenerated packages only; signed or faxed packages are never altered.
- Evidence: src/lib/pdf tests 270/272 (the 2 failures are pre-existing in `src/lib/pdfInputs.test.ts` "PATCH PDF text validation" — fail on origin/main too, unrelated), tsc 0, eslint 0, build OK. Codex: no findings, "ship".

## Contracts
- Never put the penalties-of-perjury heading on the cover letter; keep it on the statements.

## Open
- Pre-existing failing tests: `src/lib/pdfInputs.test.ts` (2) — not investigated here.
