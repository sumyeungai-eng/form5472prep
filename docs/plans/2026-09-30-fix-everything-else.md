# Plan — "fix everything else" + payment page redesign (2026-09-30)

Owner: "fix everything else, also make the payment page more beautiful and professional".
"Everything" restated as concrete, completable items (goal hygiene):

## Engineering lanes (own worktree + branch each, disjoint files)
| Lane | Items | Files (owned) |
|---|---|---|
| fixw-fax | Server-side re-fax guard: admin `retryFax` refuses FAXED/CONFIRMED/in-flight (`retrying_*`, queued/sending) unless `force` + reason (≥10 chars), logged to FilingChangeLog; AdminActions "Fax again…" sends force+reason. Partner viewers can download the fax receipt. | `src/lib/admin/filingActions.ts`, `src/app/api/admin/filings/[id]/route.ts`, `src/app/admin/filings/[id]/AdminActions.tsx`, `src/app/api/filings/[id]/fax-receipt/route.ts` (+ tests) |
| fixw-deadline | June-30 rule: a tax year (incl. a short year) ending 30 June and beginning before 2026 is due the 15th day of the 3rd month (7-month 7004 extension) — shared deadline code, remove the interim warning. | shared deadline module + its callers' tests; `src/app/(marketing)/form-5472-deadline-calculator/**` |
| fixw-pay | Redesign the Review & pay step (on-site payment page): extract `ReviewStep` from `FilingWizard.tsx` into its own file(s), professional order summary, trust signals, clear price, mobile. No pricing/checkout logic change. | `src/components/wizard/FilingWizard.tsx` (ReviewStep block only), new `src/components/wizard/review/**` |
| fixw-copy | Homepage "How it works" adds the qualified-accountant review step (+ 40–60-word step bodies, per-step ids); ComparisonTable plain-language "DIIRSP" wording; wizard sidebar mentions accountant review. | `src/app/(marketing)/page.tsx` (How it works only), `src/components/ComparisonTable.tsx`, `src/components/wizard-v3/Sidebar.tsx` |
| fixw-blog | The earlier request: 5 new blog posts (sales-blog-geo-aeo standard), linking to the new tools; independent fact-check before publish. | new `content/blog/*.md`, `public/blog/*`, `scripts/render-blog-artwork.mjs` POSTS, `src/lib/blog.ts` ARTWORK_ALTS |
| analysis (read-only) | Zero-total pre-flight sweep since 21 Sep (which filings, what state); Form 5472 revision to use for older tax years; Stripe adaptive pricing recommendation. Report → coordinator decides actions. | none |

## Owner-gated (cannot be done by the agent)
- Legal entity name + address for the site (owner must supply).
- Rotate SESSION_SECRET (secret value entry in Vercel), RESEND_WEBHOOK_SECRET, TELNYX_PUBLIC_KEY.
- Google Search Console indexing requests (Chrome extension blocks search.google.com).
- PDF_GENERATED backlog = the qualified accountant's review work.
- Any Stripe dashboard setting change (adaptive pricing) — recommendation only.

## Completion condition
Each lane merged to main with tests + tsc + build green, independent review where logic changed
(fax guard, deadline), browser check for UI lanes (payment page desktop + 375px), deploy Ready,
session log written; owner-gated list reported.
