# New posts — batch 3 (10 posts, publish 2026-08-19)

Repo: /Users/sumyeung/Documents/Codex/form5472. Create ONLY the content/blog/<slug>.md files assigned to you. No git writes.

## Standard (non-negotiable — same as docs/reviews/blog-expansion-spec.md "Required in every post")
Read docs/reviews/blog-expansion-spec.md items 2–13 and docs/reviews/blog-geo-aeo-audit-brief.md; they apply in full. Exemplars for voice/structure: content/blog/form-5472-penalty-notice-what-to-do.md, content/blog/does-foreign-owned-llc-pay-us-tax.md, content/blog/form-5472-uae-dubai-residents-us-llc.md (country template), content/blog/wyoming-llc-foreign-owner-tax-filing.md (state template).

Frontmatter (exact shape):
---
title: "<≤60 chars, contains primary query, human hook>"
description: "<≤155 chars, answer + reason to click — not a keyword list>"
date: 2026-08-19
updated: 2026-08-19
author: "Form5472 Prep"
tags: ["form-5472", ...3–5 lowercase-kebab tags]
draft: false
---
No publishAt (publish immediately).

Hard rules recap: 1,700–2,300 words; bold 40–60-word answer block first; sourced stat + `/start?utm_source=blog&utm_medium=internal&utm_campaign=<slug>` link in first 30%; question-form H2s, answer-first, no cross-section pronouns; ≥1 table AND ≥1 numbered procedure; "Four scenarios, worked through"-style section for country/state/persona posts; ≥1 original element; 2–4 external authoritative links, verified live with curl (gov 403 acceptable, note it); every number sourced inline or omitted — NEVER invent statistics; pricing ONLY $149 Standard (5-7 business days) / $199 Express (3 business days) / +$99 per additional past tax year / fax included; EIN $149 at /ein, ITIN $349 at /itin; "we are not a CPA firm and do not give tax advice" in the product section; `## Frequently asked questions` with 6–8 `### ` questions, each answer ≤50 words, ONE paragraph each; end FAQ section with `---` then closing CTA (`...&utm_campaign=<slug>-close`) + one related-post link.

Legal facts that MUST be stated correctly (verified 2026-08-19):
- Penalty: $25,000 per form per year, IRC §6038A(d); substantially incomplete = failure to file; after 90 days from IRS notice, an additional $25,000 for EACH 30-day period (or fraction) the failure continues, §6038A(d)(2). Source https://www.irs.gov/instructions/i5472
- Part II: FTIN on line 4b(3) — if none, enter "None" or "N/A" (never blank); reference ID on 4b(2) is REQUIRED whenever no US identifying number on 4b(1); same reference ID every year.
- Fax 855-887-7737 (instructions say "300 DPI or higher"); mail: Internal Revenue Service, 1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201. Foreign-owned US DE cannot e-file. Write "Foreign-owned U.S. DE" across top of pro forma Form 1120.
- Deadline: 15 April (calendar year); Form 7004 faxed/mailed to the same PIN Unit by the due date extends to 15 October; 2025 tax year → 15 April 2026 / 15 October 2026.
- Reportable transactions regulation: §1.6038A-2; reasonable cause: §1.6038A-4(b); DIIRSP page states penalties may be assessed without considering the reasonable cause statement.
- BOI: US-formed entities exempt since FinCEN interim final rule 26 March 2025.
- Treaties: check https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z — Hong Kong: NONE (China treaty does not extend to HK); Pakistan: treaty exists (1957); Mexico: treaty exists. Do not state foreign tax rates unless verified on the national authority's site.

Related published posts you may link (pick 2–4 relevant): what-is-form-5472, how-to-fill-out-form-5472, form-5472-deadline-2026, form-5472-penalty-notice-what-to-do, form-5472-filed-late-never-filed, form-5472-reasonable-cause-letter, does-foreign-owned-llc-pay-us-tax, foreign-owned-llc-filing-requirements-checklist, form-5472-reportable-transactions-examples, stripe-paypal-wise-form-5472, form-5472-currency-conversion-exchange-rates, ein-for-foreign-owned-llc-without-ssn, wyoming-llc-foreign-owner-tax-filing, delaware-llc-foreign-owner-tax-filing, form-5472-uae-dubai-residents-us-llc, form-5472-india-residents-us-llc, form-5472-singapore-residents-us-llc, form-5472-foreign-corporate-owner, multi-member-llc-form-5472-or-1065, amazon-fba-foreign-sellers-form-5472, pro-forma-form-1120-foreign-owned-llc, how-to-fax-form-5472-irs, multiple-related-parties-form-5472 (scheduled — link allowed), form-5472-recordkeeping-checklist (scheduled — allowed).

## The 10 briefs

### 1. form-5472-us-real-estate-foreign-investor
Primary query: "Form 5472 foreign owner US rental property LLC". Audience: non-US individual who bought a US rental/investment property through a single-member LLC. Must cover: why the LLC's Form 5472 is due regardless of rental activity (funding the purchase = capital contribution); that rental income is generally FDAP taxed at 30% gross unless the owner makes the §871(d) net election (Form 1040-NR) — cite https://www.irs.gov/individuals/international-taxpayers/ ; FIRPTA withholding 15% on sale (IRC §1445, https://www.irs.gov/individuals/international-taxpayers/firpta-withholding) — state the general rule only; property-management payments from the LLC to the owner, and owner-paid expenses, as reportable transactions; a worked example (purchase funded with $250,000 contribution, $1,800/month rent, $600 owner-paid repairs → what goes on Part IV/V and line 1f). Four scenarios. Table: "Which return covers what" (Form 5472 / 1040-NR / FIRPTA 8288). Note explicitly this is not tax advice and the 871(d)/treaty decisions need an adviser.

### 2. form-5472-vs-form-5471
Primary query: "Form 5472 vs Form 5471 difference". Definition-led. Table comparing: who files, direction of ownership (US entity with foreign owner vs US person with foreign corporation), penalty ($25,000 vs $10,000 under §6038(b) — verify at https://www.irs.gov/instructions/i5471), attachment (pro forma 1120 vs the filer's own return), e-file (no for DE / yes), due dates, FTA availability. Decision framework "which form(s) do I file" with 5 ownership scenarios, including the double case (a non-US person who owns a US LLC AND that LLC owns a foreign subsidiary — the LLC files 5472; the 5471 question depends on whether there's a US person). Also briefly disambiguate Form 5472 from Forms 8938, 5472 Part VI, 1120-F, 8833. Original element: the decision tree.

### 3. form-5472-statute-of-limitations
Primary query: "Form 5472 statute of limitations" / "how far back can the IRS penalize a missing Form 5472". Core law: IRC §6501(c)(8) — the assessment period for the ENTIRE return stays open until 3 years after the required information return is filed (verify text at https://www.law.cornell.edu/uscode/text/26/6501); the §6038A penalty is assessable for any unfiled year; no "just skip the old years" option. Explain the practical sequence for an owner with 5 unfiled years; how filing starts the clock; records retention under §1.6038A-3. Table: "Year / filed? / assessment window status". Numbered catch-up procedure. Link filed-late and reasonable-cause posts. Do not give figures on how often the IRS actually assesses — no stats exist; say so.

### 4. new-mexico-llc-foreign-owner-tax-filing
Primary query: "New Mexico LLC non-resident annual requirements". State template. New Mexico: no annual report for LLCs, no state franchise tax on LLCs (verify at https://www.sos.nm.gov/ and https://www.tax.newmexico.gov/); registered agent required; why NM is marketed for privacy/low maintenance; the federal Form 5472 obligation unchanged; CRS/gross receipts tax only if NM nexus. Four scenarios, table comparing NM vs WY vs DE annual cost (use only verified figures: WY $60 min, DE $300, NM $0 annual report).

### 5. nevada-llc-foreign-owner-tax-filing
Primary query: "Nevada LLC non-resident annual fees filing". State template. Nevada: annual list of managers/members ($150) + state business license ($200) — VERIFY current amounts at https://www.nvsos.gov/ (SilverFlume) before stating; due by the last day of the anniversary month; no state income tax; Commerce Tax only above $4M NV gross revenue (verify https://tax.nv.gov/). Federal Form 5472 unchanged. Four scenarios, cost table NV vs WY vs DE.

### 6. form-5472-hong-kong-residents-us-llc
Primary query: "Form 5472 Hong Kong resident US LLC". Country template. NO US–Hong Kong income tax treaty (the US–China treaty does not apply to the HKSAR — verify on the IRS A-to-Z page). FTIN: HKID number is used as the TIN for HK individuals per the OECD TIN portal (verify https://www.oecd.org/en/topics/sub-issues/tax-identification-numbers.html or IRD https://www.ird.gov.hk/); HK territorial tax system — profits sourced outside HK generally not taxed, but do NOT give rates; say local advice needed. HKD peg ~7.8 → USD conversion example. Four scenarios (HK trader with Amazon US inventory; HK consultant; HK holding co as owner → second related party; dormant).

### 7. form-5472-pakistan-residents-us-llc
Primary query: "Form 5472 Pakistan resident US LLC" (large freelancer/agency market: Upwork, Fiverr, Payoneer). Country template. US–Pakistan treaty exists (1957) — verify on IRS A-to-Z; FTIN = NTN or CNIC (FBR — verify which the OECD portal lists for Pakistan); Payoneer/Wise payouts from the LLC to the owner are distributions; PKR conversion example; the 1% OBBBA §4475 remittance tax does NOT apply to bank/card-funded transfers (state correctly if mentioned at all). Four scenarios.

### 8. form-5472-mexico-residents-us-llc
Primary query: "Form 5472 Mexico resident US LLC" / "residente en México LLC Estados Unidos Form 5472" (write in English, mention Spanish term once). Country template. US–Mexico treaty exists — verify; FTIN = RFC (SAT) — verify on OECD portal; note Mexico's REFIPRE/transparent-entity rules briefly without rates ("get local advice"); MXN conversion example. Four scenarios (cross-border ecommerce, consultant, real-estate holding LLC, dormant).

### 9. form-5472-part-v-statement-example
Primary query: "Form 5472 Part V statement example" / "attached statement for Part V". How-to. Exactly what Part V requires per i5472 (check box; describe on attached statement the transactions not in Part IV incl. amounts connected with formation, dissolution, acquisition, disposition); an ANNOTATED TEMPLATE of the statement (heading block: reporting corporation name, EIN, tax year, related party; table columns Date / Description / Direction / USD amount / Basis of conversion; totals; signature not required on the attachment but the 1120 is signed) — use clearly-labelled illustrative figures, no real names; how the Part V total flows to line 1f/1h; common mistakes (putting contributions in Part IV; no total; no EIN on the attachment; mixing revenue in). Numbered procedure. Link how-to-fill-out and reportable-transactions posts.

### 10. form-5472-shopify-dropshipping-foreign-owner
Primary query: "Shopify dropshipping LLC non-resident Form 5472". Persona post. Shopify Payments/PayPal payouts are revenue (not reportable); supplier payments (AliExpress/CJ) are third-party (not reportable) UNLESS the supplier is your own foreign company (related party → second Form 5472); owner draws, ad-spend top-ups from personal card (reimbursements/loans) ARE reportable; chargeback reserves irrelevant; sales-tax nexus is a separate state question (one paragraph, no figures); worked example from gross sales → fees → payouts → owner draw → what's reportable; Four scenarios; link stripe-paypal-wise and amazon-fba posts.

## Verification per file (run, paste)
`wc -w`; FAQ count 6–8 + max answer words ≤50; `grep -oE '\]\((https?://[^)]+)' | sort -u` + curl status each; `grep -nE '\$[0-9]'` — only $149/$199/$99/$25,000/$10,000(5471 only) or cited/illustrative-labelled; gray-matter title ≤60 / description ≤155; `npx vitest run src/lib/blog.test.ts`; `git status --short`.
Report per file: word count, the sourced stat in the first 30%, the original element, every NEW factual claim with its source URL.
