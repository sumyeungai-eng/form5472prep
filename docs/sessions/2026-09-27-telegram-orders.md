# 2026-09-27 — Telegram notifications for new paid orders

## Ownership
| Checkout / branch | Owned files |
| --- | --- |
| `~/.codex/worktrees/telegram-order-alerts/form5472`, `codex/telegram-order-alerts` | `src/lib/telegram.ts`, its tests, Stripe webhook route and tests, Prisma notification model/migration, `.env.example`, this log |

The shared canonical checkout has unrelated blog/image/wizard changes; they were not edited or staged.
Base: `6194f33` from `origin/main`.

## Changes
- Send new live paid Form 5472, EIN, and ITIN order summaries to the owner's existing private Telegram chat via `@Luxuryascent_bot`.
- Production-only secret settings: `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, stored as sensitive Vercel environment variables. No token in source, logs, or this document.
- Summary includes service, customer/company, email, amount actually paid, filing years where relevant, and an authenticated admin-page link. No tax ID, DOB, passport, documents, or magic login links.
- A unique database record per order tracks delivery and a one-minute lease prevents concurrent Stripe deliveries from sending duplicate messages.
- Telegram failure requests HTTP 500 only after the existing order fulfillment completes. Stripe retries can send the alert without repeating email/PDF fulfillment. Requests time out after eight seconds; raw provider/network errors are never logged.
- Test-mode and unpaid sessions do not send Telegram alerts. Stale filing sessions and payment IDs not recorded against the order are rejected. Webhook handles delayed payment success as well as paid checkout completion; current checkout configuration uses card payments only.
- New migration only adds `TelegramOrderNotification`; no existing records change. Webhook function duration explicitly allows 60 seconds.

## Verification / release
- Telegram getMe confirmed the provided token and existing private destination. Setup-test message accepted by Telegram (message ID 11); no real order/customer was created.
- TypeScript, scoped ESLint, focused 26-test notification/webhook suite, and full suite (68 files, 791 tests) passed. Production build completed successfully (exit 0). Known unrelated MessagesPanel image warning and local blog database fallbacks remain.
- Release must be via `git push origin main` only. Never CLI production deploy.

## Contracts / limits
- Keep credentials server-only and out of logs. No Telegram webhook receiver is needed.
- Do not replace payment fulfillment deduplication with Telegram delivery state.
- Stripe's automatic retry window supplies retries; a prolonged outage beyond it requires manually resending the affected Stripe event.
- Telegram has no sendMessage idempotency key: an ambiguous timeout after acceptance, or a DB failure after send, can cause a duplicate on retry. Ordinary completed-event redeliveries are deduplicated.
- Never backfill old orders or create a real payment merely to test this feature without a separate user request.

## Open
- Production release and live verification pending below.
