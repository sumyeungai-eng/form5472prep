# Batch 4 audit — B (fact-priority pass, 2026-08-30)

Scope: 5 working-tree posts, not yet deployed. Scored against docs/reviews/blog-geo-aeo-audit-brief.md (19 lines incl. addendum, /38) + legal-facts block in docs/reviews/new-posts-batch-3-spec.md. All facts checked live against irs.gov, google/youtube, kdp.amazon.com, airbnb.com, etsy.com (curl 200 + WebFetch content match) — see per-post notes.

---

## form-8832-election-foreign-owned-llc — score 37/38
- P0: none.
- P1: none.
- P2 (polish):
  - Line 94, "How does Form 8832 change the Form 5472 package?": states a corporation can e-file Form 5472 as an attachment to an e-filed Form 1120 — true and a useful contrast to the DE no-e-file rule, but the post never explicitly flags this as the *exception* to the "cannot e-file" rule stated for disregarded entities at line 107. A reader skimming could momentarily read the two statements as conflicting. Fix: add one clause at line 94, e.g. "(unlike the disregarded-entity pro forma package, which cannot be e-filed — see below)".
  - Fact check: 75-day retroactive window (lines 53, 57, 77, 152) and 60-month re-election limit with newly-formed-entity exception (lines 63–69, 156) — direct WebFetch of the current f8832.pdf returned corrupted/unreadable binary from this environment, so I could not pull an exact primary-source quote. Cross-checked via WebSearch against multiple independent tax-preparer summaries (Paychex, 1800Accountant, OnPay, etc.) that all state the identical 75-day / 12-month / 60-month / newly-formed-entity-exception rules, matching the post's wording precisely, including the late-election-relief caveat the post correctly declines to promise (line 59: "Ask an adviser whether a specific late-election relief procedure is available"). Treat as verified-by-strong-corroboration, not primary-source-quoted; flagging per audit-brief instruction ("flag if stated but unverifiable [directly]") even though no discrepancy was found.
  - Line 96: "Treasury Regulation §1.6038A-2" — correct citation for the Part IV reportable-transactions framework, consistent with the spec.

## w8ben-vs-w9-foreign-owned-llc — score 38/38
- P0: none.
- P1: none.
- P2: none of substance. Core rule (disregarded-entity owner supplies W-8BEN, not the entity a W-9, not W-8BEN-E for an individual) verified word-for-word against the IRS W-8BEN instructions (WebFetch iw8ben: "If you are the single owner of a disregarded entity, you are considered the beneficial owner of income received by the disregarded entity" / "A disregarded entity does not submit this Form W-8BEN... Instead, the owner of such entity provides appropriate documentation"). Table at lines 22–28 and the four scenarios at lines 90–104 match this rule exactly, including the W-8BEN-E-for-entity-owner case (line 56, verified against iw8bene instructions).

## form-5472-youtube-creators-influencers — score 38/38
- P0: none.
- P1: none.
- P2: none. AdSense/Chapter 3 withholding claim (line 44) verified against Google's YouTube US tax page: Google is under a Chapter 3 duty to "collect tax info, withhold taxes, and report to the IRS" on "royalty revenue from viewers in the U.S." — matches the post's qualitative framing exactly, no invented rate. Royalties-vs-services framing throughout (lines 17–31, table) is sound: revenue vs. related-party framing is consistent with §1.6038A-2 scope described at line 38. Worked example arithmetic (lines 81–90) checks out: $48,000 − $1,800 = $46,200; $46,200 + $12,000 = $58,200; $2,400 + $18,000 = $20,400.

## form-5472-etsy-print-on-demand-sellers — score 38/38
- P0: none.
- P1: none.
- P2: none. Marketplace-facilitator claim (line 54) verified against Etsy's own help-center JSON: "Based on applicable US State enacted marketplace facilitator tax laws, Etsy automatically calculates, collects, and remits US sales tax..." — matches, and the post correctly avoids listing specific states/rates (spec requirement). KDP royalties → owner's W-8BEN framing (lines 62–66) verified against KDP's help page ("you are paid royalties... Royalties are considered taxable income in the U.S.," 30% default withholding, W-8 expiry) and the W-8BEN instructions cited elsewhere in this batch — correctly routes to the individual owner, not the LLC. Worked example arithmetic (lines 89–101) checks out: $36,000 − $4,000 = $32,000; $3,000 + $600 + $8,000 = $11,600 (post explicitly and correctly warns against netting to the wrong $4,400 figure).

## form-5472-airbnb-short-term-rental-host — score 36/38
- P0: **Missing image asset.** `public/blog/form-5472-airbnb-short-term-rental-host.webp` does not exist (confirmed via `ls`), even though `src/lib/blog.ts:168` already has an `ARTWORK_ALTS` entry for this slug ("A short-term rental host's booking calendar beside payout records and Form 5472 paperwork"). All four other posts in this batch have their `.webp` file present; this is the only one missing. Fix: generate/place `public/blog/form-5472-airbnb-short-term-rental-host.webp` before this post goes live — the ARTWORK_ALTS entry implies the image was expected to exist, and shipping without it will 404 the hero image or fall back awkwardly depending on how the blog template handles a missing file.
- P1: none.
- P2 (polish): none beyond the image gap. FDAP 30%/§871(d) core claim (lines 51–57) verified word-for-word against the IRS nonresident-real-property page (WebFetch): "income from real property... is taxed at a 30% (or lower treaty rate)" absent election; "the NRA can elect under IRC 871(d) to treat all income from U.S. real property as effectively connected income," net income taxed at graduated rates, election "stays in effect for all later tax years unless the NRA revokes it" — the post's line 55 ("continues for later years until revoked") matches exactly. Occupancy-tax paragraph (line 67) stays qualitative with no rates, verified against Airbnb's own automatic-collection page ("Airbnb automatically collects and remits certain taxes... Hosts may need to manually collect and remit other applicable taxes"). Withholding-when-info-missing claim (line 61) verified against Airbnb's host tax-info page (withholding "remitted directly to the IRS," "payouts may be suspended," W-9 vs. W-8 form split). Worked example arithmetic (lines 71–83) checks out: $180,000 + $12,000 + $18,000 = $210,000; $2,500 × 12 = $30,000; $1,500 × 12 = $18,000.

---

## Cross-post checks (all 5 posts)
- Pricing: $149 Standard / 5-7 business days, $199 Express / 3 business days, +$99/additional year, EIN $149 at /ein — exact and consistent in every post. No $449, no "$199 flat" found anywhere (`grep -noE '\$[0-9,]+'` run per file — every figure is either standard pricing, the $25,000 penalty, or a labeled illustrative worked-example number).
- §6038A(d)/(d)(2), 90-day/$25,000-per-30-day-period language: consistent and correct in every post.
- FTIN rule (line 4b(3), "None"/"N/A", never blank) and reference-ID rule (4b(2) required when 4b(1) has no US ID, same ID every year): present and correct in every post that discusses Part II.
- Fax number 855-887-7737 and "300 DPI or higher": correct and consistent in all 5. Ogden PIN Unit mailing address (airbnb post, line 126) matches the spec exactly.
- E-file prohibition for foreign-owned DE: stated correctly everywhere; the 8832 post correctly distinguishes the post-election corporate case (can e-file) from the DE pro forma case (cannot) — see the one P2 polish note above.
- Deadlines: 15 April 2026 / 15 October 2026 for the 2025 tax year, consistent everywhere.
- FAQ structure: `## Frequently asked questions` heading present in all 5 (extractor-compatible), 7 `### `-form questions each, every answer well under the 50-word cap (max observed: 35 words).
- Internal /blog links: every target file exists in content/blog/ (checked against full directory listing) — llc-vs-c-corp-non-resident-founders, multi-member-llc-form-5472-or-1065, form-5472-foreign-corporate-owner, pro-forma-form-1120-foreign-owned-llc, form-5472-vs-form-5471, stripe-paypal-wise-form-5472, form-5472-shopify-dropshipping-foreign-owner, w8ben-vs-w9-foreign-owned-llc, form-5472-owner-loans-contributions-reimbursements, form-5472-part-v-statement-example, form-5472-us-real-estate-foreign-investor. No missing targets.
- External links: 3–4 per post, all irs.gov/youtube/kdp/airbnb/etsy authoritative sources, all curl 200.
- No duplicated H2s, no placeholder text ("[date]"/TODO/lorem), frontmatter parses and all titles/descriptions are within the 60/155-char limits in all 5 posts.
- No banned cross-chunk pronoun phrases ("as discussed above" etc.) found in any post.
- Bold first-paragraph answer blocks: 47–49 words in every post (spec wants 40–60), each immediately followed by the $25,000-penalty sourced stat and a `/start?...` link with a slug-matching utm_campaign, all inside the first 30% of the post. Closing CTA at the end of every post uses the correct `-close` utm_campaign suffix.
- Word counts: 2,068–2,296 words per post — comfortably clears both the general 1,700–2,300 target and the addendum's ≥1,200-word floor for narrow how-to/persona posts.

---

## Summary for return
