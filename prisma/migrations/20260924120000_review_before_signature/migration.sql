-- Accountant review before customer signature. Additive and nullable.
ALTER TABLE "Filing" ADD COLUMN "reviewApprovedAt" TIMESTAMP(3);
ALTER TABLE "Filing" ADD COLUMN "reviewApprovedBy" TEXT;
