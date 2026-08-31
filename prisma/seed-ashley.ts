/**
 * Seed du tenant ASHLEY.
 *
 * Idempotent : ne crée le site QUE s'il n'existe pas encore. Sur les
 * redéploiements suivants, on ne touche à rien — les modifications faites par
 * Ashley depuis /ashley-admin sont préservées.
 *
 * Lancé automatiquement au build (voir package.json). Ne fait rien si la base
 * n'est pas joignable.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createOrganizationForUser } from '../src/lib/bootstrap';
import { applyTemplateToSite } from '../src/lib/apply-template';
import {
  ashleyTemplate,
  ASHLEY_ORG_NAME,
  ASHLEY_SUBDOMAIN,
  ASHLEY_PROFILE,
  ASHLEY_ADMIN_EMAIL,
  ASHLEY_ADMIN_PASSWORD,
} from '../src/lib/ashley';

const prisma = new PrismaClient();

async function main() {
  // 1) Utilisateur admin
  let user = await prisma.user.findUnique({ where: { email: ASHLEY_ADMIN_EMAIL } });
  if (!user) {
    const passwordHash = await bcrypt.hash(ASHLEY_ADMIN_PASSWORD, 10);
    user = await prisma.user.create({
      data: { name: ASHLEY_ORG_NAME, email: ASHLEY_ADMIN_EMAIL, passwordHash, emailVerified: new Date() },
    });
    console.log('✅ Utilisateur admin créé :', ASHLEY_ADMIN_EMAIL);
  }

  // 2) Le site existe déjà ? → on ne réécrase rien.
  const existing = await prisma.membership.findFirst({
    where: { userId: user.id },
    include: { organization: { include: { site: true } } },
  });
  if (existing?.organization?.site) {
    console.log('ℹ️  Site ASHLEY déjà présent — aucune modification.');
    return;
  }

  // 3) Création de l'organisation + site, puis application du template ASHLEY.
  const org = await createOrganizationForUser(user.id, ASHLEY_ORG_NAME, 'fr', false, ASHLEY_PROFILE);

  // Sous-domaine fixe et lisible (URL : /s/ashley)
  try {
    await prisma.site.update({ where: { id: org.site!.id }, data: { subdomain: ASHLEY_SUBDOMAIN } });
  } catch {
    console.log('ℹ️  Sous-domaine "ashley" indisponible — conservation du sous-domaine aléatoire.');
  }

  await applyTemplateToSite(org.site!.id, ashleyTemplate(), ASHLEY_ORG_NAME, ASHLEY_PROFILE);

  // Activation + publication immédiate
  await prisma.organization.update({
    where: { id: org.id },
    data: { planStatus: 'ACTIVE', paidAt: new Date(), site: { update: { published: true } } },
  });

  console.log('✅ Site ASHLEY créé et publié.');
  console.log(`   Admin : ${ASHLEY_ADMIN_EMAIL} / ${ASHLEY_ADMIN_PASSWORD}`);
  console.log(`   Site public : /s/${ASHLEY_SUBDOMAIN}`);
}

main()
  .catch((e) => {
    console.error('Seed ASHLEY ignoré :', e?.message || e);
    process.exit(0); // ne bloque jamais le build
  })
  .finally(() => prisma.$disconnect());
