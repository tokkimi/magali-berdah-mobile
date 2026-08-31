import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let ok = false;
  if (token) {
    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (record && record.identifier.startsWith('verify-email:') && record.expires >= new Date()) {
      const email = record.identifier.replace('verify-email:', '');
      await prisma.user.update({ where: { email }, data: { emailVerified: new Date() } });
      await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
      ok = true;
    }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="card max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900">{ok ? 'Email confirmé ✅' : 'Lien invalide ou expiré'}</h1>
        <p className="mt-2 text-gray-600">{ok ? 'Votre compte EasyAsso est sécurisé.' : 'Demandez un nouveau lien depuis votre tableau de bord.'}</p>
        <Link href="/dashboard" className="btn btn-primary mt-5">Aller au tableau de bord</Link>
      </div>
    </div>
  );
}
