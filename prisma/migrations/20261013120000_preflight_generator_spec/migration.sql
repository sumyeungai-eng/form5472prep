-- Generator 2.3.0 (docs/reviews/2026-10-13-preflight-generator-spec.md).
-- Additive, nullable only: existing rows keep NULL, which means "not set".

-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "paidPreparerMode" TEXT,
ADD COLUMN "irsMayDiscussWithPreparer" TEXT;

-- AlterTable
ALTER TABLE "FilingYearData" ADD COLUMN "rcsAdminNarrative" TEXT,
ADD COLUMN "rcsLearnedOn" DATE,
ADD COLUMN "rcsSmallCorpParagraph" BOOLEAN;
