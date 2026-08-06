-- CreateTable
CREATE TABLE "AiActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiActivityLog_userId_idx" ON "AiActivityLog"("userId");

-- CreateIndex
CREATE INDEX "AiActivityLog_type_idx" ON "AiActivityLog"("type");

-- AddForeignKey
ALTER TABLE "AiActivityLog" ADD CONSTRAINT "AiActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
