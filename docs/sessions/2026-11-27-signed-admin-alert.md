# 2026-11-27: Admin notification when a customer signs

**Owner request:** "send admin notification if user signed on the digital form".

## Ownership
| Worktree | Branch | State |
|---|---|---|
| `~/Developer/f5472-wt/sign-alert` | `feat/signed-admin-alert` | merged to main |

## What shipped (`f07d1c7`, `f8b7736`)
- **Form 5472** (`/api/filings/[id]/sign`). After a successful conditional DB write the route sends two alerts:
  - Admin email `sendFilingSignedAdminEmail` (kind `admin_filing_signed`) to `env.adminEmail`. Subject: `[Filing signed|re-signed] <LLC> — <years>`. The email contains the signer name, the partner name and links to `/admin/filings/<id>` and `/place-signature`.
  - Telegram, with no customer-entered text: `✍️ Form 5472 signed|re-signed`, then `Tax years`, `Ref: <8 chars>` and the admin link.
- **EIN/ITIN** (`customerSignature.ts`). The existing admin email is unchanged. A new Telegram alert is added: `✍️ EIN|ITIN application signed|re-signed`, `Ref` and the link.
- **Delivery.** Both paths send through `notifyAdminBestEffort` (`src/lib/adminNotify.ts`): email and Telegram run in parallel with a 4 s cap and never throw. A slow or failed notification can never fail or delay a signature beyond about 4 s.
- **No notification** on 409 or other no-write paths, or on admin-side signing (`upload-signed`, place-signature).
- **Verification.** Full vitest: 5299 passed. `tsc` clean. `next build` exit 0.
- **Reviews.** Two independent reviews (Codex + Opus) over two rounds. Final verdict from both: SHIP.

## Contracts
- Telegram alerts never carry customer-entered text (LLC/business name can be a personal name, email or tax ID). Details go in the admin email only.
- Admin email kinds must start with `admin_` so the partner mail guard leaves them alone.
- Notifications must go through `notifyAdminBestEffort` (or equivalent), never awaited unbounded inside a customer request.

## Open (follow-ups, P3)
- A simultaneous double-submit can send two alerts. Deduping needs a DB claim column.
- If Resend takes more than 4 s, Vercel may freeze the function after the response and the email can be lost. Only "[admin notify] timed out" is logged.
- "Re-signed" only appears when the same released PDF is signed twice. A corrected-PDF upload clears the signature, so the next signature reads "signed".
- The EIN path still selects `llcName`, which is now unused.
- The existing paid-order Telegram (`telegram.ts`) sends `llcName` and the customer email, against the same no-PII rule. This predates this work.
