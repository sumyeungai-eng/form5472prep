-- Final (short-year) return flag: LLC dissolved during the tax year being filed.
ALTER TABLE "Filing" ADD COLUMN     "isFinalReturn" BOOLEAN NOT NULL DEFAULT false;
