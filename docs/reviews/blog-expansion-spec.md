# Expansion spec — bring the 15 thin guides up to the sales-blog-geo-aeo standard

Repo: /Users/sumyeung/Documents/Codex/form5472. Edit ONLY the content/blog/<slug>.md files assigned to you. No git writes (no add/commit/stash).

## Objective
Each assigned post is factually correct but thin (790–960 words, templated). Rewrite/expand it IN PLACE to a genuine pillar-quality guide of **1,600–2,200 words** that keeps every existing verified fact and adds depth, evidence and an original element — without inventing anything.

## Exemplars for voice, depth and structure (read two before writing)
- content/blog/form-5472-penalty-notice-what-to-do.md
- content/blog/does-foreign-owned-llc-pay-us-tax.md
- content/blog/form-5472-uk-residents-us-llc.md (for country guides)
Voice: plain, direct, second person, no puffery, no "In today's world". British-neutral spelling as in exemplars. Company is NOT a CPA firm and gives no tax advice — say so where the exemplars do.

## Required in every post (the standard)
1. Keep frontmatter title/description/date/tags EXACTLY as they are now; set `updated: 2026-08-19`.
2. Opening: keep the bold 40–60-word direct-answer paragraph (tighten if needed). Within the first 30% of the post: ≥1 **sourced statistic or sourced legal figure** stated as a full sentence with the source linked inline (e.g. the $25,000 penalty under IRC § 6038A(d) linked to https://www.irs.gov/instructions/i5472; a state fee linked to the state's own site; a treaty fact linked to the IRS treaty page https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z), AND a contextual link to the conversion target `/start?utm_source=blog&utm_medium=internal&utm_campaign=<slug>` woven into a sentence.
3. Question-form H2s. Each H2 opens with its answer, one concept per section, no cross-section pronouns ("as above", "this approach").
4. ≥1 comparison table AND ≥1 numbered procedure where the topic allows.
5. ≥1 **original element**: a worked numeric example with the arithmetic shown, a decision framework, a scenario set ("Four scenarios, worked through"), or a checklist unique to this post.
6. Country/state guides: a "Four scenarios, worked through" section (as in does-foreign-owned-llc-pay-us-tax.md) using that country's/state's real facts, and a section on the FTIN/identifier specific to that country (or state fee/report specific to that state).
7. Recency: keep/insert one natural 2026 body reference (2025 tax year due 15 April 2026 / 15 October 2026 extended).
8. Every number, fee, rate, deadline, treaty claim, form line reference: keep only if verified. New claims MUST be verified against a primary source (irs.gov, state Secretary of State / Department of Revenue, official treaty text, official national tax authority) using WebFetch/curl, and cited inline. If you cannot verify a figure, do not include it. Never invent statistics, studies, quotes or percentages.
9. 2–4 external authoritative links total; internal links to related posts are encouraged — links to /blog/<slug> are safe even if the sibling is not yet published (a render guard handles it), but prefer published siblings. Published siblings you may link: what-is-form-5472, form-5472-cost, form-5472-extension, form-5472-diy-vs-preparer, form-5472-dormant-llc-no-income, form-5472-filed-late-never-filed, form-5472-reportable-transactions-examples, form-5472-penalty-notice-what-to-do, foreign-owned-llc-filing-requirements-checklist, does-foreign-owned-llc-pay-us-tax, how-to-fill-out-form-5472, form-5472-deadline-2026, wyoming-llc-foreign-owner-tax-filing, ein-for-foreign-owned-llc-without-ssn, multi-member-llc-form-5472-or-1065, form-5472-uae-dubai-residents-us-llc, amended-form-5472-correcting-errors, form-5472-uk-residents-us-llc, form-5472-india-residents-us-llc, form-5472-canada-residents-us-llc, amazon-fba-foreign-sellers-form-5472, plus the other 14 in this expansion set.
10. A "## [Product] as the answer" style section before the FAQ, integrated as the natural solution: Form5472 Prep prepares Form 5472 + pro forma 1120 + Part V statement, reviewed by a qualified tax accountant, faxed to the IRS Ogden PIN Unit (855-887-7737) with timestamped receipt; **$149 Standard (5-7 business days), $199 Express (3 business days), +$99 per additional past tax year, fax included**. EIN service is $149 at /ein. No other prices exist.
11. `## Frequently asked questions` H2 with **6–8** `### ` questions, each answer ≤50 words, real People-Also-Ask phrasing.
12. Closing paragraph: restate the takeaway + CTA link to /start (utm as above, campaign suffix `-close`) + one related-post link.
13. Word count 1,600–2,200 (`wc -w` on the file). Do not pad; add real substance.

## Verification you must run and paste (per file)
- `wc -w content/blog/<slug>.md`
- Count of `### ` under the FAQ H2 (6–8) and max words per FAQ answer (≤50).
- `grep -oE '\]\((https?://[^)]+)' content/blog/<slug>.md | sort -u` and for each URL `curl -s -o /dev/null -w '%{http_code}' <url>` — all 200 (or 403 for bot-blocked gov sites; note it).
- `grep -nE '\$[0-9]' content/blog/<slug>.md` — every dollar figure is either $149/$199/$99/$25,000 or a verified, cited external figure.
- `npx vitest run src/lib/blog.test.ts` still passes (frontmatter parses).
Report per file: word count, the new sourced stat you added in the first 30%, the original element, list of every NEW factual claim with its source URL, and any spec gap.
