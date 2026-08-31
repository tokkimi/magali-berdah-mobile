import { prisma } from './prisma';

// Marks an organization as paid + active, and publishes its site.
export async function activateOrganization(orgId: string, stripeSessionId?: string) {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      planStatus: 'ACTIVE',
      paidAt: new Date(),
      stripeSessionId: stripeSessionId ?? undefined,
      site: { update: { published: true } },
    },
  });
}
