-- AlterTable
ALTER TABLE "Filing" ADD COLUMN     "ownerAddressCity" TEXT,
ADD COLUMN     "ownerAddressCountry" TEXT,
ADD COLUMN     "ownerAddressPostal" TEXT,
ADD COLUMN     "ownerAddressState" TEXT,
ADD COLUMN     "ownerAddressStreet" TEXT;
