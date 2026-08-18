# Blog audit brief — sales-blog-geo-aeo standard (2026-08-19)

Repo: /Users/sumyeung/Documents/Codex/form5472 (posts in content/blog/*.md, images public/blog/<slug>.webp, alts in src/lib/blog.ts ARTWORK_ALTS).
Live: https://www.form5472prep.com/blog/<slug>

Site facts (source of truth: src/lib/pricing.ts):
- Standard $149 (5-7 business days), Express $199 (3 business days), +$99 per additional past tax year. Fax delivery included. NO $449, NO "$199 flat", NO "$149 per additional year".
- Conversion target: /start (EIN post → /ein, ITIN → /itin). Company is NOT a CPA firm, gives no tax advice.
- IRS Ogden PIN Unit fax 855-887-7737. Penalty $25,000/form/year IRC §6038A(d). BOI exempt for US-formed LLCs since FinCEN IFR 26 Mar 2025.
- FAQ schema is auto-extracted from an H2 matching /frequently asked|faq|common questions/i with H3 or whole-line-bold questions beneath.

Score EACH post 0-2 on every line (2=pass, 1=partial, 0=fail), then list concrete defects with line refs:
1. First 30% contains: direct answer (40-60 words, quotable), ≥1 sourced stat, link to conversion target.
2. Every H2 leads with its answer; one concept per section; H2s are question-form where natural.
3. No cross-chunk pronouns ("as discussed above", "this approach").
4. Comparison table OR numbered process list where intent calls for it.
5. Every statistic: number + population + action + timeframe + named source inline. Flag any number with no source.
6. FACT CHECK: every IRS/legal claim you can verify from irs.gov or a primary source. Flag anything unverifiable, wrong, or invented (fake stats, made-up quotes, wrong fax number, wrong deadline, wrong penalty, wrong DPI claim etc.). This is the most important line — check with WebFetch/WebSearch, don't assume.
7. ≥1 proprietary/original element (own data, calc, framework, worked example).
8. Primary query in H1, title, slug, first 100 words.
9. FAQ H2 present with ≥4 PAA-style questions, each answer ≤50 words, and formatted so the extractor picks them up.
10. Internal link to conversion target within first screen AND near close; ≥1 link to a related post; internal links resolve (200 on live site).
11. 2-4 external links to authoritative sources (irs.gov etc.).
12. "updated" frontmatter present; current-year reference where natural.
13. Meta title ≤60 chars, description ≤155 chars, description contains answer + click reason (not keyword-stuffed).
14. One primary CTA, pricing quoted matches source of truth exactly.
15. Voice: plain, jargon-free, no banned puffery; consistent with existing posts (e.g. what-is-form-5472.md).
16. Image: public/blog/<slug>.webp exists AND src/lib/blog.ts has an ARTWORK_ALTS entry for the slug.
17. Word count and depth match intent (thin ≈<900 words for a pillar/country guide is a flag; note it).

Output format (write to the file path given in your prompt, then return ONLY a 5-line summary):
## <slug>  — score X/34
- P0 (wrong/invented fact, broken link, wrong price): ...
- P1 (standard violation): ...
- P2 (polish): ...
