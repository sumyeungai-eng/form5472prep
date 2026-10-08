# Session log — 2026-10-08 · Google Ads optimisation

**Worktree:** `~/Documents/Codex/form5472-tools` · **Branch:** `tools/commercial-assets` (== `origin/main`)
**Scope:** Google Ads only (205-421-5211 / campaign 23875225330). No site code changed.

## Shipped (in Google Ads)
- Confirmed delivery after the Session 14 targeting fix: 82 impr / 3 clicks / $17.55 on day one.
- Paused 3 policy-disapproved sitelinks + "Partner Program"; added 3 tool sitelinks (2 Eligible, 1 in review).
- Attached the "Service catalog" structured snippet; added a price asset ($149 / $199 / $99) from `pricing.ts`.
- Full detail + evidence: `docs/marketing/google-ads-diagnosis-2026-08-16.md`, Session 15.

## Contract
- Ad/sitelink/price destinations must never be `/pricing`, `/ein`, `/itin` or `/blog`: their EIN/ITIN
  content triggers Google's "Government Documents and Official Services" disapproval.
- Ad prices must come from `src/lib/pricing.ts`; update the price asset whenever prices change.

## Open (owner)
- Three sitelink claims to confirm or fix (see Session 15 "Owner to decide").
- ~2026-10-14: search terms, per-country spend, AG3 ad strength, conversions vs CPC.

## Lane notes
- The Ads asset grid is virtualised: read it in scroll steps; one-shot JS loops freeze the renderer.
- Sitelink form panels re-render on expand; re-find refs and verify every input value before saving.
- Price/structured-snippet "chips" on the assets page are filters, not create buttons; use the blue + menu.
