import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';

const schema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  name: z.string().max(120).optional().default(''),
});

export async function POST(req: Request) {
  if (!rateLimit(req, 'customer-access', 20, 60 * 60 * 1000).ok) return rateLimitExceeded();
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 });

  const organization = await prisma.organization.findUnique({ where: { id: parsed.data.organizationId }, select: { id: true } });
  if (!organization) return NextResponse.json({ error: 'Site introuvable.' }, { status: 404 });

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();
  const profile = await prisma.customerProfile.upsert({
    where: { organizationId_email: { organizationId: organization.id, email } },
    update: { ...(name ? { name } : {}), lastSeenAt: new Date() },
    create: { organizationId: organization.id, email, name },
    select: { id: true, email: true, name: true },
  });

  return NextResponse.json({ profile });
}
