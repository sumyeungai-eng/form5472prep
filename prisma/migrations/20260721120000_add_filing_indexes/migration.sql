-- Performance indexes on hot Filing query paths.
-- Non-destructive: creating indexes does not modify any row data.
-- Apply to production with `npx prisma migrate deploy` (needs prod DATABASE_URL).

-- CreateIndex
CREATE INDEX "Filing_status_updatedAt_idx" ON "Filing"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "Filing_faxJobId_idx" ON "Filing"("faxJobId");
