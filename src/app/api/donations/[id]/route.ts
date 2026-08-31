import { NextResponse } from 'next/server';
import { requireApiPermission, handleApiError, ApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

async function owned(id: string, orgId: string) {
  const d = await prisma.donation.findUnique({ where: { id } });
  if (!d || d.organizationId !== orgId) throw new ApiError(404, 'Don introuvable');
  return d;
}

function cleanProofs(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((proof: any) => ({
      name: String(proof?.name || 'Justificatif').slice(0, 140),
      url: String(proof?.url || '').slice(0, 2_000_000),
      uploadedAt: String(proof?.uploadedAt || new Date().toISOString()),
    }))
    .filter((proof) => proof.url);
}

async function requestJson(req: Request) {
  const text = await req.text();
  if (!text.trim()) return {};
  return JSON.parse(text);
}

// Issue a fiscal receipt, edit a donation, or confirm a pending pledge.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await requestJson(req);
    if (b.issueReceipt || Object.keys(b).length === 0) {
      const ctx = await requireApiPermission(PERMISSIONS.RECEIPTS_MANAGE);
      await owned(id, ctx.org.id);
      const year = new Date().getFullYear();
      const count = await prisma.donation.count({ where: { organizationId: ctx.org.id, receiptIssued: true } });
      const receiptNumber = `${year}-${String(count + 1).padStart(4, '0')}`;
      const d = await prisma.donation.update({ where: { id }, data: { receiptIssued: true, receiptNumber } });
      return NextResponse.json(d);
    }

    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    await owned(id, ctx.org.id);
    const status = b.status || undefined;
    const donatedAt = b.donatedAt ? new Date(b.donatedAt) : undefined;
    const proofDocuments = cleanProofs(b.proofDocuments);
    const d = await prisma.donation.update({
      where: { id },
      data: {
        donorId: 'donorId' in b ? (b.donorId || null) : undefined,
        campaignId: 'campaignId' in b ? (b.campaignId || null) : undefined,
        amountCents: b.amountEuros !== undefined ? Math.round((Number(b.amountEuros) || 0) * 100) : undefined,
        method: b.method || undefined,
        status,
        donatedAt,
        receivedAt: status === 'COMPLETED' ? (b.receivedAt ? new Date(b.receivedAt) : donatedAt || new Date()) : undefined,
        receivedReference: 'receivedReference' in b ? (b.receivedReference || null) : undefined,
        message: 'message' in b ? (b.message || null) : undefined,
        proofDocuments: proofDocuments as any,
      },
    });
    return NextResponse.json(d);
  } catch (e) { return handleApiError(e); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ctx = await requireApiPermission(PERMISSIONS.DONATIONS_EDIT);
    await owned(id, ctx.org.id);
    await prisma.donation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) { return handleApiError(e); }
}
