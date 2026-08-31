'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-gray-500">Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {sent && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Email envoyé si le compte existe.</p>}
          <button className="btn btn-primary w-full" disabled={loading}>{loading ? 'Envoi…' : 'Recevoir le lien'}</button>
        </form>
        <Link href="/login" className="mt-4 block text-center text-sm font-semibold text-brand-600">Retour à la connexion</Link>
      </div>
    </div>
  );
}
