import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { domainStatus } from '@/lib/vercel-domains';

// Best-effort verification: fetches the custom domain and checks it resolves to
// this Easy Asso site. In production, pair this with your host's domain API
// (e.g. Vercel Domains) for automatic SSL + DNS validation.
export async function POST() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_DOMAIN);
    const site = await prisma.site.findUniqueOrThrow({ where: { organizationId: ctx.org.id } });
    if (!site.customDomain) return NextResponse.json({ error: 'Aucun domaine configuré' }, { status: 400 });

    const status = await domainStatus(site.customDomain);
    const verified = status.verified;

    const updated = await prisma.site.update({ where: { id: site.id }, data: { domainVerified: verified } });
    return NextResponse.json({ verified: updated.domainVerified, verification: status.verification });
  } catch (e) { return handleApiError(e); }
}
