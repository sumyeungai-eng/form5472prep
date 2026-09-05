# READ THIS FIRST — form5472prep repo state

**Last updated: 2026-09-05.** Update this file whenever the answers below change.

`CLAUDE.md` and `AGENTS.md` in this repo are **authoritative** for working rules. This file adds
the machine-specific context they cannot know: there are two checkouts on this Mac, and a history
of production being clobbered.

---

## 1. Deploying — push to `main`, never `vercel --prod`

Vercel is **git-linked** to `sumyeungai-eng/form5472prep`, production branch **`main`**, and
auto-deploys every push.

```bash
git push origin main      # this is the entire deploy procedure
```

**Never run `vercel --prod` / `vercel deploy --prod` in this repo, from any folder.** A CLI deploy
publishes your *local tree* — branch work and uncommitted files included. The next push to `main`,
or another session's CLI deploy, then silently reverts it. Real incidents:

- 2026-08-27 — `/contact` disappeared from production
- 2026-09-04 — all tool + provider pages wiped by a `vercel --prod` from
  `claude/hk-tax-filing-website-*`
- 2026-09-04/05 — EIN/ITIN payment collection kept vanishing (checkout endpoint 404) because that
  work lived only on a feature branch while `main` kept being deployed

It cut **both ways**: CLI deploys erased branch-less work, and pushes to `main` erased CLI deploys.
Resolved on 2026-09-05 by merging the feature branch into `main` (commit `7e7cea6`), so `main` now
contains everything. Feature branches must be **merged to `main` and pushed** to reach production;
for a preview use plain `vercel` (no `--prod`) or a branch preview URL.

---

## 2. Two checkouts exist on this Mac

| | Path | Role |
|---|---|---|
| **Canonical** | `~/Documents/Codex/form5472` | Work here. Has `origin` over SSH. |
| **Stale** | `~/Documents/Claude work/form5472` | Branch `feat/seo-geo-aeo-sprint`. Do not deploy from it. |

The stale checkout's branch is **31 commits** of work that already exists in `main`, implemented
independently — verified 2026-09-05. Nothing there is uniquely valuable. A full `git merge` of it
produces **60 conflicts** across `pricing.ts`, `schemas.ts`, `pdf/generatePackage.ts`, the Stripe
webhook and the filing wizard; that merge was attempted and deliberately abandoned (high risk to
verified IRS logic, zero feature gain). If it ever gains something unique, **cherry-pick that one
commit**.

Safety tags: `backup/pre-merge-A` (`94263a0`), `backup/pre-merge-B` (`c007cbc`).

---

## 3. Verify a deploy actually landed

Run all three — they must pass **together**. Any one alone can mislead, because each branch had
half the work at various points.

```bash
# 1. EIN/ITIN payment collection — expect 400 (endpoint exists). 404 means it is missing.
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  https://www.form5472prep.com/api/applications/ein/checkout \
  -H 'Content-Type: application/json' -d '{}'

# 2. New EIN form — expect 1
curl -s https://www.form5472prep.com/ein/apply | grep -c 'Owner date of birth'

# 3. Conversion tools — expect 200
curl -s -o /dev/null -w '%{http_code}\n' https://www.form5472prep.com/form-5472-penalty-calculator
```

---

## 4. Build and verify locally

`npx` is shadowed by an `rtk` wrapper — call binaries directly:

```bash
./node_modules/.bin/prisma generate   # ALWAYS after switching branches. A stale client throws
                                      # dozens of phantom "property does not exist" errors that
                                      # look like real bugs and are not.
./node_modules/.bin/tsc --noEmit      # must be clean
./node_modules/.bin/vitest run        # 166 tests must pass
npm run build                         # must print "Compiled successfully"
```

Harmless noise: `prisma:error ... database unavailable, falling back to files only` — `.env.local`
points at **localhost**, and there is no local Postgres. Production migrations apply automatically
on Vercel via `vercel-build`; never run `prisma migrate dev` here.

`tsconfig.json` excludes `hktax/` (a separate Next app inside this repo, with its own
`package.json`/`tsconfig`) and `src/lib/wizard/` (orphaned untracked files). Without those
exclusions the production build fails on code that is not part of this app.

---

## 5. Open items for the owner

- **Revoke a leaked GitHub token.** The stale checkout's remote embedded a personal access token in
  plaintext. Its remote has been switched to SSH so the token is no longer on disk, but the token
  itself is still valid until revoked at <https://github.com/settings/tokens>.
- **Delete test rows from production.** Sessions on 2026-09-03/05 created probe records while
  verifying live behaviour: partner applications named *Deliverability probe*, *Deliverability
  probe 2*, *DMARC verify probe*, *DMARC verify*; an EIN application *Deployment Probe LLC*; and
  several empty anonymous DRAFT filings. They can only be removed from `/admin` (or the production
  database) — `.env.local` here points at localhost, so no local tooling can reach them.

---

## 6. Working alongside other agents

Claude and Codex sessions share these folders. Practical rules:

- `git status --short` before starting. **Never** commit, revert or "tidy" files you did not
  change — another session may be mid-edit.
- Stage explicit paths (`git add <path>`), never `git add -A`.
- `hktax/` and `content/blog/` are actively owned by other sessions.
- Before pushing, `git fetch origin main` and merge — `main` moves often.
- Preserve work you must move past (`git diff > some.patch`) and say so in your report.
