'use client';

import { useState } from 'react';
import { Building2, CheckCircle2, CreditCard, LockKeyhole, Mail } from 'lucide-react';

const PRESETS = [5, 10, 25, 50, 100, 250];

export function DonationBlock({ content, organizationId }: { content: any; organizationId?: string }) {
  const en = content.locale === 'en';
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [solidarity, setSolidarity] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'saved' | 'error'>('idle');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', birthDate: '', address: '', postalCode: '', city: '', website: '' });
  const selectedAmount = amount || Number(customAmount) || 0;
  const total = selectedAmount + (solidarity ? 1 : 0);
  const stripeEnabled = !!content.cardEnabled && !!content.stripeUrl;
  const helloAssoEnabled = (content.helloAssoEnabled ?? !!content.helloAssoUrl) && !!content.helloAssoUrl;
  const paymentUrl = stripeEnabled ? content.stripeUrl : helloAssoEnabled ? content.helloAssoUrl : '';
  const paymentMethod = stripeEnabled ? 'STRIPE' : helloAssoEnabled ? 'HELLOASSO' : 'OTHER';
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId || total <= 0) return;
    setState('sending');
    const response = await fetch('/api/public/donations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, organizationId, amountEuros: total, method: paymentMethod }),
    });
    if (!response.ok) { setState('error'); return; }
    setState('saved');
    if (paymentUrl) window.location.assign(paymentUrl);
  }

  return <div className="donation-block mx-auto max-w-3xl text-left">
    <div className="text-center"><h2 className="text-3xl font-extrabold text-gray-900">{content.title || (en ? 'Support our causes' : 'Soutenir nos causes')}</h2><p className="mt-3 text-gray-600">{content.intro || (en ? 'Your donation directly supports all our work.' : 'Votre don soutient directement l’ensemble de nos actions.')}</p></div>

    <form onSubmit={submit} className="mt-8 space-y-5">
      <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
      <div><label className="label">{en ? 'Choose an amount' : 'Choisissez un montant'}</label><div className="grid grid-cols-3 gap-2 md:grid-cols-6">{PRESETS.map((value) => <button type="button" key={value} onClick={() => { setAmount(value); setCustomAmount(''); }} className={`rounded-xl border px-3 py-3 font-bold transition ${amount === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200 hover:border-brand-300'}`}>{value} €</button>)}</div><div className="relative mt-3"><input className="input pr-10" min="1" step="1" type="number" placeholder={en ? 'Custom amount' : 'Montant libre'} value={customAmount} onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }} /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€</span></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">{en ? 'First name *' : 'Prénom *'}</label><input className="input" required value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></div><div><label className="label">{en ? 'Last name *' : 'Nom *'}</label><input className="input" required value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></div></div>
      <div><label className="label">Email *</label><input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
      <p className="text-xs leading-relaxed text-gray-500">{en ? 'These details create your donor record and allow the association to follow up your donation and prepare a receipt.' : 'Ces informations créent votre fiche donateur et permettent à l’association de suivre votre don et de préparer votre reçu.'}</p>
      <div><label className="label">{en ? 'Date of birth' : 'Date de naissance'}</label><input className="input" type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} /></div>
      <div><label className="label">{en ? 'Address' : 'Adresse (numéro + rue)'}</label><input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className="label">{en ? 'Postal code' : 'Code postal'}</label><input className="input" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} /></div><div><label className="label">{en ? 'City' : 'Ville'}</label><input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} /></div></div>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4"><input type="checkbox" className="h-5 w-5" checked={solidarity} onChange={(e) => setSolidarity(e.target.checked)} /><span><strong>{en ? 'Add €1 of solidarity' : '+ 1 € solidaire en plus'}</strong><span className="block text-xs text-orange-700">{en ? 'To increase the impact of your donation' : 'Pour amplifier l’impact de votre don'}</span></span></label>
      {state === 'error' && <p className="text-sm text-red-600">{en ? 'Unable to save your donation. Please try again.' : 'Impossible d’enregistrer votre don. Réessayez.'}</p>}
      {state === 'saved' && !paymentUrl && <p className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{en ? 'Thank you, your donation pledge has been sent to the association.' : 'Merci, votre intention de don a bien été transmise à l’association.'}</p>}
      {!paymentUrl && <p className="rounded-xl bg-brand-50 p-3 text-xs leading-relaxed text-brand-800">{en ? 'Online payment is not connected yet. The association will receive your donor record and can contact you to finalise the donation.' : 'Le paiement en ligne n’est pas encore connecté. L’association recevra votre fiche donateur et pourra vous contacter pour finaliser le don.'}</p>}
      <button disabled={state === 'sending' || total <= 0} className="btn btn-primary w-full py-4 text-base disabled:cursor-not-allowed disabled:opacity-50"><CreditCard className="h-5 w-5" />{state === 'sending' ? (paymentUrl ? (en ? 'Preparing secure payment…' : 'Préparation du paiement sécurisé…') : (en ? 'Saving your donation…' : 'Enregistrement de votre don…')) : total > 0 ? (paymentUrl ? (en ? `Continue to secure payment · €${total}` : `Continuer vers le paiement sécurisé · ${total} €`) : (en ? `Send my donation pledge · €${total}` : `Envoyer mon intention de don · ${total} €`)) : (en ? 'Choose an amount to continue' : 'Choisir un montant pour continuer')}</button>
      <div className="flex flex-wrap justify-between gap-2 border-t pt-4 text-xs text-gray-500"><span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-green-600" /> {en ? 'Donation recorded in donor CRM' : 'Don enregistré dans le CRM donateurs'}</span><span className="flex items-center gap-1"><LockKeyhole className="h-4 w-4" /> {paymentUrl ? (en ? 'Secure payment' : 'Paiement sécurisé') : (en ? 'Association notified' : 'Association prévenue')}</span></div>
    </form>

    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {content.transferEnabled && content.iban && <div className="rounded-2xl border border-gray-200 p-5"><Building2 className="h-6 w-6 text-brand-600" /><h3 className="mt-3 font-extrabold">{en ? 'Donate by bank transfer' : 'Donner par virement'}</h3><p className="mt-3 text-sm"><strong>IBAN:</strong> <span className="break-all font-mono">{content.iban}</span></p>{content.bic && <p className="mt-1 text-sm"><strong>BIC:</strong> <span className="font-mono">{content.bic}</span></p>}{content.accountHolder && <p className="mt-1 text-sm"><strong>{en ? 'Account holder' : 'Titulaire'}:</strong> {content.accountHolder}</p>}</div>}
      {content.chequeEnabled && (content.chequePayable || content.chequeAddress) && <div className="rounded-2xl border border-gray-200 p-5"><Mail className="h-6 w-6 text-brand-600" /><h3 className="mt-3 font-extrabold">{en ? 'Donate by cheque' : 'Donner par chèque'}</h3>{content.chequePayable && <p className="mt-3 text-sm"><strong>{en ? 'Payable to' : 'À l’ordre de'}:</strong> {content.chequePayable}</p>}{content.chequeAddress && <p className="mt-1 whitespace-pre-wrap text-sm"><strong>{en ? 'Send to' : 'À envoyer à'}:</strong><br />{content.chequeAddress}</p>}</div>}
    </div>
  </div>;
}
