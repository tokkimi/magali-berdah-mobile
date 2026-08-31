import { requirePermission } from '@/lib/session';
import { PERMISSIONS } from '@/lib/permissions';
import { TEMPLATES } from '@/lib/templates';
import { ThemesClient } from './client';

export const dynamic = 'force-dynamic';

export default async function ThemesPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  await requirePermission(PERMISSIONS.SITE_EDIT);
  const { welcome } = await searchParams;
  const templates = TEMPLATES.map((t) => ({ id: t.id, name: t.name, category: t.category, family: t.family, tagline: t.tagline, preview: t.preview, primary: t.theme.primary }));
  return <ThemesClient templates={templates} welcome={!!welcome} />;
}
