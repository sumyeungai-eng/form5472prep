# Plan: customer feedback — crash on confirmed filings, document access, multilingual (2026-11-23)

The customer review, verbatim in substance:
- the preparation service was helpful, but the website needs work;
- there is no multilingual support;
- clicking a confirmed filing gives a server-side error;
- customers need reliable access to their final submitted documents.

The code was mapped at origin/main `a48c358` (read-only Explore sweep plus production runtime logs). **Status: PLAN.** Phase 0 is a production hotfix; Phases 1–3 wait for owner approval.

## What we found

1. **The crash is real and affects every CONFIRMED filing.**
   - `src/app/(app)/filings/[id]/page.tsx:16,239-240` is a server component. It reads `TRUSTPILOT_TEMPLATES` and `REVIEW_COLLECTOR_TOKEN` from `src/components/TrustpilotWidget.tsx`, which is a `"use client"` module.
   - On the server those exports are client references, not values, so rendering throws "Could not find the module … in the React Client Manifest".
   - The block renders only when `status === "CONFIRMED"` (`page.tsx:231`). The customer's 4 failures on 2026-11-22 match.
   - A sweep found no other production instance (tests only). Barrel re-exports and `import *` were not swept.
2. **"Final documents" access is incomplete even once the crash is fixed.**
   - No customer route serves the **exact faxed bytes** (`Filing.faxedPdfKey`). Only admin routes read it.
   - The delivery email (`email.ts:91`) promises "the exact PDF transmitted to the IRS is available … in your portal". The portal serves `signedPdfKey`, which is not guaranteed to be identical.
   - The confirmation page, the dashboard and the CONFIRMED banner link **only the fax receipt**, not the forms. The FAXED banner links nothing.
   - The delivery email attaches the signed copy only under a size cap. It attaches the receipt only on an admin resend.
3. **Nobody is told when a customer hits a 500.**
   - There is no `error.tsx` or `global-error.tsx` in `src/app`, so customers see Next's bare error page.
   - There is no Sentry and no `onRequestError` alert.
   - We learned of this crash from a review, not from monitoring.
4. **There is no i18n at all.**
   - Copy is inline JSX: `FilingWizard.tsx` alone is 2,420 lines; there are 9 portal pages and about 18 customer emails.
   - There is no locale field.
   - `Filing` stores the owner's citizenship, residence and address country, which can seed a default language.
   - The `hktax/` sub-app has its own dictionary, but it is not reusable as-is.

## Phase 0 — hotfix (today, in production)
- Move `TRUSTPILOT_TEMPLATES`, `REVIEW_COLLECTOR_TOKEN` (and `TRUSTPILOT_PROFILE_URL`) into a plain module, `src/lib/trustpilot.ts`.
  - `TrustpilotWidget.tsx` re-imports them from there.
  - `page.tsx` imports the constants from `@/lib/trustpilot`.
- **Guard test:** a vitest that scans every non-client file in `src/app` and `src/components` and fails if it imports a non-PascalCase name from a `"use client"` module. This stops the bug class from coming back.
- **Verify:**
  - full suite, `tsc`, `next build`;
  - push, and wait for CI and the deploy;
  - then load a CONFIRMED filing page on production as admin, and check the runtime logs show no digest `4187213387`.
- **Lane:** Grok (mechanical, fully specified).
- **Owner, afterwards:** reply to the customer with an apology and their document links. I'll draft it.

## Phase 1 — reliable access to final documents (about 1 day)
1. **Customer route for the exact faxed PDF.**
   - `GET /api/filings/[id]/faxed-pdf` serves `faxedPdfKey`. It is gated on ownership (customer or owning partner) and on `faxedAt` being set. It returns `Cache-Control: private, no-store`.
   - Fallback: if `faxedPdfKey` is null on older orders, serve the signed PDF, labelled "Signed copy".
2. **A "Your filed documents" card**, shown on FAXED and CONFIRMED filings. It lists, with download buttons:
   - the exact PDF faxed to the IRS;
   - the fax transmission receipt (proof of filing);
   - the signed copy, when it differs from the faxed one.
   - It appears on the filing page, `/filings/[id]/confirmation` and as a link on each `DashboardRow`. The FAXED and CONFIRMED banners get a "Download your filed documents" action.
3. **Delivery email:** link directly to the card (magic link with `next=/filings/{id}#documents`). Make the copy accurate: "download the exact forms we faxed and your fax receipt".
   - Attach the receipt PDF every time (it is small).
   - Keep the existing signed-copy size cap.
   - Never attach anything when an SSN is on file (existing rule).
4. **Tests:**
   - route gating: owner and partner allowed, stranger 404, before fax 404;
   - the card renders per status;
   - the email link and attachments.
- **Lane:** Codex. Customer access to tax documents is security-sensitive, so it gets a cross-vendor implementation plus an Opus review of the diff.

## Phase 2 — never again silently (half a day)
- **`src/app/(app)/error.tsx` and `src/app/global-error.tsx`:** a friendly page with the support email and the order reference, plus a "Try again" button.
- **`instrumentation.ts` with `onRequestError`:** send an admin Telegram alert (`sendAdminTelegram`) with the path, the digest and the deploy id.
  - Rate-limit to one alert per digest per hour.
  - Never include request bodies or PII.
- **Daily smoke check** (cron, reusing the existing cron-secret pattern): render one filing page per status as an internal admin preview. Alert on any 5xx.
- **Lane:** Grok.

## Phase 3 — multilingual (staged; needs owner decisions)
IRS documents must stay in English: the forms, the RCS and the Part V statement. Translation covers the **customer experience** only.

| Stage | Scope | Approach | Rough size |
|---|---|---|---|
| 3a | Customer portal: dashboard, filing page, sign page, documents card, banners, and the In-review screen | `next-intl` with cookie- and `Accept-Language`-based locale (no URL prefix, so no SEO churn) and a language switcher in the header. New `User.locale` column, defaulted from the browser, then from the owner's country | 2–3 days |
| 3b | Customer emails (about 18) | Pick the language by `User.locale`; keep English as the fallback and always include the English subject keyword | 2 days |
| 3c | Order wizard (`/start`) | Extract strings from `FilingWizard.tsx` and the steps; translate labels, help text and errors. Customer *answers* stay as typed | 3–5 days |
| 3d | Marketing and blog | **Not proposed now.** It needs hreflang, per-locale URLs and content review, and it is a separate SEO project | — |

- **Translation method:** machine translation (Codex or Claude) into JSON catalogs, then a human spot-check per language of the legal and tax wording. Tax terms (Form 5472, pro forma 1120, EIN, reasonable cause) stay in English, with a short gloss.
- **A "English is authoritative" note** appears in the footer of translated pages.
- **Lanes:** Grok for the catalog extraction and wiring; Codex for the translations; Opus reviews the tax wording.

## Owner decisions
- **D1 (languages):** which languages first. **Recommendation:** pick the top 3–5 from your paid orders' owner countries. I can pull that count from the admin read-only. Likely candidates: Spanish, Portuguese, French, Chinese (Simplified and Traditional), Arabic.
- **D2 (stages):** start with 3a and 3b only (portal and emails, about 1 week), or include the wizard (3c) now. **Recommendation:** 3a and 3b first, then measure.
- **D3 (attachments):** attach the faxed PDF to the delivery email too (size-capped), or link only. **Recommendation:** link plus receipt attachment; never attach the forms when an SSN is on file.
- **D4 (monitoring):** Telegram alerts only (free, already set up), or also Sentry (paid, richer traces). **Recommendation:** Telegram now.

## Order of work
Phase 0 → Phase 1 and Phase 2 in parallel worktrees, on disjoint files → Phase 3a → 3b → 3c.

Every phase gets:
- full test suite, `tsc` and `next build` before pushing;
- a Codex read-only review;
- a CI and deploy check;
- a session log.

Never block payment.
