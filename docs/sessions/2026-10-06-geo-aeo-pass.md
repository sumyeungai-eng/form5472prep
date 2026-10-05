# 2026-10-06 — GEO/AEO pass (owner: "focus on geo and aeo")

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/aeo-facts` (`aeo-facts`) | `src/lib/llms.ts` (+ new `llms.test.ts`), `src/app/llms-full.txt/**`, new `src/app/llms-guides.txt/**`, `src/lib/seo.ts` (`IRS_OGDEN_MAIL_ADDRESS`), `src/lib/landing-pages.ts`, `content/blog/what-is-form-5472.md`, `src/components/ComparisonTable.tsx`, `src/app/layout.tsx` (meta/OG description), `src/app/(marketing)/[seoSlug]/page.tsx` |
| `~/Developer/f5472-wt/aeo-structure` (`aeo-structure`) | `src/lib/services-pages.ts` (+test), `services/[slug]/page.tsx`, `services/page.tsx`, `faq/page.tsx`, home `page.tsx`, `pricing/page.tsx`, `press/page.tsx`, `compare/page.tsx`, `form-5472-statistics/page.tsx` — see `2026-10-05-aeo-structure.md` |
| `~/Developer/f5472-wt/aeo-compare` (`aeo-compare`) | new `src/lib/provider-prices.ts` (+test), new `compare/form-5472-filing-services/page.tsx`, `src/app/sitemap.ts` |
| `~/Developer/f5472-wt/aeo-integrate` (`aeo-integrate`) | merge + `/compare` hub link, llms.txt entry for the new page, one unverified "most of our customers" claim removed from the Stripe Atlas page, this log |

## Evidence base (in `docs/seo/`)
- `geo-baseline-2026-10-05.md` — Moz AI Visibility (ChatGPT, Google AI Mode, Gemini, Perplexity) for 19 prompts + Bing Copilot AI Performance. We were named in 9/76 prompt×engine slots, only on branded/price prompts; 0/20 comparison slots. Engines cite irs.gov (32%) and competitor comparison/pricing posts (form5472.online "best services 2026" etc.).
- `aeo-audit-2026-10-05.md` — template scores + P0/P1/P2 fix list (file:line).
- `form5472-price-survey-2026-10-05.md` — 16 competitors' published prices with verbatim quotes + URLs (checked 2026-10-05).

## What shipped
- **Factual (P0):** removed wrong "Rev. Proc. 2020-29" DIIRSP citation; IRS mail address corrected to "1973 Rulon White Blvd, M/S 6112, Attn: PIN Unit, Ogden, UT 84201" (was "Stop 6273"); removed invented DIIRSP "high acceptance rate"/"most accepted"/"3 years" claims and the false "IRS evaluates the statement before assessing" mechanic + "no US tax owed" eligibility; fixed "automatic June 15 extension" blog line; llms.txt pixel/priority-support/ITIN/penalty wording; DIY time unified to the IRS burden estimate (6 hr 34 min); unqualified "money-back guarantee" mentions now say "if we fail to submit".
- **llms:** facts generated from `pricing.ts`/`seo.ts` with `llms.test.ts` guards; `/llms-full.txt` cut from 2.3 MB to ~410 KB core corpus (all FAQ answers, pricing, statistics, services, landing pages); guides moved to `/llms-guides.txt` (noindex).
- **Structure:** all 74 service-page sections now have question H2s + ≤60-word answer capsules (test-enforced); prices stated on partner pages; home "When is Form 5472 due?"; /pricing "How much does Form 5472 filing cost?"; Speakable selectors fixed and verified (/, /faq, /pricing, /services/*); capsules on /compare, /services, /press, /form-5472-statistics.
- **New page** `/compare/form-5472-filing-services` — 13 providers' published one-year prices ($49.99–$599; bundles $899–$1,500/yr) with source links, check date, disclosure that we are listed; ItemList + FAQPage + Article citation JSON-LD.
- **Provider pages** (doola, Firstbase, Clemta, StartGlobal, Zenind, Northwest, Stripe Atlas): ~30 leaked "the facts file says…" phrases removed; every competitor statement attributed to that provider's own page with the check date; doola "$1,499" removed (unverifiable), Firstbase $899/yr Tax Filing package added; unverifiable Northwest claims removed. Test blocks internal-wording leaks.
- Verified on the merged tree: tsc clean, vitest 112 files / 2,020 tests, `next build` OK; local `next start` → 14 key routes 200, zero hits for the removed phrases, hub link + llms entry present.

## Contracts
- Every competitor fact must come from that provider's own page, quoted, with a check date (`provider-prices.ts` test). Snapfile is excluded (possible affiliation — owner to confirm).
- IRS mail address and fax come from `seo.ts` constants; llms facts from code; `llms.test.ts` bans "Rev. Proc. 2020-29", "Stop 6273", "high acceptance".
- Service-page H2s end with "?" and open with a ≤60-word capsule (services-pages.test.ts).
- Never describe the fax receipt as IRS acceptance; never claim DIIRSP outcomes.

## Open
Owner decisions: (1) money-back guarantee — add to Terms §6 or drop (P0-5); (2) home FAQ "we handle the response with the IRS at no charge" — delete or scope + add to Terms (P0-6, also on noindexed pro-form-5472); (3) legal entity name + real LinkedIn/X/Crunchbase profiles for `ORG_SAME_AS` (Gemini does not recognise the brand); (4) is snapfile.tax related to us?; (5) off-site GEO: YouTube how-to videos (AI Mode cited YouTube 7×), Reddit answers, review volume (Trustpilot invites already live — see `2026-10-05-trustpilot-invites.md`).
Follow-ups: re-read Moz AI Visibility after the 2026-10-12 collection (40 prompts) and Bing AI Performance monthly; P2 items in the audit (blog CTA H2 demotion, blog 60-word guard, BlogPosting citation, hard-coded prices in landing-pages/blog).
