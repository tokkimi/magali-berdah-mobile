import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { permissionsForMembership, type Permission, type SystemRole } from './permissions';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Resolve the caller's org membership + permissions for API routes.
export async function apiContext() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) throw new ApiError(401, 'Non authentifié');

  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true, role: true },
    orderBy: { createdAt: 'asc' },
  });
  if (!membership) throw new ApiError(403, 'Aucune organisation');

  const permissions = permissionsForMembership(
    membership.systemRole as SystemRole,
    membership.role?.permissions
  );
  return { userId, org: membership.organization, systemRole: membership.systemRole as SystemRole, permissions };
}

export async function requireApiPermission(permission: Permission) {
  const ctx = await apiContext();
  if (!ctx.permissions.has(permission)) throw new ApiError(403, 'Permission refusée');
  return ctx;
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error(err);
  return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
}

// Ensures a page/block belongs to the caller's org (defense in depth).
export async function assertPageInOrg(pageId: string, orgId: string) {
  const page = await prisma.page.findUnique({ where: { id: pageId }, include: { site: true } });
  if (!page || page.site.organizationId !== orgId) throw new ApiError(404, 'Page introuvable');
  return page;
}
