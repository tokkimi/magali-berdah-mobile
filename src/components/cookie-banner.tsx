'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { useLanguage } from './language-provider';

const KEY = 'easyasso-cookie-consent';

export function CookieBanner() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [vielusos, setVielusos] = useState(false);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    setVielusos(host === 'vielusos.com' || host === 'www.vielusos.com');
    setVisible(!localStorage.getItem(KEY));
  }, []);

  function choose(value: 'accepted' | 'refused') {
    localStorage.setItem(KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={`fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-4xl rounded-2xl p-4 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 ${vielusos ? 'border border-white/15 bg-[#0b0b10]/92 text-white shadow-black/60' : 'border border-gray-200 bg-white'}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${vielusos ? 'bg-white/10 text-white/65 ring-1 ring-white/15' : 'bg-brand-50 text-brand-700'}`}>
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-extrabold ${vielusos ? 'font-light uppercase tracking-[0.16em] text-white' : 'text-gray-900'}`}>{vielusos ? 'Confidentialité · VIELUSOS' : t('Cookies et confidentialité')}</p>
          <p className={`mt-1 text-sm leading-6 ${vielusos ? 'font-light text-white/60' : 'text-gray-600'}`}>
            {vielusos ? 'Ce site utilise les cookies nécessaires à son fonctionnement et, avec votre accord, des cookies de mesure pour améliorer votre expérience.' : t('EasyAsso utilise des cookies nécessaires au fonctionnement du site et, si vous l’acceptez, des cookies de mesure pour améliorer l’expérience.')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <button type="button" onClick={() => choose('refused')} className={vielusos ? 'rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white' : 'btn btn-ghost'}>
            {t('Refuser')}
          </button>
          <button type="button" onClick={() => choose('accepted')} className={vielusos ? 'rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/25' : 'btn btn-primary'}>
            {t('Accepter')}
          </button>
          <button type="button" onClick={() => choose('refused')} className={`grid h-11 w-11 place-items-center rounded-lg ${vielusos ? 'text-white/35 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`} aria-label={t('Fermer')}>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
