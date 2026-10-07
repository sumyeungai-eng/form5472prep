# 2026-10-08 — Paid preparer can sign digitally on the place-signature tool

## Ownership
| Checkout / branch | Files |
|---|---|
| `~/Developer/f5472-wt/preparer-sig` / `preparer-signature` → `origin/main` | `prisma/schema.prisma` (Admin.preparerSignatureKey) + `prisma/migrations/20261008120000_admin_preparer_signature/`, `src/lib/pdf/stampPlacements.ts` (+test), `src/lib/pdf/preparerSignature.ts` (+test, new), `src/app/api/admin/filings/[id]/place-signature/route.ts` (+test, new), `src/app/api/admin/preparer-signature/route.ts` (new), `src/app/admin/filings/[id]/place-signature/{page.tsx,PlaceSignatureClient.tsx}` |

## What shipped
- Owner request: the paid preparer can sign the Form 1120 "Paid Preparer Use Only" box digitally on `/admin/filings/[id]/place-signature`.
- New "Preparer signature" mode (Form 5472 filings only; EIN/ITIN tools unchanged): the signed-in admin draws their OWN signature on a pad (optionally saved to their Admin record for reuse) and places it like the client signature; violet outline so it can't be confused with the client's.
- Server: placement kind `preparerSignature` (only accepted where `allowPreparerSignature`), separate PNG passed to `stampPlacements` (4th arg); drawn PNG validated (PNG magic, ≤1 MB, decodable by sharp); per-filing copy `${filingId}_preparer_signature_<ts>_<rand>.png`; change log `field: "preparer_signature"` with `signedBy`. GET/DELETE `/api/admin/preparer-signature` returns/forgets the caller's own saved signature only.
- Evidence: targeted vitest 65/65 (stampPlacements, preparerSignature, place-signature route, EIN/ITIN adminSignature callers), tsc 0, eslint 0, build OK. Codex review: P2 key collisions + P3 corrupt PNG → fixed; re-check "ship".

## Contracts
- Client signature (`signature`) and preparer signature (`preparerSignature`) are separate images end to end; never swap or reuse one as the other.
- Preparer signatures come only from the signed-in admin (drawn now or their own saved copy). Shared-password sessions (adminId null) can draw but can't save/reuse.
- Preparer name / PTIN / firm details: use Text mode (not automated).

## Open
- Owner: the preparer signing the 1120 should hold a PTIN and fill the preparer fields (Text mode).

## Lane notes
Single lane + Codex review; targeted tests only. Additive schema change (nullable column).
