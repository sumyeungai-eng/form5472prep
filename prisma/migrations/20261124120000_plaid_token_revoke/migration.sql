-- AlterTable
ALTER TABLE "PlaidConnection" ALTER COLUMN "accessToken" DROP NOT NULL;
ALTER TABLE "PlaidConnection" ADD COLUMN "revokedAt" TIMESTAMP(3);
