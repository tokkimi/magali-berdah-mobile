import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  donationCardEnabled: z.boolean().default(false), donationStripeUrl: z.string().url().or(z.literal('')).default(''), donationHelloAssoEnabled: z.boolean().default(false), donationHelloAssoUrl: z.string().url().or(z.literal('')).default(''),
  donationTransferEnabled: z.boolean().default(false), donationIban: z.string().max(80).default(''), donationBic: z.string().max(30).default(''), donationAccountHolder: z.string().max(200).default(''), donationBankName: z.string().max(200).default(''),
  donationChequeEnabled: z.boolean().default(false), donationChequePayable: z.string().max(200).default(''), donationChequeAddress: z.string().max(500).default(''),
  leetchiEnabled: z.boolean().default(false), leetchiUrl: z.string().url().or(z.literal('')).default(''), leetchiEmbedUrl: z.string().url().or(z.literal('')).default(''), leetchiEmbedCode: z.string().max(4000).default(''), leetchiCollectedEuros: z.coerce.number().min(0).optional().or(z.literal('')).default(''), leetchiGoalEuros: z.coerce.number().min(0).optional().or(z.literal('')).default(''),
});
export async function PATCH(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Réglages invalides.' }, { status: 400 });
    const profile = { ...((ctx.org.profile as any) || {}), ...parsed.data };
    await prisma.organization.update({ where: { id: ctx.org.id }, data: { profile } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
