import type { MetadataRoute } from 'next';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
const BASE_URL = ROOT.includes('localhost') ? `http://${ROOT}` : `https://${ROOT}`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep private/app areas out of search results.
        disallow: ['/dashboard', '/admin', '/api/', '/onboarding', '/checkout', '/verify-email', '/reset-password', '/forgot-password'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
