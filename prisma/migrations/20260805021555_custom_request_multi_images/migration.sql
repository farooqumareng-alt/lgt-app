-- AlterTable
ALTER TABLE "CustomRequest" DROP COLUMN "referenceImageAlt",
DROP COLUMN "referenceImageUrl";

-- CreateTable
CREATE TABLE "CustomRequestImage" (
    "id" TEXT NOT NULL,
    "customRequestId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomRequestImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomRequestImage_customRequestId_idx" ON "CustomRequestImage"("customRequestId");

-- AddForeignKey
ALTER TABLE "CustomRequestImage" ADD CONSTRAINT "CustomRequestImage_customRequestId_fkey" FOREIGN KEY ("customRequestId") REFERENCES "CustomRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

