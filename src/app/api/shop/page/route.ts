import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { defaultStyleFor } from '@/lib/blocks';

// Create a ready-made "Boutique" page (banner + shop catalogue) on the site,
// and make sure the shop is enabled. Returns the existing page if there's
// already one at /boutique.
export async function POST() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id }, include: { pages: true } });
    if (!site) return NextResponse.json({ error: 'Aucun site à équiper.' }, { status: 404 });

    // Ensure the shop is enabled.
    const org = await prisma.organization.findUnique({ where: { id: ctx.org.id } });
    await prisma.organization.update({
      where: { id: ctx.org.id },
      data: { profile: { ...((org?.profile as any) || {}), hasShop: true, shopEnabled: true } },
    });

    const existing = site.pages.find((p) => p.slug === 'boutique');
    if (existing) {
      await prisma.page.update({ where: { id: existing.id }, data: { showInNav: true } });
      revalidatePath(`/s/${site.subdomain}`);
      revalidatePath(`/s/${site.subdomain}/boutique`);
      if (site.customDomain) {
        revalidatePath(`/domain/${site.customDomain}`);
        revalidatePath(`/domain/${site.customDomain}/boutique`);
      }
      return NextResponse.json({ ok: true, slug: 'boutique', existed: true });
    }

    const order = site.pages.reduce((m, p) => Math.max(m, p.order), 0) + 1;
    await prisma.page.create({
      data: {
        siteId: site.id,
        title: 'Boutique',
        slug: 'boutique',
        order,
        isHome: false,
        showInNav: true,
        blocks: {
          create: [
            { type: 'banner', order: 0, content: { title: 'Notre boutique', subtitle: 'Découvrez notre sélection.', overlay: 40, height: 360, image: 'https://picsum.photos/seed/boutique/1600/700' } as any, style: defaultStyleFor('banner') as any },
            { type: 'shop', order: 1, content: { title: '', intro: '', search: true, showCategories: true, columns: 4 } as any, style: defaultStyleFor('shop') as any },
          ],
        },
      },
    });

    revalidatePath(`/s/${site.subdomain}`);
    revalidatePath(`/s/${site.subdomain}/boutique`);
    if (site.customDomain) revalidatePath(`/domain/${site.customDomain}/boutique`);

    return NextResponse.json({ ok: true, slug: 'boutique', existed: false });
  } catch (e) { return handleApiError(e); }
}
