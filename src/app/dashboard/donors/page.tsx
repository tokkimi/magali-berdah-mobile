import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { DonorsClient } from './client';
import { redirect } from 'next/navigation';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function DonorsPage() {
  const ctx = await requirePermission(PERMISSIONS.DONORS_VIEW);
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  if (isVielusosSite(site)) redirect('/dashboard');
  const donors = await prisma.donor.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' } });
  const sums = await prisma.donation.groupBy({
    by: ['donorId'], where: { organizationId: orgId, status: 'COMPLETED', donorId: { not: null } }, _sum: { amountCents: true }, _count: true,
  });
  const totals: Record<string, { total: number; count: number }> = {};
  sums.forEach((s) => { if (s.donorId) totals[s.donorId] = { total: s._sum.amountCents || 0, count: s._count }; });
  return (
    <DonorsClient
      donors={JSON.parse(JSON.stringify(donors))}
      totals={totals}
      canEdit={ctx.permissions.has(PERMISSIONS.DONORS_EDIT)}
      canExport={ctx.permissions.has(PERMISSIONS.EXPORTS)}
    />
  );
}
