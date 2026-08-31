import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

async function owned(id: string, orgId: string) {
  const d = await prisma.donor.findUnique({ where: { id } });
  if (!d || d.organizationId !== orgId) throw new ApiError(404, 'Donateur introuvable');
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.DONORS_EDIT);
    await owned(id, ctx.org.id);
    const b = await req.json();
    const donor = await prisma.donor.update({
      where: { id },
      data: {
        firstName: b.firstName, lastName: b.lastName, email: b.email || null, phone: b.phone || null,
        address: b.address || null, city: b.city || null, postalCode: b.postalCode || null,
        type: b.type, notes: b.notes || null, tags: Array.isArray(b.tags) ? b.tags : undefined,
      },
    });
    return NextResponse.json(donor);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.DONORS_EDIT);
    await owned(id, ctx.org.id);
    await prisma.donor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
