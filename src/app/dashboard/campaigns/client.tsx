'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatEuros } from '@/lib/utils';

export function CampaignsClient({ campaigns, raised, canEdit }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ name: '', description: '', goalEuros: '', externalUrl: '', status: 'ACTIVE' });
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    await fetch('/api/campaigns', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false); setForm({ name: '', description: '', goalEuros: '', externalUrl: '', status: 'ACTIVE' });
    router.refresh();
  }
  async function remove(id: string) { if (!confirm('Supprimer cette campagne ?')) return; await fetch(`/api/campaigns/${id}`, { method: 'DELETE' }); router.refresh(); }

  return (
    <div>
      <PageHeader title="Campagnes" subtitle="Créez des campagnes de collecte, avec objectif et lien HelloAsso."
        action={canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Nouvelle campagne</button>} />

      {campaigns.length === 0 ? (
        <EmptyState title="Aucune campagne" text="Lancez votre première collecte pour mobiliser vos donateurs.">
          {canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Nouvelle campagne</button>}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c: any) => {
            const got = raised[c.id] || 0;
            const pct = c.goalCents > 0 ? Math.min(100, Math.round((got / c.goalCents) * 100)) : 0;
            return (
              <div key={c.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{c.name}</h3>
                    <span className={`badge mt-1 ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status === 'ACTIVE' ? 'En cours' : c.status === 'CLOSED' ? 'Terminée' : 'Brouillon'}</span>
                  </div>
                  {canEdit && <button onClick={() => remove(c.id)} className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
                {c.description && <p className="mt-2 text-sm text-gray-500">{c.description}</p>}
                {c.goalCents > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm"><span className="font-semibold text-gray-900">{formatEuros(got)}</span><span className="text-gray-400">sur {formatEuros(c.goalCents)}</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1 text-xs text-gray-400">{pct}% de l’objectif</p>
                  </div>
                )}
                {c.externalUrl && <a href={c.externalUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600"><ExternalLink className="h-4 w-4" /> Page de don externe</a>}
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={add} className="w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Nouvelle campagne</h3><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="label">Nom</label><input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><label className="label">Objectif (€)</label><input type="number" className="input" value={form.goalEuros} onChange={(e) => setForm({ ...form, goalEuros: e.target.value })} /></div>
              <div><label className="label">Lien externe (HelloAsso…)</label><input className="input" placeholder="https://helloasso.com/…" value={form.externalUrl} onChange={(e) => setForm({ ...form, externalUrl: e.target.value })} /></div>
            </div>
            <button disabled={busy} className="btn btn-primary mt-5 w-full">{busy ? '…' : 'Créer la campagne'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
