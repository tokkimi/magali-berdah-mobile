import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { planFor } from '@/lib/plans';
import { activateOrganization } from '@/lib/activation';

// Merge extra keys into an organization's JSON profile without clobbering it.
async function patchProfile(orgId: string, patch: Record<string, any>) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return;
  await prisma.organization.update({
    where: { id: orgId },
    data: { profile: { ...((org.profile as any) || {}), ...patch } },
  });
}

async function orgIdForSubscription(subscriptionId: string): Promise<string | null> {
  if (!subscriptionId) return null;
  const org = await prisma.organization.findFirst({
    where: { profile: { path: ['stripeSubscriptionId'], equals: subscriptionId } },
    select: { id: true },
  });
  return org?.id ?? null;
}

function renewalIso(sub: any): string | undefined {
  const end = sub?.current_period_end;
  return typeof end === 'number' ? new Date(end * 1000).toISOString() : undefined;
}

async function cancelPreviousSubscription(previousSubscriptionId?: string, nextSubscriptionId?: string) {
  if (!stripe || !previousSubscriptionId || previousSubscriptionId === nextSubscriptionId) return;
  try {
    await stripe.subscriptions.cancel(previousSubscriptionId);
  } catch (error: any) {
    console.error('Unable to cancel previous Stripe subscription', previousSubscriptionId, error?.message);
  }
}

export async function POST(req: Request) {
  if (!stripe) return NextResponse.json({ ok: true, demo: true });

  const sig = req.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  let event;
  try {
    event = secret && sig ? stripe.webhooks.constructEvent(raw, sig, secret) : JSON.parse(raw);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  try {
    // A shop customer paid: complete the order, decrement stock, record income.
    if (event.type === 'checkout.session.completed' && event.data.object?.metadata?.orderType === 'shop') {
      const session = event.data.object as any;
      const paid = session.payment_status === 'paid' || session.status === 'complete';
      const order = await prisma.order.findFirst({ where: { id: session.metadata?.orderId, status: 'PENDING' }, include: { items: true } });
      if (order && paid) {
        const details = session.customer_details || {};
        const shipping = session.shipping_details?.address || session.customer_details?.address;
        const address = shipping ? [shipping.line1, shipping.line2, `${shipping.postal_code || ''} ${shipping.city || ''}`.trim(), shipping.country].filter(Boolean).join(', ') : '';
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            stripePaymentIntentId: (session.payment_intent as string) || null,
            customerName: details.name || '',
            customerEmail: details.email || '',
            customerPhone: details.phone || '',
            shippingAddress: address,
          },
        });
        // Decrement stock for tracked products.
        for (const item of order.items) {
          if (item.productId) {
            const p = await prisma.product.findUnique({ where: { id: item.productId } });
            if (p && p.stock != null) await prisma.product.update({ where: { id: p.id }, data: { stock: Math.max(0, p.stock - item.quantity) } });
          }
        }
        // Record the sale in accounting.
        const count = order.items.reduce((s, i) => s + i.quantity, 0);
        await prisma.transaction.create({
          data: {
            organizationId: order.organizationId,
            kind: 'INCOME',
            label: `Vente boutique — ${count} article${count > 1 ? 's' : ''}`,
            amountCents: order.totalCents,
            method: 'CARD',
            reference: order.id,
          },
        });
      }
      return NextResponse.json({ received: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orgId = session.metadata?.organizationId || session.client_reference_id;
      const plan = planFor(session.metadata?.plan);
      const isSubscription = session.mode === 'subscription';
      const paid = session.payment_status === 'paid' || session.status === 'complete';
      // One-off (lifetime): verify the exact amount. Subscription (annual): trust
      // the signed metadata plan; the first invoice amount is validated by Stripe.
      const amountOk = isSubscription || (session.amount_total === plan.amountEur * 100 && session.currency === 'eur');
      if (orgId && paid && amountOk) {
        const existingOrg = await prisma.organization.findUnique({ where: { id: orgId } });
        const existingProfile = (existingOrg?.profile || {}) as Record<string, any>;
        const previousSubscriptionId = session.metadata?.previousSubscriptionId || existingProfile.stripeSubscriptionId || '';
        await activateOrganization(orgId, session.id);
        await cancelPreviousSubscription(previousSubscriptionId, isSubscription ? String(session.subscription || '') : undefined);
        if (isSubscription && session.subscription) {
          let renewsAt: string | undefined;
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            renewsAt = renewalIso(sub);
          } catch {}
          await patchProfile(orgId, {
            plan: plan.id,
            pendingPlan: null,
            pendingPlanRequestedAt: null,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer || undefined,
            planRenewsAt: renewsAt,
          });
        } else {
          await patchProfile(orgId, {
            plan: plan.id,
            pendingPlan: null,
            pendingPlanRequestedAt: null,
            stripeSubscriptionId: null,
            planRenewsAt: null,
            stripeCustomerId: session.customer || existingProfile.stripeCustomerId || undefined,
          });
        }
      }
    }

    // Yearly renewal succeeded: keep the site active and push the renewal date.
    else if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;
      const subId = invoice.subscription || invoice.parent?.subscription_details?.subscription;
      const orgId = invoice.metadata?.organizationId || (subId ? await orgIdForSubscription(subId) : null);
      if (orgId) {
        await activateOrganization(orgId, `stripe-invoice:${invoice.id}`);
        let renewsAt: string | undefined;
        if (subId) {
          try { renewsAt = renewalIso(await stripe.subscriptions.retrieve(subId)); } catch {}
        }
        if (renewsAt) await patchProfile(orgId, { planRenewsAt: renewsAt });
      }
    }

    // The annual subscription ended (cancelled or too many failed charges):
    // the site stops being an active paid plan.
    else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as any;
      const orgId = sub.metadata?.organizationId || (await orgIdForSubscription(sub.id));
      if (orgId) {
        const org = await prisma.organization.findUnique({ where: { id: orgId } });
        const profile = (org?.profile || {}) as Record<string, any>;
        if (profile.stripeSubscriptionId && profile.stripeSubscriptionId !== sub.id) {
          return NextResponse.json({ received: true, ignored: 'old_subscription' });
        }
        if (!profile.stripeSubscriptionId && profile.plan === 'lifetime') {
          return NextResponse.json({ received: true, ignored: 'lifetime_upgrade' });
        }
        await prisma.organization.update({ where: { id: orgId }, data: { planStatus: 'CANCELLED' } });
        await patchProfile(orgId, { subscriptionEndedAt: new Date().toISOString() });
      }
    }
  } catch (err: any) {
    console.error('Stripe webhook handling failed', event.type, err?.message);
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
