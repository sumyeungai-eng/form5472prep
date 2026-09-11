# 2026-09-11 — First-party visitor log ("deeper traffic tracking") for the admin

Owner ask: "track every individual traffic visiting the site, showing specific ip and location", in the admin portal.

## Ownership

| File | Wave | Change |
|---|---|---|
| `prisma/schema.prisma` + `prisma/migrations/20260911120000_visitor_tracking/` | A | `Visitor`, `PageView` models (+ indexes, FK cascade) |
| `src/lib/traffic.ts` + `.test.ts` | A | pure helpers: bot UA, device, client IP, Vercel geo headers, trackable path, external referrer host, `hashIp` (23 tests) |
| `src/app/api/session/ping/route.ts` | A | capture endpoint (204 always; 429 on limits) |
| `src/components/VisitPing.tsx` + `src/app/layout.tsx` | A | client beacon on every route change (skips `/admin`) |
| `src/app/api/cron/traffic-retention/route.ts` + `vercel.json` | A | daily `0 12 * * *`: null IPs > 30 d, delete views > 90 d, drop orphaned visitors |
| `src/app/(marketing)/privacy/page.tsx` | A | one paragraph in "What we collect" (after the retained-data list) |
| `src/lib/env.ts` | A | `trafficIpSalt` (`TRAFFIC_IP_SALT`, optional) |
| `src/lib/session.ts` | A | additive `getCurrentUserId()` — DB-free user id from the signed cookie |
| `src/lib/admin/traffic.ts`, `src/app/admin/traffic/**`, `adminNavConfig.ts` | B | admin UI (in progress) |

## Decisions (advisor-reviewed before the build)

1. **Beacon, not middleware capture.** Non-JS bots go unlogged on purpose; no second edge invocation
   per request. Path `/api/session/ping` chosen because generic ad-block lists match `pv|track|collect|beacon`.
2. **Own `fs_visitor` cookie (1 year).** `fs_session` is read-only in the beacon — `getOwnedFiling()`
   grants draft access on a bare session match, so the beacon must never mint it. `PageView.sessionId`
   + `Visitor.userId` provide the visit → order link (prefer `userId`).
3. **Attribution is read from the `f5472_attr` cookie, never re-derived** — the beacon request's
   Referer is our own page and would turn first touch into "direct". Copied once on create.
4. **Full IP for 30 days, then nulled**; rows keep country/city for 90 days; optional salted HMAC
   (`ipHash`) for repeat-abuse detection when `TRAFFIC_IP_SALT` is set. Not behind the Meta consent
   gate (different basis; gating would blind the log). Privacy policy updated accordingly.
5. **Rate limits are mandatory**: 120 pings / 10 min per IP + a global 50,000/day ceiling via the
   existing `RateLimit` model — an unauthenticated write endpoint shares the pool with checkout.
   Both fail open on DB error (house style of `rateLimit()`); noted, accepted.
6. Two tables (`Visitor` + `PageView`), indexes `[isBot,lastSeenAt]`, `[country,lastSeenAt]`,
   `[userId]`, `[visitorId,createdAt]`, `[createdAt]`, `[sessionId]`.

## Shipped — wave A

Commit `cbe757e`. Verified personally: `prisma validate` ok, `tsc` clean, vitest **241**
(218 + 23), build clean with `/api/session/ping` and `/api/cron/traffic-retention` in the route list.
Architect fixes on top of the lane's work: privacy paragraph moved after the list it had been dropped
into; `crypto.randomUUID()` for the visitor key; `getCurrentUserId()` instead of a `getCurrentUser()`
DB hit per page view; one redundant expression.

Deploy: guarded watch (deployment newer than the pre-push one) → Ready; build log:
`Applying migration 20260911120000_visitor_tracking` → `All migrations have been successfully applied.`;
`POST /api/session/ping {"p":"/pricing"}` → 204 on production.

## Contracts a future editor must respect

- Never call `getOrCreateSessionId()` or `deriveAttribution()` from the beacon route.
- Never log `/admin`, `/api`, `/_next` paths (`isTrackablePath`).
- Keep both rate limits; a new write path on this endpoint needs its own ceiling.
- The retention cron is the only thing allowed to null `ip`; do not extend the 30-day window without
  changing the privacy paragraph.
- `Visitor.attr*` is first-touch: write on create only.

## Still open

- Owner: set `TRAFFIC_IP_SALT` in Vercel if repeat-abuse detection across the 30-day IP window is wanted.
- Wave B (admin UI) — see the next entry once shipped.

## Shipped — wave B (admin UI)

Commit `066d061`. `/admin/traffic` (summary cards, top countries/pages/sources, GET filter form, 50-row
paginated table: time · location · IP · page + referrer · source · device · visitor · linked order) and
`/admin/traffic/[visitorId]` (facts, first-touch attribution, orders, view timeline). Sidebar: Growth →
Traffic (first item). `src/lib/admin/traffic.ts` batches order linking (3 queries per page, userId
preferred over sessionId). Verified personally: `tsc` clean, vitest **244** (241 + 3), build clean with both
routes listed.

Architect fixes on top of the lane: (1) the visitor drill-down no longer hard-codes `isBot:false` — with
"include bots" on, bot rows' visitor links used to 404; (2) `formatDateInput` renders a LOCAL calendar
date (it used `toISOString().slice(0,10)`, which drifted the From box one day per resubmit east of
Greenwich).

Deploy: guarded watch → Ready; unauthenticated `/admin/traffic` → 307 to login. Production check from
the owner's admin session: the page shows the two page views generated from the in-app browser during
the wave-A check (KR / Seo-gu, IP 211.34.200.10, `/pricing` then `/faq`, Direct, desktop, one visitor)
— summary cards 1 / 1 / 2 / 0, top country KR, top pages /faq and /pricing. End-to-end capture → storage
→ admin display verified with real traffic.

## Follow-ups (agent)

- `getPaidCustomerKeys()` scans every paid filing/EIN/ITIN on each Traffic page load for the
  "became customers" card — fine at today's volume, linear in lifetime orders; rewrite as a
  `groupBy`/raw distinct when it shows in page timing.
- Detail-page timeline has no empty state (cosmetic).
- Definition of "paid customer" in `traffic.ts` = filing status PAID…CONFIRMED or `stripePaymentId`
  set; applications `paidAt`/`stripePaymentId`/`amountPaid > 0`. Matches the supersede rule's notion
  (excludes FAILED); keep them aligned if either changes.

## Shipped — IP grouping

Commit `558ed5b`. `/admin/traffic?view=ips` lists one row per IP (browsers, page views, sources,
devices, first/last seen, linked order); `/admin/traffic/ip/[ip]` shows the group's browsers, combined
timeline and deduplicated orders; the page-view list marks shared IPs (`+N`) and links the IP; the
visitor page lists sibling browsers on the same IP.

**Design constraint, deliberate:** grouping keys on the raw `ip` ONLY. `ipHash` is not used as a
fallback — `TRAFFIC_IP_SALT` is unset in production (so it is always null) and, were it set later,
mixing the two key spaces would split a visitor across the 30-day boundary where `ip` is nulled.
Consequence, surfaced in the UI rather than hidden: views older than 30 days cannot be grouped and are
reported as "N older page views are not grouped". Both grouped surfaces carry the verbatim caveat that
office networks / mobile carriers / VPNs share an IP and one person's IP can change.

Query plan (verified by reading, not by the lane's claim): 3 + 5 grouped queries + 1 visitor fetch +
1 batched order resolution ≈ 10 fixed queries per page, independent of row count. No N+1.

Verified personally: `tsc` clean, vitest **249** (244 + 5), build clean with `/admin/traffic`,
`/admin/traffic/[visitorId]` and `/admin/traffic/ip/[ip]` all present — the sibling dynamic segments
do not collide.

Deploy: guarded watch → Ready. Production check from the owner's admin session: the "Page views |
Visitors by IP" toggle renders, the caveat line shows above the grouped table, and the summary already
reflects real traffic (6 visitors today, 25 views / 7 d, 2 became customers; KR 21 / TH 4; sources
ChatGPT (AI) 3, Direct 3).

**Lane note:** the codex lane was killed by an API rate limit before it could report, but the codex
process had already finished writing all five files. The artifact was on disk, so it was verified
directly instead of re-dispatching — check the working tree before retrying a failed lane.
