# 2026-09-18 — Partner portal: client intake links, save for later, durable access

Owner asked for "more necessary functions" on `/partner`, then for a back-to-dashboard button on
partner-opened filing pages, a save-for-later button on the filing form, and a way for a partner to
hand the form and document upload to their client.

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`, commit `c9486b9` (30 files).
Schema + 2 migrations; `src/lib/{session,email,saveForLater}.ts`; `src/lib/partner/{filingList,clientInvite}.ts`
(+tests); `src/components/{PartnerFilingBar,wizard-v3/SaveForLater}.tsx`; `src/components/wizard-v3/FilingWizardV3.tsx`;
`src/app/partner/{page,PartnerFilingRow,filings/new/route}`; `src/app/api/partner/filings/[id]/{archive,sign-link,client-link,send-client-link}`;
`src/app/api/filings/[id]/{save-for-later,sign}`; `src/app/(app)/filings/[id]/{edit,page,confirmation,sign}`;
`src/app/admin/filings/page.tsx`; `src/app/(marketing)/partners/page.tsx`.

## What shipped
- **Client intake link (new)** — on a DRAFT row the partner can "Invite client to fill in" (emails
  `sendClientIntakeEmail`) or "Copy client link". Both bind the client's email to the filing, mint a
  7-day magic link to `/filings/{id}/edit` and stamp `clientInviteSentAt` (shown as "Client invited …").
  Guard `checkClientInvite`: wrong partner 404; not DRAFT 409; already signed 409.
- **Dashboard** — search (LLC or client email), status filter, pagination at 25/page replacing the
  200-row cap, header counts from one `groupBy` over the whole book, archive/restore for drafts
  (`Filing.partnerHidden`), "Copy sign link" beside the existing send.
- **Durable partner access** — `getOwnedFiling` gained a `partnerId` branch, so a partner-created
  filing opens from any device. `partner/filings/new` no longer stamps the partner's `sessionId`:
  that stamp meant a later `/start` in the same browser could hand the partner ANOTHER client's draft
  (advisor finding; the reason `supersedeDrafts` special-cases partner rows).
- **Signing stays with the client** — `/filings/[id]/sign` page and POST refuse a partner who is not
  the bound user (403 / message card back to `/partner`).
- **Back-to-dashboard bar** — `PartnerFilingBar` on the edit, detail and confirmation pages whenever
  `partnerOwnsFiling` matches. Customers see no change.
- **Save for later** — wizard control above the form on every step: partner → `/partner`, bound user →
  `/dashboard`, anonymous → inline panel that emails a resume link (`sendResumeFilingEmail`, new copy;
  the old `sendMagicLinkEmail` text was about downloading PDFs and signing, wrong for a draft).
- **Admin** — filings list gains a Partner column and an All/Partner/Direct filter preserving other
  filters. `/partners` FAQ no longer says white-label is not live (it is: brand name + reply-to).

Verified: 334/334 vitest (33 new), tsc clean, production build clean; deploy `form5472prep-…` Ready with
both migrations applied per the build log; `/partners` copy live; `/partner` still gates to sign-in.

## Contracts
- Partner ownership is `partnerId` only. Never stamp a partner's `sessionId` on a client filing.
- Only the bound client may sign. Any new signing surface must repeat that check.
- Client intake link is DRAFT-only; after payment the sign link is the right tool.
- `partnerHidden` is partner-side archive for drafts only, mirroring `adminHidden`.
- Cross-partner isolation: every partner route loads the filing and compares `partnerId` before acting.

## Open (owner-gated)
- Nothing blocking. Unverified by me because they need a partner login: the dashboard controls, the
  intake/sign link emails, and the bar. Worth one pass with a real partner account.
- `plaid/*` lets a partner link a bank account under a client filing (pre-existing, advisor flagged).
- Partner filings still have no volume pricing or invoicing; that stays an email conversation.

## Lane notes
codex out of credits until 2026-09-19; grok CLI unauthenticated. All six lanes were Claude subagents,
so architect diff review was the only cross-check. One read-only agent searched the WRONG checkout
("Claude work/form5472") and reported the partner program did not exist — always pin the repo path and
demand an `ls` proof line in the spec.
