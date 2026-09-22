-- Wave 4: owner-paid costs and explicit zero confirmations. Additive and nullable.
ALTER TABLE "FilingYearData" ADD COLUMN "ownerPaidCosts" JSONB;
ALTER TABLE "FilingYearData" ADD COLUMN "zeroConfirmations" JSONB;
