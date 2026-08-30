-- Optional chat message attachments stored in R2/local storage.
ALTER TABLE "Message" ADD COLUMN "attachmentKey" TEXT,
ADD COLUMN "attachmentName" TEXT,
ADD COLUMN "attachmentType" TEXT;
