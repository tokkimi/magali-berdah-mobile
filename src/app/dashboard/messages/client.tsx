'use client';
import { useState } from 'react';
import { Archive, ArrowLeft, Mail, Phone, Reply, Send, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/ui';

type Message = { id: string; name: string; email: string; phone?: string; subject?: string; message: string; readAt?: string; createdAt: string };
type PlatformMsg = { id: string; fromAdmin: boolean; authorName: string; body: string; createdAt: string; readByOrg?: string | null };

const EASYASSO = 'easyasso';

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

function Avatar({ name, brand }: { name: string; brand?: boolean }) {
  if (brand) return <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><ShieldCheck className="h-6 w-6" /></div>;
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gray-200 text-lg font-bold text-gray-600">{initial}</div>;
}

export function MessagesClient({ initial, conversation = [], branded = false, organizationName = '' }: { initial: Message[]; conversation?: PlatformMsg[]; branded?: boolean; organizationName?: string }) {
  const [messages, setMessages] = useState(initial);
  const [thread, setThread] = useState(conversation);
  const [open, setOpen] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const easyassoUnread = thread.filter((m) => m.fromAdmin && !m.readByOrg).length;
  const lastThread = thread[thread.length - 1];

  async function contactAction(message: Message, type: 'read' | 'unread' | 'archive') {
    await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: message.id, action: type }) });
    if (type === 'archive') { setMessages((all) => all.filter((m) => m.id !== message.id)); setOpen(null); }
    else {
      const readAt = type === 'read' ? new Date().toISOString() : undefined;
      setMessages((all) => all.map((m) => (m.id === message.id ? { ...m, readAt } : m)));
    }
  }

  function openItem(id: string) {
    setOpen(id);
    setReply('');
    if (id === EASYASSO) {
      if (easyassoUnread) {
        fetch('/api/messages/platform', { method: 'PATCH' }).catch(() => {});
        setThread((t) => t.map((m) => (m.fromAdmin ? { ...m, readByOrg: new Date().toISOString() } : m)));
      }
    } else {
      const m = messages.find((x) => x.id === id);
      if (m && !m.readAt) contactAction(m, 'read');
    }
  }

  async function sendReply() {
    if (!reply.trim()) return;
    setSending(true);
    const res = await fetch('/api/messages/platform', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ body: reply.trim() }) });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) { alert(data.error || 'Envoi impossible.'); return; }
    if (data.message) setThread((t) => [...t, data.message]);
    setReply('');
  }

  // ---- Detail: EasyAsso conversation ----
  if (open === EASYASSO) {
    return (
      <div>
        <PageHeader title="Messagerie" subtitle={branded ? `Messages reçus depuis le site de ${organizationName}.` : 'Vos messages et vos échanges avec l’équipe EasyAsso.'} />
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <button onClick={() => setOpen(null)} className="grid h-9 w-9 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
            <Avatar name="EasyAsso" brand />
            <div><p className="font-extrabold text-gray-900">Équipe EasyAsso</p><p className="text-xs text-gray-500">Support & accompagnement</p></div>
          </div>
          <div className="flex h-[54vh] flex-col gap-2 overflow-y-auto bg-gray-50 p-4">
            {thread.length === 0 && <p className="my-auto text-center text-sm text-gray-400">Aucun message. Écrivez à l’équipe ci-dessous.</p>}
            {thread.map((m) => (
              <div key={m.id} className={`flex ${m.fromAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.fromAdmin ? 'bg-white ring-1 ring-gray-200 text-gray-800' : 'bg-brand-600 text-white'}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                  <p className={`mt-1 text-[11px] ${m.fromAdmin ? 'text-gray-500' : 'text-white/70'}`}>{relTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 border-t border-gray-100 p-3">
            <textarea className="input min-h-[52px] flex-1" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Votre message à l’équipe…" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }} />
            <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn btn-primary disabled:opacity-50"><Send className="h-4 w-4" /> {sending ? '…' : 'Envoyer'}</button>
          </div>
        </section>
      </div>
    );
  }

  // ---- Detail: a visitor message ----
  const openMsg = messages.find((m) => m.id === open);
  if (openMsg) {
    return (
      <div>
        <PageHeader title="Messagerie" subtitle={branded ? `Messages reçus depuis le site de ${organizationName}.` : 'Vos messages et vos échanges avec l’équipe EasyAsso.'} />
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <button onClick={() => setOpen(null)} className="grid h-9 w-9 place-items-center rounded-xl text-gray-600 transition hover:bg-gray-100"><ArrowLeft className="h-5 w-5" /></button>
            <Avatar name={openMsg.name} />
            <div className="min-w-0 flex-1"><p className="truncate font-extrabold text-gray-900">{openMsg.name}</p><p className="truncate text-xs text-gray-500">{openMsg.subject || 'Message depuis le site'}</p></div>
            <button onClick={() => contactAction(openMsg, 'archive')} title="Archiver" className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 transition hover:bg-gray-100"><Archive className="h-4 w-4" /></button>
          </div>
          <div className="space-y-4 p-5">
            <div className="rounded-xl bg-gray-50 p-4 text-sm">
              <a href={`mailto:${openMsg.email}`} className="block font-semibold text-brand-600">{openMsg.email}</a>
              {openMsg.phone && <a href={`tel:${openMsg.phone}`} className="mt-1 flex items-center gap-1 text-gray-600"><Phone className="h-3.5 w-3.5" />{openMsg.phone}</a>}
              <p className="mt-1 text-xs text-gray-400">Reçu {relTime(openMsg.createdAt)}</p>
            </div>
            <p className="whitespace-pre-wrap leading-7 text-gray-700">{openMsg.message}</p>
            <a href={`mailto:${openMsg.email}?subject=${encodeURIComponent(`Re: ${openMsg.subject || 'Votre message'}`)}`} className="btn btn-primary"><Reply className="h-4 w-4" /> Répondre par e-mail</a>
          </div>
        </section>
      </div>
    );
  }

  // ---- Inbox list ----
  const sortedMessages = [...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return (
    <div>
      <PageHeader title="Messagerie" subtitle={branded ? `Messages reçus depuis le site de ${organizationName}.` : 'Vos messages et vos échanges avec l’équipe EasyAsso.'} />
      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
        {/* Platform support conversation is intentionally hidden for branded workspaces. */}
        {!branded && <button onClick={() => openItem(EASYASSO)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50">
          <Avatar name="EasyAsso" brand />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`truncate ${easyassoUnread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>Équipe EasyAsso</span>
              {lastThread && <span className="shrink-0 text-xs text-gray-400">{relTime(lastThread.createdAt)}</span>}
            </div>
            <p className={`truncate text-sm ${easyassoUnread ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{lastThread ? `${lastThread.fromAdmin ? '' : 'Vous : '}${lastThread.body}` : 'Une question ? Écrivez à l’équipe.'}</p>
          </div>
          {easyassoUnread > 0 && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
        </button>}

        {/* Visitor messages */}
        {sortedMessages.map((m) => (
          <button key={m.id} onClick={() => openItem(m.id)} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-gray-50">
            <Avatar name={m.name} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`truncate ${!m.readAt ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-800'}`}>{m.name}</span>
                <span className="shrink-0 text-xs text-gray-400">{relTime(m.createdAt)}</span>
              </div>
              <p className={`truncate text-sm ${!m.readAt ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>{m.subject ? `${m.subject} · ` : ''}{m.message}</p>
            </div>
            {!m.readAt && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-600" />}
          </button>
        ))}

        {sortedMessages.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Aucun message depuis votre site pour l’instant.</p>
        )}
      </div>
    </div>
  );
}
