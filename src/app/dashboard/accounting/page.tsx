import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { AccountingClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function AccountingPage() {
  const ctx = await requirePermission(PERMISSIONS.ACCOUNTING_VIEW);
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  const branded = isVielusosSite(site);
  const [transactions, categories, donationAgg] = await Promise.all([
    prisma.transaction.findMany({ where: { organizationId: orgId }, include: { category: true }, orderBy: { date: 'desc' } }),
    prisma.category.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.donation.aggregate({ where: { organizationId: orgId, status: 'COMPLETED' }, _sum: { amountCents: true } }),
  ]);
  return (
    <AccountingClient
      transactions={JSON.parse(JSON.stringify(transactions))}
      categories={JSON.parse(JSON.stringify(categories))}
      donationsTotal={donationAgg._sum.amountCents || 0}
      canEdit={ctx.permissions.has(PERMISSIONS.ACCOUNTING_EDIT)}
      canExport={ctx.permissions.has(PERMISSIONS.EXPORTS)}
      branded={branded}
    />
  );
}
