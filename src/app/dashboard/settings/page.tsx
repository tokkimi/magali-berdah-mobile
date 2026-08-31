import { requirePermission } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { PERMISSIONS } from '@/lib/permissions';
import { siteUrlFor, rootDomain } from '@/lib/utils';
import { SettingsClient } from './client';
import { TEMPLATES } from '@/lib/templates';
import { isVielusosSite } from '@/lib/vielusos';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const ctx = await requirePermission(PERMISSIONS.ORG_SETTINGS);
  const org = ctx.organization!;
  const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: org.id } });
  return (
    <SettingsClient
      org={{ name: org.name, planStatus: org.planStatus, paidAt: org.paidAt ? String(org.paidAt) : null, profile: org.profile }}
      user={{ name: ctx.user.name || '', email: ctx.user.email, emailVerified: ctx.user.emailVerified ? String(ctx.user.emailVerified) : null }}
      site={{ name: site.name, subdomain: site.subdomain, customDomain: site.customDomain, domainVerified: site.domainVerified, published: site.published }}
      freeUrl={siteUrlFor(site.subdomain, null)}
      rootDomain={rootDomain()}
      canDomain={ctx.permissions.has(PERMISSIONS.SITE_DOMAIN)}
      categories={TEMPLATES.map((template) => ({ id: template.id, name: template.name }))}
      branded={isVielusosSite(site)}
    />
  );
}
