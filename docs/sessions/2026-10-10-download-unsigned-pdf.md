# 2026-10-10 — "Download unsigned PDF" button on the admin filing page

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/dl-unsigned` / `download-unsigned` → `origin/main` | `src/app/api/admin/filings/[id]/pdf/route.ts` (+ new `route.test.ts`), `src/app/admin/filings/[id]/AdminActions.tsx` |

## What shipped
- Admin filing page → PDFs: "Download unsigned PDF ↓" next to "View unsigned PDF ↗" (disabled until a PDF exists).
- Admin PDF route: `?download=1` → `Content-Disposition: attachment` with a readable ASCII name, e.g. `Form5472_Acme-Holdings-LLC_2024-2025_unsigned.pdf` (`downloadFileName`, accents stripped). Default stays inline (View, place-signature tool unchanged). Works for `?signed=1` / `?faxed=1` too.
- Evidence: route + admin filing tests 17/17, tsc 0, eslint 0, build OK.

### Build fix
- f19566f was pushed with a failing `next build` (my command chain didn't stop on the build exit code): route files may only export handlers, and `downloadFileName` was exported from `route.ts`. Moved to `src/lib/pdf/downloadFileName.ts`; build now passes. The failed Vercel build left the previous deploy live (no outage).

## Contracts
- Never export helpers from Next.js `route.ts` files (Next's route type check fails the build; `tsc --noEmit` does not catch it).
- Without `download=1` the route stays inline — the place-signature tool fetches it.
