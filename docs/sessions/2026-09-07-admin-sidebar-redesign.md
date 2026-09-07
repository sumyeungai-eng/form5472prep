# 2026-09-07 — Admin portal redesign: left sidebar (wave 1) + page headers/overview (wave 2)

Owner ask: "redesign the admin portal, make it more clear, and menu bar on the left."

## Ownership

| File | Wave | Change |
|---|---|---|
| `src/app/admin/layout.tsx` | 1 | logged-out bare shell vs authed `<AdminShell>`; stale `guard.ts` comment fixed |
| `src/app/admin/_components/AdminShell.tsx` | 1 | NEW — sidebar grid (`lg:`), mobile drawer, full-bleed branch for `place-signature` |
| `src/app/admin/_components/AdminNav.tsx` | 1 | NEW — grouped nav, active state by pathname + searchParams, badges |
| `src/app/admin/_components/adminNavConfig.ts` | 1 | NEW — nav data (Overview / Work / Growth / Tools) |
| `src/app/admin/_components/useAdminCounters.ts` | 1 | NEW — client poll of `/api/admin/counters` (60 s, visible-only) |
| `src/app/admin/_components/AdminPageHeader.tsx` | 1 | NEW — created, unused until wave 2 |
| `src/app/api/admin/counters/route.ts` | 1 | NEW — admin-gated JSON counters, no-store |
| `src/lib/admin/counters.ts` + `.test.ts` | 1 | NEW — 4 counts; tests pin the exact `where` clauses |

Untouched by design in wave 1: every `page.tsx`, `SignOutButton.tsx`, everything under `place-signature/`.

## Decisions (advisor-reviewed before the wave)

1. **Badges are NOT computed in the layout.** App Router does not re-render a shared layout on
   client navigation, so layout-computed counters freeze for the session. They are fetched from
   `/api/admin/counters` by the client nav and polled every 60 s while the tab is visible.
2. **Two waves.** Shell first (one file's visual blast radius), page headers + Overview second.
   No local database exists, so pages cannot be rendered locally; isolation is the safety net.
3. **Signature placer is full-bleed, no sidebar.** Its overlay math is canvas-relative (safe), but
   the canvases are a fixed ~918 px inside a container with no horizontal scroll — a 240 px
   sidebar would clip placements. `AdminShell` switches on the pathname.
4. The `authed` gate stays in the layout; `/admin/auth/[token]` is a route handler and never
   receives the layout.

## Contracts a future editor must respect

- `unfinishedDrafts` badge predicate = `src/app/admin/filings/page.tsx` "Unfinished" stat minus its
  30-day window (all-time). Keep them in step; the test pins the badge side.
- `unreadMessages` = `Message { fromAdmin: false, readAt: null }` (derived from `src/lib/messages.ts:40`).
  Computed and returned by the API, not yet rendered (no messages page).
- Any new admin route must be added to `adminNavConfig.ts`; sub-links are `?param=value` under a
  parent and are shown only while the parent is active.
- Pages own their containers; the shell adds no padding inside `main`.

## Shipped

Wave 1: commit `ea08906` on `main`. Verified personally before push: `tsc` clean; vitest
**216 passed** (212 + 4); `npm run build` "Compiled successfully" with `/api/admin/counters` and all
16 admin pages in the route table. Deploy evidence: see below.

Deploy: `a142259` went live (marker: `/api/admin/counters` 404 → 401); three-check unchanged
(ein/checkout 400, `/ein/apply` DOB 1, penalty calculator 200) and `/admin/login` 200.

Visual verification on production via the owner's Chrome (owner-authorized, read-only):
- Desktop `/admin/filings`: sidebar with Overview / Work / Growth / Tools, Filings active with its
  three children expanded, badges **Unfinished drafts 21** and **Applications 1** (matches
  `/api/admin/counters` → `{filingsInReview:0, unfinishedDrafts:21, applicationsAwaiting:1, unreadMessages:3}`).
- Detail page `/admin/filings/<id>`: Filings stays active (prefix match).
- Narrow window (1000 px): top bar + hamburger, no sidebar; drawer opens with full nav, badges and
  footer; Escape closes it.
- `/admin/filings/<id>/place-signature`: full-bleed — slim bar with "← Back to filing", no sidebar,
  the 11-page PDF renders at its native width. First render took ~20 s (PDF load), not a regression.
  Console shows only pdf.js warnings ("Setting up fake worker", `standardFontDataUrl`, ZapfDingbats)
  — pre-existing, unrelated to the shell; a follow-up could configure the pdf.js worker/fonts.
- Side observation: the SOURCE column now shows **ChatGPT (AI)** on several orders from the last
  2 days, including a paid, delivered filing — the attribution backfill is visible in the admin.

## Wave 2 — page headers, Overview, tab titles, no pixel in admin

Commit `659a6f2`. `AdminPageHeader` on all 12 pages (title / verbatim one-line description /
right-aligned actions / breadcrumb on the three detail pages, replacing the old "‹ All filings"
back links). `/admin` is now an Overview (`src/lib/admin/overview.ts`): the four counters as cards,
unread customer threads grouped by filing/EIN/ITIN (`fromAdmin: false, readAt: null`), recent
filings with `StatusBadge`, recent applications. Per-page `<title>` "… · Admin" everywhere except
`/admin/test-order` (a `"use client"` page cannot export metadata — needs a server wrapper; follow-up).
`src/components/MetaPixel.tsx`: on `/admin/*` the consent banner is not shown AND the pixel is never
initialised (`isAdminPath` guard on both). Verified personally: `tsc` clean, vitest **217**, build clean.

WAVE2_DEPLOY_PLACEHOLDER

## Still open

- Wave 2 (page headers on 12 pages + Overview at `/admin`) — spec drafted, dispatch after the
  wave-1 visual check.
- Lane deviations accepted: `match: "prefix"` on childless routes; `principal.email ?? "admin session"`;
  an extra `X` close button in the drawer (eyeball it); `runtime = "nodejs"` on the counters route.
- `brew install coreutils` would restore the wall-clock cap on codex lanes (`timeout` missing).
