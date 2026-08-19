# Blog audit — Group A (4 posts) — 2026-08-19 full-site pass

Scored against all 19 lines (17 base + addendum lines 18-19), 2 pts each, max 38.
Source of truth: working-tree `content/blog/<slug>.md`. Live site (`https://www.form5472prep.com`) used only to verify link targets return 200. Pricing verified against `src/lib/pricing.ts` (Standard $149/5-7bd, Express $199/3bd, +$99/extra year, fax included).

---

## amazon-fba-foreign-sellers-form-5472 — score 28/38

Per-line: 1:1 2:2 3:2 4:1 5:1 6:0 7:1 8:2 9:2 10:1 11:0 12:2 13:2 14:1 15:2 16:2 17:2 18:2 19:2

### P0 (wrong/invented fact, broken link, wrong price)
- **amazon-fba-foreign-sellers-form-5472:14, 79-95, 183-185** — The post asserts the 2026 OBBBA 1% remittance excise tax applies to ordinary bank wire/ACH transfers from the LLC's US bank account (Mercury/Relay) to the owner's foreign personal account. Per IRS's newsroom release on the proposed regulations (irs.gov, "Treasury, IRS issue proposed regulations on the new remittance transfer tax established under the One, Big, Beautiful Bill"), the 1% tax applies **only** to remittances funded by cash, a money order, a cashier's check, or other similar physical instrument — transfers "funded through withdrawals from accounts held in or by certain financial institutions" are explicitly **exempt**. An LLC sweeping an Amazon payout from its own US bank account to the owner's foreign bank account is a bank-to-bank transfer funded from a financial-institution account — the fact pattern IRS describes as exempt, not taxed. This is not a minor imprecision: it's the entire premise of a dedicated H2 section ("What does the 2026 OBBBA remittance tax mean for FBA sellers?", lines 79-95) plus a worked dollar example (line 91: "$200,000 a year in net distributions... 1% is $2,000. On $500,000, it's $5,000") plus a full FAQ answer (lines 183-185). Exact offending text at line 14: *"plus a new 2026 headache from the One Big Beautiful Bill Act's 1% remittance tax on cross-border transfers."* **Fix**: Either remove the OBBBA remittance-tax framing entirely, or rewrite it to state the tax applies to cash/money-order/cashier's-check-funded remittances (typically non-bank remittance services), and explicitly say that ordinary bank-to-bank ACH/wire transfers from a US LLC's own bank account to the owner's foreign bank account fall under the financial-institution-funded exemption and are not subject to the 1% tax as currently defined in the proposed regs — cite https://www.irs.gov/newsroom/treasury-irs-issue-proposed-regulations-on-the-new-remittance-transfer-tax-established-under-the-one-big-beautiful-bill. Also drop or heavily caveat the worked $2,000/$5,000 example since it's built on the wrong premise.

### P1 (standard violation)
- **amazon-fba-foreign-sellers-form-5472** (whole file) — Zero external hyperlinks anywhere in the post (verified via `grep -oE '\]\(https?://[^)]+\)'` — no matches). Brief line 11 requires 2-4 external links to authoritative sources (irs.gov etc.). Numerous claims go uncited with a link: IRC §6038A(d) penalty, Treas. Reg. §1.6038A-1 (line 34), the OBBBA remittance tax, and the "per EcomCPA, June 2026" automated-enforcement claim (line 105) — a real article exists at ecomcpa.com/form-5472-obbbas-1-remittance-tax-and-the-foreign-owned-ecommerce-llc-squeeze-in-2026/ but is never linked. **Fix**: add inline links to https://www.irs.gov/instructions/i5472 (fax/penalty details), the IRS remittance-tax newsroom page, and the EcomCPA source actually cited by name at line 105.
- **amazon-fba-foreign-sellers-form-5472:12-197** — No link to the conversion target (`/start`) anywhere in the first screen or first 30% of the post; the only `/start` link in the entire 197-line file is the very last line (197). This fails brief line 1 ("link to conversion target" within first 30%) and line 10 ("internal link to conversion target within first screen AND near close" — only "near close" is satisfied). **Fix**: add an early `/start` CTA link, e.g. inside or right after the TL;DR block (around line 20-29), matching the pattern used in the other 3 posts (a sentence like "If the federal filing is the part you need handled, [start your Form 5472 filing](/start?utm_source=blog&utm_medium=internal&utm_campaign=amazon-fba-foreign-sellers-form-5472) — takes about 15 minutes.").
- **amazon-fba-foreign-sellers-form-5472** (whole file) — No pricing is quoted anywhere in the post (grep for `$149`, `$199`, `$99`, `$449` returns zero hits) and no "we are not a CPA firm / give no tax advice" disclosure appears, unlike the other 3 posts in this batch which both quote exact pricing and carry the disclaimer near the closing CTA. Brief line 14 expects pricing quoted (and matching source of truth) near the primary CTA. **Fix**: before the final CTA (around line 189-197), add a paragraph matching the other posts' pattern: "Standard service is $149 and takes 5-7 business days. Express service is $199 and takes 3 business days. Each additional past tax year is +$99. Fax delivery is included. We are not a CPA firm and do not give tax advice."

### P2 (polish)
- **amazon-fba-foreign-sellers-form-5472:115-149** — The filing walkthrough ("Step 1" through "Step 5") is formatted as bold inline labels (`**Step 1: Calculate your reportable transactions**`) rather than a true markdown numbered list or table, unlike the numbered/table structures used in the other 3 posts. Not broken, just a weaker structural match to brief line 4's intent. **Fix**: convert to `1. **Calculate your reportable transactions**` ... `5. **Fax to the IRS Ogden PIN Unit**` numbered list.
- **amazon-fba-foreign-sellers-form-5472:165, 183-185** — Two FAQ answers ("Does Amazon report my FBA sales to the IRS?" and "Does the 1% OBBBA remittance tax apply to my Amazon disbursements?") run ~55 words, slightly over the brief's ≤50-word FAQ-answer guidance. **Fix**: trim each by one clause.

---

## amended-form-5472-correcting-errors — score 34/38

Per-line: 1:2 2:2 3:2 4:2 5:2 6:2 7:2 8:1 9:2 10:1 11:2 12:2 13:1 14:2 15:2 16:2 17:2 18:1 19:2

### P0 (wrong/invented fact, broken link, wrong price)
- **amended-form-5472-correcting-errors:57** — Internal link `[multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472)` returns **404** on the live site (`curl -s -o /dev/null -w "%{http_code}" https://www.form5472prep.com/blog/multiple-related-parties-form-5472` → 404). The target file `content/blog/multiple-related-parties-form-5472.md` does exist in the working tree, so this is very likely a not-yet-deployed-post issue rather than a wrong slug (consistent with the addendum's note that 15 posts were expanded locally and aren't live yet) — but as of right now the link is broken. **Fix**: no content change needed if `multiple-related-parties-form-5472` is part of the same deploy batch as this post; confirm it ships in the same release so the link resolves. If it is not scheduled to deploy alongside this post, either hold this post's publish or temporarily remove the link.
- **amended-form-5472-correcting-errors:61, 95** — Internal link `[recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` (used twice) also returns **404** on live (`content/blog/form-5472-recordkeeping-checklist.md` exists locally). Same likely cause/fix as above — verify it deploys in the same batch.

### P1 (standard violation)
- **amended-form-5472-correcting-errors:3** — Frontmatter `description` is 156 characters, one over the brief's ≤155 cap: *"Found an error after filing Form 5472? The IRS has no amendment procedure — see the practitioner fix and why an incomplete form risks the $25,000 penalty."* **Fix**: trim by at least 1 char, e.g. drop "the" before "practitioner fix": "...see the practitioner fix and why an incomplete form risks the $25,000 penalty." → shorten to "...see the fix and why an incomplete form risks the $25,000 penalty." (144 chars).
- **amended-form-5472-correcting-errors:2** — Title "How to Correct a Mistake on a Filed Form 5472" doesn't contain the literal primary-query term "amended," which the slug (`amended-form-5472-correcting-errors`) and tags (`"amended-return"`) target. Partial credit on brief line 8. **Fix**: consider "How to File an Amended Form 5472 (Correcting a Mistake)" or similar to land the literal query term in the H1/title, or confirm "correct a mistake" is the deliberately targeted phrase.

### P2 (polish)
- **amended-form-5472-correcting-errors:65** — Contains literal bracket placeholder text: *"stating that this corrects a Form 5472 originally filed on [date], listing each item changed..."* The addendum explicitly lists `[date]` as banned leftover-placeholder text (line 18), even though here it reads as an intentional template instruction to the reader. **Fix**: reword to avoid the literal bracket, e.g. "...stating that this corrects a Form 5472 originally filed on the date shown on your fax confirmation receipt, listing each item changed..."
- **amended-form-5472-correcting-errors:117** — FAQ answer to "Will I be penalized for correcting a Form 5472?" runs ~55 words, slightly over the ≤50-word guidance. Trim by one clause.

---

## california-llc-foreign-owner-tax-filing — score 38/38

Per-line: all 19 lines score 2/2.

Direct-answer opener (line 11) is 58 words, lands inside the 40-60 target, cites the $800 annual tax with population/action/timeframe/source (California FTB LLC page, linked, line 15). `/start` conversion link appears in the first screen (line 15) and again near the close (line 161), plus a related-post link to `/blog/foreign-owned-llc-filing-requirements-checklist` (200) and `/blog/form-5472-reportable-transactions-examples` (200). Fact-checked and confirmed accurate against live sources: FTB LLC fee bands ($900/$2,500/$6,000/$11,790 at the $250k/$500k/$1M/$5M breakpoints) and the AB 85 first-year exemption window (tax years beginning 1/1/2021–12/31/2023, expired) both match ftb.ca.gov exactly. Pricing quoted (line 125-127) matches `src/lib/pricing.ts` exactly, "not a CPA firm" disclosure present, EIN cross-link to `/ein` present and its quoted $149 EIN price matches `src/lib/llms.ts`. FAQ H2 ("## Frequently asked questions") with 6 H3 questions, each answer well under 50 words, matches the extractor pattern exactly. No duplicate H2s, no placeholder text, frontmatter parses cleanly (title 50 chars, description 124 chars). Word count ~2,194 words comfortably clears the ≥1,600 bar for a state/pillar guide.

### P0 / P1
None found.

### P2 (polish)
- **california-llc-foreign-owner-tax-filing:15, 28, 36, 45, 47, 53** — 6 external links, but only 2 distinct target pages (the FTB LLC index page repeated 5 times, plus FTB Pub. 3556 once, plus IRS instructions 3 times) — more repetition than the brief's "2-4 external links" framing implies, though each citation is contextually accurate. Not a defect, but consider varying anchor text/consolidating repeat citations of the same FTB URL for a cleaner link profile.

---

## delaware-llc-foreign-owner-tax-filing — score 38/38

Per-line: all 19 lines score 2/2.

Direct-answer opener (line 11) is ~65 words (a touch over the 40-60 target but still quotable), cites the Delaware $300 annual tax with population/action/timeframe/source (Delaware Division of Corporations page, linked, line 15). `/start` conversion link in the first screen (line 15) and near the close (line 149), plus related-post links to `/blog/foreign-owned-llc-filing-requirements-checklist` (200) and `/blog/form-5472-filed-late-never-filed` (200). Fact-checked and confirmed accurate by direct fetch of corp.delaware.gov/frtax/: $300 annual tax due June 1, $200 late-payment penalty, 1.5%/month interest, no annual report requirement for LLCs — all match exactly, including the arithmetic worked examples (line 97: $300+$200=$500). IRS citations (855-887-7737, 300 DPI, $25,000/form/year penalty, no e-file for foreign-owned DEs) all confirmed against irs.gov/instructions/i5472. Pricing quoted (lines 113-115) matches `src/lib/pricing.ts` exactly, CPA disclaimer present, `/ein` cross-link with correct $149 price. FAQ H2 exact match with 7 H3 questions, all answers well under 50 words. No duplicate H2s, no placeholders, frontmatter parses cleanly (title 48 chars, description 129 chars). Word count ~2,004 words clears the ≥1,600 state/pillar-guide bar.

### P0 / P1
None found.

### P2 (polish)
- **delaware-llc-foreign-owner-tax-filing:15, 29, 37, 45, 105** — 6 external links across only 2 distinct domains (corp.delaware.gov x3, irs.gov x3), similar repetition pattern to the California post. Not a defect; consider trimming repeat citations of the same corp.delaware.gov page.
- **delaware-llc-foreign-owner-tax-filing:11** — Opening bold answer is ~65 words vs. the brief's 40-60 target; trim slightly for a tighter quotable snippet (e.g. drop the trailing "Delaware LLCs do not file a state annual report, but the federal filing can still apply" into the next paragraph).

---

## Cross-post note
No post in this batch of 4 mentions BOI/CTA/FinCEN, so the "BOI exempt since March 2025" fact-check trigger from the brief doesn't apply here (it does appear correctly stated elsewhere in the repo, e.g. `src/lib/landing-pages.ts:872`, for reference). All 4 posts' FAQ sections match the extractor pattern exactly (H2 "Frequently asked questions" + H3 or whole-line-bold questions) — addendum line 19 passes for all four. Image/alt check (line 16) scored 2/2 for all 4 per orchestrator's pre-confirmation.
# Blog audit — Group B (3 posts)

Scored against `docs/reviews/blog-geo-aeo-audit-brief.md` including the 2026-08-19 addendum (19 lines x 2 pts = 38 max). Source of truth for content = working-tree `content/blog/<slug>.md`. Live site (`https://www.form5472prep.com`) used only to check that link targets return 200. Pricing verified against `src/lib/pricing.ts`. FAQ extraction verified against the actual `extractFaqs()` implementation in `src/lib/blog.ts:297` (used for FAQPage JSON-LD at `src/app/(marketing)/blog/[slug]/page.tsx:101`).

---

## does-foreign-owned-llc-pay-us-tax — score 33/38

Per-line: 1:1 2:2 3:2 4:2 5:1 6:2 7:2 8:2 9:1 10:2 11:1 12:1 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- **P0 (FAQ-schema corruption — line 9):** does-foreign-owned-llc-pay-us-tax:146-154 — the last FAQ ("If I owe no US tax, why does the IRS want Form 5472?", H3 at line 146, answer at line 148) has no H2 before the closing `---` (line 150) and the closing paragraph + CTA link (lines 152-154). `extractFaqs()` in `src/lib/blog.ts` only stops collecting an answer at the next H2/H3/whole-line-bold — it will glom the closing paragraph and `[File it here](/start...)` link into this FAQ's answer, producing an 86-word answer with an embedded CTA link instead of a clean ≤50-word answer, which corrupts the FAQPage JSON-LD served to search/AI engines. **Fix:** insert a plain H2 (e.g. `## The bottom line`) immediately before line 150's `---`, converting the closing paragraph into its own section — mirrors the pattern already used in `first-year-form-5472-new-llc.md` (which has `## The bottom line` after its FAQ and does NOT have this bug).

- **P1 (line 1 — answer paragraph):** does-foreign-owned-llc-pay-us-tax:11 — opening bold answer is ~66 words (target 40-60) and states "$25,000 penalty" with no inline source at first mention (the IRC §6038A(d) citation only appears later, at line 94). **Fix:** trim to ~55 words and append "(IRC §6038A(d))" after "$25,000 penalty."

- **P1 (line 11 — external links):** whole post — only 1 external authoritative link exists in the entire post (line 94, irs.gov/instructions/i5472); brief requires 2-4. **Fix:** add 1-2 more irs.gov citations, e.g. a link to IRS Pub. 519 (U.S. Tax Guide for Aliens) near the ECI/FDAP discussion (lines 33-35) or a link to Treas. Reg. §1.6038A-1 near line 81.

- **P1 (line 12 — current-year reference):** whole post — "2026" never appears anywhere in the rendered body text (only in YAML frontmatter `date`/`updated`, which readers/crawlers of the article prose won't see). **Fix:** add a natural in-body year reference, e.g. in the "Getting the filing part right" section (line 114-120): "...for the 2026 filing season."

- **P1 (line 9 — FAQ length):** does-foreign-owned-llc-pay-us-tax:130 — "Is a US LLC tax-free for non-residents?" answer is 51 words, 1 over the ≤50-word cap. **Fix:** cut "and not in the sense of having no obligations" to bring it to ≤50 words.

- **P2:** does-foreign-owned-llc-pay-us-tax:81 — "Treasury Regulation § 1.6038A-1... for tax years beginning on or after 1 January 2017" omits the second half of the regulation's actual effective-date test ("and ending on or after December 13, 2017," per the final regs / T.D. 9796). Not wrong, just incomplete. **Fix:** append ", and ending on or after December 13, 2017."

- **P2:** does-foreign-owned-llc-pay-us-tax:94-96 — states the $25,000 penalty but doesn't mention the additional $25,000-per-30-day-period penalty that accrues after the 90-day IRS notice window (confirmed via IRS Instructions for Form 5472). Optional expansion, not an error.

---

## ein-for-foreign-owned-llc-without-ssn — score 32/38

Per-line: 1:1 2:2 3:2 4:2 5:1 6:2 7:2 8:2 9:1 10:1 11:2 12:1 13:2 14:1 15:2 16:2 17:2 18:2 19:2

- **P0 (broken internal link — line 10):** ein-for-foreign-owned-llc-without-ssn:95 — `[do I need an ITIN for Form 5472](/blog/itin-required-form-5472)` returns **HTTP 404** on the live site (verified via curl, checked 2026-08-19). Cause: `content/blog/itin-required-form-5472.md` exists in the working tree but is future-dated (`publishAt: "2026-08-31T09:00:00-04:00"`), so it is not yet published, while this post (dated 2026-08-15) is already live today and links to it. **Fix:** either delay this link until 2026-08-31 (remove the link, keep plain text, and re-add after publish), or move the ITIN post's `publishAt`/`date` to on/before 2026-08-15 so both go live together.

- **P0 (FAQ-schema corruption — line 9):** ein-for-foreign-owned-llc-without-ssn:131-139 — same bug as post 1. Last FAQ ("Does having an EIN mean I owe US tax?", H3 line 131, answer line 133) has no H2 before the closing `---` (line 135) and the closing paragraph + 2 CTA links (137-139); `extractFaqs()` will fold all of that into the answer (91 words observed with the current text), corrupting the FAQPage schema. **Fix:** insert a closing H2 (e.g. `## Bottom line`) before line 135's `---`.

- **P1 (line 1 — answer paragraph):** ein-for-foreign-owned-llc-without-ssn:11 — opening bold paragraph is 62 words (target 40-60) and contains no genuine sourced statistic — the fax/phone numbers are contact details, not a stat; the nearest real figure (ITIN wait time) appears later (line 23) with no inline citation. **Fix:** trim to ~55 words; move a sourced figure earlier, e.g. "cannot be used without a US tax ID (per IRS.gov)."

- **P1 (line 5 — unsourced stats):** ein-for-foreign-owned-llc-without-ssn:23, 36, 78, 103 — "roughly six to eleven weeks" (ITIN wait) and "roughly 4 business days" (EIN by fax) appear multiple times with no inline link/citation to IRS.gov anywhere near them (the SS-4/instructions link only appears at lines 21/44, disconnected from the timing claims). **Fix:** add "(per IRS.gov)" or a direct link at first mention of each timing claim.

- **P1 (line 12 — current-year reference):** whole post — no "2026" anywhere in the rendered body (frontmatter only). **Fix:** add one naturally, e.g. in the closing "Getting your EIN without the paperwork" section.

- **P1 (line 14 — single primary CTA):** ein-for-foreign-owned-llc-without-ssn:107 and 139 — the post closes with two competing CTAs each time ("[Get your EIN](/ein...)... or [start a Form 5472 filing](/start...)" / "...or [start a Form 5472 filing](/start...)"), diluting the single primary CTA an EIN-focused post should have. **Fix:** keep `/ein` as the sole primary CTA; demote the 5472-filing mention to a plain inline sentence rather than a second bracketed CTA link at the same visual weight.

- **P2 (line 6 — minor imprecision):** ein-for-foreign-owned-llc-without-ssn:23 — "roughly six to eleven weeks" for ITIN processing. IRS.gov currently states 7 weeks standard, 9-11 weeks during tax season (Jan 15-Apr 30) or when applying from overseas — "six" understates the standard low end by a week. **Fix:** change to "roughly seven to eleven weeks."

---

## first-year-form-5472-new-llc — score 33/38

Per-line: 1:1 2:2 3:2 4:2 5:1 6:2 7:2 8:2 9:2 10:1 11:2 12:1 13:2 14:2 15:2 16:2 17:0 18:1 19:2

- **P1 (line 17 — thin content):** whole post — body is only ~710 words of prose (762 words total including frontmatter), well under the addendum's ≥1,200-word floor for even a narrow how-to/topic post (this post is not a pillar/country guide, so 1,200 is the applicable bar, not 1,600 — and it still fails by ~40%). **Fix:** expand meaningfully — e.g. add a concrete worked first-year dollar-amount example (the existing table at lines 28-34 lists categories but never walks through actual numbers, unlike the "Four scenarios" section in does-foreign-owned-llc-pay-us-tax.md), and expand the FAQ section (see P2 below).

- **P1 (line 10 — no related-post link):** whole post — zero `/blog/...` links anywhere in the post; only internal link present is `/start` (lines 16, 54, 76). Brief requires ≥1 link to a related post. **Fix:** add links to `/blog/does-foreign-owned-llc-pay-us-tax` and/or `/blog/ein-for-foreign-owned-llc-without-ssn`, both directly on-topic for a first-year filer (e.g. near line 44-49, the EIN section, link to the EIN post; near line 18-20, link to the tax-liability post).

- **P1 (line 12/18 — conflicting update date):** first-year-form-5472-new-llc:12 — body states "**Last updated: July 2026**" while the frontmatter (line 6) says `updated: 2026-08-17` (mid-August). Two conflicting statements of the same fact within one post. **Fix:** change line 12 to "**Last updated: August 2026**", or delete the redundant in-body line entirely — neither does-foreign-owned-llc-pay-us-tax.md nor ein-for-foreign-owned-llc-without-ssn.md has one; the frontmatter date alone drives the displayed "updated" date.

- **P1 (line 1 — formatting inconsistency):** first-year-form-5472-new-llc:14 — the opening direct-answer paragraph is plain text, not bolded, unlike the equivalent lead paragraphs in does-foreign-owned-llc-pay-us-tax.md:11 and ein-for-foreign-owned-llc-without-ssn.md:11 (both `**bold**`). Breaks the site's quotable-answer convention that AEO/GEO extraction relies on. **Fix:** wrap line 14's paragraph in `**...**`.

- **P2 (line 9 — FAQ count):** first-year-form-5472-new-llc:56-72 — exactly 4 FAQ questions, the bare minimum vs. 6 in each of the other two posts audited here. Technically passes but thin PAA/AEO surface area. **Fix:** add 2 more questions, e.g. "Does a first-year LLC need to file if it was never funded?" / "What if the LLC formed but didn't get an EIN before year-end?"

- **P2 (line 15 — disclaimer inconsistency):** first-year-form-5472-new-llc:78 — closing italic "*Educational content only; not tax or legal advice.*" doesn't appear in the other two audited posts, which instead fold the no-CPA-advice disclaimer into the pricing paragraph (e.g. does-foreign-owned-llc-pay-us-tax.md:120, "We are not a CPA firm and do not give tax advice"). Not wrong, just an inconsistent pattern across posts. **Fix:** align placement/phrasing across all three, or leave as an acceptable variant.

- **P2 (line 13 — title at exact cap):** frontmatter line 2 — title "First-Year Form 5472: What a New Foreign-Owned LLC Must File" is exactly 60 characters, zero margin under the ≤60 cap (risk of SERP truncation on some devices/fonts). **Fix:** trim 2-3 characters, e.g. drop "New" → "First-Year Form 5472: What a Foreign-Owned LLC Must File" (58 chars).

---

## Links checked (all via curl against live site / target host)

Internal (form5472prep.com):
- /start — 200
- /ein — 200
- / — 200
- /blog/multi-member-llc-form-5472-or-1065 — 200
- /blog/amazon-fba-foreign-sellers-form-5472 — 200
- /blog/foreign-owned-llc-filing-requirements-checklist — 200
- /blog/form-5472-filed-late-never-filed — 200
- /blog/itin-required-form-5472 — **404** (see P0 above, ein-for-foreign-owned-llc-without-ssn:95)
- /blog/does-foreign-owned-llc-pay-us-tax — 200
- /blog/ein-for-foreign-owned-llc-without-ssn — 200
- /blog/first-year-form-5472-new-llc — 200

External (irs.gov):
- https://www.irs.gov/instructions/i5472 — 200
- https://www.irs.gov/instructions/iss4 — 200
- https://www.irs.gov/pub/irs-pdf/fss4.pdf — 200

No comptroller.texas.gov links found in any of these 3 posts (no "unverifiable here" cases to report).

## Facts verified against IRS.gov (line 6, fact-check)

All confirmed correct in all 3 posts:
- SS-4 fax numbers 855-215-1627 (within US) / 304-707-9471 (outside US) — matches IRS SS-4 instructions exactly.
- International EIN phone +1-267-941-1099, Mon-Fri 6am-11pm ET — matches exactly.
- EIN International Operation mailing address, Cincinnati, OH 45999 — matches exactly.
- Line 7b "foreign"/"N/A" guidance — matches IRS SS-4 instructions.
- Form 5472 penalty $25,000/form/year, IRC §6038A(d), substantially-incomplete-form and 90-day/additional-penalty language — matches IRS Instructions for Form 5472 exactly.
- Foreign-owned DE cannot e-file Form 5472; must fax/mail to Ogden PIN Unit — confirmed.
- Form 7004 can extend the Form 5472/pro forma 1120 filing deadline — confirmed.
- Treas. Reg. §1.6038A-1 / T.D. 9796 effective for tax years beginning on/after Jan 1 2017 — confirmed (see P2 note on does-foreign-owned-llc-pay-us-tax.md for the missing second half of the effective-date test).
- ITIN processing time: IRS.gov states 7 weeks standard / 9-11 weeks during tax season or from overseas — post 2's "six to eleven weeks" is close but understates the standard-case low end (see P2).
- No BOI/CTA claims present in any of the 3 posts (nothing to flag).
- EIN service price $149 (ein-for-foreign-owned-llc-without-ssn.md) matches `src/app/(marketing)/ein/page.tsx`. Main filing pricing ($149 standard/5-7 business days, $199 express/3 business days, +$99/additional year, fax included) matches `src/lib/pricing.ts` exactly in all 3 posts — no P0 pricing defects found.

## Images (line 16)

All 3 posts confirmed to have both `public/blog/<slug>.webp` and an `ARTWORK_ALTS` entry in `src/lib/blog.ts` (lines 132, 141, 145) — scored 2/2 for all three per orchestrator's prior confirmation, spot-checked here.
# Blog audit — Group C (3 posts)
Brief: docs/reviews/blog-geo-aeo-audit-brief.md (+ 2026-08-19 addendum, 19 scoring lines, 38 pts max).
Source of truth used: working-tree content/blog/<slug>.md files. Pricing verified against src/lib/pricing.ts (standard $149/5-7bd, express $199/3bd, +$99/extra year, fax included — all three posts quote this correctly, exact match, no defects).
Link checks: internal via curl against https://www.form5472prep.com/<path>; external via curl + WebFetch + WebSearch cross-verification.

---

## florida-llc-foreign-owner-tax-filing — score 37/38

Per-line: 1:2 2:1 3:2 4:2 5:2 6:2 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- P0: none found. All internal links resolve 200 (/start, /ein, /blog/first-year-form-5472-new-llc). All facts (Sunbiz $138.75 fee, May 1 2026 deadline, $400 late fee, IRS Ogden fax 855-887-7737, §6038A e-file prohibition, no Delaware-style FL franchise tax) verified accurate via WebSearch cross-check. Pricing exact match to pricing.ts.

- P1:
  - florida-llc-foreign-owner-tax-filing: post never states the IRC §6038A(d) $25,000 penalty anywhere (grepped "25,000" and "6038A" — only line 46 references "section 6038A reporting purposes" generically, no penalty amount). This is a significant completeness gap for a post whose entire premise is federal Form 5472 risk for Florida LLCs — weakens the urgency/conversion case that every sibling post (checklist, australia) makes explicitly. Exact fix: add one sentence after line 46, e.g. "A late, incomplete, or unfiled Form 5472 draws an automatic $25,000 penalty per form per year under IRC §6038A(d) ([IRS Form 5472 instructions](https://www.irs.gov/instructions/i5472))."

- P2:
  - florida-llc-foreign-owner-tax-filing:30 and florida-llc-foreign-owner-tax-filing:102-106: the "no Delaware-style flat LLC franchise tax" point is stated twice — first as a tangent inside the "What are the annual requirements for a Florida LLC?" H2 (line 30: "Florida does not impose a Delaware-style flat LLC franchise tax merely for keeping a default disregarded LLC active. The recurring Florida entity-maintenance charge discussed in this guide is the annual report fee."), then again as its own full H2 "Does Florida charge an LLC franchise tax?" (lines 102-106). Violates "one concept per section" (line 2). Exact fix: delete the two sentences at line 30 and keep the fuller treatment only in the dedicated H2 at 102-106.
  - florida-llc-foreign-owner-tax-filing:15 and :36: external link `https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/` returns HTTP 403 to curl and WebFetch from this machine (likely bot-blocking on a .gov domain, same class of issue as the known comptroller.texas.gov quirk — not confirmed broken). Content was independently cross-verified accurate via WebSearch (fee $138.75, due May 1 2026, $400 late fee all confirmed by third-party sources citing the same Sunbiz page). Exact fix: none required to content; recommend a human browser spot-check of the link before treating it as fully verified.

---

## foreign-owned-llc-filing-requirements-checklist — score 34/38

Per-line: 1:1 2:2 3:2 4:2 5:1 6:2 7:2 8:2 9:2 10:1 11:2 12:2 13:1 14:2 15:2 16:2 17:2 18:2 19:2

- P0 (broken internal links, live-site-verified):
  - foreign-owned-llc-filing-requirements-checklist:99: `[do I need an ITIN for Form 5472](/blog/itin-required-form-5472)` — target returns HTTP 404 on https://www.form5472prep.com/blog/itin-required-form-5472. Exact fix: point to an existing slug (verify the correct current ITIN-post slug and update, or remove the link until that post is published).
  - foreign-owned-llc-filing-requirements-checklist:107: `[recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` — target returns HTTP 404 on https://www.form5472prep.com/blog/form-5472-recordkeeping-checklist. Exact fix: point to an existing slug or remove the link until that post is published.

- P1:
  - foreign-owned-llc-filing-requirements-checklist:81-84: the Wyoming ($60 minimum or $0.0002 per dollar of Wyoming assets), Delaware ($300 due June 1), and Florida (annual report + "substantial late fee") state-fee figures are stated with no inline named source/citation — violates line 5's "number + population + action + timeframe + named source inline" requirement. All three figures were independently verified accurate via WebSearch, but the post itself cites nothing for them (contrast with the sourced IRS/FinCEN citations elsewhere in the same post). Exact fix: add an inline citation link per bullet, e.g. Wyoming Secretary of State fee schedule for the $60/$0.0002 figures, Delaware Division of Corporations franchise-tax page for the $300/June 1 figures, and the Florida Sunbiz annual-report page (already linked in the sibling florida-llc-foreign-owner-tax-filing.md) for the Florida row.

- P2:
  - foreign-owned-llc-filing-requirements-checklist:11: lead bold direct-answer paragraph is 75 words, exceeding the 40-60 word "quotable" target in brief line 1. Exact text: "A foreign-owned US single-member LLC generally files two federal items each year: Form 5472 attached to a pro forma Form 1120, filed by fax or mail to the IRS Ogden PIN Unit. It also files a state annual report or franchise return. As of the March 2025 FinCEN interim final rule, US-formed LLCs are exempt from BOI reporting. A US income tax return is required only if the LLC has US-source or effectively connected income." Exact fix: cut the last sentence ("A US income tax return is required only if the LLC has US-source or effectively connected income.") out of the bolded lead and move it into the body of the "Do I have to file a US income tax return?" section, dropping the lead to ~55 words.
  - foreign-owned-llc-filing-requirements-checklist:3 (frontmatter `description`): "Foreign-owned US LLC filing requirements can include Form 5472, pro forma Form 1120, state reports, income-tax returns, and sales-tax registrations." reads as a keyword list rather than "answer + click reason" (brief line 13). Exact fix: rewrite to something like "A 2026 checklist of the federal and state filings foreign-owned US LLCs actually owe — and which filings you can safely skip."

---

## form-5472-australia-residents-us-llc — score 38/38

Per-line: 1:2 2:2 3:2 4:2 5:2 6:2 7:2 8:2 9:2 10:2 11:2 12:2 13:2 14:2 15:2 16:2 17:2 18:2 19:2

- P0: none. All internal links resolve 200 (/start, /ein, /blog/foreign-owned-llc-filing-requirements-checklist). Pricing exact match. FACT CHECK (line 6, most important line): $25,000 penalty/IRC §6038A(d) citation, e-file prohibition, IRS Ogden fax 855-887-7737, and the Australian TFN "lasts for life" claim all independently verified accurate via WebSearch. Treaty claims are deliberately non-specific — the post never asserts a treaty article number or a specific withholding-rate percentage, correctly avoiding the exact risk flagged in the task brief (checked: no invented treaty article/rate anywhere in the file).

- P1: none.

- P2:
  - form-5472-australia-residents-us-llc:33 and :116: external links `https://community.ato.gov.au/s/article/a079s0000009GnBAAU/finding-your-tfn` and `https://www.ato.gov.au/businesses-and-organisations/international-tax-for-business/in-detail/doing-business-in-australia-or-overseas/doing-business-overseas-what-you-need-to-know` both return HTTP 403 to curl and WebFetch from this machine (likely bot-blocking on the ATO domain, same class of issue as the comptroller.texas.gov quirk — not confirmed broken). Content cross-verified accurate independently via WebSearch (TFN is lifetime/never expires; Australian residents are taxed on worldwide income including foreign business activity). Exact fix: none required to content; recommend a human browser spot-check of both links.
  - form-5472-australia-residents-us-llc: FAQ at lines 142-144 ("Does an Australian owner need an ITIN to file Form 5472?") and the "Which Australian number goes in the FTIN field?" section discuss ITIN eligibility, but the post never links to /itin anywhere (it links /ein at line 138 instead). Not a required line per the brief (this post is FTIN/TFN-focused, not ITIN-focused), but a natural cross-sell opportunity. Exact fix: add an /itin link near line 144, e.g. "An ITIN is entered only if the owner already has one — see [do you need an ITIN for Form 5472](/itin)."

---

## Summary
| slug | score | P0 | P1 | P2 |
|---|---|---|---|---|
| florida-llc-foreign-owner-tax-filing | 37/38 | 0 | 1 | 2 |
| foreign-owned-llc-filing-requirements-checklist | 34/38 | 2 | 1 | 2 |
| form-5472-australia-residents-us-llc | 38/38 | 0 | 0 | 2 |
