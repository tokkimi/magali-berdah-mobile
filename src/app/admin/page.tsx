import { requirePlatformAdmin } from '@/lib/platform-admin';
import { prisma } from '@/lib/prisma';
import { siteUrlFor } from '@/lib/utils';
import { planFor } from '@/lib/plans';
import { AdminClient } from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requirePlatformAdmin();
  const [organizations, userCount, contactCount] = await Promise.all([
    prisma.organization.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        site: true,
        memberships: {
          where: { systemRole: 'OWNER' },
          include: { user: true },
          take: 1,
        },
        platformMessages: { orderBy: { createdAt: 'asc' }, take: 200 },
      },
    }),
    prisma.user.count(),
    prisma.contactMessage.count(),
  ]);
  // Per-org paid amount, honouring the chosen plan (99 €/an or 250 € à vie) and
  // the exact amount stored on a bank-transfer request, instead of a flat 250 €.
  const orgAmount = (org: (typeof organizations)[number]) => {
    const profile = (org.profile || {}) as Record<string, any>;
    const manual = (profile.easyassoManualPayment || {}) as Record<string, any>;
    return Number(manual.amountEur) || planFor(profile.plan).amountEur;
  };
  const validatedRevenue = organizations
    .filter((org) => org.planStatus === 'ACTIVE')
    .reduce((sum, org) => sum + orgAmount(org), 0);
  const pendingRevenue = organizations
    .filter((org) => {
      const manual = ((org.profile || {}) as any).easyassoManualPayment || {};
      return org.planStatus === 'PENDING_PAYMENT' || manual.status === 'WAITING_TRANSFER';
    })
    .reduce((sum, org) => sum + orgAmount(org), 0);

  // ---- Visitor analytics (last 30 days) ----
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [events, totalViews] = await Promise.all([
    prisma.siteEvent.findMany({ where: { type: 'pageview', createdAt: { gte: since } }, select: { path: true, referrer: true, createdAt: true, organizationId: true }, orderBy: { createdAt: 'desc' }, take: 20000 }),
    prisma.siteEvent.count({ where: { type: 'pageview' } }),
  ]);
  const orgName = new Map(organizations.map((o) => [o.id, o.name]));
  const dayFmt = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris' });
  const hourFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', hour12: false });
  const wdFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' });
  const byDayMap = new Map<string, number>();
  const byHour = Array.from({ length: 24 }, () => 0);
  const byWeekday = new Map<string, number>();
  const refMap = new Map<string, number>();
  const orgViews = new Map<string, number>();
  const pageMap = new Map<string, number>();
  const refHost = (ref: string | null) => {
    if (!ref) return 'Accès direct';
    try { return new URL(ref).hostname.replace(/^www\./, ''); } catch { return 'Autre'; }
  };
  for (const e of events) {
    byDayMap.set(dayFmt.format(e.createdAt), (byDayMap.get(dayFmt.format(e.createdAt)) || 0) + 1);
    byHour[Number(hourFmt.format(e.createdAt)) % 24] += 1;
    byWeekday.set(wdFmt.format(e.createdAt), (byWeekday.get(wdFmt.format(e.createdAt)) || 0) + 1);
    refMap.set(refHost(e.referrer), (refMap.get(refHost(e.referrer)) || 0) + 1);
    orgViews.set(e.organizationId, (orgViews.get(e.organizationId) || 0) + 1);
    const p = e.path || 'accueil';
    pageMap.set(p, (pageMap.get(p) || 0) + 1);
  }
  const days = Array.from({ length: 14 }, (_, i) => {
    const key = dayFmt.format(new Date(Date.now() - (13 - i) * 86400000));
    return { label: key.slice(5), value: byDayMap.get(key) || 0 };
  });
  const weekdayOrder = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const top = (m: Map<string, number>, n = 8) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }));
  const analytics = {
    total: totalViews,
    last30: events.length,
    byDay: days,
    byHour: byHour.map((value, hour) => ({ label: `${hour}h`, value })),
    byWeekday: weekdayOrder.map((label) => ({ label, value: byWeekday.get(label) || 0 })),
    referrers: top(refMap),
    topOrgs: [...orgViews.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, value]) => ({ label: orgName.get(id) || 'Association', value })),
    topPages: top(pageMap),
  };

  return (
    <AdminClient
      analytics={analytics}
      stats={{
        organizations: organizations.length,
        users: userCount,
        active: organizations.filter((org) => org.planStatus === 'ACTIVE').length,
        pending: organizations.filter((org) => org.planStatus !== 'ACTIVE').length,
        trials: organizations.filter((org) => org.planStatus === 'TRIAL').length,
        validatedRevenue,
        pendingRevenue,
        contactMessages: contactCount,
      }}
      organizations={organizations.map((org) => {
        const owner = org.memberships[0]?.user;
        const profile = (org.profile || {}) as Record<string, any>;
        const manual = (profile.easyassoManualPayment || {}) as Record<string, any>;
        const plan = planFor(profile.plan);
        const amountEur = Number(manual.amountEur) || plan.amountEur;
        // How they paid (or intend to): a bank-transfer request creates a manual
        // record; an active org with no manual record paid by card.
        const paymentMethod = manual.status ? 'transfer' : org.planStatus === 'ACTIVE' ? 'card' : '';
        return {
          id: org.id,
          name: org.name,
          planStatus: org.planStatus,
          plan: plan.id,
          amountEur,
          paymentMethod,
          phone: String(profile.phone || ''),
          city: String(profile.city || ''),
          renewsAt: typeof profile.planRenewsAt === 'string' ? profile.planRenewsAt : null,
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
          thread: org.platformMessages.map((m) => ({ id: m.id, fromAdmin: m.fromAdmin, authorName: m.authorName, body: m.body, createdAt: m.createdAt.toISOString() })),
          unreadFromOrg: org.platformMessages.filter((m) => !m.fromAdmin && !m.readByAdmin).length,
        };
      })}
    />
  );
}
