ALTER TABLE "Partner" ADD COLUMN "whiteLabelEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Partner" ADD COLUMN "brandName" TEXT;
ALTER TABLE "Partner" ADD COLUMN "brandReplyTo" TEXT;
