CREATE TABLE "TelegramOrderNotification" (
    "id" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "leaseUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelegramOrderNotification_pkey" PRIMARY KEY ("id")
);
