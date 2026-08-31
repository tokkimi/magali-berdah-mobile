import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ACCOUNTING_EDIT);
    const b = await req.json();
    const c = await prisma.category.create({
      data: {
        organizationId: ctx.org.id,
        name: b.name || 'Catégorie',
        kind: b.kind === 'INCOME' ? 'INCOME' : 'EXPENSE',
        color: b.color || null,
      },
    }).catch(() => null);
    if (!c) return NextResponse.json({ error: 'Catégorie déjà existante' }, { status: 409 });
    return NextResponse.json(c);
  } catch (e) { return handleApiError(e); }
}
