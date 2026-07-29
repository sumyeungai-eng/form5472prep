-- Optional customer-uploaded dissolution certificate (R2 key) for final returns.
ALTER TABLE "Filing" ADD COLUMN     "dissolutionCertKey" TEXT;
