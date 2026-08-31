'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Wand2, Eye, X, Monitor, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/ui';

type T = { id: string; name: string; category: string; family: 'association' | 'shop' | 'music'; tagline: string; preview: string; primary: string };

export function ThemesClient({ templates, welcome }: { templates: T[]; welcome: boolean }) {
  const router = useRouter();
  const [applying, setApplying] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [family, setFamily] = useState<'all' | 'association' | 'shop' | 'music'>('all');
  const previewT = templates.find((t) => t.id === previewId);
  const shown = family === 'all' ? templates : templates.filter((t) => t.family === family);
  const counts = { all: templates.length, association: templates.filter((t) => t.family === 'association').length, shop: templates.filter((t) => t.family === 'shop').length, music: templates.filter((t) => t.family === 'music').length };

  async function apply(id: string) {
    setApplying(id);
    setConfirmId(null);
    await fetch('/api/site/apply-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId: id }),
    });
    setApplying(null);
    router.push('/dashboard/editor');
  }

  return (
    <div>
      <PageHeader
        title={welcome ? 'Choisissez le style de votre site' : 'Modèles de site'}
        subtitle="Sélectionnez une structure prête à l’emploi. Vous n’aurez plus qu’à remplacer les textes et les photos."
      />

      {welcome && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
          <Wand2 className="h-5 w-5 shrink-0" />
          <p>Bienvenue ! Choisissez un modèle ci-dessous pour démarrer. Vous pourrez tout personnaliser ensuite, et changer de modèle à tout moment.</p>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([['all', 'Tous'], ['association', 'Associations'], ['shop', 'Boutiques'], ['music', 'Musique']] as const).map(([value, label]) => (
          <button key={value} onClick={() => setFamily(value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${family === value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label} <span className={family === value ? 'text-white/70' : 'text-gray-400'}>({counts[value]})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <div key={t.id} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
            <div className="relative aspect-[16/10] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.preview} alt={t.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ background: t.primary }}>{t.category}</span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{t.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{t.tagline}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { setPreviewId(t.id); setDevice('desktop'); }} className="btn btn-ghost flex-1 text-sm"><Eye className="h-4 w-4" /> Aperçu</button>
                <button
                  onClick={() => setConfirmId(t.id)}
                  disabled={applying !== null}
                  className="btn btn-primary flex-1 text-sm"
                  style={{ background: t.primary }}
                >
                  {applying === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Choisir</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewId && previewT && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 p-3 sm:p-6" onClick={() => setPreviewId(null)}>
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{previewT.name}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: previewT.primary }}>{previewT.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden rounded-lg border border-gray-200 p-0.5 sm:inline-flex">
                  <button onClick={() => setDevice('desktop')} className={`rounded p-1.5 ${device === 'desktop' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><Monitor className="h-4 w-4" /></button>
                  <button onClick={() => setDevice('mobile')} className={`rounded p-1.5 ${device === 'mobile' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}><Smartphone className="h-4 w-4" /></button>
                </div>
                <button onClick={() => { setConfirmId(previewId); setPreviewId(null); }} className="btn btn-primary text-sm" style={{ background: previewT.primary }}><Check className="h-4 w-4" /> Choisir ce modèle</button>
                <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="flex flex-1 justify-center overflow-auto bg-gray-100 p-3">
              <iframe
                src={`/theme-preview/${previewId}`}
                title="Aperçu"
                className="h-full rounded-lg border border-gray-200 bg-white shadow-sm transition-all"
                style={{ width: device === 'mobile' ? 390 : '100%', maxWidth: device === 'mobile' ? 390 : 1100 }}
              />
            </div>
          </div>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setConfirmId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900">Appliquer ce modèle ?</h3>
            <p className="mt-2 text-sm text-gray-500">
              Le contenu actuel de vos pages sera remplacé par ce modèle (votre logo est conservé). Vous pourrez ensuite tout modifier.
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setConfirmId(null)} className="btn btn-ghost flex-1">Annuler</button>
              <button onClick={() => apply(confirmId)} className="btn btn-primary flex-1">Appliquer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
