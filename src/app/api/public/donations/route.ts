import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';
import { canShowPublicSite } from '@/lib/plan';

const schema = z.object({
  organizationId: z.string().min(1), amountEuros: z.coerce.number().positive().max(1000000),
  firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100),
  email: z.string().email().max(200), birthDate: z.string().max(20).optional().default(''),
  address: z.string().max(300).optional().default(''), postalCode: z.string().max(30).optional().default(''),
  city: z.string().max(100).optional().default(''), method: z.enum(['STRIPE', 'HELLOASSO', 'CHECK', 'TRANSFER', 'OTHER']).default('OTHER'),
  website: z.string().max(0).optional().default(''),
});

export async function POST(request: Request) {
  try {
    if (!rateLimit(request, 'public-donation', 20, 15 * 60 * 1000).ok) return rateLimitExceeded();
    const body = schema.parse(await request.json());
    const organization = await prisma.organization.findUnique({
      where: { id: body.organizationId },
      select: { id: true, planStatus: true, trialEndsAt: true, site: { select: { published: true } } },
    });
    if (!organization?.site?.published || !canShowPublicSite(organization)) return NextResponse.json({ error: 'Association introuvable' }, { status: 404 });
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.donor.findFirst({ where: { organizationId: body.organizationId, email: { equals: body.email, mode: 'insensitive' } } });
      const donorData = { firstName: body.firstName, lastName: body.lastName, email: body.email, address: body.address || null, postalCode: body.postalCode || null, city: body.city || null, notes: body.birthDate ? `Date de naissance : ${body.birthDate}` : undefined };
      const donor = existing ? await tx.donor.update({ where: { id: existing.id }, data: donorData }) : await tx.donor.create({ data: { organizationId: body.organizationId, ...donorData } });
      const donation = await tx.donation.create({ data: { organizationId: body.organizationId, donorId: donor.id, amountCents: Math.round(body.amountEuros * 100), method: body.method, status: 'PENDING', message: 'Don initié depuis le site public' } });
      return { donationId: donation.id };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Informations invalides' }, { status: 400 });
    console.error('Public donation error', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
