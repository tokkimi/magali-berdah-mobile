import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';
import { permissionsForMembership, type Permission, type SystemRole } from './permissions';
export { planAccess } from './plan';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export interface OrgContext {
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
  organization: Awaited<ReturnType<typeof prisma.organization.findFirst>>;
  membership: { systemRole: SystemRole };
  permissions: Set<string>;
}

// Loads the current user's primary organization + effective permissions.
export async function requireOrg(): Promise<OrgContext> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { organization: true, role: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!membership) redirect('/onboarding');

  const permissions = permissionsForMembership(
    membership.systemRole as SystemRole,
    membership.role?.permissions
  );

  return {
    user,
    organization: membership.organization,
    membership: { systemRole: membership.systemRole as SystemRole },
    permissions,
  };
}

export async function requirePermission(permission: Permission): Promise<OrgContext> {
  const ctx = await requireOrg();
  if (!ctx.permissions.has(permission)) redirect('/dashboard?denied=1');
  return ctx;
}

