import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { DonationsClient } from './client';
import { redirect } from 'next/navigation';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function DonationsPage() {
  const ctx = await requirePermission(PERMISSIONS.DONATIONS_VIEW);
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  if (isVielusosSite(site)) redirect('/dashboard');
  const [donations, donors, campaigns] = await Promise.all([
    prisma.donation.findMany({ where: { organizationId: orgId }, include: { donor: true, campaign: true }, orderBy: { donatedAt: 'desc' } }),
    prisma.donor.findMany({ where: { organizationId: orgId }, orderBy: { lastName: 'asc' } }),
    prisma.campaign.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } }),
  ]);
  return (
    <DonationsClient
      donations={JSON.parse(JSON.stringify(donations))}
      donors={JSON.parse(JSON.stringify(donors))}
      campaigns={JSON.parse(JSON.stringify(campaigns))}
      profile={(ctx.organization!.profile as Record<string, unknown>) || {}}
      canEdit={ctx.permissions.has(PERMISSIONS.DONATIONS_EDIT)}
      canReceipt={ctx.permissions.has(PERMISSIONS.RECEIPTS_MANAGE)}
      canExport={ctx.permissions.has(PERMISSIONS.EXPORTS)}
    />
  );
}
