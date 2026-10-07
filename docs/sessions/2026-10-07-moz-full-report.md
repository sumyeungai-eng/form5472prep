# 2026-10-07 — Moz full read-out and improvement report

## Ownership
- Checkout: worktree `~/Developer/f5472-wt/moz-report`, branch `docs/moz-report-2026-10-07` → merged to `main`.
- Files (docs only, no code): `docs/seo/moz-full-report-2026-10-07.md`, `docs/seo/moz-data-2026-10-07/{campaign.md,ai-visibility-and-research.md,rankings.tsv}`, this log, one index line in `REPO-STATE.md`.

## What shipped
- Read-only extraction of everything in Moz for form5472prep.com (campaign 3235940, AI dashboard 3465, Domain Overview, Link Explorer, Link Intersect ×2, Keyword Gap). Nothing in Moz was changed. Research credits used: Domain Overview 4, Link Explorer 9, Competitive Research 4.
- Prioritised report with actions split into code (C1–C15), off-site/owner (O1–O13) and measurement (M1–M5), plus Oct 11–12 re-check criteria.
- Spot-checked: the four guide pages (/form-5472-penalty, /form-5472-instructions, /form-5472-fax-number, /file-form-5472) are live 200 and have 0 links from `content/blog/*.md`; site loads only the Ads tag (AW-), no GA4; apex chain is http→https (Vercel) → www, both 308.

## Key facts (data dates: ranks Oct 4, crawl Oct 5, AI Oct 5; next Oct 11 / Oct 12)
- Visibility 1.85% (Form5472.online 1.67%); top-3/top-10 = 14/24; 206 of 246 tracked keywords outside top 50; DA 10, BA 1.
- 53 of 61 linking domains are one automated "premium PBN" advert page that also targets form5472.online — no genuine editorial links. Decision in report: do NOT disavow; check Manual Actions monthly.
- AI: named in 9/76 slots; Gemini 10.5% vs doola/Firstbase 42%; only 18 of 40 prompts have data until Oct 12.

## Contracts for future editors
- Moz rank tracking is Google en-US desktop only; account keyword slots are shared with Taxley/MileMarketplace — coordinate with the Taxley "seo" session before adding engines or keywords.
- Disavow file candidates are listed in the report's Appendix E — do not upload unless a manual action appears.

## Open
- Owner decisions: entity name + sameAs profiles (O6), YouTube (O7), Reddit (O9), snapfile.tax relationship (O11), money-back guarantee / IRS-response FAQ (O12), November 301 merges (O13), GA4 (M2).
- Follow-ups (us): O1 Search Console inspection of the 12 R1 URLs; C1–C12 code actions; M1 re-read Moz Oct 11/12 against report §5.
