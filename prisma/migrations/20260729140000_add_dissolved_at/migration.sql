-- Dissolution date for final (short-year) returns.
ALTER TABLE "Filing" ADD COLUMN     "dissolvedAt" TIMESTAMP(3);
