import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { planAccess } from '@/lib/plan';

const schema = z.object({
  note: z.string().trim().max(1000).optional().default(''),
  file: z.object({
    name: z.string().max(160),
    type: z.string().max(80),
    dataUrl: z.string().max(2_800_000),
  }).optional(),
});

export async function POST(req: Request) {
  const ctx = await requireOrg();
  const org = ctx.organization!;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Preuve invalide.' }, { status: 400 });

  const currentProfile = (org.profile || {}) as Record<string, any>;
  const currentManual = (currentProfile.easyassoManualPayment || {}) as Record<string, any>;
  if (!currentManual.reference) {
    return NextResponse.json({ error: 'Affichez d’abord les informations de virement.' }, { status: 400 });
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      planStatus: org.planStatus === 'ACTIVE' ? 'ACTIVE' : planAccess(org).hasAccess ? org.planStatus : 'PENDING_PAYMENT',
      profile: {
        ...currentProfile,
        easyassoManualPayment: {
          ...currentManual,
          status: 'PROOF_SENT',
          proofNote: parsed.data.note,
          proofFile: parsed.data.file || null,
          proofSubmittedAt: new Date().toISOString(),
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
