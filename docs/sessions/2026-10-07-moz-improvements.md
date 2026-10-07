# 2026-10-07 — Moz-report improvements (code side)

Follows `docs/sessions/2026-10-07-moz-full-report.md`; implements the "we can do in code" actions from `docs/seo/moz-full-report-2026-10-07.md` §4a.

## Ownership
Lane worktrees under `~/Developer/f5472-wt/` (links, guides, newpages, chrome, blogexp) merged into `integrate` (branch `seo/integrate-2026-10-07`) → `main`. No other checkout touched. The integrate worktree has its own `npm ci` node_modules (the shared one lacked `imapflow`/`mailparser` added by the questions/mailbox session).

## What shipped
- **C1 internal links** (`a6e0588`): 85 contextual links in 61 posts; guide owners 0→6–13 inbound blog links. Log: `docs/seo/internal-links-2026-10-07.md`.
- **C2/C11 chrome** (`3cdc8e8`): footer "Guides" band (`src/app/(marketing)/layout.tsx`); `alternateName` on Organization + WebSite; brand inside home H1; /about H1 "About Form5472 Prep"; /pricing + compare → /blog/form-5472-cost; late service → reasonable-cause guide; preparer H2.
- **C3–C7, C10, C14 guides** (`aad2553`): /form-5472-penalty relief/abatement/FTA (IRM 20.1.1.3.3.2.1 excludes Form 5472)/appeal; /form-5472-fax-number retitled "Where to File Form 5472…"; e-file capsule; who-must-file + requirements; instructions page names Rev. Dec 2024 + on-page TOC; deadline/foreign-owned-llc-tax/DIIRSP/Germany/UAE links.
- **C6/C8/C9 new pages** (`7a7486d`): /form-5472-example (+ watermarked `public/samples/form-5472-example-sample.pdf`), /can-a-foreigner-own-a-us-llc, /what-is-a-disregarded-entity; posts form-5472-software-… (publishes 2026-10-14) and form-966-closing-… (2026-10-15).
- **C10/C12 blog expansions** (`9f42f1f`): deadline, multi-member (retitled), EIN, contributions/distributions, bank account; NZ/Germany titles to the "Residents With a US LLC" pattern.
- **Fix-ups** (`f7b6dec` + review fix): llms-full cap 420→460 KB; CP-15→CP 215 in landing pages (IRM 20.1.9.5.2); reliance-on-adviser removed from "strong reasons" lists; Part I line 3 / Part VII labels corrected; 199 hard-coded prices → `pricing.ts` with guard `landing-prices.test.ts`; continuation-penalty examples corrected ($175,000 / $275,000); June-30 7004 wording.
- Verified: 12 suites / 385 tests pass; `tsc` clean; `next build` exit 0; Codex read-only review — 1 finding (7004 wording), fixed.

## Contracts
- Literal prices in `LANDING_PAGES` now fail `landing-prices.test.ts` — use `pricing.ts`.
- `/llms-full.txt` cap is 460 KB; next growth should split service pages out like `/llms-guides.txt`.
- Topic owners per report §3.1a — link to the owner with its anchor; don't retitle top-10 pages.

## Open
- Owner-gated (unchanged): entity name + sameAs profiles, YouTube/Reddit, snapfile.tax, guarantee vs Terms §6 / IRS-response FAQ, Nov 301 merges, GA4, directory/comparison outreach.
- Follow-ups: "CP-15" still in `faq.ts`, `llms.ts`, contact and form-5472-filing pages; unsupported penalty-timing claims ("6–18 months", "Day 60–180", "assessed automatically… no human review"); blog posts still hard-code prices; PageSpeed API quota blocked (retry later); GSC request indexing for changed pages after deploy (quota ~10/day); re-read Moz Oct 11/12 vs report §5.
