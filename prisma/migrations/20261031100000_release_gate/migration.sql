-- Release gate (PR 1, docs/reviews/2026-10-30-system-update-plan.md):
-- the client sees only the package key staff released.
ALTER TABLE "Filing" ADD COLUMN "reviewApprovedPdfKey" TEXT;

-- D11 backfill: filings already past PDF_GENERATED keep access to the package
-- they are signing or have filed. generatedPdfKey is the client-visible key
-- (an uploaded reviewed PDF repoints it), so it is what gets released.
UPDATE "Filing"
SET "reviewApprovedAt" = now(),
    "reviewApprovedBy" = 'legacy-backfill-2026-10',
    "reviewApprovedPdfKey" = "generatedPdfKey"
WHERE "status" IN ('SIGNATURE_PENDING', 'SIGNED_UPLOADED', 'FAXED', 'CONFIRMED', 'FAILED')
  AND "reviewApprovedAt" IS NULL;

-- Filings already released keep their approval; record which key it covers.
UPDATE "Filing"
SET "reviewApprovedPdfKey" = "generatedPdfKey"
WHERE "reviewApprovedAt" IS NOT NULL
  AND "reviewApprovedPdfKey" IS NULL;
