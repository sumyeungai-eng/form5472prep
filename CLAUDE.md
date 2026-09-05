# form5472prep.com — rules every Claude/Codex session must follow

## Deploying (read this before touching production)
- **Production = whatever is on `origin/main`.** Vercel is git-linked
  (`sumyeungai-eng/form5472prep`, production branch `main`) and auto-deploys
  every push to `main`. **To deploy: `git push origin main`. Nothing else.**
- **NEVER run `vercel --prod` / `vercel deploy --prod` in this repo.** A CLI
  deploy publishes your local tree — including branches and uncommitted files
  that are NOT on `main` — and the next push (or another session's CLI deploy)
  silently reverts it. This has already wiped live pages three times
  (2026-08-27 `/contact`; 2026-09-04 all tool + provider pages, when a
  branch deploy from `claude/hk-tax-filing-website-*` replaced `main`).
- Feature branches are fine locally; they must be **merged to `main` and
  pushed** to reach production. If you need a preview, use a Vercel preview
  deployment (plain `vercel`, no `--prod`) or push the branch and use the
  branch preview URL.
- The `hktax/` app is a separate product. It must not be deployed to the
  form5472prep.com production project.

## Working in this repo alongside other sessions
- Several Claude sessions share this repo (blog production, SEO, hktax).
  Before a multi-file change run `git status --short`; never edit files you
  don't own; report dirt, don't clean it.
- **Session logs live in `docs/sessions/`.** Read the most recent one before
  starting work: it records which checkout/branch owns which files, what was
  shipped, and what is still open.
- **Every session that changes files must write one before it ends** —
  `docs/sessions/<YYYY-MM-DD>-<topic>.md`, committed with the work. Include:
  ownership table (checkout/branch → files), what shipped (commit range +
  live-verified evidence), contracts a future editor must respect, what is
  still open (owner decisions vs. follow-ups), and lane notes. This is how
  concurrent sessions avoid overwriting each other.
- Never commit secrets. A remote URL containing a `ghp_…` token was found in
  one checkout's `.git/config` — use SSH remotes.

## Facts that must not drift
- Prices come from `src/lib/pricing.ts` (`TIERS`, `MULTI_YEAR_ADDON_CENTS`);
  never hardcode dollar figures in pages. Promo machinery exists but
  `PROMO_SOURCES` is empty (promo ended 2026-08-19).
- `+1-855-887-7737` is the **IRS Ogden fax line**, not our phone. Never emit it
  as `Organization.telephone`.
- Admin-bound mail goes to `env.adminEmail` / `env.supportEmail` (both default
  to support@form5472prep.com). `ADMIN_LOGIN_EMAIL` is a login identity, not a
  recipient.
- Blog/ops details: `docs/reviews/blog-*.md`; growth plan:
  `docs/marketing/growth-plan-2026-09.md`; Google Ads:
  `docs/marketing/google-ads-diagnosis-2026-08-16.md`.
