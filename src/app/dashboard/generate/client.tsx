'use client';
import { useState } from 'react';
import { Sparkles, Loader2, Wand2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { ImageInput, Field } from '../editor/controls';

function compressForGeneration(value: string, maxDimension: number, quality: number): Promise<string> {
  if (!value.startsWith('data:image/')) return Promise.resolve(value);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) return resolve(value);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => resolve(value);
    image.src = value;
  });
}

function prepareLogoForGeneration(value: string): Promise<string> {
  if (!value.startsWith('data:image/')) return Promise.resolve(value);
  if (value.startsWith('data:image/png') && value.length < 1_800_000) return Promise.resolve(value);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const ratio = Math.min(1, 1400 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext('2d');
      if (!context) return resolve(value);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(value.startsWith('data:image/jpeg') ? 'image/jpeg' : 'image/png', 0.95));
    };
    image.onerror = () => resolve(value);
    image.src = value;
  });
}

type Preview = { id: string; name: string; preview: string; family: 'association' | 'shop' | 'music' };

export function GenerateClient({ orgName, profile, categories, previews = [], welcome, initialLogo = '' }: { orgName: string; profile: any; categories: { id: string; name: string }[]; previews?: Preview[]; welcome: boolean; initialLogo?: string }) {
  const [f, setF] = useState({
    name: orgName || '', year: profile.year || '', mission: profile.mission || '', functioning: profile.functioning || '', actions: profile.actions || '',
    siteType: (profile.siteType || (profile.hasShop && profile.isAssociation === false ? 'shop' : 'association')) as 'association' | 'shop' | 'other' | 'music',
    hasShop: profile.hasShop ?? false,
    genre: profile.genre || '',
    artistStory: profile.artistStory || '', artistSound: profile.artistSound || '', artistLive: profile.artistLive || '',
    brandStory: profile.brandStory || '', brandPromise: profile.brandPromise || '', brandProof: profile.brandProof || '', shippingInfo: profile.shippingInfo || '',
    musicSpotify: profile.streamingLinks?.spotify || '', musicDeezer: profile.streamingLinks?.deezer || '', musicApple: profile.streamingLinks?.appleMusic || '', musicSoundcloud: profile.streamingLinks?.soundcloud || '', musicYoutube: profile.streamingLinks?.youtube || '', instagram: profile.instagram || '',
    language: profile.language || 'fr', beneficiaries: profile.beneficiaries || '', goodToKnow: profile.goodToKnow || '', slogan: profile.slogan || '', generateCgv: profile.generateCgv ?? true, news: '', city: profile.city || '', email: profile.email || '', legalCountry: profile.legalCountry || 'France', category: profile.category || '',
    donationCardEnabled: profile.donationCardEnabled ?? false, donationStripeUrl: profile.donationStripeUrl || '', donationHelloAssoEnabled: profile.donationHelloAssoEnabled ?? Boolean(profile.donationHelloAssoUrl), donationHelloAssoUrl: profile.donationHelloAssoUrl || '', donationTransferEnabled: profile.donationTransferEnabled ?? false, donationIban: profile.donationIban || '', donationBic: profile.donationBic || '', donationAccountHolder: profile.donationAccountHolder || '', donationBankName: profile.donationBankName || '', donationChequeEnabled: profile.donationChequeEnabled ?? false, donationChequePayable: profile.donationChequePayable || '', donationChequeAddress: profile.donationChequeAddress || '',
    leetchiEnabled: profile.leetchiEnabled ?? Boolean(profile.leetchiUrl), leetchiUrl: profile.leetchiUrl || '', leetchiEmbedUrl: profile.leetchiEmbedUrl || '', leetchiEmbedCode: profile.leetchiEmbedCode || '', leetchiCollectedEuros: profile.leetchiCollectedEuros || '', leetchiGoalEuros: profile.leetchiGoalEuros || '',
  });
  const [logo, setLogo] = useState(initialLogo);
  const [photos, setPhotos] = useState<string[]>(['']);
  const [trackLinks, setTrackLinks] = useState<string[]>(Array.isArray(profile.trackLinks) && profile.trackLinks.length ? profile.trackLinks : ['', '', '']);
  const [videoLinks, setVideoLinks] = useState<string[]>(Array.isArray(profile.videoLinks) && profile.videoLinks.length ? profile.videoLinks : ['']);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));
  const isShop = f.siteType === 'shop';
  const isMusic = f.siteType === 'music';
  const nameLabel = isMusic ? 'Nom d’artiste / de groupe' : isShop ? 'Nom de la boutique / marque' : f.siteType === 'other' ? 'Nom de votre projet' : 'Nom de l’association';
  const missionLabel = isMusic ? 'Votre bio ★' : isShop ? 'Présentez votre univers / votre marque ★' : 'À propos / votre mission ★';
  const functioningLabel = isMusic ? 'Votre façon de créer / produire' : isShop ? 'Que proposez-vous ? (votre offre)' : 'Comment fonctionne votre association ?';
  const actionsLabel = isMusic ? 'Vos sorties, scènes et projets actuels' : isShop ? 'Votre savoir-faire / vos gammes' : 'Vos actions / activités concrètes';
  const beneficiariesLabel = isMusic ? 'Votre public / l’expérience recherchée' : isShop ? 'Votre clientèle' : 'Public aidé / bénéficiaires';
  const visualPreviews = isMusic ? [] : previews.filter((p) => (isShop ? p.family === 'shop' : p.family === 'association'));

  function setArr(setter: (v: string[]) => void, arr: string[], i: number, v: string) { setter(arr.map((x, j) => (j === i ? v : x))); }

  async function generate() {
    if (!f.mission.trim()) return;
    setBusy(true); setError('');
    const compressedLogo = logo ? await prepareLogoForGeneration(logo) : undefined;
    const compressedPhotos = await Promise.all(photos.filter(Boolean).map((photo) => compressForGeneration(photo, 900, 0.68)));
    const musicPayload = isMusic ? {
      streamingLinks: { spotify: f.musicSpotify, deezer: f.musicDeezer, appleMusic: f.musicApple, soundcloud: f.musicSoundcloud, youtube: f.musicYoutube },
      trackLinks: trackLinks.filter(Boolean),
      videoLinks: videoLinks.filter(Boolean),
      instagram: f.instagram,
    } : {};
    const basePayload = { ...f, ...musicPayload, name: f.name.trim(), logoUrl: compressedLogo };
    // Keep the request safely below the hosting limit. URL-based photos do
    // not add meaningful payload weight and are always retained.
    const safePhotos: string[] = [];
    for (const photo of compressedPhotos) {
      const candidate = JSON.stringify({ ...basePayload, photos: [...safePhotos, photo] });
      if (candidate.length < 3_200_000) safePhotos.push(photo);
    }
    const request = (payload: any) => fetch('/api/site/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    let res = await request({ ...basePayload, photos: safePhotos });
    // Absolute safety net for platform request-size limits: the site and its
    // copy must still be generated. Images can then be added in the editor.
    if (res.status === 413) res = await request({ ...f, name: f.name.trim(), logoUrl: compressedLogo, photos: [] });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || `La génération a échoué (${res.status}). Votre ancien site a été conservé. Réessayez.`);
      setBusy(false);
      return;
    }
    const data = await res.json().catch(() => ({}));
    window.location.assign(`/dashboard/editor?generated=${encodeURIComponent(data.siteVersion || Date.now())}`);
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={<span className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-brand-600" /> Générateur magique</span>}
        subtitle="Répondez au petit questionnaire : votre site complet, avec des textes développés, se crée tout seul."
      />

      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          <Wand2 className="h-5 w-5 shrink-0" />
          <p>Bienvenue ! Votre essai gratuit de 3 jours a commencé. Plus vous remplissez de champs, plus votre site sera riche et personnalisé.</p>
        </div>
      )}

      <div className="card space-y-5">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {Object.values(profile || {}).some(Boolean) && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">Les informations enregistrées dans Réglages ont été préremplies. Vous pouvez les adapter pour cette génération.</div>}

        {/* Site type — adapts the questionnaire and the AI's tone */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
          <p className="mb-2 text-sm font-bold text-gray-900">Quel type de site voulez-vous créer ?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([['association', 'Association'], ['shop', 'Boutique'], ['music', 'Site musical'], ['other', 'Autre projet']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setF((s) => ({ ...s, siteType: value, hasShop: value === 'shop' ? true : value === 'music' ? false : s.hasShop }))} className={`rounded-xl border-2 px-2 py-2 text-sm font-semibold transition ${f.siteType === value ? 'border-brand-600 bg-white text-brand-700' : 'border-transparent bg-white/70 text-gray-600 hover:bg-white'}`}>{label}</button>
            ))}
          </div>
          {(f.siteType === 'association' || f.siteType === 'other') && (
            <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm ring-1 ring-gray-200">
              <input type="checkbox" className="h-5 w-5" checked={f.hasShop} onChange={(e) => setF((s) => ({ ...s, hasShop: e.target.checked }))} />
              <span><strong className="text-gray-900">Ajouter aussi une boutique en ligne</strong><span className="block text-xs text-gray-500">Une page Boutique prête à remplir sera créée (activable/désactivable ensuite).</span></span>
            </label>
          )}
          <p className="mt-2 text-xs text-gray-500">{isMusic ? 'Site d’artiste : liens streaming, derniers sons (pochettes récupérées automatiquement depuis les liens), vidéos et Instagram.' : isShop ? 'L’IA écrira un vrai site de boutique (univers, sélection, infos pratiques) — les produits s’ajoutent ensuite dans l’onglet Boutique.' : 'L’IA adapte les textes et les pages à votre type de projet.'}</p>

          {visualPreviews.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Aperçu des styles possibles</p>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visualPreviews.map((p) => (
                  <div key={p.id} className="w-28 shrink-0" title={p.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.preview} alt={p.name} loading="lazy" className="h-20 w-28 rounded-lg object-cover ring-1 ring-gray-200" />
                    <p className="mt-1 truncate text-[10px] text-gray-500">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isMusic && (
          <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
            <div><h3 className="font-extrabold text-gray-900">Vos liens (les miniatures seront celles des liens)</h3><p className="text-sm text-gray-500">Collez vos liens : les pochettes et titres sont récupérés automatiquement.</p></div>
            <Field label="Style de musique"><input className="input" value={f.genre} onChange={(e) => set('genre', e.target.value)} placeholder="ex : techno, rap, house, pop, rock…" /><p className="mt-1 text-xs text-gray-400">La couleur d’accent du site s’adapte à votre style.</p></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Spotify"><input className="input" type="url" value={f.musicSpotify} onChange={(e) => set('musicSpotify', e.target.value)} placeholder="https://open.spotify.com/artist/…" /></Field>
              <Field label="Deezer"><input className="input" type="url" value={f.musicDeezer} onChange={(e) => set('musicDeezer', e.target.value)} placeholder="https://www.deezer.com/artist/…" /></Field>
              <Field label="Apple Music"><input className="input" type="url" value={f.musicApple} onChange={(e) => set('musicApple', e.target.value)} placeholder="https://music.apple.com/…" /></Field>
              <Field label="SoundCloud"><input className="input" type="url" value={f.musicSoundcloud} onChange={(e) => set('musicSoundcloud', e.target.value)} placeholder="https://soundcloud.com/…" /></Field>
              <Field label="YouTube"><input className="input" type="url" value={f.musicYoutube} onChange={(e) => set('musicYoutube', e.target.value)} placeholder="https://youtube.com/@…" /></Field>
              <Field label="Instagram"><input className="input" type="url" value={f.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/… ou @pseudo" /></Field>
            </div>
            <div>
              <label className="label">Derniers sons (liens Spotify, YouTube, SoundCloud…)</label>
              <div className="space-y-2">
                {trackLinks.map((l, i) => (
                  <input key={i} className="input" type="url" value={l} onChange={(e) => setArr(setTrackLinks, trackLinks, i, e.target.value)} placeholder="Lien d’un son — la pochette s’affichera automatiquement" />
                ))}
              </div>
              {trackLinks.length < 12 && <button type="button" onClick={() => setTrackLinks([...trackLinks, ''])} className="btn btn-ghost mt-2 text-sm"><Plus className="h-4 w-4" /> Ajouter un son</button>}
            </div>
            <div>
              <label className="label">Vidéos YouTube (optionnel)</label>
              <div className="space-y-2">
                {videoLinks.map((l, i) => (
                  <input key={i} className="input" type="url" value={l} onChange={(e) => setArr(setVideoLinks, videoLinks, i, e.target.value)} placeholder="https://youtube.com/watch?v=…" />
                ))}
              </div>
              {videoLinks.length < 12 && <button type="button" onClick={() => setVideoLinks([...videoLinks, ''])} className="btn btn-ghost mt-2 text-sm"><Plus className="h-4 w-4" /> Ajouter une vidéo</button>}
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Field label={nameLabel}><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} placeholder={isMusic ? 'OddyMatt' : isShop ? 'Ma Jolie Boutique' : 'Les Amis du Quartier'} /></Field>
          </div>
          <Field label="Année de création"><input className="input" value={f.year} onChange={(e) => set('year', e.target.value)} placeholder="2015" /></Field>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
          <p className="mb-1 block text-xs font-semibold uppercase tracking-wide text-brand-700">{isShop ? 'Logo de la boutique' : 'Logo'}</p>
          <p className="mb-3 text-sm text-gray-600">Il sera automatiquement utilisé dans l’en-tête et le pied de page du nouveau site généré.</p>
          <ImageInput value={logo} onChange={setLogo} kind="logo" />
        </div>

        <Field label={missionLabel}>
          <textarea className="input min-h-[110px]" value={f.mission} onChange={(e) => set('mission', e.target.value)}
            placeholder={isMusic ? 'Racontez le projet, son origine, votre parcours et ce que vous voulez faire ressentir.' : isShop ? 'Qui êtes-vous, que vendez-vous, quel est votre style, vos valeurs ? Ex : créations artisanales en cuir, faites main à Lyon…' : 'Qui êtes-vous, quelle est votre cause, vos valeurs ? Ex : Nous aidons les personnes âgées isolées à rompre la solitude…'} />
          <p className="mt-1 text-xs text-gray-400">Champ le plus important — sert de base à tous les textes.</p>
        </Field>

        {isMusic && <section className="space-y-4 rounded-2xl border border-violet-200 bg-violet-50/50 p-4"><div><h3 className="font-extrabold text-gray-900">Matière éditoriale de l’artiste</h3><p className="text-sm text-gray-600">Ces réponses alimentent la home et une vraie page Bio. Plus elles sont précises, moins le texte sera générique.</p></div><Field label="Parcours et origine du projet"><textarea className="input min-h-24" value={f.artistStory} onChange={(e) => set('artistStory', e.target.value)} placeholder="Déclic, premières influences, évolution du projet, intention artistique…" /></Field><Field label="Son, influences et émotions"><textarea className="input min-h-24" value={f.artistSound} onChange={(e) => set('artistSound', e.target.value)} placeholder="Textures, tempo, influences, atmosphère, énergie, émotions recherchées…" /></Field><Field label="Live et univers visuel"><textarea className="input min-h-24" value={f.artistLive} onChange={(e) => set('artistLive', e.target.value)} placeholder="Scénographie, relation au public, images, lumières, identité sur scène…" /></Field></section>}

        {isShop && <section className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4"><div><h3 className="font-extrabold text-gray-900">Matière éditoriale de la marque</h3><p className="text-sm text-gray-600">L’IA s’en sert pour créer un univers de marque crédible, une home détaillée et des pages pratiques.</p></div><Field label="Histoire de la marque"><textarea className="input min-h-24" value={f.brandStory} onChange={(e) => set('brandStory', e.target.value)} placeholder="Origine, déclic, personnes derrière la marque, vision…" /></Field><Field label="Promesse client"><textarea className="input min-h-24" value={f.brandPromise} onChange={(e) => set('brandPromise', e.target.value)} placeholder="Pourquoi choisir votre boutique ? Quelle expérience voulez-vous offrir ?" /></Field><Field label="Preuves et savoir-faire"><textarea className="input min-h-24" value={f.brandProof} onChange={(e) => set('brandProof', e.target.value)} placeholder="Fabrication, sélection, matières, contrôle qualité, expertise — sans inventer de label." /></Field><Field label="Livraison, retours et délais"><textarea className="input min-h-24" value={f.shippingInfo} onChange={(e) => set('shippingInfo', e.target.value)} placeholder="Zones livrées, délais réels, retours, emballage, retrait…" /></Field></section>}

        <Field label={functioningLabel}>
          <textarea className="input min-h-[90px]" value={f.functioning} onChange={(e) => set('functioning', e.target.value)}
            placeholder={isMusic ? 'Composition, production, machines ou instruments, manière de collaborer…' : isShop ? 'Types de produits, matières, gammes, éditions limitées, sur-mesure…' : 'Bénévoles, adhérents, organisation, fréquence des actions, financement…'} />
        </Field>

        <Field label="Slogan court pour le pied de page">
          <input className="input" maxLength={180} value={f.slogan} onChange={(e) => set('slogan', e.target.value)} placeholder="Ex. Ensemble, faisons grandir demain." />
        </Field>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-brand-50 p-4"><input type="checkbox" className="mt-1 h-5 w-5" checked={f.generateCgv} onChange={(e) => setF((current) => ({ ...current, generateCgv: e.target.checked }))} /><span><strong className="block text-gray-900">Générer mes CGV et mentions légales</strong><span className="text-sm text-gray-600">EasyAsso crée des documents détaillés et modifiables avec les informations légales enregistrées dans Réglages.</span></span></label>

        {f.generateCgv && (
          <Field label="Pays légal pour les CGV / mentions">
            <input className="input" value={f.legalCountry} onChange={(e) => set('legalCountry', e.target.value)} placeholder="France, Belgique, Canada…" />
            <p className="mt-1 text-xs text-gray-400">Utilisé pour adapter les documents au pays déclaré dans vos coordonnées légales.</p>
          </Field>
        )}

        <Field label="Actualités à publier (optionnel)">
          <textarea className="input min-h-[90px]" value={f.news} onChange={(e) => set('news', e.target.value)}
            placeholder="Un événement, une collecte, un nouveau projet… Laissez vide si vous ne voulez pas de page Actualités." />
          <p className="mt-1 text-xs text-gray-400">La page Actualités sera créée uniquement si vous ajoutez du contenu ici.</p>
        </Field>

        <Field label={actionsLabel}>
          <textarea className="input min-h-[70px]" value={f.actions} onChange={(e) => set('actions', e.target.value)}
            placeholder={isMusic ? 'Ex : nouvel EP, préparation d’un live, clips, DJ sets, collaborations confirmées…' : isShop ? 'Ex : maroquinerie, bijoux faits main, seconde main de luxe…' : 'Ex : visites à domicile, sorties, ateliers, distributions, événements…'} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={beneficiariesLabel}><input className="input" value={f.beneficiaries} onChange={(e) => set('beneficiaries', e.target.value)} placeholder={isMusic ? 'Ex : clubbers, auditeurs de techno mélodique, énergie cathartique…' : isShop ? 'ex : femmes, amateurs de mode, familles…' : 'personnes âgées, enfants, animaux…'} /></Field>
          <Field label={isShop ? 'Catégorie de boutique' : 'Type d’association'}>
            <select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Détection automatique ✨</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Choses à savoir (infos utiles)">
          <textarea className="input min-h-[70px]" value={f.goodToKnow} onChange={(e) => set('goodToKnow', e.target.value)}
            placeholder="Ex : reçus fiscaux, horaires, adhésion, comment devenir bénévole, partenaires…" />
        </Field>

        {isMusic ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">Votre site d’artiste affichera vos sons, vos liens streaming, vos vidéos et votre Instagram — avec les vraies pochettes de vos liens.</div>
        ) : isShop ? (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">Votre catalogue et le paiement se gèrent dans l’onglet <strong>Boutique</strong> — une page Boutique prête à remplir sera créée automatiquement.</div>
        ) : (
        <section className="space-y-4 rounded-2xl border border-gray-200 p-4">
          <div><h3 className="font-extrabold text-gray-900">Comment souhaitez-vous recevoir les dons ?</h3><p className="text-sm text-gray-500">Ces choix créeront automatiquement le formulaire public « Faire un don ».</p></div>
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="h-5 w-5" checked={f.donationCardEnabled} onChange={(e) => setF((s) => ({ ...s, donationCardEnabled: e.target.checked }))} /> Carte bancaire / Stripe</label>
          {f.donationCardEnabled && <Field label="Lien Stripe"><input className="input" type="url" value={f.donationStripeUrl} onChange={(e) => set('donationStripeUrl', e.target.value)} /></Field>}
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="h-5 w-5" checked={f.donationHelloAssoEnabled} onChange={(e) => setF((s) => ({ ...s, donationHelloAssoEnabled: e.target.checked }))} /> HelloAsso</label>
          {f.donationHelloAssoEnabled && <Field label="Lien HelloAsso"><input className="input" type="url" value={f.donationHelloAssoUrl} onChange={(e) => set('donationHelloAssoUrl', e.target.value)} placeholder="https://www.helloasso.com/..." /></Field>}
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="h-5 w-5" checked={f.leetchiEnabled} onChange={(e) => setF((s) => ({ ...s, leetchiEnabled: e.target.checked }))} /> Cagnotte Leetchi</label>
          {f.leetchiEnabled && <div className="grid gap-3 sm:grid-cols-2"><Field label="Lien Leetchi"><input className="input" type="url" value={f.leetchiUrl} onChange={(e) => set('leetchiUrl', e.target.value)} placeholder="https://www.leetchi.com/..." /></Field><Field label="Objectif (€)"><input className="input" type="number" min="0" value={f.leetchiGoalEuros} onChange={(e) => set('leetchiGoalEuros', e.target.value)} /></Field><Field label="Déjà collecté (€)"><input className="input" type="number" min="0" value={f.leetchiCollectedEuros} onChange={(e) => set('leetchiCollectedEuros', e.target.value)} /></Field><Field label="Lien iframe Leetchi (optionnel)"><input className="input" type="url" value={f.leetchiEmbedUrl} onChange={(e) => set('leetchiEmbedUrl', e.target.value)} /></Field></div>}
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="h-5 w-5" checked={f.donationTransferEnabled} onChange={(e) => setF((s) => ({ ...s, donationTransferEnabled: e.target.checked }))} /> Virement bancaire</label>
          {f.donationTransferEnabled && <div className="grid gap-3 sm:grid-cols-2"><Field label="IBAN complet"><input className="input font-mono" value={f.donationIban} onChange={(e) => set('donationIban', e.target.value)} /></Field><Field label="BIC / SWIFT"><input className="input font-mono" value={f.donationBic} onChange={(e) => set('donationBic', e.target.value)} /></Field><Field label="Titulaire"><input className="input" value={f.donationAccountHolder} onChange={(e) => set('donationAccountHolder', e.target.value)} /></Field><Field label="Banque"><input className="input" value={f.donationBankName} onChange={(e) => set('donationBankName', e.target.value)} /></Field></div>}
          <label className="flex items-center gap-3 font-semibold"><input type="checkbox" className="h-5 w-5" checked={f.donationChequeEnabled} onChange={(e) => setF((s) => ({ ...s, donationChequeEnabled: e.target.checked }))} /> Chèque</label>
          {f.donationChequeEnabled && <div className="grid gap-3 sm:grid-cols-2"><Field label="Ordre du chèque"><input className="input" value={f.donationChequePayable} onChange={(e) => set('donationChequePayable', e.target.value)} /></Field><Field label="Adresse d’envoi"><textarea className="input" value={f.donationChequeAddress} onChange={(e) => set('donationChequeAddress', e.target.value)} /></Field></div>}
        </section>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ville"><input className="input" value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Lyon" /></Field>
          <Field label="Email de contact"><input className="input" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@asso.fr" /></Field>
        </div>

        <div>
          <p className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">Vos photos (optionnel)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.map((p, i) => <ImageInput key={i} value={p} onChange={(url) => setPhotos((arr) => arr.map((x, j) => (j === i ? url : x)))} />)}
          </div>
          {photos.length < 8 && (
            <button type="button" onClick={() => setPhotos((p) => [...p, ''])} className="btn btn-ghost mt-3 text-sm"><Plus className="h-4 w-4" /> Ajouter une photo</button>
          )}
        </div>

        <button onClick={generate} disabled={busy || !f.mission.trim()} className="btn btn-primary w-full py-3 text-base">
          {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Création de votre site…</> : <><Sparkles className="h-5 w-5" /> Générer mon site</>}
        </button>
        <p className="text-center text-xs text-gray-400">★ champ requis. Vous pourrez tout modifier ensuite dans l’éditeur.</p>
      </div>
    </div>
  );
}
