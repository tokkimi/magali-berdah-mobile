'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { GoogleButton } from '../google-button';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { status } = useSession();
  const [branded, setBranded] = useState(params.get('vielusos') === '1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hostname === 'vielusos.com' || window.location.hostname === 'www.vielusos.com') setBranded(true);
  }, []);
  useEffect(() => {
    if (branded && status === 'authenticated') router.replace('/dashboard');
  }, [branded, router, status]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { redirect: false, email, password });
    setLoading(false);
    if (res?.error) return setError('Email ou mot de passe incorrect.');
    router.push(params.get('callbackUrl') || '/dashboard');
  }

  return (
    <div className={`grid min-h-screen place-items-center px-4 ${branded ? 'bg-[#08080c] bg-[url(/vielusos/background.png)] bg-cover bg-center text-white' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">
        <Link href="/" className={`mb-6 flex items-center justify-center gap-3 text-xl font-extrabold ${branded ? 'text-white' : 'text-brand-700'}`}>
          {branded ? <><img src="/vielusos/logo.png" alt="" className="h-14 w-14 object-contain" /><span className="font-light uppercase tracking-[0.28em]">VIELUSOS</span></> : <><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">E</span> Easy Asso</>}
        </Link>
        <div className={branded ? 'rounded-3xl border border-white/15 bg-black/65 p-6 shadow-2xl backdrop-blur-xl' : 'card'}>
          <h1 className={`text-xl font-bold ${branded ? 'text-white' : 'text-gray-900'}`}>Connexion</h1>
          {branded && <p className="mt-2 text-sm text-white/55">Administration du site VIELUSOS</p>}
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className={branded ? 'mb-1 block text-sm font-medium text-white/75' : 'label'}>Email</label>
              <input className={branded ? 'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#d33f5c]' : 'input'} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={branded ? 'mb-1 block text-sm font-medium text-white/75' : 'label'}>Mot de passe</label>
              <input className={branded ? 'w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#d33f5c]' : 'input'} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className={branded ? 'w-full rounded-xl bg-[#d33f5c] px-4 py-3 font-bold text-white transition hover:bg-[#e3516e]' : 'btn btn-primary w-full py-3'} disabled={loading}>{loading ? '…' : 'Se connecter'}</button>
          </form>
          {!branded && <GoogleButton callbackUrl={params.get('callbackUrl') || '/dashboard'} label="Se connecter avec Google" />}
          <Link href="/forgot-password" className={`mt-4 block text-center text-sm font-semibold ${branded ? 'text-white/65 hover:text-white' : 'text-brand-600'}`}>Mot de passe oublié ?</Link>
        </div>
        {!branded && <p className="mt-4 text-center text-sm text-gray-500">
          Pas encore de compte ? <Link href="/register" className="font-semibold text-brand-600">Créer mon site</Link>
        </p>}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
