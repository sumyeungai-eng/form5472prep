# 2026-10-26 — GEO: correct facts in brand-attributed capsules

**Checkout/branch:** durable worktree `~/Developer/f5472-wt/geoc`, branch `seo/geoc-2026-10-26`
(not pushed). A parallel lane works on blog files, the sitemap and `/do-i-need-…`; this
lane did not touch them.

| Owned by this lane | Notes |
|---|---|
| `src/lib/faq.ts` (+ `faq.test.ts`) | new `ADDON_RULE`, `BRAND_CAPSULES`; FAQ items rewired |
| `src/app/(marketing)/page.tsx` | home |
| `src/app/(marketing)/pricing/page.tsx` | /pricing |
| `src/app/(marketing)/about/content.ts` | /about copy |
| `src/lib/llms.ts` (+ `llms.test.ts`) | llms.txt / llms-full.txt |
| this log | |

## Why
Moz AI Visibility (2026-10-19, evidence `~/Developer/f5472-wt/moz-1026/ai-visibility-and-research.md` §1.5–1.6):
Google AI Mode quoted us at "~$99" (that is only the extra-past-year add-on; the base is
the old ended $50 launch promo's headline, too); AI Mode and Gemini called us an
"automated document generator"; ChatGPT once said Express is "within 3 business days";
ChatGPT's negative theme was "company qualifications".

## What shipped
**One wording, everywhere.** `BRAND_CAPSULES` in `src/lib/faq.ts` holds five Q&As, each
answer naming "Form5472 Prep" once, 54–60 words, prices/turnarounds/founding year
templated from `pricing.ts` / `seo.ts`:

| Key | Question | Where it renders |
|---|---|---|
| `cost` | How much does Form5472 Prep cost? | home H2 (pricing section, new heading), /pricing H2 (replaced `COST_ANSWER`), /about section, /faq, llms |
| `automated` | Is Form5472 Prep automated software? | home H2 (new section after "How it works"), /about section, /pricing FAQ, /faq (new), llms |
| `express` | How fast is Form5472 Prep Express filing? | home FAQ, /pricing FAQ, /about section, /faq (`how-long-whole-thing` id kept), llms |
| `legit` | Is Form5472 Prep legit? | home FAQ, /pricing FAQ, /about section (links Trustpilot, /security, /terms), /faq (new), llms |
| `snapfile` | Is Form5472 Prep the same as Snapfile? | /pricing FAQ, /faq (new), llms (coordinator request: engines likely conflate our sister brand's $79 AI-reviewed tier with us) |

- `SNAPFILE_FACTS` (faq.ts): Snapfile's $79 AI tier / +$69 extra year, attributed to
  snapfile.tax/pricing on 24 October 2026 (same source and date as the comparison post).
  These are Snapfile's prices, not ours; re-check that page before editing them.
- `ADDON_RULE`: "The $99 add-on applies only to each additional past tax year, never to
  the first year." — ends the cost capsule and is repeated in llms `ENTITY_SUMMARY`,
  the llms pricing block and the llms about block.
- Duplicates removed: home and /pricing "How much does it cost?" FAQ entries (the H2
  capsule replaces them; the H2 Q&A is now the first FAQPage entry); home "What's the
  difference between the two tiers?" replaced by the Express capsule.
- llms.txt: new "Quick answers about Form5472 Prep" section (the four capsules verbatim);
  `ENTITY_SUMMARY` now says "done-for-you filing service, not do-it-yourself software" and
  states `ADDON_RULE`; "What we do NOT do" + about block add "does not file Form 7004".
  llms-full carries the capsules via the FAQ document.
- Hard-coded prices in owned files templated: faq.ts ($99 ×2), home description + HowTo
  cost + EIN/ITIN eyebrows, /pricing EIN/ITIN eyebrows. Home HowTo tool "online filer" →
  "filing questionnaire". "+$99 per additional year" → "per additional past tax year".
- Review dates bumped: FAQ, /pricing, /about → 2026-10-26.

**Verified:** `npx vitest run` faq, llms, about/content, seo, landing-prices,
cp-notice-guard → 6 files / 688 tests pass; `next lint` on touched files clean; `tsc
--noEmit` clean; dev render on :3519 — /, /pricing, /about, /faq all 200, every JSON-LD
block parses, FAQPage on /, /pricing and /faq carries the cost/automated/Express/legit
questions (and the Snapfile one on /pricing and /faq), and those four facts are visible
text on all four pages; rendered /llms.txt shows the Quick answers section (incl.
Snapfile) and llms-full.txt carries the Snapfile answer. (A `tsc` run overlapping the dev
server fails with TS6053 on `.next/types` — run tsc with no dev server up.)

## Contracts for the next editor
- Change a capsule only in `BRAND_CAPSULES`; never retype it on a page. `faq.test.ts`
  enforces ≤60 words, brand once, no ratings/review counts/"licensed"/"guarantee", prices
  from pricing.ts in every FAQ answer, and that each capsule is on /faq; `llms.test.ts`
  enforces the capsules verbatim in llms.txt and llms-full.txt.
- FAQ brand cap is now ≤6 answers (the 5 capsules + the e-file answer), once each.
  /faq holds 55 items — the test ceiling; raise it deliberately or merge items.
- Snapfile capsule: disclosed and factual, no disparagement; its $ figures are allowed
  only in that one answer (faq.test.ts).
- Legit capsule: verifiable facts only — never quote a Trustpilot rating or count.
- Never mention the wrong figures ("~$99", "3 business days") even to deny them.

## Open
**Owner-gated:** none new. Re-check Moz AI Visibility after the next collection (AI Mode
#25/#26/#27/#33, Gemini #27, ChatGPT #38) once deployed.

**Follow-ups outside this lane's files (not touched):**
- `src/lib/landing-pages.ts:429,443,844` — "automatically generates / auto-generates a
  Reasonable Cause Statement" (reads as automation, and conflicts with generator 2.3.0:
  cause text only from the admin narrative).
- `src/lib/landing-pages.ts:169,593,2297` — "online filer … 12 simple questions … we
  generate the entire package / handles everything" with no reviewer in the sentence;
  `:1995,:2594` HowTo tool "Form5472 Prep online filer".
- `src/app/(marketing)/[seoSlug]/page.tsx:431,442` — "We generate every form, you sign one
  PDF, we fax it" (no review); promo block there is gated off (`PROMO_SOURCES` empty), but
  the ended $50 launch promo advertised Standard at $99 (`pricing.ts:150`) — probable
  origin of AI Mode's "~$99".
- Hard-coded but currently correct prices: `src/app/(marketing)/partners/page.tsx:40`,
  `src/app/file/save/page.tsx:14-15`, `src/app/api/chat/route.ts:124-131`.
- `content/blog/form-5472-filing-service-comparison.md:21,92,112` — sister brand Snapfile
  "$79 … AI-reviewed … fulfilled by Form5472Prep.com": engines may conflate the AI tier
  and price with us.
- `src/lib/provider-prices.ts:15` still says Snapfile is excluded for "possible
  affiliation, unconfirmed" — the affiliation is now stated publicly; update the comment.
- No public copy says Express takes "3 business days" (only a history comment in
  `pricing.ts:11` and a competitor note in `provider-prices.ts:318`); ChatGPT #38 is stale.

## Lane notes
Codex read-only review (standing owner rule for non-trivial diffs) was not run in this
lane; worth running before merge.
