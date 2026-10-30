# 2026-10-30 — Money pages: PTIN statement, white-label reconciliation, Form 7004 answers

Plan: `docs/seo/plan-2026-10-30-improvement.md` items **P0-4, P0-5, P0-6, P1-1**.
Evidence used: `docs/seo/moz-data-2026-10-30/page-audit/{summary.md,pages.tsv}`,
`moz-data-2026-10-30/ai-visibility-and-research.md` (ChatGPT #38), `moz-data-2026-10-26/rankings.tsv`.

## Ownership

| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/svcx`, branch `seo/svcx-2026-10-30` (cut from `origin/main` @ `a1d9c6d`) | `src/lib/services-pages.ts` (+test), `src/lib/llms.ts` (+test), new `src/lib/form7004-answers.ts` (+test), `src/app/(marketing)/form-7004-extension/page.tsx` (+ new `page.test.tsx`), `partners/page.tsx`, `partners/PartnerApplyForm.tsx`, `ein/page.tsx`, `itin/page.tsx`, `pricing/page.tsx`, `compare/page.tsx`, this log |

Not touched (other lanes): `landing-pages.ts`, marketing `layout.tsx`, `faq.ts`, blog files, home page.
Not pushed, not deployed — the architect merges.

## What changed

- **P0-4 PTIN statement.** Every service page now says "a tax accountant who holds an IRS PTIN" in its
  visible body (wording swap from "PTIN-holding tax accountant"; FAQ long form became
  "…IRS PTIN (Preparer Tax Identification Number)"). Same on the `/services` hub capsule, `/partners`
  hero, `/compare` FAQ. **/ein, /itin, /form-7004-extension** get a brand-named sentence that is true:
  the PTIN review belongs to the Form 5472 filing service; EIN = we prepare SS-4 and apply by fax/phone;
  ITIN = an IRS-authorized CAA certifies the documents; 7004 = our team prepares and faxes it from the
  order (no PTIN review is claimed for these — none is documented in code or the 7004 spec).
  Hard-coded `$149/$199/$99/$349` on /partners, /ein, /itin replaced by `pricing.ts` constants.
- **P0-5 white-label vs partner.** Contradiction: `/services/white-label-form-5472-filing` said client
  emails go out *under the partner's brand* (per-partner, on request), while `/partners` said *clients
  receive email from Form5472 Prep* with white-label "on request". Both were wrong after the partner
  white-label Phase 1 deploy (`a1d9c6d`, Vercel `dpl_3rGPeuN89jQLEAciafavoo6ifded` READY 2026-10-30;
  probes `/api/partner/brand` and `/api/filings/x/client-finished` 404 → 405). One offer now, matching
  `src/lib/partner/clientMail.ts` + `src/app/partner/PartnerBrandCard.tsx`: every partner filing is
  white-label; we never email a partner's client; the partner copies intake/sign links and sends them;
  filing emails go to the partner; the partner pays per filing and the client sees no prices; the name
  the partner sets appears in the client's intake and on the IRS fax receipt; client pages currently open
  on form5472prep.com (portal domain is off). Applied to the white-label, accountants and bookkeepers
  service pages, `/partners` (FAQ, step 3, hero), the apply-form hint, and the llms.txt Partners line.
  Also removed "no Form 7004 extensions" from the partner "not" lists (it is a separate order now).
- **P0-6 Form 7004.** `src/lib/form7004-answers.ts` holds four question/answer capsules (≤60 words,
  irs.gov sources: i7004, i5472, i1120 — verified 2026-10-30: "No signature is required on this form",
  "does not extend the time to pay any tax due", due by the regular due date, 15th day of 4th month,
  "Foreign-owned U.S. DE" marking, fax/mail to the Ogden PIN Unit). They render as question H2s on
  `/form-7004-extension`, feed its FAQPage (capsules + the remaining 5 FAQs = exactly the visible Q&As;
  3 duplicate FAQs removed) and are appended to llms.txt "Quick answers".
- **P1-1 money pages.** 7 service pages already had the phrase at title start, in H1, first sentence and a
  120–160-char meta (now enforced: meta ≥120 test). Changed: `/compare` meta + first paragraph now start
  "Compare Form 5472 filing services"; `/form-7004-extension` first paragraph now contains
  "Form 7004 extension"; `/pricing` meta trimmed 166 → 150 chars. **No title or H1 changed** — none
  needed it (the two top-10 phrases, "form 5472 preparer" #4 and "hire someone…" #7, rank on
  `/do-i-need-to-file-form-5472`, not on the intended page; "compare…" #6 ranks on a blog post).

## Evidence
- `npx vitest run` services-pages, service-links, llms, landing-prices, cp-notice-guard, faq,
  form7004-answers → 7 files, 1032 passed; sitemap, robots, about/content, applications checkout → 17
  passed; `form-7004-extension/page.test.tsx` → 5 passed (JSON-LD parses; FAQPage ⊆ visible Q&As).
- Throwaway render of /pricing, /partners, /ein, /itin, /compare, /services, the white-label page: every
  JSON-LD block parses; the exact PTIN phrase and "Form5472 Prep" are in each page's main markup.
- `npx tsc --noEmit` clean; `npx next lint --file` on all 14 touched files: no warnings. No `next build`.

## Contracts
1. `services-pages.test.ts` now also requires on every service page: the exact phrase
   "tax accountant who holds an IRS PTIN" in the body, meta ≥120 chars, and none of
   "white-label delivery / branded email / under your brand name / reply-to address".
2. Partner copy must match what `clientMail.ts` does. When `NEXT_PUBLIC_PARTNER_PORTAL_HOST` is set,
   update "client pages currently open on form5472prep.com" (white-label page ×3, /partners FAQ).
3. Never claim a PTIN review of EIN, ITIN or Form 7004 work unless the owner confirms one happens.
4. Form 7004 answers live only in `form7004-answers.ts`; page, FAQPage and llms.txt read it.

## Open
**Owner-gated**
- Does the PTIN-holding accountant review EIN/ITIN/7004 work? If yes, those pages can say so.
- Moz page-grader run on the 9 money pages (uses query credits).

**Follow-ups (other lanes' files)**
- Blog posts still sell the retired "white-label delivery" option (contradicts the live partner flow):
  `content/blog/form-5472-white-label-vs-standard-partner.md`, `white-label-form-5472-filing-accounting-firms.md`,
  `form-5472-partner-program-how-it-works.md`, `form-5472-partner-program-registered-agents.md`,
  `form-5472-partner-program-company-formation-agents.md`, `offer-form-5472-filing-as-a-service.md`.
- Link `/form-7004-extension` from the deadline and extension posts (plan P0-6, blog lane).

## Lane notes
- The orchestrator brief said the white-label portal was "built but not shipped"; by this lane the
  Phase 1 code (guard, copy-link dashboard, price hiding, name card) was on `main` and live with the
  portal domain off. Copy was written to the deployed behaviour, which is also what this branch contains.
- rtk truncates long grep output; use `rtk proxy grep` when you need every line.
