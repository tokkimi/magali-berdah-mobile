import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { IdentityClient } from './client';
import { isVielusosSite } from '@/lib/vielusos';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function IdentityPage() {
  const ctx = await requirePermission(PERMISSIONS.SITE_EDIT);
  const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.organization!.id } });
  if (isVielusosSite(site)) redirect('/dashboard/editor');
  return (
    <IdentityClient
      theme={(site.theme as any) || {}}
      header={(site.header as any) || {}}
      footer={(site.footer as any) || {}}
      branded={false}
    />
  );
}
