# 2026-10-30 — Place-signature "Re-edit placement" fix + system-update plan

## Ownership
| Checkout / branch | Owns |
|---|---|
| `~/Developer/f5472-wt/sign-reedit` · `fix/sign-reedit-placement` | `src/app/admin/filings/[id]/place-signature/PlaceSignatureClient.tsx`, this log |
| `~/Developer/f5472-wt/sys-update` · `docs/system-update-plan` | `docs/reviews/2026-10-30-system-update-plan.md` (cherry-picked into this push) |
| `~/Developer/f5472-wt/f7004-auto` · `feat/form-7004-autogen` | Form 7004 autogen lane, still in flight; not touched here |

The main checkout (`~/Documents/Claude work/form5472`, `feat/seo-geo-aeo-sprint`) has uncommitted work belonging to another session. It was left untouched.

## What shipped
**Fix:** in admin → "Place signature", clicking Save and then **← Re-edit placement** brought back blank pages with the signature floating over nothing.
- **Cause:** preview mode was an early `return`, which unmounted the editor and its 50 page canvases. pdfjs renders pages once, on mount (the effect depends only on the endpoints). The remounted canvases therefore stayed at the browser default of 300×150 and empty.
- **Fix:** the editor stays mounted and is only `hidden` while the preview shows. Canvas bitmaps survive `display:none`.
- **Scope:** the same component serves filings and the EIN/ITIN `endpoints` variants, so all of them are fixed.

**Evidence:** a temporary harness page, not committed, rendered `PlaceSignatureClient` with `public/forms/f5472.pdf` and a stub save route. The flow was place → Save → preview → Re-edit.
- **Fixed code:** after Re-edit there were 3 visible pages at 918×1188, 2,570 dark pixels sampled on page 1, and the placed signature was still present.
- **Old code** (fix stashed): after Re-edit the canvases were 300×150 with 0 dark pixels and 1 signature floating. This reproduces the owner's report.
- **Checks:** `tsc --noEmit` clean and `next build` passed before the push.

**Plan:** the system-update plan (rev 2) incorporates a read-only Codex review (19 findings; the blockers were verified in the code). Status: **approved 2026-10-30** ("ok work on all", with all recommendations). Implementation runs in separate worktrees (Task 0: `express-3d`; P0: `sys-p0` on `feat/system-update-p0`).

## Contracts
- **`PlaceSignatureClient`:** never early-return the preview. Anything that unmounts the canvas tree must re-run the pdfjs render effect.
- **System-update plan:** approved. P0 (PRs 1–4) must reach main in ONE push. Express is now "under 3 days" (D1), replacing the 2026-10-28 "within 24 hours" promise.

## Open
- **Owner-gated:** plan decisions D1–D11 (`docs/reviews/2026-10-30-system-update-plan.md`).
- **Follow-ups:**
  - the Form 7004 autogen lane (`f7004-auto`) still needs a Codex review, a build and a push;
  - the partner white-label separation decision is still unanswered.

## Lane notes
- The machine ran at load average ~110–165 because two Remotion renders from other sessions (taxley-yt-*) were running. A first-compile API route took over 10 s, so allow long waits in browser checks.
- **Harness technique for admin-only client components:** add a temporary page under `src/app/zz-*` that passes `endpoints` pointing at `public/forms/*.pdf` plus a stub route. It needs no database or login. Delete it before committing.
- With the in-app browser pane hidden, the viewport is 0×0. Drive React with `dispatchEvent(new MouseEvent('click', {bubbles:true, clientX, clientY}))` instead of coordinate clicks.
