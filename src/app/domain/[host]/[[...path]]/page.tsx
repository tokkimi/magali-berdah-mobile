import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { RenderSite, loadSiteByDomain, siteMetadata } from '@/components/site/RenderSite';
import { VIELUSOS_SUBDOMAIN } from '@/lib/vielusos';

// Cache verified custom-domain pages on the CDN, refreshing in the background
// at most once a minute (edits call revalidatePath for an immediate refresh).
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ host: string }> }): Promise<Metadata> {
  const { host } = await params;
  const domain = decodeURIComponent(host);
  const apex = domain.replace(/^www\./i, '');
  const site = await prisma.site.findFirst({ where: { customDomain: { in: [domain, apex, `www.${apex}`] }, domainVerified: true }, select: { name: true, header: true, footer: true } });
  const brandedSubdomain = apex.toLowerCase() === 'vielusos.com' ? VIELUSOS_SUBDOMAIN : undefined;
  return siteMetadata(site, brandedSubdomain);
}

// Rendered for verified custom domains (rewritten by middleware). basePath is
// empty because the domain root maps directly to the site.
export default async function CustomDomainSite({ params }: { params: Promise<{ host: string; path?: string[] }> }) {
  const { host, path } = await params;
  const site = await loadSiteByDomain(decodeURIComponent(host));
  return <RenderSite site={site as any} basePath="" slug={path?.[0]} />;
}
