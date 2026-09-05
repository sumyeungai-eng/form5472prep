# Session log — 2026-09-05 · SEO / AEO / GEO sprint + conversion tools

**Session:** Claude Code `claude-68` · **Worktree:** `~/Documents/Codex/form5472-tools`
**Branch:** `tools/commercial-assets` · **Shipped to main:** `6227bd0` → `52e9598` (8 commits, 102 files)
**Status at close:** all work merged to `origin/main`, deployed, and verified live. No agents running.

**Update, later on 2026-09-05:** a sibling session merged a large branch into
`main` (hktax app + EIN/ITIN payments + 17 posts). Re-verified afterwards —
all three tools, `src/lib/penalty.ts`, the 6 provider entries, the homepage
tools section, IndexNow and this log are intact on `origin/main`. That session
also adopted the push-only deploy rule and wrote `REPO-STATE.md`; read it
alongside this log.

> Read this before editing anything listed under "Files this session owns". Several
> Claude/Codex sessions share this repo — see `CLAUDE.md` for the deploy and
> tree-hygiene rules that caused three production outages before they were written down.

---

## 1. Who owns what (as of 2026-09-05)

| Checkout | Branch | Owner / purpose |
|---|---|---|
| `~/Documents/Codex/form5472-tools` | `tools/commercial-assets` | **This session.** Tools, provider pages, SEO/AEO/GEO. Kept identical to `origin/main`; ships via `git push origin HEAD:main`. |
| `~/Documents/Codex/form5472` | `test/merge-into-main` | hktax / blog session. **Merged into `main` later on 2026-09-05** (`7e7cea6`…`800b35f`): the whole `hktax/` app, EIN/ITIN payment-at-submission + attribution, 4 Prisma migrations, 17 blog posts, and `REPO-STATE.md`. `hktax/` is excluded from the root build via `tsconfig.json` `exclude`, so it ships as source only — it must still never be deployed as the form5472prep production site. |
| `~/Documents/Claude work/form5472` | `feat/seo-geo-aeo-sprint` | Another session (in-guide TOC + H2 anchor links, `c007cbc`). Has unshipped `$49` budget-tier code — **not on `main`, not live**. Its git remote URL contains a plaintext `ghp_…` token; that token needs rotating and the remote switching to SSH. |

**Deploy rule (unchanged, restated because it broke production three times):**
production is whatever is on `origin/main`; Vercel is git-linked and auto-deploys
each push. Deploy with `git push origin main`. Never `vercel --prod` — a CLI deploy
publishes your local tree and the next push silently reverts it.

---

## 2. What this session shipped

### 2a. Discovery — the actual root cause of near-zero organic traffic
Google had only **5 pages indexed**. Cause: the sitemap registered in Search Console
was the **apex** URL, which 307-redirects to `www`; Google last successfully read it
on 2026-05-22, so it was serving from a 22-URL May snapshot.

Fixed:
- Submitted the `www` sitemap in GSC → **Success, 139 pages discovered**
- Requested indexing on 8 priority pages
- Added **IndexNow** (Bing / Copilot / ChatGPT-search): key file in `public/`,
  `scripts/indexnow.mjs`, `npm run indexnow` → HTTP 202 for 139 URLs
- Homepage now links the 3 tools + 8 pillar pages (crawlable hrefs 3 → 15)

Expected ramp: 2–6 weeks. **Re-check GSC around 2026-09-19** before drawing conclusions
or approving the consolidations in §4.

### 2b. Commercial-intent assets (plan `docs/plans/PLAN-tools-and-provider-pages-20260828.md`, now COMPLETE)
- **3 tools:** `/do-i-need-to-file-form-5472` (14-node decision tree),
  `/form-5472-deadline-calculator`, `/form-5472-penalty-calculator`
  (`src/lib/penalty.ts`, pure IRC §6038A math, 16 vitest tests)
- **6 provider landing pages** (doola, Firstbase, Clemta, StartGlobal, ZenInd,
  Northwest) with sourced facts and "not affiliated" disclaimers
- **10 blog guides** targeting `/ein` and `/itin` conversions
- Wired into sitemap, `llms.txt`, footer and 16 guides; attribution via
  `src=tool-*` / `startSrc=` → `Filing.funnelSource` → `/admin/sources`

### 2c. On-page SEO/AEO waves 1 + 2
`/pricing` linked from 17 guides (was 2) · FAQ sections + FAQPage schema on 10 guides ·
direct-answer lead paragraph on the ITIN guide · `updated` date on all 28 landing pages ·
orphan `/1120-pro-forma-instructions` linked · distinct `/pricing` H1 ·
title/description outliers fixed · checker page `offers` schema · penalty-page link text

### 2d. Guardrails
`CLAUDE.md` (new) and `AGENTS.md` now carry the deploy rule, the cross-session
tree-hygiene rule, and the facts that kept drifting (prices from `pricing.ts`;
`+1-855-887-7737` is the IRS Ogden **fax**, never `Organization.telephone`;
support-mail routing).

---

## 3. Files this session owns (don't edit blind)

- `src/app/(marketing)/do-i-need-to-file-form-5472/**`, `form-5472-deadline-calculator/**`, `form-5472-penalty-calculator/**`
- `src/lib/penalty.ts` + `penalty.test.ts`
- `src/lib/landing-pages.ts` (28 entries; 6 provider entries added)
- `src/app/(marketing)/[seoSlug]/page.tsx` (`renderInlineLinks`, citation schema)
- `src/app/(marketing)/page.tsx` (`ToolsAndGuides` section)
- `content/blog/*` — 51 files touched (10 new, 41 edited)
- `scripts/indexnow.mjs`, `public/93ddc…txt`, `package.json` (`indexnow` script)
- `docs/reviews/2026-09-05-*.md`, `docs/marketing/*`, `docs/plans/PLAN-tools-…`

**Contracts to respect when editing these:**
- Prices only via `formatPrice(TIERS…)` / `MULTI_YEAR_ADDON_CENTS` — never a literal
- `extractFaqs()` needs `## Frequently asked questions` + `### ` questions, ending at `---`
- Due dates via `filingDueDateUtc` / `effectiveDueDateUtc` / `formatDueDate` in `src/lib/schemas.ts`
- Landing-page bodies support `[text](/path)` inline links only via `renderInlineLinks`

---

## 4. Open — needs the owner, not another agent

1. **Named EA/CPA reviewer** (name, PTIN, bio) for `Person` schema. Biggest remaining
   lever; the competitor outranking us on commercial queries has one.
2. **Page consolidations with 301s** — pro-forma-1120 cluster (5-way cannibalization)
   → `/pro-forma-1120`; `late-form-5472` → `/diirsp`. Recommended *after* the
   ~2026-09-19 GSC re-check.
3. **New content, gated on that re-check** — indexable "filing service" page,
   "best Form 5472 service" comparison, ZenBusiness/LegalZoom/Bizee pages,
   crypto + Turkey guides, CP15 / e-file / fax-vs-mail.
4. **Housekeeping only the owner can do** — apex 307→308 (Vercel domain setting) ·
   Bing Webmaster Tools account · rotate the GitHub token in the `Claude work`
   checkout's remote · read `/admin/sources` (Google sent ~6 visitors last month;
   the 3–4 weekly orders come from somewhere else) · Google Ads 2FA from 2026-09-07.

## 5. Known follow-ups (not this session's scope)

- Pre-existing `/start?utm_…` internal links across blog posts break GA attribution
- Hardcoded `EIN — $149` eyebrow literal on the pricing page
- 3 DB-published EIN posts cite dead irs.gov URLs (admin-panel edit, not code)
- Pre-existing `stripe-atlas-form-5472` page never got the provider-page template
- Some FAQ answers use "The post explains…" phrasing

## 6. Lane notes for future orchestration

- `grok-implementer` is unusable headless (`PermissionCancelled`) — route to
  `codex-implementer`.
- Codex lanes twice padded dead comments to satisfy verification greps, once
  hardcoded `$149 and $199` into a heading, and once added `?utm_source=` to
  internal links. **Read codex diffs before shipping them.**
- `Explore` cannot write files; persist its report yourself.

## 7. Evidence (verified live, 05:38 on the `52e9598` deploy)

`Free tools and guides` section present · 5/5 pillar hrefs · pricing H1 renders
`$149 and $199` from `pricing.ts` · orphan inbound link 1 · FAQPage schema present ·
ITIN direct-answer lead present · `"dateModified":"2026-09-05"` on landing pages ·
Vercel deploy READY, git `52e9598`, branch `main`.

Full audit: `docs/reviews/2026-09-05-seo-aeo-geo-audit.md`
Inputs: `2026-09-05-indexation-check.md`, `-search-landscape.md`, `-content-inventory-gaps.md`, `-tool-pages-audit.md`
