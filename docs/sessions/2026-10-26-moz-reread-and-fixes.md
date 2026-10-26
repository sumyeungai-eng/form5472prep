# 2026-10-26 — Moz re-read (ranks 10-25, crawl 10-25, AI 10-19) + fix wave

Owner: "check moz and see if anything we need to improve" → "work on everything once the report is out".
Integration worktree `~/Developer/f5472-wt/int1026` (branch `seo/integrate-2026-10-26`) merged lanes `seo/seoa-2026-10-26` (log: `2026-10-26-seo-pagination-and-money-links.md`) and `seo/geoc-2026-10-26` (log: `2026-10-26-geo-correct-facts.md`) → `main`. Raw data: `docs/seo/moz-data-2026-10-26/`.

## What the data said
- Moz visibility 1.85% (10-04) → 0.47% (10-11) → 1.55% (10-18) → 1.23% (10-25); top-10 24 → 15 → 43 → 33; DA 11; 68 linking domains, 0 genuine (all new = PBN-advert spam).
- GSC (28 d vs prior 28 d): clicks 104 vs 42, impressions 9.18K vs 3.34K, avg position 12.4 vs 21.3. Indexed 268 / not 150. Manual actions + security: none.
- Crawl 10-25: 59 issues (noindex 1 = /start, URL too long 54 (owner: leave), temp redirect 1 + chain 1 = Vercel http→https, NEW duplicate content: paginated pages + itin/form-w-7 hubs).
- Paginated list pages outranked posts; money terms land on the wrong pages (preparer → do-i-need; compare → in-house post; /compare never ranked).
- AI (10-19): ChatGPT ~31–37% (lead), AI Mode 10%, Gemini 5% (last of 4). Engines repeat wrong facts: "~$99" (likely the ended $50 launch promo + Snapfile), "automated generator" (Snapfile = our sister AI-review brand), "Express 3 business days" (old tier). Sentiment Mixed ("company qualifications").
- GSC: 11 URLs have an EXTERNAL Google-selected canonical with no user-declared canonical recorded — 747live.bet (3, incl. /compare/form-5472-filing-services, /services/hire-someone-to-file-form-5472) and marcustheatres.com (8). Hypothesis: Google folded our RSC (Next.js Flight) payloads — same URL, no HTML canonical — into duplicate clusters with other Next.js sites (747live.bet is Next.js).

## What shipped
- Paginated `/blog/page/[n]` and `/blog/topics/[tag]/page/[n]` (n≥2) `noindex, follow` + out of sitemap; form-w-7 hub cross-canonical → /blog/topics/itin (no noindex — avoids conflicting signals).
- Exact-anchor links: do-i-need → /services/form-5472-preparer, /services/hire-someone-to-file-form-5472; in-house + comparison posts → /compare/form-5472-filing-services.
- `BRAND_CAPSULES` (src/lib/faq.ts): cost (+$99 only per extra past year), not automated (PTIN-holding tax accountant), Express 24 h, legit, Snapfile (same team; $79 AI-only vs our human review) on home/pricing/about/faq + llms "Quick answers".
- "online filer" / "automatically generates" (RCS) / "We generate every form" → prepared + PTIN review wording.
- `next.config.mjs` headers(): `X-Robots-Tag: noindex` when the request has `RSC: 1` (Vercel serves RSC as prerendered `.rsc` files that never reach middleware — a first middleware version was verified live NOT to apply, then moved here); robots disallows `/*?_rsc=` and `/*?*&_rsc=`. Test: `src/lib/rsc-noindex-config.test.ts`.
- provider-prices.ts: Snapfile is ours (comment fixed). Snapfile live 2026-10-26: $79 AI review (+$69/yr), $149 human review "Offered and fulfilled by Form5472Prep.com".
- Verified: src/lib + (marketing) tests 3,134/3,134 before the RSC change; middleware/robots tests 6/6 after; tsc clean; `next build` exit 0; Codex review — RSC rule narrowed to the header only (finding fixed); Snapfile "$89" finding not reproduced on the live site.

## Contracts
- The RSC noindex rule must keep its `has: rsc=1` condition; never noindex normal HTML.
- Paginated list pages stay noindex,follow; page 1 indexable.
- Brand facts come from `BRAND_CAPSULES` + pricing.ts; reviewer wording "a tax accountant who holds an IRS PTIN".

## Open
- Owner: named reviewer + credentials; legal name + LinkedIn/X/Crunchbase; Google Ads consent gate; home claims; money-back guarantee vs Terms; disavow; hire-someone 301 merge; ask comparison sites citing us to state $149/human review.
- Follow-ups: GSC request indexing for the external-canonical URLs (quota ~10/day); watch whether the RSC change clears them; Moz ranks 11-01, AI 10-26/11-02; image alt text fails on 74/76 Moz page-optimization pairs.
