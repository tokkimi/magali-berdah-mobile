import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, assertPageInOrg } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// Rename / update page settings
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const page = await assertPageInOrg(id, ctx.org.id);
    const body = await req.json();
    const data: any = {};
    if (typeof body.title === 'string') data.title = body.title;
    if (typeof body.showInNav === 'boolean') data.showInNav = body.showInNav;
    if (typeof body.seoTitle === 'string') data.seoTitle = body.seoTitle;
    if (typeof body.seoDescription === 'string') data.seoDescription = body.seoDescription;
    if (typeof body.slug === 'string' && !page.isHome) {
      let slug = slugify(body.slug);
      let i = 1;
      while (await prisma.page.findFirst({ where: { siteId: page.siteId, slug, id: { not: id } } })) slug = `${slugify(body.slug)}-${i++}`;
      data.slug = slug;
    }
    if (body.setHome === true) {
      await prisma.page.updateMany({ where: { siteId: page.siteId }, data: { isHome: false } });
      data.isHome = true;
      data.showInNav = true;
    }
    const updated = await prisma.page.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

// Delete page (cannot delete home)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const page = await assertPageInOrg(id, ctx.org.id);
    if (page.isHome) return NextResponse.json({ error: 'Impossible de supprimer la page d’accueil.' }, { status: 400 });
    await prisma.page.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
