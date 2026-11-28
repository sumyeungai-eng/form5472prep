# 2026-11-28: Daily "Portal smoke" Telegram alerts were false alarms

**Owner request:** "why i constantly getting these error notes, can you fix all things".

## Root cause
- The daily cron `/api/cron/portal-smoke` runs at 02:30 UTC. It flagged a customer page as failed whenever the HTML contained the phrases "Sign in to continue your filing" or "Something went wrong loading this page.".
- Since the portal i18n work of 2026-11-22 (`f851ae1`, `2f7098d`), those two strings ship inside every healthy `(app)` page. They are in `messages/en/portal.json`, which `NextIntlClientProvider` serialises into each page.
- As a result, every status failed on every run from the first run on 2026-11-23.
- Evidence: the live `/dashboard` HTML contains both phrases. Vercel showed no `/filings/[id]` runtime errors since 2026-11-22.

## Ownership
| Worktree | Branch | State |
|---|---|---|
| `~/Developer/f5472-wt/smoke-fix` | `fix/portal-smoke-false-alarm` | merged to main |

## What shipped (`ac68142`)
- **New markers:**
  - `data-smoke="filing-locked"` on `FilingLocked`;
  - `data-smoke="app-error"` on the `(app)/error.tsx` section.
- **`renderFailureReason(html)`** (`src/app/api/cron/portal-smoke/renderFailure.ts`) checks for:
  - `__next_error__`;
  - `:E{` (the RSC error record);
  - the HTML-attribute markers;
  - a missing `</html>`.
- The serialized RSC form of the markers (`"data-smoke":"…"`) does not match.
- Each alert now names its reason ("(marker: …)"), and `console.warn` logs the status and reason, with no customer data.
- **Verification:**
  - full vitest: 5314 passed;
  - `tsc` clean;
  - `next build` exit 0;
  - a regression test with a healthy page carrying the translation strings does not alert.
- **Reviews:** two independent reviews (Codex and Opus), both SHIP. Opus traced every sampled status: none server-redirects, so `:E{` is not tripped by healthy pages.

## Contracts
- Smoke checks must match rendered markup markers, never user-visible copy. Copy is translated and serialized into the page payload.
- If an `(app)` route ever adds `loading.tsx` or Suspense, a `redirect()` or `notFound()` could stream as a 200 containing `:E{`. Re-check the smoke logic before doing that.

## Open
- **Confirm:** the next run (2026-11-29 02:30 UTC) should send no portal-smoke alert.
- **P3:** the `app-error` marker is a backstop only, because Next 14.2 doesn't render client error boundaries on the server.
- **P3:** the `(app)` layout ships the whole `portal` message set to every page. That is page weight, not a security issue.
