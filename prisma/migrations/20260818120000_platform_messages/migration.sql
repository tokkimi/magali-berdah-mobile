-- CreateTable
CREATE TABLE "PlatformMessage" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "fromAdmin" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readByAdmin" TIMESTAMP(3),
    "readByOrg" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformMessage_organizationId_createdAt_idx" ON "PlatformMessage"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "PlatformMessage" ADD CONSTRAINT "PlatformMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
