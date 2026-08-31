import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.CAMPAIGNS_EDIT);
    const b = await req.json();
    const c = await prisma.campaign.create({
      data: {
        organizationId: ctx.org.id,
        name: b.name || 'Nouvelle campagne',
        description: b.description || null,
        goalCents: Math.round((Number(b.goalEuros) || 0) * 100),
        status: b.status || 'ACTIVE',
        externalUrl: b.externalUrl || null,
        startDate: b.startDate ? new Date(b.startDate) : null,
        endDate: b.endDate ? new Date(b.endDate) : null,
      },
    });
    return NextResponse.json(c);
  } catch (e) { return handleApiError(e); }
}
