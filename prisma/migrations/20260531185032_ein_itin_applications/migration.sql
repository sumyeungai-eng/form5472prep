-- CreateEnum
CREATE TYPE "EinStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'DOCS_REQUESTED', 'PAYMENT_PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItinStatus" AS ENUM ('RECEIVED', 'IN_REVIEW', 'DOCS_REQUESTED', 'PAYMENT_PENDING', 'CAA_SCHEDULED', 'W7_SUBMITTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EinApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "llcName" TEXT NOT NULL,
    "llcState" TEXT,
    "llcFormedDate" TEXT,
    "businessPurpose" TEXT,
    "ownerName" TEXT,
    "ownerCitizenship" TEXT,
    "ownerResidence" TEXT,
    "passportNumber" TEXT,
    "notes" TEXT,
    "status" "EinStatus" NOT NULL DEFAULT 'RECEIVED',
    "adminNotes" TEXT,
    "ein" TEXT,
    "userId" TEXT,

    CONSTRAINT "EinApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItinApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TEXT,
    "countryOfBirth" TEXT,
    "citizenship" TEXT,
    "countryOfResidence" TEXT,
    "itinReason" TEXT NOT NULL,
    "taxReturnType" TEXT,
    "usActivity" TEXT,
    "passportNumber" TEXT,
    "passportExpiry" TEXT,
    "notes" TEXT,
    "status" "ItinStatus" NOT NULL DEFAULT 'RECEIVED',
    "adminNotes" TEXT,
    "itin" TEXT,
    "userId" TEXT,

    CONSTRAINT "ItinApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EinApplication" ADD CONSTRAINT "EinApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItinApplication" ADD CONSTRAINT "ItinApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
