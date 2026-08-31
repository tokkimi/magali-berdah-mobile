'use client';

import { useState } from 'react';
import { MailWarning } from 'lucide-react';

export function EmailVerificationBanner() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    await fetch('/api/auth/resend-verification', { method: 'POST' });
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white">
      <MailWarning className="h-4 w-4" />
      {sent ? 'Email de validation renvoyé.' : 'Confirmez votre email pour sécuriser votre compte EasyAsso.'}
      {!sent && <button onClick={resend} disabled={loading} className="ml-1 rounded-md bg-white px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-50">{loading ? 'Envoi…' : 'Renvoyer l’email'}</button>}
    </div>
  );
}
