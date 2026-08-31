import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { ShopClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const org = ctx.organization!;
  const [products, site, orders] = await Promise.all([
    prisma.product.findMany({ where: { organizationId: org.id }, orderBy: { order: 'asc' } }),
    prisma.site.findUnique({ where: { organizationId: org.id }, include: { pages: { select: { slug: true } } } }),
    prisma.order.findMany({ where: { organizationId: org.id, status: { in: ['PAID', 'SHIPPED'] } }, orderBy: { createdAt: 'desc' }, take: 50, include: { items: true } }),
  ]);
  const profile = (org.profile as any) || {};
  const enabled = Boolean(profile.shopEnabled ?? profile.hasShop);
  const boutiqueUrl = site ? `${siteUrlFor(site.subdomain, site.customDomain, site.domainVerified)}/boutique` : '';
  const hasBoutiquePage = Boolean(site?.pages.some((p) => p.slug === 'boutique'));
  return (
    <ShopClient
      enabled={enabled}
      initial={JSON.parse(JSON.stringify(products))}
      boutiqueUrl={boutiqueUrl}
      hasBoutiquePage={hasBoutiquePage}
      connectStarted={Boolean(profile.stripeConnectAccountId)}
      connectReady={Boolean(profile.stripeConnectReady)}
      orders={JSON.parse(JSON.stringify(orders))}
    />
  );
}
