# 2026-11-04 — Fax receipt "on-time filing" wording

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/chat-receipt-wording` (`fix/chat-receipt-wording`, pushed to `origin/main`) | `src/app/api/chat/route.ts`, this log |

## Trigger
A late (reasonable-cause) customer asked us to post a copy of their faxed
filing to the IRS. Their stored IRS Fax Transmission Receipt (generated
2026-09-24) said it "constitutes proof of on-time filing". That contradicts a
late return's own cover letter and reasonable-cause statement.

## Findings
- The receipt template (`src/lib/pdf/faxReceipt.ts`) was already corrected on
  2026-09-30 (`2f7f531`). It now reads "evidence of when the filing reached
  the IRS…". Receipts generated before then, and still in storage, keep the
  old sentence. They were not regenerated.
- The chat assistant facts (`api/chat/route.ts`) still said we "email a
  timestamped IRS Fax Transmission Receipt as proof of on-time filing".

## What shipped
- Chat facts: the receipt is saved in the portal and proves when the package
  reached the IRS fax line. It is not an IRS acceptance, and not proof of
  on-time filing for a late return.
- Outside the repo, for the one customer: a receipt regenerated locally with
  the current template and identical facts, merged into their IRS mail
  package (owner's Downloads). The stored receipt in R2 is unchanged.

## Open
- Owner-gated: whether to regenerate stored receipts made before 2026-09-30
  for late filers.
- Blog copy calls the receipt "proof of timely filing" in
  `content/blog/amazon-fba-foreign-sellers-form-5472.md` and
  `content/blog/form-5472-uk-residents-us-llc.md`. That holds for timely
  filers. Left unchanged.
