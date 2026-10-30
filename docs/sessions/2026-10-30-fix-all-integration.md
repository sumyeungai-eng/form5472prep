# 2026-10-30 — "fix all": plan P0 + P1 code items (integration)

Owner: "fix all" (plan `docs/seo/plan-2026-10-30-improvement.md`). Integration worktree `~/Developer/f5472-wt/int1030` (branch `seo/integrate-2026-10-30`) merged lanes → `main`:
- `seo/blogx-2026-10-30` — log `2026-10-30-blog-links-country-hub.md`: protected the 9 rankings on noindexed paginated pages (inbound links e.g. Vietnam 3→8, France 1→8, Spain 1→10; list for GSC in `docs/seo/protect-rankings-2026-10-30.md`); new indexable `/form-5472-by-country` hub (36 country + 10 city guides, ItemList/Breadcrumb JSON-LD); orphans 9→0, posts with ≤2 inbound links 62→0; related-posts now same-series first; six partner posts aligned to the live white-label offer; deadline posts link `/form-7004-extension`; card thumbnails keep `alt=""` (title inside same link — decorative, documented).
- `seo/svcx-2026-10-30` — log `2026-10-30-money-pages-ptin-7004.md`: "a tax accountant who holds an IRS PTIN" on every service page (test-enforced), EIN/ITIN/7004 state truthfully the PTIN review belongs to the Form 5472 service; white-label vs partners contradiction resolved to the LIVE offer (white-label Phase 1 shipped 2026-10-30, portal off — see `2026-10-30-partner-white-label-p1.md`); `/form-7004-extension` 4 question-H2 capsules + matching FAQPage + llms quick answers; money-page metas/first paragraphs; no title/H1 changes.
- `seo/guidex-2026-10-30` — log `2026-10-30-guides-aeo-structure.md`: FAQ question markup → `<h3>` (schema now matches visible; tests on 31 guides + 11 FAQ pages); "online filer" removed (test bans it); footer "IRS fax +1-855-887-7737"; how-to pages (`/file-form-5472`, `/form-5472-instructions`, `/form-5472-example`) open with numbered steps + HowTo schema + cross-links; "Updated <date>" on guides; brand on all guides/tools; FTIN "None"/"N/A" FAQ corrected; hidden hard-coded prices ("$149,") found and tokenised.
- Integration (`890520d`, `4be7c39`): Reasonable Cause Statement wording → staff-written from the customer's facts, PTIN review, customer checks before signing (per `src/lib/pdf/generatePackage.ts` + preflight A32) in 17 guide sentences + 2 posts, guard `src/lib/rcs-claim-guard.test.ts`; removed every "most late filings are accepted" outcome claim; one RCS per late year; per-year fax receipts; 4 links to the comparison post (its inbound links fell 77→8 after the related-posts reorder). FAQ schema on /pricing, /compare, /contact verified to match (audit misread ▾/+ glyphs).

## Verified
Lane tests + integration targeted tests green; tsc clean; `next build` exit 0; Codex read-only review: 3 medium fact findings fixed (one RCS per late year not "one covering the full period"; removed "if accepted, no penalty"; penalties may be assessed during processing regardless of the statement) — 0 bugs, 0 price issues.

## Contracts
- Partner copy must match the live white-label offer (no promises of the neutral portal until the owner turns it on).
- RCS: never "auto-generated"; never outcome claims (guard test).
- FAQPage/HowTo JSON-LD must match visible content (tests).

## Open
- GSC (Chrome, sumyeungai@ authuser 2): request indexing for `docs/seo/protect-rankings-2026-10-30.md` URLs + `/form-5472-by-country`.
- Moz 1 Nov ranks/crawl, 2 Nov AI — check the protected rankings moved to the posts.
- Owner (unchanged): named reviewer, legal name + sameAs, Ads consent, home claims, money-back guarantee (~33 pages), disavow, hire-someone 301, off-topic UK car posts, P2 enhancements.
