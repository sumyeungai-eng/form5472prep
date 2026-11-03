# 2026-11-04 — P0 PR 2–4: no filler cause, reasonable cause source, Part V line items

Spec: `docs/reviews/2026-10-30-system-update-plan.md` → PR 2, PR 3, PR 4. The owner approved D4 (keep the canned paragraphs after a narrative), D5 (verbatim editable, logged, snapshotted) and D6 (permissive capture, staff-blocking A38).
Builds on PR 1: `docs/sessions/2026-10-31-release-gate-p0-1.md`. Generator now **2.5.0**.

**Status:** committed locally on `feat/system-update-p0`. **NOT pushed.** P0 ships as one push, after the orchestrator's review and the owner's approval of migrations `20261104100000_release_gate` and `20261105120000_rcs_source`.

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/sys-p0`, `feat/system-update-p0` | P0 integration branch: PR 1 (`171dd2c..c7f35e0`) and PR 2–4 (this log). |
| `~/Documents/Claude work/form5472` (main checkout) | Not touched. |
| Renders and scratch | `~/Developer/f5472-wt/sys-p0-out/` (outside the repo): `verbatim.pdf`, `seven.pdf`, the PNGs and `render.ts`. |

## What shipped (commits)
| Commit | PR | Change |
|---|---|---|
| `301862a` | PR 2 | Red "DRAFT — cause narrative missing" marker. `noUsIncomeSentence` moves to Background. The canned paragraphs render only after a narrative. |
| `23d48fb` | PR 3 | `rcsSource` with raw capture, the verbatim WinAnsi body, A37, W42, the snapshot log, the release and fax gates, the admin control, the step-5 copy and migration `20261105120000_rcs_source`. |
| `5586407` | PR 4 part 1 | `src/lib/partV.ts`: permissive PATCH; sanitised generator input (`amountMissing`); OTHER, paidVia and FX sentences; the distributions sentence; A38 and W43–W45. |
| `cd3317c` | PR 4 part 2 | Wizard line items and the checklist, with the submit refusal turned into a warning. Admin per-year table and "Convert to line items" (`convertOwnerPaidCosts`). |
| (this commit) | docs | Session log, staff changelog, AGENTS.md and CLAUDE.md notes. |

## Evidence
- **Targeted vitest:** 38 files, 652 tests, all passed. Covered: `src/lib/pdf/`, `filingActions`, `src/components/wizard/`, PATCH, stripe-webhook, `pdfInputs` (the real PATCH and checkout routes), checkout*, `payPathSsnAttachment`, `session`, faxGate, the admin page tests, preflight-sweep and admin v1.
- **`tsc --noEmit`:** exit 0.
- **`next build`** (`MAGIC_LINK_SECRET=x SESSION_SECRET=placeholder-…`): exit 0. It compiled and generated 574/574 pages; the Prisma "DATABASE_URL" lines are the usual local noise.
- **`prisma migrate diff`** (HEAD schema → branch schema) prints exactly the five `ADD COLUMN`s in `20261105120000_rcs_source/migration.sql`.
- **Renders** (PyMuPDF, 110 DPI), in `sys-p0-out/`:
  - `verbatim-p12.png`: RCS 2024 with the verbatim body. "café", “formation service” and the en dash print. The line breaks and the blank-line paragraph are kept. The perjury signature block is unchanged.
  - `seven-p11.png`: the Part V statement with the 7 rows in 4 sections (contributions 4, distribution 1, loan 1, Other 1). The FX sentence reads "92.00 EUR converted to $100.00 at 1.0870 USD per EUR". The total is $9,199.00, with "Form 5472 lines 1f and 1h: $9,199."
  - `seven-p12.png`: the signature block on the continuation page, an existing pagination behaviour.
  - Pre-flight on both packages: 0 failures, including validator A40, A41, A47 and A48.

## Contracts a future editor must respect
- **Cause source:** `rcsSource === "CUSTOMER_VERBATIM"` uses `rcsVerbatimText` only.
  - If that text is empty, the cause is MISSING (DRAFT marker, A32). It never falls back to the admin narrative.
  - The same rule lives in `generatePackage.rcsYearRecord` and `completeness.yearHasReasonableCause`. That function backs both `hasAdminReasonableCauseForFax` and `canReleaseToClient`, so keep the two in step.
- **Verbatim rendering:** verbatim text never goes through `toPdfSafe`. Use `toWinAnsiVerbatim` (pdfText.ts), which never throws; A37 lists what it replaced.
- **Checks that skip verbatim:**
  - A26 and A33 never judge verbatim text; W42 does.
  - Validator A45/W46 skip verbatim years, because they have no generated formation sentence.
- **Snapshot rows:**
  - field `rcsVerbatimSnapshot:<year>`, source `system`;
  - written only by `persistNewPackagePreflight` (when `data.generatedPdfKey` is set) and by a re-run that swaps in new bytes;
  - the field name must never start with `year:`, or every generation would make pre-flight stale.
- **Staff-only year fields:** `rcsVerbatimText`, `rcsVerbatimChosenBy` and `rcsVerbatimChosenAt`. `rcsWhyMissedRaw` and `rcsSource` stay customer-visible.
- **Part V rows** (`FilingYearData.reportableTransactions`) are drafts in the `PartVRow` shape (`src/lib/partV.ts`):
  - `amountCents` is `number | null`;
  - what the customer typed is kept in `*Input`.
  - Customer paths must never return 400 for row content: PATCH, the completeness text check and the wizard submit.
- **Generator input:**
  - A row with no USD amount has `amountMissing: true` and `amountCents: 0`. It prints "MISSING", stays out of every total, and fails A38. A13 no longer double-reports the missing amount.
  - Never default a missing amount to a real $0.
- **FX sentence:** only through `fxSentence()` (finite, positive original; 3-letter non-USD code).
- **Legacy and new data:**
  - New wizard saves never write `ownerPaidCosts`.
  - Legacy costs render as before, and are moved only by the explicit `convertOwnerPaidCosts` action.
- **Distributions sentence:** "I received no distributions…" prints only when the year has Part V rows, no distribution row, and `zeroConfirmations.distributions === true`. An unanswered wizard year saves `{}`.

## Open items
**Owner-gated:**
- The single P0 push, which applies both migrations.
- Before the push, list the PDF_GENERATED orders without approval. Staff must click Re-run pre-flight on each once (see the staff changelog).
- W43 excludes fees paid personally (registered agent $49 is normal). Confirm that reading of P2-9 item 9.
- The "no distributions" sentence is printed only on statements that have Part V rows; a year with no rows already says "There were no reportable transactions". Confirm.
- An embedded Unicode font for verbatim text (fontkit plus a font file) is a possible follow-up to A37.

**Follow-ups:**
- The wizard's step 5 still refuses text that is not PDF-encodable on the client side, which is pre-existing behaviour. With verbatim printing it could warn instead; that needs an owner call under never-block.
- `ownerPaidCosts` and `nonCashTransfers` PATCH validation still return 400 for malformed rows. The wizard no longer writes `ownerPaidCosts`; `nonCashTransfers` is unchanged. Consider making them permissive too.
- W42 also fires on a "?" that replaced an unencodable character. Fixing A37 clears it.
- The iOS v1 action list does not include `convertOwnerPaidCosts`; it is web admin only by omission.

## Lane notes
- No real client data was used. All fixtures are synthetic (F1 and F11 plus inline rows).
- `tsc` output piped through `head` hides its exit code, and one commit was amended for a test-typing fix found that way. Run `npx tsc` bare before committing.

## Ship record (2026-11-03, orchestrator)
- Branch rebased onto origin/main `4cc2304`; SHAs in the table above changed. Final P0 range: `921e6a9..98aacd1` (PR1 `921e6a9`–`d10841d`, PR2 `8df4d2f`, PR3 `0e4f26d`, PR4 `de8beeb` `caec213`, docs `b5b6a20`, review fixes `98aacd1`).
- Full-diff Codex review (high effort): NO SHIP on 2 amount-loss defects + 1 key leak → fixed in `98aacd1` (convert keeps the bare contribution total as its own row; no 500-row cap; `preflightPdfKey` stripped from client JSON). No migration/SQL/backfill/pay-path findings.
- Evidence before push: FULL vitest 191 files / 4,487 tests pass; `tsc` 0; `next build` 0 (574 pages); renders `sys-p0-out/seven-p11.png` (7 rows, $9,199 = 1f/1h, EUR sentence) and `verbatim-p12.png` checked by the orchestrator.
- Deploy-day ops (owner/staff): each order already waiting for review needs one "Re-run pre-flight" click before Release enables; PDF_GENERATED orders lose client PDF access until released (by design). See `docs/staff-changelog-2026-11-system-update.md`.
