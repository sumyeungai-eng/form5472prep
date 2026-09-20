-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "inviteTokenHash" TEXT;
ALTER TABLE "Filing" ADD COLUMN "inviteScope" TEXT;
ALTER TABLE "Filing" ADD COLUMN "inviteEmail" TEXT;
ALTER TABLE "Filing" ADD COLUMN "inviteExpiresAt" TIMESTAMP(3);
ALTER TABLE "Filing" ADD COLUMN "inviteCreatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Filing_inviteTokenHash_key" ON "Filing"("inviteTokenHash");
