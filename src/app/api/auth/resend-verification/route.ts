import { NextResponse } from 'next/server';
import { requireOrg } from '@/lib/session';
import { sendVerificationEmail } from '@/lib/mail';

export async function POST() {
  const ctx = await requireOrg();
  if (ctx.user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });
  const language = ((ctx.organization?.profile as any)?.language === 'en' ? 'en' : 'fr') as 'fr' | 'en';
  await sendVerificationEmail(ctx.user.email, language).catch((error) => console.error('Verification resend failed', error));
  return NextResponse.json({ ok: true });
}
