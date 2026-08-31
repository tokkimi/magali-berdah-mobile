'use client';
import { useRef, useState } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Upload, Link2, Loader2, X } from 'lucide-react';
import { COLOR_PALETTE } from '@/lib/colors';
import type { Align } from '@/lib/blocks';

// Downscale an uploaded image in the browser to a data URL (no external storage needed).
// Logos must keep transparency and sharp edges; photos can be compressed more.
function fileToDataUrl(file: File, maxDim = 1400, kind: 'image' | 'logo' = 'image'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('canvas'));
        ctx.drawImage(img, 0, 0, width, height);
        if (kind === 'logo') {
          resolve(canvas.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.95));
          return;
        }
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(type, 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageInput({ value, onChange, label, kind = 'image' }: { value?: string; onChange: (url: string) => void; label?: string; kind?: 'image' | 'logo' }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    try { onChange(await fileToDataUrl(f, kind === 'logo' ? 2200 : 1400, kind)); } finally { setLoading(false); }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>}
      {value ? (
        <div className={`relative mb-2 overflow-hidden rounded-lg border border-gray-200 ${kind === 'logo' ? 'bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%),linear-gradient(-45deg,#f3f4f6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f3f4f6_75%),linear-gradient(-45deg,transparent_75%,#f3f4f6_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]' : ''}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={kind === 'logo' ? 'mx-auto max-h-40 w-full object-contain p-4' : 'max-h-32 w-full object-cover'} />
          <button type="button" onClick={() => onChange('')} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black" aria-label="Retirer"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : null}
      <div className="mb-2 inline-flex rounded-lg border border-gray-200 p-0.5 text-xs">
        <button type="button" onClick={() => setMode('upload')} className={`flex items-center gap-1 rounded-md px-2 py-1 ${mode === 'upload' ? 'bg-brand-600 text-white' : 'text-gray-600'}`}><Upload className="h-3.5 w-3.5" /> Importer</button>
        <button type="button" onClick={() => setMode('url')} className={`flex items-center gap-1 rounded-md px-2 py-1 ${mode === 'url' ? 'bg-brand-600 text-white' : 'text-gray-600'}`}><Link2 className="h-3.5 w-3.5" /> Lien</button>
      </div>
      {mode === 'upload' ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-ghost w-full text-sm" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</> : <><Upload className="h-4 w-4" /> Choisir une image</>}
          </button>
        </>
      ) : (
        <input className="input" placeholder="https://…" value={value?.startsWith('data:') ? '' : value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export function ColorGrid({ value, onChange }: { value?: string; onChange: (c: string) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-9">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          className={`h-9 w-9 rounded-md ring-offset-1 transition sm:h-6 sm:w-6 ${value === c ? 'ring-2 ring-brand-600' : 'ring-1 ring-black/10'}`}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

export function AlignPicker({ value, onChange }: { value?: Align; onChange: (a: Align) => void }) {
  const opts: { v: Align; Icon: any }[] = [
    { v: 'left', Icon: AlignLeft },
    { v: 'center', Icon: AlignCenter },
    { v: 'right', Icon: AlignRight },
  ];
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
      {opts.map(({ v, Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`grid h-11 w-11 place-items-center rounded-md sm:h-8 sm:w-8 ${value === v ? 'bg-brand-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      {children}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  );
}
