-- Add trial support to organizations
ALTER TABLE "Organization" ADD COLUMN "trialEndsAt" TIMESTAMP(3);
ALTER TABLE "Organization" ALTER COLUMN "planStatus" SET DEFAULT 'TRIAL';
