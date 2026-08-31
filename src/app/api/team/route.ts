import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { token } from '@/lib/utils';

// Invite a member by email: { email, systemRole }
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const email = String(b.email || '').toLowerCase();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    // If user exists, add membership directly; else create an invitation.
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existing = await prisma.membership.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId: ctx.org.id } },
      });
      if (existing) return NextResponse.json({ error: 'Déjà membre' }, { status: 409 });
      await prisma.membership.create({
        data: { userId: user.id, organizationId: ctx.org.id, systemRole: b.systemRole || 'MEMBER' },
      });
      return NextResponse.json({ ok: true, added: true });
    }

    const inv = await prisma.invitation.upsert({
      where: { organizationId_email: { organizationId: ctx.org.id, email } },
      update: { systemRole: b.systemRole || 'MEMBER', token: token() },
      create: { organizationId: ctx.org.id, email, systemRole: b.systemRole || 'MEMBER', token: token(), invitedById: ctx.userId },
    });
    return NextResponse.json({ ok: true, invited: true, token: inv.token });
  } catch (e) { return handleApiError(e); }
}

// Update a member role: { membershipId, systemRole, roleId }
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const m = await prisma.membership.findUnique({ where: { id: b.membershipId } });
    if (!m || m.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    if (m.systemRole === 'OWNER') return NextResponse.json({ error: 'Le propriétaire ne peut pas être modifié.' }, { status: 400 });
    await prisma.membership.update({
      where: { id: b.membershipId },
      data: { systemRole: b.systemRole || m.systemRole, roleId: b.roleId === '' ? null : b.roleId ?? m.roleId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}

// Remove a member: { membershipId }
export async function DELETE(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.TEAM_MANAGE);
    const b = await req.json();
    const m = await prisma.membership.findUnique({ where: { id: b.membershipId } });
    if (!m || m.organizationId !== ctx.org.id) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
    if (m.systemRole === 'OWNER') return NextResponse.json({ error: 'Impossible de retirer le propriétaire.' }, { status: 400 });
    await prisma.membership.delete({ where: { id: b.membershipId } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
