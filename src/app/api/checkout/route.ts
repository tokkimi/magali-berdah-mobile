import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { stripe, isDemoMode } from '@/lib/stripe';
import { activateOrganization } from '@/lib/activation';
import { prisma } from '@/lib/prisma';
import { planAccess } from '@/lib/plan';
import { canUpgradePlan, planFor } from '@/lib/plans';
import { appBaseUrl } from '@/lib/utils';

export async function POST(req: Request) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  const body = await req.json().catch(() => ({}));
  const plan = planFor(body?.plan);
  const currentProfile = (org.profile as any || {});
  const currentPlan = planFor(currentProfile.plan);
  const isActiveUpgrade = org.planStatus === 'ACTIVE' && canUpgradePlan(currentPlan.id, plan.id);
  if (org.planStatus === 'ACTIVE' && !isActiveUpgrade) {
    return NextResponse.json({ error: 'Votre formule est déjà active. Vous pouvez seulement passer à une formule supérieure.', code: 'PLAN_ALREADY_ACTIVE' }, { status: 400 });
  }
  const priceEur = plan.amountEur;
  const nextUnpaidStatus = org.planStatus === 'ACTIVE' ? 'ACTIVE' : planAccess(org).hasAccess ? org.planStatus : 'PENDING_PAYMENT';

  const appUrl = appBaseUrl();

  // Explicit local/demo mode only: skip real payment.
  if (isDemoMode) {
    await activateOrganization(org.id);
    return NextResponse.json({ url: '/onboarding/success?demo=1' });
  }

  // Preferred card processor: Stripe. When a Stripe key is configured, cards go
  // through Stripe Checkout (hosted, PCI-compliant).
  if (stripe) {
    await prisma.organization.update({
      where: { id: org.id },
      data: {
        planStatus: nextUnpaidStatus,
        profile: {
          ...currentProfile,
          ...(isActiveUpgrade ? { pendingPlan: plan.id, pendingPlanRequestedAt: new Date().toISOString() } : { plan: plan.id }),
        },
      },
    });

    // Monthly / annual = a real recurring subscription so the card is charged
    // again automatically each period. Lifetime = a single one-off payment.
    const isSubscription = plan.recurring;
    const productLabel = plan.id === 'monthly' ? 'abonnement mensuel' : plan.id === 'annual' ? 'abonnement annuel' : 'accès à vie';
    const locale = (org.profile as any)?.language === 'en' ? 'en' : 'fr';
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      locale,
      customer_email: ctx.user.email,
      client_reference_id: org.id,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            unit_amount: priceEur * 100,
            ...(isSubscription ? { recurring: { interval: (plan.interval || 'month') as 'month' | 'year' } } : {}),
            product_data: { name: `Easy Asso — ${productLabel} du site de votre association` },
          },
        },
      ],
      success_url: `${appUrl}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}${isActiveUpgrade ? '/dashboard/settings?payment=canceled' : '/onboarding?canceled=1'}`,
      metadata: { organizationId: org.id, plan: plan.id, action: isActiveUpgrade ? 'upgrade' : 'activate', previousSubscriptionId: currentProfile.stripeSubscriptionId || '' },
      ...(isSubscription ? { subscription_data: { metadata: { organizationId: org.id, plan: plan.id, action: isActiveUpgrade ? 'upgrade' : 'activate' } } } : {}),
    });

    return NextResponse.json({ url: session.url });
  }

  // Card payment isn't configured yet: direct the association to bank transfer.
  return NextResponse.json(
    {
      error: 'Le paiement par carte n’est pas encore activé. Vous pouvez régler par virement bancaire juste en dessous. Aucun débit n’a été effectué.',
      code: 'PAYMENT_PROVIDER_MISSING',
    },
    { status: 503 }
  );
}
