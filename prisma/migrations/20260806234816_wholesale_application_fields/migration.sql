-- AlterTable
ALTER TABLE "WholesaleAccount" ADD COLUMN     "businessAddress" JSONB,
ADD COLUMN     "ein" TEXT,
ADD COLUMN     "storeType" TEXT,
ADD COLUMN     "website" TEXT;

