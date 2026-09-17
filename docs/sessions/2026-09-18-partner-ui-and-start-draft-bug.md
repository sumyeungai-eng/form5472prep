# 2026-09-18 (part 2) — Partner dashboard redesign, home entry points, /start draft bug

Follows `docs/sessions/2026-09-18-partner-portal-wave.md` (same day, commit `c9486b9`).
This part: commit `e8e3fa9`.

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. Files: `src/app/partner/{page,PartnerFilingRow,PartnerHero,PartnerStatCards}.tsx`,
`src/lib/partner/{filingList,responsibility}.ts` (+tests), `src/lib/startIntent.ts` (+test),
`src/app/api/auth/google/route.ts`, `src/app/(marketing)/start/{page,StartForm}.tsx`,
`src/app/(marketing)/{layout,page}.tsx`, `src/components/MobileMenu.tsx`, this log, `REPO-STATE.md`.

## 1. Dashboard redesign — organised by whose court the filing is in
`responsibilityFor(filing)` maps status (+ `clientInviteSentAt`) to one of four courts: **you** (amber),
**client** (sky), **irs** (navy), **done** (emerald). Used by the hero sentence, four stat cards that
double as filters (`?court=`), and a court-coloured left edge + chip on every row.
Page: paper hero band (dotted radial + accent blur, matching the blog header), mono eyebrow, serif H1,
"N of your M filings need you today", "New client filing" CTA, deadline note; stat cards; the existing
search/status/archived controls in one card; the filing list; pagination.
All prior row actions are unchanged, dimmed to 70% at rest on desktop and fully visible on mobile.

**CSS trap found and fixed:** `divide-y divide-slate-100` emits the `border-color` SHORTHAND under a
`> :not([hidden]) ~ :not([hidden])` selector, which outranks a plain `border-l-*` class and silently
killed every row's left edge except the first. Replaced with directional
`[&>*:not(:last-child)]:border-b` + `border-b-slate-100`. Never combine `divide-*` with a per-row
`border-l-*` colour.

## 2. Home page and nav entry points
Header nav gains "Partners"; mobile menu gains "Partners" plus a subordinate "Partner sign in" under
Sign in; the footer gains "Partner sign in" beside "Become a Partner"; the home page gains one section
before the final CTA ("For accountants and formation agents") with "Become a partner" and
"Partner sign in". Copy is sourced from `/partners`, no new claims.

## 3. Bug: signing in on /start created an empty draft every time
Reported by the owner. Cause was not the login code: `/start` (the header's prominent "Start filing")
had NO signed-in handling, and its Google button posts `intent: "start"`, which created a DRAFT for
anyone without one. A returning customer checking an order got a new empty draft and landed in the wizard.
Fix — `decideStartOutcome({ hasDraft, filingCount })`: draft → reuse it; filings but no draft →
**create nothing**, fire NO ad conversions, route to `/dashboard`; zero filings → unchanged first-time
funnel including both conversions. `/start` now shows a signed-in card whose PRIMARY action is
"Start a new filing" (reminder emails link here with intent to file), with "Go to my filings" and
"Continue your draft" secondary. The typed-email path is untouched: it cannot verify who typed it.

Advisor notes (`fable-advisor`, read the ads code): the Google lead conversion sends no
`transaction_id`, so every junk sign-in was counted as a fresh "Form 5472 Lead"; the campaign is on
Maximise clicks so no bidding model is disturbed. The junk drafts also inflated the admin
unfinished-drafts badge and made the abandoned-draft cron email paying customers about drafts they
never started. All three stop now.

Verified: 362/362 vitest, tsc clean, production build clean; deploy Ready; live checks — home shows the
partner links, `/start` signed-out still renders the email + Google funnel, `/partner` still gates.
Design verified from rendered screenshots at 1280 and 375 via a temporary preview route
(`src/app/partner/design-preview`, created for review and DELETED before commit).

## Contracts
- A landing folder starting with `_` is private in the App Router and will not route. Use a plain name
  for temporary preview pages and delete them before commit (also delete `.next/types/app/<route>` or
  `tsc` reports phantom errors).
- Court colours are defined once in `responsibility.ts`. Any new partner surface reuses them.
- Signing in must never create a filing for an account that already has one. Creating is an explicit act.
- First-time `/start` behaviour and its two ad conversions are load-bearing: do not change them without
  re-reading `docs/marketing/google-ads-diagnosis-2026-08-16.md`.

## Open (owner-gated)
- Everything behind the partner login is still unverified by a real partner account: dashboard controls,
  intake/sign-link emails, the new court cards.
- Verify once by hand: a reminder-email recipient (signed in, has filings) clicking through to `/start`
  can still reach a new filing in one click.

## Lane notes
codex out of credits until 2026-09-19; grok CLI unauthenticated. Six Claude subagent lanes + two
advisor consults. One lane's own verification missed the broken row edges because it reasoned
statically; the screenshots caught it. Always render UI before accepting it.
