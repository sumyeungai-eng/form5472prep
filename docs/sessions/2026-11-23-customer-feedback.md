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
| `i18n-wiz` | `feat/i18n-wizard` | Phase 3c wizard | merged |
| `mkt-plan` | `feat/i18n-marketing` | Phase 3d public pages | merged |

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
| **Wizard i18n (3c).** The questionnaire is translated: `components/wizard/**` (inside the `(app)` provider), `wizard-v3`, `/file/*` (English-first lazy client provider, so the pages stay ○ static, verified in the route table) and the `/start` form (server `getMessages`; the route was already ƒ). The change is text only. A Codex review confirmed that values, option codes, validation, navigation and the pay-button state are identical, and that the pay button stays enabled on bad data in all 6 locales. A `lang` wrapper (`display:contents`) is added for screen readers. Verified live: `/file` in `de` renders German with `lang="de"`. Codex's sandbox could not commit, so its 3 commits were imported from a git bundle after a byte-for-byte check against the worktree. | `130fd34`…`8c39660` |
| **Public pages i18n (3d).** Owner picks D1 zh-Hans+de, D2 5 pages, D3 noindex until native review, D4 `/zh-hans`/`/de`. `/`, `/pricing`, `/services`, `/faq`, `/form-5472-penalty-calculator` each render from one shared component per page (`src/components/marketing/pages/*`) for en/de/zh-Hans; translated routes live in `src/app/(marketing-intl)/{de,zh-hans}`. Catalogs `src/i18n/marketing/{en,de,zh-Hans}.json` (outside `messages/`), pure `createTranslator` so every route stays ○ static. English output is byte-identical (`english-baseline.test.tsx`, 11 snapshots taken before the change). Codex built it; Codex read-only review found 0 P1, fixed: calculator shipped all 3 catalogs (191→131 kB First Load; baseline 114 — the remaining +17 kB is the next-intl client runtime), blank translations now fall back to English, homepage title and order-card checklist translated. Other English pages +1.2 kB (language menu / mobile-menu islands in the layout chunk). Full suite 4949 pass, `tsc` clean. | `d02a33b`…`1148d92` |
| **Public pages indexable (3d-2), 2026-11-24.** Owner asked to make /de and /zh-hans indexable before native review. Full Opus wording review of all ~707 keys first: 1 HIGH fixed (German FAQ said "not US-resident" for "non-US person"), plus 7 wording fixes and "reasonable cause statement" kept in English on key labels. Then **two independent reviews** (Codex high + fresh Opus deep-reasoner, same brief): both SHIP; fixed in one Codex round: source-parity guard (en.json must equal the code-owned English that supplies {amountN}/{daysN}, else prices could swap in de/zh), `catalogText` falls back to live English not the raw key, translated pages omit `robots` so root googleBot directives survive, language switcher only on the 5 localized paths, a switcher click sets `NEXT_LOCALE`, gate tests run the real helper/metadata/sitemap/chrome with the flag on and off. Both reviewers re-checked the fix: SHIP. Full suite 5029 pass, tsc clean, all routes ○. | `c03782e`, `ed43b6c` |

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
- **Two-agent review.** Owner rule (2026-11-24): every new feature or customer-facing wording change gets at least two independent agent reviews (Codex + a fresh Claude reviewer) before it ships.
- **Indexing gate.** `MARKETING_LOCALES_INDEXABLE` (src/i18n/marketing/config.ts) is now `true`; the gate logic lives in `src/i18n/marketing/languageAlternates.ts`. Flipping it back restores noindex, drops hreflang/sitemap entries and hides the switcher (tested both ways in `indexing-gate.test.tsx`). Any English marketing copy edit must keep `en.json` equal to the code-owned source (`source-parity.test.tsx`).
- **Translated public pages.** Never use `getTranslations`/`getLocale`/`getMessages` or a server `NextIntlClientProvider` on marketing pages; client islands get only their own message subset (e.g. `getCalculatorMessages`), never the full catalogs. Changing English marketing copy changes the baseline snapshots on purpose — update them deliberately AND add the de/zh-Hans wording (a changed English string under an existing key is not caught by tests). Keep `export const revalidate = 600` literal in each homepage route file.
- **Faxed-PDF access.** It mirrors `fax-receipt/route.ts` exactly. Do not widen it.
- **Fax failures.** They stay internal only (commit `7a3be4b`, earlier).

## Open
**Owner-gated:**
- Send the drafted apology email to the reviewing customer (draft in chat).
- Native-speaker review of the zh/de/fr/es catalogs (machine-translated, spot-checked by Opus).
- Optional: `grok login` to restore the Grok lane (it was logged out, so Codex was used instead).

- **Owner, Phase 3d (made indexable 2026-11-24 without native review, at owner's request):** a native-speaker read of `src/i18n/marketing/{de,zh-Hans}.json` is still worth doing; then resubmit the sitemap in Search Console. Decide whether German keeps "Geld-zurück-Garantie" (Chinese avoids 保证).
- **English copy issues found by the wording review (owner decision, not fixed):** `pricing.ts` "Prepared and filed in {turnaround}" breaks the no-"filed in X" rule; FAQ `missed-form-5472` omits that the extra $25,000/30 days starts 90 days after the IRS notice; FAQ `automatic-penalty` says "is automatic" vs penalty page "can be"; FAQ `how-do-i-sign` vs homepage on browser signing; `home.s014` "we handle the response with the IRS" vs FAQ "we do not handle penalty appeals".
- **Follow-ups (3d):** turnaround numbers on /de and /zh-hans are regex-extracted from `STANDARD_TURNAROUND`/`EXPRESS_TURNAROUND` and bypass the source-parity guard ("under 72 hours" would render "72 Tagen"); `<html lang>` stays `en` on translated pages (add a `Content-Language` header in next.config if Bing matters); calculator First Load 131 kB vs 114 kB baseline (next-intl client runtime).

**Follow-ups:**
- Server zod/schema validation messages and raw checkout/API errors still show in English (the 3c follow-up list: entity and owner field errors, year, dissolution and extension errors, reasonable-cause length and encoding errors, save banners).
- Form 7004 confirmations stay English (no account or locale).
- `npm run email:preview` needs `tsx` (it was missing before this work).
- The smoke cron and alerts are only proven when the first 02:30 run / first error happens; check Telegram.
- Blog sessions must keep slugs at 41 characters or fewer (`blog-slug-length.test.ts`); a Form 1120X post broke CI again.

## Lane notes
- **Grok lane:** CLI installed but unauthenticated, so Codex (`codex-implementer`) substituted. Codex rejects `gpt-5.5` on this account; it ran on the default model.
- **Codex sandbox:** it has no network, so `npm install` must run outside it.
- **zsh gotcha** (logged in `~/.claude/doctrine/lessons.md`): `VAR=x cmd && …` leaves `VAR` empty for later commands. That caused a bulk sed accident, which was caught by `git status` before staging and fully restored.
- **Admin cannot view a customer portal page.** Verify portal i18n through `/filings/{id}` while signed out (the `FilingLocked` view uses the same layout), or through the smoke cron.
