# Blog audit — batch B (sales-blog-geo-aeo standard, 2026-08-19)

Method: read each post's frontmatter + full body from `content/blog/<slug>.md`; verified `public/blog/<slug>.webp` and `src/lib/blog.ts` `ARTWORK_ALTS` entries on disk; fact-checked every IRS/legal claim with WebFetch against irs.gov (and one OECD source); checked every internal and external link with `curl -s -o /dev/null -w "%{http_code}"` against `https://www.form5472prep.com` (internal) and the live source (external). No repo files were edited.

**Systemic finding (affects 4 of 7 posts): internal links pointing to not-yet-published sibling posts 404 live.** `form-5472-owner-loans-contributions-reimbursements.md`, `form-5472-recordkeeping-checklist.md`, `multiple-related-parties-form-5472.md`, and `itin-required-form-5472.md` all exist on disk with `draft: false`, but each carries a `publishAt` timestamp *after* today (2026-08-19: 08-24, 09-07, 09-21, 08-31 respectively). `isPubliclyAvailable()` in `src/lib/blog.ts` (line ~247) hides a post until `publishAt` passes, so any post that links to one of these four gets a live 404 today even though the file and the link text are both correct. This will self-heal as the calendar advances, but until then it is a real broken link for any visitor who clicks it, so it is scored as P0 wherever it occurs.

---

## form-5472-singapore-residents-us-llc — score 32/34
- P0: none. Fact-check: Singapore FTIN table (NRIC for citizens/PRs, FIN for foreign residents, UEN for local companies) matches the OECD Singapore TIN profile PDF verbatim in substance. Correctly avoids claiming a US–Singapore tax treaty exists (there is none) — no treaty language appears anywhere in the post. Both internal links (`/blog/stripe-paypal-wise-form-5472`, `/blog/foreign-owned-llc-filing-requirements-checklist`) return 200 live. All 3 external IRS/OECD links return 200.
- P1: Opening 30% has a direct answer and an early `/start` link but no sourced, quantifiable statistic (line 1 of rubric) — the piece stays qualitative until "300 DPI" appears much later. Word count is 787, thin next to sibling country guides (Canada/UK/India run ~1,900–2,100 words); flag as a depth gap if this is meant to be a pillar-tier country guide.
- P2: The "300 DPI or higher" and April 15/October 15 deadline statements in the closing filing-steps list don't carry an inline citation link at that exact sentence (the i5472 link is used earlier in the piece, not re-attached there).

## form-5472-change-of-ownership — score 29/34
- P0: Cited source `https://www.irs.gov/pub/int_practice_units/ore_c_19_02_01.pdf` (the IRS entity-classification practice unit) **returns HTTP 404** — verified with `curl -sL`. It is the sole inline citation for "a disregarded entity becomes a partnership when membership increases above one and a partnership becomes disregarded when membership falls to one." The underlying legal claim itself is correct — independently confirmed via the IRS Form SS-4 instructions ("If the disregarded entity is requesting an EIN because it has acquired one or more additional owners and its classification has changed to partnership under the default rules of Regulations section 301.7701-3(f), check the Partnership box for line 9a") — but the citation should be replaced or removed since it currently 404s.
- P1: FAQ answer #5 ("Is a no-cash ownership transfer still reportable?") is 52 words, over the rubric's 50-word cap for extractor-friendly FAQ formatting. Word count 881 is thin for a post covering three distinct sub-topics (reportability, reclassification, EIN consequences).
- P2: Opening bold paragraph runs ~65–70 words, over the 40–60w quotable-snippet target.
- Verified accurate elsewhere: reference-ID reuse rule ("a reference ID number... cannot be used again for another 25% foreign shareholder") matches the current i5472 instructions verbatim; Part V acquisition/disposition/formation language matches the official Form 5472. Internal link `/blog/multi-member-llc-form-5472-or-1065` returns 200 live.

## form-5472-currency-conversion-exchange-rates — score 30/34
- P0: Two internal links 404 live (see systemic finding above): `/blog/form-5472-owner-loans-contributions-reimbursements` and `/blog/form-5472-recordkeeping-checklist` — both scheduled to publish later (08-24 and 09-07) but linked as if live today.
- P1: No sourced numeric stat in the first 30% of the post; the $10,000/15,000-unit worked example is explicitly (and correctly) labeled "illustrative," so it doesn't satisfy the "sourced stat" line. Thinnest-adjacent at 767 words.
- P2: Opening bold paragraph is slightly over the 60-word target.
- Verified accurate: "the IRS has no official exchange rate," "use the exchange rate prevailing (the spot rate) when you receive, pay or accrue the item," and "accepts any posted exchange rate used consistently" all match the IRS yearly-average-currency-exchange-rates page verbatim. The stated division convention ("foreign-currency amount ÷ listed rate = US-dollar amount") matches the IRS page's own instruction ("divide the foreign currency amount by the applicable yearly average exchange rate") — direction is correct, not inverted. Form 5472 instructions requirement to "state all amounts in U.S. dollars and attach a schedule showing the exchange rates used" also confirmed verbatim.

## form-5472-foreign-corporate-owner — score 31/34
- P0: Internal related-post link `/blog/multiple-related-parties-form-5472` 404s live (scheduled `publishAt` 2026-09-21, see systemic finding).
- P1: No clearly sourced stat inside the first 30% of the post — the 25% ownership threshold appears inside a table rather than as a stated, sourced figure. Thin at 811 words for a topic spanning direct/ultimate ownership, six identifier types, and six transaction categories.
- P2: Opening bold paragraph runs long (~75 words).
- Verified accurate: i1120 instructions confirm "a foreign person, including a foreign corporation, can wholly own a domestic disregarded entity" under the limited §6038A rule; i5472 confirms "if a foreign-owned U.S. DE has, as a direct owner, a foreign DE, report that foreign DE as the direct owner" and "file a separate Form 5472 for each foreign or U.S. person who is a related party with which the reporting corporation had a reportable transaction" — matching the post's "one Form 5472 per related party" claim exactly.

## form-5472-reasonable-cause-letter — score 32/34
- P0: none. This is the most rigorously verifiable post in the batch — every material claim checked verbatim against irs.gov: the ordinary-care-and-prudence standard and "what happened / when / how it prevented compliance / what attempts were made" test (irs.gov/payments/penalty-relief-for-reasonable-cause); the $25,000-per-form-per-year initial penalty (i5472, which also confirms an additional $25,000 for failures continuing past 90 days — matching the post's "continuation penalties" language); and the claim that the delinquent-international-information-return-submission-procedures page was "updated in April 2026" — the page's actual "Page Last Reviewed or Updated" footer reads **19-Apr-2026**, an exact match. The claim that "penalties may be assessed during processing without considering an attached reasonable cause statement" is also a verbatim match to that page.
- P1: FAQ answer #5 ("Should a late filer wait for an IRS notice?") is 52 words, 2 over the cap. Word count 851 is thin for a topic that would benefit from a worked example excerpt.
- P2: none material.

## how-to-fax-form-5472-irs — score 32/34
- P0: Internal link `/blog/form-5472-recordkeeping-checklist` 404s live (scheduled `publishAt` 2026-09-07, see systemic finding).
- P1: The FAQ claim "Form 7004 use the same fax number... to the same dedicated destination" was not independently re-confirmed against a fetched primary source in this audit (it is consistent with general IRS routing practice for foreign-owned DEs but should get a direct citation check). Thinnest post in the batch at 760 words.
- P2: none material.
- Verified accurate — this post's central claim was the audit brief's specific fact-check target and it holds up exactly: the current i5472 instructions state **"Fax (300 DPI or higher) to 855-887-7737"** — a verbatim match to both the frontmatter description and body text. The Ogden PIN Unit mailing address block (1973 Rulon White Blvd, M/S 6112 Attn: PIN Unit, Ogden, UT 84201) also matches the IRS instructions verbatim. "A foreign-owned U.S. DE cannot file Form 5472 electronically" matches the instructions' e-file prohibition exactly.

## pro-forma-form-1120-foreign-owned-llc — score 31/34
- P0: Internal link `/blog/itin-required-form-5472` 404s live (scheduled `publishAt` 2026-08-31, see systemic finding).
- P1: No sourced stat within the first 30% of the post. Thin at 808 words for a topic that's structurally important (this is the "how the filing package actually works" post).
- P2: Opening bold paragraph runs ~70 words, over the 40–60w target.
- Verified accurate: the 2025 Form 1120 instructions confirm "a DE covered by these rules is required to file a pro forma Form 1120 with Form 5472 attached by the due date (including extensions)" — matching the post's core claim exactly. The Form SS-4 instructions confirm the exact phrase the post cites: check the Other box and write **"Foreign-owned U.S. disregarded entity-Form 5472."** The 300 DPI / 855-887-7737 fax instruction in step 6 is correctly sourced inline.

---

## Batch summary

| Slug | Score | P0 | P1 | P2 |
|---|---|---|---|---|
| form-5472-singapore-residents-us-llc | 32/34 | 0 | 2 | 1 |
| form-5472-change-of-ownership | 29/34 | 1 | 2 | 1 |
| form-5472-currency-conversion-exchange-rates | 30/34 | 2 | 2 | 1 |
| form-5472-foreign-corporate-owner | 31/34 | 1 | 2 | 1 |
| form-5472-reasonable-cause-letter | 32/34 | 0 | 2 | 0 |
| how-to-fax-form-5472-irs | 32/34 | 1 | 2 | 0 |
| pro-forma-form-1120-foreign-owned-llc | 31/34 | 1 | 2 | 1 |
| **Total** | **avg 31/34** | **6** | **14** | **5** |

All 7 posts pass images (`public/blog/<slug>.webp` present) and `ARTWORK_ALTS` entries in `src/lib/blog.ts`. No pricing errors anywhere in this batch (none of the 7 posts quote a dollar price for the service — the only dollar figures found are the $25,000 IRC §6038A(d) penalty, correctly stated, and one explicitly-labeled illustrative currency-conversion example). No fabricated stats, no wrong fax number, no wrong deadline, no invented quotes, and — notably — no false US–Singapore treaty claim (the Singapore post correctly avoids implying one exists). The one real fact-accuracy defect is the dead IRS practice-unit citation in `form-5472-change-of-ownership.md`; every other IRS/legal claim across all 7 posts that was checked against a primary source matched verbatim.

**Recommended fixes, in priority order:**
1. Replace or remove the dead citation `https://www.irs.gov/pub/int_practice_units/ore_c_19_02_01.pdf` in `form-5472-change-of-ownership.md` (line 32).
2. Either pull forward the `publishAt` dates on the four scheduled posts, or stop cross-linking to them from already-live posts until their publish date arrives (affects `form-5472-currency-conversion-exchange-rates.md`, `form-5472-foreign-corporate-owner.md`, `how-to-fax-form-5472-irs.md`, `pro-forma-form-1120-foreign-owned-llc.md`).
3. Trim the two FAQ answers over 50 words (`form-5472-change-of-ownership.md` FAQ #5, `form-5472-reasonable-cause-letter.md` FAQ #5).
4. Consider adding one sourced, quotable statistic into the opening 30% of the 5 posts flagged for it, and revisit depth/word count if any of these are meant to compete as pillar content rather than narrow support posts.
