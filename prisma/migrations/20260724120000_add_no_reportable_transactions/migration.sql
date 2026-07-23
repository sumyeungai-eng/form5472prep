-- Customer attestation that a tax year had no reportable transactions.
ALTER TABLE "FilingYearData" ADD COLUMN "noReportableTransactions" BOOLEAN NOT NULL DEFAULT false;
