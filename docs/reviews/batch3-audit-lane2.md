# Batch 3 audit — lane 2 (fact-check priority)

Scope: content/blog/new-mexico-llc-foreign-owner-tax-filing.md, content/blog/nevada-llc-foreign-owner-tax-filing.md, content/blog/form-5472-shopify-dropshipping-foreign-owner.md (working-tree, not yet live). Scored against docs/reviews/blog-geo-aeo-audit-brief.md's 19-line rubric (17 base lines + addendum lines 18–19), 0/1/2 each, max 38. Verified via WebFetch/WebSearch/curl against irs.gov, corp.delaware.gov, tax.nv.gov, nvsos.gov, sos.nm.gov, tax.newmexico.gov, ecfr.gov, and site-internal cross-checks.

---

## new-mexico-llc-foreign-owner-tax-filing — score 37/38

Line scores: 1:2 2:2 3:2 4:2 5:2 **6:1** 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- **P0 (fact conflict, priority-line-6):** Line 57 — table cell "Delaware | No LLC annual report; **$400 annual LLC tax** | None," sourced to https://corp.delaware.gov/alt-entitytaxinstructions/. That page does say $400 (verified live), but it reflects Delaware HB 400 (signed 21 May 2026), which raises the LLC tax from $300 to $400 **effective for the 2026 tax year, first payable June 1, 2027**. The amount actually due at every prior payment (including the June 1, 2026 payment already past) was $300, and corp.delaware.gov/frtax/ still states $300 today. Three other live posts on this same site state **$300**: content/blog/delaware-llc-foreign-owner-tax-filing.md:3, content/blog/foreign-owned-llc-filing-requirements-checklist.md:84, content/blog/wyoming-llc-foreign-owner-tax-filing.md:121. Publishing this post as-is puts a $400 figure on the live site next to three $300 figures with no date qualifier — a direct, checkable self-contradiction (bad for GEO citation, since an AI engine reading both pages gets conflicting numbers from the same domain).
  - Exact fix: change line 57 to `| Delaware | No LLC annual report; **$300 annual LLC tax** (rising to $400 for tax year 2026 under Delaware HB 400, first due June 1, 2027) | None |` — matching the other three posts' current-fact framing and adding the forward-looking caveat instead of stating $400 as already-current.
- **P2 (polish):** Line 163 — only one related-post link (`foreign-owned-llc-filing-requirements-checklist`). Spec's own brief (new-posts-batch-3-spec.md line 31) suggested 2–4 related links; brief's scoring line 10 only requires ≥1 so this doesn't cost points, but a second related link (e.g. `wyoming-llc-foreign-owner-tax-filing` or `delaware-llc-foreign-owner-tax-filing`, both in the state-template family) would strengthen internal linking.

---

## nevada-llc-foreign-owner-tax-filing — score 35/38

Line scores: 1:2 2:2 3:2 4:2 **5:1** **6:1** 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- **P0 (fact conflict, priority-line-6, same defect as NM post):** Line 61 — table cell "Delaware | Annual LLC tax; no LLC annual report | **$400**," same source (corp.delaware.gov/alt-entitytaxinstructions/) and same problem: contradicts delaware-llc-foreign-owner-tax-filing.md:3, foreign-owned-llc-filing-requirements-checklist.md:84, and wyoming-llc-foreign-owner-tax-filing.md:121, which all state $300 (the amount actually payable today, 2026-08-21; $400 doesn't apply until the June 2027 payment under Delaware HB 400).
  - Exact fix: change line 61 to `| Delaware | Annual LLC tax; no LLC annual report | **$300** (→ $400 for tax year 2026 under HB 400, first due June 1, 2027) |`.
- **P1 (verifiable fact omitted — priority-line-6):** Lines 28, 59–63, 135 all decline to state Nevada's actual annual list fee and business license fee ("The Nevada Secretary of State site is blocking automated access from our verification environment... this guide does not guess the annual-list or business-license amount"). This was independently verifiable: the Nevada Secretary of State's own current fee schedule (nvsos.gov, "Instructions for Amended/Annual List and State Business License Application," https://www.nvsos.gov/home/showpublisheddocument/6529/638345195963930000, and the SOS LLC fee schedule PDF revised 8/1/2023) states **Annual/Amended List of Managers or Members = $150** and **State Business License = $200** (total $350), due the last day of the anniversary month. curl from this environment got a 200 on nvsos.gov/businesses (the WebFetch tool just couldn't extract text from the JS-rendered page), so the "site is blocking automated access" framing overstates the actual barrier — the fee-schedule PDF was fetchable. This is the single most-searched fact in the post's own primary query ("Nevada LLC non-resident annual fees") and it's the one number the post refuses to give, which directly weakens rubric line 1/5 (sourced stat) and line 6.
  - Exact fix: replace the hedge at lines 28 and 59–63 with: "Nevada's Annual List of Managers/Members is $150 and the State Business License is $200 ($350 total), per the Nevada Secretary of State's current LLC fee schedule (nvsos.gov) — confirm before paying since amounts can change." Update the FAQ answer at line 135 to match.
- **P2 (weak citation):** Line 47 cites "https://tax.nv.gov/wp-content/uploads/2026/03/Nevada-Tax-Notes-March-2026.pdf" for "Nevada does not impose an individual or corporate income tax." The PDF returns 200 but is an image-based/non-extractable PDF that could not be verified to actually contain that sentence in this audit (fact itself is true and uncontroversial, but the specific citation couldn't be confirmed to say it). Consider citing a standard tax.nv.gov HTML FAQ page instead of a PDF for this claim.

---

## form-5472-shopify-dropshipping-foreign-owner — score 38/38

Line scores: 1:2 2:2 3:2 4:2 5:2 6:2 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- No P0 or P1 findings. All legal claims verified: $25,000 penalty (irs.gov/instructions/i5472), reportable-transaction test correctly applied to Shopify Payments/PayPal payouts (not reportable — settlement of unrelated customer revenue) vs. related-company supplier payments (reportable, cites 26 CFR §1.6038A-2 at ecfr.gov, live and confirmed), fax number 855-887-7737 and "300 DPI or higher," FTIN "None"/"N/A" + reference-ID rule, deadline 15 April 2026 / extended 15 October 2026, all correct and matching the brief's legal-facts block. Pricing exactly $149/$199/+$99, EIN $149. Worked-example dollar figures are explicitly labeled "illustrative... not a merchant statistic or a real filing" (line 74), satisfying the no-invented-statistics rule. No cross-section pronouns, no duplicate H2s, no placeholder text, frontmatter parses, FAQ H2 exact match, 7 FAQ questions all ≤50 words (26–33 words each), image + ARTWORK_ALTS entry present, word count 2,024 (within 1,700–2,300).
- **P2 (info only, not a defect):** Line 37 external link to https://help.shopify.com/en/manual/payments/shopify-payments/payouts returns 403 to curl (bot-blocked), same class as the brief's noted comptroller.texas.gov quirk — report as "unverifiable here," not broken; the URL pattern is a genuine, currently-existing Shopify help-centre page.

---

## Cross-cutting notes

- Internal `/blog/` link targets used by all three posts (foreign-owned-llc-filing-requirements-checklist, how-to-fill-out-form-5472, stripe-paypal-wise-form-5472, amazon-fba-foreign-sellers-form-5472) all return 200 live and are not draft/future-publishAt. No broken or premature internal links found.
- Pricing ($149 Standard / $199 Express / +$99 per year / EIN $149) is exact and consistent across all three posts and the "not a CPA firm" disclaimer is present in each.
- The one real substantive issue across the batch is the Delaware $300 vs $400 conflict, which is a same-fact contradiction across five live-or-about-to-be-live posts on the same site, not an invented number — it needs an editorial decision (site-wide $300-with-caveat, matching the three existing posts) before these two files ship.

## Summary

- P0: 2 (both the Delaware $300/$400 site-wide contradiction, in new-mexico:57 and nevada:61)
- P1: 1 (nevada:28/59-63/135 — omitted a verifiable Nevada annual-list/business-license fee that was independently confirmable via nvsos.gov's own fee schedule)
- P2: 3 (new-mexico:163 thin related-linking; nevada:47 weak PDF citation for the no-income-tax claim; shopify:37 bot-blocked-but-legitimate Shopify help link)
