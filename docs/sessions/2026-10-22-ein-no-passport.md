# 2026-10-22 — EIN applications: passport number removed

Owner saw a passport number on the EIN application and asked if we need it. We don't: Form SS-4 never asks for a passport (foreign responsible party without SSN/ITIN leaves 7b blank). The public EIN form already stopped asking in 441c542; leftovers removed here.

## What shipped (branch fix/ein-no-passport → main)
- `sendEinApplicationAdminEmail` no longer has/prints "Passport number" (type field removed).
- `applicationNotifications.ts` stops passing passportNumber for EIN.
- Admin EIN application page: "Passport" row removed.
- `/api/ein-application` no longer reads or stores passportNumber (DB column untouched; legacy values stay in the DB, not shown).
- `scripts/preview-emails.ts` EIN preview updated.
- ITIN is unchanged — a passport IS required for Form W-7.
- Evidence: 55 related tests pass; tsc 0; eslint 0; next build 0.

## Contracts
- Never ask for or show a passport in the EIN flow; ITIN keeps passport number + expiry.
