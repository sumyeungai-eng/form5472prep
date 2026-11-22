# 2026-11-23 — Customer feedback: confirmed-filing crash, filed documents, monitoring, multilingual

- **Trigger:** a public customer review. The service was helpful, but there was "no multilingual support", "clicking my confirmed filing leads to a server-side error", and "customers should have reliable access to their final documents".
- **Plan:** `docs/reviews/2026-11-23-customer-feedback-plan.md`. The owner approved it ("sure do all these").
- **D1 languages (from 51 paid orders' owner citizenship):** zh-Hans, zh-Hant, de, fr, es.
- **D2:** portal, then emails, then wizard. **D3:** link to the documents plus attach the receipt. **D4:** Telegram alerts, no Sentry.

## Ownership
| Worktree (`~/Developer/f5472-wt/`) | Branch | Lane | State |
|---|---|---|---|
| `feedback` | `fix/customer-feedback-2026-11` | Phase 0 hotfix + Phase 1 documents | merged |
| `monitor` | `feat/error-monitoring` | Phase 2 | merged |
| `i18n` | `feat/i18n-portal` | Phase 3a portal | merged |
| `i18n-email` | `feat/i18n-emails` | Phase 3b emails + FilingLocked | merged |
| `i18n-wiz` | `feat/i18n-wizard` | Phase 3c wizard | in progress at the time of writing |

The main checkout `~/Documents/Claude work/form5472` holds another session's uncommitted work and was not touched. The merged worktrees are stale and may be removed.

## What shipped
Every row was deployed, and each one passed the full vitest suite, `next build`, GitHub CI and the Vercel deploy.

| What | Commit on main |
|---|---|
| **Crash fix.** `(app)/filings/[id]/page.tsx` (a server component) read `TRUSTPILOT_TEMPLATES` / `REVIEW_COLLECTOR_TOKEN` from a `"use client"` module, which made every CONFIRMED filing page throw "Could not find the module … in the React Client Manifest". The constants now live in `src/lib/trustpilot.ts`, and the guard test `src/lib/clientBoundary.test.ts` blocks the pattern. This commit also shortened the 2026-11-17 Form 1120X blog slug (with a 301) so CI goes green again. | `3e3b4f8` |
| **Monitoring.** Adds `(app)/error.tsx` and `global-error.tsx` (neutral copy on the partner portal host), `src/lib/errorAlert.ts` (Telegram, deduped per digest, PII masked) and `POST /api/client-error`, which the error boundaries call for an instant alert. Next 14.2.35 has no `onRequestError`. A daily cron `/api/cron/portal-smoke` at 02:30 UTC renders the latest retail filing per status as its owner; it is read-only (verified by a Codex trace: no DB writes, messages, analytics or emails). | `b4cd2e9`, `0227f4f` |
| **Filed documents.** Adds `GET /api/filings/[id]/faxed-pdf` (owner or owning partner via `getFilingAccess`; 404 until `faxedAt`; serves `faxedPdfKey`, falling back to `signedPdfKey`). Adds `FiledDocumentsCard` (`#documents`) on the filing and confirmation pages, banner actions and dashboard links. The delivery email links to `#documents` and attaches the fax receipt. The forms are never attached when an SSN is on file. | `503cb56`, `54923c4` |
| **Portal i18n (3a).** next-intl 3.26.5 without i18n routing. The locale comes from the `NEXT_LOCALE` cookie, then Accept-Language, then `en`. There is no DB access in `request.ts`. English is deep-merged under every locale, and `onError` only logs. Adds `User.locale` (migration `20261123120000_user_locale`), applied to the cookie at magic-link login. The language switcher is a server action. The provider lives only in `(app)/layout.tsx`, so marketing stays ○/● (verified in the build route table). Verified live: every locale renders the "English is authoritative" footer. | `f851ae1`, `1267505` |
| **Email i18n (3b).** 18 customer emails take a `locale` argument (from `User.locale`, already loaded; no new webhook or checkout queries). English output is byte-identical (25 fixture hashes). Admin and partner-firm emails stay English. `FilingLocked` is translated. The German no-name greeting uses an ICU select. The email translator does not import `server-only`. | `2f7098d`…`7ce4abb` |

Read-only Codex reviews ran on every lane before shipping, and every finding was fixed. The highest-value finds:
- the monitoring cron sampled partner filings;
- the error page broke white-label portal isolation;
- a `tsconfig` alias that would have stubbed out `server-only` in production, including on `src/lib/crypto/ssn.ts`;
- the plain-text order-confirmation intro stayed in English.

## Contracts
- **Server and client boundary.** Server files must never import non-component values from `"use client"` modules; `clientBoundary.test.ts` enforces this. Put shared constants in `src/lib/*`.
- **Never block payment.** i18n must never throw. Missing keys fall back to English. Never add locale DB lookups to checkout or the stripe-webhook.
- **Wording.**
  - Messages never use protected titles: German "Steuerberater" (use "Steuerfachkraft mit IRS-PTIN"), French "expert-comptable", Chinese "注册会计师/註冊會計師".
  - Tax terms (Form 5472, IRS, PTIN, EIN, …) stay in English.
  - IRS PDFs and admin UI stay English.
- **Catalogs.** Every locale has the same keys and placeholder names as `en` (`src/i18n/messages.test.ts`). New namespaces are new `messages/{locale}/{ns}.json` files.
- **Static marketing.** Keep `getLocale`/the provider out of the root layout, so marketing pages stay static.
- **Faxed-PDF access.** It mirrors `fax-receipt/route.ts` exactly. Do not widen it.
- **Fax failures.** They stay internal only (commit `7a3be4b`, earlier).

## Open
**Owner-gated:**
- Send the drafted apology email to the reviewing customer (draft in chat).
- Native-speaker review of the zh/de/fr/es catalogs (machine-translated, spot-checked by Opus).
- Optional: `grok login` to restore the Grok lane (it was logged out, so Codex was used instead).

**Follow-ups:**
- Phase 3c (wizard) is in progress.
- Server zod/schema validation messages stay English.
- Form 7004 confirmations stay English (no account or locale).
- `npm run email:preview` needs `tsx` (it was missing before this work).
- The smoke cron and alerts are only proven when the first 02:30 run / first error happens; check Telegram.
- Blog sessions must keep slugs at 41 characters or fewer (`blog-slug-length.test.ts`); a Form 1120X post broke CI again.

## Lane notes
- **Grok lane:** CLI installed but unauthenticated, so Codex (`codex-implementer`) substituted. Codex rejects `gpt-5.5` on this account; it ran on the default model.
- **Codex sandbox:** it has no network, so `npm install` must run outside it.
- **zsh gotcha** (logged in `~/.claude/doctrine/lessons.md`): `VAR=x cmd && …` leaves `VAR` empty for later commands. That caused a bulk sed accident, which was caught by `git status` before staging and fully restored.
- **Admin cannot view a customer portal page.** Verify portal i18n through `/filings/{id}` while signed out (the `FilingLocked` view uses the same layout), or through the smoke cron.
