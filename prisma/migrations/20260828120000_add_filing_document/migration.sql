-- General supporting documents attached to a filing.
CREATE TABLE "FilingDocument" (
    "id" TEXT NOT NULL,
    "filingId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FilingDocument_filingId_idx" ON "FilingDocument"("filingId");

-- AddForeignKey
ALTER TABLE "FilingDocument" ADD CONSTRAINT "FilingDocument_filingId_fkey" FOREIGN KEY ("filingId") REFERENCES "Filing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
