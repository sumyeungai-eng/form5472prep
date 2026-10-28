-- Form 7004 extension filing orders (additive; reuses the existing "EinStatus" enum).
-- CreateTable
CREATE TABLE "ExtensionApplication" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "llcName" TEXT,
    "ein" TEXT,
    "llcStreet" TEXT,
    "llcCity" TEXT,
    "llcState" TEXT,
    "llcZip" TEXT,
    "taxYear" INTEGER,
    "notes" TEXT,
    "funnelSource" TEXT,
    "attrSource" TEXT,
    "attrMedium" TEXT,
    "attrCampaign" TEXT,
    "attrReferrer" TEXT,
    "attrLanding" TEXT,
    "status" "EinStatus" NOT NULL DEFAULT 'PAYMENT_PENDING',
    "adminNotes" TEXT,
    "amountPaid" INTEGER NOT NULL DEFAULT 0,
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "userId" TEXT,

    CONSTRAINT "ExtensionApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionApplication_stripeSessionId_key" ON "ExtensionApplication"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExtensionApplication_stripePaymentId_key" ON "ExtensionApplication"("stripePaymentId");

-- AddForeignKey
ALTER TABLE "ExtensionApplication" ADD CONSTRAINT "ExtensionApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
