import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ACCOUNTING_EDIT);
    const b = await req.json();
    const t = await prisma.transaction.create({
      data: {
        organizationId: ctx.org.id,
        kind: b.kind === 'INCOME' ? 'INCOME' : 'EXPENSE',
        label: b.label || 'Opération',
        amountCents: Math.round((Number(b.amountEuros) || 0) * 100),
        categoryId: b.categoryId || null,
        method: b.method || 'OTHER',
        reference: b.reference || null,
        date: b.date ? new Date(b.date) : new Date(),
      },
    });
    return NextResponse.json(t);
  } catch (e) { return handleApiError(e); }
}
