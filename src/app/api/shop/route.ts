import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { defaultStyleFor } from '@/lib/blocks';

function revalidateShop(site: { subdomain: string; customDomain?: string | null }) {
  revalidatePath(`/s/${site.subdomain}`);
  revalidatePath(`/s/${site.subdomain}/boutique`);
  if (site.customDomain) {
    revalidatePath(`/domain/${site.customDomain}`);
    revalidatePath(`/domain/${site.customDomain}/boutique`);
  }
}

async function ensureBoutiquePage(site: NonNullable<Awaited<ReturnType<typeof prisma.site.findUnique>>>) {
  const existing = await prisma.page.findFirst({ where: { siteId: site.id, slug: 'boutique' } });
  if (existing) {
    await prisma.page.update({ where: { id: existing.id }, data: { showInNav: true } });
    return existing;
  }

  const last = await prisma.page.aggregate({ where: { siteId: site.id }, _max: { order: true } });
  return prisma.page.create({
    data: {
      siteId: site.id,
      title: 'Boutique',
      slug: 'boutique',
      order: (last._max.order ?? 0) + 1,
      isHome: false,
      showInNav: true,
      blocks: {
        create: [
          { type: 'banner', order: 0, content: { title: 'Notre boutique', subtitle: 'Découvrez notre sélection.', overlay: 40, height: 340, image: 'https://picsum.photos/seed/boutique/1600/700' } as any, style: defaultStyleFor('banner') as any },
          { type: 'shop', order: 1, content: { title: '', intro: '', search: true, showCategories: true, columns: 4 } as any, style: defaultStyleFor('shop') as any },
        ],
      },
    },
  });
}

// Toggle the online shop on/off for this organization. The public Boutique page
// follows the switch: enabled = created/shown, disabled = hidden from visitors.
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const body = await req.json().catch(() => ({}));
    const enabled = !!body.enabled;
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id } });
    await prisma.organization.update({
      where: { id: ctx.org.id },
      data: { profile: { ...((org?.profile as any) || {}), hasShop: enabled, shopEnabled: enabled } },
    });

    if (site && enabled) {
      await ensureBoutiquePage(site);
      revalidateShop(site);
      return NextResponse.json({ ok: true, enabled, hasBoutiquePage: true, slug: 'boutique' });
    }

    if (site && !enabled) {
      await prisma.page.updateMany({ where: { siteId: site.id, slug: 'boutique' }, data: { showInNav: false } });
      revalidateShop(site);
    }

    return NextResponse.json({ ok: true, enabled, hasBoutiquePage: false });
  } catch (e) { return handleApiError(e); }
}
