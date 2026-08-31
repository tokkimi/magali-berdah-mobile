'use client';
import { useState } from 'react';

export function PayButton({ price, demo, plan = 'lifetime' }: { price: string; demo: boolean; plan?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function pay() {
    setLoading(true);
    setError('');
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      setError(data.error || 'Le paiement sécurisé n’est pas disponible. Aucun débit n’a été effectué.');
      setLoading(false);
    }
  }
  return (
    <>
      <button onClick={pay} disabled={loading} className="btn btn-primary w-full py-3 text-base">
        {loading ? 'Ouverture du paiement sécurisé…' : demo ? `Activer mon site (démo — ${price} €)` : `Payer ${price} € et activer`}
      </button>
      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
    </>
  );
}
