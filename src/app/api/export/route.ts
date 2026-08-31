import { requireApiPermission, handleApiError } from '@/lib/api';
import { PERMISSIONS } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

function csv(rows: (string | number)[][]): string {
  return rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}
function download(body: string, filename: string) {
  return new Response('﻿' + body, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}

export async function GET(req: Request) {
  try {
    const type = new URL(req.url).searchParams.get('type') || 'donations';
    const ctx = await requireApiPermission(PERMISSIONS.EXPORTS);
    const orgId = ctx.org.id;

    if (type === 'donors') {
      const donors = await prisma.donor.findMany({ where: { organizationId: orgId }, orderBy: { lastName: 'asc' } });
      const rows: any[][] = [['Prénom', 'Nom', 'Email', 'Téléphone', 'Ville', 'Code postal', 'Type']];
      donors.forEach((d) => rows.push([d.firstName, d.lastName, d.email, d.phone, d.city, d.postalCode, d.type]));
      return download(csv(rows), 'donateurs.csv');
    }

    if (type === 'accounting') {
      const [tx, donations] = await Promise.all([
        prisma.transaction.findMany({ where: { organizationId: orgId }, include: { category: true }, orderBy: { date: 'desc' } }),
        prisma.donation.findMany({ where: { organizationId: orgId, status: 'COMPLETED' }, include: { donor: true, campaign: true }, orderBy: { donatedAt: 'desc' } }),
      ]);
      const rows: any[][] = [['Date', 'Type', 'ID opération', 'Référence', 'Libellé', 'Donateur / tiers', 'Email', 'Campagne', 'Catégorie', 'Méthode', 'Statut', 'Montant (€)', 'Reçu fiscal', 'Justificatifs']];
      donations.forEach((d) => {
        const proofs = Array.isArray(d.proofDocuments) ? d.proofDocuments : [];
        rows.push([
          (d.receivedAt || d.donatedAt).toISOString().slice(0, 10),
          'RECETTE',
          d.id,
          d.receivedReference || d.stripePaymentId || '',
          `Don (${d.method})`,
          d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Anonyme',
          d.donor?.email || '',
          d.campaign?.name || '',
          'Dons',
          d.method,
          d.status,
          (d.amountCents / 100).toFixed(2),
          d.receiptNumber || '',
          proofs.map((p: any) => p.name).join(' | '),
        ]);
      });
      tx.forEach((t) => rows.push([t.date.toISOString().slice(0, 10), t.kind === 'INCOME' ? 'RECETTE' : 'DÉPENSE', t.id, t.reference || '', t.label, '', '', '', t.category?.name || '', t.method, 'COMPLETED', (t.amountCents / 100).toFixed(2), '', '']));
      return download(csv(rows), 'comptabilite.csv');
    }

    // donations
    const donations = await prisma.donation.findMany({
      where: { organizationId: orgId }, include: { donor: true, campaign: true }, orderBy: { donatedAt: 'desc' },
    });
    const rows: any[][] = [['Date', 'ID don', 'Statut', 'Donateur', 'Email', 'Campagne', 'Méthode', 'Référence', 'Montant (€)', 'Reçu', 'Justificatifs']];
    donations.forEach((d) => rows.push([
      (d.receivedAt || d.donatedAt).toISOString().slice(0, 10),
      d.id,
      d.status,
      d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Anonyme',
      d.donor?.email || '', d.campaign?.name || '', d.method, d.receivedReference || d.stripePaymentId || '', (d.amountCents / 100).toFixed(2), d.receiptNumber || '',
      (Array.isArray(d.proofDocuments) ? d.proofDocuments : []).map((p: any) => p.name).join(' | '),
    ]));
    return download(csv(rows), 'dons.csv');
  } catch (e) { return handleApiError(e); }
}
