# EIN batch audit — 5 new working-tree posts (2026-09-04)

Standard: docs/reviews/blog-geo-aeo-audit-brief.md (19 lines incl. addendum, 0-2 each, /38) + "Facts you MUST verify" block in docs/reviews/new-posts-ein-batch-spec.md. Fact-checked against irs.gov via curl/WebFetch: Form SS-4 instructions (irs.gov/instructions/iss4, raw HTML fetched and grepped for exact line text), EIN online page, CP575 notice page, IRM 21.7.13 (Mod IEIN), IRM 21.7.1.4.7.1 (EIN verification/147C), responsible-parties-and-nominees page, TIN Matching page, W-8BEN instructions, and web search for the IRS's international-taxpayer phone numbers.

General findings applicable to all 5 files: frontmatter parses cleanly (gray-matter), all titles ≤60 chars, all descriptions ≤155 chars, dates 2026-08-30/2026-08-30 as specified, all 5 have exactly 7 `### ` FAQ questions (all ≤50 words, longest was 43), all bold lead answer blocks are 52-57 words (in the 40-60 spec range), all 5 webp images exist in `public/blog/` and have `ARTWORK_ALTS` entries in `src/lib/blog.ts` (lines 184-188), no duplicate H2s, no placeholder text, no cross-section pronouns, `/start` mentioned at most once (or not at all) and always framed as secondary, `not a CPA firm` line present in every product section, and every internal `/blog/...` link target exists as a file in `content/blog/`. All external links returned HTTP 200 (the EIN-online-page URL 301-redirects but resolves). Dollar figures across all 5 files are limited to $0 / $149 / $199 / $99 / $349 / $25,000 — no invented price.

---

## ein-application-rejected-reference-number-101 — score 34/38

- P1 (unverifiable/overstated IRS-manual claim — line 6 fact-check): Line 21 states *"The IRS's public internal manual shows the exact stop message, says codes 101 and 115 route to an employee, and says the online system validates the responsible party's name and tax number plus existing business-name records before issuing an EIN."* I fetched IRM 21.7.13 (irs.gov/irm/part21/irm_21-007-013r) directly: the actual code-101/115 definitions in that IRM section are redacted (shown as `≡≡≡` placeholders in the public version) — the manual does NOT show "the exact stop message," and does not explicitly state the responsible-party/business-name validation logic the sentence attributes to it. The only thing the IRM text confirms is a change-log line noting "automated message routing within the online system for reference codes other than 101 or 115" (i.e., 101/115 are handled differently from other codes) — that is weaker and less specific than what the post claims the manual "shows." Fix: replace with "The IRS's internal manual for online EIN applications confirms that codes 101 and 115 are handled outside the online system's automated routing (the manual redacts the underlying code table), which is consistent with the two review areas below" — or drop the "shows the exact stop message" clause entirely.
- P2 (sourcing precision): Line 108 says the reference-101 timing is "not a guarantee" and line 142 correctly states the IRS publishes no processing-time figure for a 101 review — good practice, no fix needed, noting only because it's a compliance strength worth preserving in future edits.
- P2 (polish): The diagnostic table (lines 34-39) header reads "Most likely review area" where the brief's original element description said "most likely cause" — cosmetic only, no fix required.

Verified correct in this file: EIN $0 (irs.gov EIN-online page), one-EIN-per-responsible-party-per-day (exact match, iss4 line ~276), line 7b "foreign or N/A" (exact match, iss4 line 387), line 9a "Foreign-owned U.S. disregarded entity-Form 5472" (exact match, iss4 line 458), international phone 267-941-1099 Mon-Fri 6a-11p ET / fax 855-215-1627 (US) / 304-707-9471 (outside US) / mail to EIN International Operation, Cincinnati OH 45999 (all exact matches, iss4 lines 285/294/302-306), third-party-designee scope and "authority terminates when EIN assigned and released" (exact match, iss4 line 286/551), pricing $149/$199/$99/$349/$0 all match source of truth.

## lost-ein-147c-letter-replacement — score 32/38

- P1 (unverified/likely-wrong phone number for the post's central action — line 6 fact-check): Line 62 and the numbered procedure (line 69) tell a foreign owner requesting Letter 147C to call **+1-267-941-1099** "From abroad." I verified on irs.gov (Form SS-4 instructions, iss4 line 285) that 267-941-1099 is documented specifically "to obtain an EIN" (new EIN issuance) — it is the EIN-application line, not a general account/verification line. Separately, IRS's own international-taxpayer contact page (irs.gov/help/help-with-tax-questions-international-taxpayers) lists a DIFFERENT number, **267-941-1000**, for "international callers or overseas taxpayers" general account questions — which is the more plausible route for an existing-EIN verification/147C request. No irs.gov page I could reach states that 267-941-1099 handles 147C or EIN-verification requests. This is the load-bearing phone number for the entire post's "how a foreign owner requests 147C" procedure, so the risk is a reader dialing the wrong IRS line. Fix: either (a) verify 267-941-1099 vs 267-941-1000 with an IRS phone agent/additional primary source before publishing, or (b) soften the claim to something sourceable, e.g. "the IRS's published international EIN line is +1-267-941-1099 (SS-4 instructions); for an existing EIN's verification, note this line is scoped to new-EIN issuance in the instructions, so confirm with the agent that 147C requests are handled there, or use the general international taxpayer line 267-941-1000."
- P2 (unsourced date attribution): Lines 21 and 105 state "The IRS added a digital CP575 option for eligible Business Tax Account users in 2026." The CP575 notice page (irs.gov/individuals/understanding-your-cp575-notice, "Page Last Reviewed or Updated: 16-Jun-2026") confirms the digital CP575 exists and substitutes for the original notice and for 147C, but does not state it was "added ... in 2026" — that specific rollout year is not stated on the cited page. Fix: drop "in 2026" or reword to "The IRS now offers a digital CP575 option for eligible Business Tax Account users" without a specific introduction year.

Verified correct in this file: CP575 "cannot be duplicated or recreated" (exact match), digital CP575 "can be used as a substitute for the original CP575A-J notice series and Letter 147C" and "accepted by banks and other institutions" (exact match), Business & Specialty Tax Line 800-829-4933 Mon-Fri 7a-7p local time (confirmed via IRS-adjacent sources), third-party-designee authority ending at EIN assignment (exact match to iss4), IRM 21.7.1.4.7.1 authorization chain (taxpayer / CAF-authorized rep / Form 2848 or 8821) and fax-disclosure cross-reference to IRM 21.1.3.9 (confirmed via direct IRM fetch), pricing all correct.

## how-to-fill-out-form-ss-4-foreign-owned-llc — score 38/38

Every specific SS-4 line claim in this post was checked against the raw instructions text (irs.gov/instructions/iss4) line by line and matched exactly:
- Line 6 "County and state where principal business is located" — exact.
- Line 7a/7b responsible-party definition and "foreign or N/A" entry — exact (iss4 lines 387, 389).
- Line 8a-8c LLC info — matches form structure.
- Line 9a "Other" + "Foreign-owned U.S. disregarded entity-Form 5472" — exact (iss4 line 458).
- Line 10 "Other" + "Foreign-owned U.S. disregarded entity filing Form 5472" — exact, and correctly uses the DIFFERENT wording from line 9a rather than conflating the two (iss4 line 484) — this is a detail many AI-generated SS-4 guides get wrong, and this post gets it right.
- Line 18 "prior EIN" — matches instructions.
- Third-Party Designee scope/expiry — exact (iss4 line 551).
- International phone/fax/mail — exact.
- $25,000 penalty citation to i5472 — correct, consistent with source-of-truth doc.

No P0/P1 findings. P2 (polish, not a defect): the "8 highest-risk lines" table (lines 29-38) groups multiple form lines into single rows (e.g., "4a-5b" and "8a-8c" each cover 3-4 form fields in one row), so it covers 8 table rows rather than 8 individually-named lines — matches the spirit of the brief but a stricter reading of "8 highest-risk lines" would want 8 distinct line numbers. No fix required unless the brief is read literally.

## ein-for-stripe-amazon-paypal-seller-account — score 38/38

Platform-claims discipline verified: the "what each platform typically asks for" table (lines 36-41) is fully generic (US taxpayer-ID field / entity identity / address evidence / owner tax-status layer) with no platform-specific fee, screen, or policy asserted — matches the brief's explicit requirement to keep platform claims qualitative. Every other factual claim checked against a primary source and matched: TIN Matching program description (line 30, exact match to irs.gov TIN Matching page — "validate TIN and name combinations before submitting an information return"), W-8BEN single-owner/disregarded-entity treatment (line 67, exact match to iw8ben instructions), CP575 as EIN proof (line 79/133, exact match to CP575 notice page), $0 IRS fee, EIN-belongs-to-LLC/W-8BEN-is-owner's-form distinction. No P0/P1 findings.

- P2 (polish): FAQ answer "Does an EIN guarantee seller-account approval?" (line 141-143) is a good hedge; no changes needed, noted only as a model answer for future posts.

## ein-third-party-designee-apply-on-your-behalf — score 36/38

All SS-4-designee-specific claims verified exact against iss4: designee block authorizes "answer questions about the completion of Form SS-4 and receive the entity's newly assigned EIN" and "terminates at the time the EIN is assigned and released" (line 23, exact match iss4 line 551/286). Responsible-party definition and "nominees can't apply for an EIN and shouldn't be listed on Form SS-4" (line 45, exact match to irs.gov/businesses/small-businesses-self-employed/responsible-parties-and-nominees). $0 IRS fee correct throughout. The DIY-vs-designee decision table (lines 88-98) is honest about the $0 IRS fee under both columns, matching the brief's requirement that this post not oversell secrecy or exaggerate DIY difficulty.

- P2 (thin related-link count): This post links only 2 posts from the approved related-posts list (`ein-responsible-party-foreign-owned-llc`, twice, and `ein-application-checklist-foreign-owned-llc` in the close), which is exactly the ≥2 minimum but with less topical breadth than the other 4 posts in the batch (which link 3-4). Fix (optional): add one more related link, e.g. to `ein-cost-irs-free-vs-service` given the post's heavy $0-vs-fee framing.
- P2 (polish): FAQ "Can my registered agent be my EIN responsible party?" (line 139-141) slightly overlaps ground already covered in the body (lines 41-49) — acceptable for FAQ redundancy/PAA-matching purposes, not a violation.

---

## Summary

| Slug | Score |
|---|---|
| ein-application-rejected-reference-number-101 | 34/38 |
| lost-ein-147c-letter-replacement | 32/38 |
| how-to-fill-out-form-ss-4-foreign-owned-llc | 38/38 |
| ein-for-stripe-amazon-paypal-seller-account | 38/38 |
| ein-third-party-designee-apply-on-your-behalf | 36/38 |

P0 total: 0. P1 total: 2 (both fact-sourcing issues, in ein-application-rejected-reference-number-101 and lost-ein-147c-letter-replacement). P2 total: 5 (polish/optional).
