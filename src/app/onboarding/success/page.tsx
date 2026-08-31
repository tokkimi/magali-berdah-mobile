import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireOrg } from '@/lib/session';
import { activateOrganization } from '@/lib/activation';
import { isDemoMode, stripe } from '@/lib/stripe';
import { planFor } from '@/lib/plans';
import { retrieveAirwallexPaymentIntent } from '@/lib/airwallex';
import { CheckCircle2 } from 'lucide-react';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; demo?: string; airwallex_intent_id?: string }>;
}) {
  const params = await searchParams;
  const ctx = await requireOrg();
  const org = ctx.organization!;

  // Confirm the payment (fallback if webhook hasn't fired yet).
  if (org.planStatus !== 'ACTIVE') {
    if (params.demo && isDemoMode) {
      await activateOrganization(org.id);
    } else if (params.session_id && stripe) {
      const s = await stripe.checkout.sessions.retrieve(params.session_id);
      const plan = planFor(s.metadata?.plan);
      const isSubscription = s.mode === 'subscription';
      const correctOrg = s.client_reference_id === org.id || s.metadata?.organizationId === org.id;
      const correctAmount = isSubscription || (s.amount_total === plan.amountEur * 100 && s.currency === 'eur');
      const paid = s.payment_status === 'paid' || s.status === 'complete';
      if (paid && correctOrg && correctAmount) {
        await activateOrganization(org.id, s.id);
        // Record the yearly subscription so renewals and the renewal date work
        // even if the webhook is delayed or not configured yet.
        if (isSubscription && s.subscription) {
          let planRenewsAt: string | undefined;
          try {
            const sub = await stripe.subscriptions.retrieve(s.subscription as string);
            const end = (sub as any)?.current_period_end;
            if (typeof end === 'number') planRenewsAt = new Date(end * 1000).toISOString();
          } catch {}
          const { prisma } = await import('@/lib/prisma');
          await prisma.organization.update({
            where: { id: org.id },
            data: { profile: { ...((org.profile as any) || {}), plan: plan.id, stripeSubscriptionId: s.subscription, stripeCustomerId: (s.customer as string) || undefined, planRenewsAt } },
          });
        }
      }
    } else if (params.airwallex_intent_id) {
      const intent = await retrieveAirwallexPaymentIntent(params.airwallex_intent_id);
      const plan = planFor((org.profile as any)?.plan);
      const correctOrg = org.airwallexPaymentLinkId === intent.id || intent.metadata?.organizationId === org.id || String(intent.merchant_order_id || '').includes(org.id);
      const correctAmount = Number(intent.amount) === plan.amountEur && intent.currency === 'EUR';
      if (intent.status === 'SUCCEEDED' && correctOrg && correctAmount) await activateOrganization(org.id, `airwallex:${intent.id}`);
    }
  }

  const fresh = await (await import('@/lib/prisma')).prisma.organization.findUnique({ where: { id: org.id } });
  if (fresh?.planStatus !== 'ACTIVE') redirect('/onboarding?pending=1');

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="card w-full max-w-md text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Votre site est activé 🎉</h1>
        <p className="mt-2 text-gray-600">
          Bienvenue {ctx.user.name?.split(' ')[0]} ! Vous pouvez maintenant tout personnaliser en toute autonomie.
        </p>
        <Link href="/dashboard/themes?welcome=1" className="btn btn-primary mt-6 w-full py-3">Choisir le style de mon site</Link>
        <Link href="/dashboard" className="mt-2 block text-sm text-gray-500 hover:text-gray-700">Aller directement au tableau de bord</Link>
      </div>
    </div>
  );
}
