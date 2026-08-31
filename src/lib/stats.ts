import { prisma } from './prisma';

export async function orgOverview(orgId: string) {
  const [donationAgg, donorCount, campaignCount, incomeAgg, expenseAgg, topDonors, recentDonations, pageviews] =
    await Promise.all([
      prisma.donation.aggregate({
        where: { organizationId: orgId, status: 'COMPLETED' },
        _sum: { amountCents: true },
        _count: true,
      }),
      prisma.donor.count({ where: { organizationId: orgId } }),
      prisma.campaign.count({ where: { organizationId: orgId } }),
      prisma.transaction.aggregate({ where: { organizationId: orgId, kind: 'INCOME' }, _sum: { amountCents: true } }),
      prisma.transaction.aggregate({ where: { organizationId: orgId, kind: 'EXPENSE' }, _sum: { amountCents: true } }),
      prisma.donation.groupBy({
        by: ['donorId'],
        where: { organizationId: orgId, status: 'COMPLETED', donorId: { not: null } },
        _sum: { amountCents: true },
        orderBy: { _sum: { amountCents: 'desc' } },
        take: 5,
      }),
      prisma.donation.findMany({
        where: { organizationId: orgId },
        orderBy: { donatedAt: 'desc' },
        take: 6,
        include: { donor: true, campaign: true },
      }),
      prisma.siteEvent.count({ where: { organizationId: orgId, type: 'pageview' } }),
    ]);

  const donorIds = topDonors.map((d) => d.donorId!).filter(Boolean);
  const donors = await prisma.donor.findMany({ where: { id: { in: donorIds } } });
  const topDonorsResolved = topDonors.map((t) => ({
    donor: donors.find((d) => d.id === t.donorId),
    total: t._sum.amountCents || 0,
  }));

  const income = (incomeAgg._sum.amountCents || 0) + (donationAgg._sum.amountCents || 0);
  const expense = expenseAgg._sum.amountCents || 0;

  return {
    totalDonationsCents: donationAgg._sum.amountCents || 0,
    donationCount: donationAgg._count,
    donorCount,
    campaignCount,
    incomeCents: income,
    expenseCents: expense,
    balanceCents: income - expense,
    topDonors: topDonorsResolved,
    recentDonations,
    pageviews,
  };
}

// 12-month time series of donation totals (cents)
export async function monthlyDonations(orgId: string) {
  const donations = await prisma.donation.findMany({
    where: { organizationId: orgId, status: 'COMPLETED' },
    select: { amountCents: true, donatedAt: true },
  });
  const now = new Date();
  const buckets: { label: string; cents: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ label: d.toLocaleDateString('fr-FR', { month: 'short' }), cents: 0 });
  }
  const startMonth = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  for (const don of donations) {
    const dd = new Date(don.donatedAt);
    if (dd < startMonth) continue;
    const idx = (dd.getFullYear() - startMonth.getFullYear()) * 12 + dd.getMonth() - startMonth.getMonth();
    if (idx >= 0 && idx < 12) buckets[idx].cents += don.amountCents;
  }
  return buckets;
}
