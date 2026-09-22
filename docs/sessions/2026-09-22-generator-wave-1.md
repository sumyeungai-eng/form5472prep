# 2026-09-22 — Form 5472 generator fixes, wave 1 (live)

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`. Work branch `fix/generator-review-defects`, merged
to `main` as `bef9fcc` ("Merge wave 1 ..."). Plan of record: `docs/TASK-5472-generator-fixes.md`
(section 10 "Amendments" overrides the rest). Audit: `docs/generator-audit.md`. IRS sources:
`docs/reviews/5472-irs-rule-citations.md`. Not touched: `content/blog/**`, untracked `src/lib/wizard/`
(unrelated HK-tax code from another project, left in place), `public/email/*`.

## What shipped (commits c59c808, bd8f76b, 3df3f71; merge bef9fcc)
- **G-01** Form 5472 line 2 ticked. **G-02** lines 43a/43b never written (i5472 p.7: a foreign-owned
  U.S. DE does not complete them). **G-04** Form 1120 tax-year header filled every year (fields
  `PgHeader[0].f1_1..f1_3` existed but were never mapped). **G-06** line 1o from new nullable
  `Filing.llcCountryBusiness`, default "United States", never an owner field (reviewer warning W16 when
  defaulted). **G-08** 1f/1h computed server-side from Part V rows, cents summed, rounded once.
- **C-01** extension gate: injectable clock; due dates roll past weekends AND legal holidays per
  26 USC 7503 (includes District of Columbia holidays, so Emancipation Day); a plain "Yes, I filed
  Form 7004" is accepted everywhere (date, method, destination, proof optional); an optional date after
  the original due date still invalidates it (T7); a final short year ending 30 June that began before
  2026 with an extension is UNRESOLVED (7-month exception, i7004 p.1). Tests T1-T7 pass as written.
- **C-03** cover letter: exact phrase "pro forma Form 1120 with Form 5472 attached" in Re line and
  body, no timeliness/lateness/DIIRSP wording, IRS address block, date = `finalisedAt`, singular/plural
  tax years. The "FOREIGN-OWNED U.S. DE - DIIRSP" stamp on the IRS forms themselves is unchanged
  (amendment 4, pending Sum's decision).
- **R-01** "Sole Member" placed inside the measured Title column (was clipped to "Sole Membe").
  **R-03** flatten throws; zero widgets asserted. **S-01** PDF metadata: generator version + commit.
- **V-00/V-01** fixtures F1-F7 (`src/lib/pdf/__fixtures__/filings.ts`, synthetic only) and
  `runPreflight` (`src/lib/pdf/preflight.ts`): A01 A02 A03 A06 A07 A09 A10 A12 A16 A22 A23 A24 A25 A28
  A30. Runs after every generation; results stored on Filing (`preflightStatus`, `preflightFailures`,
  `preflightWarnings`, `preflightCheckedAt`, `generatorVersion`, `generatorCommit`).
- **Gates:** a failed package cannot be sent for signature (`uploadReviewedPdf`) or faxed (manual fax
  route, admin retry, Telnyx auto-retry) unless an admin clicks "Approve despite pre-flight failures",
  which records `preflightOverrideBy/At`; regeneration clears it. `regeneratePdf` now refuses
  SIGNED_UPLOADED / FAXED / CONFIRMED filings. The admin API now records the real admin id.
- Config: `src/config/filingPackage.ts` (signature heading "Signed under penalties of perjury:", title
  "Sole Member", IRS fax and address, enclosure phrase, 300 DPI, GENERATOR_VERSION 2.0.0).

Verified: tsc clean; vitest 593/593; clean production build; rendered F2/F5 pages inspected by hand
(line 2/3 ticked, 43a/b blank, 1o United States with owner in Hong Kong, header dates, title unclipped,
cover letter). Independent pre-merge review: 6 findings, all fixed before merge. Deploy: migrations
`20260922090000_filing_preflight` and `20260922120000_preflight_override` applied; live wizard renders
with no console errors; `/api/generate-pdf` refuses unknown filings (404).

## Contracts
- The pre-flight check is the release gate. Do not remove a gate; add assertions instead. A false
  failure is fixed in the assertion, never by bypassing the gate in code.
- Never regenerate a signed or faxed package. `regeneratePdf` enforces it; keep it that way.
- Line 1o never reads owner fields. Lines 43a/43b are never written.
- All authored-document wording comes from `src/config/filingPackage.ts`.
- Tax rules come from section 5 of the task file and the IRS citations file; do not change them from
  memory.

## Open
Owner-gated (Sum): keep or drop the "DIIRSP" stamp on the IRS forms; whether a reviewer override should
also require a written reason.
Follow-ups (next waves, re-sequenced from the audit): wave 2 = G-03 activity-code list + picker, G-05
form revision by year, G-10 multi-party block, G-12 remaining literals, R-02 address fit, R-04 Part V
layout, V-02 render test, more assertions (A05 A08 A17-A21 A27). Wave 3 = questionnaire fields that
unlock logic (Q-03 Q-04 Q-05 Q-06 Q-07 Q-08 Q-10 Q-13) with G-07 G-09 C-04 C-05 C-06 C-07. Wave 4 =
remaining questionnaire. Wave 5 = CI (S-02), S-03 hardening, S-04 sweep, S-05 rules doc.
Known: `/api/generate-pdf` returns 500 on an empty body (pre-existing, reads the body before auth;
harmless). F2's fixture year (2026) cannot be filed until 2027; move fixtures to TY2025 in wave 2.

## Lane notes
Two lane wrappers reported "scope violations" that were the other parallel lane's authorised files,
and a "moved directory" that had not moved. Check mtimes and the brief before reacting. Codex runs
launched through the tool's background flag die when the wrapper ends its turn: use nohup + disown and
poll inside the turn.

---

# Wave 2 (live, merge 338f159)

Commits f55cdc5 (G-03), 191cec1 (wave 2 forms/layout/render), 7842a85 (override reason), 41ed4e1
(review fixes). Deploy applied `20260922150000_preflight_override_reason`.

- **G-03** Activity codes: `src/lib/irsCodes/pba-{2023,2024,2025}.json` extracted programmatically from the
  IRS i1120 PDFs by `scripts/extract_pba_codes.py` (405 codes each; the three lists are identical).
  Searchable picker in the wizard entity step; the filings PATCH route rejects off-list codes; admin page
  warns on stored off-list codes (never remapped). All 37 `BUSINESS_ACTIVITIES` presets now carry list
  codes (many carried NAICS codes not on the list, e.g. 541611 for management consulting, now 541600):
  the likely root cause of a recurring reviewer correction. A05 checks 1e/8d.
- **G-05** Form 1120 revision per tax year, 2018-2025, field maps probed per revision (2018 splits item D
  into dollars and cents; 2019 nests the address block under Headpage1; 2022 moves TypeOrPrintBox under
  Page1; 2025 is a different structure). Short-year exception recorded. A08.
- **G-10** `NeedsReviewError` for more than one related party; returns 1 until wave 3 stores a member
  count. **G-12** remaining literals in config (a test greps for them). **R-02** one print address per
  package, shrink to 6.5pt, abbreviate once, else fail (R02); name/street/city lines share one size.
  **R-04** Part V wraps and repeats the header per page. A18 A19 (ITIN-only owners with no reference ID
  pass) A20 A21 A27.
- **V-02** `npm run test:render` (developer machines/CI only): 300 DPI raster, two text engines, checkbox
  ink, fixtures F1-F8 (F8 = tax years 2018/2019).
- Overrides need a written reason (>=10 chars), shown with admin and time; every generation path
  (regenerate, resend confirmation, customer generate-pdf, Stripe webhook) clears any earlier override.

Verified: tsc; vitest 639/639; render 8/8; clean build; renders of 2018/2019/2022 Form 1120 inspected;
independent review (3 findings, all fixed; the fourth, list year mismatch, is moot because the lists are
identical). The picker was driven in a real browser against a production build (typing, arrow keys,
Enter, preset autofill to 541600) with no client errors; the live draft was not touched.

Open after wave 2: Form 5472 revision for older tax years (every year prints on the Rev. 12-2023 form;
the plan scopes revision-matching to Form 1120 only) is a question for Sum's reviewer. `/api/generate-pdf`
500 on an empty body (pre-existing).

---

# Wave 3 (live, merge 3511cff)

Commits cad9f33 (schema), c9ea5be (questionnaire), 8d3c39c (generator), dc34f37 (review fixes). Deploy
applied `20260923090000_wave3_questionnaire` (Filing: llcMemberCount, ownerHasFtin, ownerNoPostalCode,
llcAddressIsRegisteredAgentOnly, priorForm5472Filed, hasUsSourceIncome, usTaxWithheld; FilingYearData:
nonCashTransfers, rcsWhyMissed, rcsWhenLearned, rcsNoIrsNoticeConfirmed; all nullable).

- Questions: Q-03 FTIN yes/no (ITIN pattern rejected, reference ID generated once), Q-04 structured owner
  address (state and postal required unless "no postal codes"), Q-05 registered-agent-only address, Q-06
  prior Form 5472, Q-07 U.S.-source income and withholding, Q-08 per-year non-cash transfers, Q-10 LLC
  country of business, Q-13 per late year why missed / when learned / no IRS notice. Eligibility
  multi-member answer stored as llcMemberCount.
- Generator: `src/lib/pdf/packageInput.ts` is the ONE mapper from a Prisma filing to generator input, used
  by the Stripe webhook, checkout, generate-pdf and filingActions. G-07 1j, section 5.5 owner address when
  the U.S. address is agent-only, G-09 Part VI box and statement (value counted once), C-04 reasonable
  cause from the client's own per-year answers, C-05 one statement per late year after that year's forms,
  C-06 heading everywhere, G-10 multi-member routes to review. A11 A13 A14 A15 A24 A26.
- Review caught three P0s before merge, all fixed: late filers were blocked at checkout (gate still
  required the legacy narrative); a later per-year save wiped the reasonable-cause answers; owners with no
  FTIN could not pay. Also fixed: the reasonable cause statement no longer asserts "dormant" / "no
  customers" (only what the data supports, signed under penalties of perjury); owner address no longer
  printed twice; older orders get warnings (W15 W15b W17 W18 W26), not failures, for questions that did
  not exist when they ordered.
- Verified: tsc; vitest 677/677; render 8/8; clean build; new questions driven in a local production
  preview (ITIN rejected, postal required, radios are fieldsets with legends and visible labels); live
  wizard loads with no console errors.

## Contracts added in wave 3
- Never assert a fact in a reasonable cause statement that is not a questionnaire answer or derivable from
  the customer's data. It is signed under penalties of perjury.
- Per-year saves only overwrite keys present in the payload.
- New assertions must WARN, not fail, when the question did not exist for an older order.
- Add a generator input field in `packageInput.ts`, never in a caller.

## Open after wave 3
- Admins cannot yet edit the per-year fields (rcs answers, non-cash transfers) from the admin page.
- Reference ID is stored per filing, so a returning customer gets a new one next year (section 5.2 wants
  one per owner forever): needs an owner-level store.
- Form 5472 revision for older tax years (question for Sum's reviewer).
- Remaining: wave 4 (Q-01 owner-paid costs, Q-02 explicit zeros, Q-09, Q-11 EIN checks, Q-12, Q-14
  tax-year list from the clock, C-07 customer-copy sweep) and wave 5 (CI, S-03 hardening, S-04 open-order
  sweep, S-05 rules doc).

---

# Waves 4-5 and review before signature (live, merge 8ea773a)

Migrations applied: `20260924090000_wave4_owner_costs` (FilingYearData ownerPaidCosts, zeroConfirmations),
`20260924120000_review_before_signature` (Filing reviewApprovedAt, reviewApprovedBy).

- **Owner request (2026-09-22): customer flow is generate -> qualified accountant reviews (may message
  questions) -> customer signs -> we fax.** Customers can sign only after an admin clicks "Approve for
  signature" (needs a passed or overridden pre-flight; uploading a reviewed PDF also approves). Gate is
  enforced in the sign API, the sign page, and partner sign-link / send-sign-link; SIGNATURE_PENDING and
  later are grandfathered. Every package-generation path clears the approval. Customer gets a "ready to
  sign" email; a send failure is reported to the admin. Portal shows four steps (Generate your forms /
  Accountant review / Sign digitally / We fax to the IRS). Admin list shows "Awaiting review".
- Wave 4: Q-01 owner-paid costs -> Part V contribution rows; Q-02 explicit "None this year" per category
  (W02 for older orders); loans to/from owner as Part V sections; Q-11 EIN checks; Q-14 selectable years
  from the formation year (not before 2018) via an injectable clock; reference ID reused only when owner
  name AND FTIN (or address) match; a draft for a different owner never inherits identity fields.
- C-07: no DIIRSP/delinquent in customer screens or emails; late wording only when a year is live-late.
- S-02 CI: `.github/workflows/ci.yml` (typecheck, vitest, render test that fails if skipped, lint).
- S-03/S-04: admins edit every wave 3-4 field incl. per-year answers; `/api/admin/preflight-sweep` is
  read-only and reports open packages' pre-flight results.
- A04: lines 37, 39, 40a, 41a, 42a, 42b answered; 38a and 38c left blank unless line 37 is Yes.

## LIVE REGRESSION FOUND IN REVIEW (fixed by this merge; affected orders need a human)
From the wave-1 deploy (2026-09-21 21:12 UTC) until this merge, lines 1f/1h were computed only from Part V
rows. Orders whose year data held contribution/distribution TOTALS without rows printed 1f = 0 and an
empty Part V statement, and pre-flight passed. The sweep button now lists "Possible zero-total packages
since 21 September" (including signed and faxed filings, read-only). Action for Sum: run it, regenerate
unsigned ones, and decide on corrections for any that were faxed.

## Deploy-day action
Orders in PDF_GENERATED at deploy time had no approval and now show "Awaiting review"; a reviewer must
approve them before customers can sign.

## Open
- CI has not yet been observed running on GitHub (gh CLI not authenticated here); check the Actions tab.
- Form 5472 revision for tax years before 2023 (question for Sum's reviewer).
- A29 render check runs in CI only by design.
