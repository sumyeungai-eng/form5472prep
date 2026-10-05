# 2026-10-05 — Trustpilot review invitations on fax confirmation

**Checkout/branch:** worktree `~/Developer/f5472-wt/trustpilot`, branch `feat/trustpilot-afs` → `main`.
**Owned files:** `src/lib/email.ts` (trustpilotInvite + sendFaxDeliveredEmail), `src/lib/trustpilotInvite.test.ts`, `src/lib/fax/finalize.ts` (one flag), `src/app/(marketing)/privacy/page.tsx` (one paragraph), this log.

## What shipped
- **The BCC:** the owner supplied the Trustpilot Automatic Feedback Service (AFS) address `form5472prep.com+70ae06b610@invite.trustpilot.com`. It's an address to BCC, not a link. It's now BCC'd on the automatic "Your filing was delivered to the IRS" email (`fax/finalize.ts`, `reviewInvite: true`), so Trustpilot sends the customer one review invitation.
- **Structured snippet:** the email HTML carries a `<script type="application/json+trustpilot">` block with `recipientEmail`, `recipientName` and `referenceId` (the filing id). `<` is escaped.
- **Not invited:**
  - Admin "Resend fax confirmation", to avoid double invites.
  - White-label partner filings (`brand` set), since those are the partner's customers.
- **Kill switch:** set the Vercel env `TRUSTPILOT_AFS_BCC=""` to turn invitations off; any other value overrides the address.
- **Privacy policy:** now says Trustpilot may receive the name, email and order reference to send one invitation.
- **Verified:** vitest 1864/1864, including 4 new tests (snippet shape, partner skip, kill switch, script-tag escape). tsc is clean.

## Open (owner)
- **Trustpilot Business settings:** in Business → Get reviews → Automatic Feedback Service, check the invitation delay, template and sender name. The first real delivered filing will show whether invitations arrive.
