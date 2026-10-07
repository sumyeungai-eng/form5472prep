# 2026-10-07 — Express order confirmation: one-business-day review line

## Ownership
- Worktree `~/Developer/f5472-wt/express-confirm` (branch `express-confirm-email`, off `origin/main` 21eff67), merged to `main`.
- Files: `src/lib/email.ts` (sendOrderConfirmationEmail only), `src/lib/email.test.ts`.

## What shipped
- Order confirmation email: when `tier === "express"` it adds a highlighted box under the intro
  ("Express order: a qualified accountant will review your filing within one business day.")
  and step 2 of "What happens next" says the review happens "within one business day". HTML and text both.
- Standard and legacy tiers (rush/premium/... resolve to standard) are unchanged — no timeframe.
- Owner decided against a separate 20-minute "we received your order" email; the existing confirmation is enough.

## Evidence
- `npx vitest run src/lib/email.test.ts` 5/5 (new express-vs-standard test); `src/app/api/stripe-webhook/route.test.ts` 8/8; `tsc --noEmit` clean; `next build` OK.
- Rendered preview checked (EMAIL_PREVIEW_DIR).

## Contracts
- The one-business-day promise is express-only; keep it keyed on the literal `"express"` tier, never on legacy `rush`.
- Express plan still advertises "ready within 3 business days" (pricing.ts); the review promise must stay ≤ that.

## Open
- Follow-up (not owner-gated, not done): the Stripe webhook path does not pass `recipientName`, so most confirmations greet "Hello there". One-line fix (`recipientName: filing.ownerName`) — owner said current email is good enough; left as is.
