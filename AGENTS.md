## Imported Claude Cowork project instructions

## Deploying — mandatory (mirrors CLAUDE.md)
Production = `origin/main`, auto-deployed by Vercel's git integration.
**Deploy by `git push origin main` only. NEVER run `vercel --prod` / `vercel deploy --prod`** —
a CLI deploy publishes the local tree (branches, uncommitted files) and is silently
reverted by the next push; this wiped live pages on 2026-08-27 and 2026-09-04.
The `hktax/` app must never be deployed to the form5472prep.com project.
