# 2026-10-05 — "Ask a question" form: "Could not send"

**Checkout/branch:** worktree `~/Developer/f5472-wt/askfix`, branch `fix/ask-form` → `main`.
**Owned files:** `src/app/api/ask/route.ts` (+ new `route.test.ts`), `src/lib/email.ts` (sendWebsiteQuestionAdminEmail `replyToVisitor` flag only), this log.

## Incident
A customer (Jose, Altorven Distribution LLC, topic "EIN or ITIN") got "Could not send. Please email support@…" and their question was lost.
- **Cause:** `/api/ask` only checked that the email contains "@". The visitor's address is used as the Reply-To, and Resend rejects the whole send for an invalid Reply-To.
- **Reproduced on production:** `test@altorven` (no TLD) and "a@x.com, b@x.com" both returned 500. A valid address returned 200.

## What shipped
- **Validation:** the address must look like name@domain.tld, with no spaces or list separators. Otherwise the form returns a 400 telling the visitor to check their address; both ContactForm and ChatWidget already display `data.error`.
- **Retry:** if the send still fails, it retries once WITHOUT the visitor as Reply-To (their address stays in the body), so the question isn't lost. Only a double failure shows the old fallback.
- **Verified:** vitest suite (see commit) and a new route test (7 cases).

## Open (owner)
- Jose's original question never reached us, and they say an earlier email thread went unanswered. Search the support@ inbox for "Altorven" and reply.
