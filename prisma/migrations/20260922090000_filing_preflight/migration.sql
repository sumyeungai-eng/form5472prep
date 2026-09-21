ALTER TABLE "Filing" ADD COLUMN "llcCountryBusiness" TEXT;
ALTER TABLE "Filing" ADD COLUMN "preflightStatus" TEXT;
ALTER TABLE "Filing" ADD COLUMN "preflightFailures" JSONB;
ALTER TABLE "Filing" ADD COLUMN "preflightWarnings" JSONB;
ALTER TABLE "Filing" ADD COLUMN "preflightCheckedAt" TIMESTAMP(3);
ALTER TABLE "Filing" ADD COLUMN "generatorVersion" TEXT;
ALTER TABLE "Filing" ADD COLUMN "generatorCommit" TEXT;
