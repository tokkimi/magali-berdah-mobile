import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';
import { canShowPublicSite } from '@/lib/plan';

const schema = z.object({
  organizationId: z.string().min(1),
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(250),
  phone: z.string().trim().max(60).optional().default(''),
  subject: z.string().trim().max(200).optional().default(''),
  message: z.string().trim().min(10).max(8000),
  website: z.string().max(0).optional().default(''),
});

export async function POST(req: Request) {
  if (!rateLimit(req, 'contact', 20, 15 * 60 * 1000).ok) return rateLimitExceeded();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Veuillez vérifier les champs du formulaire.' }, { status: 400 });
  const { website: _honeypot, ...data } = parsed.data;
  const organization = await prisma.organization.findUnique({
    where: { id: data.organizationId },
    select: { id: true, planStatus: true, trialEndsAt: true, site: { select: { published: true } } },
  });
  if (!organization?.site?.published || !canShowPublicSite(organization)) return NextResponse.json({ error: 'Site indisponible.' }, { status: 404 });
  await prisma.contactMessage.create({ data });
  return NextResponse.json({ ok: true });
}
