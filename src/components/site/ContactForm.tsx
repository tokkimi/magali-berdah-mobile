'use client';
import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export function ContactForm({ organizationId, content }: { organizationId?: string; content: any }) {
  const en = content.locale === 'en';
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!organizationId) return;
    setState('sending');
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, organizationId }) });
    setState(response.ok ? 'sent' : 'error');
    if (response.ok) setForm({ name: '', email: '', phone: '', subject: '', message: '', website: '' });
  }
  if (state === 'sent') return <div className="rounded-2xl bg-green-50 p-8 text-center text-green-800"><CheckCircle2 className="mx-auto h-10 w-10" /><p className="mt-3 font-bold">{content.successText || (en ? 'Thank you, your message has been sent.' : 'Merci, votre message a bien été envoyé.')}</p></div>;
  return (
    <div className="contact-block grid gap-8 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-gray-200 md:p-8">
      <div>
        <h3 className="text-2xl font-extrabold text-gray-900">{content.title || (en ? 'Contact us' : 'Contactez-nous')}</h3>
        {content.intro && <p className="mt-2 text-gray-600">{content.intro}</p>}
        <div className="mt-6 space-y-3 text-sm text-gray-700">
          {content.email && <p><strong>Email:</strong><br /><a className="text-brand-600" href={`mailto:${content.email}`}>{content.email}</a></p>}
          {content.phone && <p><strong>{en ? 'Phone:' : 'Téléphone :'}</strong><br /><a className="text-brand-600" href={`tel:${content.phone}`}>{content.phone}</a></p>}
          {content.address && <p><strong>{en ? 'Address:' : 'Adresse :'}</strong><br /><span className="whitespace-pre-wrap">{content.address}</span></p>}
        </div>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
        <div className="contact-fields grid gap-3"><input className="input" required placeholder={en ? 'Your name' : 'Votre nom'} value={form.name} onChange={(e) => set('name', e.target.value)} /><input className="input" required type="email" placeholder={en ? 'Your email' : 'Votre e-mail'} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
        <div className="contact-fields grid gap-3"><input className="input" placeholder={en ? 'Phone (optional)' : 'Téléphone (optionnel)'} value={form.phone} onChange={(e) => set('phone', e.target.value)} /><input className="input" placeholder={en ? 'Subject' : 'Objet'} value={form.subject} onChange={(e) => set('subject', e.target.value)} /></div>
        <textarea className="input min-h-32" required minLength={10} placeholder={en ? 'Your message' : 'Votre message'} value={form.message} onChange={(e) => set('message', e.target.value)} />
        {state === 'error' && <p className="text-sm text-red-600">{en ? 'Your message could not be sent. Check the fields and try again.' : 'Le message n’a pas pu être envoyé. Vérifiez les champs et réessayez.'}</p>}
        <button className="btn btn-primary w-full" disabled={state === 'sending'}><Send className="h-4 w-4" /> {state === 'sending' ? (en ? 'Sending…' : 'Envoi…') : (content.buttonText || (en ? 'Send message' : 'Envoyer le message'))}</button>
      </form>
    </div>
  );
}
