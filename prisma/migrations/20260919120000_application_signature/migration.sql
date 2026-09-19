-- AlterTable
ALTER TABLE "EinApplication" ADD COLUMN "preparedPdfKey" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "preparedPdfSha256" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "preparedPdfUploadedAt" TIMESTAMP(3);
ALTER TABLE "EinApplication" ADD COLUMN "signatureRequestedAt" TIMESTAMP(3);
ALTER TABLE "EinApplication" ADD COLUMN "signaturePngKey" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signedAt" TIMESTAMP(3);
ALTER TABLE "EinApplication" ADD COLUMN "signerName" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signatureIp" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signatureUserAgent" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signatureConsentVersion" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signedDocSha256" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signedPdfKey" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "signedPdfAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ItinApplication" ADD COLUMN "preparedPdfKey" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "preparedPdfSha256" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "preparedPdfUploadedAt" TIMESTAMP(3);
ALTER TABLE "ItinApplication" ADD COLUMN "signatureRequestedAt" TIMESTAMP(3);
ALTER TABLE "ItinApplication" ADD COLUMN "signaturePngKey" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signedAt" TIMESTAMP(3);
ALTER TABLE "ItinApplication" ADD COLUMN "signerName" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signatureIp" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signatureUserAgent" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signatureConsentVersion" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signedDocSha256" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signedPdfKey" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "signedPdfAt" TIMESTAMP(3);
