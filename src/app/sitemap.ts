import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
const BASE_URL = ROOT.includes('localhost') ? `http://${ROOT}` : `https://${ROOT}`;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketing: MetadataRoute.Sitemap = ['', '/login', '/register', '/cgv'].map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.5,
  }));

  let sites: { subdomain: string; customDomain: string | null; domainVerified: boolean; updatedAt: Date }[] = [];
  try {
    sites = await prisma.site.findMany({
      where: { published: true },
      select: { subdomain: true, customDomain: true, domainVerified: true, updatedAt: true },
      take: 5000,
    });
  } catch { /* DB unreachable at build — return marketing only */ }

  const tenants: MetadataRoute.Sitemap = sites.map((s) => ({
    url: siteUrlFor(s.subdomain, s.customDomain, s.domainVerified),
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...marketing, ...tenants];
}
