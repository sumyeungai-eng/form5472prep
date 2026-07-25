-- Blog posts published from /admin. Non-destructive (new table only) — the ten
-- existing content/blog/*.md files keep serving from disk and are not backfilled.
-- Apply to production with `npx prisma migrate deploy` (needs prod DATABASE_URL).

-- CreateTable
CREATE TABLE "Post" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "publishAt" TEXT,
    "updated" TEXT,
    "author" TEXT,
    "tags" TEXT[],
    "draft" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("slug")
);
