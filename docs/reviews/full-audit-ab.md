# Blog audit — Part A (4 posts)

Pricing source of truth confirmed by reading `src/lib/pricing.ts` directly: Standard $149 (`STANDARD_TURNAROUND` = "5-7 business days"), Express $199 (`EXPRESS_TURNAROUND` = "3 business days"), `MULTI_YEAR_ADDON_CENTS` = 9900 → +$99 per additional past tax year on either tier, `FAX_FEE_CENTS` = 0 / `FAX_FEE_LABEL` = "IRS fax delivery (included)". No $449 anywhere, no "$199 flat", no "$149 per additional year" anywhere in source. All 4 posts' quoted prices were checked against this and matched exactly except where noted below.

Images/alts pre-check (double-checked, all pass): all 4 `public/blog/<slug>.webp` files exist (59K–72K); `src/lib/blog.ts` `ARTWORK_ALTS` has an entry for each of the 4 slugs.

Line count scored: 19 lines (1–17 from the brief body + addendum's 18 integrity, 19 FAQ-pattern), max 38.

---

## form-5472-canada-residents-us-llc — score 29/38

**P0 (wrong/invented fact, broken link, wrong price)**

- Line 12: *"On Form 5472 Part II you can enter your Canadian SIN as the foreign tax identifying number, or a self-assigned reference ID if you'd rather not use it."* — **Wrong/invented.** Per the current IRS Instructions for Form 5472, the "reference ID number" and the "FTIN" are two *different* required fields, not alternatives. The reference ID is a taxpayer-assigned tracking number for a 25% foreign shareholder; it does not substitute for providing (or explaining the absence of) an FTIN. The actual instruction for a shareholder with no FTIN is to enter "None" or "N/A" in the FTIN block — not to supply a self-assigned reference ID instead. This is the article's opening sentence, so it's high-visibility. **Fix:** rewrite to "Enter your SIN as the FTIN on Part II; if you don't have one, IRS instructions say to write 'None' or 'N/A' in the FTIN field — the reference ID number is a separate, additional field used to identify the shareholder, not a substitute for the FTIN."
- Line 45: *"Reportable transactions under 26 CFR §1.6038A-4 cover any money, property, or services exchanged between the LLC and you as the foreign related party."* — **Wrong citation.** Verified against eCFR/govinfo: 26 CFR §1.6038A-4 is titled "Monetary penalty" (the $25,000 penalty provision), not the definition of "reportable transaction." The general requirements and definitions (where "reportable transaction" lives) are in 26 CFR §1.6038A-1. **Fix:** change the citation to "26 CFR §1.6038A-1" or drop the specific subsection and cite the Form 5472 instructions generally.
- Line 71: *"Form 5472 has a checkbox to explain why no FTIN is available, along with a reason."* — **Invented.** No such checkbox exists in the current Form 5472 instructions. The actual instruction (confirmed via IRS.gov fetch) is simply to enter "None" or "N/A" in the FTIN block — no separate explanation/checkbox mechanism is described. **Fix:** replace with "If you genuinely don't have a SIN, IRS instructions say to enter 'None' or 'N/A' in the FTIN field — no separate explanation is required."

**P1 (standard violation)**

- Line 10 (placement rule): The post's only link to the conversion target (`/start`) is at line 160, the very last line of the article. There is no `/start` (or other conversion) link anywhere in the first screen / first ~30% of the post (roughly lines 1–48). **Fix:** add a `/start` link in the TL;DR block (lines 20–28) or immediately after the intro paragraph.
- Line 12 area (external link count): Only 1 external authoritative link in the entire post (`https://www.irs.gov/instructions/i5472` at line 12); brief requires 2–4. **Fix:** add irs.gov links for the Form 7004 extension mention (line 27/116) and the IRC §6038A(d) penalty reference (line 14).
- Lines 136–138 (FAQ, "My US LLC has a Canadian accountant. Can they file Form 5472?"): answer is 65 words, over the 50-word FAQ cap. **Fix:** trim to ≤50 words, e.g. cut the closing sentence "Not every accountant knows this workflow — it's not a standard Canadian tax filing."
- Line 124: *"Most Canadian founders who didn't know about the requirement qualify for reasonable cause abatement — the IRS recognizes that non-US residents are often unaware of this obligation..."* — states a specific abatement outcome as near-certain ("most... qualify") without a source; reasonable-cause relief is a facts-and-circumstances determination, not a near-guarantee. **Fix:** soften to "Reasonable cause abatement is available on a facts-and-circumstances basis, and not knowing about the requirement is a commonly cited factor — but it isn't automatic."
- Line 14 (pricing rule): No pricing is quoted anywhere in the post, despite ending on a `/start` CTA (line 160). **Fix:** add a one-line price mention near the CTA, e.g. "Standard filing starts at $149 (5-7 business days), fax to the IRS included."

**P2 (polish)**

- Line 12: the bold lead answer runs ~70 words, slightly over the brief's 40–60 word target for the quotable direct-answer block (compounds with the P0 error already flagged there). **Fix:** tighten once the factual error is corrected.
- Line 77: treaty withholding rates ("dividends... typically 15%... interest (often 0%)") are directionally correct per the Canada-US Fifth Protocol but are stated without an inline source link. **Fix:** link to the treaty text or a summary page for readers who want to verify.

---

## form-5472-change-of-ownership — score 36/38

**P0**

- None found. Fax number (855-887-7737), $25,000 penalty, IRC/CFR framing, Part IV/V/VI structure, SS-4 EIN guidance (verified against IRS SS-4 instructions search: disregarded entity gaining owners → check "Partnership" box per Reg. §301.7701-3(f); "don't use the former owner's EIN unless you became the 'owner' of a corporation by acquiring its stock"), and single-member-LLC default classification rules all check out against irs.gov. Pricing (line 104: Standard $149/5-7 days, Express $199/3 days, +$99/year, fax included, EIN $149) matches `pricing.ts` and `src/lib/llms.ts` exactly.

**P1**

- Lines 132–134 (FAQ, "Does Form 8832 fix a missed Form 5472?"): answer is 69 words, well over the 50-word FAQ cap. **Fix:** trim, e.g. cut down to "No. Form 8832 changes classification when validly filed but does not erase a prior Form 5472 obligation for a year when the LLC was a foreign-owned U.S. DE." (~28 words).
- Line 36 ("The IRS single-member LLC page says...") and line 66 ("The IRS SS-4 instructions state...") — both claims are factually accurate (verified) but neither is hyperlinked to its irs.gov source, unlike the rest of the post's sourced claims. **Fix:** link "IRS single-member LLC page" to `https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies` and "IRS SS-4 instructions" to `https://www.irs.gov/instructions/iss4`.

**P2**

- None material — this post is the strongest of the four: proprietary "date, party, percentage, value" event-log framework (line 82, explicitly labeled "Original element"), conversion link placed both in the first screen (line 15) and near the close (line 136), all internal links resolve 200.

---

## form-5472-cost — score 32/38

**P0**

- Line 5 (frontmatter `updated: 2026-08-14`) vs. Line 11 (body text: *"**Last updated: July 2026**"*) — **internal conflict.** The frontmatter says the post was last updated August 14, 2026; the visible body copy tells readers it was last updated in July 2026. These are two different, conflicting statements of the same fact on the same page. **Fix:** change line 11 to "Last updated: August 2026" to match the frontmatter (or correct whichever date is actually accurate).

**P1**

- Lines 13, 27, and 81 (repeated 3×): *"US CPA firms that publish prices commonly quote $600 to $750"* — a specific dollar figure presented three times with no named, checkable source (no specific firm, survey, or publication cited or linked). This is exactly the "number with no source" pattern the brief's line 5/6 asks to flag. **Fix:** either name and link a specific source (e.g., a named CPA firm's published pricing page) or soften to "we surveyed several CPA firms' published pricing pages and commonly saw $600–$750" with at least one example link.
- Lines 83–85 (FAQ, "Can I file Form 5472 for free?"): answer is 56 words, over the 50-word cap. **Fix:** trim, e.g. drop the closing clause "so free DIY only pays off if you complete it correctly and on time."
- Lines 87–89 (FAQ, "How much does it cost to file multiple years of Form 5472?"): answer is 58 words, over the 50-word cap. **Fix:** cut the last sentence about Express-tier catch-up costs into a separate short line or remove it.
- Line 13: the bold lead answer runs to roughly 85 words, notably longer than the brief's 40–60 word target for the quotable direct-answer block. **Fix:** shorten to the core claim ($0 IRS fee / $149 starting price / $25,000 penalty) and move the DIY/CPA comparison detail to the next paragraph, which already covers it.

**P2**

- None additional — pricing math throughout (the 2-year/3-year DIIRSP catch-up worked example at lines 47–55, and the Standard/Express catch-up totals at line 55) was independently recomputed and is correct in every instance.

---

## form-5472-currency-conversion-exchange-rates — score 35/38

**P0**

- Line 80: link text *"[owner-loans and contributions guide](/blog/form-5472-owner-loans-contributions-reimbursements)"* — **broken link.** `curl -sI https://www.form5472prep.com/blog/form-5472-owner-loans-contributions-reimbursements` returns **404**. **Fix:** confirm the correct published slug for that post and update the link, or remove it until the target post ships.
- Line 133: link text *"[recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)"* — **broken link.** `curl -sI https://www.form5472prep.com/blog/form-5472-recordkeeping-checklist` returns **404**. This is also the post's near-close related-post link, so it fails the "related post link resolves" requirement at the most visible spot. **Fix:** same as above — correct slug or remove.

**P1**

- Lines 129–131 (FAQ, "Does customer revenue need currency conversion for Form 5472?"): answer is 51 words, one word over the 50-word cap. **Fix:** trim by one clause, e.g. "Usually not merely because customers paid the LLC. Form 5472 focuses on related-party transactions — owner contributions, distributions, loans and reimbursements are the usual conversion focus." (~28 words).

**P2**

- None material — this is the strongest fact-check of the four posts. The 2025 yearly-average exchange rates quoted at line 13 (Euro Zone euro 0.886, UK pound 0.759, Canada dollar 1.398, India rupee 87.133 — all per USD) were independently verified against the live IRS yearly-average-currency-exchange-rates page and are exact matches. The worked conversion arithmetic (line 23: EUR 10,000 / 0.886 = USD 11,286.68; line 24: GBP 2,500 / 0.759 = USD 3,293.81) was independently recomputed and is correct. The "direction test" (line 54) is a genuine original framework. Pricing at line 101 matches source of truth exactly.

---

## Internal/external link check summary (all 4 posts combined)

| Link | Status |
|---|---|
| /blog/form-5472-filed-late-never-filed | 200 |
| /blog/what-is-form-5472 | 200 |
| /start | 200 |
| /blog/multi-member-llc-form-5472-or-1065 | 200 |
| /ein | 200 |
| /pricing | 200 |
| /form-5472-fax-number | 200 |
| /diirsp | 200 |
| /blog/form-5472-diy-vs-preparer | 200 |
| /blog/form-5472-owner-loans-contributions-reimbursements | **404** (used in currency-conversion post, line 80) |
| /blog/amended-form-5472-correcting-errors | 200 |
| /blog/form-5472-recordkeeping-checklist | **404** (used in currency-conversion post, line 133) |
| irs.gov/instructions/i5472 | 200 |
| irs.gov/instructions/i1120 | 200 |
| irs.gov/forms-pubs/about-form-7004 | 200 |
| irs.gov/forms-pubs/about-form-5472 | 200 |
| irs.gov IRS yearly average currency exchange rates page | 200 |

No comptroller.texas.gov or other DNS-blocked domains appear in these 4 posts, so no "unverifiable here" cases in this batch.
# Blog GEO/AEO audit — Part B (2026-08-19)

Scope: content/blog/form-5472-deadline-2026.md, content/blog/form-5472-diy-vs-preparer.md, content/blog/form-5472-dormant-llc-no-income.md
Method: working-tree .md files read in full; IRS.gov / eCFR / Cornell LII primary sources verified via WebFetch/WebSearch for every checkable claim; all internal (form5472prep.com) and external links checked with `curl -sI`/`curl -s -o /dev/null -w "%{http_code}"`; pricing verified against src/lib/pricing.ts (Standard $149, 5-7 business days; Express $199, 3 business days; +$99 per additional past tax year on either tier; fax included — confirmed exact match to brief). 19-line rubric (17 brief lines + addendum lines 18 integrity, 19 FAQ pattern), 0-2 each, max 38.

---

## form-5472-deadline-2026 — score 37/38

Line scores: 1:2 2:2 3:2 4:2 5:2 **6:1** 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

**P0 (wrong/invented fact, broken link, wrong price):**
- **Line 38**: `For a fiscal-year LLC, the due date is the 15th day of the fourth month after the end of the tax year. A tax year ending 30 June is due 15 October.` — WRONG for the fiscal years this article is actually being read against in August 2026. Per IRC §6072(b) and the current Form 1120 instructions (verified via WebFetch of irs.gov/instructions/i1120): a corporation with a fiscal tax year ending **June 30** that **began before January 1, 2026** is due the 15th day of the **3rd** month (**September 15**, not October 15) and gets a **7-month** extension (to April 15, not October 15). The 4th-month/October-15 rule the post states as universal only applies to a June 30 fiscal year that began on/after January 1, 2026 — i.e., first affects a fiscal year ending June 30, **2027**. As written, a reader with an LLC whose fiscal year ended June 30, 2026 (began July 1, 2025) is told the wrong due date (October 15, 2026 instead of the correct September 15, 2026), risking a late filing and the $25,000 penalty this same article warns about.
  - **Fix**: Replace the sentence with: "For a fiscal-year LLC, the due date is generally the 15th day of the fourth month after the tax year ends — *except* a tax year ending June 30 that began before January 1, 2026, which is due the 15th day of the 3rd month (15 September) with a 7-month extension to 15 April. Only a June 30 fiscal year beginning on or after January 1, 2026 (first: FYE 30 June 2027) follows the standard 4th-month/15 October rule." Cite IRC §6072(b).

**P1 (standard violation):**
- None beyond the P0 above — this post is otherwise the strongest of the three (early + late /start links, 2 external irs.gov links, correct pricing, correct fax number 855-887-7737, correct $25,000/IRC §6038A(d) penalty language verified word-for-word against irs.gov/instructions/i5472, correct Form 7004 fax-or-mail quote verified word-for-word, correct 26 CFR §1.6081-5 citation verified).

**P2 (polish):**
- **Line 133** (FAQ answer, "Is there an automatic extension because I live outside the United States?") runs 57 words, 7 over the ≤50-word FAQ-extractor guideline (line 9 of rubric).
  - **Fix**: Trim, e.g. drop the trailing clause "...but the Form 5472 instructions do not address that route for a pro forma Form 1120 filed by a foreign-owned DE" down to "...but the Form 5472 instructions don't extend that route to a foreign-owned DE's pro forma 1120."
- **Line 13**: the first in-body mention of "$25,000 penalty" has no inline citation (it's cited properly later at line 65 with IRC §6038A(d) and a direct irs.gov quote). For GEO extraction where the opening paragraphs may be lifted standalone, consider adding "(IRC §6038A(d))" inline at first mention too.

---

## form-5472-diy-vs-preparer — score 30/38

Line scores: **1:1** 2:2 3:2 4:2 **5:1** **6:1** 7:2 8:2 9:2 **10:1** **11:0** **12:1** 13:2 14:2 15:2 16:2 **17:1** 18:2 19:2

**P0 (wrong/invented fact, broken link, wrong price):**
- **Line 55**: `Some DIY filers confuse this with the Form 5472 filed by foreign corporations, which uses a real Form 1120 — an entirely different return.` — FACTUALLY WRONG entity/form pairing. Verified via WebSearch/irs.gov: a "reporting corporation" for Form 5472 is either (a) a 25%-foreign-owned **domestic** corporation (including a foreign-owned DE, which uses the pro forma Form 1120 this article is about), or (b) a **foreign** corporation engaged in a US trade or business, which files its Form 5472 attached to **Form 1120-F**, not Form 1120. The post's contrast — "foreign corporations... use a real Form 1120" — mislabels the entity type that actually uses a real (non-pro-forma) Form 1120 (that's the 25%-foreign-owned *domestic* corporation with real income, not a foreign corporation). This is a real, checkable error, and it sits inside the section specifically warning DIY filers against exactly this kind of entity-type confusion.
  - **Fix**: `Some DIY filers confuse this with the Form 5472 filed by a 25%-foreign-owned domestic US corporation with real income, which attaches to an actual (non-pro-forma) Form 1120, or by a foreign corporation doing business in the US, which attaches to Form 1120-F — different filings with different rules.`

**P1 (standard violation):**
- **Whole post — Line 11 (external sourcing)**: zero external links anywhere in the post, despite discussing IRS forms/instructions extensively. Line 45 even says "The IRS instructions for Form 5472 are available at irs.gov" as **plain unlinked text** rather than a hyperlink. Standard requires 2-4 external authoritative links; this post has 0.
  - **Fix**: Hyperlink "irs.gov" at line 45 to `https://www.irs.gov/instructions/i5472` (verified 200), and add a second external link — e.g. at line 169 where the fax number is stated, link the sentence to the same IRS instructions page.
- **Line 183 (only)**: the site's conversion target `/start` is linked exactly once, on the very last line of a 183-line post. There is **no** /start (or any conversion) link in the first screen, violating rubric line 10 ("internal link to conversion target within first screen AND near close").
  - **Fix**: Add an early /start CTA within the first ~20 lines — e.g. append to the "Here's the full breakdown" sentence at line 18: "Here's the full breakdown so you can make the call for your situation — or [start your filing now](/start?...) if you already know you want it handled."
- **Lines 102-104** (cost table: "Traditional CPA / accounting firm | $300–$700", "Online compliance services (doola, entity.inc, etc.) | $225–$400", "Freelancers (Fiverr, Upwork) | $25–$100"): these competitor/market price ranges are stated as fact with no named source, survey, or methodology — unverifiable per rubric line 5/6 ("flag any number with no source").
  - **Fix**: Either attribute the ranges (e.g., "based on our review of publicly listed pricing, August 2026") or soften to qualitative framing ("CPA firms typically charge several hundred dollars more...") if the numbers aren't from a documented source.
- **Line 173** (FAQ, "How do I know if my Form 5472 was accepted?"): `they'll send a letter — typically 6–18 months after filing` — an unsourced timing estimate stated with false precision.
  - **Fix**: Cite a source for the range, or rephrase as "can take well over a year" without the specific bounds.

**P2 (polish):**
- **Lines 12-16** (opening bold answer + elaboration): full first paragraph is 64 words, slightly over the 40-60 word "quotable direct answer" target; the bolded clause alone is only 27 words (too short to stand alone as the quotable snippet).
  - **Fix**: Trim the non-bold continuation by ~5 words, e.g. shorten "Pay someone if you have late or multi-year filings, or if you're unsure what counts as a reportable transaction" to "Pay someone for late, multi-year, or ambiguous filings."
- **Word count**: 1,021 words vs. the ≥1,200-word bar for narrow how-to/comparison posts (rubric line 17) — thin relative to standard for a DIY-vs-preparer comparison with this much decision-relevant nuance.
  - **Fix**: Expand with a worked cost example (e.g., "3-year DIIRSP catch-up: DIY hours vs. preparer cost math") or 1-2 more FAQ entries.
- **Line 27** (TL;DR table, "Time" row): `3–8 hours first time` / `15–30 minutes on your end` — unsourced time estimates presented as data.
  - **Fix**: Soften with "roughly" framing, or note it's based on internal customer intake if that's the actual basis.
- **Line 12 vs. line 26 frontmatter `updated: 2026-08-14`**: frontmatter "updated" is present (passes half of rubric line 12) but there is no natural current-year reference anywhere in the body text (no "in 2026" / "as of 2026").
  - **Fix**: Add a light current-year anchor, e.g. in the intro: "As of 2026, DIY filers still can't e-file this return — it's fax-only."

---

## form-5472-dormant-llc-no-income — score 29/38

Line scores: **1:1** 2:2 3:2 4:2 **5:1** 6:2 7:2 8:2 **9:1** **10:1** **11:1** **12:1** 13:2 **14:1** 15:2 16:2 **17:0** 18:2 19:2

**P0 (wrong/invented fact, broken link, wrong price):**
- None found. The load-bearing legal claims check out against primary sources: 26 CFR §1.6038A-2's zero-transaction exemption (verified via law.cornell.edu — "A reporting corporation is not required to file Form 5472 if it has no transactions... during the taxable year with any related party," matching lines 50/57), the $25,000/IRC §6038A(d) penalty (verified against irs.gov), the Ogden PIN Unit fax number 855-887-7737 (line 106, verified), and the general "opening deposit = reportable capital contribution" framing are all accurate. This post's problems are depth/sourcing/structure, not invented facts — see P1 below for two claims that are directionally right but oversimplified enough to flag.

**P1 (standard violation):**
- **Whole post — pricing never stated**: unlike the other two audited posts, this post never quotes a price anywhere in its ~846 words, despite three CTAs (lines 27, 91/93, 138) driving to `/start` and `/diirsp`. Rubric line 14 calls for pricing quoted matching the source of truth; this post has no pricing to check against — a missed conversion lever, not a wrong number.
  - **Fix**: Add a sentence near the line 93 CTA: "Standard filing starts at $149 (5-7 business days), $199 for express (3 business days), +$99 per additional past tax year — IRS fax delivery included on both."
- **Lines 27 / 91 / 93 / 138** (conversion-link placement): `/diirsp` is linked three times (lines 27, 91, 138) but the site's primary conversion target `/start` appears only **once**, at line 93 — roughly 66% through a 140-line post, not in the first screen and not immediately at the close either (the final two links, lines 138 and 140, go to `/diirsp` and `/blog/what-is-form-5472`, not `/start`). Violates rubric line 10 ("link to conversion target within first screen AND near close").
  - **Fix**: Add a `/start` link either in the TL;DR block (lines 20-28) or in the closing "bottom line" paragraph (lines 134-140) so `/start` itself — not only `/diirsp` — appears both early and at the close.
- **Whole post — external sourcing**: only **one** external link in the entire post (irs.gov/instructions/i5472 at line 12). Rubric line 11 wants 2-4. The article names "26 CFR §1.6038A-2" (line 50) and "the delinquent international information return submission procedures" (implied at lines 87-93, and directly quoted/linked in the sibling deadline-2026 post) but never links either here.
  - **Fix**: Hyperlink "26 CFR §1.6038A-2" at line 50 to `https://www.law.cornell.edu/cfr/text/26/1.6038A-2`, and add a link to `https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures` in the "haven't filed for prior years" section (lines 87-91).
- **Line 126**: `For returns that were filed, the IRS generally has 3 years to assess additional tax (6 years for substantial omissions). For returns that were never filed, the period doesn't start running. In practice, DIIRSP submissions typically cover the last 6 years.` — Both figures are stated as fact with no inline citation. Verified via WebSearch/WebFetch: the general 3-year/6-year rule is a fair summary of IRC §6501(a)/(e), but the post **omits the more consequential rule for this exact audience** — IRC §6501(c)(8), confirmed via search: an unfiled Form 5472 keeps the assessment period open for the **entire tax return** (not capped at 3/6 years), running until **3 years after the missing form is actually filed** — a materially bigger deal for a dormant-LLC reader deciding whether "no one noticed" means "safe." Separately, the "DIIRSP submissions typically cover the last 6 years" figure is a practitioner convention borrowed from FBAR/OVDP practice, not an IRS-published DIIRSP rule — unsourced as stated.
  - **Fix**: Rewrite to lead with §6501(c)(8): "Unfiled Form 5472s do more than sit exposed indefinitely — under IRC §6501(c)(8), a missing Form 5472 can keep the IRS's assessment window open for your *entire* tax return until three years after you actually file it. In practice, DIIRSP submissions commonly cover the last six years (a practitioner convention, not a fixed IRS rule)."
- **Lines 128-130** (FAQ, "Is there any penalty relief available?"): `First-time abatement is available for taxpayers with a clean filing history.` — Verified via WebSearch: FTA eligibility for Form 5472 is narrow in practice — it generally applies only when it's tied to abatement of the **related Form 1120's** late-filing penalty under FTA, with no similar penalty in the prior 3 periods, not a general/direct FTA grant on the Form 5472 penalty itself. As written, this overstates how routinely FTA applies here.
  - **Fix**: `Limited first-time abatement may apply when it's tied to abatement of the related Form 1120 late-filing penalty and you have a clean 3-year compliance history; reasonable-cause abatement is the more commonly available route for a standalone Form 5472 penalty.`

**P2 (polish):**
- **FAQ answer lengths** (rubric line 9, ≤50 words): three of five answers exceed the guideline — line 112-114 ("If my LLC had zero bank activity...") 59 words; line 120-122 ("Can I just dissolve the LLC...") 53 words; line 124-126 ("How far back does the IRS go?") 52 words.
  - **Fix**: Trim each to ≤50 words for cleaner PAA/AEO extraction.
- **Word count**: 846 words — the thinnest of the three audited posts, below both the ≥1,200-word narrow-post bar and the brief's original <900-word "thin" flag threshold, on a topic (dormant LLC filing obligations) that has real room for a worked example.
  - **Fix**: Add a concrete worked example ("$200 opening deposit, $0 revenue: still a reportable capital contribution — here's what Part V would show"), or 2-3 more FAQ entries, to clear 1,200 words.
- **Line 12 vs. `updated: 2026-07-06`**: frontmatter "updated" is present (half credit on rubric line 12) but no natural current-year reference appears in the body text.
  - **Fix**: Add a light anchor, e.g. "As of 2026, the IRS still has no e-file option for this return."
- No comparison table is present (only bullet/numbered lists); the numbered "traps" list (lines 69-84) satisfies rubric line 4's "numbered process list" alternative, so this is low-severity, but a short table (transaction type → reportable? → where it lands on Part V) would strengthen both line 4 and line 7 (proprietary element).

---

## Links checked (all internal + external, HTTP status)

All returned **200**, no redirects observed (checked both with and without `-L`):
`/start`, `/`, `/blog/form-5472-extension`, `/blog/form-5472-penalty-notice-what-to-do`, `/blog/form-5472-dormant-llc-no-income`, `/blog/what-is-form-5472`, `/blog/form-5472-filed-late-never-filed`, `/diirsp`, `https://www.irs.gov/instructions/i5472`, `https://www.irs.gov/individuals/international-taxpayers/delinquent-international-information-return-submission-procedures`.

## Assets checked (pre-verified by orchestrator, confirmed here)

- `public/blog/form-5472-deadline-2026.webp` (18,604 bytes) — exists.
- `public/blog/form-5472-diy-vs-preparer.webp` (76,356 bytes) — exists.
- `public/blog/form-5472-dormant-llc-no-income.webp` (40,984 bytes) — exists.
- `src/lib/blog.ts` `ARTWORK_ALTS` has entries for all three slugs (lines 123, 124, 143) — confirmed via grep.

## Pricing source of truth (src/lib/pricing.ts, confirmed by direct read)

Standard $149 (`priceCents: 14900`), 5-7 business days (`STANDARD_TURNAROUND`); Express $199 (`priceCents: 19900`), 3 business days (`EXPRESS_TURNAROUND`); `MULTI_YEAR_ADDON_CENTS = 9900` ($99) per additional past tax year on either tier; fax delivery included (`FAX_FEE_CENTS = 0`, folded into `SHARED_FEATURES`). No $449, no "$199 flat," no "$149 per additional year" anywhere in pricing.ts. form-5472-deadline-2026 and form-5472-diy-vs-preparer quote this exactly; form-5472-dormant-llc-no-income quotes no pricing at all (flagged above).
# Blog GEO/AEO audit — Part C (3 posts)

Scoring: 19 lines (17 from brief + addendum lines 18/19), 0-2 each, max 38.
Source of truth for content: working-tree `content/blog/<slug>.md`. Live site (www.form5472prep.com) used only to verify link-target HTTP status.
Pricing source of truth confirmed by reading `src/lib/pricing.ts`: Standard $149 (5-7 business days), Express $199 (3 business days), +$99 per additional past tax year (either tier), fax delivery included on both. Confirmed exactly — no drift found in any of the 3 posts.

---

## form-5472-extension — score 37/38

Fact-check (all verified against current IRS Form 5472 instructions, i5472 Rev. 12-2024, and Form 7004/i7004):
- Fax to 855-887-7737 or mail for Form 7004 when filed by a foreign-owned DE — VERIFIED TRUE, IRS explicitly says: "The DE must fax or mail the Form 7004... For these entities, do not use the regular filing address listed in the Instructions for Form 7004."
- "Foreign-owned U.S. DE" written across the top of Form 7004 — VERIFIED TRUE, exact IRS phrase.
- Form 1120 code entered on Form 7004 Part I, line 1 — VERIFIED TRUE (Form 1120 = code 12).
- $25,000 penalty under IRC §6038A(d), extension doesn't reduce it — VERIFIED TRUE.
- April 15 → October 15 six-month extension mechanics — VERIFIED TRUE.
Links: all 9 internal links (`/form-5472-deadline`, `/start` x3, `/diirsp`, `/blog/form-5472-filed-late-never-filed`, `/pricing`) return 200. Both external links (irs.gov/instructions/i5472, irs.gov/forms-pubs/about-form-7004) return 200.
Image: `public/blog/form-5472-extension.webp` exists (52.0K). `src/lib/blog.ts` line 120 has the ARTWORK_ALTS entry. Pass.
Pricing (line 63): "$149 Standard (ready in 5-7 business days) or $199 Express (ready within 3 business days)... +$99 per additional past year" — matches pricing.ts exactly.
Word count: 1,443 (narrow how-to bar ≥1,200 — passes).
No duplicate H2s, no placeholders, frontmatter parses (title 53/60 chars, description 151/155 chars). FAQ H2 exact match "## Frequently asked questions" with 5 H3 questions (≥4 required).

- P0 (wrong/invented fact, broken link, wrong price): none found.
- P1 (standard violation): none found.
- P2 (polish):
  - Line 13-19 (opening/first-30%): the intro gives a direct answer and an internal conversion link, but no explicit sourced numeric stat (number + population + source) appears until line 51 (~35% into the post, just past the 30% mark). Fix: pull one sourced figure (e.g., the $25,000 penalty with its IRC §6038A(d) citation, already used at line 51) up into the opening paragraph so a quotable stat lands inside the first 30%.
  - Line 44-49 (comparison table): solid original framework but could be labeled explicitly as original (e.g. "Our extension-reality checklist") to strengthen the proprietary-element signal (line 7 of rubric) — currently unlabeled, so an extractor/reader has no cue it's original.

---

## form-5472-filed-late-never-filed — score 30/38

Fact-check (verified against IRS i5472 instructions, IRC §6038A, 26 CFR Part 1/301, and IRS IRM 20.1.1/20.1.9):
- $25,000 initial penalty per form/year, IRC §6038A(d) — VERIFIED TRUE.
- $25,000-per-30-day continuation penalty, uncapped — VERIFIED TRUE as a number, but **the post omits the statutory 90-day grace period**. IRC §6038A(d)(2) only starts the continuation penalty "for each 30-day period... during which such failure continues **after the expiration of [a] 90-day period**" following the IRS's notice — the penalty does NOT start accruing immediately when the IRS "mails a notice," as the post implies.
    - **P0** — Line 22: `- **The penalty** is $25,000 per form, per year, under IRC §6038A(d). It continues at $25,000 per 30-day period after the IRS notifies you of the failure.` — Missing the 90-day threshold; reads as if the stacking penalty starts the moment a notice is mailed. Fix: `...It continues at $25,000 per 30-day period if you still haven't filed 90 days after the IRS mails its notice of failure.`
    - **P0** — Line 35: `- An additional **$25,000 for each 30-day period** (or part of a period) after the IRS mails a notice of failure, capped at nothing — the statute doesn't impose a ceiling on the continuation penalty.` — Same omission, in the section the audit brief specifically asked to fact-check. Fix: add "...if the failure continues more than 90 days after that notice..." before "capped at nothing."
- **P0** — Line 73: `The reasonable cause standard under Treas. Reg. §301.6724-1 means you exercised ordinary business care and prudence but still failed to file correctly.` — **Wrong citation.** Treas. Reg. §301.6724-1 is the reasonable-cause regulation for the §6721/6722/6723 information-return penalty regime (W-2/1099-series), not for §6038A. The correct regulation for Form 5472/§6038A reasonable cause is **26 CFR §1.6038A-4** ("Monetary penalty"). Fix: replace "Treas. Reg. §301.6724-1" with "26 CFR §1.6038A-4" (same surrounding sentence otherwise stands — the "ordinary business care and prudence" standard itself is a legitimate general reasonable-cause formulation, just cited to the wrong regulation here).
- Line 63: "There's no statute of limitations on unfiled returns... the three-year assessment period doesn't start running" — consistent with IRC §6501(c)(8) (statute stays open on the whole return when a required international information return like Form 5472 is unfiled). Verified true in substance, though the post cites no source at all for this claim (no link, no code-section reference) — see P1 below.
- Line 65: "In practice, DIIRSP submissions typically cover the last six years." — **Could not verify as an official IRS rule.** No IRS-published DIIRSP page specifies a 6-year lookback; this appears to be informal practitioner convention (borrowed from the IRS's general 6-year voluntary-disclosure lookback used elsewhere), not a DIIRSP-specific mandate.
    - **P1** — Line 65: presented as settled practice with no hedge or source. Fix: soften to "Many practitioners recommend covering the last six years as a rule of thumb (this isn't an IRS-mandated lookback period)" or cite a specific practitioner source.
- Line 148-150 FAQ ("Is first-time abatement available..."): FTA does not apply to §6038A penalties — VERIFIED TRUE (FTA is limited to §§6651/6654/6656-family penalties per IRM 20.1.1; international-return penalties sit under IRM 20.1.9, outside FTA scope).
- Fax number 855-887-7737 — VERIFIED TRUE against i5472.

Links: all internal links (`/diirsp`, `/blog/what-is-form-5472`, `/blog/form-5472-dormant-llc-no-income`, `/start`) return 200. External: only **one** external link in the entire post (the DIIRSP IRS page, 200 OK) despite the post making several specific citable legal claims (IRC §6038A(d), the wrong Treas. Reg. cite, IRM/FTA policy) with no hyperlink to any of them.
- **P1** — Rubric line 11 requires 2-4 external authoritative links; this post has 1. Fix: hyperlink the IRC §6038A(d) statute (e.g. law.cornell.edu or irs.gov instructions) at line 32-35, and hyperlink the corrected 26 CFR §1.6038A-4 cite at line 73.

Internal-link placement (rubric line 10 — conversion link within first screen AND near close): the first internal link of any kind (to `/diirsp`) doesn't appear until line 126, roughly two-thirds through a 1,897-word post. Nothing links to `/start` or `/diirsp` in the opening TL;DR or penalty-explainer sections.
- **P1** — Fix: add a `/diirsp` or `/start` link inside the TL;DR block (lines 20-27) or immediately after the intro paragraph (line 12-16), not just at lines 126 and 162.

Image: `public/blog/form-5472-filed-late-never-filed.webp` exists (53.7K). `src/lib/blog.ts` line 125 has the ARTWORK_ALTS entry. Pass.
Pricing (line 126): "from $149" — matches pricing.ts (correct low-end anchor for the DIIRSP package).
Word count: 1,897 — passes both thresholds comfortably.
No duplicate H2s, no placeholders, frontmatter parses (title 58/60, description 152/155). FAQ H2 exact match, 5 whole-line-bold questions (≥4 required), but two run long:
- **P2** — Line 132-134 FAQ answer ("Can I go to jail...") is ~58 words, over the ≤50-word rubric limit. Fix: trim the last sentence ("Most foreign owners dealing with inadvertent non-filing have no criminal exposure.") or merge it into the prior sentence.
- **P2** — Line 144-146 FAQ answer ("What if I've already received an IRS penalty notice?") is ~54 words, over the ≤50-word limit. Fix: cut "you'll want to verify what years are covered" or shorten the closing sentence.
- **P2** — No in-body current-year reference (only frontmatter `date`/`updated` carry 2026); e.g. the April-15-deadline FAQ answer (lines 140-142) never states a tax year. Fix: add "...for calendar-year filers reporting the 2025 tax year" or similar to one deadline mention.

- P0: 3 (continuation-penalty 90-day omission ×2 lines, wrong regulation citation ×1 line)
- P1: 3 (unsourced "six years" DIIRSP claim, only 1 external link vs. required 2-4, conversion link missing from first screen)
- P2: 3 (two FAQ answers over 50-word cap, missing in-body current-year reference)

---

## form-5472-foreign-corporate-owner — score 37/38

Note: this file is locally modified and NOT yet deployed (confirmed via `git status --short`, which shows it as `M` while the other two posts in this batch are unmodified/already live) — consistent with the addendum's note that 15 posts were recently expanded locally. Audited the working-tree file as instructed; live-site checks below are for link *targets*, not this post's own live rendering.

Fact-check (verified against IRS i5472 instructions, the IRS single-member LLC page, and Form 8832 page):
- "25% foreign-owned U.S. corporation" / "foreign-owned U.S. disregarded entity" as reporting-corporation definition, $25,000 initial penalty — VERIFIED TRUE.
- "If a foreign disregarded entity directly owns the U.S. LLC, report the foreign disregarded entity as the direct owner" (line 34) — VERIFIED TRUE, matches i5472 verbatim guidance ("If the corporation has, as a direct owner, a foreign DE, report that foreign DE as the direct owner").
- "A separate Form 5472 is generally required for each related party with reportable transactions" (lines 11, 72, 128) — VERIFIED TRUE.
- Reference-ID requirement (lines 47, 51) — VERIFIED TRUE, matches i5472's reference-ID rule and the "consistent use year to year" requirement.
- "A single-member LLC owned by a corporation should be reflected on the owner's federal tax return as a division of the corporation" (line 17) — VERIFIED TRUE, near-verbatim from the IRS single-member LLC page.
- Part IV/V/VI descriptions (line 68) — VERIFIED TRUE against the actual Form 5472 part structure.
- Form 8832 election description (line 87) — VERIFIED TRUE.
  - **P2 (minor precision gap, not a defect worth P1)** — Line 19: "For tax years beginning on or after 1 January 2017, the IRS instructions treat a foreign-owned U.S. disregarded entity as separate from its owner... for section 6038A reporting." The IRS instructions actually state the rule applies to tax years "beginning on or after January 1, 2017, **and ending on or after December 13, 2017**" — the post drops the second (ending-date) prong, which matters only for a short first tax year. Fix: append "and ending on or after December 13, 2017" to the sentence for full precision.

Links: internal — `/start` (x2, both 200), `/ein` (200) all resolve. **`/blog/multiple-related-parties-form-5472` (lines 108 and 146) currently returns 404 on the live site.** The target file exists locally (`content/blog/multiple-related-parties-form-5472.md`) but carries `publishAt: "2026-09-21T09:00:00-04:00"` — a future-dated scheduled release (today is 2026-08-19) — so the 404 is a scheduling artifact, not a broken/dead link, per `src/lib/blog.ts`'s publish-gating logic.
  - **P1** — Lines 108, 146: `[multiple-related-parties guide](/blog/multiple-related-parties-form-5472)` / `[how multiple related parties are reported](/blog/multiple-related-parties-form-5472)` both currently 404 live. Fix: hold publishing this post until on/after 2026-09-21, or move the linked post's `publishAt` up to match this post's release, so the link is never live-but-broken.
External: 4 distinct authoritative links (irs.gov/instructions/i5472, irs.gov single-member-llc page, irs.gov/forms-pubs/about-form-8832, irs.gov/instructions/i1120) — all return 200. Within the 2-4 range required.

Image: `public/blog/form-5472-foreign-corporate-owner.webp` exists (75.1K). `src/lib/blog.ts` line 162 has the ARTWORK_ALTS entry. Pass.
Pricing (line 114): "Standard service is $149 in 5-7 business days, Express is $199 in 3 business days, each additional past tax year is +$99... EIN service is $149 at /ein" — matches pricing.ts exactly; EIN $149 price independently confirmed in `src/app/(marketing)/ein/page.tsx` line 136/289/334.
Word count: 1,808 — passes both the pillar-guide (≥1,600) and narrow-how-to (≥1,200) bars.
No duplicate H2s, no placeholders, frontmatter parses cleanly (title 48/60, description 141/155, `date`/`updated` both 2026-08-19). FAQ H2 exact match, 6 H3 questions (≥4 required), all answers well under 50 words. Explicit "Original element:" label on the party-by-party matrix (line 74) is a strong, clearly-flagged proprietary framework — best example of rubric line 7 in this batch.

- P0: 0
- P1: 1 (broken/not-yet-live internal link to a future-scheduled post, 2 occurrences same root cause)
- P2: 1 (missing "ending on or after December 13, 2017" qualifier on the 2017 effective-date claim)

---

## Batch totals
- Posts covered: 3 (form-5472-extension 37/38, form-5472-filed-late-never-filed 30/38, form-5472-foreign-corporate-owner 37/38)
- P0: 3 — all in form-5472-filed-late-never-filed (wrong regulation citation Treas. Reg. §301.6724-1 should be 26 CFR §1.6038A-4; two instances of omitting the IRC §6038A(d)(2) 90-day grace period before the continuation penalty starts)
- P1: 5 — 3 in filed-late-never-filed (unsourced "six years" DIIRSP claim, only 1 of required 2-4 external links, conversion link missing from first screen), 1 in foreign-corporate-owner (link to not-yet-published related post, 2 line occurrences counted as one root-cause defect), 0 in extension
- P2: 6 — 2 in extension, 3 in filed-late-never-filed, 1 in foreign-corporate-owner
