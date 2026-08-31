'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Trash2, X, Pencil, Search, Trophy } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatEuros } from '@/lib/utils';

const empty = { firstName: '', lastName: '', email: '', phone: '', city: '', postalCode: '', type: 'INDIVIDUAL', notes: '' };

export function DonorsClient({ donors, totals, canEdit, canExport }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(empty);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);

  const ranked = [...donors].sort((a: any, b: any) => (totals[b.id]?.total || 0) - (totals[a.id]?.total || 0));
  const filtered = ranked.filter((d: any) => `${d.firstName} ${d.lastName} ${d.email || ''}`.toLowerCase().includes(q.toLowerCase()));

  function startAdd() { setEditing(null); setForm(empty); setOpen(true); }
  function startEdit(d: any) { setEditing(d); setForm({ ...empty, ...d }); setOpen(true); }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const url = editing ? `/api/donors/${editing.id}` : '/api/donors';
    await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false); router.refresh();
  }
  async function remove(id: string) { if (!confirm('Supprimer ce donateur ?')) return; await fetch(`/api/donors/${id}`, { method: 'DELETE' }); router.refresh(); }

  return (
    <div>
      <PageHeader title="Donateurs (CRM)" subtitle="Votre base de contacts et le classement des meilleurs donateurs."
        action={
          <div className="flex gap-2">
            {canExport && <a href="/api/export?type=donors" className="btn btn-ghost"><Download className="h-4 w-4" /> Exporter</a>}
            {canEdit && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter</button>}
          </div>
        } />

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3">
        <Search className="h-4 w-4 text-gray-400" />
        <input className="w-full py-2.5 text-sm outline-none" placeholder="Rechercher un donateur…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {donors.length === 0 ? (
        <EmptyState title="Aucun donateur" text="Ajoutez vos contacts pour suivre leurs dons et éditer des reçus.">
          {canEdit && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un donateur</button>}
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-400">
              <tr><th className="pb-3">#</th><th className="pb-3">Nom</th><th className="pb-3">Contact</th><th className="pb-3 text-right">Total donné</th><th className="pb-3 text-right">Dons</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d: any, i: number) => (
                <tr key={d.id}>
                  <td className="py-3">{i < 3 ? <Trophy className={`h-4 w-4 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : 'text-amber-700'}`} /> : <span className="text-gray-400">{i + 1}</span>}</td>
                  <td className="py-3"><div className="font-medium">{d.firstName} {d.lastName}</div><div className="text-xs text-gray-400">{d.type === 'COMPANY' ? 'Entreprise' : 'Particulier'}{d.city ? ` · ${d.city}` : ''}</div></td>
                  <td className="py-3 text-gray-500">{d.email || d.phone || '—'}</td>
                  <td className="py-3 text-right font-semibold text-green-600">{formatEuros(totals[d.id]?.total || 0)}</td>
                  <td className="py-3 text-right text-gray-500">{totals[d.id]?.count || 0}</td>
                  <td className="py-3 text-right">
                    {canEdit && <div className="flex justify-end gap-2">
                      <button onClick={() => startEdit(d)} className="text-gray-300 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(d.id)} className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={save} className="w-full max-w-lg rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{editing ? 'Modifier' : 'Nouveau'} donateur</h3><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Prénom</label><input required className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div><label className="label">Nom</label><input required className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              <div><label className="label">Email</label><input type="email" className="input" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="label">Téléphone</label><input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="label">Ville</label><input className="input" value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><label className="label">Code postal</label><input className="input" value={form.postalCode || ''} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} /></div>
              <div className="col-span-2"><label className="label">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="INDIVIDUAL">Particulier</option><option value="COMPANY">Entreprise</option></select>
              </div>
              <div className="col-span-2"><label className="label">Notes</label><textarea className="input" value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <button disabled={busy} className="btn btn-primary mt-5 w-full">{busy ? '…' : 'Enregistrer'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
