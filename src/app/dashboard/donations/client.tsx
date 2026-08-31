'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Download, FileText, Trash2, X, Pencil, CheckCircle2, Paperclip } from 'lucide-react';
import { PageHeader, Stat, EmptyState } from '@/components/ui';
import { formatEuros, formatDate } from '@/lib/utils';
import { DonationSettings } from './settings';

const METHODS = ['CASH', 'CHECK', 'TRANSFER', 'STRIPE', 'HELLOASSO', 'OTHER'];
const METHOD_LABELS: Record<string, string> = { CASH: 'Espèces', CHECK: 'Chèque', TRANSFER: 'Virement', STRIPE: 'Stripe', HELLOASSO: 'HelloAsso', OTHER: 'Autre' };
const STATUS_LABELS: Record<string, string> = { PENDING: 'Intention', COMPLETED: 'Reçu', REFUNDED: 'Remboursé', FAILED: 'Échoué' };
const emptyDonation = () => ({ amountEuros: '', donorId: '', campaignId: '', method: 'CASH', status: 'COMPLETED', donatedAt: new Date().toISOString().slice(0, 10), receivedReference: '', message: '', proofDocuments: [] });

export function DonationsClient({ donations, donors, campaigns, profile, canEdit, canReceipt, canExport }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyDonation());
  const [busy, setBusy] = useState(false);

  const completed = donations.filter((d: any) => d.status === 'COMPLETED');
  const pending = donations.filter((d: any) => d.status === 'PENDING');
  const total = completed.reduce((s: number, d: any) => s + d.amountCents, 0);

  function startAdd() {
    setEditing(null);
    setForm(emptyDonation());
    setOpen(true);
  }

  function startEdit(d: any, markReceived = false) {
    setEditing(d);
    setForm({
      amountEuros: (d.amountCents / 100).toFixed(2),
      donorId: d.donorId || '',
      campaignId: d.campaignId || '',
      method: markReceived && d.method === 'OTHER' ? 'TRANSFER' : d.method || 'OTHER',
      status: markReceived ? 'COMPLETED' : d.status || 'PENDING',
      donatedAt: new Date(d.receivedAt || d.donatedAt).toISOString().slice(0, 10),
      receivedReference: d.receivedReference || d.stripePaymentId || '',
      message: d.message || '',
      proofDocuments: Array.isArray(d.proofDocuments) ? d.proofDocuments : [],
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(editing ? `/api/donations/${editing.id}` : '/api/donations', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setBusy(false); setOpen(false);
    setEditing(null);
    setForm(emptyDonation());
    router.refresh();
  }
  async function issueReceipt(id: string) { await fetch(`/api/donations/${id}`, { method: 'PATCH' }); router.refresh(); }
  async function remove(id: string) { if (!confirm('Supprimer ce don ?')) return; await fetch(`/api/donations/${id}`, { method: 'DELETE' }); router.refresh(); }
  async function addProofs(files: FileList | null) {
    if (!files?.length) return;
    const docs = await Promise.all(Array.from(files).slice(0, 4).map((file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ name: file.name, url: String(reader.result), uploadedAt: new Date().toISOString() });
      reader.readAsDataURL(file);
    })));
    setForm((current: any) => ({ ...current, proofDocuments: [...(current.proofDocuments || []), ...docs] }));
  }
  function removeProof(index: number) {
    setForm((current: any) => ({ ...current, proofDocuments: (current.proofDocuments || []).filter((_: any, i: number) => i !== index) }));
  }

  return (
    <div>
      <PageHeader title="Dons" subtitle="Suivez les intentions, rattachez-les aux donateurs puis validez-les quand l’argent est réellement reçu."
        action={
          <div className="flex gap-2">
            {canExport && <a href="/api/export?type=donations" className="btn btn-ghost"><Download className="h-4 w-4" /> Exporter</a>}
            {canEdit && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un don</button>}
          </div>
        } />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Total collecté" value={formatEuros(total)} accent="text-green-600" />
        <Stat label="Dons reçus" value={String(completed.length)} />
        <Stat label="Intentions à traiter" value={String(pending.length)} accent={pending.length ? 'text-orange-600' : 'text-gray-900'} />
        <Stat label="Reçus émis" value={String(donations.filter((d: any) => d.receiptIssued).length)} />
      </div>

      {pending.length > 0 && (
        <div className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-900">
          <strong>{pending.length} intention{pending.length > 1 ? 's' : ''} de don à suivre.</strong> Quand le virement, le chèque ou le paiement arrive sur le compte, cliquez sur “Traiter”, rattachez le bon donateur, ajoutez la référence/justificatif, puis passez le statut en “Reçu”.
        </div>
      )}

      <DonationSettings initial={profile} canEdit={canEdit} />

      {donations.length === 0 ? (
        <EmptyState title="Aucun don pour le moment" text="Les dons initiés depuis votre site et les dons ajoutés manuellement apparaîtront ici.">
          {canEdit && <button onClick={startAdd} className="btn btn-primary"><Plus className="h-4 w-4" /> Ajouter un don</button>}
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-400">
              <tr><th className="pb-3">Date</th><th className="pb-3">Donateur</th><th className="pb-3">Campagne</th><th className="pb-3">Méthode</th><th className="pb-3">Statut</th><th className="pb-3">Référence</th><th className="pb-3 text-right">Montant</th><th className="pb-3">Reçu</th><th></th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {donations.map((d: any) => (
                <tr key={d.id}>
                  <td className="py-3 text-gray-500">{formatDate(d.receivedAt || d.donatedAt)}</td>
                  <td className="py-3 font-medium">{d.donor ? `${d.donor.firstName} ${d.donor.lastName}` : 'Anonyme'}</td>
                  <td className="py-3 text-gray-500">{d.campaign?.name || '—'}</td>
                  <td className="py-3 text-gray-500">{METHOD_LABELS[d.method] || d.method}</td>
                  <td className="py-3"><span className={`badge ${d.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : d.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[d.status] || d.status}</span></td>
                  <td className="max-w-[180px] truncate py-3 text-xs text-gray-500">{d.receivedReference || (Array.isArray(d.proofDocuments) && d.proofDocuments.length ? `${d.proofDocuments.length} justificatif(s)` : '—')}</td>
                  <td className={`py-3 text-right font-semibold ${d.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-500'}`}>{formatEuros(d.amountCents)}</td>
                  <td className="py-3">
                    {d.receiptIssued ? <span className="badge bg-green-100 text-green-700">{d.receiptNumber}</span>
                      : canReceipt && d.status === 'COMPLETED' ? <button onClick={() => issueReceipt(d.id)} className="flex items-center gap-1 text-xs text-brand-600 hover:underline"><FileText className="h-3 w-3" /> Émettre</button>
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="py-3 text-right">{canEdit && <div className="flex justify-end gap-2">
                    {d.status === 'PENDING' && <button onClick={() => startEdit(d, true)} className="text-green-600 hover:text-green-700" title="Traiter l’intention"><CheckCircle2 className="h-4 w-4" /></button>}
                    <button onClick={() => startEdit(d)} className="text-gray-400 hover:text-brand-600" title="Modifier"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(d.id)} className="text-gray-300 hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                  </div>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{editing ? (form.status === 'COMPLETED' ? 'Valider / modifier le don' : 'Modifier l’intention de don') : 'Nouveau don'}</h3><button type="button" onClick={() => setOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><label className="label">Montant (€)</label><input type="number" step="0.01" required className="input" value={form.amountEuros} onChange={(e) => setForm({ ...form, amountEuros: e.target.value })} /></div>
                <div><label className="label">Statut</label><select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="PENDING">Intention / à traiter</option><option value="COMPLETED">Reçu sur le compte</option><option value="FAILED">Échoué</option><option value="REFUNDED">Remboursé</option></select></div>
              </div>
              <div><label className="label">Donateur</label>
                <select className="input" value={form.donorId} onChange={(e) => setForm({ ...form, donorId: e.target.value })}>
                  <option value="">Anonyme</option>
                  {donors.map((d: any) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                </select>
              </div>
              <div><label className="label">Campagne</label>
                <select className="input" value={form.campaignId} onChange={(e) => setForm({ ...form, campaignId: e.target.value })}>
                  <option value="">Aucune</option>
                  {campaigns.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Méthode</label>
                  <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </div>
                <div><label className="label">{form.status === 'COMPLETED' ? 'Date de réception' : 'Date de l’intention'}</label><input type="date" className="input" value={form.donatedAt} onChange={(e) => setForm({ ...form, donatedAt: e.target.value })} /></div>
              </div>
              <div><label className="label">Référence comptable / banque</label><input className="input" value={form.receivedReference || ''} onChange={(e) => setForm({ ...form, receivedReference: e.target.value })} placeholder="Ex. Virement 17/08, n° chèque, ID Stripe, libellé bancaire…" /></div>
              <div><label className="label">Note interne</label><textarea className="input" value={form.message || ''} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Ex. Intention reçue via le site, relance envoyée, reçu bancaire vérifié…" /></div>
              <div className="rounded-xl border border-gray-200 p-4">
                <label className="label flex items-center gap-2"><Paperclip className="h-4 w-4" /> Justificatifs</label>
                <input className="input" type="file" accept="image/*,.pdf" multiple onChange={(e) => addProofs(e.target.files)} />
                <p className="mt-1 text-xs text-gray-400">Ajoutez une capture bancaire, un PDF, un bordereau de chèque, etc. Ils restent attachés au don.</p>
                {(form.proofDocuments || []).length > 0 && <div className="mt-3 space-y-2">{form.proofDocuments.map((proof: any, index: number) => <div key={`${proof.name}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"><a className="truncate text-brand-600 hover:underline" href={proof.url} target="_blank">{proof.name}</a><button type="button" onClick={() => removeProof(index)} className="text-red-500">retirer</button></div>)}</div>}
              </div>
            </div>
            <button disabled={busy} className="btn btn-primary mt-5 w-full">{busy ? '…' : form.status === 'COMPLETED' ? 'Enregistrer comme don reçu' : 'Enregistrer l’intention'}</button>
          </form>
        </div>
      )}
    </div>
  );
}
