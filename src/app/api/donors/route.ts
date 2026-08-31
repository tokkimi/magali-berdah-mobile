import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.DONORS_EDIT);
    const b = await req.json();
    const donor = await prisma.donor.create({
      data: {
        organizationId: ctx.org.id,
        firstName: b.firstName || '',
        lastName: b.lastName || '',
        email: b.email || null,
        phone: b.phone || null,
        address: b.address || null,
        city: b.city || null,
        postalCode: b.postalCode || null,
        type: b.type || 'INDIVIDUAL',
        notes: b.notes || null,
        tags: Array.isArray(b.tags) ? b.tags : [],
      },
    });
    return NextResponse.json(donor);
  } catch (e) { return handleApiError(e); }
}
