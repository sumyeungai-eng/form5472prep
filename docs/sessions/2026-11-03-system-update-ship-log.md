# 2026-11-03 — System update + generator fix spec: ship log (orchestrator)

This session ran 2026-10-30 → 2026-11-03 and took two owner specs to production:
- `form5472prep-system-update.md`, planned in `docs/reviews/2026-10-30-system-update-plan.md` and approved with every recommendation (D8 = option b);
- `generator-fix-spec.md`, triaged in `docs/reviews/2026-11-02-generator-fix-triage.md`.

Each lane has its own session log, linked below. This file is the index plus the cross-lane facts.

## Ownership
All lanes were merged to `main`. Their worktrees, under `~/Developer/f5472-wt/`, are stale and may be removed:

| Worktree | Lane |
|---|---|
| `sign-reedit` | place-signature Re-edit fix |
| `express-3d` | Task 0 |
| `f7004-auto` | Form 7004 autogen |
| `gen-fix` | generator 2.4.0 |
| `ci-fix` | blog slug / intro CI fix |
| `sys-p0` | P0 PRs 1–4 |
| `p1-gen` | PR 5, 6, 9 |
| `p1-ui` | PR 7, 8, 10 |

The main checkout (`feat/seo-geo-aeo-sprint`) holds another session's uncommitted work and was never touched.

## What shipped
Every row has deploy = success and GitHub CI = success at its final SHA.

| What | Commits | Session log |
|---|---|---|
| Re-edit placement keeps the PDF pages | `664a409` | `2026-10-30-sign-reedit-and-system-plan.md` |
| Express turnaround is "under 3 days" | `271e4aa` | — |
| Form 7004 auto-generate plus admin-click fax | `…223a3d0` | `2026-10-30-form-7004-autogen.md` |
| Generator 2.4.0: formation state, FTIN, post-generation validator A39–A51 | `…1b06565` | `2026-11-02-generator-fix-spec.md` |
| CI fix: 5 Nov blog slugs, with 301s; intro word count | `4cc2304` | — |
| P0 (single push): release gate, DRAFT cause marker, verbatim RCS, Part V line items | `921e6a9..2f271b1` | `2026-10-31-release-gate-p0-1.md`, `2026-11-04-system-update-p0-2-4.md` |
| Validator WinAnsi decode (CI Node 20) | `e4837aa` | — |
| PR 5 / 6 / 9: preparer env, W39, PDF regression map | `a2ce0dd..ad4d738` | `2026-11-03-p1-generator.md` |
| PR 7 / 8 / 10: sign-page panel, review queue plus `paidAt`, DIIRSP wording | `8a0a42d..812a4cb` | `2026-11-03-p1-admin-ui.md` |

**Live checks by the orchestrator:**
- `/admin/filings?queue=1` loads on production data: 8 queue rows, due chips, 5 "Not released" badges.
- Search with `q=` returns 200 and rows.
- The admin shows "Late filing", with no "DIIRSP:".

Every lane had a read-only Codex review before shipping; findings were fixed and tested first.

## Contracts a future editor must respect
- **Run the full vitest suite before any push to main, and check the GitHub CI run for that SHA**, not just the Vercel deploy status. CI was red from 30 Oct to 3 Nov because lanes ran only targeted tests.
- **Blog slugs:** posts dated after 2026-10-15 keep URLs to 75 characters or fewer (slug ≤ 41). See `blog-slug-length.test.ts`.
- **Migration folder names must strictly increase.** Prisma orders them by name. Latest is `20261106120000_filing_paid_at`.
- **Release gate:** clients only ever receive `reviewApprovedPdfKey`, and a generated PDF needs `preflightPdfKey === generatedPdfKey` before it can be released. A32 is never overridable, and a verbatim source with non-empty text satisfies it. See the P0 logs.
- **Generator:** formation state comes only from `llcFormationState`. Validator codes A39–A51 and W46–W47; P0 codes A37/A38 and W42–W45. Generator version is 2.5.1.
- **Never block payment:** Part V capture is permissive, PATCH never returns 400 on row content, and every `paidAt` write goes through the non-throwing `stampPaidAt`.

## Open
**Owner-gated:**
- Set `HOUSE_PREPARER_PTIN`, `_FIRM_NAME`, `_FIRM_EIN` and `_FIRM_ADDRESS`, plus optionally `_FIRM_PHONE` and `_IRS_DISCUSS`, in Vercel Production. The real values are in the owner's spec, never in the repo.
- 8a audit: 18 delivered packages came from generators older than 2.1.0. The list is in `~/Documents/Claude work/form5472-private/2026-11-02-8a-and-pba-audit.md`, outside the repo because it has real client names. Waiting on the owner's yes/no to download their faxed PDFs and run the validator.
- PBA codes on delivered filings that look off the i1120 list (541611, 541613, 611430, 512230, 999999, 000000…) need a per-client amendment decision.
- Whether to remove "DIIRSP" from the calculators, `faq.ts` and the late-filing checker. They were kept as marketing under D8b.
- D7: loans are printed in Part V while Part IV is hardcoded to 0. This is a tax decision.
- 8c/8d repeat the LLC's activity for an individual owner.

**Follow-ups:**
- Staff: click "Re-run pre-flight" once on each order waiting for review before Release enables.
- The first live Form 7004 fax and the first P0 release via the new button are the end-to-end checks.
- Optional Stripe backfill for `paidAt`; per-order `pdftoppm` renders; a `convertOwnerPaidCosts` iOS action.
- The other session's blog drip must follow the slug rule.

## Lane notes
- **App restarts:** the Claude app restarted about 4 times. Background agents die on restart but resume via SendMessage from their saved worktree state. Tell lanes to commit after every passing step.
- **GitHub API:** unauthenticated calls are rate-limited (60 per hour). Poll CI and status every 60 s or more, not every 25 s.
- **Two Remotion renders** from other sessions pushed load to around 165 on 30 Oct and slowed every build.
