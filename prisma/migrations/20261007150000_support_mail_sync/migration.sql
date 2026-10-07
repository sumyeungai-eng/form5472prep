-- AlterTable
ALTER TABLE "WebsiteQuestion" ADD COLUMN "sourceMessageId" TEXT;

-- AlterTable
ALTER TABLE "WebsiteQuestionReply" ADD COLUMN "fromVisitor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'admin',
ADD COLUMN "sourceMessageId" TEXT;

-- CreateTable
CREATE TABLE "SupportMailSyncRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "trigger" TEXT NOT NULL,
    "since" TIMESTAMP(3) NOT NULL,
    "ok" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "questionsImported" INTEGER NOT NULL DEFAULT 0,
    "questionsMatched" INTEGER NOT NULL DEFAULT 0,
    "answersImported" INTEGER NOT NULL DEFAULT 0,
    "followUpsImported" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SupportMailSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteQuestion_sourceMessageId_key" ON "WebsiteQuestion"("sourceMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteQuestionReply_sourceMessageId_key" ON "WebsiteQuestionReply"("sourceMessageId");

-- CreateIndex
CREATE INDEX "SupportMailSyncRun_startedAt_idx" ON "SupportMailSyncRun"("startedAt");
