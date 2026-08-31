import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteBySubdomain, siteMetadata } from '@/components/site/RenderSite';

// Cache public pages and serve them from the CDN (fast worldwide), refreshing
// in the background at most once a minute. Edits call revalidatePath, so
// changes appear right away; otherwise a page self-refreshes within 60s.
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  const site = await prisma.site.findUnique({ where: { subdomain }, select: { name: true, header: true, footer: true } });
  return siteMetadata(site, subdomain);
}

export default async function PublicSite({ params }: { params: Promise<{ subdomain: string; path?: string[] }> }) {
  const { subdomain, path } = await params;
  const site = await loadSiteBySubdomain(subdomain);
  return <RenderSite site={site as any} basePath={`/s/${subdomain}`} slug={path?.[0]} />;
}
