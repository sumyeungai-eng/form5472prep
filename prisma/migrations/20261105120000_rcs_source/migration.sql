-- P0-3 (2026-11): reasonable cause source per tax year. Additive: every
-- existing row keeps the admin-narrative behaviour (default) and NULLs.
ALTER TABLE "FilingYearData" ADD COLUMN "rcsSource" TEXT NOT NULL DEFAULT 'ADMIN_NARRATIVE',
ADD COLUMN "rcsWhyMissedRaw" TEXT,
ADD COLUMN "rcsVerbatimText" TEXT,
ADD COLUMN "rcsVerbatimChosenBy" TEXT,
ADD COLUMN "rcsVerbatimChosenAt" TIMESTAMP(3);
