import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { rateLimit, rateLimitExceeded } from '@/lib/rate-limit';

export async function POST(req: Request) {
  if (!rateLimit(req, 'reset-password', 10, 15 * 60 * 1000).ok) return rateLimitExceeded();
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || '');
  const password = String(body.password || '');
  if (!token || password.length < 6) return NextResponse.json({ error: 'Lien ou mot de passe invalide.' }, { status: 400 });
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || !record.identifier.startsWith('reset-password:') || record.expires < new Date()) {
    return NextResponse.json({ error: 'Ce lien a expiré. Demandez un nouvel email.' }, { status: 400 });
  }
  const email = record.identifier.replace('reset-password:', '');
  await prisma.user.update({ where: { email }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
  return NextResponse.json({ ok: true });
}
