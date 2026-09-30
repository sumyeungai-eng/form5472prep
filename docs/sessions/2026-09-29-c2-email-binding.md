# 2026-09-29 — C2 email-binding security port (local only)

## Ownership and scope

Worktree: /Users/sumyeung/Documents/Claude work/form5472-worktrees/fix-c2-email-binding.
Branch confirmed before editing and after verification: fix/c2-email-binding.
This worktree owns only the files listed below for this task. No pre-existing changes were present.
Source read only: form5472-budget commits 5c3db6b and a488cdc.
Nothing committed, pushed, deployed, stashed, or switched. No build, migration,
database connection, or production URL access.

## Design decisions

- An email binding remains an unverified delivery/account association. Draft reuse
  excludes other browser holds and, for signed-in callers, different accounts.
  The 2026-09-30 follow-up also excludes partner grants and unexpired invites.
  The existing stricter untouched-draft filter and visitor attribution stay intact.
- getOwnedFiling conditionally clears a foreign anonymous session and re-reads,
  with at most three attempts and fail-closed behavior. The account owner,
  owning active partner, and correctly scoped invite are independent grants.
  Partner/invite entry also clears foreign anonymous holds before returning data.
  A foreign cookie cannot be presumed to belong to a partner or invitee.
- Owner takeover does not clear partnerId or revoke invites. Partners and invitees
  retain access through their own credentials even if their old anonymous cookie
  is cleared. The same browser's matching anonymous hold is preserved.
- Invite grants remain opt-in: PATCH uses edit for its initial access check,
  conditional email binding, and final response check. Sign-only, expired,
  wrong-filing, and unscoped invites cannot edit or bind. Invites do not gain
  general checkout or bind-email access. The existing client-only partner signing
  restriction and owner-only prior-signature rule remain intact.
- Dashboard and account GET claim first, then filter out foreign holds, including
  ones bound between the claim and list query.
- Google start retains this application's returning-customer policy: it only
  opens an account draft held by this browser or no browser. Without a safe draft,
  returning customers go to their filings list (which takes over there), rather
  than opening a planted draft or creating an unnecessary new one. Consent is
  never written to the skipped draft.
- Binding uses conditional updateMany with the current caller's grants, throws
  FilingAccessLostError on zero rows, and maps that error to 404 in bind-email,
  checkout, PATCH, and (2026-09-30) save-for-later. bind-email and save-for-later
  read the body before authorization.
- sessionId is omitted from list, single GET, PATCH, and edit-page client props.
  PATCH rechecks its grant before returning data. Single GET and the edit page
  additionally recheck after their full-row reads to prevent the same takeover race.
- ca9c583 already replaced customer-visible Resend delivery messages with EmailLog.
  No webhook production change was needed. Tests use a real signed webhook and
  confirm the EmailLog update while the planted filing's message feed stays empty.

## Changed files

- src/lib/session.ts
- src/lib/findOrCreateDraft.ts
- src/app/(app)/dashboard/page.tsx
- src/app/(app)/filings/[id]/edit/page.tsx
- src/app/api/auth/google/route.ts
- src/app/api/checkout/route.ts
- src/app/api/filings/route.ts
- src/app/api/filings/[id]/route.ts
- src/app/api/filings/[id]/bind-email/route.ts
- src/app/api/filings/[id]/save-for-later/route.ts
- src/lib/emailBinding.test.ts
- src/lib/checkoutAccessLost.test.ts
- docs/sessions/2026-09-29-c2-email-binding.md

## Fail-then-pass proof

39 tests port the 27 emailBinding intents, the checkout error-mapping regression,
and 11 additional partner/invite and response-race cases. Prisma is a stateful
in-memory fake evaluating query predicates; cookie signatures, access helpers,
routes, and server pages run as real code. No live providers are used.

Each mutation ran both new test files. Each temporary source edit was restored
in a finally block, byte-for-byte. The full revert used git show HEAD:file, not
checkout/reset/stash. All 16 mutations were caught:

| Temporarily removed protection | Failed | Passed |
|---|---:|---:|
| full-revert | 36 | 3 |
| draft-reuse | 4 | 35 |
| takeover | 12 | 27 |
| conditional-bind | 6 | 33 |
| google-start | 1 | 38 |
| dashboard | 1 | 38 |
| list | 4 | 35 |
| single-get | 1 | 38 |
| patch-recheck | 1 | 38 |
| serialization | 9 | 30 |
| edit-page | 2 | 37 |
| bind-error | 2 | 37 |
| checkout-error | 1 | 38 |
| invite-bind | 1 | 38 |
| signature-existing-protection | 3 | 36 |
| delivery-existing-protection | 1 | 38 |


The full revert failed 36 of 39 tests. The three tests that still passed covered
already-fixed behavior: two prior-signature denials (91a2a92) and the newer
admin-only Resend delivery handling (ca9c583). Removing those existing protections
separately made those tests fail too. Thus every added test has observed failure
with its relevant protection removed; none relies solely on import/compile failure.
The targeted checkout mutation preserves FilingAccessLostError and removes only
the route's mapping, so it proves a real thrown access-loss error becomes 404.

## Final verification

- Restored final focused tests: 39/39 passing (two files).
- Initial full run, before the additional cases: 1048/1048 passing.
- Full run with all 39 new tests: 1056 passed, 3 timed out (checkout's dynamic
  route import; PDF F5 preflight; PDF formation-date prose). No assertion failures.
  The checkout test now imports its PDF-heavy route outside the timed test body;
  no timeout values or production behavior were changed. Its lost-access mutation
  was rerun and failed with the actual FilingAccessLostError, then passed restored.
- Final full suite: npx vitest run --maxWorkers=2 — 80/80 files, 1059/1059 tests
  passing, 103.54 seconds. Baseline 1020 plus 39 new tests. Worker limiting avoids
  the observed load-sensitive timeouts; the PDF tests pass unchanged.
- TypeScript: npx tsc --noEmit --incremental false -p tsconfig.json —
  final sequential check exited 0; stdout/stderr empty (no diagnostics).
- git diff --check passes.

## Remaining scope

As in the verified source fix, a previously authorized PATCH without email binding
can still write after takeover; its response is denied. General write fencing of
PATCH/uploads is a separate follow-up. There are no owner decisions or deployment
actions requested in this local-only task.


## 2026-09-30 independent-review follow-up (local only)

Directory and branch reconfirmed before editing: the worktree above, on
`fix/c2-email-binding`. The existing C2 port was uncommitted when this follow-up
started; those edits were preserved. No commit, push, stash, checkout, build,
migration, database access, or production URL request was performed.

All four findings were verified in the code and fixed:

1. **Partner / invite draft reuse:** `src/lib/findOrCreateDraft.ts` adds
   `partnerId: null` to both account and session reuse branches and rejects
   partner-held rows again in `isReusableBy`. Both the query and the row guard
   exclude `inviteExpiresAt > now`; null and expired invites remain eligible.
   `src/app/api/auth/google/route.ts` applies the same partner/expiry exclusions
   to its existing-draft lookup, for both start and signin intents.
   The returning-customer routing policy remains intact.
2. **Save-for-later access loss:**
   `src/app/api/filings/[id]/save-for-later/route.ts` finishes body parsing before
   ownership authorization and maps `FilingAccessLostError` to 404 before any
   resume email is sent. Other exceptions still propagate.
3. **Edit-page client props:** `src/app/(app)/filings/[id]/edit/page.tsx` selects
   only `user.email` and omits the user relation from the serialized filing.
   It also omits filing `createdAt`, `inviteEmail`, `inviteTokenHash`, and
   `stripeSessionId`. Schema clarification: marketing opt-out and account
   creation time are User fields; invite/payment metadata are Filing fields,
   so narrowing the user selection alone would not remove all reported fields.
4. **Fake Prisma NULL semantics:** `src/lib/emailBinding.test.ts` now excludes
   NULL from `{ not: scalar }`, retaining `{ not: null }` as a non-null check.
   The fake also supports nullable `lte` for the expiry predicates.

### Regression tests and fail-then-pass evidence

`src/lib/emailBinding.test.ts` adds 21 cases (38 → 59) and extends the existing
edit-page no-sessionId props test. Routes, access helpers, token creation and
consumption use the real application implementations over the in-memory Prisma
fake. External email/payment providers are mocked; no messages are sent.

- Two attack cases call the real partner new-filing route and assert the blank
  row has `sessionId: null`, `userId: null`, and `partnerId: partner_1`.
  One calls real client-link directly with the victim email. The other issues
  and consumes a real edit invite, then uses the invitee's PATCH `{email}` to
  bind the victim. The victim's POST must return `reused: false` and prefill a
  separate filing. Partner GET and invite access see no victim tax IDs in the
  planted row, and neither grant can access the newly created filing.
- Six query cases ensure an older safe draft is still found when a newer
  partner-held or live-invite draft exists, across account, anonymous-session,
  and signed-in-session branches. Two row-guard cases deliberately return an
  unsafe query result and require a new draft.
- Four Google cases cover partner-only and invite-only rows independently, for
  both start and signin. Three positive expiry cases cover null, past, and
  exactly-now expiry in both the draft helper and Google.
- Save-for-later cases cover real access loss during user upsert, a slow body
  spanning owner takeover (including no authorization read before body release),
  and an authorized save that still sends the mocked resume email.
- The props case seeds account marketing metadata and filing invite/payment
  metadata, asserts all reported field names are absent, and retains email and
  no-sessionId assertions. A direct fake-predicate case checks NULL exclusion
  and the positive `{not: null}` behavior.

Before any production fix or the NULL-matcher fix, the expanded test file ran:
**18 failed, 41 passed (59 total)**. All failures were behavioral:

| Finding | Pre-fix failures | Observed failure |
|---|---:|---|
| Partner/invite reuse and Google | 14 | Both real partner-created paths returned `reused: true`; unsafe query rows were selected; Google returned `open-draft` |
| Save-for-later | 2 | Unmapped `FilingAccessLostError`; one authorization read before the body arrived |
| Edit-page props | 1 | Full user relation present in wizard props |
| Fake NULL semantics | 1 | `{not: "same"}` returned NULL rows |

After the fixes, the same expanded file plus `checkoutAccessLost.test.ts` passed:
**60/60 tests, 2/2 files** (`npx vitest run src/lib/emailBinding.test.ts
src/lib/checkoutAccessLost.test.ts --maxWorkers=2`). No temporary production
mutations were needed for this follow-up: the failures were captured against
the incoming uncommitted port before applying these four fixes.

### Final follow-up verification

- `npx vitest run --maxWorkers=2`: **80/80 files, 1080/1080 tests passing**,
  135.40 seconds. This is the previous 1059 tests plus 21 follow-up cases.
- `npx tsc --noEmit --incremental false -p tsconfig.json`: **exit 0**;
  stdout/stderr empty, no TypeScript diagnostics. Run sequentially after Vitest.
- `git diff --check`: passed.
- Branch reconfirmed at completion: `fix/c2-email-binding`. All changes remain
  uncommitted in this worktree; existing port edits were preserved.
