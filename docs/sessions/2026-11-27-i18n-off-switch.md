# 2026-11-27: Multi-language switched off (reversible)

**Owner:** "switch off multi language function for now". All translation is turned off by one switch. Nothing was deleted.

## Ownership
| Worktree | Branch | State |
|---|---|---|
| `~/Developer/f5472-wt/i18n-off` | `feat/i18n-off-switch` | merged to main |

## What shipped (`e54fa6e`, `874e975`)
- **The switch:** `I18N_ENABLED = false` in `src/config/i18n-switch.mjs`. Both `next.config.mjs` and the TS code read it. Set it to `true` and redeploy to restore everything.
- **Customer side:** portal, `/start` and `/file` wizard, all customer emails, FilingLocked and the error pages always render English via `effectiveLocale` / `emailLocale`.
  - Stored `User.locale` values and `NEXT_LOCALE` cookies are preserved.
  - While off, magic-link login writes no new locale.
- **Stripe Checkout:** forced to `locale: "en"` while off, on the first attempt and on the branding retry. It stays `"auto"` when on.
- **Portal message timestamps:** formatted `en-US` while off.
- **Public pages:** `/de`, `/de/*`, `/zh-hans` and `/zh-hans/*` get temporary 307 redirects (`next.config.mjs`) to the unprefixed English path, with the query string kept.
  - No hreflang, no /de or /zh-hans sitemap entries.
  - `LanguageMenu` and `LanguageSwitcher` render nothing, and the marketing locale cookie is not written.
  - Catalogs and the `(marketing-intl)` routes are kept.
- **Verification:**
  - Full vitest: 5264 passed. `tsc` clean. `next build` exit 0.
  - A local `next start` check showed every /de and /zh-hans path returning 307 to English. The homepage has 0 hreflang and no picker, and the sitemap has 0 /de or /zh-hans entries.
  - English email fixture hashes are unchanged. The English snapshots lost only the picker and the hreflang.
- **Reviews:** two independent reviews (Codex and Opus) over two rounds, final verdict SHIP from both.

## Contracts
- All locale resolution goes through `effectiveLocale` / `emailLocale` and respects `I18N_ENABLED`. New translated surfaces must use them.
- Existing translation tests mock the switch ON. Keep them that way. Do not delete them.

## Open
- **Owner:** when ready, decide whether to turn translation back on, and in what scope. The staged plan discussed 2026-11-27 was Chinese and German, commercial pages first, native-speaker review, then measure in Search Console.
- **Follow-ups:**
  - On the partner-portal host, `/de/...` now 307s before the portal rewrite. Nothing leaks.
  - Google will drop the /de and /zh-hans URLs over the next weeks because of the redirects.
