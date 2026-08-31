import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.ACCOUNTING_EDIT);
    const t = await prisma.transaction.findUnique({ where: { id } });
    if (!t || t.organizationId !== ctx.org.id) throw new ApiError(404, 'Introuvable');
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
