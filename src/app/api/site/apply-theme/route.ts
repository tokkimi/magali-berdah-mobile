import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

// Applies theme (colours + font) + logo, and recolours all buttons/CTAs across
// the site so a colour change is visible everywhere.
export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.SITE_EDIT);
    const b = await req.json();
    const theme = b.theme || {};
    const primary = theme.primary || '#1b5df5';
    const logoUrl = b.logoUrl || undefined;

    const site = await prisma.site.findUniqueOrThrow({
      where: { organizationId: ctx.org.id },
      include: { pages: { include: { blocks: true } } },
    });
    const header: any = { ...(site.header as any), logoUrl: logoUrl ?? (site.header as any)?.logoUrl };
    header.cta = { ...(header.cta || {}), color: primary };
    const footer: any = { ...(site.footer as any), logoUrl: logoUrl ?? (site.footer as any)?.logoUrl };

    const updates: any[] = [
      prisma.site.update({ where: { id: site.id }, data: { theme, header, footer } }),
    ];

    // Recolour every block button to the new primary colour.
    for (const page of site.pages) {
      for (const block of page.blocks) {
        const content: any = block.content;
        if (content && content.button && content.button.color) {
          const next = { ...content, button: { ...content.button, color: content.button.variant === 'solid' && content.button.color === '#ffffff' ? '#ffffff' : primary } };
          updates.push(prisma.block.update({ where: { id: block.id }, data: { content: next } }));
        }
      }
    }
    await prisma.$transaction(updates);
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
