import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { legalDocuments } from '@/lib/legal';

const schema = z.object({
  language: z.enum(['fr', 'en']).optional().default('fr'),
  year: z.string().max(4).optional().default(''),
  category: z.string().max(80).optional().default(''),
  mission: z.string().max(6000).optional().default(''),
  functioning: z.string().max(6000).optional().default(''),
  actions: z.string().max(6000).optional().default(''),
  beneficiaries: z.string().max(2000).optional().default(''),
  goodToKnow: z.string().max(6000).optional().default(''),
  slogan: z.string().max(180).optional().default(''),
  generateCgv: z.boolean().optional().default(true),
  city: z.string().max(200).optional().default(''),
  email: z.string().email().or(z.literal('')).optional().default(''),
  phone: z.string().max(60).optional().default(''),
  legalName: z.string().max(300).optional().default(''),
  registrationNumber: z.string().max(120).optional().default(''),
  legalAddress: z.string().max(500).optional().default(''),
  legalCountry: z.string().max(120).optional().default(''),
  publicationDirector: z.string().max(300).optional().default(''),
  facebook: z.string().url().or(z.literal('')).optional().default(''),
  instagram: z.string().url().or(z.literal('')).optional().default(''),
  linkedin: z.string().url().or(z.literal('')).optional().default(''),
  youtube: z.string().url().or(z.literal('')).optional().default(''),
  tiktok: z.string().url().or(z.literal('')).optional().default(''),
  twitter: z.string().url().or(z.literal('')).optional().default(''),
});

export async function GET() {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ORG_SETTINGS);
    const org = await prisma.organization.findUniqueOrThrow({ where: { id: ctx.org.id }, select: { profile: true } });
    return NextResponse.json(org.profile);
  } catch (e) { return handleApiError(e); }
}

export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.ORG_SETTINGS);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });
    const org = await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile: { ...((ctx.org.profile as Record<string, unknown>) || {}), ...parsed.data } }, select: { profile: true, name: true } });
    const site = await prisma.site.findUnique({ where: { organizationId: ctx.org.id } });
    if (site) {
      const footer = (site.footer as any) || {};
      const legal = legalDocuments(parsed.data, org.name);
      const socialLinks = [
        ['Facebook', parsed.data.facebook], ['Instagram', parsed.data.instagram],
        ['LinkedIn', parsed.data.linkedin], ['YouTube', parsed.data.youtube],
        ['TikTok', parsed.data.tiktok], ['X', parsed.data.twitter],
      ].filter((entry) => entry[1]).map(([label, href]) => ({ label, href }));
      const baseColumns = (footer.columns || []).filter((column: any) => column.title !== 'Réseaux sociaux');
      const generateLegal = parsed.data.generateCgv !== false;
      await prisma.site.update({ where: { id: site.id }, data: { footer: {
        ...footer,
        text: parsed.data.slogan || (parsed.data.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.'),
        showCgv: generateLegal,
        showMentions: generateLegal,
        mentionsContent: generateLegal ? legal.details : '',
        cgvContent: generateLegal ? legal.cgv : '',
        allRightsText: parsed.data.language === 'en'
          ? `© ${new Date().getFullYear()} ${org.name}. All rights reserved.`
          : `© ${new Date().getFullYear()} ${org.name}. Tous droits réservés.`,
        columns: socialLinks.length ? [...baseColumns, { title: 'Réseaux sociaux', links: socialLinks }] : baseColumns,
      } } });
    }
    return NextResponse.json(org.profile);
  } catch (e) { return handleApiError(e); }
}
