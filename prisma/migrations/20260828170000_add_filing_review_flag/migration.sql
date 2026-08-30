-- Internal staff review coordination, independent of the filing status.
ALTER TABLE "Filing" ADD COLUMN "inReview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "reviewStartedAt" TIMESTAMP(3),
ADD COLUMN "reviewedBy" TEXT;
