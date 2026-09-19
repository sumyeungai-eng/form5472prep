-- CreateTable
CREATE TABLE "ReceivedFax" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "telnyxFaxId" TEXT NOT NULL,
    "fromNumber" TEXT,
    "toNumber" TEXT,
    "pageCount" INTEGER,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "pdfKey" TEXT,
    "pdfBytes" INTEGER,
    "downloadError" TEXT,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "note" TEXT,
    "filingId" TEXT,
    "einApplicationId" TEXT,
    "itinApplicationId" TEXT,

    CONSTRAINT "ReceivedFax_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReceivedFax_telnyxFaxId_key" ON "ReceivedFax"("telnyxFaxId");

-- CreateIndex
CREATE INDEX "ReceivedFax_readAt_idx" ON "ReceivedFax"("readAt");

-- CreateIndex
CREATE INDEX "ReceivedFax_receivedAt_idx" ON "ReceivedFax"("receivedAt");

-- AddForeignKey
ALTER TABLE "ReceivedFax" ADD CONSTRAINT "ReceivedFax_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivedFax" ADD CONSTRAINT "ReceivedFax_einApplicationId_fkey" FOREIGN KEY ("einApplicationId") REFERENCES "EinApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivedFax" ADD CONSTRAINT "ReceivedFax_itinApplicationId_fkey" FOREIGN KEY ("itinApplicationId") REFERENCES "ItinApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
