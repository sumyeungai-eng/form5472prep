ALTER TABLE "Message" ALTER COLUMN "filingId" DROP NOT NULL;
ALTER TABLE "Message" ADD COLUMN "einApplicationId" TEXT;
ALTER TABLE "Message" ADD COLUMN "itinApplicationId" TEXT;
CREATE INDEX "Message_einApplicationId_createdAt_idx" ON "Message"("einApplicationId", "createdAt");
CREATE INDEX "Message_itinApplicationId_createdAt_idx" ON "Message"("itinApplicationId", "createdAt");
ALTER TABLE "Message" ADD CONSTRAINT "Message_einApplicationId_fkey" FOREIGN KEY ("einApplicationId") REFERENCES "EinApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_itinApplicationId_fkey" FOREIGN KEY ("itinApplicationId") REFERENCES "ItinApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
