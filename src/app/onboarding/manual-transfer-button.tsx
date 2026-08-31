'use client';
import { useState } from 'react';
import { Building2, Copy, CheckCircle } from 'lucide-react';

type ManualTransferResponse = {
  ok?: boolean;
  active?: boolean;
  url?: string;
  amountEur?: number;
  reference?: string;
  bank?: { iban?: string; bic?: string; holder?: string; bankName?: string };
  error?: string;
};

export function ManualTransferButton({ price, plan = 'lifetime' }: { price: string; plan?: string }) {
  const [loading, setLoading] = useState(false);
  const [sendingProof, setSendingProof] = useState(false);
  const [details, setDetails] = useState<ManualTransferResponse | null>(null);
  const [error, setError] = useState('');
  const [proofDone, setProofDone] = useState(false);
  const [proofNote, setProofNote] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [copied, setCopied] = useState('');

  async function startTransfer() {
    setLoading(true);
    setError('');
    setCopied('');
    const res = await fetch('/api/checkout/manual-transfer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (data.url) {
      window.location.href = data.url;
      return;
    }
    if (!res.ok) {
      setError(data.error || 'Impossible de préparer le paiement par virement.');
      return;
    }
    setDetails(data);
  }

  async function copy(label: string, value?: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  async function submitProof() {
    setSendingProof(true);
    setError('');
    try {
      const payload: { note: string; file?: { name: string; type: string; dataUrl: string } } = { note: proofNote };
      if (proofFile) {
        if (proofFile.size > 2_000_000) throw new Error('Le fichier est trop lourd. Ajoutez une image ou un PDF de moins de 2 Mo.');
        payload.file = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: proofFile.name, type: proofFile.type || 'application/octet-stream', dataUrl: String(reader.result) });
          reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
          reader.readAsDataURL(proofFile);
        });
      }
      const res = await fetch('/api/checkout/manual-transfer-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Impossible d’enregistrer la preuve.');
      setProofDone(true);
    } catch (exception: any) {
      setError(exception.message);
    } finally {
      setSendingProof(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 text-left">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-brand-50 p-2 text-brand-700"><Building2 className="h-5 w-5" /></div>
        <div>
          <h2 className="font-extrabold text-gray-900">Payer par virement bancaire</h2>
          <p className="mt-1 text-sm text-gray-600">
            Vous virez {price} €, puis EasyAsso valide manuellement {plan === 'annual' ? 'votre abonnement (1 an)' : 'l’accès à vie'} dès réception.
          </p>
        </div>
      </div>

      <button onClick={startTransfer} disabled={loading} className="btn btn-ghost mt-4 w-full">
        {loading ? 'Préparation du RIB…' : 'Afficher le RIB EasyAsso'}
      </button>

      {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {details?.ok && (
        <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
          <p className="flex items-center gap-2 font-bold text-green-700">
            <CheckCircle className="h-4 w-4" /> Demande enregistrée : paiement en attente de validation.
          </p>
          <p className="text-gray-600">Important : mettez exactement cette référence dans le libellé du virement.</p>

          <CopyLine label="Montant" value={`${details.amountEur || price} €`} onCopy={() => copy('Montant', `${details.amountEur || price} €`)} copied={copied === 'Montant'} />
          <CopyLine label="Référence à indiquer" value={details.reference || ''} onCopy={() => copy('Référence', details.reference)} copied={copied === 'Référence'} strong />
          <CopyLine label="Titulaire" value={details.bank?.holder || ''} onCopy={() => copy('Titulaire', details.bank?.holder)} copied={copied === 'Titulaire'} />
          {details.bank?.bankName && <CopyLine label="Banque" value={details.bank.bankName} onCopy={() => copy('Banque', details.bank?.bankName)} copied={copied === 'Banque'} />}
          {details.bank?.iban ? (
            <CopyLine label="IBAN" value={details.bank.iban} onCopy={() => copy('IBAN', details.bank?.iban)} copied={copied === 'IBAN'} mono />
          ) : (
            <p className="rounded-lg bg-amber-50 p-3 text-amber-800">Le RIB EasyAsso n’est pas encore configuré côté serveur. La demande est bien enregistrée, mais il faut ajouter l’IBAN dans les variables Vercel.</p>
          )}
          {details.bank?.bic && <CopyLine label="BIC / SWIFT" value={details.bank.bic} onCopy={() => copy('BIC', details.bank?.bic)} copied={copied === 'BIC'} mono />}

          <p className="text-xs text-gray-500">
            Votre accès sera activé manuellement après réception du virement. Aucun prélèvement automatique n’est créé.
          </p>

          <div className="rounded-xl border border-brand-100 bg-white p-4">
            <h3 className="font-extrabold text-gray-900">J’ai effectué le virement</h3>
            <p className="mt-1 text-xs text-gray-500">Ajoutez une note ou une capture/PDF de preuve. EasyAsso vérifiera ensuite la réception sur le compte bancaire.</p>
            <textarea
              className="input mt-3"
              rows={3}
              value={proofNote}
              onChange={(event) => setProofNote(event.target.value)}
              placeholder="Ex. Virement envoyé aujourd’hui depuis ma banque, référence indiquée dans le libellé."
            />
            <input
              className="input mt-3"
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => setProofFile(event.target.files?.[0] || null)}
            />
            <button onClick={submitProof} disabled={sendingProof || proofDone} className="btn btn-primary mt-3 w-full">
              {proofDone ? 'Preuve envoyée' : sendingProof ? 'Envoi de la preuve…' : 'Envoyer ma preuve de virement'}
            </button>
            {proofDone && <p className="mt-2 text-xs font-medium text-green-700">Preuve enregistrée. Votre accès sera activé après validation manuelle.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyLine({
  label, value, onCopy, copied, mono, strong,
}: {
  label: string; value: string; onCopy: () => void; copied: boolean; mono?: boolean; strong?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-3 ring-1 ring-gray-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className={`min-w-0 flex-1 break-all ${mono ? 'font-mono' : ''} ${strong ? 'font-extrabold text-brand-700' : 'text-gray-900'}`}>{value}</p>
        <button type="button" onClick={onCopy} className="rounded-md p-2 text-gray-500 hover:bg-gray-100" aria-label={`Copier ${label}`}>
          {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
