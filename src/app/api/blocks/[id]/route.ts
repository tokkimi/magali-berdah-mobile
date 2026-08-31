import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

async function assertBlock(id: string, orgId: string) {
  const block = await prisma.block.findUnique({ where: { id }, include: { page: { include: { site: true } } } });
  if (!block || block.page.site.organizationId !== orgId) throw new ApiError(404, 'Bloc introuvable');
  return block;
}

// Update block content/style
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    await assertBlock(id, ctx.org.id);
    const body = await req.json();
    const data: any = {};
    if (body.content !== undefined) data.content = body.content;
    if (body.style !== undefined) data.style = body.style;
    const updated = await prisma.block.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    await assertBlock(id, ctx.org.id);
    await prisma.block.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
