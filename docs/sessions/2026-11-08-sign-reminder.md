# 2026-11-08 — Admin "Send signing reminder" button

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/sign-reminder` (`feat/sign-reminder`, pushed to `origin/main`) | `src/lib/admin/filingActions.ts` (+ test), `src/lib/email.ts`, `src/app/admin/filings/[id]/AdminActions.tsx`, this log |

## What shipped
- New filing action `sendSignReminder`. It re-sends the check-and-sign email
  (`sendReadyToSignEmail` with `reminder: true`): subject "Reminder: please
  check and sign your forms", one reminder sentence before the usual body,
  same magic-link sign button, partner branding kept. EmailLog kind is
  `sign_reminder`; a change-log row records who sent it.
- It refuses when the package is not released (`not_released`) or is already
  signed or faxed (`already_signed`).
- Admin order page, Customer emails card: a "Send signing reminder" button,
  shown only while the package is released and unsigned.
- Added to `FILING_ACTION_NAMES` (v1/iOS API) and `SIDE_EFFECTING_ACTIONS`.

## Open
- No automatic reminders; the button is manual. There is no "last reminded"
  label yet (EmailLog on the order page shows each send).
