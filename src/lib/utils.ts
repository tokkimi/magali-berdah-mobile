import { customAlphabet } from 'nanoid';

// URL-safe slug fragments (no ambiguous chars)
const nano = customAlphabet('23456789abcdefghijkmnpqrstuvwxyz', 8);

const ASSO_WORDS = ['colibri', 'oasis', 'phenix', 'boreal', 'solidaire', 'lumiere', 'horizon', 'elan', 'graine', 'ruche'];

// Generate a random, friendly subdomain like "oasis-8kd2fa"
export function randomSubdomain(): string {
  const word = ASSO_WORDS[Math.floor(Math.random() * ASSO_WORDS.length)];
  return `${word}-${nano()}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'page';
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}

export function formatDate(d: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(d));
}

export function token(): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32)();
}

export function rootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
}

// Canonical public base URL of the app (no trailing slash). Falls back to the
// Vercel-provided production/deployment domain so Stripe redirects and e-mail
// links keep working even when NEXT_PUBLIC_APP_URL isn't set manually.
export function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;
  return 'http://localhost:3000';
}

export function siteUrlFor(subdomain: string, customDomain?: string | null, domainVerified = false): string {
  // Never send an owner or visitor to an unverified domain: DNS and SSL may
  // still point elsewhere. The permanent EasyAsso address remains available.
  if (customDomain && domainVerified) return `https://${customDomain}`;
  const root = rootDomain();
  const protocol = root.includes('localhost') ? 'http' : 'https';
  // Path-based routing keeps it working on Vercel without wildcard DNS setup
  return `${protocol}://${root.replace(/\/$/, '')}/s/${subdomain}`;
}
