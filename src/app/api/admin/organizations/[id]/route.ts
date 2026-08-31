import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200),
  ownerName: z.string().trim().max(200).optional().default(''),
  ownerEmail: z.string().trim().email().optional(),
  planStatus: z.enum(['TRIAL', 'PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED', 'CANCELLED']),
  trialEndsAt: z.string().trim().optional().default(''),
  published: z.boolean().optional().default(false),
  ownerIsSuperAdmin: z.boolean().optional().default(false),
  adminNote: z.string().max(5000).optional().default(''),
});

function serializeOrganization(org: any) {
  const owner = org.memberships?.[0]?.user;
  const profile = (org.profile || {}) as Record<string, any>;
  const manual = (profile.easyassoManualPayment || {}) as Record<string, any>;
  return {
    id: org.id,
    name: org.name,
    planStatus: org.planStatus,
    createdAt: org.createdAt.toISOString(),
    trialEndsAt: org.trialEndsAt ? org.trialEndsAt.toISOString() : null,
    paidAt: org.paidAt ? org.paidAt.toISOString() : null,
    ownerId: owner?.id || '',
    ownerEmail: owner?.email || '',
    ownerName: owner?.name || '',
    ownerEmailVerified: owner?.emailVerified ? owner.emailVerified.toISOString() : null,
    ownerIsSuperAdmin: owner?.isSuperAdmin || false,
    published: org.site?.published || false,
    adminNote: String(profile.platformAdminNote || ''),
    siteUrl: org.site ? siteUrlFor(org.site.subdomain, org.site.customDomain, org.site.domainVerified) : '#',
    manual: {
      reference: manual.reference || '',
      amountEur: manual.amountEur || 250,
      status: manual.status || '',
      requestedAt: manual.requestedAt || '',
      validatedAt: manual.validatedAt || '',
      bankReference: manual.bankReference || '',
      proofSubmittedAt: manual.proofSubmittedAt || '',
      proofNote: manual.proofNote || '',
      proofFile: manual.proofFile || null,
    },
  };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePlatformAdmin();
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });

  const existing = await prisma.organization.findUnique({
    where: { id },
    include: { site: true, memberships: { where: { systemRole: 'OWNER' }, include: { user: true }, take: 1 } },
  });
  if (!existing) return NextResponse.json({ error: 'Association introuvable.' }, { status: 404 });
  const owner = existing.memberships[0]?.user;

  if (owner && parsed.data.ownerEmail && parsed.data.ownerEmail.toLowerCase() !== owner.email.toLowerCase()) {
    const conflict = await prisma.user.findUnique({ where: { email: parsed.data.ownerEmail.toLowerCase() } });
    if (conflict && conflict.id !== owner.id) return NextResponse.json({ error: 'Cet email est déjà utilisé par un autre compte.' }, { status: 409 });
  }

  const profile = (existing.profile || {}) as Record<string, any>;
  await prisma.$transaction(async (tx) => {
    await tx.organization.update({
      where: { id },
      data: {
        name: parsed.data.name,
        planStatus: parsed.data.planStatus,
        trialEndsAt: parsed.data.trialEndsAt ? new Date(`${parsed.data.trialEndsAt}T23:59:59.000Z`) : null,
        paidAt: parsed.data.planStatus === 'ACTIVE' ? (existing.paidAt || new Date()) : existing.paidAt,
        profile: { ...profile, platformAdminNote: parsed.data.adminNote },
      },
    });
    if (existing.site) await tx.site.update({ where: { id: existing.site.id }, data: { name: parsed.data.name, published: parsed.data.published } });
    if (owner) {
      await tx.user.update({
        where: { id: owner.id },
        data: {
          name: parsed.data.ownerName || null,
          email: parsed.data.ownerEmail ? parsed.data.ownerEmail.toLowerCase() : owner.email,
          emailVerified: parsed.data.ownerEmail && parsed.data.ownerEmail.toLowerCase() !== owner.email.toLowerCase() ? null : owner.emailVerified,
          isSuperAdmin: owner.id === admin.id ? true : parsed.data.ownerIsSuperAdmin,
        },
      });
    }
  });

  const updated = await prisma.organization.findUniqueOrThrow({
    where: { id },
    include: { site: true, memberships: { where: { systemRole: 'OWNER' }, include: { user: true }, take: 1 } },
  });
  return NextResponse.json({ organization: serializeOrganization(updated) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requirePlatformAdmin();
  const { id } = await params;
  const existing = await prisma.organization.findUnique({
    where: { id },
    include: { memberships: { where: { systemRole: 'OWNER' }, include: { user: true }, take: 1 } },
  });
  if (!existing) return NextResponse.json({ error: 'Association introuvable.' }, { status: 404 });
  const owner = existing.memberships[0]?.user;

  await prisma.organization.delete({ where: { id } });

  if (owner && owner.id !== admin.id && !owner.isSuperAdmin) {
    const remainingMemberships = await prisma.membership.count({ where: { userId: owner.id } });
    if (remainingMemberships === 0) await prisma.user.delete({ where: { id: owner.id } });
  }

  return NextResponse.json({ ok: true });
}
