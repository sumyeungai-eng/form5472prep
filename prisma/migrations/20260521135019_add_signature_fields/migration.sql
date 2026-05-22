-- AlterTable
ALTER TABLE "Filing" ADD COLUMN     "signaturePngKey" TEXT,
ADD COLUMN     "signedAt" TIMESTAMP(3);
