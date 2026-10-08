# 2026-10-08 — No client ever sees a staff member's personal email

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/hide-staff` / `hide-staff-identity` → `origin/main` | `src/lib/session.ts` (+test), `src/lib/admin/auth.ts` (+`staffIdentity.test.ts`), `src/app/api/filings/[id]/route.ts` (+test), `src/app/api/admin/filings/[id]/route.ts` (+test), `src/app/(app)/filings/[id]/page.tsx`, `src/components/wizard/FilingActions.tsx`, `src/app/admin/filings/[id]/page.tsx`, `src/app/admin/filings/page.tsx` |

## What shipped
- Owner rule: no client ever sees our personal Gmail addresses.
- Leaks found + closed: (1) the customer filing page passed `reviewApprovedBy` (the shared login's sign-in Gmail) to a client component → in the page payload; (2) customer `GET/PATCH /api/filings/[id]` and the edit page serialized the whole Filing row incl. `reviewedBy`, `reviewApprovedBy`, `preflightOverrideBy`, `preflightOverrideReason`.
- `toClientFiling` now strips `STAFF_ONLY_FILING_FIELDS`; customer API uses it; FilingActions prop removed.
- Shared-password admin actions now record `SHARED_ADMIN_LABEL` ("Form5472 Prep team (shared admin login)") instead of the sign-in email; admin pages map older rows via `displayStaffIdentity`.
- Verified: customer emails go From `donotreply@form5472prep.com`, Reply-To `support@form5472prep.com` (no RESEND_FROM/REPLY_TO override in production env).
- Evidence: 106 targeted tests pass, tsc 0, eslint 0, build OK. Codex audit of the diff + whole `src`: no remaining customer/partner-visible staff email path.

## Contracts
- Never serialize a Filing to a customer/partner without `toClientFiling` (or an explicit field list). New staff-identity columns must be added to `STAFF_ONLY_FILING_FIELDS`.
- Staff identity values (approver/reviewedBy/sentBy/signedBy) are admin-only.

## Open
- Old DB rows still hold the Gmail in staff columns (admin-only now; displayed as the team label).
- Manual: don't type personal emails into portal messages.
