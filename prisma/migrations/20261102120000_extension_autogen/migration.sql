-- Form 7004 auto-generation + admin-triggered IRS fax (additive, nullable / defaulted).
-- AlterTable
ALTER TABLE "ExtensionApplication" ADD COLUMN     "faxAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "faxConfirmationKey" TEXT,
ADD COLUMN     "faxDeliveredAt" TIMESTAMP(3),
ADD COLUMN     "faxJobId" TEXT,
ADD COLUMN     "faxSentAt" TIMESTAMP(3),
ADD COLUMN     "faxStatus" TEXT,
ADD COLUMN     "generatedAt" TIMESTAMP(3),
ADD COLUMN     "generatedPdfKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionApplication_faxJobId_key" ON "ExtensionApplication"("faxJobId");
