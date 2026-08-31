CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "shippingAddress" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CustomerProfile_organizationId_email_key" ON "CustomerProfile"("organizationId", "email");
CREATE INDEX "CustomerProfile_organizationId_updatedAt_idx" ON "CustomerProfile"("organizationId", "updatedAt");

ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
