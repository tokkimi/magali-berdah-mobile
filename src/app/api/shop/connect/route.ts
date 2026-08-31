import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { appBaseUrl } from '@/lib/utils';

function connectDisabledMessage(raw: string) {
  const v = raw.toLowerCase();
  if (v.includes('connect') || v.includes('platform') || v.includes('not enabled') || v.includes('signed up')) {
    return 'Stripe Connect n’est pas encore activé sur le compte Stripe d’Easy Asso. Activez « Connect » dans le tableau de bord Stripe de la plateforme, puis réessayez.';
  }
  return `Stripe a refusé la connexion : ${raw}`;
}

async function saveConnect(orgId: string, patch: Record<string, any>) {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  await prisma.organization.update({
    where: { id: orgId },
    data: { profile: { ...((org?.profile as any) || {}), ...patch } },
  });
}

// Start (or resume) the merchant's Stripe Connect onboarding.
export async function POST() {
  try {
    if (!stripe) return NextResponse.json({ error: 'Le paiement Stripe n’est pas configuré.' }, { status: 503 });
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const profile = (ctx.org.profile as any) || {};
    const appUrl = appBaseUrl();

    let accountId: string | undefined = profile.stripeConnectAccountId;
    try {
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: 'express',
          email: profile.email || undefined,
          metadata: { organizationId: ctx.org.id },
          capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        });
        accountId = account.id;
        await saveConnect(ctx.org.id, { stripeConnectAccountId: accountId, stripeConnectReady: false });
      }
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${appUrl}/dashboard/shop?connect=refresh`,
        return_url: `${appUrl}/dashboard/shop?connect=done`,
        type: 'account_onboarding',
      });
      return NextResponse.json({ url: link.url });
    } catch (err: any) {
      return NextResponse.json({ error: connectDisabledMessage(err?.message || 'Erreur Stripe Connect') }, { status: 502 });
    }
  } catch (e) { return handleApiError(e); }
}

// Refresh the connected account status (charges_enabled).
export async function GET() {
  try {
    if (!stripe) return NextResponse.json({ ready: false });
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const profile = (ctx.org.profile as any) || {};
    const accountId: string | undefined = profile.stripeConnectAccountId;
    if (!accountId) return NextResponse.json({ started: false, ready: false });
    const account = await stripe.accounts.retrieve(accountId);
    const ready = !!account.charges_enabled;
    await saveConnect(ctx.org.id, { stripeConnectReady: ready, stripeConnectDetailsSubmitted: !!account.details_submitted });
    return NextResponse.json({ started: true, ready, detailsSubmitted: !!account.details_submitted });
  } catch (e) { return handleApiError(e); }
}
