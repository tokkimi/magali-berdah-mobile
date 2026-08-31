'use client';

import { useState } from 'react';
import { ArrowLeft, CalendarDays, CheckCircle2, Send } from 'lucide-react';
import { LanguageSwitcher, useLanguage } from '@/components/language-provider';

type BookingCopy = {
  title?: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  formTitle?: string;
  formTitleEn?: string;
};

export function VielusosBooking({ organizationId, copy = {} }: { organizationId: string; copy?: BookingCopy }) {
  const { locale } = useLanguage();
  const en = locale === 'en';
  const [form, setForm] = useState({ requestType: 'Booking / date', name: '', company: '', email: '', artist: 'VIELUSOS', location: '', date: '', budget: '', project: '', website: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState('sending');
    const message = [`Type : ${form.requestType}`, `Société / organisation : ${form.company || '—'}`, `Artiste : ${form.artist}`, `Ville / pays : ${form.location}`, `Date souhaitée : ${form.date || '—'}`, `Budget indicatif : ${form.budget || '—'}`, '', form.project].join('\n');
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ organizationId, name: form.name, email: form.email, phone: '', subject: `Booking VIELUSOS · ${form.requestType}`, message, website: form.website }) });
    setState(response.ok ? 'sent' : 'error');
  }

  const field = 'w-full rounded-xl border border-white/15 bg-white/[0.055] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/45 focus:bg-white/[0.08]';
  return (
    <main className="flex-1 px-5 py-10 text-white md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4"><a href="/" className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/50 transition hover:text-white"><ArrowLeft className="h-4 w-4" />{en ? 'Back' : 'Retour'}</a><LanguageSwitcher variant="inline" /></div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
          <section>
            <p className="text-[10px] uppercase tracking-[0.48em] text-white/45">VIELUSOS · BOOKING</p>
            <h1 className="mt-5 font-['Cormorant_Garamond'] text-5xl font-light uppercase leading-[.95] tracking-[0.12em] md:text-7xl">{en ? copy.titleEn || 'Send a clear brief' : copy.title || 'Envoyer un brief clair'}</h1>
            <p className="mt-7 max-w-md font-light leading-7 text-white/55">{en ? copy.descriptionEn || 'Booking, media, partnerships or a direct professional enquiry concerning VIELUSOS.' : copy.description || 'Booking, média, partenariat ou demande professionnelle directe concernant VIELUSOS.'}</p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-1">
              {[[en ? 'Artistic direction' : 'Direction artistique', en ? 'Universe, image, visual consistency' : 'Univers, image, cohérence visuelle'], ['Booking', en ? 'Clubs, festivals, private events' : 'Clubs, festivals, événements privés'], [en ? 'Professional enquiries' : 'Demandes pros', en ? 'Media, brands and partnerships' : 'Médias, marques et partenariats']].map(([title, text]) => <div key={title} className="bg-[#0b0b10]/85 p-5"><p className="text-sm font-medium uppercase tracking-[0.16em]">{title}</p><p className="mt-2 text-xs leading-5 text-white/45">{text}</p></div>)}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/12 bg-black/30 p-5 backdrop-blur-xl sm:p-8">
            {state === 'sent' ? <div className="grid min-h-[32rem] place-items-center text-center"><div><CheckCircle2 className="mx-auto h-12 w-12 text-white/70" /><h2 className="mt-5 text-3xl text-white">{en ? 'Request sent' : 'Demande envoyée'}</h2><p className="mt-3 text-white/50">{en ? 'Thank you. The booking request has been received.' : 'Merci. La demande de booking a bien été reçue.'}</p></div></div> : <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5"><CalendarDays className="h-5 w-5 text-white/55" /><div><p className="text-xs uppercase tracking-[0.3em] text-white/40">01 · 02 · 03</p><h2 className="mt-1 text-xl font-light uppercase tracking-[0.12em]">{en ? copy.formTitleEn || 'Contact · Project' : copy.formTitle || 'Contact · Projet'}</h2></div></div>
              <input className="hidden" tabIndex={-1} value={form.website} onChange={(e) => set('website', e.target.value)} />
              <label className="block"><span className="mb-2 block text-[10px] uppercase tracking-[0.22em] text-white/45">{en ? 'Your request' : 'Votre demande'}</span><select className={field} value={form.requestType} onChange={(e) => set('requestType', e.target.value)}><option className="bg-neutral-950">Booking / date</option><option className="bg-neutral-950">Média / interview</option><option className="bg-neutral-950">Partenariat / marque</option><option className="bg-neutral-950">Autre demande professionnelle</option></select></label>
              <div className="grid gap-4 sm:grid-cols-2"><input required className={field} placeholder={en ? 'Full name' : 'Nom / prénom'} value={form.name} onChange={(e) => set('name', e.target.value)} /><input className={field} placeholder={en ? 'Company / organisation' : 'Société / organisation'} value={form.company} onChange={(e) => set('company', e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><input required type="email" className={field} placeholder={en ? 'Professional email' : 'E-mail professionnel'} value={form.email} onChange={(e) => set('email', e.target.value)} /><input className={field} value={form.artist} readOnly aria-label={en ? 'Artist' : 'Artiste concerné'} /></div>
              <div className="grid gap-4 sm:grid-cols-2"><input required className={field} placeholder={en ? 'City / country' : 'Ville / pays'} value={form.location} onChange={(e) => set('location', e.target.value)} /><input type="date" className={field} value={form.date} onChange={(e) => set('date', e.target.value)} aria-label={en ? 'Desired date' : 'Date souhaitée'} /></div>
              <input className={field} placeholder={en ? 'Indicative budget, fee or to be discussed' : 'Budget indicatif, cachet ou à définir'} value={form.budget} onChange={(e) => set('budget', e.target.value)} />
              <textarea required minLength={10} className={`${field} min-h-40 resize-y`} placeholder={en ? 'Project / request' : 'Projet / demande'} value={form.project} onChange={(e) => set('project', e.target.value)} />
              {state === 'error' && <p className="text-sm text-red-300">{en ? 'The request could not be sent. Please check the fields.' : 'La demande n’a pas pu être envoyée. Vérifiez les champs.'}</p>}
              <button disabled={state === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-4 text-xs font-bold uppercase tracking-[0.22em] text-black transition hover:bg-white/85 disabled:opacity-50"><Send className="h-4 w-4" />{state === 'sending' ? (en ? 'Sending…' : 'Envoi…') : (en ? 'Send request' : 'Envoyer la demande')}</button>
            </form>}
          </section>
        </div>
      </div>
    </main>
  );
}
