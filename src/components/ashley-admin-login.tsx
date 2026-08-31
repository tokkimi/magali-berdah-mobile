'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';

export function AshleyAdminLogin() {
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
    <main
      className="grid min-h-screen place-items-center px-4 text-[#1b1030]"
      style={{ background: 'radial-gradient(1200px 600px at 15% -10%, #ffe9f6 0%, transparent 60%), radial-gradient(1000px 600px at 100% 0%, #efe7ff 0%, transparent 55%), #fbf6ff' }}
    >
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl text-lg font-black text-white"
            style={{ background: 'linear-gradient(135deg, #ff2e93, #7b3cff 55%, #22e3e3)' }}
          >
            A
          </span>
          <span className="text-2xl font-black tracking-[0.28em]">ASHLEY</span>
        </Link>
        <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-2xl backdrop-blur-xl">
          <h1 className="text-xl font-extrabold">Connexion</h1>
          <p className="mt-2 text-sm text-[#8a7bb0]">Administration du site ASHLEY · Techno Doll</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6b5d94]">Email</label>
              <input
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#ff2e93]"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#6b5d94]">Mot de passe</label>
              <input
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-[#ff2e93]"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button
              className="w-full rounded-xl px-4 py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ff2e93, #7b3cff)' }}
              disabled={loading}
            >
              {loading ? '…' : 'Se connecter'}
            </button>
          </form>
          <Link href="/forgot-password" className="mt-4 block text-center text-sm font-semibold text-[#8a7bb0] hover:text-[#1b1030]">
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </main>
  );
}
