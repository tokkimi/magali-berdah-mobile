import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { orgOverview, monthlyDonations } from '@/lib/stats';
import { formatEuros } from '@/lib/utils';
import { PageHeader, Stat, BarChart } from '@/components/ui';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const ctx = await requirePermission(PERMISSIONS.STATS_VIEW);
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  const branded = isVielusosSite(site);
  const [o, monthly, byMethod, subs] = await Promise.all([
    orgOverview(orgId),
    monthlyDonations(orgId),
    prisma.donation.groupBy({ by: ['method'], where: { organizationId: orgId, status: 'COMPLETED' }, _sum: { amountCents: true }, _count: true }),
    prisma.newsletterSubscriber.count({ where: { organizationId: orgId } }),
  ]);

  const avg = o.donationCount > 0 ? o.totalDonationsCents / o.donationCount : 0;

  return (
    <div>
      <PageHeader title="Statistiques" subtitle={branded ? 'Suivez la fréquentation et les performances de votre site.' : 'Analysez la performance de votre association.'} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!branded && <><Stat label="Dons collectés" value={formatEuros(o.totalDonationsCents)} accent="text-green-600" />
        <Stat label="Don moyen" value={formatEuros(avg)} />
        <Stat label="Donateurs" value={String(o.donorCount)} /></>}
        <Stat label="Inscrits newsletter" value={String(subs)} />
      </div>

      {!branded && <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-gray-900">Évolution des dons (12 mois)</h2>
          <BarChart data={monthly} format={formatEuros} />
        </div>
        <div className="card">
          <h2 className="mb-4 font-bold text-gray-900">Répartition par méthode</h2>
          {byMethod.length === 0 ? <p className="text-sm text-gray-500">Aucune donnée.</p> : (
            <ul className="space-y-3">
              {byMethod.map((m) => (
                <li key={m.method} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{m.method}</span>
                  <span className="font-semibold">{formatEuros(m._sum.amountCents || 0)} <span className="text-xs text-gray-400">({m._count})</span></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>}

      <div className="mt-6 card">
        <h2 className="mb-1 font-bold text-gray-900">Audience du site</h2>
        <p className="text-sm text-gray-500">{o.pageviews} pages vues enregistrées sur votre site public.</p>
      </div>
    </div>
  );
}
