'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { ColorGrid, ImageInput, Field } from '../editor/controls';
import { FONTS, fontById } from '@/lib/fonts';

export function IdentityClient({ theme: t0, header: h0, footer: f0, branded = false }: { theme: any; header: any; footer: any; branded?: boolean }) {
  const router = useRouter();
  const [theme, setTheme] = useState<any>({ primary: '#1b5df5', secondary: '#0f766e', background: '#ffffff', text: '#1f2937', font: 'sans', ...t0 });
  const [logo, setLogo] = useState<string>(h0.logoUrl || f0.logoUrl || '');
  const [saved, setSaved] = useState(false);
  const timer = useRef<any>(undefined);

  function persist(nextTheme: any, nextLogo: string) {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      // apply-theme also recolours every button on the site to the new primary
      await fetch('/api/site/apply-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: nextTheme, logoUrl: nextLogo || undefined }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      router.refresh();
    }, 500);
  }
  function setT(patch: any) { const next = { ...theme, ...patch }; setTheme(next); persist(next, logo); }
  function setL(url: string) { setLogo(url); persist(theme, url); }

  const fontStack = fontById(theme.font).stack;

  return (
    <div className="max-w-4xl">
      <PageHeader title="Identité du site" subtitle="Votre logo, vos polices et les couleurs de tout le site — au même endroit." />
      {saved && <div className="mb-4 flex items-center gap-1 text-sm text-green-600"><Check className="h-4 w-4" /> Enregistré</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: controls */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="mb-3 font-bold text-gray-900">Logo</h2>
            <p className="mb-3 text-sm text-gray-500">{branded ? 'Importez le logo de votre projet. Il s’applique automatiquement à l’en-tête et au pied de page.' : 'Importez le logo de votre association. Il s’applique automatiquement à l’en-tête et au pied de page.'}</p>
            <ImageInput value={logo} onChange={setL} kind="logo" />
          </div>

          <div className="card">
            <h2 className="mb-3 font-bold text-gray-900">Police d’écriture</h2>
            <div className="grid grid-cols-1 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setT({ font: f.id })}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left ${theme.font === f.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span style={{ fontFamily: f.stack }} className="text-lg">{f.label}</span>
                  {theme.font === f.id && <Check className="h-4 w-4 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="font-bold text-gray-900">Couleurs du site</h2>
            <Field label="Couleur principale (boutons, accents)"><ColorGrid value={theme.primary} onChange={(c) => setT({ primary: c })} /></Field>
            <Field label="Couleur de fond du site"><ColorGrid value={theme.background} onChange={(c) => setT({ background: c })} /></Field>
            <Field label="Couleur du texte"><ColorGrid value={theme.text} onChange={(c) => setT({ text: c })} /></Field>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">Aperçu</p>
          <div className="overflow-hidden rounded-2xl ring-1 ring-gray-200" style={{ background: theme.background, color: theme.text, fontFamily: fontStack }}>
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <div className="flex items-center gap-2 font-extrabold">
                {logo ? <img src={logo} alt="" className="max-h-12 max-w-44 rounded-lg bg-white/90 p-1 object-contain shadow-sm ring-1 ring-black/5" /> : <span>{branded ? 'VIELUSOS' : 'Votre association'}</span>}
              </div>
              <span className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white" style={{ background: theme.primary }}>{branded ? 'Écouter' : 'Faire un don'}</span>
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-extrabold">{branded ? 'Power of emotion' : 'Ensemble, changeons les choses'}</h3>
              <p className="mt-2 text-sm opacity-80">Voici à quoi ressemblent vos textes, votre police et vos couleurs sur le site.</p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: theme.primary }}>Bouton plein</span>
                <span className="rounded-lg border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: theme.primary, color: theme.primary }}>Bouton contour</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">Les couleurs et la police s’appliquent à l’ensemble de votre site public. Vous pouvez toujours changer la couleur d’un bloc précis dans l’éditeur.</p>
        </div>
      </div>
    </div>
  );
}
