import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { attachDomainToEasyAsso, normalizeCustomerDomain, removeDomainFromEasyAsso } from '@/lib/vercel-domains';

// Update site: header/footer/theme/publish/customDomain
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Domain changes need a dedicated permission
    if (body.customDomain !== undefined) {
      const ctx = await requireApiPermission(PERMISSIONS.SITE_DOMAIN);
      const domain = normalizeCustomerDomain(body.customDomain);
      const current = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
      if (domain === current.customDomain) return NextResponse.json(current);

      // A customer domain is added as an alias of this project. This never
      // replaces or edits EasyAsso's own production domain.
      if (domain) await attachDomainToEasyAsso(domain);
      const site = await prisma.site.update({
        where: { organizationId: ctx.org.id },
        data: { customDomain: domain || null, domainVerified: false },
      });
      if (current.customDomain) {
        try { await removeDomainFromEasyAsso(current.customDomain); } catch (error) { console.error('Unable to remove previous customer domain', error); }
      }
      return NextResponse.json(site);
    }

    const ctx = await requireApiPermission(body.published !== undefined ? PERMISSIONS.SITE_PUBLISH : PERMISSIONS.SITE_EDIT);
    const data: any = {};
    if (body.header !== undefined) data.header = body.header;
    if (body.footer !== undefined) data.footer = body.footer;
    if (body.theme !== undefined) data.theme = body.theme;
    if (body.name !== undefined) {
      data.name = body.name;
      if (body.header === undefined && body.footer === undefined) {
        const current = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id }, select: { header: true, footer: true } });
        const language = ((ctx.org.profile as any)?.language === 'en' ? 'en' : 'fr') as 'fr' | 'en';
        data.header = { ...((current.header as any) || {}), logoText: body.name };
        data.footer = {
          ...((current.footer as any) || {}),
          logoText: body.name,
          allRightsText: language === 'en'
            ? `© ${new Date().getFullYear()} ${body.name}. All rights reserved.`
            : `© ${new Date().getFullYear()} ${body.name}. Tous droits réservés.`,
        };
      }
    }
    if (body.published !== undefined) data.published = !!body.published;
    const site = await prisma.site.update({ where: { organizationId: ctx.org.id }, data });
    return NextResponse.json(site);
  } catch (e) {
    return handleApiError(e);
  }
}
