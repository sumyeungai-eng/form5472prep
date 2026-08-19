# Full blog GEO/AEO audit — 2026-08-19 pass (10 posts, "-ac" batch)

Scope: `docs/reviews/live-slugs-ac` (10 slugs), scored against `docs/reviews/blog-geo-aeo-audit-brief.md` including its 2026-08-19 addendum (19 scoring lines, max 38 per post). Working-tree `content/blog/<slug>.md` files were the source of truth for content; the live site (`https://www.form5472prep.com`) was used only to confirm link targets return 200. Pricing checked against `src/lib/pricing.ts` ($149 standard / 5-7 business days, $199 express / 3 business days, +$99/additional year, fax included on both tiers). Images/alt text (`public/blog/<slug>.webp` + `src/lib/blog.ts` `ARTWORK_ALTS`) were pre-verified present for all 10 slugs before per-post review began.

IRS treaty existence independently verified against `https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z`: **France, Germany, India, and the Netherlands all have treaties; Singapore and the UAE do not.** No post in this batch invents a US–Singapore or US–UAE treaty.

Method note: each pair of posts was audited by an independent research pass (full file read, WebFetch/WebSearch fact-checks against irs.gov and country-specific primary sources, curl-based link checks against the live site). The compiling pass then independently re-verified three load-bearing claims: (1) the three UAE-post internal 404s, by curl against the live site and by reading the linked posts' `publishAt` frontmatter — confirmed; (2) the Germany post's flagged bot-walled citation — confirmed the target URL is gated by Radware Bot Manager (`server: rdwr`, `__uzm*` cookies), so its content cannot be verified by automated tooling; (3) the treaty A-to-Z page contents above — confirmed via WebFetch.

---

## form-5472-france-residents-us-llc — score 37/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | L11 bold answer (53 words) + sourced $25,000 stat + `/start` link, all within L11-13. |
| 2 | 2 | Every H2 answers in its first sentence. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | 4 comparison tables + 2 numbered lists. |
| 5 | 1 | $25,000 (L13) and numéro fiscal (L33) sourced; deadline (L29) and fax/DPI (L106) lack a fresh inline citation at that sentence. |
| 6 | 2 | All checkable claims verified true; no France-specific errors found. |
| 7 | 2 | Worked EUR→USD table (L83-92) + four original scenarios (L117-125). |
| 8 | 2 | "Form 5472" + "French" in title, H1, slug, first sentence. |
| 9 | 2 | "## Frequently asked questions" (L135) + 6 H3 questions, all ≤25 words. |
| 10 | 2 | `/start` at L13 and L163; 2 related-post links; all internal links 200. |
| 11 | 2 | 4 external links, all irs.gov/impots.gouv.fr, all 200. |
| 12 | 2 | `updated: 2026-08-19` present; 2026 referenced repeatedly. |
| 13 | 2 | Title 39 chars, description 134 chars. |
| 14 | 2 | L131 pricing exact match to source of truth; one primary CTA. |
| 15 | 2 | No banned puffery; plain, hedged voice. |
| 16 | 2 | Pre-verified: image + `ARTWORK_ALTS["form-5472-france-residents-us-llc"]` present (blog.ts:151). |
| 17 | 2 | 2,127 words — above the 1,600-word pillar bar. |
| 18 | 2 | No duplicate H2s, no placeholders, no truncation, frontmatter parses. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 6 questions H3. |

**P0:** none found.

**P1:**
- `content/blog/form-5472-france-residents-us-llc.md:29` — "the 2025 Form 5472 package was generally due 15 April 2026, or 15 October 2026 if a timely Form 7004 extension was filed" has no inline citation at this sentence (nearest link is L13, a different sentence). Fix: add an inline link to `https://www.irs.gov/instructions/i5472` or to the site's own `/blog/form-5472-deadline-2026` right after this sentence.
- `content/blog/form-5472-france-residents-us-llc.md:106` — "Fax the signed package at 300 DPI or higher to 855-887-7737, or mail it to the dedicated IRS Ogden PIN Unit address in the instructions." — "the instructions" is not a live link here. Fix: hyperlink "the instructions" to `https://www.irs.gov/instructions/i5472`.

**P2:**
- `content/blog/form-5472-france-residents-us-llc.md:35` — "French sources and advisers may also refer to the numéro fiscal as the SPI in administrative contexts." — accurate but doesn't expand SPI (Simplification des Procédures d'Imposition). Fix: add the expansion in parentheses.
- `content/blog/form-5472-france-residents-us-llc.md:13` — mentions the $25,000 base penalty but not the recurring additional $25,000 after 90 days. Fix (optional depth add): note the escalating penalty, consistent with the fix applied elsewhere in this report.

---

## form-5472-germany-residents-us-llc — score 36/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | L11 bold answer (54 words) + sourced stat + `/start` link, all within L11-13. |
| 2 | 2 | Every H2 answers in its first sentence. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | 4 comparison tables + numbered lists (L20-25, L99-109). |
| 5 | 1 | $25,000 (L13) and IdNr (L33) sourced; deadline (L29) and fax details (L97) lack a fresh inline citation. |
| 6 | 1 | All IRS/BZSt claims verified true, but see P0 below — one citation could not be content-verified. |
| 7 | 2 | Worked EUR→USD table (L84-93) + four original scenarios (L118-126). |
| 8 | 2 | "Form 5472" + "German" in title, H1, slug, first sentence. |
| 9 | 2 | "## Frequently asked questions" (L136) + 6 H3 questions, all ≤26 words. |
| 10 | 2 | `/start` at L13 and L164; related-post link L164; all internal links 200. |
| 11 | 2 | 4 external links, all irs.gov/bzst.de/bundesfinanzministerium.de, all HTTP 200. |
| 12 | 2 | `updated: 2026-08-19` present; 2026 referenced repeatedly. |
| 13 | 2 | Title 39 chars, description 130 chars. |
| 14 | 2 | L132 pricing exact match; one primary CTA. |
| 15 | 2 | No banned puffery; plain, hedged voice. |
| 16 | 2 | Pre-verified: image + `ARTWORK_ALTS["form-5472-germany-residents-us-llc"]` present (blog.ts:150). |
| 17 | 2 | 2,143 words — above the 1,600-word bar. |
| 18 | 2 | No duplicate H2s, no placeholders, no truncation, frontmatter parses. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 6 questions H3. |

**P0:**
- `content/blog/form-5472-germany-residents-us-llc.md:114` — text links `[EStH guidance](https://esth.bundesfinanzministerium.de/esth/2025/A-Einkommensteuergesetz/I-Steuerpflicht-1-1a/Paragraf-1a/h-1a.html)`. The target returns HTTP 200 but is a Radware Bot Manager challenge page (confirmed independently: `server: rdwr`, `__uzma`/`__uzmb`/... cookies) — its actual legal content cannot be verified by automated tooling. The underlying claim (German unlimited income-tax liability extends to worldwide income, §1 EStG / Welteinkommensprinzip) is standard and very likely correct, but this specific citation is unverifiable as sourced. Fix: replace with a directly machine-readable primary source, e.g. `https://www.gesetze-im-internet.de/estg/__1.html`, or have a human visually confirm the current bundesfinanzministerium.de page content before keeping the link.

**P1:**
- `content/blog/form-5472-germany-residents-us-llc.md:29` — deadline sentence ("...generally due on 15 April 2026...Form 7004 extension generally moved that deadline to 15 October 2026.") has no inline citation. Fix: add inline link to `https://www.irs.gov/instructions/i5472` or to `/blog/form-5472-deadline-2026` / `/blog/form-5472-extension` (both exist in `content/blog/`).
- `content/blog/form-5472-germany-residents-us-llc.md:97` — "The IRS instructions say...file by fax at 300 DPI or higher to 855-887-7737..." — "IRS instructions" not hyperlinked here. Fix: hyperlink inline.

**P2:**
- `content/blog/form-5472-germany-residents-us-llc.md:138` — FAQ asks "Is a German Steuer-ID the same as the LLC's EIN?" while the body (L33) uses "Identifikationsnummer or IdNr." Same thing, inconsistent terminology. Fix: standardize on "IdNr" or note the synonym in the FAQ answer.
- `content/blog/form-5472-germany-residents-us-llc.md:13` — as with France, omits the recurring 90-day/$25,000 escalation. Optional depth add.

---

## form-5472-india-residents-us-llc — score 28/38

| Line | Score | Note |
|---|---|---|
| 1 | 1 | L12 bolded lead (~29 words) is short of the 40-60 word target, and the first 30% has **no link to the conversion target** (only link is irs.gov, L12). |
| 2 | 2 | Most H2s answer immediately (e.g. L71-73). |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | Two numbered lists (L33-37, L105-115). |
| 5 | 0 | $25,000 (L14, 22, 26, 157) has only one inline source (L12); April 15 deadline (L119) unsourced; 1% remittance-tax stat (L95) unsourced and wrong (see P0). |
| 6 | 0 | Genuine wrong/invented claim found — see P0. |
| 7 | 1 | Only a single-line Part V example (L115); no full worked calculation like the Netherlands post. |
| 8 | 2 | "Form 5472" + "India" in title, slug, first 100 words. |
| 9 | 2 | "## Frequently asked questions" (L131), 5 whole-line-bold questions, each <50 words. |
| 10 | 1 | Related-post links present (L127, 161), internal links resolve 200, but the conversion-target link is only at the very end (L163), not in the first screen. |
| 11 | 1 | Only 1 external link in the whole post (L12) — below the 2-4 target. |
| 12 | 2 | `updated: 2026-07-06` present; 2026 referenced (L27, 93-100). |
| 13 | 2 | Title 43 chars, description 154 chars (essentially no margin). |
| 14 | 1 | One primary CTA (L163) present, but **no pricing is quoted anywhere in the post**. |
| 15 | 1 | Mostly plain/jargon-free, but L127 overstates penalty-abatement odds and the post lacks the "not a CPA firm" disclaimer the Netherlands post has. |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 2 | 1,951 words — exceeds the 1,600-word pillar bar. |
| 18 | 2 | Frontmatter parses; no duplicate H2s; no placeholder text; no self-contradiction. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 5 questions whole-line-bold. |

**P0:**
- `content/blog/form-5472-india-residents-us-llc.md:93-100` (specifically **L95**: "This applies to transfers made by individuals from US accounts to accounts outside the US." and **L97**: "If your LLC makes distributions to your Indian bank account, and those transfers are treated as 'remittances' under the statute, they could be subject to the 1% tax.") — **Wrong.** The OBBBA's new IRC §4A excise tax on remittance transfers (confirmed via IRS newsroom guidance on proposed regulations) applies only to remittances funded by cash, money order, cashier's check, or a similar physical instrument handed to a remittance transfer provider. Transfers funded from a US bank account (Bank Secrecy Act-regulated institution — i.e. the LLC's own bank account) or a US-issued debit/credit card are explicitly exempt. The post implies ordinary LLC bank distributions to India could be swept into this tax, which is the opposite of what the statute says. Fix: rewrite to state the 1% excise tax (IRC §4A, OBBBA, effective for transfers on/after 1 Jan 2026) applies only to cash/money-order/cashier's-check remittances through a money-transmitter business, and that ordinary bank wire/ACH/card-funded transfers from a US LLC account to an Indian bank account are exempt.

**P1:**
- `content/blog/form-5472-india-residents-us-llc.md:85` — "the Treasury Department issued a final rule that exempted all US-formed entities" — this was an **interim final rule** (FinCEN IFR, effective 26 Mar 2025), not a standard final rule; the exemption claim itself is correct. Fix: change "final rule" to "interim final rule."
- `content/blog/form-5472-india-residents-us-llc.md:127` — "Most India-based LLC owners who simply didn't know about the requirement qualify for penalty abatement under reasonable cause." — overstates certainty; DIIRSP reasonable-cause relief is evaluated case-by-case, not automatic. Fix: soften to "can present a reasonable-cause case, though relief is not automatic and is evaluated individually."
- `content/blog/form-5472-india-residents-us-llc.md:12,65-67` — conflates the FTIN field with the separately-defined "reference ID number" used only when the US TIN line is blank; could mislead a PAN-holder into thinking they can skip reporting it. Fix: clarify the reference ID is a distinct field for when no US TIN exists, not a substitute for reporting an existing PAN as FTIN.
- Whole post — only 1 external authoritative link (L12) vs. the 2-4 rubric target. Fix: add citations for the 26 CFR §1.6038A-4 reportable-transactions definition, the FinCEN BOI interim final rule, and a corrected source for the remittance-tax claim.

**P2:**
- `content/blog/form-5472-india-residents-us-llc.md:163` — the only `/start` link is at the very end. Fix: add an early CTA in the TL;DR section (~L20-29).
- `content/blog/form-5472-india-residents-us-llc.md:14,22,26,157` — $25,000 penalty repeated without a fresh inline citation each time. Fix: add "(IRC §6038A(d))" or a link near at least one more mention.
- Whole post — no "Form5472 Prep is not a CPA firm" disclaimer (present in the Netherlands post at L61), notable given the reasonable-cause/DIIRSP discussion borders on advice. Fix: add a one-sentence disclaimer.
- `content/blog/form-5472-india-residents-us-llc.md:3` — description is 154/155 chars, essentially no margin. Fix: trim a few characters.

---

## form-5472-netherlands-residents-us-llc — score 38/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | L11 bolded answer (~55 words) + L13 sourced stat + `/start` link. |
| 2 | 2 | Nearly every H2 answers in its first sentence. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | 4 tables + an 8-step numbered procedure (L99-108). |
| 5 | 2 | $25,000 (L13), treaty (L49), BSN/RSIN (L33), worldwide-income rule (L114) all named-sourced; exchange-rate example explicitly labeled "illustrative, not official" (L93). |
| 6 | 2 | All checked claims verified accurate (treaty listed, fax number, penalty, deadlines, no-e-file rule, BSN/RSIN definitions, pricing). |
| 7 | 2 | EUR→USD table (L84-93) + "Four scenarios, worked through" (L118-126). |
| 8 | 2 | "Form 5472" + "Netherlands"/"Dutch" in title, slug, first 100 words. |
| 9 | 2 | "## Frequently asked questions" (L136), 6 H3 questions, all well under 50 words. |
| 10 | 2 | `/start` at L13 and L164; 2 related-post links (L78, 164); all internal links 200. |
| 11 | 2 | 4 external links (irs.gov ×2, belastingdienst.nl ×2). |
| 12 | 2 | `updated: 2026-08-19`; 2026 referenced (L29, 124). |
| 13 | 2 | Title 38 chars, description 132 chars. |
| 14 | 2 | L132 pricing exact match. |
| 15 | 2 | Explicit "not a CPA firm" disclaimer (L61); no puffery. |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 2 | 2,053 words — exceeds the 1,600-word bar. |
| 18 | 2 | Frontmatter parses; no duplicate H2s; no placeholders; no self-contradiction. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 6 questions H3. |

**P0:** none found.

**P1:**
- `content/blog/form-5472-netherlands-residents-us-llc.md:29` — deadline claim ("...the 2025 calendar-year Form 5472 package was generally due 15 April 2026.") has no fresh inline citation at that sentence. Fix: add a direct inline link to the IRS Form 5472/Form 7004 instructions next to the deadline claim.

**P2:**
- `content/blog/form-5472-netherlands-residents-us-llc.md:84-93` — exchange rates correctly labeled illustrative but no recommended rate source is named. Fix: cite the IRS yearly-average-exchange-rates page.
- `content/blog/form-5472-netherlands-residents-us-llc.md:13` vs `:164` — two `/start` links use different `utm_campaign` values; likely intentional, worth confirming both are tracked in analytics.
- `content/blog/form-5472-netherlands-residents-us-llc.md:142` — "Is the KvK number always the FTIN?" uses "KvK" without expansion. Fix: expand to "the KvK (Dutch Chamber of Commerce) number" on first use.

---

## form-5472-singapore-residents-us-llc — score 38/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | L11 bold lead (53 words) + L13 sourced $25,000 stat (linked) + `/start` link, all in first ~10%. |
| 2 | 2 | Every H2 answers immediately, question-form used naturally. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | 5 tables + 2 numbered lists. |
| 5 | 2 | $25,000 sourced inline (L13); SGD conversion figures labeled "illustrative, not official" (L92). |
| 6 | 2 | Treaty-absence claim (L48) verified TRUE against IRS A-to-Z page. Fax number, penalty, e-file prohibition all verified. No invented facts. |
| 7 | 2 | Original SGD→USD worked example (L85-90) + "Four scenarios, worked through" (L117-125). |
| 8 | 2 | "Form 5472" + "Singapore" in title, slug, first 100 words. |
| 9 | 2 | "## Frequently asked questions" (L135), 6 H3 questions, well under 50 words each. |
| 10 | 2 | `/start` at L13 and L163; related-post links L77, 163; all 5 internal links 200. |
| 11 | 2 | 4 external links (irs.gov ×2, iras.gov.sg ×2), all 200. |
| 12 | 2 | `updated: 2026-08-19`; explicit "2025"/"2026" prose mentions (L28, 123). |
| 13 | 2 | Title 42 chars, description 130 chars. |
| 14 | 2 | L131 pricing exact match. |
| 15 | 2 | No puffery; CPA-firm disclaimer present twice (L60, 133). |
| 16 | 2 | Pre-verified: image + `ARTWORK_ALTS["form-5472-singapore-residents-us-llc"]` present (blog.ts:152). |
| 17 | 2 | 1,988 words — exceeds the 1,600-word bar. |
| 18 | 2 | No duplicate H2s, no placeholders, no self-contradiction, frontmatter parses. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 6 questions H3. |

**P0:** none found. **P1:** none found.

**P2:**
- `content/blog/form-5472-singapore-residents-us-llc.md:28` — deadline sentence has no inline citation at this exact sentence (nearest link is L13). Fix: add a direct link to the Form 7004/i5472 instructions here.
- `content/blog/form-5472-singapore-residents-us-llc.md:133` — "If the LLC still needs an EIN, the EIN service is $149 at [/ein](/ein)." sits inside the primary pricing paragraph, slightly diluting single-CTA focus. Fix: consider moving to the FAQ or a "related services" aside.

---

## form-5472-uae-dubai-residents-us-llc — score 29/38

| Line | Score | Note |
|---|---|---|
| 1 | 1 | L11 bold lead is 70 words (target 40-60); sourced stat and `/start` link (L17) present and early, but the lead overruns the length target. |
| 2 | 1 | L52 H2 ("What goes in the FTIN box if the UAE gave you no tax ID?") is followed by a throwaway lead-in before the actual answer — violates "H2 leads with its answer." |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 1 | Zero markdown tables anywhere (confirmed: `grep -c "^|"` = 0) despite table-friendly content (Part II lines 4b(1)/(2)/(3) at L58-61; three no-treaty consequences at L44-50). Sibling Singapore post uses 5 tables for comparable content. |
| 5 | 1 | $25,000 penalty sourced (L38, linked); but 9% UAE corporate tax / AED 375,000 threshold / 1 June 2023 date (L78), the 3.6725 AED peg (L96), and the 30% FDAP withholding rate (L48) are all asserted with no citation. |
| 6 | 1 | Treaty-absence claim (L42) verified TRUE. But L38: "continued failure more than 90 days after IRS notification adds another $25,000" is imprecise — IRS instructions actually impose an additional $25,000 for **each 30-day period (or part of a period)** past 90 days, uncapped, not a single top-up. Understates real penalty exposure. |
| 7 | 1 | "Typical Dubai-based owner" bullet list (L31-36) is original but there is no worked numeric example despite discussing AED conversion at L96 (contrast Singapore's SGD table). |
| 8 | 2 | "UAE," "Dubai," "Form 5472" all in title, slug, first 100 words. |
| 9 | 2 | "## Frequently asked questions" (L116), 6 H3 questions, concise. |
| 10 | 1 | CTA placement correct (L17, L150), but **3 of 8 internal links return 404 on the live site** — see P0. |
| 11 | 1 | Only 1 external authoritative link (L38, irs.gov) vs. the 2-4 target; the post's central "no US-UAE treaty" claim (repeated L11, 42-50, 122-124) is never hyperlinked to the IRS treaty A-to-Z page, unlike the Singapore sibling. |
| 12 | 1 | `updated: 2026-08-15` present, but the only "2026" anywhere in visible body text is inside a URL slug (`/blog/form-5472-deadline-2026`, L100) — no reader-facing current-year statement, unlike Singapore. |
| 13 | 2 | Title 51 chars, description 153 chars (close to cap but compliant). |
| 14 | 2 | L110 pricing exact match to source of truth. |
| 15 | 2 | No puffery; CPA-firm/no-tax-advice disclaimer present (L112). |
| 16 | 2 | Pre-verified: image + `ARTWORK_ALTS["form-5472-uae-dubai-residents-us-llc"]` present (blog.ts:147). |
| 17 | 2 | 2,269 words — exceeds the 1,600-word bar. |
| 18 | 2 | No duplicate H2s, no placeholders, no self-contradiction, frontmatter parses. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all 6 questions H3. |

**P0 (broken links — independently re-confirmed 404 by curl and by reading target frontmatter):**
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:70` — `[FTIN and reference ID guide](/blog/form-5472-ftin-reference-id-foreign-address)` → live curl returns **404**. Target's `publishAt: "2026-09-14T09:00:00-04:00"` is after today (2026-08-19) — the post isn't live yet. Fix: remove/hold the link until the target is live, or move the target's `publishAt` to on/before this post's date.
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:70` — `[do I need an ITIN for Form 5472](/blog/itin-required-form-5472)` → live curl returns **404**. Target `publishAt: "2026-08-31T09:00:00-04:00"`. Same fix.
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:86` — `[multiple related parties on Form 5472](/blog/multiple-related-parties-form-5472)` → live curl returns **404**. Target `publishAt: "2026-09-21T09:00:00-04:00"`. Same fix.

**P1:**
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:38` — "continued failure more than 90 days after IRS notification adds another $25,000." Fix: "…adds another $25,000 for each 30-day period (or part of a period) the failure continues, with no stated maximum."
- Whole post — only 1 external link total; central no-treaty claim never sourced. Fix: add `https://www.irs.gov/businesses/international-businesses/united-states-income-tax-treaties-a-to-z` at first mention (L42); source the UAE corporate-tax figures (L78) to mof.gov.ae or Federal Decree-Law No. 47 of 2022.
- Whole post — zero comparison tables despite table-appropriate content (L58-61, L44-50). Fix: convert one section into a table to match sibling-post structure.
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:11` — opening bold answer is 70 words vs. 40-60 target. Fix: trim to ~55 words.
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:52` — H2 doesn't lead with its answer. Fix: open with "Usually nothing — the UAE issues no personal tax ID, so most residents leave line 4b(3) blank and use a reference ID instead," then the framing sentence.
- Whole post — no worked numeric example despite discussing AED conversion mechanics (L96). Fix: add a small AED→USD worked table mirroring the Singapore post's SGD example.
- Whole post — no reader-facing current-year statement in body prose. Fix: state "15 April 2026" / "15 October 2026" explicitly in the deadline paragraph (L100).

**P2:**
- `content/blog/form-5472-uae-dubai-residents-us-llc.md:62` — "UAE Tax Registration Numbers exist for VAT and for corporate tax, but those are issued to businesses, not to individuals in their personal capacity" — a natural person conducting business above the UAE corporate-tax threshold can itself hold a TRN in a business capacity; consider a brief caveat.
- Numeric UAE-specific claims (9% rate / AED 375,000 threshold / 1 June 2023 at L78; 3.6725 peg at L96; 30% FDAP withholding at L48) carry no inline named source. Fix: name "UAE Federal Decree-Law No. 47 of 2022" / "IRC §871(a)" inline, or link to mof.gov.ae.

---

## form-5472-penalty-notice-what-to-do — score 33/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | Bold lead (L11, 59 words), sourced $25,000 stat by L19, `/start` link at L15 — all within first 30%. |
| 2 | 2 | H2s consistently lead with the direct answer, mostly question-form. |
| 3 | 2 | No cross-chunk pronoun violations. |
| 4 | 2 | Comparison table (L67-74) + numbered process lists (L97-105, 111-118). |
| 5 | 1 | Most stats sourced inline; "six to twelve months" reply-time claim (L104, 158) has no named source. |
| 6 | 1 | Core $25,000 penalty, CP215, FTA exclusion, fax number, Ogden address all verified accurate — but the 90-day continuation-penalty mechanic is materially understated (see P0). |
| 7 | 2 | Original "arguments that carry weight / what you must attach" table (L67-74). |
| 8 | 2 | Primary query in title, slug, first 100 words. |
| 9 | 2 | 7 FAQ questions, all H3, all ≤50 words. |
| 10 | 1 | `/start` early (L15) and late (128, 164), but never links to the sister post `form-5472-reasonable-cause-letter` despite an entire section on the same topic. |
| 11 | 2 | 3 external irs.gov links, all 200. |
| 12 | 2 | `updated: 2026-08-15`; 2026 dates cited (L39, 51). |
| 13 | 1 | Title 62 chars — exceeds the 60-char limit. Description reads as a topic list rather than answer+click-reason. |
| 14 | 2 | Pricing exact match to source of truth. |
| 15 | 2 | Plain, jargon-free, no puffery. |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 2 | ~2,487 words — well above the 1,200-word how-to bar. |
| 18 | 1 | Internal inconsistency: L28 hints the 90-day continuation penalty recurs ("further amounts accruing"), but L93 and L142 describe it as a single, seemingly capped "additional $25,000." |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all questions H3. |

**P0:**
- `content/blog/form-5472-penalty-notice-what-to-do.md:142` — FAQ answer (likely feeds FAQPage schema): "Per form, per year. Three unfiled years means three separate $25,000 penalties. If a failure continues more than 90 days after IRS notification, the instructions provide for an additional $25,000 penalty for that year." This materially understates the continuation penalty. Verified via IRS instructions and 26 CFR 1.6038A-4: the additional $25,000 applies for **each 30-day period (or part thereof)** the failure continues past 90 days, and is **uncapped**. As written, it implies a single one-time charge (max $50k/year) when real exposure can reach $75k-$100k+ within months. Fix: "Per form, per year — and the escalation doesn't stop at one extra charge. If the failure continues more than 90 days after IRS notification, the instructions add another $25,000 for every 30-day period (or part of one) it continues, with no stated cap."

**P1:**
- `content/blog/form-5472-penalty-notice-what-to-do.md:1` — `title: "I Got a $25,000 Form 5472 Penalty Notice — What Do I Do Now?"` is 62 chars, exceeds the 60-char meta-title limit. Fix: "I Got a $25,000 Form 5472 Penalty Notice — Now What?" (55 chars).
- `content/blog/form-5472-penalty-notice-what-to-do.md:28` — "...the instructions provide for an additional $25,000 penalty, with further amounts accruing for continued non-compliance." Doesn't state the 30-day recurrence or the lack of a cap. Fix: "...the instructions add another $25,000 for every 30-day period (or part of one) the failure continues after day 90 — with no stated maximum."
- `content/blog/form-5472-penalty-notice-what-to-do.md:93` — "...if the failure continues for more than 90 days after IRS notification, an additional $25,000 penalty applies. The notice starts that clock." Reads as one-time. Fix: append "...and that additional $25,000 repeats every 30 days the failure continues, uncapped."
- `content/blog/form-5472-penalty-notice-what-to-do.md:104` — "International penalty correspondence commonly takes six to twelve months for a substantive reply." Unsourced. Fix: attribute to a source (e.g. Taxpayer Advocate Service reporting) or soften to a qualitative statement.
- `content/blog/form-5472-penalty-notice-what-to-do.md:158` — same unsourced "six to twelve months" claim, repeated in FAQ content. Fix: same as above.
- Whole post — never links to `/blog/form-5472-reasonable-cause-letter` despite L61-86 covering the same ground that post details further (and despite that post linking back here twice). Fix: add near L86 or in the closer (L162-164): "For a full walkthrough of what the letter itself should contain, see [our reasonable cause letter guide](/blog/form-5472-reasonable-cause-letter)."

**P2:**
- `content/blog/form-5472-penalty-notice-what-to-do.md:3` — description reads as a keyword list. Fix: "Got a $25,000 Form 5472 penalty notice? Here's what CP215 means, why your reasonable-cause letter may have been ignored, and how to respond before the deadline."
- `content/blog/form-5472-penalty-notice-what-to-do.md:122` — H2 "Getting the delinquent filings done" is the only non-question-form H2 (functional CTA section); minor stylistic inconsistency, not a real defect.

---

## form-5472-reasonable-cause-letter — score 37/38

| Line | Score | Note |
|---|---|---|
| 1 | 2 | Bold lead (L11, 55 words), sourced stats L13/L15, `/start` link L13 — all within first 30%. |
| 2 | 2 | Every H2 leads with the direct answer, consistently question-form. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | Comparison table (L37-44) + numbered lists (66-77, 86-93, 109-115). |
| 5 | 2 | Every number ($25,000 L15; 15 April 2026 L117) has an inline named IRS source. |
| 6 | 2 | Every checkable claim verified accurate: $25,000 penalty and citation, exact quote at L99 verbatim-matched to the IRS page, lack-of-knowledge standard (L31), reasonable-cause examples (L50, verbatim match), 15 April 2026 due date (L117), fax number (L121) — all confirmed against irs.gov. No continuation-penalty claim made here, so no exposure to the sister post's P0. |
| 7 | 2 | Original 8-step reasonable-cause skeleton (L84-95), deliberately avoiding a fabricated "sample letter." |
| 8 | 2 | Primary query in title, slug, first 100 words. |
| 9 | 2 | 7 FAQ questions, all H3, well under 50 words. |
| 10 | 2 | `/start` at L13 and L155; links to sister post at L103 and L155; all internal links resolve 200. |
| 11 | 2 | 4 external irs.gov links (L13, 15, 99, 117), all 200. |
| 12 | 2 | `updated: 2026-08-19`; 2026 date cited (L117). |
| 13 | 1 | Title 50 chars and description 128 chars within limits, but description states the answer without a distinct click-reason clause. |
| 14 | 2 | Pricing exact match; EIN "$149 at /ein" cross-checked against `src/app/(marketing)/ein/page.tsx` and confirmed accurate. |
| 15 | 2 | Plain, jargon-free, explicitly honest ("instead of a fake sample letter with invented facts," L84). |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 2 | ~1,934 words — exceeds both the 1,200-word and 1,600-word bars. |
| 18 | 2 | No duplicate H2s, no placeholders, no self-contradiction, frontmatter parses. |
| 19 | 2 | FAQ H2 matches extractor regex exactly; all questions H3. |

**P0:** none — every verifiable IRS/legal claim checked out against primary sources.

**P1:**
- `content/blog/form-5472-reasonable-cause-letter.md:3` — description states the answer ("A Form 5472 reasonable cause letter needs a dated, evidence-backed account of ordinary care, the failure, and prompt correction.") with no explicit click-reason clause. Fix: "A Form 5472 reasonable cause letter needs a dated, evidence-backed account of ordinary care — here's exactly what to include and what the IRS actually credits."

**P2:** none material.

**Cross-post note:** `form-5472-reasonable-cause-letter` links to `form-5472-penalty-notice-what-to-do` twice (L103, 155), but the reverse link is missing on the penalty-notice post (flagged there as P1). Fixing that one link closes the only structural gap between the two posts.

---

## form-5472-reportable-transactions-examples — score 33/38

Body word count: 997 words.

| Line | Score | Note |
|---|---|---|
| 1 | 1 | L14 gives a 54-word quotable answer and L16 links `/start` in the first screen, but no sourced statistic anywhere in the opening 30%. |
| 2 | 2 | Every H2 (L18, 27, 51, 57, 68) answers immediately below. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | Comparison table (L31-47) + numbered 4-item framework (L61-64). |
| 5 | 0 | No statistic meets number+population+action+timeframe+named-source; the $25,000 figure (L90) has no inline source. |
| 6 | 2 | Fact-checked against irs.gov/instructions/i5472 — Part IV/V/VI definitions (L20), formation/dissolution/contribution/distribution inclusion (L20), $25,000 penalty (L90), Part V DE statement requirement (L49) all confirmed. See P0 on L24. |
| 7 | 2 | Proprietary "four-bucket review" (L59-64) + original 15-row example table. |
| 8 | 2 | "Reportable transaction[s]" in title, slug, first ~62 words (H2 at L18). |
| 9 | 2 | FAQ has exactly 4 H3 questions (L76, 80, 84, 88), each ≤32 words. |
| 10 | 1 | `/start` linked early (L16) and near close (L94), but no link to any related post (e.g. the SaaS-founders companion piece). |
| 11 | 2 | 3 external irs.gov links (L20, 49, 66), all 200. |
| 12 | 2 | `updated: 2026-07-27` matches "Last updated: July 2026" body text (L12); current year. |
| 13 | 2 | Title 46 chars, description 137 chars. |
| 14 | 2 | Single CTA target; price "$149" (L72) matches source of truth. |
| 15 | 2 | Plain, jargon-free; no puffery. |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 1 | 997 words vs. required ≥1,200 for a how-to/topic post — short by ~17%. |
| 18 | 2 | No duplicate H2s, no truncation, no placeholders, dates consistent. |
| 19 | 2 | H2 at L74 is exactly "## Frequently asked questions"; 4 H3 questions. |

**P0:**
- `content/blog/form-5472-reportable-transactions-examples.md:24` — `"Was the other person a related party?" A 100% foreign owner is related.` — presented as the related-party test before the post's 100%-ownership scoping disclaimer appears at L29. Per irs.gov/instructions/i5472, the actual Form 5472 related-party threshold is **any direct or indirect 25% foreign shareholder**, not 100%. A reader with, say, 30-90% foreign ownership reading L24 before L29 could reasonably conclude they aren't "related" and skip a filing they actually owe. Fix: reorder/reword L24 to state the general test first, e.g. "A foreign owner with at least 25% direct or indirect ownership is related; in the 100%-owner example used throughout this article, that threshold is automatically met."

**P1:**
- `content/blog/form-5472-reportable-transactions-examples.md:90` — "The stated penalty is $25,000" has no inline named source. Fix: add "(IRC §6038A(d); IRS Form 5472 instructions)."
- Whole post — no internal link to a related post despite clear topical overlap with the SaaS-founders article. Fix: add a contextual link in the "Do ordinary revenue and expenses" section (L51-55) to `/blog/form-5472-saas-founders`.
- Whole post — 997 words vs. the 1,200-word bar. Fix: expand with one more worked example or a short case study to close the ~200-word gap.

**P2:**
- Intro section (near L20) has no original/sourced statistic. Fix: add one sourced figure near the intro, e.g. an IRS data point on international information-return penalties, if available.

---

## form-5472-saas-founders — score 31/38

Body word count: 722 words.

| Line | Score | Note |
|---|---|---|
| 1 | 1 | L14 gives a ~54-word quotable answer, L16 links `/start` early — no sourced statistic in the opening 30%. |
| 2 | 2 | Every H2 (L18, 24, 36, 42, 56) answers immediately. |
| 3 | 2 | No cross-chunk pronouns. |
| 4 | 2 | Comparison table (L28-32) + numbered 7-item "year-end packet" list (L46-52). |
| 5 | 0 | No number+population+timeframe+named-source statistic anywhere. |
| 6 | 2 | Fact-checked: DE-as-reporting-corporation for §6038A (L20) confirmed against the IRS single-member-LLC page + i5472 instructions; contributions/distributions/formation reportability (L34) confirmed; EIN requirement and FTIN/reference-ID mechanics (L74) confirmed; pricing (L58) matches source of truth exactly. |
| 7 | 2 | "SaaS year-end packet" (L44-52) and 3-lane transaction table (L28-32) are original frameworks. |
| 8 | 2 | "SaaS founder[s]" + "Form 5472" in title, slug, first sentence (L14). |
| 9 | 2 | FAQ has exactly 4 H3 questions (L64, 68, 72, 76), each ≤32 words. |
| 10 | 1 | `/start` linked early (L16) and near close (L82) — no link to any related post (e.g. reportable-transactions-examples). |
| 11 | 2 | 3 external irs.gov links (L20, 34, 54), all 200. |
| 12 | 2 | `updated: 2026-08-10` present, current year — but see P0, body text conflicts with this date. |
| 13 | 2 | Title 57 chars, description 125 chars. |
| 14 | 2 | Single CTA target; pricing (L58) exact match, fax delivery listed as included. |
| 15 | 2 | Plain, direct voice, no puffery. |
| 16 | 2 | Pre-verified: image + alt present. |
| 17 | 0 | 722 words vs. required ≥1,200 for a how-to/topic post — ~40% short; the thinnest file in this batch. |
| 18 | 1 | See P0 — "Last updated" body text conflicts with frontmatter date. Otherwise no duplicate H2s/truncation/placeholders. |
| 19 | 2 | H2 at L62 is exactly "## Frequently asked questions"; 4 H3 questions. |

**P0:**
- `content/blog/form-5472-saas-founders.md:12` — `**Last updated: July 2026**` conflicts with frontmatter `date: 2026-08-10` and `updated: 2026-08-10` (both August 2026) — a visible date inconsistency that also affects the FAQ-schema/date-extraction pipeline (integrity line 18). Fix: change L12 to `**Last updated: August 2026**`.

**P1:**
- Whole post — 722 words vs. the 1,200-word bar, the shortest file in this batch (~40% under target). Fix: expand "Which SaaS transactions belong on Form 5472?" (L24-34) and "What records should a SaaS founder collect?" (L42-54) with worked examples (e.g. a concrete Stripe-payout-vs-founder-withdrawal walkthrough) to add ~450-500 words.
- Whole post — no internal link to a related post. Fix: add a contextual link to `/blog/form-5472-reportable-transactions-examples` in the "Which SaaS transactions belong" section (L24-34).
- Whole post — no sourced statistic anywhere. Fix: add one sourced figure, e.g. from the IRS or a startup-formation data source, on foreign-founder LLC formation volume or penalty assessments.

**P2:** none beyond the above — voice, pricing accuracy, FAQ formatting, and external link quality are all clean.

---

## Batch summary

| Slug | Score | P0 | P1 | P2 |
|---|---|---|---|---|
| form-5472-france-residents-us-llc | 37/38 | 0 | 2 | 2 |
| form-5472-germany-residents-us-llc | 36/38 | 1 | 2 | 2 |
| form-5472-india-residents-us-llc | 28/38 | 1 | 4 | 4 |
| form-5472-netherlands-residents-us-llc | 38/38 | 0 | 1 | 3 |
| form-5472-penalty-notice-what-to-do | 33/38 | 1 | 6 | 2 |
| form-5472-reasonable-cause-letter | 37/38 | 0 | 1 | 0 |
| form-5472-reportable-transactions-examples | 33/38 | 1 | 3 | 1 |
| form-5472-saas-founders | 31/38 | 1 | 3 | 0 |
| form-5472-singapore-residents-us-llc | 38/38 | 0 | 0 | 2 |
| form-5472-uae-dubai-residents-us-llc | 29/38 | 3 | 7 | 2 |
| **Total** | **340/380** | **8** | **29** | **18** |

Average score: 34.0/38 (89.5%). No post invents a US-Singapore or US-UAE tax treaty (the one fact this batch was most at risk of getting wrong). All 10 images and `ARTWORK_ALTS` entries are present. All pricing quotes match `src/lib/pricing.ts` exactly across all 10 posts — no invented $449, no "$199 flat," no "$149/year."

**Highest-priority fixes (in order):**
1. UAE post — 3 dead internal links (404) to not-yet-published posts.
2. India post — wrong remittance-tax claim implying ordinary bank distributions are taxed.
3. Penalty-notice post — understated, uncapped 90-day continuation penalty baked into FAQ-schema content.
4. UAE post — thin sourcing/structure vs. its Singapore sibling (1 external link vs. 4, 0 tables vs. 5, imprecise penalty-escalation claim).
5. SaaS-founders and reportable-transactions posts — both under the 1,200-word depth bar (722 and 997 words) and missing a cross-link to each other.
