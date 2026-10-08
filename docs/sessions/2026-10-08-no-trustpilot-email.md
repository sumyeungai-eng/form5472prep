# 2026-10-08 — Trustpilot invitations removed from automatic emails

**Checkout/branch:** worktree `~/Developer/f5472-wt/no-tp`, branch `fix/no-trustpilot-email` → `main`.
**Owned files:** `src/lib/fax/finalize.ts` (one flag), `src/app/(marketing)/privacy/page.tsx` (one paragraph), this log, REPO-STATE index line.

## What shipped
- Owner request: "remove trust pilot review from auto sending emails".
- `fax/finalize.ts` no longer passes `reviewInvite: true` to `sendFaxDeliveredEmail`, so the automatic "delivered to the IRS" email has no Trustpilot AFS BCC and no `application/json+trustpilot` snippet. That was the only call site (admin resend never invited).
- Privacy policy: removed the paragraph saying Trustpilot receives name/email/order reference for an invitation.
- Kept: the `trustpilotInvite` helper + its tests (unused; re-enable by passing `reviewInvite: true` again and restoring the privacy paragraph), the in-app "Review us on Trustpilot" widget on the filing page, the public Trustpilot profile links and `sameAs`.
- Verified: vitest `src/lib/fax` + `trustpilotInvite` 83/83; tsc clean for touched files.

## Open
- Owner: optionally switch off Automatic Feedback Service in Trustpilot Business so nothing is sent if the BCC address is ever reused.

## Reversed the same day
Owner: "bring back trust pilot auto send review email". `finalize.ts` passes `reviewInvite: true` again and the privacy paragraph is restored, byte-identical to before `24f43cb`. Behaviour is back to `docs/sessions/2026-10-05-trustpilot-invites.md`: one AFS BCC on the automatic delivered email; partner filings and admin resends excluded; kill switch `TRUSTPILOT_AFS_BCC=""`.
