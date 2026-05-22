-- AlterTable
ALTER TABLE "Filing" ADD COLUMN     "aiHandoff" TEXT,
ADD COLUMN     "aiTurnsUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FilingChangeLog" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilingChangeLog_filingId_changedAt_idx" ON "FilingChangeLog"("filingId", "changedAt");

-- AddForeignKey
ALTER TABLE "FilingChangeLog" ADD CONSTRAINT "FilingChangeLog_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
