# 2026-11-02 — Generator fix spec (2.4.0) and post-generation PDF validator

Source: the owner's external "Filing Package Generator — Fix Specification"
(`~/Downloads/generator-fix-spec.md`, NOT in the repo: it quotes real client
data). Triage: `docs/reviews/2026-11-02-generator-fix-triage.md`.

**Status: committed locally on `fix/generator-spec-2026-11`, NOT pushed, NOT
merged.** Merging to `main` deploys, and the Vercel build runs `prisma migrate
deploy`, which applies the new additive column.

## Ownership

| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/gen-fix`, branch `fix/generator-spec-2026-11` (rebased 2026-11-03 onto `origin/main` incl. `20261102120000_extension_autogen`) | every file in `origin/main..HEAD` |
| `~/Documents/Claude work/form5472` (main checkout) | not touched (another session's uncommitted work) |
| Parallel lanes `sys-p0`, `express-3d`, `f7004-auto` | not touched. Release-gate files edited here, minimally, because the fix needs them: `prisma/schema.prisma` (one column), `src/lib/admin/filingActions.ts` (allowlist, two selects, one validation branch for `llcFormationState`). Expect a trivial merge with `sys-p0`. |

## What shipped (on the branch)

| Commit | Change |
|---|---|
| `e6db302` | Triage of every spec item against generator 2.3.1. |
| `fb7c7c5` | **P0-2** `Filing.llcFormationState` (migration `20261103120000_llc_formation_state`, `ALTER TABLE "Filing" ADD COLUMN "llcFormationState" TEXT`; validated with `prisma migrate diff` against HEAD's schema). Wizard field next to the formation date, optional with an amber note; PATCH stores the 2-letter code or null, never 400; admin-editable (Edit filing fields + LLC details card); copied to linked and prefilled returns. RCS: "I formed X on DATE in <state>" only from that field; clause omitted when missing. **P1-8** FTIN printed with whitespace removed. Presets moved to `src/lib/irsCodes/presets.ts`. `GENERATOR_VERSION` 2.4.0. |
| `61b6c0e` | **§5 validator** `src/lib/pdf/validatePackage.ts` + wiring as the last step of `runPreflight` (A39–A51, W46–W47; see triage). |
| `c0ffbdf` | §6 acceptance on the synthetic twin `src/lib/pdf/__fixtures__/exampleImpact.ts` + negative tests (`validatePackage.test.ts`). |
| `261a7f7` | tsc fix: `matchAll` iterated via `Array.from` (ES5 target). |
| `17ee9e3`, `7224389` | Session log + `CLAUDE.md` pointer line. |
| `f48cae6` | Codex review P1: A40 now requires the name/EIN/year once per authored DOCUMENT and checks every printed EIN and "Reporting Corporation:" name for consistency. A long RCS continuation page has no header and used to fail A40 (blocking release/fax). Regression: two-page RCS passes; a stray different EIN fails. |
| `7888361` | Codex review P2: admin v1 filing detail (`api/admin/v1/filings/[id]`) selects and returns `llcFormationState`, with a test. |
| `eb50de2` | Migration renamed `20261103120000_llc_formation_state` so timestamps stay strictly increasing after `20261102120000_extension_autogen`. |

## Evidence

- Targeted vitest (30 files, incl. `generatePackage`, `preflight`, `render`
  [PyMuPDF present, 11/11 ran], `validatePackage`, `pdfInputs` PATCH/checkout,
  `filingActions`, `linkedReturn`, `api/filings`, wizard, schemas, checkout,
  pay-path): **565/565 passed**, exit 0. Snapshots unchanged (existing fixtures
  set `llcFormationState` equal to their old `llcState`).
- `npx tsc --noEmit -p .`: exit 0 (after `261a7f7`; re-run after the rebase: exit 0).
- `MAGIC_LINK_SECRET=x SESSION_SECRET=placeholder-... npx next build`: exit 0
  (prisma "DATABASE_URL not found" lines during prerender are the usual
  no-DB local noise).
- `prisma migrate diff` (HEAD schema → branch schema) prints exactly the
  migration's `ALTER TABLE "Filing" ADD COLUMN "llcFormationState" TEXT`.
- Never-block: `pdfInputs.test.ts` — PATCH with `wy`/`Wyoming`/`Wyo`/`""`
  returns 200 (stores `WY`/`WY`/null/null); a filing with no formation state
  and a spaced FTIN reaches `stripe.checkout.sessions.create`. Real
  `generatePackage` + `runPreflight` on bad data (off-list 541613, dated
  description, "FR" country, "None" FTIN) resolve; pre-flight returns failures.
- Validator ran clean (0 failures, 0 warnings) on every existing fixture
  F1–F11 and on the §6 twin; the full §6 table is asserted on the printed PDF.
- Renders (150 DPI, PyMuPDF) in `~/Developer/f5472-wt/gen-fix-out/`
  (outside the repo): `example-impact-p2.png` (1120 p1: header 10/28, 2025,
  12/31, 25; "Sole Member" in the Title box below the jurat),
  `example-impact-p9.png` (5472 p2: 8a "Camille Exemple, 101 rue des Exemples,
  Frejus, Var, 83600, France" fully visible; 8b(3) 1234567890123; 8c/8d
  Advertising services / 541800; 8e ticked), `example-impact-p12.png` (RCS:
  "formed ... in Wyoming"; perjury heading on the signature block).

## Contracts a future editor must respect

- The RCS formation state comes ONLY from `Filing.llcFormationState`. Never
  fall back to `llcState`/`llcCity`/any address field. Missing = omit the
  clause.
- `llcFormationState` is optional everywhere on the customer side (wizard,
  `entitySchema`, PATCH, checkout, payment-time generation). Do not add it to
  the "required fields" gates in checkout / stripe-webhook / generate-pdf /
  filingActions.
- The validator reads the PRODUCED PDF. It locates fields by the widget
  rectangle in the blank IRS PDF (`public/forms`) and pdf-lib's
  `q 1 0 0 1 x y cm /FlatWidget-n Do Q` draw pattern. If pdf-lib's flatten
  output or a blank form changes, `validatePackage.test.ts` must still pass;
  a silent "field not found" reads as blank and fails A40/A46, it does not pass.
- `runPreflight` must never throw at payment: validator errors become A51.
- Codes taken: A39–A51, W46–W47. A37/A38 and W42–W45 are reserved by `sys-p0`.
- `preflight.test.ts` mocks `./validatePackage` (its records are synthetic);
  validator coverage lives in `validatePackage.test.ts` and in every
  `generatePackage.test.ts` `runPreflight(...).failures === []` assertion.
- Never put the spec's real client identifiers in the repo; the fixture is a
  synthetic twin.

## Open items

Owner-gated:
- Audit the last delivered packages: P0-1 was fixed in 2.1.0 (2026-10-05),
  so packages generated before that may have a clipped 8a; P0-2 affects every
  late package whose LLC was formed in a state other than its mailing state.
  Decide per client on amendments / corrected RCS.
- 8c/8d mirror 1d/1e for the individual owner. If the owner's own trade
  differs from the LLC's, should 8c/8d describe the person? (IRS-content call.)
- `toPdfSafe` prints "Frejus" for "Fréjus" (house ASCII rule); keep or allow
  WinAnsi accents?
- Existing orders have no formation state: staff see W46 on late packages
  until it is entered.

Follow-ups:
- Per-order 150 DPI renders (`pdftoppm`) stored with the order (spec §5
  "visual check") — needs a storage/retention decision.
- Reference ID uniqueness across filings / years (§4 4b(2)) — needs a DB query.
- Validator horizontal clip (text wider than the box) is left to R02 at
  generation time; A39 checks the vertical clip only.
- Title "Sole Member" prints 10pt black; spec suggests 8pt navy (cosmetic).

## Lane notes

- Scratchpad files in the session dir were wiped mid-session by a restart;
  artefacts (renders, logs) moved to `~/Developer/f5472-wt/gen-fix-out/`.
- PyMuPDF is installed for the user's python3 (not under `python3 -I`), so
  `render.test.ts` runs locally.
