-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('DRAFT', 'PAID', 'PDF_GENERATED', 'SIGNATURE_PENDING', 'SIGNED_UPLOADED', 'FAXED', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filing" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "status" "FilingStatus" NOT NULL DEFAULT 'DRAFT',
    "tier" TEXT NOT NULL,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "llcName" TEXT,
    "llcEin" TEXT,
    "llcAddress" TEXT,
    "llcCity" TEXT,
    "llcState" TEXT,
    "llcZip" TEXT,
    "llcCountry" TEXT NOT NULL DEFAULT 'USA',
    "llcDateIncorporated" TIMESTAMP(3),
    "llcBusinessActivity" TEXT,
    "llcBusinessCode" TEXT,
    "ownerName" TEXT,
    "ownerAddress" TEXT,
    "ownerCountryCitizenship" TEXT,
    "ownerCountryTaxResidence" TEXT,
    "ownerCountryBusiness" TEXT,
    "ownerFtin" TEXT,
    "ownerItin" TEXT,
    "ownerReferenceId" TEXT,
    "taxYears" INTEGER[],
    "isDiirsp" BOOLEAN NOT NULL DEFAULT false,
    "reasonableCauseNarrative" TEXT,
    "generatedPdfKey" TEXT,
    "signedPdfKey" TEXT,
    "faxJobId" TEXT,
    "faxStatus" TEXT,
    "faxConfirmationKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Filing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilingYearData" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "taxYear" INTEGER NOT NULL,
    "totalAssetsYearEnd" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "contributions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "distributions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "reportableTransactions" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "FilingYearData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatement" (
    "id" TEXT NOT NULL,
    "filingYearDataId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "bankProvider" TEXT,
    "parseResult" JSONB,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FilingYearData_filingId_taxYear_key" ON "FilingYearData"("filingId", "taxYear");

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilingYearData" ADD CONSTRAINT "FilingYearData_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_filingYearDataId_fkey" FOREIGN KEY ("filingYearDataId") REFERENCES "FilingYearData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
