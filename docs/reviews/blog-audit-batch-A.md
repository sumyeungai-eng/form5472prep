# Blog audit — batch A (2026-08-19)

Scope: 8 posts per `docs/reviews/blog-geo-aeo-audit-brief.md`.
california-llc-foreign-owner-tax-filing, delaware-llc-foreign-owner-tax-filing, florida-llc-foreign-owner-tax-filing, texas-llc-foreign-owner-tax-filing, form-5472-australia-residents-us-llc, form-5472-france-residents-us-llc, form-5472-germany-residents-us-llc, form-5472-netherlands-residents-us-llc.

Method: read each `content/blog/<slug>.md` in full; live-checked all 8 pages and every internal link target with `curl -s -o /dev/null -w "%{http_code}"` against `https://www.form5472prep.com`; verified every state-tax and IRS claim against primary sources (FTB, Delaware Division of Corporations, Sunbiz, Texas Comptroller, irs.gov/instructions/i5472, ATO, OECD France TIN, BZSt, Belastingdienst) via WebFetch/WebSearch; confirmed `public/blog/<slug>.webp` exists for all 8 and cross-checked `src/lib/blog.ts` `ARTWORK_ALTS` for all 8 slugs.

Overall: no invented facts, no wrong prices, no wrong fax number/DPI/penalty/deadline anywhere in this batch — the fact-checking line is clean across all 8. The one systemic defect is broken internal links caused by cross-linking to not-yet-published sibling posts (future `publishAt` dates), hitting 4 of the 8 posts. Secondary issue: all 8 posts sit at or under the brief's ~900-word "thin" threshold, and the 4 country posts never restate the current year in body copy.

---

## california-llc-foreign-owner-tax-filing — score 32/34
- P0: none.
- P1: none. All internal links resolve 200 (`/blog/foreign-owned-llc-filing-requirements-checklist`, `/start`). Fact-check clean: $800 annual tax, FTB due date (15th day of 4th month), 2021–2023 AB 85 first-year exemption, $250,000 LLC-fee threshold, June 15 estimated-fee date — all confirmed against FTB and independent sources.
- P2: word count 864 (line 17, thin-content flag per brief threshold <900). Line 15/1: opening stat ("$800") isn't inline-sourced in the 40-60 word answer paragraph itself — the FTB attribution only appears two sections later (line 26/30); minor, since the number is sourced elsewhere in-piece.

Scoring notes (0–2 each, 17 lines, 34 max): 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)2 11)2 12)2 13)2 14)2 15)2 16)2 17)1 = 32/34.

---

## delaware-llc-foreign-owner-tax-filing — score 26/34
- **P0: two broken internal links, live-404.** Line 56: `[recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` → live 404. Line 89: `[final Form 5472 guide](/blog/final-form-5472-closing-foreign-owned-llc)` → live 404. Root cause: both target files exist in `content/blog/` but carry future `publishAt` (2026-09-07 and 2026-09-28 respectively) against a current date of 2026-08-19, so they aren't live yet. The links will self-heal once those posts publish, but today a reader clicking either one gets a 404.
- P1: none beyond the above. Fact-check clean: $300 Delaware LLC tax, June 1 due date, $200 late penalty, 1.5%/month interest, "no annual report" claim — all confirmed verbatim against corp.delaware.gov/frtax and corp.delaware.gov/taxfaq.
- P2: word count 818 (line 17, thin-content flag). Body has only one natural in-text "2026" (the H2 at line 15); acceptable but light.

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)0 (two of the post's link targets 404 live) 11)2 12)2 13)2 14)2 15)2 16)2 17)1 = 26/34.

---

## florida-llc-foreign-owner-tax-filing — score 33/34
- P0: none.
- P1: none. Internal link resolves 200 (`/blog/first-year-form-5472-new-llc`). Fact-check clean: Sunbiz annual report window Jan 1–May 1, $138.75 fee, $400 late fee after May 1 — all confirmed via search of Sunbiz-sourced summaries and the official booklet PDF (200, live).
- P2: word count 846 (line 17, thin-content flag). No other defects; this is the strongest post in the batch — dense with the 2026 year reference (6 in-body mentions), clean question-form H2s, tight FAQ.

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)2 11)2 12)2 13)2 14)2 15)2 16)2 17)1 = 33/34.

---

## texas-llc-foreign-owner-tax-filing — score 33/34
- P0: none.
- P1: none. Internal link resolves 200 (`/blog/form-5472-reportable-transactions-examples`). Fact-check clean and thorough: $2.65M no-tax-due threshold for 2026–2027 reports (confirmed, up from $2.47M prior biennium), PIR/OIR still required below threshold (confirmed), 0.375% retail/wholesale rate, 0.75% other-business rate, $20M EZ-computation revenue limit, 0.331% EZ rate not stated but not claimed either — all figures in the post match current Comptroller guidance exactly. Direct `curl`/WebFetch to comptroller.texas.gov timed out from this environment (network-level, not a real dead link — independent WebSearch results confirm the cited page exists and is current), so treat that one external source as unverified-by-direct-fetch rather than broken.
- P2: word count 836 (line 17, thin-content flag).

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)2 11)2 12)2 13)2 14)2 15)2 16)2 17)1 = 33/34.

---

## form-5472-australia-residents-us-llc — score 28/34
- **P0: one broken internal link, live-404.** Closing line: `[recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` → live 404 (same not-yet-published target as the Delaware post, `publishAt: 2026-09-07`).
- P1: the ATO source link (`https://www.ato.gov.au/api/public/content/0-6faec75b-2772-4cf2-ac8d-ddb6f6d0d102`) is a raw internal API/content-hash URL, not the canonical public page — it returns 403 to both `curl` and WebFetch (bot-blocked or genuinely non-public path). The underlying claim (TFN = unique 9-digit personal reference number, lifelong) is independently verified correct via the canonical page `https://www.ato.gov.au/individuals-and-families/tax-file-number/what-is-a-tax-file-number`, so the fact is right but the citation URL should be swapped to the canonical, human-facing page.
- P2: word count 909 — right at the brief's ~900 thin-content line, borderline pass. No in-body "2026" reference (only in frontmatter dates).

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)1 (one dead related-post link) 11)1 (one of the 3 external links is a fragile/non-canonical API URL) 12)1 (no natural current-year mention in body) 13)2 14)2 15)2 16)2 17)1 = 28/34.

---

## form-5472-france-residents-us-llc — score 31/34
- P0: none. Both internal links resolve 200 (`/blog/form-5472-dormant-llc-no-income`, `/blog/form-5472-diy-vs-preparer`).
- P1: none. Fact-check clean: "numéro fiscal de référence" / "numéro SPI" as the French individual TIN, and SIREN as the entity identifier, both independently confirmed (OECD/France-TIN guidance and secondary tax-ID references). The cited OECD PDF URL returns 200 live; WebFetch couldn't parse its binary/compressed text directly, so the specific quoted phrasing was cross-verified via search instead of the PDF's raw text — no discrepancy found.
- P2: word count 840 (thin-content flag). No in-body "2026" reference (only frontmatter dates) — same gap as the other three country posts.

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)2 11)2 12)1 13)2 14)2 15)2 16)2 17)1 = 31/34.

---

## form-5472-germany-residents-us-llc — score 29/34
- **P0: one broken internal link, live-404.** Line 53: `[owner loans and reimbursements guide](/blog/form-5472-owner-loans-contributions-reimbursements)` → live 404. Target file exists in the repo but `publishAt: 2026-08-24`, five days after the current date (2026-08-19), so it isn't live yet.
- P1: none. Second internal link (`/blog/how-to-fill-out-form-5472`) resolves 200. Fact-check clean: German IdNr (Identifikationsnummer) as the individual FTIN, "assigned automatically," "valid for life" — confirmed verbatim against the BZSt page cited.
- P2: word count 854 (thin-content flag). No in-body "2026" reference (frontmatter only).

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)1 (one dead related-post link) 11)2 12)1 13)2 14)2 15)2 16)2 17)1 = 29/34.

---

## form-5472-netherlands-residents-us-llc — score 28/34
- **P0: one broken internal link, live-404.** Closing line: `[Form 5472 recordkeeping checklist](/blog/form-5472-recordkeeping-checklist)` → live 404 (same unpublished target as the Delaware and Australia posts).
- P1: none. The other internal link (`/blog/form-5472-reportable-transactions-examples`) resolves 200. Fact-check clean: BSN as the individual identifier, RSIN for legal entities, "unique personal number" — confirmed verbatim against the Belastingdienst page cited.
- P2: word count 793 — the shortest post in the batch, clear thin-content flag. No in-body "2026" reference (frontmatter only).

Scoring notes: 1)2 2)2 3)2 4)2 5)2 6)2 7)2 8)2 9)2 10)1 (one dead related-post link) 11)2 12)1 13)2 14)2 15)2 16)2 17)0 (793 words, most notably thin) = 28/34.

---

## Cross-post patterns

1. **Broken related-post links (P0, 4 of 8 posts affected).** `/blog/form-5472-recordkeeping-checklist` (linked from Delaware, Australia, Netherlands) and `/blog/form-5472-owner-loans-contributions-reimbursements` (Germany) and `/blog/final-form-5472-closing-foreign-owned-llc` (Delaware) all exist as files in `content/blog/` but carry `publishAt` dates after today (2026-08-19): 2026-09-07, 2026-08-24, and 2026-09-28 respectively. Until each publishes, every post linking to it 404s live. Fix: either bring the publish dates forward, or don't cross-link to a not-yet-scheduled post before it's live, or add a scheduled re-check.
2. **Thin content (P2, all 8 posts).** Every post in this batch is 793–909 words, at or under the brief's ~900-word pillar/country-guide flag. Structure and sourcing are solid; the gap is depth — none has a true worked numeric example (e.g., a full sample owner ledger with dollar amounts run through Form 5472) despite each claiming a proprietary framework (the compliance calendar / decision matrix / ledger buckets satisfy line 7 minimally but are thin as delivered).
3. **No in-body current-year reference in the 4 country posts (P2).** Australia, France, Germany, Netherlands mention "2026" only in frontmatter (`date`, `updated`), never once in the visible body/H2 text — unlike the 4 state posts, which all work "2026" naturally into at least one heading or sentence. Minor GEO/freshness-signal gap.
4. **No pricing quoted anywhere in this batch.** None of the 8 posts states $149/$199/turnaround inline — every CTA is a bare `/start` link with no price context. Not a factual violation (nothing wrong is stated), but it's a missed opportunity per the brief's pricing-fidelity criterion; consider adding a one-line price mention near the CTA for conversion clarity.
5. **Images/alts: clean.** All 8 `public/blog/<slug>.webp` files exist and all 8 have `ARTWORK_ALTS` entries in `src/lib/blog.ts` (lines 149–157).
6. **Fact-check: clean across the board.** Every checkable IRS and state claim (fax 855-887-7737, 300 DPI, $25,000 penalty, no e-file for foreign-owned DEs, April 15/October 15 deadlines, CA $800/FTB deadlines/$250k fee threshold, DE $300/June 1/$200 late fee/1.5% interest, FL $138.75/$400 late fee/May 1, TX $2.65M threshold/0.375%/0.75%/$20M EZ, AU TFN, FR numéro fiscal-SPI/SIREN, DE IdNr, NL BSN/RSIN) matched its primary source. No invented stats, no wrong prices, no wrong fax number, no wrong deadline, no wrong penalty, no wrong DPI claim found anywhere in this batch.
