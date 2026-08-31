import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createOrganizationForUser } from '../src/lib/bootstrap';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@easyasso.fr';
  const passwordHash = await bcrypt.hash('demo1234', 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Demo user already exists, skipping.');
    return;
  }

  const user = await prisma.user.create({ data: { name: 'Marie Démo', email, passwordHash } });
  const org = await createOrganizationForUser(user.id, 'Les Amis du Quartier');

  // Activate + publish so the demo is fully usable
  await prisma.organization.update({
    where: { id: org.id },
    data: { planStatus: 'ACTIVE', paidAt: new Date(), site: { update: { published: true } } },
  });

  // Seed donors + donations
  const donorsData = [
    { firstName: 'Jean', lastName: 'Martin', email: 'jean@example.com', city: 'Lyon' },
    { firstName: 'Sophie', lastName: 'Bernard', email: 'sophie@example.com', city: 'Paris' },
    { firstName: 'Ahmed', lastName: 'Khaled', email: 'ahmed@example.com', city: 'Marseille' },
    { firstName: 'Claire', lastName: 'Petit', email: 'claire@example.com', city: 'Nantes' },
  ];
  const donors = [];
  for (const d of donorsData) {
    donors.push(await prisma.donor.create({ data: { organizationId: org.id, ...d } }));
  }

  const campaign = await prisma.campaign.create({
    data: { organizationId: org.id, name: 'Rénovation du local', description: 'Aidez-nous à rénover notre local associatif.', goalCents: 500000, status: 'ACTIVE' },
  });

  const amounts = [5000, 15000, 3000, 25000, 8000, 12000, 4000, 30000];
  for (let i = 0; i < amounts.length; i++) {
    await prisma.donation.create({
      data: {
        organizationId: org.id,
        donorId: donors[i % donors.length].id,
        campaignId: i % 2 === 0 ? campaign.id : null,
        amountCents: amounts[i],
        method: ['CASH', 'CHECK', 'TRANSFER', 'STRIPE'][i % 4],
        status: 'COMPLETED',
        donatedAt: new Date(Date.now() - i * 15 * 86400000),
      },
    });
  }

  await prisma.transaction.createMany({
    data: [
      { organizationId: org.id, kind: 'EXPENSE', label: 'Location salle', amountCents: 12000 },
      { organizationId: org.id, kind: 'EXPENSE', label: 'Matériel', amountCents: 8500 },
      { organizationId: org.id, kind: 'INCOME', label: 'Subvention mairie', amountCents: 50000 },
    ],
  });

  console.log('✅ Seed terminé.');
  console.log('   Connexion démo : demo@easyasso.fr / demo1234');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
