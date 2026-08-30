# Batch 4 audit — lane A (China, Brazil, Nigeria, LLC-vs-C-corp, US bank account)

Read-only audit against docs/reviews/blog-geo-aeo-audit-brief.md (incl. 2026-08-19 addendum, 19 scoring lines) and the legal-facts block in docs/reviews/new-posts-batch-3-spec.md (verbatim per new-posts-batch-4-spec.md §Standard). All five files are working-tree, not yet deployed. Facts verified live via WebFetch/WebSearch against irs.gov, law.cornell.edu, oecd.org, jtb.gov.ng, chase.com, wise.com, safe.gov.cn, gov.br on 2026-08-30. All internal /blog/ link targets confirmed to exist in content/blog/ AND to return 200 on the live site. All external links curl 200.

Scale: 0=fail, 1=partial, 2=pass, across 19 lines (line 18/19 are addendum additions) = /38.

---

## form-5472-china-residents-us-llc — score 38/38

- P0: none found.
- P1: none found.
- P2: none found. Minor stylistic note only — no action needed: the piece consistently uses "generally"/"typically" hedging, which is appropriate given no single blanket rule exists.

Fact-check detail: China listed as having an active treaty on the IRS A-to-Z page (confirmed via WebFetch); treaty does not extend to Hong Kong/Macau (confirmed via IRS Notice 97-40 / separate-treatment precedent, matches line 52 and FAQ). 18-digit Chinese Resident ID as individual TIN confirmed against OECD China TIN profile and independent sources (line 35). $25,000 penalty (line 15) and $25,000/30-day continuation after 90 days (line 115) match i5472 text verbatim. Fax 855-887-7737 / 300 DPI (line 113) and no-e-file rule confirmed against i5472. Pricing exact ($149/$199/+$99, EIN $149/ein). Bold answer block = 54 words. FAQ: 7 questions, all ≤50 words (22–31). Word count 2,049. Image + ARTWORK_ALTS entry present (blog.ts:159). Internal links (hong-kong post, owner-loans post) both exist and are 200 live. 4 external links, all 200. Illustrative RMB table arithmetic correct and explicitly labeled invented/illustrative (not presented as real rates).

---

## form-5472-brazil-residents-us-llc — score 38/38

- P0: none found.
- P1: none found.
- P2: none found.

Fact-check detail: Brazil absent from IRS treaty A-to-Z list — confirmed, no US–Brazil treaty in force (line 50). CPF (11-digit, individuals) / CNPJ (14-digit, legal entities) confirmed against OECD Brazil TIN profile and independent sources (line 35, table line 39–40). Penalty and 30-day continuation language (lines 15, 112) match i5472 verbatim. Fax/DPI/no-e-file (line 110) confirmed. Pricing exact. Bold answer block = 56 words. FAQ: 7 questions, all ≤50 words (24–32). Word count 1,951. Image + ARTWORK_ALTS entry present (blog.ts:160). One internal link (foreign-owned-llc-filing-requirements-checklist), exists and 200 live. 4 external links (incl. Receita Federal PDF on CFC-ish rules, cited qualitatively per spec with no rates stated — correct), all 200. Illustrative BRL table arithmetic correct.

---

## form-5472-nigeria-residents-us-llc — score 37/38

- P0: none found.
- P1: none found.
- P2 (polish): line 79, "This approach prevents a common double count..." — self-referential "this approach" phrasing the audit brief explicitly names as a banned cross-chunk pronoun pattern (line 3 of rubric). It refers back to the numbered procedure two lines above within the *same* H2 section, so it is not truly cross-section, but it matches the banned phrase list literally. Fix: replace with "Reconciling the chain first prevents a common double count..." or similar to remove the referential opener. Deduct 1 point on line 3 (2→1) for this instance.

Fact-check detail: this post makes the most specific, most-checkable new factual claim in the batch — that a new Nigerian Tax ID portal went live 1 January 2026 issuing a 13-digit Tax ID retrievable via NIN (individuals) or CAC number (businesses), replacing the JTB TIN system (lines 35–46). Independently verified via WebSearch against saharareporters.com, fctirs.gov.ng, lirs.gov.ng, legit.ng, ogbongeblog.com — all corroborate the 1 Jan 2026 launch, 13-digit Tax ID, and NIN/CAC retrieval mechanics exactly as stated. This is accurate and well-sourced, not invented. Nigeria absent from IRS treaty A-to-Z (line 52) — confirmed, no treaty. Wise NGN-to-Nigeria-bank-accounts claim (line 67, FAQ) confirmed verbatim against wise.com's own NGN transfer guide. Penalty/fax/DPI/no-e-file lines (121, 119) match i5472. Pricing exact. Bold answer block = 58 words. FAQ: 7 questions, all ≤50 words (23–32). Word count 2,099. Image + ARTWORK_ALTS entry present (blog.ts:161). One internal link (stripe-paypal-wise-form-5472), exists and 200 live. 4 external links, all 200. Illustrative NGN table arithmetic correct.

---

## llc-vs-c-corp-non-resident-founders — score 38/38

- P0: none found.
- P1: none found.
- P2: none found. Note (not a defect): the "numbered procedure" rubric line is satisfied by the 5-question decision framework (lines 58–64) rather than an operational step-by-step procedure — appropriate given this is a decision guide, not a how-to, and the framework doubles as the required original element.

Fact-check detail: IRC §11 21% corporate rate confirmed verbatim against law.cornell.edu text ("shall be 21 percent of taxable income," lines 42, 128). IRC §871(a) 30% withholding on US-source dividends to NRAs, subject to treaty reduction, confirmed against law.cornell.edu (lines 48, 50). $25,000 penalty applies to both structures' Form 5472 (lines 37, 96) — correctly stated as identical exposure regardless of entity choice, matches i5472. Form 1120 instructions citation (line 21) re: domestic corporation electing association status and Form 8832 attachment — consistent with IRS instructions. Pricing exact. Bold answer block = 50 words. FAQ: 7 questions, all ≤50 words (23–36). Word count 2,276 (top of 1,700–2,300 range but compliant). Image + ARTWORK_ALTS entry present (blog.ts:162). Three internal links (foreign-owned-llc-filing-requirements-checklist, form-8832-election-foreign-owned-llc, multi-member-llc-form-5472-or-1065) — all exist in content/blog/ and all return 200 live (form-8832 is a batch-4 sibling, confirmed already deployed). 4 external links, all 200. No invented VC statistics — correctly declined to cite any (line 40's Stripe Atlas mention is a neutral factual statement about platform capability, not a statistic).

---

## us-bank-account-foreign-owned-llc — score 38/38

- P0: none found.
- P1: none found.
- P2: none found.

Fact-check detail: CP575 claims (lines 15, 38) verified against IRS's own CP575 explainer page — "confirms your EIN," "may need to confirm your EIN when you open a bank account," and "the original CP575A-J series... cannot be duplicated or recreated" all match IRS page text near-verbatim. Chase document list and the member/manager in-person-presence requirement (line 52) confirmed against chase.com/business/resources/business-bank-account-information — page does require "all members" (member-managed) / "all managers" (manager-managed) present, with a 30-day pre-authorization exception; post's framing ("relevant people... need to be present... under its in-person requirements") is an accurate paraphrase, not an overstatement. Wise US business verification requirements (line 30) match wise.com's own guide. Mercury/Relay/Wise named neutrally with an explicit no-partnership, no-recommendation disclaimer (line 50) — meets the brief's requirement. No fee figures invented — the only dollar figures are $149/$199/$99 pricing and the explicitly-illustrative funding-trail table (lines 78–87), correctly labeled "illustrative funding trail, created for the guide" and arithmetic checks out ($8,000+$1,250=$9,250; the $9,000 net figure is stated only to be rejected, not asserted as the LLC's number). EIN-first sequencing and the /ein secondary CTA appear in the first paragraph, ahead of the primary /start CTA — matches brief #6. First-deposit-is-reportable framing (lines 72–89) is squarely grounded in §1.6038A-2 Part V rules, no overreach. Penalty/fax/DPI/no-e-file (line 117, 115) match i5472. Bold answer block = 52 words. FAQ: 7 questions, all ≤50 words (23–35). Word count 2,200. Image + ARTWORK_ALTS entry present (blog.ts:163). One internal link (foreign-owned-llc-filing-requirements-checklist), exists and 200 live. 4 external links, all 200.

---

## Cross-post checks (all 5)

- No duplicated H2s, no truncated sections, no placeholder text ("[date]"/TODO/lorem) in any file.
- No conflicting statements of the same fact within any single post.
- All frontmatter blocks parse: title ≤60 chars (39–45), description ≤155 chars (136–144), date/updated both 2026-08-28, author, 3–5 kebab tags, draft: false.
- FAQ H2 is exactly `## Frequently asked questions` in all five (matches extractor regex); every question is `### `.
- Pricing is uniform and correct across all five: Standard $149 (5-7 business days), Express $199 (3 business days), +$99/additional past tax year, fax included, EIN $149 at /ein. No $449, no flat $199, no wrong per-year figure. ITIN pricing not mentioned in any of the five (not required by their briefs).
- utm_campaign values match `<slug>` in the opening /start link and `<slug>-close` in the closing CTA in all five; each closing section also carries one related-post link.
- No invented statistics anywhere in the batch — every non-illustrative number carries an inline source link, and every illustrative worked-example figure is explicitly labeled as illustrative/invented for teaching arithmetic.

## Summary

- **P0: 0**
- **P1: 0**
- **P2: 1**

Three worst findings:
1. Nigeria post, line 79: "This approach prevents a common double count..." — uses the exact banned self-referential phrase pattern ("this approach") the audit brief names, even though same-section not cross-chunk; reword to avoid it (P2).
2. None — no P1 findings surfaced.
3. None — no P0 findings surfaced; every checkable legal/factual claim (treaty status ×3, FTIN types ×3, §6038A(d)/(d)(2) penalty text, FTIN "None"/"N/A" rule, reference-ID rule, fax number/DPI, no-e-file rule, IRC §11/§871 rates, CP575/Chase/Wise claims, and the Nigeria Jan-2026 Tax ID portal) verified correct against primary/authoritative sources.
