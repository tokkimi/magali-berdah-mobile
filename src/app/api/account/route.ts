import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireOrg } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/mail';

const schema = z.object({
  name: z.string().trim().max(200).optional(),
  email: z.string().trim().email().optional(),
  currentPassword: z.string().optional().default(''),
  newPassword: z.string().min(6).optional().or(z.literal('')),
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Informations invalides.' }, { status: 400 });

  const nextEmail = parsed.data.email?.toLowerCase();
  const emailChanges = !!nextEmail && nextEmail !== user.email.toLowerCase();
  const passwordChanges = !!parsed.data.newPassword;
  if ((emailChanges || passwordChanges) && user.passwordHash) {
    const ok = await bcrypt.compare(parsed.data.currentPassword || '', user.passwordHash);
    if (!ok) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
  }
  if (emailChanges) {
    const conflict = await prisma.user.findUnique({ where: { email: nextEmail } });
    if (conflict && conflict.id !== user.id) return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name ?? user.name,
      email: nextEmail || user.email,
      emailVerified: emailChanges ? null : user.emailVerified,
      passwordHash: passwordChanges ? await bcrypt.hash(parsed.data.newPassword || '', 10) : user.passwordHash,
    },
  });

  if (emailChanges) {
    const ctx = await requireOrg();
    const profile = (ctx.organization?.profile || {}) as Record<string, any>;
    const language = profile.language === 'en' ? 'en' : 'fr';
    await sendVerificationEmail(updated.email, language).catch((error) => console.error('Verification email failed', error));
  }

  return NextResponse.json({ ok: true, email: updated.email, name: updated.name, emailVerified: updated.emailVerified });
}
