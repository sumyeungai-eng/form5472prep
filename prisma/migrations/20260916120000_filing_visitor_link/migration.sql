-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "visitorId" TEXT;

-- CreateIndex
CREATE INDEX "Filing_visitorId_idx" ON "Filing"("visitorId");
