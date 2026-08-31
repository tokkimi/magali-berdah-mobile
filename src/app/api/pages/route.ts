import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// Create a page
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { title } = await req.json();
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    const count = await prisma.page.count({ where: { siteId: site.id } });
    let slug = slugify(title || 'nouvelle-page');
    let i = 1;
    while (await prisma.page.findFirst({ where: { siteId: site.id, slug } })) slug = `${slugify(title)}-${i++}`;
    const page = await prisma.page.create({
      data: { siteId: site.id, title: title || 'Nouvelle page', slug, order: count },
    });
    return NextResponse.json(page);
  } catch (e) {
    return handleApiError(e);
  }
}

// Reorder pages: { ids: string[] }
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const { ids } = await req.json();
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    await prisma.$transaction(
      (ids as string[]).map((id, order) =>
        prisma.page.updateMany({ where: { id, siteId: site.id }, data: { order } })
      )
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
