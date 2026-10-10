# 2026-10-10 — 24-Hour filing tier added, repriced, then withdrawn (same day)

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/remove-24h` / `remove-24h` → `origin/main` | reverts of 981df4a (add $299 24-Hour tier) and 4b52dc7 ($279); `src/lib/pricing.ts` (+ new `src/lib/pricing.test.ts`) |

## What shipped
- 981df4a added a "24-Hour filing" tier (slug `priority`, $299; promise: ready to check and sign within 24h, 7 days a week), 4b52dc7 repriced it to $279. Owner then said "actually remove 24 hours plan".
- Both commits reverted (all wizard, email, admin badge, marketing/SEO/llms/FAQ/chat copy back to Standard $149 / Express $199).
- Kept: `getTiersForSource` now includes `express` (pre-existing bug: dashboard/partner list showed the raw slug "express") and a `priority` legacy mapping → "24-Hour filing (retired plan)" at Standard price math, for any draft that picked it while it was live (~1h).
- Evidence: 419 targeted tests (pricing, email, faq, llms, services-pages, provider-prices, landing-*, wizard review, telegram, admin filings), tsc 0, eslint 0, build OK.

## Contracts
- `priority` is NOT a live tier (`isTier("priority") === false`); keep the legacy mapping while any filing may still hold it.

## Open
- If a customer paid for 24-Hour while it was live, check admin for tier "24-Hour filing (retired plan)" and honour/refund the difference manually.
