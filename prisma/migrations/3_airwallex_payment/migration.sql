ALTER TABLE "Organization" ADD COLUMN "airwallexPaymentLinkId" TEXT;
CREATE UNIQUE INDEX "Organization_airwallexPaymentLinkId_key" ON "Organization"("airwallexPaymentLinkId");
