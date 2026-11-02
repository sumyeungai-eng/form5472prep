# Plan: system update — review gate, reasonable cause, Part V line items (2026-10-30, rev 2)

- **Source spec:** the owner's `form5472prep-system-update.md` (Task 0, P0 1–4, P1 5–8, P2 9–10). It is not committed verbatim because it contains house-preparer identifiers that belong in the hosting environment only.
- **Basis:** code mapped at origin/main 1881925 (generator 2.3.1).
- **Rev 2:** folds in a read-only Codex review of rev 1. There were 19 findings; I verified the blockers in the code, and all of them are accepted.
- **Status:** **APPROVED 2026-10-30** (owner: "ok work on all") with every recommendation: D1 yes, D2 business days, D3 gate partners, D4 keep, D5 editable+logged, D6 warn/A38, D7 later, D8 option (b), D10 pdfjs-dist, D11 backfill. D9 is an owner action.

## What the mapping changed versus the spec
1. **A release state already exists.** `Filing.reviewApprovedAt/By` is set by an uploaded reviewed PDF and by `approveForSignature`, and cleared on regeneration. Sign, sign API, request-change and partner sign-links already check it.
   - **The holes:**
     - The status exemption `REVIEW_GATE_GRANDFATHERED_STATUSES` is a live bypass, because an admin can move PDF_GENERATED → SIGNATURE_PENDING without review (`admin/mutations.ts:8`).
     - The client PDF route checks ownership only.
     - The serializers expose the key.
     - The upload path accepts an unrun pre-flight.
     - Approval is not tied to a specific PDF version.
     - There is no "In review" screen.
     - There is no web release button.
2. **There is no SLA, due-by date, payment timestamp or payment-event table on `Filing`.** Task 0's "staff due-by" moves to PR 8.
3. **Step-5 text is lost before it reaches the server.** It lives in `FilingYearData.rcsWhyMissed`, and `composeWhyMissed` normalises it *in the browser* on every change (`ReasonableCauseStep.tsx:75`).
4. **The PDF text cleaner `toPdfSafe` strips accents.** It applies NFKD and removes combining marks (`pdfText.ts:30`), so "café" prints as "cafe". Verbatim mode needs its own rendering path.
5. **Line items already exist, but customer capture hard-fails.** The schema requires every field (`schemas.ts:564`), PATCH returns 400 on a bad row, and the transactions UI refuses to submit (`TransactionsReview.tsx:648`). That already conflicts with the never-block-payment rule.
6. **Smaller code facts:**
   - The phone variable is `HOUSE_PREPARER_PHONE`.
   - `HOUSE_PREPARER_IRS_DISCUSS` does not exist.
   - W39's bug is the per-segment scan *and* a predicate that skips `Main Street 5`.
   - P2-9 items 9–10 are new checks.
   - A change-log table, `FilingChangeLog` (`schema.prisma:398`), already exists for snapshots.
7. **IRS checks (Codex, against irs.gov):**
   - Lines 43a–43b are correctly blank for a foreign-owned U.S. DE.
   - Loans belong in Part IV, which the generator hardcodes to 0 (O1).
   - **The IRS still publishes the DIIRSP page.** The spec's premise that it is "no longer a live procedure" is not accurate (O4).

## Shipping model
- **Task 0 ships alone, first.** It is text only, on its own branch, pushed to main after review.
- **P0 is built sequentially on one integration branch, `feat/system-update-p0`.**
  - The commits go in order: PR1 → PR2 → PR3 → PR4. Each has its own tests.
  - The whole set is pushed to `main` in one push, after full tests, `tsc`, `next build`, a Codex review of the combined diff, and my own check of a rendered PDF and the portal.
  - The sequence is needed because `filingActions.ts`, `schema.prisma`, `generatePackage.ts` and `preflight.ts` are shared by all four. Parallel lanes would collide.
  - Migrations are additive (nullable or defaulted, hand-written SQL, never `migrate dev`). `vercel-build` applies them on that single push, so **owner approval comes before the push.**
- **P1 and P2** follow the same model. PR7 (the static panel) can run in parallel because its files are disjoint.
- **Standing rules on every PR:**
  - synthetic fixtures only;
  - emails and faxes mocked;
  - session log plus an `AGENTS.md` note;
  - deploy only with `git push origin main`.

---

## PR 0 — Task 0: express turnaround "under 3 days" (text only)
- **Constant and templates:** in `pricing.ts`, `EXPRESS_TURNAROUND = "under 3 days"`. The 38 templates (13 files) shaped like `within ${EXPRESS_TURNAROUND}` are reworded ("ready to sign in under 3 days").
- **Hard-coded literals:**
  - `landing-pages.ts` (23);
  - `email.ts` order_confirmation (549/551/554/579) and the admin subject at :1205, which becomes `[New order · EXPRESS under 3 days]`;
  - the admin badge at `admin/filings/page.tsx:431-437`;
  - `api/chat/route.ts` (4);
  - `partners/page.tsx:40`;
  - `opengraph-image.tsx:108`;
  - the FAQ;
  - `llms.ts`;
  - `email.test.ts`.
- **Blog:** 108 posts, 118 occurrences, done as a scripted replacement with every changed line reviewed in the diff.
- **Kept, documented exceptions:** the retired-plan label "24-Hour filing (retired plan)" and competitor text in `provider-prices.ts`.
- **Stripe:** only the line-item description text changes (it comes from `tier.subtitle`). No product, price or amount changes.
- **Acceptance:** a grep for `24h|24 h|24 hours|24-hour|1 day|next day` finds no express hits outside the exceptions, and a test checks the new subject. The due-by criterion is delivered in PR 8.

## PR 1 — P0-1: the client sees nothing until staff release it
- **One server-side release predicate,** `canReleaseToClient(filing)` in `filingActions.ts`. It is used by `approveForSignature`, the reviewed-PDF upload (:2172, :2224) and the mobile action API. It requires:
  - pre-flight has *run* on the current data (not null);
  - pre-flight passed, or an override with a reason is recorded;
  - **A32 can never be overridden.** If a late year has no admin narrative and no verbatim text, release is refused. This matches the fax gate.
- **Approval is tied to one PDF version:**
  - New column `Filing.reviewApprovedPdfKey`.
  - Generation writes versioned keys (`{id}_unsigned_{ts}.pdf`) instead of overwriting `{id}_unsigned.pdf`.
  - The release button posts the key the admin reviewed. If that key is no longer current, the server returns 409.
  - The client only ever receives `reviewApprovedPdfKey`, so released bytes never change under them.
- **Remove the status exemption.**
  - A data migration first backfills `reviewApprovedAt = now()`, `reviewApprovedBy = 'legacy-backfill-2026-10'`, and `reviewApprovedPdfKey` = the current key. This applies only to filings *currently* in SIGNATURE_PENDING, SIGNED_UPLOADED, FAXED, CONFIRMED or FAILED that have no approval.
  - Then delete `REVIEW_GATE_GRANDFATHERED_STATUSES` everywhere, so every access requires a release.
- **Server enforcement:**
  - `GET /api/filings/[id]/pdf` (shared by customers and partners) returns 404 unless released, and serves the approved key only.
  - `POST /api/generate-pdf` (client) may regenerate, which clears approval, but returns no key or URL.
  - `toClientFiling` (`session.ts:200`) strips `generatedPdfKey` until release. It is used by both `GET /api/filings` and `GET /api/filings/[id]`.
  - The admin route `/api/admin/filings/[id]/pdf` and the v1 mobile API are unchanged (admin only).
- **Data edits after release** (also applies to PR 3 and PR 4):
  - If the released file is a *generated* PDF and the client has not signed, a staff save that changes package data regenerates the PDF, clears the approval and shows "re-release needed".
  - If the client has already signed, nothing regenerates automatically. A warning says "data changed after signing — regenerate deliberately".
  - If the released file is a *reviewed upload*, staff own it: approval is kept, and a warning says "data changed after reviewed upload".
- **Admin UI:** a "Release generated PDF to client" button that calls `approveForSignature`. It is disabled with the reason shown when the predicate fails.
- **"In review" screen** at `/filings/[id]`:
  - no PDF link and no sign button;
  - an *extended* summary: LLC, owner with address, company address, per-year Part V rows, and the step-5 text as stored. `FilingDetails` today lacks the owner address and the rows, and only summarises the reasonable cause.
  - "Send a correction" uses the existing filing message thread (`api/filings/[id]/messages`), which stays attached to the order.
  - The SSN box stays.
  - `FilingStatusBanner` shows "In review" until release.
- **Emails:**
  - `order_confirmation`: the intro is the spec's sentence, and the stale "view the generated package" lines (:627, :679) are removed.
  - `magic_link`: the copy at :382 is fixed, and the order-time link uses the **existing** `?next=` support in `auth/[token]` with `next=/filings/{id}`. Existing `/filings/{id}/sign` and `#ssn` links keep working; there is no new whitelist.
- **Tests:**
  - the PDF route before and after release, and that the approved key is served;
  - the backfill migration on a fixture;
  - a former-grandfathered status without release is refused;
  - approval with a stale key returns 409;
  - upload with an unrun pre-flight is refused;
  - an A32 failure with an override is refused;
  - both serializers strip the key;
  - `next` regression tests for sign, SSN, `//evil` and absolute URLs;
  - the email copy;
  - a partner on the shared route.
- **Before the push:** list today's PDF_GENERATED orders without approval (the `awaitingReview` filter). Their clients lose PDF access until staff release them.

## PR 2 — P0-2: no filler cause
- **DRAFT marker:** if a late year has neither an admin narrative nor verbatim text, the "2. Cause of the Delinquency" section prints only a red **"DRAFT — cause narrative missing"** marker. A32 stays blocking and cannot be overridden (PR 1).
- **No U.S. income:** `noUsIncomeSentence` moves from under the cause heading to the background section, still conditional on the order data.
- **When a narrative is present:** the narrative, then "I remained unaware…", then the small-corporation paragraph, as today (D4 / O2).
- **Tests:** rewrite `generatePackage.test.ts:844-872` (DRAFT marker plus A32) and `:720-748` (the sentence is not under the cause heading).

## PR 3 — P0-3: "Reasonable cause source" per year
- **Migration** on `FilingYearData`:
  - `rcsSource` (`ADMIN_NARRATIVE` | `CUSTOMER_VERBATIM`, default `ADMIN_NARRATIVE`);
  - `rcsWhyMissedRaw`;
  - `rcsVerbatimText` (staff-editable, logged, D5);
  - `rcsVerbatimChosenBy` and `rcsVerbatimChosenAt`.
- **Raw capture end to end:** `ReasonableCauseStep` keeps the untouched textarea value in state. The wizard payload carries `whyMissedRaw` (`FilingWizard.tsx:592`), PATCH accepts it, it is stored in `rcsWhyMissedRaw`, and the step reopens from it. The normalised `rcsWhyMissed` is still written for existing consumers.
  - **Legacy orders:** `rcsVerbatimText` is pre-filled from raw, then normalised, then the order-level `reasonableCauseNarrative`. The admin UI says "formatting not recoverable (captured before 2026-10-31)" when only the normalised text exists.
- **Verbatim rendering path:**
  - It does **not** use `toPdfSafe`. A WinAnsi-preserving encoder keeps every character Helvetica can encode (é, ü, “ ”, –, …) and replaces only what it cannot encode (for example Thai or Chinese script) with "?". The new blocking **A37** lists those characters.
  - Generation never throws, so payment is safe.
  - Body: trimmed, paragraph and line breaks kept, word-wrapped, flowing across pages. The heading and signature blocks are unchanged.
  - An embedded Unicode font is a possible follow-up; it needs fontkit and a font file.
- **Snapshot:** when a generated artifact is *persisted* (not during in-memory pre-flight previews), append a `FilingChangeLog` row. It records the artifact key, the exact rendered body (after any "?" replacements) and the actor who chose verbatim. Selection changes are logged separately when the admin saves.
- **Privacy:** `rcsVerbatimText`, `rcsVerbatimChosenBy/At` and the snapshot fields are added to the staff-field exclusions in `session.ts:187`. Customers never see staff identity. They do see their own `rcsWhyMissedRaw`.
- **Pre-flight:**
  - A32 passes with verbatim mode and non-empty text.
  - A26 and A33 skip verbatim text.
  - New warning **W42** for a "note to us": `?`, "please", "can you", "your team", an email address or a URL.
  - The fax gate `hasAdminReasonableCauseForFax` accepts verbatim mode.
- **Admin:** a per-year source control, the verbatim text box and a preview label in `EditFieldsCard`.
- **Step 5 (client-facing):** the label becomes "Write your own explanation". The helper reads: "Our team reviews it and may use it word for word in your signed statement." The panel at :228-233 is reworded to match.
- **Tests:**
  - a verbatim fixture where the extracted body equals the stored text after whitespace normalisation, with the heading, signature and A32 checked;
  - "café" and curly quotes survive;
  - Thai characters trigger A37 without a throw;
  - newlines survive from the textarea through PATCH to the database;
  - W42 cases;
  - the snapshot row is written only on persistence;
  - the serializer strips the staff fields.

## PR 4 — P0-4: Part V line items
- **Data contract, in three layers:**
  - **(a) Customer capture is permissive.** A separate draft-row schema lets every field be optional or partial and stores what was typed: `dateInput`, `amountInput`, `originalAmountInput`, `currency`, `paidVia`, `category`, `description`. PATCH never returns 400 for row content, and the `TransactionsReview` submit refusal (:648) becomes a warning.
  - **(b) Generator input is sanitised.** Rows are parsed with decimal-aware parsing. A row with no valid USD amount is kept with `amountMissing: true`. It is **not** defaulted to 0, it is excluded from the totals, and A38 fires.
  - **(c) Staff findings are strict.**
- **Fields:**
  - `paidVia`: `OWNER_PAID_PERSONALLY` | `TRANSFER` | `OTHER`;
  - `currency`: ISO 4217, default USD;
  - original amount and USD amount;
  - a real date, with no forced 12/31.
- **New category `OTHER`.** It is carried through capture, `isReportableCategory` (`transactionsAnswers.ts:350`), `partVRowsForYear` (:521), subtotals and reconciliation.
- **Questionnaire:**
  - the "owner paid personally" checklist (state formation fee, registered agent, mailroom or address, EIN or formation service) seeds contribution rows with `OWNER_PAID_PERSONALLY`;
  - "Initial bank funding" seeds a contribution with `TRANSFER` (O3).
- **Customer warnings** (never blocking):
  - the date is outside the tax year, or before formation;
  - the USD amount is missing;
  - a non-USD row has no currency or original amount;
  - the decimal hint: the input matches `^\d{1,3}[.,]\d{3}$` and is under $100.
  - The paste parser flags the same ambiguous patterns instead of silently parsing them.
- **Staff pre-flight:**
  - **A38:** a row is missing its USD amount (staff-side blocking only).
  - **W43:** a contribution or loan row is under $100 (P2-9 item 9).
  - **W44:** "Part V has only a total — ask the client for line items".
  - **W45:** a non-USD row has a missing, zero or malformed currency or original amount.
- **FX sentence:** printed only when the original amount is finite and positive and the currency is set. Rate = USD ÷ original, 4 decimals. Otherwise there is no sentence and W45 fires, so a NaN or Infinity can never reach the PDF.
- **Reconciliation:** A34 today checks Part V plus the Part VI amounts not already in Part V; Part IV is not implemented (hardcoded 0, see O1). The rule stays: sum the cents, then round once to whole dollars.
- **Legacy owner-paid costs:**
  - New entries are **never** written to the legacy `ownerPaidCosts`; they are always line items.
  - Old orders keep their `ownerPaidCosts`, which render as today (`partVRowsForYear` :528/:547).
  - An admin "Convert to line items" action moves them explicitly. There is no matching by amount.
- **Statement:**
  - one row per item, with a first-person description built from `paidVia`;
  - subtotals, the grand total, and "Form 5472 lines 1f and 1h: $X.";
  - "I received no distributions from <LLC> during tax year YYYY." only when the distribution total is 0 and the step was answered.
- **Admin:** an editable line-item table per year (`ADMIN_EDITABLE_YEAR_FIELDS` and `YEAR_FIELDS`). Changes are logged, pre-flight re-runs, and the PR 1 data-edit rule applies.
- **Tests:**
  - the spec fixture: 7 items including one in EUR gives 7 rows, reconciled 1f/1h and the FX sentence;
  - an `OTHER` item survives save and appears in the statement;
  - a mix of detailed rows, totals-only rows, legacy costs and Part VI overlap is counted once;
  - comma decimals;
  - a missing original amount produces no NaN and W45;
  - incomplete or invalid rows go through save, advance and the **real checkout route** (the never-block rule).

## PR 5 — P1-5: house preparer config
- **The name is optional:** the box is left blank and A35 doesn't fail.
- **Required:** PTIN, firm name, firm EIN, firm address.
- **Phone:** read `HOUSE_PREPARER_FIRM_PHONE`, falling back to `HOUSE_PREPARER_PHONE`.
- **New `HOUSE_PREPARER_IRS_DISCUSS`** (`blank`|`yes`|`no`, default `blank`) is used when the per-order value is unset, and the per-order value wins.
- **Paid preparer choice:** per order, default None. The signature, date and self-employed box stay blank.
- **Tests:** a fit test with synthetic values at least as long as the real ones.
- **Owner action (D9):** set the values in Vercel Production.

## PR 6 — P1-6: W39 false positives
- **Unit scan:** look for a unit label anywhere in the street, in any comma part.
- **Predicate fix:** it must also flag a *trailing* house number, so `Main Street 5` warns. Numbered-road exceptions are kept.
- **Not units:** Thai `Moo|Mu|Moo Ban|Soi|Tambon` and Japanese `chome|-ban|-go`, as whole words.
- **Tests:** each term, the later-unit case, and `Main Street 5` warning.

## PR 7 — P1-7: "Why some lines are blank" panel
- **What:** a static panel in `SignClient.tsx` after the iframe.
- **Copy:**
  - the 1120, 43a–43b and Part IV bullets as the spec has them (43a–43b verified against i5472);
  - **Parts VIII and IX:** describe what they cover and that they are blank because nothing was reported, with no blanket "don't apply" claim (O6).

## PR 8 — P1-8: review queue priority
- **Migration:** `Filing.paidAt DateTime?`, set idempotently on every payment-recognition path:
  - the stripe-webhook;
  - the return-page recognition (`(app)/filings/[id]/page.tsx:75`);
  - linked returns (`linkedReturn.ts:102`), which inherit the parent's `paidAt`;
  - free and promo orders.
  - **Backfill:** the first `FilingChangeLog` status→PAID row where one exists; otherwise null, shown as "—". A Stripe-API backfill would be an owner-run script and is optional.
- **Admin list:**
  - a "Review queue" view sorted **in SQL before LIMIT** (a CASE expression: express, then pre-flight failed, then oldest `paidAt`);
  - a due chip: express = `paidAt` + 72 h, standard = 7 business days (D2);
  - a "Not released" badge.
- **Acceptance (including the item deferred from Task 0):** an express order's due-by is 3 days after payment.

## PR 9 — P2-9: PDF regression tests
- **Coverage:** the spec's 12 checks, at PDF level, using `pdfjs-dist` (already a dependency, used by the admin place-signature page) for text and positions (D10).
- **New checks:** items 9 and 10 (W43, and the LLC designator in all four places).
- **Voice check:** item 12 adds "prepared by" and "entered by customer" to `VOICE_BANS` for statement and cover-letter text, exempting a verbatim RCS body.

## PR 10 — P2-10: DIIRSP wording
- **Client-facing app text:** `pricing.ts:62`, the chat prompt (6), `api/ask` (1) and the contact page/form (3) are reworded to "late filing with a reasonable-cause statement".
- **Admin label:** becomes "Late filing: Yes". `isDiirsp` stays.
- **Marketing (about 280 lines, the `/diirsp` page, 9 posts):** the spec says "no client-facing text", which includes these. That is option (a) in D8.

## Staff changelog (deliverable)
`docs/staff-changelog-2026-11-system-update.md` ships with P0. It covers:
- the release button and why it may be disabled;
- re-release after edits;
- the In review screen;
- the reasonable cause source control;
- the Part V table and "Convert to line items";
- the new codes A37/A38 and W42–W45.

---

## Owner decisions needed
- **D1 — Task 0 reverses your 2026-10-28 change.** That change made Express $199 "ready to sign within 24 hours". The spec makes it "under 3 days" at the same $199. Confirm before I touch 108 posts.
- **D2 — Standard target:** 7 business days (matches "5–7 business days"; recommended) or 7 calendar days.
- **D3 — Partners share the client PDF route,** so they are gated too unless exempted. Recommended: gate. The alternative is to let form-preparation-only partners see the generated PDF immediately.
- **D4 — RCS with a narrative:** keep "I remained unaware…" and the small-corporation paragraph after it (recommended; no tax-content change), or drop them.
- **D5 — Verbatim text:** staff may edit it, logged and snapshotted (recommended), or it is locked to the customer's exact text.
- **D6 — Part V and the never-block rule:** customer capture becomes permissive. This also removes today's hard submit refusal on incomplete rows. Staff get blocking A38. Recommended.
- **D7 — Loans (O1):** keep the current Part V handling now and decide the Part IV treatment separately.
- **D8 — DIIRSP in marketing:**
  - (a) follow the spec: remove it from all client-facing text, including about 280 marketing lines and 9 posts, and 301 `/diirsp` to the late-filing page (SEO cost);
  - (b) amend the spec: keep accurate marketing mentions (the IRS still publishes the DIIRSP page, see O4) and remove it only from the app, chat, emails and admin.
  - I lean towards (b) because the spec's premise is not accurate, but it is your call.
- **D9 — Set the `HOUSE_PREPARER_*` values in Vercel.** Owner only; I never type government identifiers.
- **D10 — Test extraction:** `pdfjs-dist` in node (recommended) or PyMuPDF in CI.
- **D11 — Backfill (new):** the PR 1 release backfill for orders already past PDF_GENERATED. Recommended. Without it, those clients lose access to packages they are mid-way through signing.

## IRS-content observations (listed, not changed)
- **O1 — Loans:** owner↔LLC loans are typed as Part V rows while Part IV is hardcoded to 0. i5472 reports amounts borrowed and loaned (balances) in Part IV. This needs a tax decision.
- **O2 — Canned cause wording:** "I remained unaware…" and the small-corporation paragraph are generator-written assertions that may not match an admin narrative.
- **O3 — Initial bank funding:** it is a transfer into the LLC account, not a cost "paid personally". It is still a contribution.
- **O4 — DIIRSP:** the IRS still publishes the DIIRSP page. Since Nov 2020, penalties may be assessed, and a reasonable-cause statement *may* be attached. Avoid saying "required" or promising relief.
- **O5 — Exchange rates:** no rate source is enforced. A possible follow-up is a warning when the implied rate is more than 10% off the IRS yearly average.
- **O6 — Parts VIII–IX copy:** describe them as "nothing reported", not "doesn't apply to you".
