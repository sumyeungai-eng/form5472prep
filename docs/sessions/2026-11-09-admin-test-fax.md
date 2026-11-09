# 2026-11-09 — admin-only test-fax endpoint

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/test-fax` (`ops/test-fax`, pushed to `origin/main`) | `src/app/api/admin/test-fax/route.ts`, this log |

## Why
Owner wanted to confirm the outbound fax line works by faxing a sample to
+81 45-522-2373. Telnyx keys are Vercel-sensitive (unpullable) and the Telnyx
portal has no send-fax screen, so the check has to run on Vercel.

## What shipped
- `POST /api/admin/test-fax` `{to:"+81455222373"}` (admin session required):
  builds a one-page "FAX TRANSMISSION TEST" PDF (no customer data), stores it
  at `ops/test-fax/<ts>.pdf`, calls `submitFax` to that number. Returns faxId.
- `GET /api/admin/test-fax?id=<faxId>`: live Telnyx status (status, pages,
  failure_reason).
- Not linked to any filing; telnyx-webhook ignores unknown fax ids (returns ok).

Evidence: `tsc --noEmit` 0. No unit test (thin glue over submitFax/storage).
Codex review skipped (small, admin-only, no customer data path).

## Contracts
- Never point this at a customer filing PDF; it is a line check only.
- A delivered test to a non-IRS number proves our Telnyx outbound works, not
  that the IRS line (+1 855-887-7737) is accepting.

## Open
- Owner-gated: none. Follow-up: an admin UI button if this gets used often.
