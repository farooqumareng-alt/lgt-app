-- CreateEnum
CREATE TYPE "CustomRequestStatus" AS ENUM ('NEW', 'IN_REVIEW', 'QUOTED', 'APPROVED', 'COMPLETED', 'DECLINED');

-- CreateTable
CREATE TABLE "CustomRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "budget" TEXT,
    "referenceImageUrl" TEXT,
    "referenceImageAlt" TEXT,
    "status" "CustomRequestStatus" NOT NULL DEFAULT 'NEW',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomRequest_status_idx" ON "CustomRequest"("status");

-- CreateIndex
CREATE INDEX "CustomRequest_userId_idx" ON "CustomRequest"("userId");

-- AddForeignKey
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRequest" ADD CONSTRAINT "CustomRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

