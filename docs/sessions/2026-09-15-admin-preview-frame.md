# 2026-09-15 — Admin signed-PDF preview "refused to connect"

Owner report: `/admin/filings/<id>/place-signature` showed "www.form5472prep.com refused to connect".
Cause: the page previews the signed PDF in a same-origin `<iframe>` while `next.config.mjs` sent
`X-Frame-Options: DENY` on every path (added 2026-07-25 in the hardening commit), so Chrome refused
to frame the preview. The site itself was up (home 200).

Shipped (5dc3997, architect edit — two config lines): `X-Frame-Options: SAMEORIGIN` plus
`Content-Security-Policy: frame-ancestors 'self'`. Third-party framing stays blocked.
Production headers after deploy:
```
content-security-policy: frame-ancestors 'self'
x-frame-options: SAMEORIGIN
```
Contract: any new admin preview must be same-origin; never loosen `frame-ancestors` beyond 'self'.
Open: none. The owner should reload the place-signature page; the preview loads inside the frame.
