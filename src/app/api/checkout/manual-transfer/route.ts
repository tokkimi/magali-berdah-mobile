import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { platformBankDetails } from '@/lib/platform-admin';
import { planAccess } from '@/lib/plan';
import { canUpgradePlan, planFor } from '@/lib/plans';

function paymentReference(org: { id: string; slug: string }, existing?: string) {
  const cleanId = org.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const neutralReference = `EA-${cleanId.slice(-10) || 'DOSSIER'}`;
  if (existing === neutralReference) return existing;
  return neutralReference;
}

export async function POST(req: Request) {
  const ctx = await requireOrg();
  const org = ctx.organization!;

  const body = await req.json().catch(() => ({}));
  const plan = planFor(body?.plan);
  const currentProfile = (org.profile || {}) as Record<string, any>;
  const currentPlan = planFor(currentProfile.plan);
  const isActiveUpgrade = org.planStatus === 'ACTIVE' && canUpgradePlan(currentPlan.id, plan.id);
  if (org.planStatus === 'ACTIVE' && !isActiveUpgrade) {
    return NextResponse.json({ error: 'Votre formule est déjà active. Vous pouvez seulement passer à une formule supérieure.' }, { status: 400 });
  }

  // A monthly plan is a recurring card subscription; it can't be paid by a
  // one-off bank transfer.
  if (plan.id === 'monthly') {
    return NextResponse.json(
      { error: 'La formule mensuelle se règle par carte (prélèvement automatique). Choisissez la formule annuelle ou à vie pour payer par virement.' },
      { status: 400 }
    );
  }

  const currentManual = (currentProfile.easyassoManualPayment || {}) as Record<string, any>;
  const reference = paymentReference(org, currentManual.reference);
  const requestedAt = currentManual.requestedAt || new Date().toISOString();
  const nextUnpaidStatus = org.planStatus === 'ACTIVE' ? 'ACTIVE' : planAccess(org).hasAccess ? org.planStatus : 'PENDING_PAYMENT';

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      planStatus: nextUnpaidStatus,
      profile: {
        ...currentProfile,
        ...(isActiveUpgrade ? { pendingPlan: plan.id, pendingPlanRequestedAt: new Date().toISOString() } : { plan: plan.id }),
        easyassoManualPayment: {
          ...currentManual,
          method: 'BANK_TRANSFER',
          status: 'WAITING_TRANSFER',
          plan: plan.id,
          amountEur: plan.amountEur,
          reference,
          requestedAt,
          upgrade: isActiveUpgrade,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    plan: plan.id,
    amountEur: plan.amountEur,
    reference,
    bank: platformBankDetails(),
  });
}
