import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireOrg, planAccess } from '@/lib/session';
import { isDemoMode } from '@/lib/stripe';
import { siteUrlFor } from '@/lib/utils';
import { PlanChooser } from './plan-chooser';
import { PLANS, isPlanId } from '@/lib/plans';
import { Check } from 'lucide-react';

export default async function OnboardingPage() {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  if (org.planStatus === 'ACTIVE') redirect('/dashboard');
  const access = planAccess(org);
  const storedPlan = (org.profile as any)?.plan;
  const initialPlan = isPlanId(storedPlan) ? storedPlan : 'lifetime';

  const site = await (await import('@/lib/prisma')).prisma.site.findUnique({ where: { organizationId: org.id } });
  const url = site ? siteUrlFor(site.subdomain, site.customDomain, site.domainVerified) : '';

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="card text-center">
          <span className={`badge mx-auto ${access.expired ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-700'}`}>
            {access.expired ? 'Essai terminé' : access.isTrial ? `Essai : ${access.daysLeft} jour(s) restant(s)` : 'Activation'}
          </span>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Activez le site de {org.name}</h1>
          <p className="mt-2 text-gray-600">
            Trois formules, sans engagement caché : <strong>{PLANS.monthly.amountEur} € / mois</strong>,
            <strong> {PLANS.annual.amountEur} € / an</strong> ou un <strong>paiement unique de {PLANS.lifetime.amountEur} € à vie</strong>
            {' '}— avec tous les outils (dons, CRM, comptabilité…). Paiement par carte ou par virement.
          </p>
          <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Tant que le paiement n’est pas confirmé, l’accès reste en attente : rien n’est validé automatiquement.
          </p>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
            <p className="text-sm font-medium text-gray-500">Votre adresse générée automatiquement</p>
            <p className="mt-1 break-all font-mono text-sm text-brand-700">{url}</p>
            <p className="mt-2 text-xs text-gray-500">Vous pourrez relier votre propre nom de domaine ensuite.</p>
          </div>

          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-gray-700">
            {['Éditeur visuel de pages et blocs', 'Dons, reçus & campagnes', 'CRM donateurs & équipe', 'Comptabilité & statistiques', 'Nom de domaine personnalisé'].map((i) => (
              <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> {i}</li>
            ))}
          </ul>

          <div className="mt-8">
            <PlanChooser initialPlan={initialPlan} demo={isDemoMode} />
          </div>
          {isDemoMode && (
            <p className="mt-3 text-xs text-amber-600">
              Mode démonstration actif : le paiement est simulé (Stripe non configuré).
            </p>
          )}
          {access.hasAccess && (
            <Link href="/dashboard" className="mt-3 block text-sm text-gray-500 hover:text-gray-700">
              Continuer mon essai gratuit ({access.daysLeft} jour{access.daysLeft > 1 ? 's' : ''})
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
