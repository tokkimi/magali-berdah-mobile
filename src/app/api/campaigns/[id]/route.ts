import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

async function owned(id: string, orgId: string) {
  const c = await prisma.campaign.findUnique({ where: { id } });
  if (!c || c.organizationId !== orgId) throw new ApiError(404, 'Campagne introuvable');
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.CAMPAIGNS_EDIT);
    await owned(id, ctx.org.id);
    const b = await req.json();
    const c = await prisma.campaign.update({
      where: { id },
      data: {
        name: b.name, description: b.description || null, status: b.status,
        externalUrl: b.externalUrl || null,
        goalCents: b.goalEuros !== undefined ? Math.round(Number(b.goalEuros) * 100) : undefined,
      },
    });
    return NextResponse.json(c);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.CAMPAIGNS_EDIT);
    await owned(id, ctx.org.id);
    await prisma.campaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
