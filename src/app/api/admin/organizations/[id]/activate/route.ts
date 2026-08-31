import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';
import { activateOrganization } from '@/lib/activation';

const schema = z.object({
  reference: z.string().trim().max(120).optional().default(''),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requirePlatformAdmin();
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Référence invalide.' }, { status: 400 });

  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return NextResponse.json({ error: 'Organisation introuvable.' }, { status: 404 });

  const currentProfile = (org.profile || {}) as Record<string, any>;
  const currentManual = (currentProfile.easyassoManualPayment || {}) as Record<string, any>;
  await prisma.organization.update({
    where: { id },
    data: {
      profile: {
        ...currentProfile,
        ...(currentManual.plan ? { plan: currentManual.plan, pendingPlan: null, pendingPlanRequestedAt: null } : {}),
        easyassoManualPayment: {
          ...currentManual,
          status: 'VALIDATED',
          validatedAt: new Date().toISOString(),
          bankReference: parsed.data.reference || currentManual.bankReference || '',
        },
      },
    },
  });

  await activateOrganization(id, parsed.data.reference ? `manual-transfer:${parsed.data.reference}` : 'manual-transfer');
  return NextResponse.json({ ok: true });
}
