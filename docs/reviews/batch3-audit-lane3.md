# Batch 3 audit — Lane 3 (3 country posts: Hong Kong, Pakistan, Mexico)

Auditor: read-only fact check against docs/reviews/blog-geo-aeo-audit-brief.md (incl. addendum) and the
"legal facts" block in docs/reviews/new-posts-batch-3-spec.md. Verified against irs.gov (i5472, the treaty
A-to-Z page, the Pakistan treaty-documents page), Hong Kong's ird.gov.hk (profits-tax page), Pakistan's
fbr.gov.pk (registration guidance), Mexico's gob.mx/sat (REFIPRE press release), and cross-checked the
OECD-sourced HKID/RFC TIN-equivalent claims via WebSearch (oecd.org itself returned HTTP 403 to automated
fetchers — bot-blocked, not down; treated as "unverifiable here" per the addendum's comptroller.texas.gov
precedent, not as broken). All three files are working-tree, not yet deployed (no `publishAt`, `draft: false`).
Internal `/blog/` link targets were checked against `content/blog/*.md` in the working tree (not the live
site, per addendum). External links curl-verified on 2026-08-21.

---

## form-5472-hong-kong-residents-us-llc — score 38/38

- P0: none found.
- P1: none found.
- P2 (polish):
  - Line 27: the post cites "IRC §6038A(d)" for the base $25,000 penalty but never names the specific
    §6038A(d)(2) continuation subsection when describing "another $25,000 applies for each 30-day period, or
    fraction, continuing beyond the 90-day response period" (same sentence). The underlying fact is correct
    (verified verbatim against the i5472 instructions: "an additional penalty of $25,000 will apply... for
    each 30-day period (or part of a 30-day period) during which the failure continues after the 90-day
    period ends"), so this is a missing inline citation, not an error. Fix: "...another $25,000 applies
    (§6038A(d)(2)) for each 30-day period..."

Verification notes: Treaty claim (line 62, "Hong Kong has no US income tax treaty, and the US-China income
tax treaty does not extend to the Hong Kong Special Administrative Region") confirmed against the IRS
treaty A-to-Z page — China is listed with its own treaty-documents link, Hong Kong is not listed anywhere
in the table. HKID-as-FTIN claim (line 49) confirmed: HKID is the OECD/CRS-recognized TIN equivalent for a
Hong Kong individual (IRD's own AEOI/TIN guidance and multiple TIN registries agree); HK entities use the
Business Registration number, matching the post's claim. HK territorial-tax claim (line 66, "profits arising
outside Hong Kong are generally not taxed") confirmed against ird.gov.hk: "No tax is levied on profits
arising abroad, even if they are remitted to Hong Kong" — and the post correctly avoids stating any tax
rate. $25,000 penalty, substantially-incomplete rule, FTIN "None"/"N/A" instruction, reference-ID
requirement (only when 4b(1) is blank, same ID every year), e-file prohibition, fax number 855-887-7737 at
300 DPI, and the Ogden PIN Unit mailing address all match the i5472 instructions verbatim (fetched
2026-08-21). BOI exemption (26 March 2025 FinCEN IFR) and the 15 April/15 October 2026 deadline pair match
the brief's site facts. HKD 7.80/USD conversion table (lines 74-81) is explicitly labeled "illustrative
workpaper... not a market-rate claim" — no invented statistic. Internal link targets
`/blog/form-5472-currency-conversion-exchange-rates`, `/blog/form-5472-deadline-2026`,
`/blog/form-5472-filed-late-never-filed`, `/blog/how-to-fill-out-form-5472` all exist in the working tree.
External links (i5472, treaty A-to-Z, IRD profits-tax page) all curl 200; the OECD TIN-portal link curls 403
to automated tools (Cloudflare-style bot block) but the underlying fact it supports is independently
verified true — flagged as "unverifiable here," not broken. Pricing exactly $149/$199/+$99 (line 120) —
correct. No duplicated H2s, no placeholder text, no cross-section pronouns, no conflicting facts. Frontmatter
parses: title 49 chars, description 135 chars, both under caps; tags are 4 lowercase-kebab entries. FAQ: H2
is exactly "## Frequently asked questions," 7 questions as H3s, answers 25-35 words each (cap 50). Bold
answer block is 52 words (band 40-60). Word count 2,225 (bar: ≥1,600 for a country guide — passes with
margin).

---

## form-5472-pakistan-residents-us-llc — score 38/38

- P0: none found.
- P1: none found.
- P2 (polish):
  - Line 29: same pattern as the Hong Kong post — "§6038A(d)" is named for the base penalty but the
    §6038A(d)(2) continuation subsection is not named in the following clause describing the 30-day
    continuation penalty. Fact is correct, citation is just general rather than specific. Fix: add
    "(§6038A(d)(2))" where the continuation penalty is first described.

Verification notes: CNIC-as-NTN claim (line 51, "an individual's CNIC is used as the NTN or registration
number, while companies and associations use the NTN received after enrolment") confirmed verbatim against
fbr.gov.pk: "In case of individuals, 13 digits Computerized National Identity Card (CNIC) will be used as
NTN or Registration Number" / "NTN or Registration Number for AOP and Company is the 7 digits NTN received
after e-enrollment." Treaty claim (line 64, "the IRS treaty A-to-Z list includes Pakistan, and the IRS hosts
the US-Pakistan income tax treaty signed in 1957") confirmed against both the treaty A-to-Z page (Pakistan
listed) and the IRS Pakistan tax-treaty-documents page ("Income Tax Treaty PDF - 1957"). The post correctly
does not mention the OBBBA §4475 remittance tax at all — the spec makes this optional ("state correctly if
mentioned at all"), and since Payoneer/Wise transfers described are card/bank-funded, omitting the (largely
inapplicable) remittance-tax topic is not a defect. $25,000 penalty, substantially-incomplete rule, FTIN
"None"/"N/A" instruction, reference-ID rule, e-file prohibition, fax number/DPI, and Ogden mailing address
(lines 29, 51-58, 99-107) all match the i5472 instructions verbatim. BOI exemption and 15 April/15 October
2026 deadlines match site facts. PKR 280/USD conversion table (lines 74-81) is explicitly labeled
illustrative, not a market-rate claim — no invented statistic. Internal link targets
`/blog/form-5472-deadline-2026`, `/blog/form-5472-filed-late-never-filed`,
`/blog/form-5472-reportable-transactions-examples` all exist in the working tree. External links (i5472,
treaty A-to-Z, Pakistan treaty-documents page, FBR registration guidance) all curl 200. Pricing exactly
$149/$199/+$99 (line 123) — correct. No duplicated H2s, no placeholder text, no cross-section pronouns, no
conflicting facts. Frontmatter parses: title 48 chars, description 139 chars, 5 lowercase-kebab tags. FAQ: H2
exact match, 7 questions as H3s, answers 25-36 words each. Bold answer block is 53 words. Word count 2,254
(passes the ≥1,600 country-guide bar).

---

## form-5472-mexico-residents-us-llc — score 38/38

- P0: none found.
- P1: none found.
- P2 (polish):
  - Line 29: same §6038A(d) vs. §6038A(d)(2) citation-specificity gap as the other two posts, same fix.

Verification notes: RFC-as-FTIN claim (line 49) and the RFC length claim (line 51, "an individual RFC as 13
characters and an entity RFC as 12 characters") independently confirmed via WebSearch against
OECD/Mexico-TIN reference material and Mexico tax-ID guides (individual RFC = 4 letters + 6 digits + 3
alphanumeric = 13 chars; legal-entity RFC = 3 letters + 6 digits + 3 alphanumeric = 12 chars) — the direct
OECD PDF (oecd.org/.../mexico-tin.pdf) was not independently fetchable (oecd.org 403s to automated tools)
but the fact is corroborated by multiple independent sources and is uncontested. Treaty claim (line 64,
"Mexico appears on the IRS income tax treaty A-to-Z list, confirming a US-Mexico income tax treaty is in
force") confirmed — Mexico is listed on the treaty A-to-Z page with its own treaty-documents link. REFIPRE
claim (line 68, "SAT maintains an information-return system for foreign entities subject to REFIPRE,"
sourced to the cited gob.mx/sat press release) confirmed: the release describes a new SAT platform
(effective 1 Dec 2024) that includes "Consulta de declaraciones informativas" for REFIPRES (preferential tax
regimes) covering companies in tax havens and operations through fiscally transparent foreign entities — the
post correctly states no rate and defers to a Mexican adviser. $25,000 penalty, substantially-incomplete
rule, FTIN "None"/"N/A" instruction, reference-ID rule, e-file prohibition, fax number/DPI, and Ogden mailing
address (lines 29, 53-60, 101-107) all match the i5472 instructions verbatim. BOI exemption and 15
April/15 October 2026 deadlines match site facts. MXN 18/USD conversion table (lines 74-81) is explicitly
labeled illustrative, not a market-rate claim. Internal link targets `/blog/form-5472-deadline-2026`,
`/blog/form-5472-filed-late-never-filed`, `/blog/stripe-paypal-wise-form-5472`, `/blog/what-is-form-5472` all
exist in the working tree. External links (i5472, treaty A-to-Z, OECD TIN portal, SAT press release) all curl
200 except the OECD link, which 403s to automated tools but supports an independently-verified-true fact —
flagged "unverifiable here," not broken. Pricing exactly $149/$199/+$99 (line 123) — correct. No duplicated
H2s, no placeholder text, no cross-section pronouns, no conflicting facts. Frontmatter parses: title 46
chars, description 136 chars, 5 lowercase-kebab tags. The Spanish search term ("residente en México LLC
Estados Unidos Form 5472") is mentioned exactly once at line 13, in English-language prose, as the spec
required. FAQ: H2 exact match, 7 questions as H3s, answers 24-32 words each. Bold answer block is 51 words.
Word count 2,184 (passes the ≥1,600 country-guide bar).

---

## Totals across the 3 posts

- P0: 0
- P1: 0
- P2: 3 (one per post — all identical: base penalty cites "§6038A(d)" but the 30-day continuation clause in
  the same sentence doesn't separately cite "§6038A(d)(2)"; the underlying facts are correct in all three, this
  is a missing-inline-citation polish item only)
- Combined score: 114/114 (38+38+38)
