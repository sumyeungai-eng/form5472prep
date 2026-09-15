# 2026-09-16 — "Last seen" for unfinished (DRAFT) filings on /admin/filings

Owner asked whether the admin list can show when a customer with an unfinished order was last on the
site, from where (IP/location). Answer: yes — built on the existing visitor log.

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. Files: `prisma/schema.prisma`
(Filing.visitorId + index), `prisma/migrations/20260916120000_filing_visitor_link/`, `src/lib/findOrCreateDraft.ts`,
`src/lib/admin/filingPresence.ts` (+test), `src/app/admin/filings/page.tsx`, this log, `REPO-STATE.md` line.

## What shipped (e4525b2; deployment Ready; migration applied per the Vercel build log
"Applying migration `20260916120000_filing_visitor_link`")
- `Filing.visitorId String?` (no FK — retention deletes Visitor rows after 90 days; the link must survive).
  Stamped in `findOrCreateDraftFiling` from the `fs_visitor` cookie (holds `Visitor.visitorKey`; resolved
  to `Visitor.id` with one `findUnique`; null if the beacon has not fired yet; never blocks creation).
- `getPresenceForFilings(filings)` → Map<filingId, { visitorId, lastSeenAt, ip, city, country, lastPath }>:
  candidates = visitors where `id = filing.visitorId` OR `userId = filing.userId`; latest `lastSeenAt`
  wins; one `pageView.findMany distinct visitorId` supplies the last path. Two queries per page load.
- `/admin/filings`: DRAFT rows (only in views that show drafts) get a muted line
  `Last seen 2h ago · City, CC · <ip | IP expired> · /last/path` linking to `/admin/traffic/<visitorId>`,
  or `No visit data`.

Verified: 301/301 vitest (8 new), tsc, production build; deploy log shows the migration applied;
`/admin/filings` still gates to login. The rendered line is admin-only — owner to eyeball after login.

## Contracts
- Never copy IP onto Filing or any customer-facing surface; IP display follows the 30-day null rule.
- Drafts created before today have `visitorId = null`; they still match through `userId` once the customer
  has signed in. Anonymous drafts older than today show "No visit data" until the person returns.
- Keep `VISITOR_COOKIE = "fs_visitor"` in sync with `src/app/api/session/ping/route.ts`.

## Open
Owner-gated: eyeball the line on /admin/filings?status=DRAFT. Follow-up: partner-created drafts
(`src/app/partner/filings/new/route.ts`) and admin test filings are not stamped (by design).

## Lane notes
codex lane: out of ChatGPT credits until 2026-09-19 19:59 (usage limit, not auth). grok lane: CLI says
"not authenticated" (needs a user-run `grok login`). Implemented by a Claude subagent (sonnet) as the
documented fallback; architect read the full diff as the only cross-check. Both facts saved to memory.
