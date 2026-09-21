-- Wave 3 questionnaire fields. Additive and nullable only.
ALTER TABLE "Filing" ADD COLUMN "llcMemberCount" INTEGER;
ALTER TABLE "Filing" ADD COLUMN "ownerHasFtin" BOOLEAN;
ALTER TABLE "Filing" ADD COLUMN "ownerNoPostalCode" BOOLEAN;
ALTER TABLE "Filing" ADD COLUMN "llcAddressIsRegisteredAgentOnly" BOOLEAN;
ALTER TABLE "Filing" ADD COLUMN "priorForm5472Filed" TEXT;
ALTER TABLE "Filing" ADD COLUMN "hasUsSourceIncome" BOOLEAN;
ALTER TABLE "Filing" ADD COLUMN "usTaxWithheld" BOOLEAN;

ALTER TABLE "FilingYearData" ADD COLUMN "nonCashTransfers" JSONB;
ALTER TABLE "FilingYearData" ADD COLUMN "rcsWhyMissed" TEXT;
ALTER TABLE "FilingYearData" ADD COLUMN "rcsWhenLearned" TEXT;
ALTER TABLE "FilingYearData" ADD COLUMN "rcsNoIrsNoticeConfirmed" BOOLEAN;
