-- CreateTable
CREATE TABLE "WebsiteQuestion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "topic" TEXT,
    "pageUrl" TEXT,
    "readAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "WebsiteQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteQuestionReply" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentBy" TEXT,

    CONSTRAINT "WebsiteQuestionReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteQuestion_createdAt_idx" ON "WebsiteQuestion"("createdAt");

-- CreateIndex
CREATE INDEX "WebsiteQuestion_email_idx" ON "WebsiteQuestion"("email");

-- CreateIndex
CREATE INDEX "WebsiteQuestionReply_questionId_createdAt_idx" ON "WebsiteQuestionReply"("questionId", "createdAt");

-- AddForeignKey
ALTER TABLE "WebsiteQuestionReply" ADD CONSTRAINT "WebsiteQuestionReply_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "WebsiteQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
