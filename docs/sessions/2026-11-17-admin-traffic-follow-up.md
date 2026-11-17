# 2026-11-17 — /admin/traffic charted Overview

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/moz-1104-fix`, `feat/admin-traffic-charts` → main | `src/lib/admin/trafficStats.ts` (+test), `src/components/admin/charts/{LineChart,StackedBarChart,BarList}.tsx` (+test), `src/app/admin/traffic/page.tsx` (Overview section added above existing content) |

## Shipped
Overview on /admin/traffic with a 7d/28d/90d switcher (default 28d), previous-period comparison, KPI cards (visitors, page views, started/paid filings, EIN/ITIN paid, revenue, visit→paid conversion), daily visitors/views line chart, daily visitors by channel stacked bars, Sources and AI-engines tables, top landing pages/pages/countries/devices.
Verified: vitest src/lib/admin + src/components/admin 362/362; tsc 0; build 589/589; the 8 raw SQL queries executed against PGlite (Postgres) with the real migrations and seeded rows, no errors (bots and linked filings excluded); Codex review "nothing material".

## Contracts
- Plain SVG charts, no chart dependency. Human traffic only (isBot=false). Times in UTC. Data window ≤ 90 days (traffic-retention cron).
- Channel = Visitor.attrSource (first touch) grouped by `channelGroup()`; AI engines via `aiEngine()`.
- Overview is fail-safe: a query error renders "Overview unavailable" and the rest of the page still loads. Existing exports in traffic.ts unchanged.
- All raw SQL is tagged-template parameterised; aggregates cast in SQL and Number() in JS.

## Open
Owner: open /admin/traffic once to confirm the Overview renders on production data (Claude's in-app browser isn't signed in to admin).
Follow-up: EIN/ITIN rows have no visitorId, so they are counted by paidAt only (not per channel).
