-- Add supersede markers for abandoned drafts made redundant by a later paid filing.
ALTER TABLE "Filing"
ADD COLUMN "supersededAt" TIMESTAMP(3),
ADD COLUMN "supersededById" TEXT;

CREATE INDEX "Filing_status_supersededAt_idx" ON "Filing"("status", "supersededAt");

UPDATE "Filing" AS d
SET
    "supersededAt" = NOW(),
    "supersededById" = (
        SELECT p."id"
        FROM "Filing" AS p
        WHERE p."id" <> d."id"
          AND p."status" IN ('PAID', 'PDF_GENERATED', 'SIGNATURE_PENDING', 'SIGNED_UPLOADED', 'FAXED', 'CONFIRMED')
          AND (
              (d."userId" IS NOT NULL AND d."userId" = p."userId")
              OR (d."userId" IS NULL AND d."sessionId" IS NOT NULL AND d."sessionId" = p."sessionId")
          )
          AND (
              d."llcName" IS NULL
              OR btrim(d."llcName") = ''
              OR lower(btrim(d."llcName")) = lower(btrim(p."llcName"))
          )
          AND (cardinality(d."taxYears") = 0 OR d."taxYears" <@ p."taxYears")
        ORDER BY p."updatedAt" DESC, p."id" DESC
        LIMIT 1
    )
WHERE d."status" = 'DRAFT'
  AND d."supersededAt" IS NULL
  AND EXISTS (
      SELECT 1
      FROM "Filing" AS p
      WHERE p."id" <> d."id"
        AND p."status" IN ('PAID', 'PDF_GENERATED', 'SIGNATURE_PENDING', 'SIGNED_UPLOADED', 'FAXED', 'CONFIRMED')
        AND (
            (d."userId" IS NOT NULL AND d."userId" = p."userId")
            OR (d."userId" IS NULL AND d."sessionId" IS NOT NULL AND d."sessionId" = p."sessionId")
        )
        AND (
            d."llcName" IS NULL
            OR btrim(d."llcName") = ''
            OR lower(btrim(d."llcName")) = lower(btrim(p."llcName"))
        )
        AND (cardinality(d."taxYears") = 0 OR d."taxYears" <@ p."taxYears")
  );
