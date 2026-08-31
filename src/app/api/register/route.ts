import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createOrganizationForUser } from '@/lib/bootstrap';
import { sendVerificationEmail } from '@/lib/mail';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';

const schema = z.object({
  name: z.string().trim().min(1),
  assoName: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  language: z.enum(['fr', 'en']).default('fr'),
  plan: z.enum(['lifetime', 'annual', 'monthly']).optional().default('lifetime'),
  // Easy Asso is open to everyone. These are independent: you can be an
  // association, have an online shop, both, or neither.
  isAssociation: z.boolean().optional().default(true),
  hasShop: z.boolean().optional().default(false),
  // Association details are optional at signup — the association can fill them
  // in later from Settings.
  phone: z.string().trim().optional().default(''),
  city: z.string().trim().optional().default(''),
  legalName: z.string().trim().optional().default(''),
  registrationNumber: z.string().trim().optional().default(''),
  legalAddress: z.string().trim().optional().default(''),
  legalCountry: z.string().trim().optional().default('France'),
  publicationDirector: z.string().trim().optional().default(''),
});

export async function POST(req: Request) {
  if (!rateLimit(req, 'register', 8, 60 * 60 * 1000).ok) return rateLimitExceeded();
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Champs invalides', details: parsed.error.flatten() }, { status: 400 });
  }
  const { name, assoName, email, password, language, plan, isAssociation, hasShop, phone, city, legalName, registrationNumber, legalAddress, legalCountry, publicationDirector } = parsed.data;
  const lower = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email: lower, passwordHash } });
  await createOrganizationForUser(user.id, assoName, language, false, {
    plan,
    isAssociation,
    hasShop,
    shopEnabled: hasShop,
    email: lower,
    phone,
    city,
    legalName: legalName || assoName,
    registrationNumber,
    legalAddress,
    legalCountry,
    publicationDirector: publicationDirector || name,
  });
  await sendVerificationEmail(lower, language).catch((error) => console.error('Verification email failed', error));

  return NextResponse.json({ ok: true });
}
