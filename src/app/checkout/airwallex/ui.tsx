'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Airwallex?: {
      init: (options: { env: 'demo' | 'prod'; enabledElements: string[] }) => Promise<{ payments: { redirectToCheckout: (options: Record<string, string>) => Promise<void> } }>;
    };
  }
}

export function AirwallexCheckoutClient({ intentId, clientSecret, currency, env }: { intentId: string; clientSecret: string; currency: string; env: 'demo' | 'prod' }) {
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!scriptReady || !intentId || !clientSecret) return;
    let cancelled = false;
    async function openCheckout() {
      try {
        if (!window.Airwallex) throw new Error('Airwallex ne s’est pas chargé.');
        const { payments } = await window.Airwallex.init({ env, enabledElements: ['payments'] });
        if (cancelled) return;
        await payments.redirectToCheckout({
          intent_id: intentId,
          client_secret: clientSecret,
          currency,
          country_code: 'FR',
          successUrl: `${window.location.origin}/onboarding/success?airwallex_intent_id=${encodeURIComponent(intentId)}`,
        });
      } catch (exception: any) {
        if (!cancelled) setError(exception?.message || 'Impossible d’ouvrir le paiement sécurisé.');
      }
    }
    openCheckout();
    return () => { cancelled = true; };
  }, [clientSecret, currency, env, intentId, scriptReady]);

  if (!intentId || !clientSecret) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-900">Paiement introuvable</h1>
          <p className="mt-2 text-gray-600">Relancez le paiement depuis votre tableau de bord.</p>
          <Link href="/dashboard" className="btn btn-primary mt-5">Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4">
      <Script src="https://static.airwallex.com/components/sdk/v1/index.js" onLoad={() => setScriptReady(true)} onError={() => setError('Impossible de charger Airwallex.')} />
      <div className="card max-w-md text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-600" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">Ouverture du paiement sécurisé…</h1>
        <p className="mt-2 text-gray-600">Vous allez être redirigé vers la page de paiement Airwallex.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
