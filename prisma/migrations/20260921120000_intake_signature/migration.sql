-- AlterTable
ALTER TABLE "EinApplication" ADD COLUMN "intakeSignaturePngKey" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "intakeSignedAt" TIMESTAMP(3);
ALTER TABLE "EinApplication" ADD COLUMN "intakeSignerName" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "intakeSignatureIp" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "intakeSignatureUserAgent" TEXT;
ALTER TABLE "EinApplication" ADD COLUMN "intakeConsentVersion" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "intakeSignaturePngKey" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "intakeSignedAt" TIMESTAMP(3);
ALTER TABLE "ItinApplication" ADD COLUMN "intakeSignerName" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "intakeSignatureIp" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "intakeSignatureUserAgent" TEXT;
ALTER TABLE "ItinApplication" ADD COLUMN "intakeConsentVersion" TEXT;
