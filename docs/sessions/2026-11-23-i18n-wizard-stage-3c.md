# 2026-11-23 — Stage 3c questionnaire translations

## Ownership and release state

| Checkout / branch | Owned changes |
|---|---|
| `/Users/sum104/Developer/f5472-wt/i18n-wiz`, `feat/i18n-wizard` from `7ce4abbe7825838c852e6ea8ed72678d75e9a255` | Six new wizard catalogs; request namespace registration and catalog tests; app namespace pick; wizard and v3 presentation; file funnel; start/email controls and their context; this handoff |

**Local only. No push or deployment.** The sandbox cannot write the original worktree's
Git index at `/Users/sum104/Documents/Claude work/form5472/.git/worktrees/i18n-wiz/`.
The original branch reference and index therefore remain at the base. To preserve the
requested logical commits, Git metadata was initialized at `/tmp/i18n-wiz-commits.git`
with the original object store as a read-only alternate and this checkout as its worktree.
The three commits are packaged in `artifacts/i18n-wizard-stage-3c/commits.bundle`.
Do not mistake the original `git status` for uncommitted implementation in that bundle.

1. `130fd34`: catalogs, English fallback helpers, namespace/provider wiring and catalog tests.
2. `daa66ab`: wizard/v3 display replacements and multilingual payment/typed-value regression tests.
3. The commit containing this note: file funnel and start/email presentation.

## Implementation and contracts

- 1,022 messages per locale: en, zh-Hans, zh-Hant, de, fr, es. English remains authoritative.
- `wizard.<section>.<key>` catalogs cover headings, labels, hints, options, placeholders,
  buttons, generated summaries, client warnings, tooltips and accessibility labels.
  All 405 IRS activity descriptions are translated for display for the supported years.
- `useWizardText` indexes authoritative English copy to catalog keys. Unknown, missing,
  blank, wrongly typed or unformattable translations render English. The hook's two
  narrow lint exceptions cover optional next-intl context reads: each underlying hook
  always reads exactly one context, even when the missing-provider error is caught.
- Never call the display helper on typed values or data being submitted. Enum values,
  category codes, country-selector names, business activity values, canonical IRS-code
  search input values and reasonable-cause composition remain untouched.
- Generated determination sentences stay English for the existing staff-message payload;
  only their display is localized. The mixed timely/late-year message uses ICU plurals.
- Step 5 reads “Write your own explanation.” followed by “Our team reviews it and may
  use it word for word in your signed statement.” Markup and stored raw answers are preserved.
- No checkout, webhook, PATCH route, schema logic, pre-flight, generator, admin, email,
  or PDF implementation changed. `src/i18n/locales.ts` remains unchanged and pure.
- The app provider's only change is adding `wizard` to its picked namespaces. The request
  loader necessarily registers the new namespace too. Email catalogs are not imported by
  the static client provider, whose three dynamic imports name their namespace explicitly.
- Google's real sign-in button uses its documented display locale and library `hl`:
  https://developers.google.com/identity/gsi/web/reference/js-reference#locale
  Credentials, auth options and submitted values are unchanged.

## Rendering modes

The exact untouched build command failed fetching Google Fonts (`ENOTFOUND`). The baseline
and final verification then used the same external `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`
fixture at `/tmp/i18n-wiz-fonts.cjs`; no repository font/config files were changed.
The fixture supplies CSS using local Arial solely to let this network-restricted sandbox
compile and produce route tables. Both fixture-assisted builds exit 0.

| Route | Before | After | Questionnaire provider |
|---|---|---|---|
| `/start` | ƒ dynamic | ƒ dynamic | Server `getMessages()`/`getLocale()`, common/domain/wizard, around StartForm only |
| `/file` | ○ static | ○ static | English-first client provider in file layout |
| `/file/owner` | ○ static | ○ static | Same client provider |
| `/file/years` | ○ static | ○ static | Same client provider |
| `/file/save` | ○ static | ○ static | Same client provider |
| `/` | ○ static | ○ static | Untouched |
| `/pricing` | ○ static | ○ static | Untouched |
| `/blog/[slug]` | ● SSG | ● SSG | Untouched |

The static provider reads NEXT_LOCALE, then navigator.language when no cookie exists,
normalizes with the pure locales module, and lazy-loads common/domain/wizard. English is
both the server output and first client paint. A malformed cookie or failed chunk keeps
English usable. No server-only module or next/headers is imported in this path.

## Intentionally unchanged surfaces and follow-ups

- `wizard-v3/PreflightStep.tsx` was explicitly protected by the request's “Don't touch …
  the pre-flight” guard. A clarification was offered; absent a different instruction,
  this file and its validation/eligibility behavior were left unchanged.
- `wizard/FilingActions.tsx` was already translated through the portal namespace. Pure
  helper modules, component structure, styles and data attributes remain unchanged.
- Country names in selectors and the specified tax terms remain as requested. Typed
  values, existing canonical search values and raw server/API diagnostics remain English
  or verbatim. Marketing copy outside StartForm/GoogleLoginButton remains unchanged.

Schema-message translation is a separate follow-up. Existing English diagnostics appear at:

1. Entity fields: name, EIN, address, formation date, business country, prior filing,
   activity and activity code (`entitySchema` through Field errors).
2. Owner fields: names, addresses/postal-code exception, citizenship/tax/business countries,
   FTIN, ITIN and Reference ID (`ownerStepSchema` / `ownerBaseSchema` through Field errors).
3. Tax-year selection (`makeYearScopeSchema`), dissolution dates (`validateDissolvedAt`),
   and extension date diagnostics shared with schemas, beside their fields.
4. Reasonable-cause maximum-length messages (`rcsTooLongMessage`) and shared PDF-encoding
   diagnostics, beside the affected answer; their validation logic is unchanged.
5. PATCH schema issues joined by `patchFiling()` in the wizard save-error banner, and raw
   checkout API errors inside the translated checkout-failure alert.

## Verification

Final verification output is saved in `artifacts/i18n-wizard-stage-3c/verification.txt`.

- `npx tsc --noEmit -p .`: exit 0, no diagnostics.
- Requested focused suite: 13 files, 164 tests passed.
- Existing payPath/pdfInputs/checkout/FilingWizard tests, unchanged: 8 files, 87 tests passed.
- Full `npx vitest run`: 221 files passed, 1 skipped; 4,875 tests passed, 1 skipped.
  The existing skip is the Python/PyMuPDF-dependent PDF render test. No load-flake rerun needed.
- Final Next build: exit 0 with the external offline-font fixture; all eight route markers preserved.
- AST audit compared 800 existing form/style/data attributes: no differences.
- Catalog parity uses the installed ICU parser so plural/select branch text is not mistaken
  for a placeholder. All keys, placeholders, ICU messages and protected form terms pass.
- Before every commit/amendment, ran the requested staged secret scan. Matches were only
  the existing “No password” display copy or PLAID_CLIENT_ID / PLAID_SECRET environment
  variable names in an existing setup hint, never credential values.

## Recovery notes

The bundle has the original base commit as a prerequisite. Verify/import it from a Git
repository that already contains `7ce4abb`; inspect the three commits before updating a
checked-out branch or reconciling its index. The original workspace contains the completed
files, so do not blindly reapply a patch over those files. No production/live verification
was attempted because the owner explicitly instructed not to push.
