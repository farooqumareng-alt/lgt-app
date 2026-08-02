-- CreateEnum
CREATE TYPE "public"."CartChannel" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "public"."OrderChannel" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "public"."OrderPaymentMethod" AS ENUM ('CARD', 'INVOICE');

-- CreateEnum
CREATE TYPE "public"."WholesaleApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "public"."OrderStatus" ADD VALUE 'INVOICED';

-- DropIndex
DROP INDEX "public"."Cart_userId_key";

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "basePriceWholesale" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."ProductVariant" ADD COLUMN     "priceWholesaleOverride" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "channel" "public"."CartChannel" NOT NULL DEFAULT 'RETAIL';

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "channel" "public"."OrderChannel" NOT NULL DEFAULT 'RETAIL',
ADD COLUMN     "paymentMethod" "public"."OrderPaymentMethod" NOT NULL DEFAULT 'CARD',
ADD COLUMN     "stripeInvoiceId" TEXT,
ADD COLUMN     "wholesaleAccountId" TEXT,
ALTER COLUMN "stripeCheckoutSessionId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."WholesaleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "taxId" TEXT,
    "phone" TEXT NOT NULL,
    "applicationNote" TEXT,
    "approvalStatus" "public"."WholesaleApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "netTermsDays" INTEGER,
    "creditLimit" DECIMAL(10,2),
    "minimumOrderValue" DECIMAL(10,2),
    "stripeCustomerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WholesaleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WholesalePriceBreak" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WholesalePriceBreak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WholesaleAccount_approvalStatus_idx" ON "public"."WholesaleAccount"("approvalStatus" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleAccount_stripeCustomerId_key" ON "public"."WholesaleAccount"("stripeCustomerId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WholesaleAccount_userId_key" ON "public"."WholesaleAccount"("userId" ASC);

-- CreateIndex
CREATE INDEX "WholesalePriceBreak_productId_idx" ON "public"."WholesalePriceBreak"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "WholesalePriceBreak_productId_minQuantity_key" ON "public"."WholesalePriceBreak"("productId" ASC, "minQuantity" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_channel_key" ON "public"."Cart"("userId" ASC, "channel" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeInvoiceId_key" ON "public"."Order"("stripeInvoiceId" ASC);

-- CreateIndex
CREATE INDEX "Order_wholesaleAccountId_idx" ON "public"."Order"("wholesaleAccountId" ASC);

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_wholesaleAccountId_fkey" FOREIGN KEY ("wholesaleAccountId") REFERENCES "public"."WholesaleAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WholesaleAccount" ADD CONSTRAINT "WholesaleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WholesalePriceBreak" ADD CONSTRAINT "WholesalePriceBreak_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

