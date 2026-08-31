'use client';
import { useState } from 'react';

export function NewsletterForm({ orgId }: { orgId: string }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, email }),
    });
    setDone(true);
  }
  if (done) return <p className="text-sm opacity-80">Merci, vous êtes inscrit·e ! 🎉</p>;
  return (
    <form onSubmit={submit} className="flex min-w-0 flex-col gap-2">
      <input
        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="votre@email.fr"
        className="min-w-0 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-current placeholder:opacity-60 outline-none"
      />
      <button className="rounded-lg bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-white">
        S’inscrire
      </button>
    </form>
  );
}
