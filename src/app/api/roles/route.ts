import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS, ALL_PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

function clean(perms: any): string[] {
  if (!Array.isArray(perms)) return [];
  return perms.filter((p) => (ALL_PERMISSIONS as string[]).includes(p));
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ROLES_MANAGE);
    const b = await req.json();
    const role = await prisma.role.create({
      data: { organizationId: ctx.org.id, name: b.name || 'Nouveau rôle', permissions: clean(b.permissions) },
    }).catch(() => null);
    if (!role) return NextResponse.json({ error: 'Nom de rôle déjà utilisé' }, { status: 409 });
    return NextResponse.json(role);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ROLES_MANAGE);
    const b = await req.json();
    const role = await prisma.role.findUnique({ where: { id: b.id } });
    if (!role || role.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    const updated = await prisma.role.update({
      where: { id: b.id },
      data: { name: b.name ?? role.name, permissions: b.permissions ? clean(b.permissions) : undefined },
    });
    return NextResponse.json(updated);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ROLES_MANAGE);
    const b = await req.json();
    const role = await prisma.role.findUnique({ where: { id: b.id } });
    if (!role || role.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    await prisma.role.delete({ where: { id: b.id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
