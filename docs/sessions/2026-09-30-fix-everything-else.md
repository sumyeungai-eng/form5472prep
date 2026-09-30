# 2026-09-30 — "Fix everything else" + payment page redesign

Plan: `docs/plans/2026-09-30-fix-everything-else.md`. Integration branch `feat/fix-all`
(`~/Developer/f5472-wt/fix-all`) merged lanes fixw-fax, fixw-deadline, fixw-pay, fixw-copy,
fixw-blog; coordinator fixes committed directly on it.

## What shipped
- **Payment page** (Review & pay step): extracted to `src/components/wizard/review/**`, two-column
  layout with sticky order summary, "Pay $X securely", trust row, included-features list from
  `pricing.ts`. Pricing/checkout code moved verbatim; test asserts the Pay amount equals what
  `/api/checkout` charges (standard/express/legacy/test tier, 1–3 years, promo). Also fixed a live
  bug: the reasonable-cause row read only the legacy narrative, so every late filer saw "missing";
  it now summarises per-year answers.
- **Re-fax guard** (`refaxDecision` in `src/lib/admin/filingActions.ts`): re-fax of FAXED/CONFIRMED/
  job-bearing filings needs force + reason ≥10 chars (FilingChangeLog `faxRefaxOverride` written
  before sending); refused while a `retrying_N` claim is <15 min old; admin send claims the filing
  (`retrying_0`) first. `POST /api/fax` deleted (no callers). Stuck-claim alert covers claims with no
  fax job; Telnyx 5xx/network errors are "ambiguous" (keep claim, alert), only 4xx releases.
  Fax-receipt route uses `getFilingAccess`. Independent review: ship.
- **Deadline June rule** (`src/lib/form1120DueDate.ts`, shared by `schemas.ts` + compliance
  calendar): a year ending in June that began before 2026 is due the 15th of the 3rd month, 7-month
  extension; calendar years provably unchanged. Independent review: ship.
- **Copy**: homepage How it works = 6 real steps incl. accountant review (HowTo JSON-LD in sync);
  removed "documents a CPA would prepare" + stale "AI compliance check"; ComparisonTable explains
  DIIRSP; fax receipt now "proof of when the package reached the IRS" (was "proof of on-time filing"
  — wrong for late filers) on receipt PDF, email, pricing, portal, llms.txt, payment page;
  one reasonable-cause statement PER late year (three pages said one comprehensive statement);
  removed "high acceptance rate" / "generally sufficient to waive" claims; dissolved-LLC FAQs mention
  the June rule.
- **Checkout USD only**: `adaptive_pricing: { enabled: false }` in `createBrandedSession` (both
  branded + fallback), idempotency keys `checkout_v3_` / `appcheckout_v3_`.
- **Zero-total sweep**: bounded to the bad window (21 Sep 21:12Z – 22 Sep 10:48Z). Analysis: no
  filing has a current package from the window; nothing to regenerate.
- **Blog**: 5 new posts (small-corporation reasonable cause; compliance calendar 2027; state
  annual-report late fees; family members as related parties; IRS "official" exchange rate), each
  linking a new tool, fact-checked before commit.
- Evidence: vitest 1374+ green, tsc 0, production build 0; payment page browser-checked at 375px and
  1280px (no horizontal scroll, Pay $248.00 for 2 years standard).

## Contracts
- Never change the money path in `review/ReviewStep.tsx` without keeping the checkout-equality test.
- Re-fax needs force+reason; don't add another fax-submit route.
- Fax receipt wording: evidence of WHEN it reached the IRS, never "proof of on-time filing".

## Open (owner-gated)
- Legal entity name/address; rotate SESSION_SECRET; RESEND_WEBHOOK_SECRET; TELNYX_PUBLIC_KEY; GSC
  indexing; accountant review backlog.
- Form 5472 revision for 2018–2020 (keep Dec 2023 for 2021+; no paid filings before 2023) —
  accountant's call. Optional: look at the reviewer-uploaded faxed PDF for cmu627irv0001lb04uszplxhx
  (line 1f should read 41,504).
- `extensionUnclear` still only defers June 30 (not any June day) to review — conservative.
