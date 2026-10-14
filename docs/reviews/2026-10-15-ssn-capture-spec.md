# Spec: secure SSN capture (2026-10-15)

Owner request: "for customer need to add their SSN, can we add a secure link for them to enter it, or a specific box in the login [portal]".
Context: some foreign owners are former US residents with an SSN; it belongs on Form 5472 lines 4b(1) and 8b(1) ("U.S. identifying number"). Today the wizard has an ITIN field only and staff paste SSNs into "Owner ITIN" by hand; clients send SSNs by email.

## Decisions (orchestrator)
- S1. Both: a box on the client's portal order page AND an admin "Ask client for SSN" button that emails the client a sign-in link straight to that box. The wizard is unchanged (an SSN question there would confuse most customers; never-block-payment rule anyway).
- S2. Encrypted at rest: AES-256-GCM, key from env `PII_ENCRYPTION_KEY` (base64 of 32 random bytes). Stored as a versioned string `v1:<iv>:<tag>:<ciphertext>` (base64url parts). If the key is missing/invalid, the feature degrades gracefully: the portal box says "Secure entry is temporarily unavailable — please contact support" and the admin page says the setting is missing. Nothing else breaks (payment, generation of filings without an SSN).
- S3. Never expose the number: only `last4` + timestamps leave the server for customers/partners; admins see it masked (•••-••-1234) with a "Reveal" action that is admin-only and change-logged (who, when). Never in emails, logs, console output, Telegram/admin notifications, analytics, error messages, change-log before/after (use masked), or the admin v1 (iOS) API (masked there too).
- S4. Client may submit or replace their SSN until the filing is FAXED; after that the API refuses with "This filing has already been sent to the IRS — please contact support." Entering twice (SSN + confirm) catches typos. Validation rejects only impossible numbers (not 9 digits; area 000, 666 or 900-999 — the 9xx range is ITINs, say "That looks like an ITIN — enter it in the ITIN field or contact us"; group 00; serial 0000). Accept dashes/spaces.
- S5. After a client submission: change-log entry (masked), admin notification email WITHOUT the number ("<LLC>: the client added their SSN — regenerate the package"), automatic pre-flight re-run if the existing helper allows it from this context. Admin regenerates/reviews as usual.
- S6. Admin can also type an SSN directly (client sent it by email) through the same encrypted path, change-logged masked.
- S7. Generator: 4b(1)/8b(1) print the decrypted SSN when present, else ownerItin (existing behaviour). Decryption happens server-side in the package-input adapter only. Keep the reference-ID behaviour the same as when an ITIN is present.
- S8. Partner filings: the request email uses the partner brand helper (brandForFiling) like other client emails.

## Schema (additive, nullable)
Filing: `ownerSsnCiphertext String?`, `ownerSsnLast4 String?`, `ownerSsnSubmittedAt DateTime?`, `ownerSsnSubmittedBy String?` ("client" | admin id/label), `ownerSsnRequestedAt DateTime?`.

## Owner-gated
- Set `PII_ENCRYPTION_KEY` in Vercel (Production + Preview) BEFORE relying on the feature: `openssl rand -base64 32`. Losing the key makes stored SSNs unreadable; rotating it needs a re-encrypt step (not built).
