-- Secure SSN capture (docs/reviews/2026-10-15-ssn-capture-spec.md).
-- Additive, nullable only: existing rows keep NULL ("no SSN on file").
-- ownerSsnCiphertext holds AES-256-GCM ciphertext ("v1:iv:tag:ct"), never plaintext.

-- AlterTable
ALTER TABLE "Filing" ADD COLUMN "ownerSsnCiphertext" TEXT,
ADD COLUMN "ownerSsnLast4" TEXT,
ADD COLUMN "ownerSsnSubmittedAt" TIMESTAMP(3),
ADD COLUMN "ownerSsnSubmittedBy" TEXT,
ADD COLUMN "ownerSsnRequestedAt" TIMESTAMP(3);
