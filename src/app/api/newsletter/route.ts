import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';
import { canShowPublicSite } from '@/lib/plan';

const schema = z.object({ orgId: z.string(), email: z.string().trim().email().max(250) });

export async function POST(req: Request) {
  if (!rateLimit(req, 'newsletter', 20, 15 * 60 * 1000).ok) return rateLimitExceeded();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const { orgId, email } = parsed.data;
  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { planStatus: true, trialEndsAt: true, site: { select: { published: true } } },
  });
  if (!organization?.site?.published || !canShowPublicSite(organization)) return NextResponse.json({ error: 'Site indisponible.' }, { status: 404 });
  await prisma.newsletterSubscriber
    .create({ data: { organizationId: orgId, email: email.toLowerCase() } })
    .catch(() => null); // ignore duplicates
  return NextResponse.json({ ok: true });
}
