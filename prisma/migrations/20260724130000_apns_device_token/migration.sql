-- AlterTable
ALTER TABLE "AdminDeviceToken" ADD COLUMN     "apnsEnvironment" TEXT,
ADD COLUMN     "apnsToken" TEXT,
ADD COLUMN     "apnsUpdatedAt" TIMESTAMP(3);
