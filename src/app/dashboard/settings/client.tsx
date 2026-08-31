'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check, Copy, CreditCard, ExternalLink, Building2, Save, ShoppingCart, Link2, ShieldCheck, UserRound, Lock, Power } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { canUpgradePlan, PLANS, type PlanId } from '@/lib/plans';
import { ManualTransferButton } from '@/app/onboarding/manual-transfer-button';

export function SettingsClient({ org, user, site, freeUrl, rootDomain, canDomain, categories, branded = false }: any) {
  const router = useRouter();
  const [name, setName] = useState(site.name);
  const [published, setPublished] = useState(!!site.published);
  const [domain, setDomain] = useState(site.customDomain || '');
  const [msg, setMsg] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [savingDomain, setSavingDomain] = useState(false);
  const [domainChoice, setDomainChoice] = useState<'connect' | 'buy' | null>(site.customDomain ? 'connect' : null);
  const [profile, setProfile] = useState({ language: 'fr', year: '', category: '', mission: '', functioning: '', actions: '', beneficiaries: '', goodToKnow: '', slogan: '', generateCgv: true, city: '', email: '', phone: '', legalName: '', registrationNumber: '', legalAddress: '', legalCountry: 'France', publicationDirector: '', facebook: '', instagram: '', linkedin: '', youtube: '', tiktok: '', twitter: '', ...(org.profile || {}) });
  const [account, setAccount] = useState({ name: user.name || '', email: user.email || '', currentPassword: '', newPassword: '' });
  const [billingLoading, setBillingLoading] = useState('');
  const [billingError, setBillingError] = useState('');

  async function saveName() {
    await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    setMsg('Nom enregistré'); router.refresh(); setTimeout(() => setMsg(''), 1500);
  }
  async function saveDomain() {
    setSavingDomain(true);
    const res = await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customDomain: domain }) });
    const data = await res.json();
    setSavingDomain(false);
    setMsg(res.ok ? (branded ? 'Le domaine de votre site a bien été ajouté. Suivez maintenant les étapes ci-dessous.' : 'Le domaine de votre association a bien été ajouté. Suivez maintenant les étapes ci-dessous.') : (data.error || 'Impossible d’ajouter ce domaine.'));
    if (res.ok) router.refresh();
    setTimeout(() => setMsg(''), 5000);
  }
  async function verify() {
    setVerifying(true);
    const res = await fetch('/api/site/verify-domain', { method: 'POST' });
    const data = await res.json();
    setVerifying(false);
    setMsg(data.verified ? 'Votre domaine est prêt !' : (data.error || 'Le branchement n’est pas encore terminé. Réessayez dans quelques minutes.'));
    router.refresh(); setTimeout(() => setMsg(''), 3000);
  }
  const copy = (t: string) => navigator.clipboard.writeText(t);
  const setProfileField = (key: string, value: any) => setProfile((current: any) => ({ ...current, [key]: value }));
  async function saveProfile() {
    const res = await fetch('/api/organization/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setMsg(res.ok ? (branded ? 'Profil artistique enregistré.' : 'Fiche de l’association enregistrée. Le générateur sera automatiquement prérempli.') : 'Impossible d’enregistrer ces informations.');
    if (res.ok) {
      localStorage.setItem('easyasso-language', profile.language);
      document.cookie = `easyasso-language=${profile.language};path=/;max-age=31536000;samesite=lax`;
      window.dispatchEvent(new CustomEvent('easyasso-language-change', { detail: profile.language }));
      router.refresh();
    }
    setTimeout(() => setMsg(''), 3500);
  }
  async function saveAccount() {
    const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(account) });
    const data = await res.json().catch(() => ({}));
    setMsg(res.ok ? 'Compte mis à jour.' : (data.error || 'Impossible de mettre à jour le compte.'));
    if (res.ok) {
      setAccount((current) => ({ ...current, currentPassword: '', newPassword: '' }));
      router.refresh();
    }
    setTimeout(() => setMsg(''), 3500);
  }
  async function togglePublished(value: boolean) {
    setPublished(value);
    const res = await fetch('/api/site', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: value }) });
    setMsg(res.ok ? (value ? 'Votre site est en ligne.' : 'Votre site est hors ligne.') : 'Impossible de changer la mise en ligne.');
    if (!res.ok) setPublished(!value);
    router.refresh();
    setTimeout(() => setMsg(''), 3000);
  }
  const currentPlan = ((profile as any).plan === 'monthly' || (profile as any).plan === 'annual' || (profile as any).plan === 'lifetime' ? (profile as any).plan : 'lifetime') as PlanId;
  const pendingPlan = ((profile as any).pendingPlan === 'monthly' || (profile as any).pendingPlan === 'annual' || (profile as any).pendingPlan === 'lifetime' ? (profile as any).pendingPlan : '') as PlanId | '';
  const isActivePlan = org.planStatus === 'ACTIVE';
  const planIds = ['monthly', 'annual', 'lifetime'] as PlanId[];
  const selectablePlans = planIds.filter((plan) => !isActivePlan || canUpgradePlan(currentPlan, plan));
  async function payPlan(plan: PlanId) {
    setBillingLoading(plan);
    setBillingError('');
    const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const data = await res.json().catch(() => ({}));
    if (data.url) window.location.href = data.url;
    else {
      setBillingError(data.error || 'Impossible d’ouvrir le paiement sécurisé. Aucun débit n’a été effectué.');
      setBillingLoading('');
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Réglages" subtitle={branded ? 'Identité, coordonnées, domaine et mise en ligne.' : 'Nom, adresse du site, nom de domaine et abonnement.'} />
      {msg && <div className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{msg}</div>}

      {/* General */}
      <div className="card mb-6">
        <h2 className="mb-3 font-bold text-gray-900">Général</h2>
        <label className="label">{branded ? 'Nom du site' : 'Nom de l’association / du site'}</label>
        <div className="flex gap-2">
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={saveName} className="btn btn-primary shrink-0">Enregistrer</button>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><UserRound className="h-5 w-5" /> Mon compte</h2>
        <p className="mb-5 text-sm text-gray-500">Modifiez l’email de connexion ou le mot de passe du compte.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Votre nom</label><input className="input" value={account.name} onChange={(e) => setAccount((current) => ({ ...current, name: e.target.value }))} /></div>
          <div><label className="label">Email de connexion</label><input type="email" className="input" value={account.email} onChange={(e) => setAccount((current) => ({ ...current, email: e.target.value }))} /></div>
          <div><label className="label">Mot de passe actuel</label><input type="password" className="input" value={account.currentPassword} onChange={(e) => setAccount((current) => ({ ...current, currentPassword: e.target.value }))} placeholder="Obligatoire pour changer email/mot de passe" /></div>
          <div><label className="label">Nouveau mot de passe</label><input type="password" className="input" value={account.newPassword} onChange={(e) => setAccount((current) => ({ ...current, newPassword: e.target.value }))} placeholder="6 caractères minimum" /></div>
        </div>
        {!user.emailVerified && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Email non vérifié : si vous changez d’email, un nouveau lien de vérification sera envoyé.</p>}
        <button onClick={saveAccount} className="btn btn-primary mt-5"><Lock className="h-4 w-4" /> Enregistrer mon compte</button>
      </div>

      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><Building2 className="h-5 w-5" /> {branded ? 'Profil artistique' : 'Fiche de l’association'}</h2>
        <p className="mb-5 text-sm text-gray-500">{branded ? 'Ces informations décrivent votre projet et alimentent les coordonnées du site.' : 'Ces informations sont conservées et préremplissent automatiquement le générateur magique.'}</p>
        {!branded && <div className="mb-4 max-w-xs"><label className="label">Langue de votre espace</label><select className="input" value={profile.language} onChange={(e) => setProfileField('language', e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></div>}
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="label">{branded ? 'Année de début du projet' : 'Année de création'}</label><input className="input" value={profile.year} onChange={(e) => setProfileField('year', e.target.value)} placeholder="2015" /></div>
          {!branded && <div className="sm:col-span-2"><label className="label">Cause / type d’association</label><select className="input" value={profile.category} onChange={(e) => setProfileField('category', e.target.value)}><option value="">Choisir une cause</option>{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>}
        </div>
        <div className="mt-4"><label className="label">{branded ? 'Présentation et univers artistique' : 'Mission et raison d’être'}</label><textarea className="input min-h-[110px]" value={profile.mission} onChange={(e) => setProfileField('mission', e.target.value)} placeholder={branded ? 'Présentez le projet, son histoire, ses influences et son univers.' : 'Pourquoi l’association existe, son histoire, ses valeurs et ce qu’elle veut changer.'} /></div>
        <div className="mt-4"><label className="label">Slogan court affiché dans le footer</label><input className="input" maxLength={180} value={profile.slogan} onChange={(e) => setProfileField('slogan', e.target.value)} placeholder="Ex. Ensemble, faisons grandir demain." /><p className="mt-1 text-xs text-gray-500">Une phrase courte, différente de la description de votre cause.</p></div>
        <div className="mt-4"><label className="label">{branded ? 'Équipe et fonctionnement du projet' : 'Fonctionnement'}</label><textarea className="input min-h-[90px]" value={profile.functioning} onChange={(e) => setProfileField('functioning', e.target.value)} placeholder={branded ? 'Équipe, collaborations, production et direction artistique.' : 'Équipe, bénévoles, adhérents, financement, fréquence et zone d’intervention.'} /></div>
        <div className="mt-4"><label className="label">{branded ? 'Sorties, concerts et activités' : 'Actions concrètes'}</label><textarea className="input min-h-[90px]" value={profile.actions} onChange={(e) => setProfileField('actions', e.target.value)} placeholder={branded ? 'Sorties musicales, concerts, clips et actualités.' : 'Programmes, activités, permanences et événements.'} /></div>
        <div className="mt-4"><label className="label">{branded ? 'Public et audience' : 'Public accompagné'}</label><textarea className="input min-h-[70px]" value={profile.beneficiaries} onChange={(e) => setProfileField('beneficiaries', e.target.value)} placeholder={branded ? 'Décrivez votre public et votre communauté.' : 'Qui bénéficie des actions et quels sont ses besoins ?'} /></div>
        <div className="mt-4"><label className="label">Informations importantes</label><textarea className="input min-h-[80px]" value={profile.goodToKnow} onChange={(e) => setProfileField('goodToKnow', e.target.value)} placeholder={branded ? 'Dates, liens, contacts professionnels et informations utiles…' : 'Adhésion, horaires, reçus fiscaux, partenaires, chiffres clés…'} /></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Ville / territoire</label><input className="input" value={profile.city} onChange={(e) => setProfileField('city', e.target.value)} /></div>
          <div><label className="label">E-mail public</label><input type="email" className="input" value={profile.email} onChange={(e) => setProfileField('email', e.target.value)} placeholder={branded ? 'contact@vielusos.com' : 'contact@association.fr'} /></div>
          <div><label className="label">Téléphone public</label><input className="input" value={profile.phone} onChange={(e) => setProfileField('phone', e.target.value)} placeholder="01 23 45 67 89" /></div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-900">Réseaux sociaux</h3>
          <p className="mb-3 text-sm text-gray-500">Ajoutez uniquement les comptes officiels {branded ? 'du projet' : 'de l’association'}.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'twitter'] as const).map((network) => (
              <div key={network}><label className="label capitalize">{network === 'twitter' ? 'X (Twitter)' : network}</label><input className="input" type="url" value={profile[network]} onChange={(e) => setProfileField(network, e.target.value)} placeholder={network === 'twitter' ? 'https://x.com/...' : `https://${network}.com/...`} /></div>
            ))}
          </div>
        </div>
        <div className="mt-6 border-t border-gray-100 pt-5">
          <h3 className="font-bold text-gray-900">Informations légales</h3>
          <p className="mb-3 text-sm text-gray-500">Elles servent à générer automatiquement les mentions légales et les conditions d’utilisation.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Nom légal complet</label><input className="input" value={profile.legalName} onChange={(e) => setProfileField('legalName', e.target.value)} /></div>
            <div><label className="label">{branded ? 'SIREN / numéro d’enregistrement' : 'Numéro RNA / SIREN / enregistrement'}</label><input className="input" value={profile.registrationNumber} onChange={(e) => setProfileField('registrationNumber', e.target.value)} /></div>
            <div className="sm:col-span-2"><label className="label">{branded ? 'Adresse légale' : 'Adresse du siège social'}</label><input className="input" value={profile.legalAddress} onChange={(e) => setProfileField('legalAddress', e.target.value)} /></div>
            <div><label className="label">Pays légal</label><input className="input" value={profile.legalCountry} onChange={(e) => setProfileField('legalCountry', e.target.value)} placeholder="France, Belgique, Canada…" /></div>
            <div className="sm:col-span-2"><label className="label">Responsable de publication</label><input className="input" value={profile.publicationDirector} onChange={(e) => setProfileField('publicationDirector', e.target.value)} /></div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-brand-50 p-4"><input type="checkbox" className="mt-1 h-5 w-5" checked={profile.generateCgv} onChange={(e) => setProfileField('generateCgv', e.target.checked)} /><span><strong className="block text-gray-900">Générer mes CGV et mentions légales</strong><span className="text-sm text-gray-600">{branded ? 'Créez des documents détaillés à partir de vos informations légales, puis modifiez-les dans votre espace.' : 'EasyAsso crée des documents détaillés à partir des informations légales ci-dessus. Vous pourrez ensuite les modifier.'}</span></span></label>
        </div>
        <button onClick={saveProfile} className="btn btn-primary mt-5"><Save className="h-4 w-4" /> {branded ? 'Enregistrer le profil' : 'Enregistrer la fiche'}</button>
      </div>

      {/* Address */}
      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><Globe className="h-5 w-5" /> Adresse de votre site</h2>
        <p className="text-sm text-gray-500">Votre adresse gratuite, disponible immédiatement :</p>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
          <span className="flex-1 break-all font-mono text-sm text-brand-700">{freeUrl}</span>
          <button onClick={() => copy(freeUrl)} className="text-gray-400 hover:text-gray-700"><Copy className="h-4 w-4" /></button>
          <a href={freeUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-700"><ExternalLink className="h-4 w-4" /></a>
        </div>
      </div>

      {/* Custom domain */}
      <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><ShieldCheck className="h-5 w-5" /> {branded ? 'Adresse personnalisée du site' : 'Adresse personnalisée de l’association'}</h2>
        <p className="text-sm text-gray-500">{branded ? 'Cela change uniquement l’adresse publique de votre site. Votre adresse principale reste protégée.' : 'Cela change uniquement l’adresse du site de l’association. L’adresse principale EasyAsso reste toujours protégée.'}</p>
        {!canDomain ? (
          <p className="mt-3 text-sm text-amber-600">Vous n’avez pas la permission de gérer le domaine.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDomainChoice('connect')} className={`rounded-xl border p-4 text-left transition ${domainChoice === 'connect' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <Link2 className="mb-2 h-5 w-5 text-brand-600" />
                <span className="block font-semibold text-gray-900">J’ai déjà une adresse</span>
                <span className="mt-1 block text-sm text-gray-500">Par exemple {branded ? 'vielusos.com' : 'mon-association.fr'}</span>
              </button>
              <button type="button" onClick={() => setDomainChoice('buy')} className={`rounded-xl border p-4 text-left transition ${domainChoice === 'buy' ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <ShoppingCart className="mb-2 h-5 w-5 text-brand-600" />
                <span className="block font-semibold text-gray-900">Je veux acheter une adresse</span>
                <span className="mt-1 block text-sm text-gray-500">Nous vous guidons, sans abonnement d’hébergement inutile</span>
              </button>
            </div>
            {domainChoice === 'buy' && (
              <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">1. Choisissez et achetez votre adresse</p>
                <p className="mt-1 text-blue-800">Le domaine restera à votre nom. Une fois l’achat terminé, revenez ici et choisissez « J’ai déjà une adresse ».</p>
                <a className="btn btn-primary mt-3 inline-flex text-sm" href="https://www.ovhcloud.com/fr/domains/domain-name-checker/" target="_blank" rel="noreferrer">Chercher une adresse disponible <ExternalLink className="h-4 w-4" /></a>
              </div>
            )}
            {domainChoice === 'connect' && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <label className="label">{branded ? 'Quelle adresse souhaitez-vous relier au site ?' : 'Quelle adresse appartient à l’association ?'}</label>
                <div className="flex gap-2">
                  <input className="input" placeholder={branded ? 'vielusos.com' : 'mon-association.fr'} value={domain} onChange={(e) => setDomain(e.target.value)} />
                  <button onClick={saveDomain} disabled={savingDomain || !domain.trim()} className="btn btn-primary shrink-0">{savingDomain ? 'Ajout…' : 'Continuer'}</button>
                </div>
                <p className="mt-2 text-xs text-gray-500">{branded ? 'Votre adresse gratuite reste protégée automatiquement.' : 'Ne saisissez pas easyasso.vercel.app : cette adresse est protégée automatiquement.'}</p>
              </div>
            )}
            {site.customDomain && (
              <div className="mt-4 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{site.customDomain}</span>
                  <span className={`badge ${site.domainVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {site.domainVerified ? <><Check className="mr-1 h-3 w-3" /> Prêt</> : 'Branchement à terminer'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {site.domainVerified ? (
                    <p>{branded ? 'Tout est terminé. Les visiteurs peuvent utiliser cette adresse pour voir le site.' : 'Tout est terminé. Les visiteurs peuvent utiliser cette adresse pour voir le site de l’association.'}</p>
                  ) : (
                    <><p className="font-medium">Dernière étape</p><p className="mt-1">Ouvrez l’espace où cette adresse a été achetée, puis demandez à votre registrar de la diriger vers votre site. Les indications techniques dépendent de votre fournisseur.</p></>
                  )}
                </div>
                {!site.domainVerified && <button onClick={verify} disabled={verifying} className="btn btn-ghost mt-3 text-sm">{verifying ? 'Vérification…' : 'Vérifier si tout est prêt'}</button>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Billing: the VIELUSOS workspace is a lifetime complimentary account. */}
      {!branded && <div className="card mb-6">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><CreditCard className="h-5 w-5" /> Abonnement</h2>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div>
            <span className={`badge ${org.planStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {org.planStatus === 'ACTIVE' ? 'Actif' : org.planStatus === 'TRIAL' ? 'Essai gratuit' : org.planStatus === 'PENDING_PAYMENT' ? 'Paiement en attente' : org.planStatus}
            </span>
            {org.paidAt && <p className="mt-1 text-sm text-gray-500">Réglé le {formatDate(org.paidAt)}</p>}
            {pendingPlan && <p className="mt-1 text-sm font-medium text-amber-700">Upgrade demandé : {PLANS[pendingPlan].name}</p>}
          </div>
          <span className="text-right text-sm text-gray-500">Formule actuelle : <strong className="text-gray-700">{PLANS[currentPlan].name}</strong></span>
        </div>

        {billingError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{billingError}</p>}

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {planIds.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = isActivePlan && currentPlan === planId;
            const canSelect = selectablePlans.includes(planId);
            const transferAllowed = planId !== 'monthly' && canSelect;
            return (
              <div key={plan.id} className={`rounded-2xl border p-4 ${isCurrent ? 'border-green-200 bg-green-50' : canSelect ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-70'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.period}</p>
                  </div>
                  {isCurrent && <span className="badge bg-green-100 text-green-700">Actuel</span>}
                </div>
                <p className="mt-3 text-3xl font-black text-gray-900">{plan.amountEur} €</p>
                <p className="text-xs text-gray-500">{planId === 'monthly' ? 'Prélèvement mensuel par carte.' : planId === 'annual' ? 'Paiement annuel, carte ou virement.' : 'Paiement unique, carte ou virement.'}</p>
                {canSelect ? (
                  <div className="mt-4 space-y-2">
                    <button onClick={() => payPlan(planId)} disabled={billingLoading === planId} className="btn btn-primary w-full text-sm">
                      {billingLoading === planId ? 'Ouverture…' : isActivePlan ? `Passer à ${plan.name}` : `Payer ${plan.amountEur} €`}
                    </button>
                    {transferAllowed && <ManualTransferButton price={String(plan.amountEur)} plan={planId} />}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-white/70 p-3 text-xs text-gray-500">
                    {isCurrent ? 'Votre formule active.' : 'Formule inférieure à votre abonnement actuel.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Si vous êtes en essai ou en attente de paiement, choisissez une formule pour activer durablement votre site. Si vous êtes déjà actif, seuls les upgrades sont proposés pour éviter les doubles changements contradictoires.
        </p>
      </div>}

      <div className="card border-2 border-gray-200">
        <h2 className="mb-1 flex items-center gap-2 font-bold text-gray-900"><Power className="h-5 w-5" /> Mise en ligne du site</h2>
        <p className="mb-4 text-sm text-gray-500">Dernier réglage : vous pouvez cacher le site au public sans supprimer votre contenu.</p>
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
          <span>
            <strong className="block text-gray-900">{published ? 'Site actuellement en ligne' : 'Site actuellement hors ligne'}</strong>
            <span className="text-sm text-gray-500">{published ? 'Les visiteurs peuvent voir le site.' : 'Les visiteurs ne voient pas le site pour le moment.'}</span>
          </span>
          <input type="checkbox" className="h-6 w-6" checked={published} onChange={(e) => togglePublished(e.target.checked)} />
        </label>
      </div>
    </div>
  );
}
