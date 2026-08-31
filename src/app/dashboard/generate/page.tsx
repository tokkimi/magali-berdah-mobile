import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { TEMPLATES } from '@/lib/templates';
import { GenerateClient } from './client';
import { redirect } from 'next/navigation';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function GeneratePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const ctx = await requirePermission(PERMISSIONS.SITE_EDIT);
  const { welcome } = await searchParams;
  const categories = TEMPLATES.map((t) => ({ id: t.id, name: t.name }));
  const previews = TEMPLATES.map((t) => ({ id: t.id, name: t.name, preview: t.preview, family: t.family }));
  const site = await prisma.site.findUnique({
    where: { organizationId: ctx.organization!.id },
    select: { subdomain: true, header: true, footer: true },
  });
  if (isVielusosSite(site)) redirect('/dashboard');
  const header = (site?.header as any) || {};
  const footer = (site?.footer as any) || {};
  const initialLogo = header.logoUrl || footer.logoUrl || '';
  return <GenerateClient orgName={ctx.organization!.name} profile={(ctx.organization!.profile as any) || {}} categories={categories} previews={previews} welcome={!!welcome} initialLogo={initialLogo} />;
}
