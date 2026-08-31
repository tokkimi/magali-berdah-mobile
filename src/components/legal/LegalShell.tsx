import Link from 'next/link';
import type { ReactNode } from 'react';
import { platformLegal, platformLegalMissingFields } from '@/lib/platform-legal';

function StatusCard({ lang = 'fr' }: { lang?: 'fr' | 'en' }) {
  if (platformLegalMissingFields.length === 0) return null;
  const en = lang === 'en';
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
      <p className="font-extrabold">{en ? 'EasyAsso administrative details to complete' : 'Informations administratives EasyAsso à compléter'}</p>
      <p className="mt-2 leading-6">
        {en ? `The legal pages are in place and complete in structure. The fields below must be replaced with the official details of ${platformLegal.companyName} once confirmed.` : <>Les pages sont en place et complètes dans leur structure. Les champs ci-dessous doivent être remplacés par les informations officielles de {platformLegal.companyName} dès qu’elles sont confirmées.</>}
      </p>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
        {platformLegalMissingFields.map(([label]) => (
          <li key={label}>• {label}</li>
        ))}
      </ul>
    </div>
  );
}

export function LegalShell({ title, intro, children, lang = 'fr' }: { title: string; intro: string; children: ReactNode; lang?: 'fr' | 'en' }) {
  const en = lang === 'en';
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="flex items-center gap-3" aria-label={en ? 'Back to EasyAsso home' : 'Retour à l’accueil EasyAsso'}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/easyasso-logo.png" alt="EasyAsso" className="h-12 w-auto" />
          </Link>
          <Link href="/register" className="btn btn-primary">{en ? 'Create my website' : 'Créer mon site'}</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">{platformLegal.companyName}</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-950 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">{intro}</p>
        <p className="mt-3 text-sm text-gray-500">{en ? 'Last updated:' : 'Dernière mise à jour :'} {platformLegal.updatedAt}</p>
        <div className="mt-8">
          <StatusCard lang={lang} />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="legal-content max-w-none">
          {children}
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-gray-50 px-6 py-8 text-sm text-gray-600">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {platformLegal.brand} · {platformLegal.companyName}</span>
          <nav className="flex flex-wrap gap-4">
            <Link href={en ? '/en/terms' : '/cgv'} className="hover:text-brand-700">{en ? 'Terms' : 'CGV'}</Link>
            <Link href={en ? '/en/legal-notice' : '/mentions-legales'} className="hover:text-brand-700">{en ? 'Legal notice' : 'Mentions légales'}</Link>
            <Link href={en ? '/en/legal-notice#personal-data' : '/mentions-legales#donnees-personnelles'} className="hover:text-brand-700">{en ? 'Privacy' : 'Confidentialité'}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

export function LegalInfoTable({ lang = 'fr' }: { lang?: 'fr' | 'en' }) {
  const en = lang === 'en';
  const rows = [
    [en ? 'Website publisher' : 'Éditeur du site', platformLegal.companyName],
    [en ? 'Trade name / service' : 'Nom commercial / service', platformLegal.serviceName],
    [en ? 'Legal form' : 'Forme juridique', platformLegal.legalForm],
    [en ? 'Registration number' : 'Immatriculation', platformLegal.registrationNumber],
    [en ? 'VAT number' : 'TVA intracommunautaire', platformLegal.vatNumber],
    [en ? 'Registered office' : 'Siège social', platformLegal.registeredAddress],
    [en ? 'Publication director' : 'Directeur ou directrice de publication', platformLegal.publicationDirector],
    ['Contact', platformLegal.contactEmail],
  ];

  return (
    <div className="not-prose mt-5 overflow-hidden rounded-2xl border border-gray-200">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 border-b border-gray-100 p-4 last:border-b-0 sm:grid-cols-[220px_1fr]">
          <dt className="font-bold text-gray-950">{label}</dt>
          <dd className="text-gray-700">{value}</dd>
        </div>
      ))}
    </div>
  );
}
