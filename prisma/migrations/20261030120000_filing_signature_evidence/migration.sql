ALTER TABLE "Filing" ADD COLUMN "signerName" TEXT;
ALTER TABLE "Filing" ADD COLUMN "signatureIp" TEXT;
ALTER TABLE "Filing" ADD COLUMN "signatureUserAgent" TEXT;
ALTER TABLE "Filing" ADD COLUMN "signatureConsentVersion" TEXT;
ALTER TABLE "Filing" ADD COLUMN "signedPreparedPdfSha256" TEXT;
