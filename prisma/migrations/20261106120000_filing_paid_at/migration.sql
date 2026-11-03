-- PR 8 (docs/reviews/2026-10-30-system-update-plan.md): when payment was first
-- recognised. Additive and nullable; null renders as "—" in the review queue.
ALTER TABLE "Filing" ADD COLUMN "paidAt" TIMESTAMP(3);

-- Backfill from the earliest change-log row that moved the status to PAID.
-- Only the admin "setStatus" action logs status changes (logFilingChange,
-- field 'status', afterJson = JSON string "PAID"); Stripe/return-page payments
-- were never logged, so most legacy orders stay null (owner may run a
-- Stripe-API backfill later; optional).
UPDATE "Filing" AS f
SET "paidAt" = s."firstPaidAt"
FROM (
  SELECT "filingId", MIN("changedAt") AS "firstPaidAt"
  FROM "FilingChangeLog"
  WHERE "field" = 'status' AND "afterJson" #>> '{}' = 'PAID'
  GROUP BY "filingId"
) AS s
WHERE f."id" = s."filingId" AND f."paidAt" IS NULL;
