# Blog GEO/AEO audit — ad-slug batch (2026-08-19)

Scope: 9 posts from `docs/reviews/live-slugs-ad`, audited per `docs/reviews/blog-geo-aeo-audit-brief.md` + its 2026-08-19 addendum (19 scored lines, 0-2 each, max 38). Source of truth for content = working-tree `content/blog/<slug>.md`. Live site (`https://www.form5472prep.com`) used only to check that link targets return 200.

## Executive summary

| Slug | Score |
|---|---|
| how-to-fax-form-5472-irs | 37/38 |
| texas-llc-foreign-owner-tax-filing | 37/38 |
| wyoming-llc-foreign-owner-tax-filing | 37/38 |
| how-to-fill-out-form-5472 | 36/38 |
| multi-member-llc-form-5472-or-1065 | 36/38 |
| pro-forma-form-1120-foreign-owned-llc | 34/38 |
| what-is-form-5472 | 31/38 |
| stripe-paypal-wise-form-5472 | 30/38 |
| form-5472-uk-residents-us-llc | 24/38 |

**Totals: P0 = 7, P1 = 20, P2 = 6** (33 findings total).

**Methodology notes:**
- Six of the seven P0s are the same defect repeated across files: internal links to four sibling posts (`form-5472-recordkeeping-checklist`, `form-5472-ftin-reference-id-foreign-address`, `multiple-related-parties-form-5472`, `itin-required-form-5472`) that exist locally but 404 live because their frontmatter carries a future `publishAt` (2026-08-31 through 2026-09-21) — they simply haven't been deployed/scheduled yet. Confirmed via `curl` against `https://www.form5472prep.com` and by reading each target's frontmatter.
- The seventh P0 is a genuinely wrong regulation citation (`form-5472-uk-residents-us-llc.md:45`), confirmed via direct lookup of 26 CFR §1.6038A-2 vs §1.6038A-4.
- `comptroller.texas.gov` and `star.comptroller.texas.gov` are DNS-blocked from this machine (confirmed: `curl` returns `000`/timeout). Per the addendum, Texas Comptroller figures are reported as "unverifiable here," not "broken" — I independently corroborated the load-bearing numbers ($2.65M no-tax-due threshold, PIR-still-required rule, 0.75%/0.375% franchise rates, $20M E-Z Computation ceiling) via WebSearch against independent secondary sources instead.
- All other IRS primary-source claims (fax number, 300 DPI, mailing address, e-file prohibition, $25,000 penalty/IRC §6038A(d), line 3/1f/1h language, Part V language, Form 1120 item B/E scope, Form 5472 Part IV line numbers 17/21/31/32/35, Form 8804 37%/21% withholding rates, FinCEN's 26 Mar 2025 BOI exemption) were verified against live IRS/FinCEN pages via WebFetch/WebSearch and check out exactly as stated in the posts.
- All 9 slugs have `public/blog/<slug>.webp` present and an `ARTWORK_ALTS` entry in `src/lib/blog.ts` — line 16 passes cleanly for every post and is not repeated below.
- Pricing ($149 Standard/5-7 business days, $199 Express/3 business days, +$99/additional year, fax included, EIN $149) matches `src/lib/pricing.ts` and `src/lib/llms.ts` exactly in every post that states it — no wrong prices found anywhere in this batch.

---

## how-to-fax-form-5472-irs — score 37/38

The most tightly fact-checked post in the batch: every IRS quote (fax number, 300 DPI, mailing address, e-file prohibition, Form 7004 same-destination rule) matches the live instructions verbatim.

- **P0 (broken link):** `how-to-fax-form-5472-irs.md:88` — `[Form 5472 recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` returns 404 on `https://www.form5472prep.com/blog/form-5472-recordkeeping-checklist` (target's frontmatter has `publishAt: "2026-09-07T09:00:00-04:00"`, not yet deployed). **Fix:** remove the link or hold it until the target post publishes; don't link to a page that 404s for a live reader today.
- **P1:** none material.
- **P2:** none beyond the P0 above.

## texas-llc-foreign-owner-tax-filing — score 37/38

Strongest structural post (tables + numbered workflow + 4 worked scenarios, all internal links 200, external links diversified across 2 domains).

- **P0:** none.
- **P1:** `texas-llc-foreign-owner-tax-filing.md:15, 34, 36, 44, 46` — every non-IRS external citation points to `comptroller.texas.gov` or `star.comptroller.texas.gov`, the exact domain family confirmed DNS-blocked from this audit machine. The cited figures ($2.65M threshold, PIR-still-required rule, 0.75%/0.375% rates) check out via independent secondary sources (BPM, Beancount.io, Reedcorp, Freeman Law), but the post itself has no secondary/backup citation for any Texas-specific figure. **Fix (robustness, not correctness):** consider adding one non-Comptroller anchor citation (e.g. a national CPA-network explainer) alongside the primary Comptroller links, so the post isn't 100% dependent on one domain resolving.
- **P2:** none beyond the above.

## wyoming-llc-foreign-owner-tax-filing — score 37/38

Best proprietary angle in the set (the "formation-agent package doesn't cover Form 5472" narrative) and the only post where I could independently corroborate the state-fee formula across five-plus secondary sources.

- **P0:** none.
- **P1:** `wyoming-llc-foreign-owner-tax-filing.md:42` — text reads "Confirm the current amount on the Wyoming Secretary of State's own site before you file rather than relying on any third-party summary, including this one," but no link to that site is given anywhere in the post (every other cited authority — IRS, FinCEN, Federal Register — does get a direct link). My own fetch of `https://sos.wyo.gov/Business/AnnualReports.aspx` 404'd, so the $60/$0.0002-per-dollar figures are corroborated here only via secondary sources, not a primary page reachable in this audit. **Fix:** add a direct hyperlink to the current Wyoming SOS annual-report/license-tax page.
- **P2:** `wyoming-llc-foreign-owner-tax-filing.md:11` — opening bold answer is ~80 words, above the brief's 40-60-word "quotable" target. **Fix:** split into two shorter sentences.

## how-to-fill-out-form-5472 — score 36/38

The most technically detailed post; Part IV line numbers (17/21/31/32/35), line 3/1f/1h language, and the pro forma 1120 scope all verified word-for-word against the live IRS instructions.

- **P0 (broken links):**
  - `how-to-fill-out-form-5472.md:28` — `[FTIN and reference ID guide](/blog/form-5472-ftin-reference-id-foreign-address)` returns 404 live (`publishAt: "2026-09-14T09:00:00-04:00"`). **Fix:** hold the link until that post is deployed.
  - `how-to-fill-out-form-5472.md:75` — `[multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472)` returns 404 live (`publishAt: "2026-09-21T09:00:00-04:00"`). **Fix:** same.
  - `how-to-fill-out-form-5472.md:89` — `[do I need an ITIN for Form 5472](/blog/itin-required-form-5472)` returns 404 live (`publishAt: "2026-08-31T09:00:00-04:00"`). **Fix:** same.
- **P1:** `how-to-fill-out-form-5472.md:11` (and the whole first ~62 lines / 30% of the 206-line post) — the opening direct-answer paragraph and everything through Part I contain no sourced numeric stat; the first hard figure ($25,000) doesn't appear until line 142. **Fix:** work "$25,000 penalty under IRC §6038A(d)" into the line-11 answer or the "documents you need" section (lines 19-31).
- **P2:** `how-to-fill-out-form-5472.md:142` — the phrase `"constitutes a failure to file Form 5472"` is presented as a direct IRS-instructions quote; my WebFetch pass of the current i5472 instructions did not independently surface this exact sentence (it returned the closely related "substantially incomplete" and $25,000 penalty language, but not this precise clause verbatim). **Fix:** re-verify the exact wording against the live instructions PDF before treating it as a confirmed direct quote, or soften from a quoted clause to a paraphrase.

## multi-member-llc-form-5472-or-1065 — score 36/38

Section 1446 withholding rates (37% individual / 21% corporate) verified exactly against the live IRS Instructions for Form 8804.

- **P0 (broken link):** `multi-member-llc-form-5472-or-1065.md:75` — `[multiple related parties guide](/blog/multiple-related-parties-form-5472)` returns 404 live (`publishAt: "2026-09-21T09:00:00-04:00"`). **Fix:** hold the link until that post is deployed.
- **P1:** `multi-member-llc-form-5472-or-1065.md:11` (and the first ~43 lines / 30% of the 142-line post) — no sourced numeric stat appears before the 30% mark; the 37%/21% withholding figures (line 53) and the $25,000 penalty (line 77) both land after it. **Fix:** pull one figure into the opening paragraph.
- **P2:** none material.

## pro-forma-form-1120-foreign-owned-llc — score 34/38

Item B/E scope, "name and address plus items B and E" language, and the line-3/Part-II language all verified exactly against the live IRS instructions and the Form 1120 instructions.

- **P0 (broken link):** `pro-forma-form-1120-foreign-owned-llc.md:184` — `[whether an ITIN is needed](/blog/itin-required-form-5472)` returns 404 live (`publishAt: "2026-08-31T09:00:00-04:00"`). **Fix:** hold the link until that post is deployed.
- **P1:**
  - Whole post (~2,200 words, lines 11-184) — the $25,000 IRC §6038A(d) penalty is never mentioned anywhere in this post, even though the topic is the exact filing package whose failure risk drives the site's conversion pitch everywhere else. **Fix:** add one sentence citing the $25,000 penalty, e.g. in the intro (lines 11-13) or the "Why does a disregarded LLC use Form 1120?" section (lines 17-23).
  - `pro-forma-form-1120-foreign-owned-llc.md:15, 21, 71, 84, 101` — the identical URL `https://www.irs.gov/instructions/i5472` is cited five separate times with no other authoritative source worked in (only `i1120` at line 48 varies it). **Fix:** vary at least one citation, e.g. to eCFR §1.6038A-1, to avoid reading as one repeated link standing in for real source diversity.
- **P2:** none additional.

## what-is-form-5472 — score 31/38

Solid definitional/pillar post but the only one in the batch with **no `/start` link anywhere** — a real conversion-structure gap.

- **P0:** none.
- **P1:**
  - Whole post (169 lines... actually 122 lines) — no internal link to `/start` or any tracked conversion target anywhere in the post; the only internal link at all is a bare `[Form5472 Prep does](/)` at line 120. **Fix:** add an early `/start` link in the "30-second version" section (lines 17-23) and change the line-120 link to `/start?utm_source=blog&utm_medium=internal&utm_campaign=what-is-form-5472` to match every sibling post's convention.
  - Whole post — zero links to any other `/blog/` post, failing "≥1 link to a related post." **Fix:** add a link to `/blog/how-to-fill-out-form-5472` or `/blog/form-5472-deadline-2026` in the "What's next" section (lines 116-120).
  - `what-is-form-5472.md:11` — only one external authoritative link in the entire post (`irs.gov/forms-pubs/about-form-5472`); the brief wants 2-4. **Fix:** add a direct link to `https://www.irs.gov/instructions/i5472` near the $25,000 penalty claim (line 65) and/or the fax-number claim (lines 96-98).
  - `what-is-form-5472.md:112-114` — "A US CPA typically charges $400–$800" has no named source. **Fix:** attribute the range or drop the specific dollar figures.
- **P2:** `what-is-form-5472.md:11` — opening bold answer is ~70 words, above the 40-60-word target. **Fix:** trim to two tighter sentences.

## stripe-paypal-wise-form-5472 — score 30/38

Lowest word count in the batch and the only post whose lede breaks the site's bolded-direct-answer convention.

- **P0:** none.
- **P1:**
  - Whole post — 852 words, below the addendum's ≥1,200-word bar for narrow how-to/topic posts. **Fix:** expand with a worked numeric reconciliation example or a documentation/recordkeeping section.
  - Whole post — zero links to any `/blog/` post (only three `/start` links, lines 16, 62, 84), failing "≥1 link to a related post." **Fix:** add a link to `/blog/form-5472-currency-conversion-exchange-rates` or `/blog/form-5472-reportable-transactions-examples`.
  - `stripe-paypal-wise-form-5472.md:12` — body text `**Last updated: July 2026**` conflicts with frontmatter `date: 2026-08-03` / `updated: 2026-08-03` (August, not July). **Fix:** update the in-body line to August 2026, or delete it since frontmatter `updated` already covers this.
  - `stripe-paypal-wise-form-5472.md:14` — the direct-answer opening paragraph is plain text, not bolded, unlike the equivalent lede in all 8 other posts in this set (compare e.g. `what-is-form-5472.md:11`, `wyoming-llc-foreign-owner-tax-filing.md:11`). **Fix:** wrap line 14 in `**...**` to match site convention and aid AEO/answer-box extraction.
- **P2:** general voice — heavier reliance on hedging ("generally," "usually," "may") than sibling posts gives a slightly more clinical register than e.g. `what-is-form-5472.md`. No specific line fix required; note for a voice-consistency pass if one is planned.

## form-5472-uk-residents-us-llc — score 24/38

Weakest post in the batch: one confirmed wrong regulation citation plus a cluster of conversion-structure and integrity issues.

- **P0 (wrong fact):** `form-5472-uk-residents-us-llc.md:45` — "Reportable transactions are defined in **26 CFR §1.6038A-4**..." is the wrong regulation. §1.6038A-4 is titled "Monetary penalty" (the regulatory basis for the $25,000 penalty, confirmed via eCFR); the definition of "reportable transaction" is in **26 CFR §1.6038A-2(b)(3)-(4)**. **Fix:** change "§1.6038A-4" to "§1.6038A-2".
- **P1:**
  - Lines 1-51 (first 30% of the 169-line post) — no internal link to `/start` or any conversion target anywhere in the first screen; the only internal links in the entire post are `/diirsp` at line 105 and `/start` at line 115, both past the halfway point. **Fix:** add an early `/start` link in the "Does this apply to you?" section (lines 29-40).
  - Whole post — no link to any other `/blog/` post at all, failing "≥1 link to a related post." **Fix:** add a link to `/blog/what-is-form-5472` or `/blog/form-5472-filed-late-never-filed`.
  - `form-5472-uk-residents-us-llc.md:109-115` — the primary `/start` CTA sits at roughly the 65% mark of the post, with two more full sections (BOI, lines 119-129; UK tax, lines 131-139) and the FAQ still to come after it; the actual close (lines 163-169) has no CTA, only a disclaimer. **Fix:** add a second `/start` CTA after the FAQ, at the true close.
  - `form-5472-uk-residents-us-llc.md:5` vs. `:127` vs. `:165` — frontmatter `updated: 2026-08-14` conflicts with two in-body notes: "*This post reflects the status as of May 2026*" (line 127) and "*Last reviewed: May 2026*" (line 165) — stale editorial notes left over from before the August refresh. **Fix:** update both in-body notes to August 2026 or remove them.
  - `form-5472-uk-residents-us-llc.md:143-145` and `:151-153` — two FAQ answers run to roughly 70 words each, well over the ≤50-word target (compare the 4-word-tighter answers in e.g. `wyoming-llc-foreign-owner-tax-filing.md`). **Fix:** tighten each to one or two short sentences.
  - Whole post — only 2 external links total (line 127 `fincen.gov/boi`, line 169 `irs.gov/instructions/i5472`), and neither sits near the (incorrect) reportable-transactions claim at line 45. **Fix:** add a direct external citation next to the reportable-transactions claim once the citation itself is corrected per the P0 above.
- **P2:**
  - Whole post — uses `---` horizontal-rule section dividers throughout (lines 17, 27, 41, 63, 80, 93, 107, 117, 129, 139, 163, 167), a formatting convention none of the other 8 posts in this set use. **Fix:** drop the dividers to match sibling-post style, or confirm this is an older template intentionally left as-is.
  - `form-5472-uk-residents-us-llc.md:113` — "Plans from $149 — IRS fax delivery included" states only the Standard price and omits the $199 Express tier and +$99/year detail that every other post in the set states explicitly. **Fix:** align with the sibling posts' fuller pricing statement (not wrong, just less complete than the rest of the batch).

---

## Three worst findings (for the 5-line summary)

1. `form-5472-uk-residents-us-llc.md:45` cites the wrong regulation for "reportable transactions" — §1.6038A-4 (actually the $25,000 monetary-penalty rule) instead of §1.6038A-2.
2. Six internal links across four posts (`how-to-fax-form-5472-irs.md:88`, `how-to-fill-out-form-5472.md:28/75/89`, `multi-member-llc-form-5472-or-1065.md:75`, `pro-forma-form-1120-foreign-owned-llc.md:184`) point to sibling posts that exist locally but 404 live because their `publishAt` dates are still in the future (Aug 31 – Sep 21, 2026).
3. `form-5472-uk-residents-us-llc.md` and `what-is-form-5472.md` both lack an early `/start` conversion link and any related-post link — the UK post's only CTA sits at the 65% mark with no CTA at the actual close, and `what-is-form-5472.md` has no `/start` link anywhere in the post at all.
