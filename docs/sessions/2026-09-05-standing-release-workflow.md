# Session log — 2026-09-05 · standing release workflow

## Request

The owner asked that the same completion process be followed after future work: publish completed website and blog changes, verify production, and leave a Markdown handoff for Claude.

## Durable rule added

`CLAUDE.md` now contains a **Default completion checklist** requiring future sessions to:

1. run the required validation and production build;
2. merge completed scoped work into `main` and push `origin/main`;
3. rely on the Git-linked Vercel deployment and never run `vercel --prod`;
4. verify affected public pages and the production markers in `REPO-STATE.md`;
5. verify article images, sitemap, and RSS feed for blog releases; and
6. write a session handoff containing the release and verification outcome.

An explicit instruction to keep work local, leave drafts unpublished, or avoid deployment overrides this default. Unrelated or visibly unfinished work must not be published.

## Repository and production state observed

- Canonical checkout: `/Users/sumyeung/Documents/Codex/form5472`
- Branch: `main`, synchronized with `origin/main` at the start of this change
- Starting commit: `800b35f`
- Production deployment observed: `dpl_GLuDcb9QLfmsm9ntfJVXTvvA6f9s`, status `READY`
- Blog sources observed: 110 Markdown posts, no `draft: true` files
- Two posts retained their intentional future `publishAt` schedules; this documentation-only session did not alter content owned by other active sessions.

## Files changed

- `CLAUDE.md`
- `docs/sessions/2026-09-05-standing-release-workflow.md`

No application code, blog copy, images, pricing, tax logic, payment behavior, or production data was changed.

## Release and live verification

- Workflow documentation commit: `3ef1194`
- Merged with the latest concurrent `origin/main` work and pushed as: `a17d81c`
- Git-linked Vercel deployment: `dpl_ECib4LjB9R9PvTQW4grZN1q5sCQs`, status `READY`
- Public EIN checkout marker: HTTP 400 for the expected empty request
- Public EIN form marker: HTTP 200 with `Owner date of birth` present
- Public penalty-calculator marker: HTTP 200

The push used `git push origin main`; no Vercel CLI production deployment was run.
