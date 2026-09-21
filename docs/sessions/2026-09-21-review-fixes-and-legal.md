# 2026-09-21 — Codex review fixes, partner link security, legal pages

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned every path in
the commits listed below. NOT touched: `content/blog/**` (blog agent), `src/lib/wizard/**` (another
session's orphaned directory, untracked), `public/email/*`, root PNGs, `docs/marketing/*`.

## What shipped
A Codex adversarial review over the previous five days (base `3d0f289`, 36 commits, 304 files) found
five issues. All five are fixed.

**1. CRITICAL, partner links handed out customer logins** (`git log --grep "no longer hand out"`).
`client-link`, `sign-link`, `send-client-link` and `send-sign-link` called `bindFilingToEmail(email)`
then `makeMagicLink(user.id)`, so a partner could type ANY customer's email and receive an
account-wide login link; redeeming it set `fs_user` and exposed that customer's other filings and
applications. Replaced with filing-scoped invites: `src/lib/filingInvite.ts` (random token, only its
sha256 stored on the Filing row, 14-day expiry, scopes "edit" and "sign"), redeem route
`src/app/invite/[token]/route.ts` (sets the `fs_invite` cookie, NEVER a session), and
`hasFilingInviteAccess` in `src/lib/session.ts`. Consumers pass the scope they need: edit page, filing
PATCH, documents/statements/dissolution/extension routes use "edit"; sign page and sign API use
"sign". The partner-impersonation guard is skipped only when access came from a "sign" invite.
Migration `20260921150000_filing_invite`.

**2 and 3. Signature storage integrity** (`git log --grep "signature storage integrity"`).
Stamped output now goes to `signedKeyFor(type, id, docSha)` and the DB pointer is published only
after the conditional claim; a losing claim deletes the object it just wrote and never touches the
published key. `storePreparedPdf` uploads to `preparedKeyFor(type, id, sha)` FIRST, then does one
update that sets the prepared columns and nulls the signature columns together, then deletes the old
objects. A failed upload can no longer destroy the audit record.

**4. Partner archive.** Unarchive works at any status; archiving is DRAFT-only and atomic
(`updateMany` on status); the Stripe webhook's paid-claim also sets `partnerHidden: false`, so paying
through an old invite restores the filing to the partner's dashboard.

**5. Save and exit.** `FilingWizard` is now a `forwardRef` exposing `saveCurrentStep()`, wired through
`FilingWizardV3` into `SaveForLater`. The control saves the current step (entity, owner, years) via the
existing PATCH before navigating or emailing the link, and reports failure instead of losing work.

**Legal and positioning** (`git log --grep "state the accountant review"`). Owner decision 2026-09-21:
a qualified accountant reviews every filing, but the business is NOT a licensed CPA firm. Every
"not a CPA firm / no tax advice" sentence in `src/**` was replaced with
`Every filing is reviewed by a qualified accountant before it is submitted. We prepare and submit the
forms from the information you give us; we do not provide personalised tax planning.` (short form in
banners; a scope note on educational surfaces). Terms gained electronic-signature disclosures (E-SIGN
style: consent, meaning of the signature, paper copy, withdrawal, system requirements, records),
refunds and cancellations, orders we may decline, turnaround times, indemnity, disputes (Wyoming
venue, class-action waiver, consumer-rights carve-out), price changes, and the services we rely on.
Privacy now discloses passport numbers, dates of birth, US tax numbers, uploads, signature images with
their IP/browser/consent-version, received faxes and support messages, plus marketing opt-out, breach
notification and SCCs. Data retention covers signatures, faxes and uploads. New `/cookies` page,
linked in the footer.

Verified: tsc clean; vitest 531/531; `next build` 457/457 pages from a clean `.next`; all six legal
pages return 200 from a local production server; `grep -rn "not a CPA firm\|tax advice" src` returns
nothing. Deploy evidence at the bottom.

## Contracts
- Partner link endpoints must NEVER mint a magic link. `makeMagicLink` is for the customer's own
  portal only. A grep for `makeMagicLink` under `src/app/api/partner` must stay empty.
- Every new signature or stamped PDF goes to a content-addressed key. Publish the DB pointer only
  after the conditional claim, then delete the superseded object.
- `content/blog/**` still contains the old "not a CPA firm" wording in about 110 posts. The blog agent
  owns those files. They must be updated by that agent, not here.
- The site must never claim to be a CPA firm or licensed, and must keep saying it does not provide
  personalised tax planning.
- `src/lib/legalPages.test.ts` asserts the legal pages keep their new sections; update it deliberately.

## Open
Owner-gated:
- **Invites already sent under the old scheme still work for up to 14 days.** Revoking them means
  rotating `SESSION_SECRET` in Vercel, which signs everyone out and breaks outstanding sign-in links.
- **No legal entity name or postal address exists anywhere in the codebase.** The pages say
  "Form5472 Prep" and give support@form5472prep.com. A real entity and address should be added.
- Home-page workflow section: drafted in chat, not built, was waiting on this same accountant answer.
- Consumer-facing wording of refunds should be checked by a lawyer, as should the E-SIGN section and
  the class-action waiver.
Follow-ups:
- Blog posts still carry the old disclaimer (see Contracts).
- "Save and exit" on the reasonable-cause and transactions steps still saves nothing extra; their form
  state lives in components outside that lane's scope.
- No cookie consent banner: the cookies page describes what is set, which is not the same as consent.

## Lane notes
Two parallel lanes both edited `src/app/(marketing)/layout.tsx`; the merge was clean but verify shared
files when lanes overlap. A lane's `npm run build` raced another lane's `.next` and failed
spuriously; a clean `rm -rf .next` build is the reliable signal. `git add -A src` swept in another
session's untracked `src/lib/wizard/` directory: always stage explicit paths.

## Incident: /start crashed for signed-out visitors (2026-09-21, fixed in ba362d0)
The Google-button placeholder added on 2026-09-20 was a React child of the element that Google's
`renderButton` empties. Google removed the node, React then threw `removeChild` and replaced the whole
page with "Application error". Every signed-out visitor to /start saw it from that deploy until the fix.
Fix: `GoogleLoginButton` gives Google an element React never renders into; the placeholder is a sibling.
Contract: never render React children inside an element a third-party script mutates.
Why it slipped: the lane verified /start with curl, which returns server HTML and never runs client
scripts. For any client component, verify in a real browser (production build) and read the console.
