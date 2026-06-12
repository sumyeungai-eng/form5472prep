-- Partner (reseller/agency) accounts that batch filings under one login.
-- Purely additive: a new Partner table + a nullable partnerId FK on Filing.
-- No existing rows are modified; safe to run on a live database.

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "partnerId" TEXT;

-- CreateIndex
CREATE INDEX "Filing_partnerId_idx" ON "Filing"("partnerId");

-- AddForeignKey
ALTER TABLE "Filing" ADD CONSTRAINT "Filing_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
