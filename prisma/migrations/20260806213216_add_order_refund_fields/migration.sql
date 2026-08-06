-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountRefunded" DECIMAL(10,2),
ADD COLUMN     "refundedAt" TIMESTAMP(3);

