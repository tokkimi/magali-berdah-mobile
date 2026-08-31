ALTER TABLE "Donation"
ADD COLUMN "receivedAt" TIMESTAMP(3),
ADD COLUMN "receivedReference" TEXT,
ADD COLUMN "proofDocuments" JSONB NOT NULL DEFAULT '[]';
