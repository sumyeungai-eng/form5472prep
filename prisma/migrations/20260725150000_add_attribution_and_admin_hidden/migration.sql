-- First-touch traffic attribution per filing + admin draft archiving.
ALTER TABLE "Filing" ADD COLUMN     "attrSource" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "attrMedium" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "attrCampaign" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "attrReferrer" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "attrLanding" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "adminHidden" BOOLEAN NOT NULL DEFAULT false;

-- The admin list filters DRAFT rows by adminHidden and orders by updatedAt.
CREATE INDEX "Filing_adminHidden_status_idx" ON "Filing"("adminHidden", "status");
