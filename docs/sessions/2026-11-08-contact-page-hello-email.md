# 2026-11-08 — Contact page shows hello@ only

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/contact-hello` (`fix/contact-page-hello-email`, pushed to `origin/main`) | `src/lib/contactEmail.ts` (new), `src/app/(marketing)/contact/page.tsx`, `src/app/(marketing)/contact/ContactForm.tsx`, `src/app/(marketing)/layout.tsx`, `src/app/(marketing)/contact/contactEmail.test.ts` (new), this log |

## Owner request
"On the contact us page, only show hello@form5472prep.com, do not show
support@ as we get too many spams."

## What shipped
- New `CONTACT_EMAIL = "hello@form5472prep.com"` in `src/lib/contactEmail.ts`
  (no imports, so the client-side `ContactForm` can use it; `seo.ts` pulls in
  server env and must not be imported client-side).
- Contact page: both visible email links, the form's error and rate-limit
  messages, and the success message now use `CONTACT_EMAIL`. The FAQ answer
  and the success box no longer name a "from support@" sender address.
- Marketing layout footer ("Questions?") shows `CONTACT_EMAIL`. The footer
  renders on every marketing page including /contact, so the contact page
  could not show only hello@ otherwise. This is a **sitewide** footer change.
- `contactEmail.test.ts`: source scan that contact/page.tsx, ContactForm.tsx
  and layout.tsx contain no `support@` / `ORG_EMAIL`.

## Contracts
- `ORG_EMAIL` (`src/lib/seo.ts`, support@) is unchanged. It feeds the
  site-wide Organization JSON-LD, the about page, compare page and more.
- Staff still reply from the support@ mailbox; the page no longer says so.

## Open
- Owner-gated: `support@` is still in the page source of /contact through the
  Organization structured data (`organizationNode()`), and is visible on the
  about, compare, privacy, terms, cookies, security, data-retention,
  editorial-policy, press, EIN/ITIN/7004 apply, partners and form-5472-filing
  pages, in the chat widget and in the wizard pre-flight step. Scrapers can
  still harvest it from those. Changing `ORG_EMAIL` itself would fix most of
  that in one line, but it also changes the structured data sitewide.
- Owner-gated: confirm hello@form5472prep.com is a working mailbox that
  someone reads. It appears nowhere else in the repo.
