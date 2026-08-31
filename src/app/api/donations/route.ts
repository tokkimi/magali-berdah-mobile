import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

function cleanProofs(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((proof: any) => ({
      name: String(proof?.name || 'Justificatif').slice(0, 140),
      url: String(proof?.url || '').slice(0, 2_000_000),
      uploadedAt: String(proof?.uploadedAt || new Date().toISOString()),
    }))
    .filter((proof) => proof.url);
}

export async function POST(req: Request) {
  try {
    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    const b = await req.json();
    const status = b.status || 'COMPLETED';
    const donatedAt = b.donatedAt ? new Date(b.donatedAt) : new Date();
    const donation = await prisma.donation.create({
      data: {
        organizationId: ctx.org.id,
        donorId: b.donorId || null,
        campaignId: b.campaignId || null,
        amountCents: Math.round((Number(b.amountEuros) || 0) * 100),
        method: b.method || 'CASH',
        status,
        isRecurring: !!b.isRecurring,
        message: b.message || null,
        donatedAt,
        receivedAt: status === 'COMPLETED' ? donatedAt : null,
        receivedReference: b.receivedReference || null,
        proofDocuments: cleanProofs(b.proofDocuments) as any,
      },
    });
    return NextResponse.json(donation);
  } catch (e) { return handleApiError(e); }
}
