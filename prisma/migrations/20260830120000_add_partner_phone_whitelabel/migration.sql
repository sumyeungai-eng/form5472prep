-- Partner application contact phone and white-label interest.
ALTER TABLE "Partner" ADD COLUMN "phone" TEXT;
ALTER TABLE "Partner" ADD COLUMN "wantsWhiteLabel" BOOLEAN NOT NULL DEFAULT false;
