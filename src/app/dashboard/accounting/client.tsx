'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, Trash2, X, TrendingUp, TrendingDown } from 'lucide-react';
import { PageHeader, Stat, EmptyState } from '@/components/ui';
import { formatEuros, formatDate } from '@/lib/utils';

export function AccountingClient({ transactions, categories, donationsTotal, canEdit, canExport, branded = false }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [form, setForm] = useState<any>({ kind: 'EXPENSE', label: '', amountEuros: '', categoryId: '', date: new Date().toISOString().slice(0, 10) });
  const [cat, setCat] = useState<any>({ name: '', kind: 'EXPENSE' });
  const [busy, setBusy] = useState(false);

  const txIncome = transactions.filter((t: any) => t.kind === 'INCOME').reduce((s: number, t: any) => s + t.amountCents, 0);
  const expense = transactions.filter((t: any) => t.kind === 'EXPENSE').reduce((s: number, t: any) => s + t.amountCents, 0);
  const income = txIncome + (branded ? 0 : donationsTotal);
  const balance = income - expense;

  async function add(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setBusy(false); setOpen(false); setForm({ ...form, label: '', amountEuros: '' }); router.refresh();
  }
  async function addCat(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cat) });
    setCatOpen(false); setCat({ name: '', kind: 'EXPENSE' }); router.refresh();
  }
  async function remove(id: string) { if (!confirm('Supprimer cette opération ?')) return; await fetch(`/api/transactions/${id}`, { method: 'DELETE' }); router.refresh(); }

  return (
    <div>
      <PageHeader title="Comptabilité" subtitle={branded ? 'Recettes, dépenses, catégories et solde de votre activité.' : 'Recettes, dépenses, catégories et solde de votre association.'}
        action={
          <div className="flex gap-2">
            {canExport && <a href="/api/export?type=accounting" className="btn btn-ghost"><Download className="h-4 w-4" /> Export comptable</a>}
            {canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Opération</button>}
          </div>
        } />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label={branded ? 'Recettes' : 'Recettes (dons inclus)'} value={formatEuros(income)} accent="text-green-600" hint={branded ? undefined : `dont ${formatEuros(donationsTotal)} de dons`} />
        <Stat label="Dépenses" value={formatEuros(expense)} accent="text-red-600" />
        <Stat label="Solde" value={formatEuros(balance)} accent={balance >= 0 ? 'text-gray-900' : 'text-red-600'} />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase text-gray-400">Catégories :</span>
        {categories.map((c: any) => (
          <span key={c.id} className="badge" style={{ background: (c.color || '#e5e7eb') + '22', color: c.color || '#374151' }}>{c.name} · {c.kind === 'INCOME' ? 'recette' : 'dépense'}</span>
        ))}
        {canEdit && <button onClick={() => setCatOpen(true)} className="text-xs font-medium text-brand-600">+ ajouter</button>}
      </div>

      {transactions.length === 0 ? (
        <EmptyState title="Aucune opération enregistrée" text={branded ? 'Ajoutez ici les recettes et les dépenses liées à votre activité.' : 'Les dons sont comptés automatiquement dans les recettes. Ajoutez vos autres recettes et dépenses ici.'}>
          {canEdit && <button onClick={() => setOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter une opération</button>}
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-400"><tr><th className="pb-3">Date</th><th className="pb-3">Libellé</th><th className="pb-3">Catégorie</th><th className="pb-3 text-right">Montant</th><th></th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t: any) => (
                <tr key={t.id}>
                  <td className="py-3 text-gray-500">{formatDate(t.date)}</td>
                  <td className="py-3 font-medium">{t.kind === 'INCOME' ? <TrendingUp className="mr-1 inline h-4 w-4 text-green-500" /> : <TrendingDown className="mr-1 inline h-4 w-4 text-red-500" />}{t.label}</td>
                  <td className="py-3 text-gray-500">{t.category?.name || '—'}</td>
                  <td className={`py-3 text-right font-semibold ${t.kind === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{t.kind === 'INCOME' ? '+' : '−'}{formatEuros(t.amountCents)}</td>
                  <td className="py-3 text-right">{canEdit && <button onClick={() => remove(t.id)} className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={add} className="w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Nouvelle opération</h3><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
                <button type="button" onClick={() => setForm({ ...form, kind: 'EXPENSE' })} className={`rounded-md px-4 py-1.5 text-sm ${form.kind === 'EXPENSE' ? 'bg-red-600 text-white' : 'text-gray-600'}`}>Dépense</button>
                <button type="button" onClick={() => setForm({ ...form, kind: 'INCOME' })} className={`rounded-md px-4 py-1.5 text-sm ${form.kind === 'INCOME' ? 'bg-green-600 text-white' : 'text-gray-600'}`}>Recette</button>
              </div>
              <div><label className="label">Libellé</label><input required className="input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Montant (€)</label><input required type="number" step="0.01" className="input" value={form.amountEuros} onChange={(e) => setForm({ ...form, amountEuros: e.target.value })} /></div>
                <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div><label className="label">Catégorie</label>
                <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">Aucune</option>
                  {categories.filter((c: any) => c.kind === form.kind).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <button disabled={busy} className="btn btn-primary mt-5 w-full">{busy ? '…' : 'Enregistrer'}</button>
          </form>
        </div>
      )}

      {catOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setCatOpen(false)}>
          <form onSubmit={addCat} className="w-full max-w-sm rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Nouvelle catégorie</h3><button type="button" onClick={() => setCatOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="label">Nom</label><input required className="input" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} /></div>
              <div><label className="label">Type</label><select className="input" value={cat.kind} onChange={(e) => setCat({ ...cat, kind: e.target.value })}><option value="EXPENSE">Dépense</option><option value="INCOME">Recette</option></select></div>
            </div>
            <button className="btn btn-primary mt-5 w-full">Ajouter</button>
          </form>
        </div>
      )}
    </div>
  );
}
