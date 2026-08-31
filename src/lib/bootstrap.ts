import { prisma } from './prisma';
import { randomSubdomain } from './utils';
import { DEFAULT_HEADER, DEFAULT_FOOTER } from './blocks';
import { DEFAULT_THEME } from './colors';
import { SYSTEM_ROLE_PERMISSIONS } from './permissions';
import { TEMPLATES } from './templates';
import { applyTemplateToSite } from './apply-template';

// Creates an organization + default site + starter pages for a user, and makes
// the user the OWNER. Returns the created organization.
export async function createOrganizationForUser(userId: string, assoName: string, language: 'fr' | 'en' = 'fr', paymentRequired = false, profile: Record<string, unknown> = {}) {
  const baseSlug = assoName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'association';

  // Ensure unique org slug
  let slug = baseSlug;
  let i = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  // Ensure unique subdomain
  let subdomain = randomSubdomain();
  while (await prisma.site.findUnique({ where: { subdomain } })) {
    subdomain = randomSubdomain();
  }

  const org = await prisma.organization.create({
    data: {
      name: assoName,
      slug,
      planStatus: paymentRequired ? 'PENDING_PAYMENT' : 'TRIAL',
      trialEndsAt: paymentRequired ? null : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3-day free trial
      profile: { ...profile, language },
      memberships: { create: { userId, systemRole: 'OWNER' } },
      site: {
        create: {
          name: assoName,
          subdomain,
          published: !paymentRequired, // live immediately during the trial, not before a chosen payment is confirmed
          theme: DEFAULT_THEME as any,
          header: { ...DEFAULT_HEADER, logoText: assoName } as any,
          footer: {
            ...DEFAULT_FOOTER,
            logoText: assoName,
            allRightsText: `© ${new Date().getFullYear()} ${assoName}. Tous droits réservés.`,
          } as any,
        },
      },
      // Seed a couple of default custom roles mirroring system roles (editable)
      roles: {
        create: [
          { name: 'Bénévole communication', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.EDITOR },
          { name: 'Trésorier', isSystem: false, permissions: SYSTEM_ROLE_PERMISSIONS.ACCOUNTANT },
        ],
      },
      // Default accounting categories
      categories: {
        create: [
          { name: 'Dons', kind: 'INCOME', color: '#22c55e' },
          { name: 'Cotisations', kind: 'INCOME', color: '#0ea5e9' },
          { name: 'Subventions', kind: 'INCOME', color: '#a855f7' },
          { name: 'Frais de fonctionnement', kind: 'EXPENSE', color: '#f97316' },
          { name: 'Événements', kind: 'EXPENSE', color: '#ec4899' },
        ],
      },
    },
    include: { site: true },
  });

  // Populate the site with the first ready-made template so it looks great
  // from the start. The association can switch template anytime.
  await applyTemplateToSite(org.site!.id, TEMPLATES[0], assoName, { ...profile, language });

  return org;
}
