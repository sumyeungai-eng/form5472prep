-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "isBot" BOOLEAN NOT NULL DEFAULT false,
    "attrSource" TEXT,
    "attrMedium" TEXT,
    "attrCampaign" TEXT,
    "attrReferrer" TEXT,
    "attrLanding" TEXT,
    "ip" TEXT,
    "ipHash" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "userAgent" TEXT,
    "userId" TEXT,
    "lastSessionId" TEXT,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "sessionId" TEXT,
    "userId" TEXT,
    "ip" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "isBot" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_visitorKey_key" ON "Visitor"("visitorKey");

-- CreateIndex
CREATE INDEX "Visitor_isBot_lastSeenAt_idx" ON "Visitor"("isBot", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Visitor_country_lastSeenAt_idx" ON "Visitor"("country", "lastSeenAt");

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");

-- CreateIndex
CREATE INDEX "PageView_visitorId_createdAt_idx" ON "PageView"("visitorId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
