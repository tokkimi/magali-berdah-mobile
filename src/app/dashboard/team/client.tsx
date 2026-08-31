'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, X, Mail, Shield, UserCog } from 'lucide-react';
import { PageHeader } from '@/components/ui';

const SYSTEM_ROLES = ['OWNER', 'ADMIN', 'EDITOR', 'ACCOUNTANT', 'MEMBER', 'VIEWER'];

export function TeamClient({ members, roles, invitations, groups, roleLabels, canManageTeam, canManageRoles, currentUserId }: any) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: '', systemRole: 'MEMBER' });
  const [inviteMsg, setInviteMsg] = useState('');
  const [roleOpen, setRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [roleForm, setRoleForm] = useState<{ name: string; permissions: string[] }>({ name: '', permissions: [] });

  async function doInvite(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(invite) });
    const data = await res.json();
    if (!res.ok) return setInviteMsg(data.error || 'Erreur');
    setInviteMsg(data.added ? 'Membre ajouté ✓' : 'Invitation créée ✓');
    setInvite({ email: '', systemRole: 'MEMBER' });
    router.refresh();
    setTimeout(() => { setInviteOpen(false); setInviteMsg(''); }, 1200);
  }
  async function changeRole(membershipId: string, systemRole: string) {
    await fetch('/api/team', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ membershipId, systemRole }) });
    router.refresh();
  }
  async function removeMember(membershipId: string) {
    if (!confirm('Retirer ce membre ?')) return;
    await fetch('/api/team', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ membershipId }) });
    router.refresh();
  }

  function startRole(r?: any) {
    setEditingRole(r || null);
    setRoleForm(r ? { name: r.name, permissions: r.permissions } : { name: '', permissions: [] });
    setRoleOpen(true);
  }
  function togglePerm(key: string) {
    setRoleForm((f) => ({ ...f, permissions: f.permissions.includes(key) ? f.permissions.filter((p) => p !== key) : [...f.permissions, key] }));
  }
  async function saveRole(e: React.FormEvent) {
    e.preventDefault();
    const url = '/api/roles';
    const body = editingRole ? { id: editingRole.id, ...roleForm } : roleForm;
    await fetch(url, { method: editingRole ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setRoleOpen(false); router.refresh();
  }
  async function deleteRole(id: string) { if (!confirm('Supprimer ce rôle ?')) return; await fetch('/api/roles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); router.refresh(); }

  return (
    <div>
      <PageHeader title="Équipe & rôles" subtitle="Gérez vos bénévoles et leurs permissions, dans le détail."
        action={canManageTeam && <button onClick={() => setInviteOpen(true)} className="btn btn-primary"><Plus className="h-4 w-4" /> Inviter</button>} />

      {/* Members */}
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-900"><UserCog className="h-5 w-5" /> Membres</h2>
        <div className="divide-y divide-gray-100">
          {members.map((m: any) => (
            <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-gray-900">{m.user.name || m.user.email} {m.userId === currentUserId && <span className="text-xs text-gray-400">(vous)</span>}</p>
                <p className="text-sm text-gray-500">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.systemRole === 'OWNER' || !canManageTeam ? (
                  <span className="badge bg-brand-50 text-brand-700">{roleLabels[m.systemRole]}</span>
                ) : (
                  <select value={m.systemRole} onChange={(e) => changeRole(m.id, e.target.value)} className="rounded-lg border border-gray-200 px-2 py-1 text-sm">
                    {SYSTEM_ROLES.filter((r) => r !== 'OWNER').map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                  </select>
                )}
                {canManageTeam && m.systemRole !== 'OWNER' && <button onClick={() => removeMember(m.id)} className="text-gray-300 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            </div>
          ))}
        </div>
        {invitations.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Invitations en attente</p>
            {invitations.map((inv: any) => (
              <div key={inv.id} className="flex items-center gap-2 py-1 text-sm text-gray-500"><Mail className="h-4 w-4" /> {inv.email} — {roleLabels[inv.systemRole]}</div>
            ))}
          </div>
        )}
      </div>

      {/* Roles */}
      <div className="card mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold text-gray-900"><Shield className="h-5 w-5" /> Rôles personnalisés</h2>
          {canManageRoles && <button onClick={() => startRole()} className="btn btn-ghost text-sm"><Plus className="h-4 w-4" /> Nouveau rôle</button>}
        </div>
        {roles.length === 0 ? <p className="text-sm text-gray-500">Aucun rôle personnalisé. Les rôles système suffisent souvent.</p> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {roles.map((r: any) => (
              <div key={r.id} className="rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  {canManageRoles && <div className="flex gap-2"><button onClick={() => startRole(r)} className="text-xs text-brand-600">Modifier</button><button onClick={() => deleteRole(r.id)} className="text-xs text-red-500">Suppr.</button></div>}
                </div>
                <p className="mt-1 text-xs text-gray-400">{r.permissions.length} permission(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setInviteOpen(false)}>
          <form onSubmit={doInvite} className="w-full max-w-md rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">Inviter un membre</h3><button type="button" onClick={() => setInviteOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div className="space-y-3">
              <div><label className="label">Email</label><input type="email" required className="input" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></div>
              <div><label className="label">Rôle</label><select className="input" value={invite.systemRole} onChange={(e) => setInvite({ ...invite, systemRole: e.target.value })}>{SYSTEM_ROLES.filter((r) => r !== 'OWNER').map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}</select></div>
              {inviteMsg && <p className="text-sm text-green-600">{inviteMsg}</p>}
            </div>
            <button className="btn btn-primary mt-5 w-full">Envoyer l’invitation</button>
            <p className="mt-2 text-center text-xs text-gray-400">Si la personne a déjà un compte, elle est ajoutée immédiatement.</p>
          </form>
        </div>
      )}

      {/* Role modal */}
      {roleOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setRoleOpen(false)}>
          <form onSubmit={saveRole} className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="font-bold">{editingRole ? 'Modifier' : 'Nouveau'} rôle</h3><button type="button" onClick={() => setRoleOpen(false)}><X className="h-5 w-5 text-gray-400" /></button></div>
            <div><label className="label">Nom du rôle</label><input required className="input" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} /></div>
            <div className="mt-4 space-y-4">
              {groups.map((g: any) => (
                <div key={g.label}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">{g.label}</p>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {g.items.map((it: any) => (
                      <label key={it.key} className="flex cursor-pointer items-start gap-2 rounded-lg p-1.5 hover:bg-gray-50">
                        <input type="checkbox" checked={roleForm.permissions.includes(it.key)} onChange={() => togglePerm(it.key)} className="mt-0.5" />
                        <span><span className="text-sm text-gray-800">{it.label}</span>{it.help && <span className="block text-xs text-gray-400">{it.help}</span>}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-5 w-full">Enregistrer le rôle</button>
          </form>
        </div>
      )}
    </div>
  );
}
