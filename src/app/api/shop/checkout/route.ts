import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { appBaseUrl } from '@/lib/utils';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';

// Platform commission on each shop sale, in percent (0 = none).
const FEE_PERCENT = Number(process.env.SHOP_FEE_PERCENT || '0');

// Public endpoint: a visitor checks out a cart for a given shop. Prices and
// stock are always recomputed server-side; the client cart is never trusted.
export async function POST(req: Request) {
  if (!rateLimit(req, 'shop-checkout', 20, 60 * 60 * 1000).ok) return rateLimitExceeded();
  if (!stripe) return NextResponse.json({ error: 'Le paiement n’est pas disponible.' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const organizationId = String(body.organizationId || '');
  const rawItems: { productId?: string; quantity?: number }[] = Array.isArray(body.items) ? body.items : [];
  const returnPath = typeof body.returnPath === 'string' && body.returnPath.startsWith('/') ? body.returnPath : '';
  if (!organizationId || rawItems.length === 0) return NextResponse.json({ error: 'Panier vide.' }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) return NextResponse.json({ error: 'Boutique introuvable.' }, { status: 404 });
  const profile = (org.profile as any) || {};
  const connectAccount = profile.stripeConnectAccountId as string | undefined;
  if (!connectAccount || !profile.stripeConnectReady) {
    return NextResponse.json({ error: 'Cette boutique n’accepte pas encore les paiements par carte.' }, { status: 409 });
  }

  // Rebuild the cart from the database (authoritative prices + stock).
  const ids = Array.from(new Set(rawItems.map((i) => String(i.productId || '')).filter(Boolean)));
  const products = await prisma.product.findMany({ where: { id: { in: ids }, organizationId, active: true } });
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: { product: (typeof products)[number]; quantity: number }[] = [];
  for (const item of rawItems) {
    const p = byId.get(String(item.productId));
    if (!p) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
    if (p.stock != null && p.stock < qty) return NextResponse.json({ error: `Stock insuffisant pour « ${p.name} ».` }, { status: 409 });
    lines.push({ product: p, quantity: qty });
  }
  if (lines.length === 0) return NextResponse.json({ error: 'Aucun article valide dans le panier.' }, { status: 400 });

  const total = lines.reduce((s, l) => s + l.product.priceCents * l.quantity, 0);
  const appUrl = appBaseUrl();
  const base = returnPath ? `${appUrl}${returnPath}` : appUrl;

  // Create the pending order first so the webhook can complete it.
  const order = await prisma.order.create({
    data: {
      organizationId,
      status: 'PENDING',
      totalCents: total,
      items: { create: lines.map((l) => ({ productId: l.product.id, name: l.product.name, priceCents: l.product.priceCents, quantity: l.quantity })) },
    },
  });

  try {
    const feeAmount = FEE_PERCENT > 0 ? Math.round((total * FEE_PERCENT) / 100) : 0;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      locale: profile.language === 'en' ? 'en' : 'fr',
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: l.product.priceCents,
          product_data: { name: l.product.name, ...(l.product.imageUrl && String(l.product.imageUrl).startsWith('http') ? { images: [l.product.imageUrl] } : {}) },
        },
      })),
      payment_intent_data: {
        transfer_data: { destination: connectAccount },
        ...(feeAmount > 0 ? { application_fee_amount: feeAmount } : {}),
      },
      shipping_address_collection: { allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC'] },
      phone_number_collection: { enabled: true },
      success_url: `${base}?order=success`,
      cancel_url: `${base}?order=cancelled`,
      metadata: { orderType: 'shop', orderId: order.id, organizationId },
    });
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    await prisma.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } }).catch(() => {});
    return NextResponse.json({ error: `Paiement indisponible : ${err?.message || 'erreur Stripe'}` }, { status: 502 });
  }
}
