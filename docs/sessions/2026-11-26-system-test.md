# 2026-11-26 — Full system test + improvement report

**Owner asked:** "run a full test on our system using codex and claude, and write a report on what we need to improve".

**Output:** `docs/reviews/2026-11-26-system-test-report.md`. This session made no code changes; the work was read-only.

## Ownership
| Worktree | State | Notes |
|---|---|---|
| `~/Developer/f5472-wt/audit` | detached at `e389f70` | Read-only audit; this docs commit only. |

The main checkout `~/Documents/Claude work/form5472` belongs to another session and was not touched.

## What ran (evidence)
- `tsc` clean. `next lint`: 1 warning (`<img>`). Vitest: 5107/5107 passed. `next build`: OK.
- `npm audit --omit=dev`: 22 findings (1 critical in Next 14.2.35, 15 high).
- Codex code audit (high effort) and Opus code audit (fresh context, same brief, independent). The raw reports sit outside the repo:
  - `~/Developer/f5472-wt/audit-codex.md`
  - `~/Developer/f5472-wt/audit-opus.md`
- Live-site crawl, raw report at `~/Developer/f5472-wt/audit-live.md`:
  - 307/307 sitemap URLs return 200;
  - 159/159 internal links are OK;
  - 580 JSON-LD blocks are valid.
- The orchestrator re-checked three findings against the code:
  - P1-1, price not bound to the fulfilled order;
  - P1-2, legacy unsubscribe token accepted as a session (code path confirmed, env-dependent);
  - P1-3, Google sign-in has no origin/CSRF check.

## Contracts
No new contracts. The report's fix waves must follow the standing two-agent review rule.

## Open
**Owner-gated:**
- Check the Vercel env: is `MAGIC_LINK_SECRET` distinct from `SESSION_SECRET`? Are `CRON_SECRET`, `TELNYX_*` and `SESSION_SECRET` set? Rotate `SESSION_SECRET` if P1-2 applies.
- Decide on the checkout completeness gate vs "never block payment".
- Decide whether to delete the unused `/api/chat` route.
- Approve a Next 15.5+ upgrade project.
- Decide on admin TOTP.

**Follow-ups:** fix waves 1–5 in the report.

## Lane notes
- Codex now takes its prompt on stdin (`codex exec … - < file`); a trailing-argument prompt hangs waiting on stdin.
- The PageSpeed Insights keyless API returned 429, so Core Web Vitals were not measured.
