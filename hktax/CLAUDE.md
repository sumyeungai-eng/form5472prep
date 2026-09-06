# hktax — read before editing

**Start here:** `docs/sessions/` — read the newest session log first. It states which branch and
checkout owns which files, what shipped, the contracts you must respect, and what is open.

- This app lives ONLY on branch `claude/hk-tax-filing-website-m97q8g`; `hktax/` does not exist on
  `main`. The shared checkout at the repo root is used by another live workstream on `main` —
  **never `git checkout` there; use `git worktree add`.**
- Tax logic: `docs/engine-contract.md`, `docs/golden-scenarios.md` (statute-derived; do not
  change an expected figure without a primary-source citation), `docs/params-verified-*.md`.
- Reviews and audits: `docs/reviews/`.
- Before the final message of any session that changes files here, write
  `docs/sessions/<YYYY-MM-DD>-<topic>.md` and commit it with the work.
