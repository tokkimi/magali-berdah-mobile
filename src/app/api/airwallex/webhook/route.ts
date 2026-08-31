import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { activateOrganization } from '@/lib/activation';
import { planFor } from '@/lib/plans';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const timestamp = req.headers.get('x-timestamp') || '';
  const signature = req.headers.get('x-signature') || '';
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET || '';
  if (!timestamp || !signature || !secret) return NextResponse.json({ error: 'Signature manquante' }, { status: 401 });

  const age = Math.abs(Date.now() - Number(timestamp));
  if (!Number.isFinite(age) || age > 5 * 60 * 1000) return NextResponse.json({ error: 'Notification expirée' }, { status: 401 });
  const expected = createHmac('sha256', secret).update(timestamp + rawBody).digest('hex');
  const valid = expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  if (!valid) return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });

  const event = JSON.parse(rawBody);
  if (event.name === 'payment_intent.succeeded') {
    const payment = event.data?.object || event.data || {};
    const organizationId = payment.metadata?.organizationId;
    const paymentLinkId = payment.payment_link_id || payment.payment_link?.id;
    const paymentIntentId = payment.id;
    const org = organizationId
      ? await prisma.organization.findUnique({ where: { id: organizationId } })
      : paymentLinkId
        ? await prisma.organization.findUnique({ where: { airwallexPaymentLinkId: paymentLinkId } })
        : paymentIntentId
          ? await prisma.organization.findUnique({ where: { airwallexPaymentLinkId: paymentIntentId } })
        : null;
    const correctLink = org && (!paymentLinkId || paymentLinkId === org.airwallexPaymentLinkId || paymentIntentId === org.airwallexPaymentLinkId);
    const plan = planFor((org?.profile as any)?.plan);
    const correctAmount = Number(payment.amount) === plan.amountEur && payment.currency === 'EUR';
    if (org && correctLink && correctAmount && org.planStatus !== 'ACTIVE') await activateOrganization(org.id, `airwallex:${payment.id}`);
  }
  return NextResponse.json({ received: true });
}
