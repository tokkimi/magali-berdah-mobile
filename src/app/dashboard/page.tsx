import Link from 'next/link';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { orgOverview, monthlyDonations } from '@/lib/stats';
import { formatEuros, formatDate } from '@/lib/utils';
import { PageHeader, Stat, BarChart } from '@/components/ui';
import { Trophy, ArrowRight, Sparkles, Fingerprint, LayoutTemplate } from 'lucide-react';
import { isVielusosSite } from '@/lib/vielusos';

export default async function DashboardHome() {
  const ctx = await requireOrg();
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  const branded = isVielusosSite(site);
  const [o, monthly] = await Promise.all([orgOverview(orgId), monthlyDonations(orgId)]);

  return (
    <div>
      <PageHeader
        title={`Bonjour ${ctx.user.name?.split(' ')[0] || ''} 👋`}
        subtitle={branded ? 'Votre espace de création, de publication et de suivi.' : 'Voici la situation de votre association en un coup d’œil.'}
      />

      {/* Magic generator hero */}
      {!branded && <Link href="/dashboard/generate" className="mb-6 flex flex-col items-start gap-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/20"><Sparkles className="h-6 w-6" /></div>
          <div>
            <h2 className="text-lg font-bold">Créez votre site en un clic ✨</h2>
            <p className="text-sm text-brand-100">Décrivez votre association, ajoutez logo et photos : le site se génère tout seul.</p>
          </div>
        </div>
        <span className="btn bg-white px-5 text-brand-700 hover:bg-brand-50">Lancer le générateur</span>
      </Link>}

      <div className={`mb-6 grid gap-3 ${branded ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
        <Link href="/dashboard/identity" className="card flex items-center gap-3 hover:ring-brand-200"><Fingerprint className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-gray-800">Logo, polices & couleurs</span></Link>
        {!branded && <Link href="/dashboard/themes" className="card flex items-center gap-3 hover:ring-brand-200"><LayoutTemplate className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-gray-800">Choisir un modèle</span></Link>}
        <Link href="/dashboard/editor" className="card flex items-center gap-3 hover:ring-brand-200"><ArrowRight className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-gray-800">Éditer mon site</span></Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!branded && <Stat label="Total des dons" value={formatEuros(o.totalDonationsCents)} hint={`${o.donationCount} don(s)`} accent="text-green-600" />}
        {!branded && <Stat label="Donateurs" value={String(o.donorCount)} hint="dans votre CRM" />}
        <Stat label="Solde comptable" value={formatEuros(o.balanceCents)} hint="recettes - dépenses" accent={o.balanceCents >= 0 ? 'text-gray-900' : 'text-red-600'} />
        <Stat label="Visites du site" value={String(o.pageviews)} hint="pages vues" />
      </div>

      {!branded && <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-bold text-gray-900">Dons des 12 derniers mois</h2>
          <BarChart data={monthly} format={formatEuros} />
        </div>

        <div className="card">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
            <Trophy className="h-5 w-5 text-amber-500" /> Meilleurs donateurs
          </h2>
          {o.topDonors.filter((t) => t.donor).length === 0 ? (
            <p className="text-sm text-gray-500">Aucun don enregistré pour le moment.</p>
          ) : (
            <ol className="space-y-3">
              {o.topDonors.filter((t) => t.donor).map((t, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                    {t.donor!.firstName} {t.donor!.lastName}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{formatEuros(t.total)}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>}

      {!branded && <div className="mt-6 card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Derniers dons</h2>
          <Link href="/dashboard/donations" className="flex items-center gap-1 text-sm font-medium text-brand-600">
            Tout voir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {o.recentDonations.length === 0 ? (
          <p className="text-sm text-gray-500">Enregistrez votre premier don depuis l’onglet “Dons”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-gray-400">
                <tr><th className="pb-2">Donateur</th><th className="pb-2">Campagne</th><th className="pb-2">Méthode</th><th className="pb-2 text-right">Montant</th><th className="pb-2 text-right">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {o.recentDonations.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Anonyme'}</td>
                    <td className="py-2 text-gray-500">{d.campaign?.name || '—'}</td>
                    <td className="py-2 text-gray-500">{d.method}</td>
                    <td className="py-2 text-right font-semibold">{formatEuros(d.amountCents)}</td>
                    <td className="py-2 text-right text-gray-400">{formatDate(d.donatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>}
    </div>
  );
}
