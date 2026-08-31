'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export function VielusosAdminLogin() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [router, status]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (result?.error) return setError('Email ou mot de passe incorrect.');
    router.push('/dashboard');
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#08080c] bg-[url(/vielusos/background.png)] bg-cover bg-center px-4 text-white">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3 text-xl text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/vielusos/logo.png" alt="" className="h-14 w-14 object-contain" />
          <span className="font-light uppercase tracking-[0.28em]">VIELUSOS</span>
        </Link>
        <div className="rounded-3xl border border-white/15 bg-black/65 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="text-xl font-bold text-white">Connexion</h1>
          <p className="mt-2 text-sm text-white/55">Administration du site VIELUSOS</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="mb-1 block text-sm font-medium text-white/75">Email</label><input className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#d33f5c]" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <div><label className="mb-1 block text-sm font-medium text-white/75">Mot de passe</label><input className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#d33f5c]" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="w-full rounded-xl bg-[#d33f5c] px-4 py-3 font-bold text-white transition hover:bg-[#e3516e]" disabled={loading}>{loading ? '…' : 'Se connecter'}</button>
          </form>
          <Link href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-white/65 hover:text-white">Mot de passe oublié ?</Link>
        </div>
      </div>
    </main>
  );
}
