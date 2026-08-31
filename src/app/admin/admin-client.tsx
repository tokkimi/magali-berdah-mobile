'use client';

import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { ArrowLeft, BarChart3, CheckCircle, Clock, Download, ExternalLink, FileText, LayoutDashboard, MessageSquare, Pencil, Save, Search, Send, ShieldCheck, Trash2, Users, WalletCards } from 'lucide-react';

type AdminStats = {
  organizations: number;
  users: number;
  active: number;
  pending: number;
  trials: number;
  validatedRevenue: number;
  pendingRevenue: number;
  contactMessages: number;
};

type AdminOrg = {
  id: string;
  name: string;
  planStatus: string;
  plan?: string;
  amountEur?: number;
  paymentMethod?: string;
  phone?: string;
  city?: string;
  renewsAt?: string | null;
  createdAt: string;
  trialEndsAt: string | null;
  paidAt: string | null;
  published: boolean;
  siteUrl: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  ownerEmailVerified: string | null;
  ownerIsSuperAdmin: boolean;
  adminNote: string;
  manual: {
    reference?: string;
    amountEur?: number;
    status?: string;
    requestedAt?: string;
    validatedAt?: string;
    bankReference?: string;
    proofSubmittedAt?: string;
    proofNote?: string;
    proofFile?: { name: string; type: string; dataUrl: string } | null;
  };
  thread: ThreadMsg[];
  unreadFromOrg: number;
};

type ThreadMsg = { id: string; fromAdmin: boolean; authorName: string; body: string; createdAt: string };

type EditState = {
  name: string;
  ownerName: string;
  ownerEmail: string;
  planStatus: string;
  trialEndsAt: string;
  published: boolean;
  ownerIsSuperAdmin: boolean;
  adminNote: string;
};

type UserSortKey = 'name' | 'ownerName' | 'ownerEmail' | 'phone' | 'city' | 'planStatus' | 'plan' | 'createdAt';

type Bar = { label: string; value: number };
type Analytics = { total: number; last30: number; byDay: Bar[]; byHour: Bar[]; byWeekday: Bar[]; referrers: Bar[]; topOrgs: Bar[]; topPages: Bar[] };

export function AdminClient({ organizations, stats, analytics }: { organizations: AdminOrg[]; stats: AdminStats; analytics: Analytics }) {
  const [items, setItems] = useState(organizations);
  const [tab, setTab] = useState<'overview' | 'users' | 'pending' | 'active' | 'messages' | 'analytics' | 'seo' | 'accounting'>('overview');
  const [busy, setBusy] = useState('');
  const [references, setReferences] = useState<Record<string, string>>({});
  const [edits, setEdits] = useState<Record<string, EditState>>(() => Object.fromEntries(organizations.map((org) => [org.id, toEdit(org)])));
  const [openUser, setOpenUser] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [sortKey, setSortKey] = useState<UserSortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  function sortBy(key: UserSortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir(key === 'createdAt' ? 'desc' : 'asc'); }
  }

  const pending = useMemo(() => items.filter((org) => org.planStatus !== 'ACTIVE'), [items]);
  const active = useMemo(() => items.filter((org) => org.planStatus === 'ACTIVE'), [items]);
  const usersFiltered = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    let list = [...items];
    if (q) list = list.filter((org) => [org.name, org.ownerName, org.ownerEmail, org.phone, org.city].some((v) => (v || '').toLowerCase().includes(q)));
    list.sort((a, b) => {
      let cmp: number;
      if (sortKey === 'createdAt') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else cmp = String((a as any)[sortKey] || '').toLowerCase().localeCompare(String((b as any)[sortKey] || '').toLowerCase(), 'fr');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [items, userQuery, sortKey, sortDir]);
  const openUserOrg = openUser ? items.find((org) => org.id === openUser) : null;

  async function activate(org: AdminOrg) {
    setBusy(`activate:${org.id}`);
    const res = await fetch(`/api/admin/organizations/${org.id}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: references[org.id] || org.manual.reference || '' }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Validation impossible pour le moment.');
    updateLocal(org.id, { planStatus: 'ACTIVE', paidAt: new Date().toISOString(), published: true, manual: { ...org.manual, status: 'VALIDATED', validatedAt: new Date().toISOString(), bankReference: references[org.id] || org.manual.bankReference || org.manual.reference || '' } });
  }

  async function save(org: AdminOrg) {
    setBusy(`save:${org.id}`);
    const edit = edits[org.id] || toEdit(org);
    const res = await fetch(`/api/admin/organizations/${org.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(edit),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Enregistrement impossible.');
    updateLocal(org.id, data.organization);
  }

  async function sendMessage(org: AdminOrg, body: string) {
    setBusy(`msg:${org.id}`);
    const res = await fetch(`/api/admin/organizations/${org.id}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) { alert(data.error || 'Envoi impossible.'); return false; }
    if (data.message) updateLocal(org.id, { thread: [...org.thread, data.message] });
    return true;
  }

  async function markThreadRead(org: AdminOrg) {
    if (!org.unreadFromOrg) return;
    updateLocal(org.id, { unreadFromOrg: 0 });
    await fetch(`/api/admin/organizations/${org.id}/message`, { method: 'PATCH' }).catch(() => {});
  }

  async function remove(org: AdminOrg) {
    const ok = confirm(`Supprimer définitivement "${org.name}" ?\n\nCela supprime l'association, son site, ses dons, sa compta et l'utilisateur propriétaire s'il n'a aucun autre espace.`);
    if (!ok) return;
    setBusy(`delete:${org.id}`);
    const res = await fetch(`/api/admin/organizations/${org.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return alert(data.error || 'Suppression impossible.');
    setItems((current) => current.filter((item) => item.id !== org.id));
  }

  function updateLocal(id: string, patch: Partial<AdminOrg>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setEdits((current) => {
      const source = items.find((item) => item.id === id) || organizations.find((item) => item.id === id);
      return source ? { ...current, [id]: toEdit({ ...source, ...patch }) } : current;
    });
  }

  function patchEdit(id: string, patch: Partial<EditState>) {
    const source = items.find((item) => item.id === id);
    if (!source) return;
    setEdits((current) => ({ ...current, [id]: { ...(current[id] || toEdit(source)), ...patch } }));
  }

  const exportRows = [
    ['Date', 'Association', 'Responsable', 'Email', 'Statut', 'Formule', 'Paiement', 'Montant', 'Référence demandée', 'Référence bancaire'],
    ...items.map((org) => [
      org.paidAt || org.manual.validatedAt || org.manual.requestedAt || org.createdAt,
      org.name,
      org.ownerName,
      org.ownerEmail,
      org.planStatus,
      planLabel(org),
      methodLabel(org.paymentMethod),
      `${orgAmount(org)} €`,
      org.manual.reference || '',
      org.manual.bankReference || '',
    ]),
  ];
  const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(exportRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n'))}`;

  const unreadMessages = items.reduce((sum, org) => sum + (org.unreadFromOrg || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-700"><ShieldCheck className="h-4 w-4" /> Admin EasyAsso</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Tableau de bord</h1>
        </div>

        <nav className="mb-8 flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100">
          <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={<LayoutDashboard className="h-4 w-4" />} label="Tableau de bord" />
          <TabButton active={tab === 'users'} onClick={() => { setTab('users'); setOpenUser(null); }} icon={<Users className="h-4 w-4" />} label="Inscrits" badge={items.length} />
          <TabButton active={tab === 'pending'} onClick={() => setTab('pending')} icon={<Clock className="h-4 w-4" />} label="Paiements à vérifier" badge={pending.length} />
          <TabButton active={tab === 'active'} onClick={() => setTab('active')} icon={<Users className="h-4 w-4" />} label="Associations" badge={active.length} />
          <TabButton active={tab === 'messages'} onClick={() => setTab('messages')} icon={<MessageSquare className="h-4 w-4" />} label="Messagerie" badge={unreadMessages} />
          <TabButton active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={<BarChart3 className="h-4 w-4" />} label="Statistiques" />
          <TabButton active={tab === 'seo'} onClick={() => setTab('seo')} icon={<Search className="h-4 w-4" />} label="SEO" />
          <TabButton active={tab === 'accounting'} onClick={() => setTab('accounting')} icon={<WalletCards className="h-4 w-4" />} label="Comptabilité" />
        </nav>

        {tab === 'overview' && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Users className="h-5 w-5" />} label="Associations" value={items.length} hint={`${active.length} actives · ${pending.length} à traiter`} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Utilisateurs" value={stats.users} hint={`${stats.trials} essais enregistrés`} />
            <StatCard icon={<WalletCards className="h-5 w-5" />} label="CA validé" value={formatEuros(stats.validatedRevenue)} hint="Paiements EasyAsso confirmés (carte + virement)" />
            <StatCard icon={<WalletCards className="h-5 w-5" />} label="À encaisser" value={formatEuros(stats.pendingRevenue)} hint="Virements et paiements en attente" />
            <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Réponses non lues" value={unreadMessages} hint="Messages d’associations à lire" />
            <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Messages visiteurs" value={stats.contactMessages} hint="Reçus sur les sites publiés" />
          </section>
        )}

        {tab === 'users' && !openUserOrg && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Inscrits</h2>
                <p className="text-sm text-gray-600">Tous les comptes créés. Cliquez sur une ligne pour ouvrir la fiche complète (voir, modifier, supprimer).</p>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Rechercher un nom, une asso, un email…" className="input w-72 max-w-full pl-9" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-3xl bg-white p-2 shadow-sm ring-1 ring-gray-100">
              <table className="min-w-[1040px] w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <SortTh label="Association" k="name" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Responsable" k="ownerName" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Email" k="ownerEmail" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Téléphone" k="phone" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Ville" k="city" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Statut" k="planStatus" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Formule" k="plan" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <SortTh label="Inscrit le" k="createdAt" sortKey={sortKey} sortDir={sortDir} onSort={sortBy} />
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersFiltered.map((org) => (
                    <tr key={org.id} onClick={() => setOpenUser(org.id)} className="cursor-pointer transition hover:bg-gray-50">
                      <td className="px-3 py-3 font-semibold text-gray-900">
                        <span className="flex items-center gap-2">
                          {org.name}
                          {org.ownerIsSuperAdmin && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">ADMIN</span>}
                          {org.unreadFromOrg > 0 && <span className="h-2 w-2 rounded-full bg-brand-600" title="Message non lu" />}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{org.ownerName || '—'}</td>
                      <td className="px-3 py-3 text-gray-600">{org.ownerEmail || '—'}</td>
                      <td className="px-3 py-3 text-gray-600">{org.phone || '—'}</td>
                      <td className="px-3 py-3 text-gray-600">{org.city || '—'}</td>
                      <td className="px-3 py-3"><StatusBadge org={org} /></td>
                      <td className="px-3 py-3 text-gray-600">{planLabel(org)}</td>
                      <td className="px-3 py-3 text-gray-600">{formatDate(org.createdAt)}</td>
                      <td className="px-3 py-3 text-right text-gray-400"><ExternalLink className="ml-auto h-4 w-4" /></td>
                    </tr>
                  ))}
                  {usersFiltered.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-400">Aucun inscrit ne correspond à votre recherche.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">{items.length} compte(s) au total · {active.length} actif(s) · {pending.length} en attente.</p>
          </section>
        )}

        {tab === 'users' && openUserOrg && (
          <section className="space-y-4">
            <button onClick={() => setOpenUser(null)} className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Retour à la liste des inscrits</button>
            <OrgCard
              org={openUserOrg}
              edit={edits[openUserOrg.id] || toEdit(openUserOrg)}
              busy={busy}
              reference={references[openUserOrg.id] || ''}
              onReference={(value) => setReferences((current) => ({ ...current, [openUserOrg.id]: value }))}
              onEdit={(patch) => patchEdit(openUserOrg.id, patch)}
              onSave={() => save(openUserOrg)}
              onActivate={() => activate(openUserOrg)}
              onRemove={() => { remove(openUserOrg); setOpenUser(null); }}
              onMessage={sendMessage}
              onMarkRead={markThreadRead}
            />
          </section>
        )}

        {tab === 'pending' && (
          <OrgList title="Paiements à vérifier" empty="Aucun paiement en attente." items={pending} busy={busy} edits={edits} references={references} onReference={setReferences} onEdit={patchEdit} onSave={save} onActivate={activate} onRemove={remove} onMessage={sendMessage} onMarkRead={markThreadRead} />
        )}

        {tab === 'active' && (
          <OrgList title="Associations actives" empty="Aucune association active." items={active} busy={busy} edits={edits} references={references} onReference={setReferences} onEdit={patchEdit} onSave={save} onActivate={activate} onRemove={remove} onMessage={sendMessage} onMarkRead={markThreadRead} />
        )}

        {tab === 'messages' && (
          <MessengerView items={items} busy={busy} onMessage={sendMessage} onMarkRead={markThreadRead} />
        )}

        {tab === 'analytics' && (
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Visites (total)" value={analytics.total} hint="Toutes les pages vues, depuis le début" />
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Visites (30 j)" value={analytics.last30} hint="Sur les 30 derniers jours" />
              <StatCard icon={<Users className="h-5 w-5" />} label="Sites suivis" value={analytics.topOrgs.length} hint="Associations avec du trafic" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartCard title="Visites par jour (14 derniers jours)"><Bars data={analytics.byDay} /></ChartCard>
              <ChartCard title="Visites par heure (heure de Paris)"><Bars data={analytics.byHour} compact /></ChartCard>
              <ChartCard title="Visites par jour de la semaine"><Bars data={analytics.byWeekday} /></ChartCard>
              <ChartCard title="Provenance des visiteurs"><RankList data={analytics.referrers} empty="Pas encore de données de provenance." /></ChartCard>
              <ChartCard title="Associations les plus visitées"><RankList data={analytics.topOrgs} empty="Aucune visite pour l’instant." /></ChartCard>
              <ChartCard title="Pages les plus vues"><RankList data={analytics.topPages} empty="Aucune page vue." /></ChartCard>
            </div>
            <p className="text-xs text-gray-500">Le suivi se déclenche à chaque visite réelle (compatible avec le cache). La provenance apparaît dès que des visiteurs arrivent depuis un autre site, un moteur de recherche ou les réseaux.</p>
          </section>
        )}

        {tab === 'seo' && (
          <section className="space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">SEO — référencement</h2>
              <p className="mt-1 text-sm text-gray-600">État du référencement de chaque site. Chaque site publié génère automatiquement un titre, une description, des balises Open Graph (partage réseaux) et est déclaré dans le sitemap.</p>
            </div>
            <div className="overflow-x-auto rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="py-3 pr-4">Association</th><th className="py-3 pr-4">Publié</th><th className="py-3 pr-4">Nom de domaine</th><th className="py-3 pr-4">Indexable</th><th className="py-3 pr-4">Site</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((org) => (
                    <tr key={org.id}>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{org.name}</td>
                      <td className="py-3 pr-4">{org.published ? <span className="text-green-700">En ligne</span> : <span className="text-amber-700">Hors ligne</span>}</td>
                      <td className="py-3 pr-4 text-gray-600">{org.published ? 'Sous-domaine EasyAsso' : '—'}</td>
                      <td className="py-3 pr-4">{org.published ? <span className="text-green-700">Oui</span> : <span className="text-gray-400">Non</span>}</td>
                      <td className="py-3 pr-4"><a href={org.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700">Ouvrir <ExternalLink className="h-3.5 w-3.5" /></a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === 'accounting' && (
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Comptabilité EasyAsso</h2>
                <p className="text-sm text-gray-600">Une ligne par dossier client : paiement unique, statut et référence bancaire.</p>
              </div>
              <a href={csv} download="easyasso-comptabilite-clients.csv" className="btn btn-ghost"><Download className="h-4 w-4" /> Export comptable</a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="py-3 pr-4">Date</th><th className="py-3 pr-4">Association</th><th className="py-3 pr-4">Responsable</th><th className="py-3 pr-4">Statut</th><th className="py-3 pr-4">Formule</th><th className="py-3 pr-4">Paiement</th><th className="py-3 pr-4">Montant</th><th className="py-3 pr-4">Référence</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((org) => (
                    <tr key={org.id}>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(org.paidAt || org.manual.validatedAt || org.createdAt)}</td>
                      <td className="py-3 pr-4 font-semibold text-gray-900">{org.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{org.ownerName || '—'} · {org.ownerEmail || '—'}</td>
                      <td className="py-3 pr-4"><StatusBadge org={org} /></td>
                      <td className="py-3 pr-4 text-gray-600">{planLabel(org)}</td>
                      <td className="py-3 pr-4 text-gray-600">{methodLabel(org.paymentMethod)}</td>
                      <td className="py-3 pr-4 font-bold text-gray-900">{formatEuros(orgAmount(org))}</td>
                      <td className="py-3 pr-4 text-gray-600">{org.manual.bankReference || org.manual.reference || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SortTh({ label, k, sortKey, sortDir, onSort }: { label: string; k: UserSortKey; sortKey: UserSortKey; sortDir: 'asc' | 'desc'; onSort: (k: UserSortKey) => void }) {
  const active = sortKey === k;
  return (
    <th className="px-3 py-3">
      <button onClick={() => onSort(k)} className={`inline-flex items-center gap-1 uppercase tracking-wide transition hover:text-gray-800 ${active ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}<span className="text-[10px]">{active ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

function TabButton({ active, onClick, icon, label, badge }: { active: boolean; onClick: () => void; icon: ReactNode; label: string; badge?: number }) {
  return (
    <button onClick={onClick} className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon} {label}
      {badge != null && badge > 0 && <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>{badge}</span>}
    </button>
  );
}

function OrgList({ title, empty, items, busy, edits, references, onReference, onEdit, onSave, onActivate, onRemove, onMessage, onMarkRead }: {
  title: string; empty: string; items: AdminOrg[]; busy: string; edits: Record<string, EditState>; references: Record<string, string>;
  onReference: Dispatch<SetStateAction<Record<string, string>>>; onEdit: (id: string, patch: Partial<EditState>) => void; onSave: (org: AdminOrg) => void; onActivate: (org: AdminOrg) => void; onRemove: (org: AdminOrg) => void; onMessage: (org: AdminOrg, body: string) => Promise<boolean>; onMarkRead: (org: AdminOrg) => void;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
      {items.length === 0 && <div className="card text-gray-600">{empty}</div>}
      {items.map((org) => (
        <OrgCard
          key={org.id}
          org={org}
          edit={edits[org.id] || toEdit(org)}
          busy={busy}
          reference={references[org.id] || ''}
          onReference={(value) => onReference((current) => ({ ...current, [org.id]: value }))}
          onEdit={(patch) => onEdit(org.id, patch)}
          onSave={() => onSave(org)}
          onActivate={() => onActivate(org)}
          onRemove={() => onRemove(org)}
          onMessage={onMessage}
          onMarkRead={onMarkRead}
        />
      ))}
    </section>
  );
}

function OrgCard({ org, edit, busy, reference, onReference, onEdit, onSave, onActivate, onRemove, onMessage, onMarkRead }: {
  org: AdminOrg; edit: EditState; busy: string; reference: string; onReference: (value: string) => void; onEdit: (patch: Partial<EditState>) => void; onSave: () => void; onActivate: () => void; onRemove: () => void; onMessage: (org: AdminOrg, body: string) => Promise<boolean>; onMarkRead: (org: AdminOrg) => void;
}) {
  const isActive = org.planStatus === 'ACTIVE';
  const hasProof = Boolean(org.manual?.proofSubmittedAt || org.manual?.proofFile || org.manual?.proofNote);
  const [msgBody, setMsgBody] = useState('');
  const sendingMessage = busy === `msg:${org.id}`;
  async function submitMessage() {
    if (!msgBody.trim()) return;
    const ok = await onMessage(org, msgBody.trim());
    if (ok) setMsgBody('');
  }
  return (
    <article className="card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-extrabold text-gray-900">{org.name}</h3>
            <StatusBadge org={org} />
            {org.ownerIsSuperAdmin && <span className="badge bg-purple-100 text-purple-700">Super admin</span>}
          </div>
          <p className="mt-1 text-sm text-gray-600">{org.ownerName || 'Utilisateur'} · {org.ownerEmail}{org.phone ? ` · ${org.phone}` : ''}{org.city ? ` · ${org.city}` : ''}</p>
          <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
            <a href={org.siteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700">Voir le site <ExternalLink className="h-3.5 w-3.5" /></a>
            <span className={org.published ? 'text-green-700' : 'text-amber-700'}>{org.published ? 'Site en ligne' : 'Site hors ligne'}</span>
            <span className={org.ownerEmailVerified ? 'text-green-700' : 'text-amber-700'}>{org.ownerEmailVerified ? 'Email vérifié' : 'Email non vérifié'}</span>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Créé le {formatDate(org.createdAt)}</p>
          {org.paidAt && <p>Payé le {formatDate(org.paidAt)}</p>}
          {org.trialEndsAt && <p>Essai jusqu’au {formatDate(org.trialEndsAt)}</p>}
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <Info label="Formule" value={planLabel(org)} />
        <Info label="Moyen de paiement" value={methodLabel(org.paymentMethod)} />
        <Info label="Montant" value={formatEuros(orgAmount(org))} />
        <Info label="Statut" value={org.manual?.status || org.planStatus} />
        <Info label="Référence demandée" value={org.manual?.reference || '—'} />
        <Info label="Référence reçue" value={org.manual?.bankReference || '—'} />
        {org.renewsAt && <Info label="Renouvellement" value={formatDate(org.renewsAt)} />}
      </div>

      {hasProof && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">Preuve de virement</p>
          {org.manual.proofSubmittedAt && <p className="mt-1 text-xs text-gray-500">Envoyée le {formatDate(org.manual.proofSubmittedAt)}</p>}
          {org.manual.proofNote && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{org.manual.proofNote}</p>}
          {org.manual.proofFile?.dataUrl && <a href={org.manual.proofFile.dataUrl} download={org.manual.proofFile.name} className="btn btn-ghost mt-3"><FileText className="h-4 w-4" /> Télécharger la preuve</a>}
        </div>
      )}

      <details className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <summary className="flex cursor-pointer items-center gap-2 font-bold text-gray-900"><Pencil className="h-4 w-4" /> Modifier / gérer ce dossier</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Field label="Nom association"><input className="input" value={edit.name} onChange={(event) => onEdit({ name: event.target.value })} /></Field>
          <Field label="Statut"><select className="input" value={edit.planStatus} onChange={(event) => onEdit({ planStatus: event.target.value })}><option value="TRIAL">Essai gratuit</option><option value="PENDING_PAYMENT">Paiement en attente</option><option value="ACTIVE">Actif payé</option><option value="SUSPENDED">Suspendu</option><option value="CANCELLED">Annulé</option></select></Field>
          <Field label="Nom responsable"><input className="input" value={edit.ownerName} onChange={(event) => onEdit({ ownerName: event.target.value })} /></Field>
          <Field label="Email responsable"><input className="input" value={edit.ownerEmail} onChange={(event) => onEdit({ ownerEmail: event.target.value })} /></Field>
          <Field label="Fin essai"><input type="date" className="input" value={edit.trialEndsAt} onChange={(event) => onEdit({ trialEndsAt: event.target.value })} /></Field>
          <div className="grid gap-3 rounded-xl bg-gray-50 p-4">
            <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={edit.published} onChange={(event) => onEdit({ published: event.target.checked })} /> Site en ligne</label>
            <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={edit.ownerIsSuperAdmin} onChange={(event) => onEdit({ ownerIsSuperAdmin: event.target.checked })} /> Responsable super-admin EasyAsso</label>
          </div>
          <div className="lg:col-span-2"><Field label="Note administrative privée"><textarea className="input min-h-[90px]" value={edit.adminNote} onChange={(event) => onEdit({ adminNote: event.target.value })} placeholder="Ex : virement attendu, relance faite, infos client…" /></Field></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={onSave} disabled={busy === `save:${org.id}`} className="btn btn-primary"><Save className="h-4 w-4" /> {busy === `save:${org.id}` ? 'Enregistrement…' : 'Enregistrer'}</button>
          <button onClick={onRemove} disabled={busy === `delete:${org.id}`} className="btn btn-ghost text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> {busy === `delete:${org.id}` ? 'Suppression…' : 'Supprimer utilisateur/site'}</button>
        </div>
      </details>

      <details className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) onMarkRead(org); }}>
        <summary className="flex cursor-pointer items-center gap-2 font-bold text-gray-900">
          <MessageSquare className="h-4 w-4" /> Messagerie avec l’association
          {org.unreadFromOrg > 0 && <span className="badge bg-red-100 text-red-700">{org.unreadFromOrg} nouveau{org.unreadFromOrg > 1 ? 'x' : ''}</span>}
        </summary>
        <p className="mt-2 text-xs text-gray-600">Conversation à double sens. L’association vous voit sous le nom <strong>Easy Asso Manager</strong> et ses réponses reviennent ici.</p>
        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl bg-white p-3 ring-1 ring-gray-100">
          {org.thread.length === 0 && <p className="py-6 text-center text-sm text-gray-400">Aucun message pour l’instant.</p>}
          {org.thread.map((m) => (
            <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.fromAdmin ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[11px] ${m.fromAdmin ? 'text-white/70' : 'text-gray-500'}`}>{m.authorName} · {formatDate(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-end gap-2">
          <textarea className="input min-h-[70px] flex-1" value={msgBody} onChange={(event) => setMsgBody(event.target.value)} placeholder="Votre message à l’association…" />
          <button onClick={submitMessage} disabled={sendingMessage || !msgBody.trim()} className="btn btn-primary disabled:opacity-50"><Send className="h-4 w-4" /> {sendingMessage ? 'Envoi…' : 'Envoyer'}</button>
        </div>
      </details>

      {!isActive && (
        <div className="mt-4 grid gap-3 rounded-xl border border-green-100 bg-green-50 p-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="label">Référence bancaire réellement reçue</label>
            <input className="input" value={reference} onChange={(event) => onReference(event.target.value)} placeholder={org.manual?.reference || 'Référence du relevé bancaire'} />
          </div>
          <button onClick={onActivate} disabled={busy === `activate:${org.id}`} className="btn btn-primary"><CheckCircle className="h-4 w-4" /> {busy === `activate:${org.id}` ? 'Validation…' : 'Valider le virement reçu'}</button>
        </div>
      )}
    </article>
  );
}

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: ReactNode; hint: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2 text-brand-700">{icon}</div>
      <p className="text-sm font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{hint}</p>
    </div>
  );
}

function StatusBadge({ org }: { org: AdminOrg }) {
  const hasProof = Boolean(org.manual?.proofSubmittedAt || org.manual?.proofFile || org.manual?.proofNote);
  const cls = org.planStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : hasProof ? 'bg-amber-100 text-amber-800' : org.planStatus === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
  const label = org.planStatus === 'ACTIVE' ? 'Actif' : hasProof ? 'Preuve envoyée' : org.planStatus === 'TRIAL' ? 'Essai' : org.planStatus === 'PENDING_PAYMENT' ? 'Paiement en attente' : org.planStatus;
  return <span className={`badge ${cls}`}>{label}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-1 break-all font-semibold text-gray-900">{value}</p></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function toEdit(org: AdminOrg): EditState {
  return {
    name: org.name || '',
    ownerName: org.ownerName || '',
    ownerEmail: org.ownerEmail || '',
    planStatus: org.planStatus || 'PENDING_PAYMENT',
    trialEndsAt: org.trialEndsAt ? org.trialEndsAt.slice(0, 10) : '',
    published: org.published,
    ownerIsSuperAdmin: org.ownerIsSuperAdmin,
    adminNote: org.adminNote || '',
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatEuros(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function orgAmount(org: AdminOrg) {
  return org.amountEur ?? org.manual?.amountEur ?? 250;
}
function planLabel(org: AdminOrg) {
  return org.plan === 'monthly' ? 'Mensuel · /mois' : org.plan === 'annual' ? 'Annuel · /an' : 'À vie';
}
function methodLabel(method?: string) {
  return method === 'card' ? 'Carte' : method === 'transfer' ? 'Virement' : '—';
}

function lastAt(org: AdminOrg) {
  const last = org.thread[org.thread.length - 1];
  return last ? new Date(last.createdAt).getTime() : 0;
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function Avatar({ name }: { name: string }) {
  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  return <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">{initial}</div>;
}

// Instagram-style messenger: a conversation list; click one to open its thread.
function MessengerView({ items, busy, onMessage, onMarkRead }: { items: AdminOrg[]; busy: string; onMessage: (org: AdminOrg, body: string) => Promise<boolean>; onMarkRead: (org: AdminOrg) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const open = openId ? items.find((o) => o.id === openId) || null : null;
  const convos = [...items].sort((a, b) => (b.unreadFromOrg - a.unreadFromOrg) || (lastAt(b) - lastAt(a)));

  function openConvo(org: AdminOrg) { setOpenId(org.id); setBody(''); onMarkRead(org); }

  async function submit() {
    if (!open || !body.trim()) return;
    const ok = await onMessage(open, body.trim());
    if (ok) setBody('');
  }

  if (open) {
    const sending = busy === `msg:${open.id}`;
    return (
      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center gap-3 border-b border-gray-100 p-4">
          <button onClick={() => setOpenId(null)} className="grid h-9 w-9 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
          <Avatar name={open.name} />
          <div className="min-w-0">
            <p className="truncate font-extrabold text-gray-900">{open.name}</p>
            <p className="truncate text-xs text-gray-500">{open.ownerEmail}</p>
          </div>
        </div>
        <div className="flex h-[52vh] flex-col gap-2 overflow-y-auto bg-gray-50 p-4">
          {open.thread.length === 0 && <p className="my-auto text-center text-sm text-gray-400">Aucun message. Écrivez le premier.</p>}
          {open.thread.map((m) => (
            <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.fromAdmin ? 'bg-brand-600 text-white' : 'bg-white ring-1 ring-gray-200 text-gray-800'}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[11px] ${m.fromAdmin ? 'text-white/70' : 'text-gray-500'}`}>{relTime(m.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 border-t border-gray-100 p-3">
          <textarea className="input min-h-[52px] flex-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Votre message…" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} />
          <button onClick={submit} disabled={sending || !body.trim()} className="btn btn-primary disabled:opacity-50"><Send className="h-4 w-4" /> {sending ? '…' : 'Envoyer'}</button>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl font-extrabold text-gray-900">Messagerie</h2>
      <p className="mb-4 text-sm text-gray-600">Toutes vos conversations. Les associations vous voient sous le nom <strong>Easy Asso Manager</strong>.</p>
      <div className="divide-y divide-gray-100 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
        {convos.map((org) => {
          const last = org.thread[org.thread.length - 1];
          const preview = last ? `${last.fromAdmin ? 'Vous : ' : ''}${last.body}` : 'Aucun message';
          const unread = org.unreadFromOrg > 0;
          return (
            <button key={org.id} onClick={() => openConvo(org)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50">
              <Avatar name={org.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate ${unread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>{org.name}</span>
                  {last && <span className="shrink-0 text-xs text-gray-400">{relTime(last.createdAt)}</span>}
                </div>
                <p className={`truncate text-sm ${unread ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{preview}</p>
              </div>
              {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <h3 className="mb-4 font-bold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function Bars({ data, compact }: { data: Bar[]; compact?: boolean }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={`flex items-end gap-1 ${compact ? 'h-32' : 'h-40'}`}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t bg-brand-600" style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? 3 : 0 }} title={`${d.label} : ${d.value}`} />
          <span className={`text-gray-500 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function RankList({ data, empty }: { data: Bar[]; empty: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="text-sm text-gray-500">{empty}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={i}>
          <div className="flex items-center justify-between text-sm"><span className="truncate pr-2 font-medium text-gray-700">{d.label}</span><span className="font-bold text-gray-900">{d.value}</span></div>
          <div className="mt-1 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-brand-600" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
