'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError(''); setMessage('');
    const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) setError(data.error || 'Lien invalide.');
    else setMessage('Mot de passe mis à jour. Vous pouvez vous connecter.');
  }

  return (
    <div className="card w-full max-w-md">
      <h1 className="text-xl font-bold text-gray-900">Nouveau mot de passe</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label">Mot de passe</label><input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p>}
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Enregistrement…' : 'Changer mon mot de passe'}</button>
      </form>
      <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-brand-600">Se connecter</Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <div className="grid min-h-screen place-items-center bg-gray-50 px-4"><Suspense><ResetPasswordForm /></Suspense></div>;
}
