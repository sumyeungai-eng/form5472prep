-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "linkedToFilingId" TEXT;

-- CreateIndex
CREATE INDEX "Filing_linkedToFilingId_idx" ON "Filing"("linkedToFilingId");
