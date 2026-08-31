import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { MessagesClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';
export default async function MessagesPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const orgId = ctx.organization!.id;
  const site = await prisma.site.findUnique({ where: { organizationId: orgId }, select: { subdomain: true } });
  const branded = isVielusosSite(site);
  const [messages, conversation] = await Promise.all([
    prisma.contactMessage.findMany({ where: { organizationId: orgId, archivedAt: null }, orderBy: { createdAt: 'desc' } }),
    branded ? Promise.resolve([]) : prisma.platformMessage.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'asc' }, take: 200 }),
  ]);
  return <MessagesClient initial={JSON.parse(JSON.stringify(messages))} conversation={JSON.parse(JSON.stringify(conversation))} branded={branded} organizationName={ctx.organization!.name} />;
}
