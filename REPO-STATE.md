# READ THIS FIRST — form5472prep repo state

**Last updated: 2026-09-05.** Keep this file current whenever the answers below change.

This project exists in **two folders on this Mac**, on **divergent git branches**. Deploying from
the wrong one silently reverts live features. That has already happened once — see *What went
wrong* below.

---

## 1. Which folder is canonical

| | Path | Branch | Status |
|---|---|---|---|
| **A — CANONICAL** | `~/Documents/Codex/form5472` | `claude/hk-tax-filing-website-m97q8g` | **Use this. Deploy only from here.** |
| **B — STALE** | `~/Documents/Claude work/form5472` | `feat/seo-geo-aeo-sprint` | Do **not** deploy. Read-only reference. |

**Do all work in folder A.** Branch A is a functional **superset** of B: every feature B has
(SEO/GEO schemas, guide table-of-contents + anchor links, related-guides cross-linking, AI-crawler
rules, `llms.txt`, Google Ads tag `AW-18127544007`, admin click-to-place signature tool, faxed-PDF
snapshot, logo wordmark fix) **already exists in A**, implemented independently.

Divergence, measured from their common ancestor `0dcf8f8`:

- **250 commits** on A that B does not have
- **31 commits** on B — all functionally duplicated in A
- **127 files** modified on both sides; a real `git merge` produces **60 conflicts**, including
  `pricing.ts`, `schemas.ts`, `pdf/generatePackage.ts`, the Stripe webhook and the filing wizard

**Do not attempt that merge.** It was tried on 2026-09-05 and abandoned deliberately: resolving 60
conflicts by hand across the tax and payment core risks corrupting verified IRS logic (the Form 7004
extension gate, DIIRSP classification, tier pricing) for zero feature gain. Branch A already wins on
every feature. If B ever gains something genuinely unique, **cherry-pick that one commit** into A
rather than merging the branches.

---

## 2. The deploy rule — PUSH TO `main`, NEVER `vercel --prod`

Vercel is **git-linked** to `sumyeungai-eng/form5472prep` with production branch **`main`**, and
auto-deploys every push to it. See `CLAUDE.md` / `AGENTS.md` in this repo — they are authoritative;
this file only summarises them.

```bash
# To deploy:
git push origin main      # that is the whole procedure
```

**Never run `vercel --prod` (or `vercel deploy --prod`) in this repo — from any folder.** A CLI
deploy publishes your *local tree*, including branch work and uncommitted files that are not on
`main`. The next push to `main` — or another session's CLI deploy — then silently reverts it. This
has wiped live pages repeatedly, in both directions:

- 2026-08-27 — `/contact` lost
- 2026-09-04 — all tool + provider pages lost, by a `vercel --prod` from
  `claude/hk-tax-filing-website-*`
- 2026-09-04/05 — EIN/ITIN payment collection lost (404 on the checkout endpoint) whenever a push
  to `main` landed, because that work lived only on a feature branch

Feature branches are fine locally. To reach production they must be **merged into `main` and
pushed**. For a preview, use plain `vercel` (no `--prod`) or push the branch and use its preview URL.

## 3. What went wrong (2026-09-04 → 09-05)

EIN/ITIN Stripe payment collection, application traffic-source attribution, chat on EIN/ITIN
applications, the seven-question EIN form and the owner date-of-birth field were all built,
verified and deployed from folder A. Two later production deploys were then made **from folder B**,
which does not contain any of that code. Live traffic silently fell back to the older flow —
`/api/applications/ein/checkout` began returning 404, and applications stopped collecting payment.

Nothing was reverted in git. The commits were always safe in branch A. Only the *deployed artifact*
was wrong. Redeploying from folder A restored it.

---

## 4. Verify a deploy actually landed

Cheap post-deploy checks that distinguish A from B:

```bash
# EIN checkout endpoint — exists ONLY on branch A.
# Expect HTTP 400 {"error":"Invalid request"}. HTTP 404 means branch B is live.
curl -s -X POST https://www.form5472prep.com/api/applications/ein/checkout \
  -H 'Content-Type: application/json' -d '{}' -w '\n%{http_code}\n'

# EIN apply form — branch A asks 8 questions incl. date of birth.
curl -s https://www.form5472prep.com/ein/apply | grep -c 'Owner date of birth'   # expect 1
```

---

## 5. Backups

Both pre-existing states are tagged, so nothing is lost:

- `backup/pre-merge-A` → `94263a0` (folder A, 2026-09-05)
- `backup/pre-merge-B` → `c007cbc` (folder B, 2026-09-05)

Folder B also had **uncommitted** work at that time (blog Postgres store, pricing edits — all
already present in A in a more advanced form). It was captured as a patch before any changes and
left untouched in place; folder B's working tree was **not** modified.

---

## 6. Build and verify (folder A)

`npx` is shadowed by an `rtk` wrapper on this machine — call binaries directly:

```bash
./node_modules/.bin/prisma generate   # run after ANY branch switch — a stale client
                                      # produces dozens of phantom "property does not exist" errors
./node_modules/.bin/tsc --noEmit      # must be clean
./node_modules/.bin/vitest run        # 150 tests must pass
npm run build                         # must print "Compiled successfully"
```

Known-harmless build noise: `prisma:error ... database unavailable, falling back to files only`
from the blog module — there is no local Postgres. Migrations apply automatically on Vercel via
`vercel-build`, so never run `prisma migrate dev` here.

`tsconfig.json` excludes `hktax/` (a **separate** Next app living inside this repo, with its own
`package.json`/`tsconfig`) and `src/lib/wizard/` (orphaned untracked files). Without those
exclusions the production build fails on code that is not part of this app.

---

## 7. Security — action required

Folder B's git remote embeds a GitHub personal access token in plaintext
(`git remote -v` shows `https://ghp_…@github.com/...`). Anything that can read that repo's config
can read the token.

**Revoke it** at <https://github.com/settings/tokens>, then re-point the remote at SSH:

```bash
cd ~/Documents/Claude\ work/form5472
git remote set-url origin git@github.com:sumyeungai-eng/form5472prep.git
```

---

## 8. Working alongside other agents

Multiple agents (Claude, Codex) work in these folders concurrently. Practical rules:

- Run `git status --short` before starting; **never** commit, revert or "clean up" files you did
  not change — another session may be mid-edit.
- The `hktax/` app and `content/blog/` are actively edited by other sessions. Stage only your own
  files (`git add <explicit paths>`), never `git add -A`.
- If you find work-in-progress you must move past, back it up (`git diff > some.patch`) and say so
  in your report rather than discarding it.
- Update this file when the canonical folder, branch, or deploy rule changes.
