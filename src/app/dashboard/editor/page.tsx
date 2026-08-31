import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { siteUrlFor } from '@/lib/utils';
import { EditorClient } from './editor-client';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function EditorPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_VIEW);
  const site = await prisma.site.findUniqueOrThrow({
    where: { organizationId: ctx.organization!.id },
    include: { pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } } },
  });

  return (
    <EditorClient
      key={site.updatedAt.toISOString()}
      site={JSON.parse(JSON.stringify(site))}
      canEdit={ctx.permissions.has(PERMISSIONS.SITE_EDIT)}
      canPublish={ctx.permissions.has(PERMISSIONS.SITE_PUBLISH)}
      siteUrl={siteUrlFor(site.subdomain, site.customDomain, site.domainVerified)}
      branded={isVielusosSite(site)}
    />
  );
}
