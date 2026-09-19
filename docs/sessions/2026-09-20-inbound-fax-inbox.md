# 2026-09-20 — Inbound fax receiving + admin fax inbox

## Ownership
Checkout `/Users/sumyeung/Documents/Codex/form5472`, branch `main`. This session owned every path in
the "receive faxes" commit (see `git log --grep "receive faxes"`). Not touched: `content/blog/**`
(blog agent), untracked `public/email/*`, root PNGs, `docs/marketing/*`, `src/lib/wizard/`.

## What shipped
Owner request: "add a function to receive fax and admin could view received faxed documents in the
admin portal". Main use: the IRS faxes EIN confirmation letters back to our number after an SS-4.
- **Webhook**: `src/app/api/telnyx-webhook/route.ts` gained an inbound branch placed BEFORE the Filing
  lookup. `fax.received` goes to `ingestInboundFax` (`src/lib/inboundFax.ts`); other
  `direction: "inbound"` events return 200 without touching filings. Outbound handling unchanged.
  `maxDuration = 60` added (download happens inside the request).
- **Ingest**: upsert `ReceivedFax` by `telnyxFaxId` (unique), download `media_url` (https only, 20 s
  timeout, 25 MB cap, must start with `%PDF-`), store at `faxes/inbound/<id>.pdf`, conditional
  `updateMany(pdfKey: null)` so the admin email/push fire exactly once. Download failure writes
  `downloadError` and returns 500 so Telnyx retries.
- **Admin**: `/admin/faxes` (Unread / All / Archived tabs, 50 per page), `/admin/faxes/[id]` (PDF
  iframe, open/download, link to EIN/ITIN/Form 5472 via search, note, mark unread, archive, delete).
  Nav item "Received faxes" with the `unreadFaxes` badge. `LinkedFaxes` card on the EIN, ITIN and
  filing admin pages. Email `sendFaxReceivedAdminEmail` (no attachment, personal data).
- **Migration** `20260920090000_received_fax`: new table, three nullable FKs ON DELETE SET NULL.

Verified: tsc clean, vitest 450/450, `next build` 434/434 pages with the new routes; advisor
pre-ship review found 3 defects (mark-unread no-op, missing maxDuration, metadata query before
auth), all fixed. Deploy evidence at the bottom.
NOT verified: a real inbound fax. No fax has been received end to end.

## Contracts
- Inbound ingestion is OFF in production until `TELNYX_PUBLIC_KEY` is set (`inboundFaxAllowed`).
  Do not remove this: the webhook skips signature checks when the key is missing, and an unsigned
  `fax.received` would let anyone make the server download a URL and create inbox rows.
- The inbound branch must stay above the Filing lookup, and must never let an inbound event reach
  the outbound status code.
- A fax links to at most one record (`linkData`). Link targets are verified to exist.
- The detail page marks a fax read on render; "Mark unread" navigates back to the inbox for that
  reason. The PDF route does NOT mark read.
- Client components must not import `src/lib/inboundFax.ts` (it imports prisma and storage).

## Open
Owner-gated:
- **Set `TELNYX_PUBLIC_KEY`** in Vercel production (Telnyx portal public key, base64), then redeploy.
  Until then incoming faxes are ignored, and the inbox shows an amber notice. This also closes the
  existing gap where outbound `fax.delivered`/`fax.failed` webhooks are accepted unsigned.
- **Enable inbound on the number**: in the Telnyx portal, the fax number must accept inbound faxes on
  the fax application whose webhook is `https://www.form5472prep.com/api/telnyx-webhook`.
- **Test**: send one fax to the number and check `/admin/faxes`. Confirm in Telnyx webhook debugging
  that the event is `fax.received` with `media_url` (the advisor believes so but flagged uncertainty).
- Inbound per-page pricing on Telnyx was not checked.
Follow-ups:
- Retention: received faxes contain personal data and are only deleted manually. Add them to any
  future retention sweep.
- No "retry download" button when `downloadError` is set and Telnyx has stopped retrying.

## Lane notes
One codex-implementer lane built everything; it guarded a production query with `?.` only to keep an
old test mock passing. Fixed by adding the mock to `src/lib/admin/counters.test.ts` instead. Watch
for production code bent to fit tests.
