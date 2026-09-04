# ITIN batch audit (5 new posts, 2026-09-05) — sales-blog-geo-aeo standard + itin-batch-spec

Scored 0-2 across the 19 lines in docs/reviews/blog-geo-aeo-audit-brief.md (17 lines + addendum lines 18-19) = /38.
Fact-check method: WebFetch of primary irs.gov pages (ITIN info page, how-to-renew-an-itin, CP565/CP566/CP567 notice pages, Instructions for Form W-7, Instructions for Form W-8BEN, Instructions for Form 5472, Instructions for Form 1040-NR, refund-statute page) plus one WebSearch to confirm current Form W-8BEN line numbering. All cited external URLs curl-verified 200. Internal `/blog/<slug>` targets confirmed to exist as files in this worktree. `git status --short` clean (only the 5 new posts + expected image/blog.ts/artwork-script changes + this spec file).

## how-to-fill-out-form-w-7-nonresident-llc-owner — score 38/38
- P0: none.
- P1: none.
- P2: none. Reason-box table (a–h), Exceptions 1–5, mailing address (P.O. Box 149342, Austin, TX 78714-9342), passport-as-stand-alone-document rule, and 7-week/9–11-week timing all verified verbatim-consistent with https://www.irs.gov/instructions/iw7 and the ITIN info page. The 8-line risk table (lines 71-84) and the 7-step submission procedure (lines 102-108) both satisfy the required original element. 2224 words, 3 external links (all 200), 2 internal links (both resolve), FAQ = 7 questions, longest answer 39 words.

## itin-renewal-expired-itin-what-to-do — score 38/38
- P0: none.
- P1: none.
- P2: none. Three-consecutive-tax-year expiry rule (line 15) matches https://www.irs.gov/tin/itin/how-to-renew-an-itin verbatim ("expires on December 31 after the third tax year of non-use"). The "did my ITIN expire?" table (lines 31-37) arithmetic checked row by row against that rule and is correct, including the 2022-last-use → expired Dec 31 2025 example used both in the table and in Scenario 1 (line 94). The "reduced refund or penalties and interest" / "may not be able to claim certain credits" claim (lines 45-46) is directly sourced to the renewal page's own wording (verified via WebFetch), not invented. Correctly omits any middle-digit expiry schedule and any CP48 claim (spec said verify-or-omit; it omits). 2087 words, 3 external links (200s), 2 internal links (resolve), FAQ = 7, longest answer 34 words.

## itin-application-rejected-cp567-cp566 — score 38/38
- P0: none.
- P1: none.
- P2: none. CP565/CP566/CP567 definitions (table, lines 23-27) and the 45-day CP566 reply window (line 15) and 60-day CP567 document-return window (line 91) match the IRS CP565/CP566/CP567 notice pages verbatim (WebFetch-confirmed: "45 days from the date of your notice," "return your documents within 60 days from your notice's date"). CP567's three causes (lines 46-48) match the notice page's own three sentences almost word for word. Diagnostic table (lines 66-75) and 4 scenarios (lines 97-103) satisfy the original-element requirement. 2238 words, 4 external links (200s, within the 2-4 ceiling), 2 internal links (resolve), FAQ = 7, longest answer 36 words.

## when-nonresident-actually-needs-itin — score 37/38
- P0: none.
- P1 (line 6, FACT CHECK — spec explicitly required verbatim quoting here): Line 43: `The [Form W-8BEN instructions](https://www.irs.gov/instructions/iw8ben) expressly allow treaty documentation "or line 6 by providing a foreign tax identification number."` This is presented in quotation marks as if it were IRS wording, but it is not verbatim — the actual instructions (WebFetch- and WebSearch-confirmed against the current Rev. 10-2021 form) read: "you may provide the FTIN issued to you by your jurisdiction of tax residence on line 6a for purposes of claiming treaty benefits (rather than providing a U.S. TIN on line 5, if required)." The current form's FTIN line is **6a** (with 6b a checkbox for "no FTIN legally required"), not a bare "line 6." Substance is correct (an FTIN can substitute for a US TIN in many treaty claims), but the batch spec's instruction for this exact fact was "quote it, do not paraphrase from memory," and this is a paraphrase in quote marks with an imprecise line cite. Fix: replace the quoted fragment with the actual sentence above (or drop the quotation marks and paraphrase honestly), and change "line 6" → "line 6a" throughout the paragraph (lines 41-43).
- P2: none else found. Decision table (lines 49-62) is thorough and internally consistent, correctly routes Form 5472 / EIN / banking / ordinary W-8BEN to "no ITIN needed," and does not contradict content/blog/itin-required-form-5472.md. Links both itin-required-form-5472 and ein-for-foreign-owned-llc-without-ssn as the spec requires. 2246 words, 4 external links (200s), 2 internal links (resolve), FAQ = 7, longest answer 40 words.

## itin-refund-30-percent-withholding-1042-s — score 37/38
- P0: none.
- P1 (line 6, FACT CHECK — same defect class as above): Line 96: `The [IRS Form W-8BEN instructions](https://www.irs.gov/instructions/iw8ben) say a treaty claimant can "complete line 5 by submitting an SSN or ITIN" or use an FTIN on line 6 where the rule permits.` Same issue: not a verbatim IRS quote, and "line 6" should be "line 6a." Fix: use the verified sentence — "you may provide the FTIN issued to you by your jurisdiction of tax residence on line 6a for purposes of claiming treaty benefits (rather than providing a U.S. TIN on line 5, if required)" — or state it as paraphrase without quotation marks, and correct "line 6" → "line 6a."
- P2: none else found. Worked example (lines 64-66) arithmetic re-verified: $12,000 × 30% = $3,600 withheld, $0 refund at baseline; corrected $8,000 × 30% = $2,400 tax, $3,600 − $2,400 = $1,200 overpayment — both correct and explicitly labelled illustrative, no named treaty rate is asserted anywhere (spec required this). Refund statute of limitations (line 72, "later of 3 years from filing or 2 years from payment") matches https://www.irs.gov/filing/time-you-can-claim-a-credit-or-refund verbatim. 30% chapter-3/§871(a) framing and the Form 1042-S attachment requirement match https://www.irs.gov/instructions/i1040nr. 2234 words, 4 external links (200s), 3 internal links (resolve, ≥2 met).

## Cross-post checks (all 5 posts)
- Pricing: only $349 (ITIN) appears as a real price; all other `$` figures in the refund post are the explicitly-labelled illustrative worked example ($12,000/$3,600/$4,000/$8,000/$2,400/$1,200/$0). No invented price, no $449/$199-flat/wrong-per-year figure found.
- "We are not a CPA firm and do not give tax advice" present in all 5 (grep-confirmed, once each).
- No cross-chunk pronouns ("as discussed above" etc.), no placeholder text ([date]/TODO/lorem), no duplicate H2s, FAQ H2 is exactly `## Frequently asked questions` with 7 `### ` questions in all 5 (spec wants 6-8 — met), no contradiction of content/blog/itin-required-form-5472.md's FTIN/"None"/"N/A"/reference-ID position (re-verified against https://www.irs.gov/instructions/i5472, which was fetched and matches both the existing post and the new posts).
- Frontmatter: date/updated = 2026-09-05 in all 5; titles ≤51 chars, descriptions ≤142 chars (all under the 60/155 caps).
- Images: all 5 `public/blog/<slug>.webp` exist and have an ARTWORK_ALTS entry in src/lib/blog.ts.

## Totals
P0: 0 · P1: 2 · P2: 0
