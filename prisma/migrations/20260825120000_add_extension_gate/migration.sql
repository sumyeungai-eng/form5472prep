-- Form 7004 extension facts: late/timely must trace to a customer answer.
ALTER TABLE "Filing" ADD COLUMN     "extensionFiled" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "extensionTransmittedAt" TIMESTAMP(3);
ALTER TABLE "Filing" ADD COLUMN     "extensionMethod" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "extensionDestination" TEXT;
ALTER TABLE "Filing" ADD COLUMN     "extensionProofKey" TEXT;
