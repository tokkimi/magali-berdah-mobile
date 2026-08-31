'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GoogleButton } from '../google-button';
import { PLANS, isPlanId, type PlanId } from '@/lib/plans';

const PRICE = process.env.NEXT_PUBLIC_PRICE_EUR || '250';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', assoName: '', email: '', password: '', language: 'fr' as 'fr' | 'en',
    plan: 'lifetime' as PlanId,
    // Independent: you can be an association, have an online shop, both, or neither.
    isAssociation: true,
    hasShop: false,
    phone: '', city: '', legalName: '', registrationNumber: '', legalAddress: '', legalCountry: 'France', publicationDirector: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const en = form.language === 'en';
  const isAsso = form.isAssociation;
  const structureLabel = isAsso ? (en ? 'association' : 'association') : form.hasShop ? (en ? 'shop' : 'boutique') : (en ? 'project' : 'structure');
  const nameLabel = isAsso ? (en ? 'Association name' : 'Nom de l’association') : form.hasShop ? (en ? 'Shop name' : 'Nom de votre boutique') : (en ? 'Project name' : 'Nom de votre projet');

  useEffect(() => {
    if (localStorage.getItem('easyasso-language') === 'en') setForm((current) => ({ ...current, language: 'en' }));
    // Plan can be pre-selected from the pricing page (/register?plan=annual|lifetime).
    const params = new URLSearchParams(window.location.search);
    const requested = params.get('plan');
    if (isPlanId(requested)) setForm((current) => ({ ...current, plan: requested }));
    // Type can be pre-selected from the home (/register?kind=shop → shop only).
    const kind = params.get('kind');
    if (kind === 'shop') setForm((current) => ({ ...current, isAssociation: false, hasShop: true }));
    else if (kind === 'business' || kind === 'other') setForm((current) => ({ ...current, isAssociation: false }));
  }, []);

  function changeLanguage(language: 'fr' | 'en') {
    setForm((current) => ({ ...current, language }));
    localStorage.setItem('easyasso-language', language);
    document.cookie = `easyasso-language=${language};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new CustomEvent('easyasso-language-change', { detail: language }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || (en ? 'Unable to create the account.' : 'Impossible de créer le compte.'));
      const login = await signIn('credentials', { redirect: false, email: form.email, password: form.password });
      if (login?.error) throw new Error(en ? 'Unable to log in after registration.' : 'Connexion impossible après l’inscription.');
      router.push('/dashboard/generate?welcome=1');
    } catch (exception: any) { setError(exception.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 px-4 py-10" data-no-translate>
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/easyasso-logo.png" alt="EasyAsso" className="h-20 w-auto" />
        </Link>
        <div className="card">
          <h1 className="text-xl font-bold text-gray-900">{en ? 'Create your website' : 'Créez votre site internet'}</h1>
          <p className="mt-1 text-sm text-gray-500">{en ? '3-day free trial — no credit card required. For associations, shops, businesses and creators.' : 'Essai gratuit de 3 jours — sans carte bancaire. Pour les associations, boutiques, entreprises et créateurs.'}</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">{en ? 'Tell us about you' : 'Parlez-nous de vous'}</label>
              <div className="space-y-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${form.isAssociation ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="checkbox" className="h-5 w-5" checked={form.isAssociation} onChange={(e) => setForm({ ...form, isAssociation: e.target.checked })} />
                  <span><span className="font-semibold text-gray-900">{en ? 'I am an association' : 'Je suis une association'}</span><span className="block text-xs text-gray-500">{en ? 'Donations, receipts, members, volunteers…' : 'Dons, reçus fiscaux, adhérents, bénévoles…'}</span></span>
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${form.hasShop ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <input type="checkbox" className="h-5 w-5" checked={form.hasShop} onChange={(e) => setForm({ ...form, hasShop: e.target.checked })} />
                  <span><span className="font-semibold text-gray-900">{en ? 'I have an online shop' : 'J’ai une boutique en ligne'}</span><span className="block text-xs text-gray-500">{en ? 'Sell products online (associations can too).' : 'Vendre des produits en ligne (les assos aussi peuvent).'}</span></span>
                </label>
              </div>
            </div>
            <div><label className="label">{en ? 'Your name' : 'Votre nom'}</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={en ? 'Mary Smith' : 'Marie Dupont'} /></div>
            <div><label className="label">{nameLabel}</label><input className="input" required value={form.assoName} onChange={(e) => setForm({ ...form, assoName: e.target.value })} placeholder={!isAsso && form.hasShop ? (en ? 'My Little Shop' : 'Ma Jolie Boutique') : en ? 'Community Friends' : 'Les Amis du Quartier'} /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={en ? 'you@association.org' : 'vous@asso.fr'} /></div>
            <div><label className="label">{en ? 'Password' : 'Mot de passe'}</label><input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={en ? '6 characters minimum' : '6 caractères minimum'} /></div>
            <div><label className="label">{en ? 'Workspace language' : 'Langue de votre espace'}</label><select className="input" value={form.language} onChange={(e) => changeLanguage(e.target.value as 'fr' | 'en')}><option value="fr">Français</option><option value="en">English</option></select></div>
            <div>
              <label className="label">{en ? 'Formula (payable after your free trial)' : 'Formule (à régler après votre essai gratuit)'}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['monthly', 'annual', 'lifetime'] as PlanId[]).map((id) => {
                  const p = PLANS[id];
                  const active = form.plan === id;
                  const name = id === 'monthly' ? (en ? 'Monthly' : 'Mensuel') : id === 'annual' ? (en ? 'Annual' : 'Annuel') : (en ? 'Lifetime' : 'À vie');
                  const unit = id === 'monthly' ? (en ? '/ mo' : '/ mois') : id === 'annual' ? (en ? '/ yr' : '/ an') : (en ? 'once' : 'à vie');
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm({ ...form, plan: id })}
                      className={`rounded-2xl border-2 p-3 text-left transition ${active ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    >
                      <p className="font-bold text-gray-900">{name}</p>
                      <p className="mt-0.5 text-base font-extrabold text-brand-700">{p.amountEur} €<span className="text-xs font-medium text-gray-500"> {unit}</span></p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">{en ? 'You can change this anytime before paying.' : 'Modifiable à tout moment avant le paiement.'}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <h2 className="font-bold text-gray-900">{en ? `${isAsso ? 'Association' : 'Legal'} details (optional)` : `Coordonnées ${isAsso ? 'de l’association' : `de votre ${structureLabel}`} (facultatives)`}</h2>
              <p className="mt-1 text-xs text-gray-500">{en ? 'Optional: if you fill them in, they prefill Settings, legal notices and contact pages. You can complete them later from your dashboard.' : 'Facultatives : si vous les renseignez, elles remplissent automatiquement Réglages, mentions légales et contact. Vous pourrez les compléter plus tard depuis votre tableau de bord.'}</p>
              <div className="mt-4 space-y-3">
                <div><label className="label">{en ? 'Legal association name' : 'Nom légal de l’association'}</label><input className="input" value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} placeholder={form.assoName || (en ? 'Official registered name' : 'Nom officiel déclaré')} /></div>
                <div><label className="label">{en ? 'Registration number' : 'Numéro d’enregistrement'}</label><input className="input" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder={en ? 'Registration / charity number' : 'RNA, SIREN, SIRET…'} /></div>
                <div><label className="label">{en ? 'Legal address' : 'Adresse légale / siège'}</label><textarea className="input" value={form.legalAddress} onChange={(e) => setForm({ ...form, legalAddress: e.target.value })} placeholder={en ? 'Full registered address' : 'Adresse complète du siège'} /></div>
                <div><label className="label">{en ? 'Legal country' : 'Pays légal'}</label><input className="input" value={form.legalCountry} onChange={(e) => setForm({ ...form, legalCountry: e.target.value })} placeholder={en ? 'France, Belgium, Canada…' : 'France, Belgique, Canada…'} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="label">{en ? 'Phone' : 'Téléphone'}</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><label className="label">{en ? 'City' : 'Ville'}</label><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
                <div><label className="label">{en ? 'Publication director' : 'Directeur/directrice de publication'}</label><input className="input" value={form.publicationDirector} onChange={(e) => setForm({ ...form, publicationDirector: e.target.value })} placeholder={form.name || (en ? 'Usually the president or owner' : 'Souvent le/la président(e)')} /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-950">{en ? 'Your 3-day free trial starts automatically' : 'Votre essai gratuit de 3 jours démarre automatiquement'}</p>
              <p className="mt-1 text-sm leading-6 text-green-800">
                {en ? `No card is requested at registration. You can create and test your website first, then pay €${PLANS[form.plan].amountEur} ${form.plan === 'monthly' ? 'per month' : form.plan === 'annual' ? 'per year' : 'once'} later from your dashboard if you want to keep EasyAsso.` : `Aucune carte bancaire n’est demandée à l’inscription. Vous créez et testez votre site d’abord, puis vous paierez ${PLANS[form.plan].amountEur} € ${form.plan === 'monthly' ? 'par mois' : form.plan === 'annual' ? 'par an' : 'une seule fois'} plus tard depuis votre tableau de bord si vous voulez garder EasyAsso.`}
              </p>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button className="btn btn-primary w-full py-3" disabled={loading}>{loading ? (en ? 'Creating your trial…' : 'Création de votre essai…') : (en ? 'Create my account and start the free trial' : 'Créer mon compte et démarrer l’essai gratuit')}</button>
          </form>
          <GoogleButton callbackUrl="/dashboard/generate?welcome=1" label={en ? 'Sign up with Google' : 'S’inscrire avec Google'} />
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">{en ? 'Already have an account?' : 'Déjà un compte ?'} <Link href="/login" className="font-semibold text-brand-600">{en ? 'Log in' : 'Se connecter'}</Link></p>
      </div>
    </div>
  );
}
