import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS, PERMISSION_GROUPS, SYSTEM_ROLE_LABELS } from '@/lib/permissions';
import { TeamClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const ctx = await requirePermission(PERMISSIONS.TEAM_VIEW);
  const orgId = ctx.organization!.id;
  const [memberships, roles, invitations, site] = await Promise.all([
    prisma.membership.findMany({ where: { organizationId: orgId }, include: { user: true, role: true }, orderBy: { createdAt: 'asc' } }),
    prisma.role.findMany({ where: { organizationId: orgId }, orderBy: { name: 'asc' } }),
    prisma.invitation.findMany({ where: { organizationId: orgId, acceptedAt: null }, orderBy: { createdAt: 'desc' } }),
    prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } }),
  ]);
  const branded = isVielusosSite(site);
  const groups = branded ? PERMISSION_GROUPS
    .filter((group) => group.label !== 'Donateurs (CRM)' && group.label !== 'Campagnes & dons')
    .map((group) => ({ ...group, items: group.items.map((item) => item.key === PERMISSIONS.ORG_SETTINGS ? { ...item, label: 'Paramètres du site' } : item.key === PERMISSIONS.EXPORTS ? { ...item, help: 'Export comptable' } : item) })) : PERMISSION_GROUPS;
  return (
    <TeamClient
      members={JSON.parse(JSON.stringify(memberships))}
      roles={JSON.parse(JSON.stringify(roles))}
      invitations={JSON.parse(JSON.stringify(invitations))}
      groups={groups}
      roleLabels={SYSTEM_ROLE_LABELS}
      canManageTeam={ctx.permissions.has(PERMISSIONS.TEAM_MANAGE)}
      canManageRoles={ctx.permissions.has(PERMISSIONS.ROLES_MANAGE)}
      currentUserId={ctx.user.id}
    />
  );
}
