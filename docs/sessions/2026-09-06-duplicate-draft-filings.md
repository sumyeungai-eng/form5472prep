# 2026-09-06 — Duplicate draft filings (supersede-on-payment)

## Ownership

This session owned exactly these files. Nothing else was touched:

| File | Change |
|---|---|
| `prisma/schema.prisma` | `Filing.supersededAt`, `Filing.supersededById`, `@@index([status, supersededAt])` |
| `prisma/migrations/20260906120000_supersede_stale_drafts/migration.sql` | NEW — columns, index, one-time backfill |
| `src/lib/supersedeDrafts.ts` | NEW — `supersedeDraftsFor(paidFilingId)` |
| `src/lib/supersedeDrafts.test.ts` | NEW — 7 tests |
| `src/app/api/stripe-webhook/route.ts` | call after fulfilment, try/catch |
| `src/app/(app)/filings/[id]/page.tsx` | same call on the DRAFT→PAID redirect fallback |
| `src/app/api/cron/abandoned-draft-reminder/route.ts` | exclude superseded |
| `src/app/admin/filings/page.tsx` | exclude from default view, show in archive, fix `statsUnfinished` |
| `src/app/(app)/dashboard/page.tsx` | exclude superseded |

Untracked noise left alone: `public/email/*.png|jpg` banner masters, `IMG_264*.png`, `src/lib/wizard/`.

## The bug

`findOrCreateDraftFiling` reuses a draft only when `taxYears` is empty
(`src/lib/findOrCreateDraft.ts:56`). Selecting tax years is the FIRST wizard step, so any
return visit to `/start` after that point mints a brand-new draft row. Payment converts
whichever draft the customer finished on; nothing ever cleaned up the rest.

Three surfaces were affected, the third being the damaging one:

1. Admin filings list — stale DRAFT next to the paid order, reads as a duplicate.
2. Customer dashboard — `where: { userId }` had no status filter, so paying customers saw
   a phantom unfinished filing.
3. **The daily abandoned-draft cron emailed paying customers "pick up where you left off"**
   about filings they had already completed and paid for. It selected `status: DRAFT` +
   `userId != null` and never checked whether that user had paid.

## The contract a future editor must respect

A draft is superseded by a paid filing ONLY when ALL of these hold. Do not relax rules 4–5;
they are what stop us archiving work a customer is actively doing.

1. draft is `DRAFT`, `supersededAt IS NULL`, and is not the paid filing itself
2. paid filing status ∈ {PAID, PDF_GENERATED, SIGNATURE_PENDING, SIGNED_UPLOADED, FAXED,
   CONFIRMED} — deliberately **excluding `FAILED`**, even though `FAILED` is in the shared
   `PAID_STATUSES` constant. A failed payment must never archive a customer's drafts.
3. same owner: same `userId`, or (draft has no `userId`) same `sessionId`
4. same company or nameless: draft `llcName` blank, or equal to the paid filing's after
   trim+lowercase — **protects a genuine second-LLC draft**
5. years covered: draft `taxYears` empty, or a subset of the paid filing's — **protects a
   next-year draft in progress**

`supersededAt` is nullable and `supersededById` records which filing caused it, so the whole
thing is reversible with a single `UPDATE ... SET "supersededAt" = NULL`.

`adminHidden` (operator dismissed it) and `supersededAt` (system archived it) mean different
things and must stay separate. The admin archive view (`?hidden=1`) shows both, so no row
becomes unreachable.

`supersedeDraftsFor` intentionally does NOT swallow its own errors — both call sites wrap it
in try/catch so it can never break payment fulfilment. **A third caller must add its own
wrapper.**

## Shipped

Commit `513843f` on `main` (auto-deploys).

Verified before push, each run personally, not taken from the lane's report:

- `./node_modules/.bin/prisma generate` — ok
- `./node_modules/.bin/tsc --noEmit` — clean, exit 0
- `./node_modules/.bin/vitest run` — 173 passed (166 baseline + 7 new)
- `npm run build` — "Compiled successfully"
- enum literals in the migration all exist in `enum FilingStatus`
- migration folder `20260906120000` sorts after the previous `20260903120000`
- index name `Filing_status_supersededAt_idx` matches Prisma's convention for
  `@@index([status, supersededAt])`, so no drift

After deploy:

- build log: `Applying migration 20260906120000_supersede_stale_drafts` → `All migrations have been successfully applied.`
- live: `ein/checkout` 400 (exists), `/ein/apply` date-of-birth marker 1, penalty calculator 200, homepage 200

## Still open

**Needs the owner**

- Nothing new. Pre-existing items still stand — see
  `2026-09-05-payments-merge-deliverability-session.md`: revoke the leaked GitHub token,
  delete the probe rows from `/admin`, set `TELNYX_PUBLIC_KEY`.

**Needs another agent / follow-up**

- **Backfill applied successfully.** It could not be tested locally (no local Postgres;
  Vercel returns `DATABASE_URL` empty because it is marked sensitive), so the first execution
  was the production deploy. Build log for `fce1e1d` confirms it:
  `Applying migration 20260906120000_supersede_stale_drafts` →
  `All migrations have been successfully applied.`
  **Not yet eyeballed:** nobody has looked at WHICH rows it archived. Owner should open
  `/admin/filings?hidden=1` and sanity-check that the archived drafts are genuine false starts.
  If any look wrong, `UPDATE "Filing" SET "supersededAt" = NULL, "supersededById" = NULL`
  (optionally scoped by `"supersededById" = '<id>'`) restores them.
- The admin manual `DRAFT → PAID` transition (`src/lib/admin/mutations.ts`) does NOT call
  `supersedeDraftsFor`. Rare path, deliberately left out of scope; add it if manual promotions
  become common.
- Duplicates are still *created*; this only cleans them up after payment. Stopping them at the
  source means offering a returning customer their existing draft to resume at `/start`. Owner
  chose cleanup-only for now.

## Lane notes

`fable-advisor:codex-implementer` implemented from a 5-part spec. Two things worth recording:

- It found a contradiction in my spec (rule 2 enumerated six statuses but told it to reuse
  `PAID_STATUSES`, which has seven) and resolved it correctly by filtering out `FAILED` and
  adding a test locking that in. Good call, and it flagged the judgement rather than burying it.
- It refactored the admin `where` from `Record<string, unknown>` to a typed
  `Prisma.FilingWhereInput` AND-list. This looked like scope creep but is **required**: the
  archive view needs its own `OR`, which would have collided with the search `OR` on the old
  flat object.
