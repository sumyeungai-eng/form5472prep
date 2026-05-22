-- AlterTable
ALTER TABLE "Filing" ADD COLUMN     "validationCheckedAt" TIMESTAMP(3),
ADD COLUMN     "validationIssuesJson" JSONB,
ADD COLUMN     "validationStatus" TEXT;
