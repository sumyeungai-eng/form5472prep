# Review: Whole Website (form5472prep.com) — 2026-07-25

## Verdict
Reviewed the entire site — HEAD `60df5fd`, plus the live production deployment — with three independent reviewers (two fresh-context Opus tracks + Codex/GPT-5, a different model family), every finding re-verified by me against disk or the live site. **The server core is genuinely well-built** (uniform ownership checks, server-side pricing, Stripe signature + idempotency, admin fail-closed auth) — no confirmed IDOR, no client price manipulation. But there is **one live security fail-open, a cluster of tax-correctness issues (two of them introduced by this session's own work), and substantial stale two-tier marketing.** Counts: **1 Critical, 6 Major, 12 Minor, 10 Improvements.** Recommendation: fix the Critical (Telnyx) and the two-part transactions-toggle Major before anything else; the rest is prioritizable at your discretion. **Nothing has been changed — this is the gated plan.**

## What was tested and how
Reviewers: Fable (self + 2 fresh-context Opus subagents, dimensions: server/security and product/consistency) + Codex `codex-cli 0.144.1` (read-only sandbox, `codex exec -s read-only`).
Commands / checks run:
- `npx tsc --noEmit` → **0 errors**.
- `npm test` (vitest) → **10 passed / 1 file** (only `src/lib/bank/categorize.test.ts` — no money/auth/webhook/PDF tests).
- `npm run lint` available; build previously green this session.
- Live smoke (curl): `/ /pricing /start /blog /terms /sitemap.xml /robots.txt /llms.txt` → 200; **`/faq` → 404, `/refund-policy` → 404** (not linked from home/pricing — not dead links, just non-existent paths); `/admin/filings` no-cookie → **307 → /admin/login** (gated, good); `/api/cron/march-reminder` no-auth → **401**; `/api/filings/<not-mine>` → 404.
- Vercel prod env inventory: **`TELNYX_PUBLIC_KEY` NOT set**; `SESSION_SECRET`, `CRON_SECRET`, `ADMIN_SESSION_SECRET` **set**; `R2_PUBLIC_BASE_URL` **NOT set**.
- Disk verification of every Critical/Major claim (file:line below).

## Findings

### [C1][X] Critical — Telnyx fax webhook is fail-open in production (and a latent header bug will break it once closed)
- What: `TELNYX_PUBLIC_KEY` is unset in prod, and `verifyTelnyxSignature` accepts the request when the key is absent (`src/app/api/telnyx-webhook/route.ts:33-42`). So **anyone who can reach the webhook and knows/guesses a fax job id can forge "delivered" or "failed" fax events**, flip filing status, trigger retries, and cause customer-facing delivery/failure emails. Separately, when you *do* set the key, the code reads the wrong header names — `telnyx-signature-ed25519-signature` / `-ed25519-timestamp` (lines 44-45) — whereas Telnyx sends `telnyx-signature-ed25519` / `telnyx-timestamp`, so **every legitimate fax event would then be rejected** and filings would hang with no confirmation.
- Evidence: `src/app/api/telnyx-webhook/route.ts:33-45`; prod env has no `TELNYX_PUBLIC_KEY`. Header-name mismatch verified in code; Telnyx's documented header names are a Codex claim (their webhook docs) I could not independently fetch — treat the *fix* as "set the key AND correct the header names together, then send a test event."
- Why it matters: fax delivery confirmation is the product's proof-of-filing; a forgeable/blocked webhook undermines the core deliverable and customer trust. This is the one live security defect.

### [M1][F+X] Major — The new one-click "no reportable transactions" toggle over-zeroes and can produce incomplete/incorrect IRS filings
- What: The toggle (added this session) sets `totalAssetsYearEnd`, `contributions`, `distributions` all to 0 for every year (`src/components/wizard/TransactionsReview.tsx:437-448`). Two problems: (a) it sits directly above the "Did you fund the LLC when forming it?" warning (`:582-587`) that says formation capital contributions **are** reportable in Part V — first-year filers are the majority and most funded formation, so the tempting one-click path silently omits a required Part V item; (b) **year-end total assets is a balance-sheet figure independent of related-party transactions** — an LLC can have $0 reportable transactions but a real bank balance — yet the toggle zeroes it, and that zero lands on the pro forma 1120 (`src/lib/pdf/generatePackage.ts:139,242`).
- Evidence: verified in `TransactionsReview.tsx` (toggle handler + adjacency of lines 541 vs 582) and `generatePackage.ts:139,242` (totalAssets written to `1c_totalAssets`/`D_totalAssets`).
- Why it matters: produces exactly the incomplete/inaccurate 5472/1120 the whole service exists to prevent — the $25k-penalty scenario. This is a regression from this session's own work; fix first among the Majors.

### [M2][X] Major — Checkout can be completed with missing transaction/year data (silent zeros)
- What: the checkout completeness gate validates only entity/owner/year-*scope* schemas (`src/app/api/checkout/route.ts:35-39`); it never requires a `FilingYearData` row per year or a completed reasonable-cause step. The sidebar allows jumping straight to Review, so a user can pay $199 and receive forms where missing figures are treated as `0`.
- Evidence: `src/app/api/checkout/route.ts:25-53`; `generatePackage.ts` uses `yd?.contributions ?? 0` etc.
- Why it matters: a paid customer can get a filing they never actually completed, with silent zeros on the tax form.

### [M3][X] Major — Every filing is classified DIIRSP (delinquent), including timely ones
- What: `isDiirsp = years.length > 1 || years[0] < new Date().getFullYear()` (`src/app/api/filings/[id]/route.ts:130`). Because the year picker caps at last-completed year (`schemas.ts:73`), a single-year filing is **always** `year < currentYear` → always DIIRSP → always attaches a reasonable-cause ("we filed late") statement. A customer filing the prior tax year *within* its normal deadline is timely, but the package would represent them as delinquent to the IRS.
- Evidence: `src/app/api/filings/[id]/route.ts:130`; `src/lib/schemas.ts:71-79`.
- Why it matters: most real customers here *are* late (so it's usually harmless), but for on-time filers it attaches a false delinquency admission. Correctness should key on the filing *deadline*, not `year < currentYear`.

### [M4][X] Major — Wizard PATCH is not atomic
- What: `bindFilingToEmail` (ownership) runs at line 52 before field validation; `prisma.filing.update` (tier/taxYears/amountPaid/isDiirsp) commits at line 133 before the per-year `yearData` loop that can still `return 400`. No `prisma.$transaction` wrapper.
- Evidence: `src/app/api/filings/[id]/route.ts:51-53, 133-175`.
- Why it matters: a request that ultimately 400s can leave ownership/pricing/years mutated but year rows not written — partial, inconsistent state.

### [M5][X] Major — No automated tests on money, auth, webhook, or PDF paths
- What: vitest is configured but the only test file covers bank categorization. Nothing tests checkout pricing, Stripe/Telnyx webhooks, ownership/IDOR, admin/magic-link auth, cron guards, DIIRSP/PDF-year selection, or PATCH integrity.
- Evidence: `package.json:11-12`; only `src/lib/bank/categorize.test.ts` exists (10 tests).
- Why it matters: regressions in charging, access control, or IRS-form data can ship with a green suite (as this very review shows the suite wouldn't have caught C1–M4).

### [M6][F] Major — Stale two-tier ("Rush"/"Priority") marketing survives the single-$199 collapse
- What: `/pro-form-5472` (live noindex paid-ad landing page) still sells a "Priority plan" — same-day fax, WhatsApp line, queue-jump ahead of "standard" filings, "Priority pricing" (`src/lib/landing-pages.ts:2009,2030,2048`) — service levels the flat $199 product no longer delivers. Plus `public/llms.txt:54` still says the pricing page is a "three-tier comparison" (the AEO feed AI engines quote), UAE page `:1041` "Priority-tier customers", Delaware page `:841` "$199 (Standard)".
- Evidence: verified at the cited lines. (I flagged `/pro-form-5472` to you last turn; it's still open.)
- Why it matters: paid ad-traffic is promised a service level they won't receive; AI answer engines will state "three tiers."

### Minor (all verified against disk unless marked)
- **[m1][X]** Form-revision hygiene: only `f1120--2024.pdf` / `f1120--2025.pdf` stocked and a single `f5472.pdf`; pre-2024 tax years get the 2024 1120 revision (`generatePackage.ts:869,886`). The code comment (866-868) acknowledges the concern. Low practical impact for a pro forma, real for strict correctness.
- **[m2][F]** `POST /api/partner/apply` has **no rate limit** (`src/app/api/partner/apply/route.ts:16`) — every other public POST rate-limits; email-bomb / DB-pollution vector.
- **[m3][F]** `unsubscribeToken` uses non-constant-time `!==` (`src/lib/unsubscribeToken.ts:29`) — every other token file uses `timingSafeEqual`.
- **[m4][F+X]** Magic links are **reusable for 7 days** (signature + expiry only, no single-use/nonce) (`src/lib/magicLink.ts:26-43`) — a forwarded/logged link keeps working until expiry.
- **[m5][F]** No security headers: `next.config.mjs` is empty (no `Referrer-Policy`, `X-Content-Type-Options`, CSP). `Referrer-Policy` matters here because magic-link tokens and filing ids appear in URLs. (HSTS is Vercel-provided.)
- **[m6][F]** `storage.publicUrl()` has a public-bucket branch that returns unsigned predictable URLs to signed PDFs *if* `R2_PUBLIC_BASE_URL` is set (`src/lib/storage.ts:88-89`). **Verified dormant** — the var is unset in prod, so the 15-min presigned path always runs. Latent footgun; delete the branch.
- **[m7][X, needs-confirm]** Confirmation email reportedly says the *accountant* signs the forms while the system embeds the *customer's* captured signature (`src/lib/email.ts:363-375` vs `place-signature`). Plausible contradiction — not yet line-verified by me.
- **[m8][X]** Wizard/email copy references a retired "AI compliance check" that no longer runs (`src/components/wizard-v3/Sidebar.tsx:83-94`).
- **[m9][X, needs-confirm]** Privacy page promises statements/transactions/PDFs are discarded, but code persists them and stores **Plaid access tokens in plaintext** (`prisma/schema.prisma:265` — Plaid plaintext verified; "no deletion implemented" not yet verified).
- **[m10][X, needs-confirm]** "Money-back if we fail to submit" may be a manual process, not implemented as an automatic refund on terminal fax failure.
- **[m11][F]** Dead code / stale comments: `isPremiumSource`, `tierForYearCount` (`src/lib/pricing.ts:150-157`), and comments referencing removed AI/validate-filing flows.
- **[m12][X, needs-confirm]** Partner-created filings may rely on the anonymous session cookie for continued access (`getOwnedFiling` keys on user/session, not `partnerId`) — a partner could lose access from another browser.

### Improvements (feature additions you asked for — NOT defects)
- **[I1]** Social proof: no testimonials/reviews/`aggregateRating` schema anywhere — the single highest-leverage conversion add for skeptical international buyers paying $199 upfront.
- **[I2]** Non-card payments: checkout is `payment_method_types:["card"]` only (`checkout/route.ts:230`) — add Stripe Link, Apple/Google Pay, PayPal for a 100% international audience.
- **[I3]** Localization (DE/ES/PT) — geo landing pages exist but the wizard/checkout are English-only.
- **[I4]** One-click annual re-file: reuse prior verified entity/owner data + next year — turns the reminder infra into a retention loop.
- **[I5]** Order-status timeline (Paid → Signed → Reviewed → Faxed → Receipt) with timestamps — cuts "where's my filing?" support load.
- **[I6]** EIN cross-sell: preflight sends no-EIN users to irs.gov instead of your own `/ein` ($149) service — revenue miss + self-contradiction.
- **[I7]** Live-chat human handoff from the AI chat for pre-purchase questions.
- **[I8]** Customer referral / returning-customer credit (retention for a yearly obligation).
- **[I9]** Permanent redacted filing archive for the customer's own records (PDFs currently purged).
- **[I10]** Partner batch filing + consolidated billing.

## Disagreements (settled by evidence)
- Telnyx: Track A said "fails closed when the key is set"; Codex said "fails open when key missing" + wrong headers. **Both true** — A described the key-set path, Codex the prod reality (key unset). Settled: C1 above.
- Codex rated form-revision, fail-open cron/session secrets, and R2 public-URL as Critical. Disk-verified as **Minor/dormant**: `SESSION_SECRET`/`CRON_SECRET`/no-`R2_PUBLIC_BASE_URL` mean those fallbacks never trigger in prod. Only Telnyx's fail-open is live.

## Fix plan — NOT EXECUTED, pending approval
### Step 1 — Close the Telnyx webhook (fixes C1)
- Action: in `src/app/api/telnyx-webhook/route.ts`, correct header names to `telnyx-signature-ed25519` / `telnyx-timestamp`; make verification **fail closed** when `TELNYX_PUBLIC_KEY` is unset in production (mirror `admin/auth.ts`'s prod check). Then set `TELNYX_PUBLIC_KEY` in Vercel prod and send one Telnyx test event.
- Verify by: test event returns 200 and updates a test filing; an unsigned/forged POST returns 401. Confirm real fax still confirms end-to-end on a $0 test filing.
- Risk & rollback: if the key/headers are wrong, fax confirmations stop — verify with a test event before relying on it; revert the commit to restore current behavior.

### Step 2 — Fix the no-transactions toggle (fixes M1)
- Action: in `TransactionsReview.tsx`, (a) do NOT zero `totalAssetsYearEnd` on the toggle — keep it a separate required field (or ask "does the LLC hold any assets at year end?"); (b) add a formation-year interlock: when a selected `taxYear === year(llcDateIncorporated)`, require explicit confirmation of the formation capital contribution before the "none" path completes.
- Verify by: manual wizard run for a formation-year filing — toggle cannot silently zero a funded first year; a dormant later year still one-clicks.
- Risk & rollback: pure client logic; revert the component commit.

### Step 3 — Enforce completeness at checkout (fixes M2)
- Action: extend the `checkout/route.ts` completeness gate to require a `FilingYearData` row per `taxYear` (and RCS narrative when `isDiirsp`), returning 400 otherwise.
- Verify by: attempt to checkout a filing with a year missing its data → 400; complete filing → 200.
- Risk & rollback: could block a legitimately-empty year — allow the `noReportableTransactions` attestation to satisfy it. Revert route commit.

### Step 4 — Correct DIIRSP classification (fixes M3)
- Action: compute `isDiirsp` from whether the filing is past its actual IRS deadline (year + due date) rather than `year < currentYear`; keep multi-year → DIIRSP.
- Verify by: a prior-tax-year filing within its deadline window is NOT DIIRSP and shows no RCS step; a genuinely late one is.
- Risk & rollback: tax-logic change — confirm the deadline rule with the owner first; revert route commit.

### Step 5 — Make PATCH atomic (fixes M4)
- Action: wrap field-validate → filing.update → yearData upserts in `prisma.$transaction`; move `bindFilingToEmail` after validation.
- Verify by: send a PATCH with valid fields + one invalid year row → 400 AND no field mutation persisted.
- Risk & rollback: revert route commit.

### Step 6 — Clear stale two-tier marketing (fixes M6)
- Action: rewrite `/pro-form-5472` (`landing-pages.ts` ~1996-2057) to the single $199 all-inclusive service (drop Priority/same-day/WhatsApp/queue-jump); fix `llms.txt:54` "three-tier"; UAE `:1041` and Delaware `:841` residue; and site-wide "plans"/"every plan" phrasing.
- Verify by: `grep -riE 'priority|three-tier|rush|\(standard\)' src content public` returns only legacy-DB display mappings.
- Risk & rollback: copy-only; revert commit. (This is ad copy on a running Google Ads campaign — confirm before editing.)

### Step 7 — Minors & hardening (fixes m1–m12, batched)
- Action: rate-limit `partner/apply`; `timingSafeEqual` in `unsubscribeToken`; single-use magic links (or shorter TTL); add `Referrer-Policy`/`X-Content-Type-Options` in `next.config.mjs`; delete the `publicUrl` public-bucket branch; encrypt Plaid tokens or drop the field while Plaid is hidden; reconcile privacy/refund/AI-check/signer copy with reality; remove dead pricing shims. Each independently revertable.
- Verify by: per-item check (curl rate-limit, header present, grep copy).

### Step 8 — Tests & features (fixes M5 + Improvements) — separate sessions
- Action: add vitest coverage for pricing math, checkout gate, webhook signature/idempotency, ownership, DIIRSP/PDF-year selection. Then prioritize Improvements I1–I10 (social proof + non-card payments + annual re-file are the top ROI).
- Verify by: `npm test` covers the money/auth paths; features shipped per their own specs.

## Approval request
Reply: **"approve"** (all) / **"approve 1,2"** (partial, by step number) / describe changes / **"reject"**.
