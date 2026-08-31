'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Files, HandCoins, Users, Megaphone, Calculator, BarChart3,
  Settings, LogOut, ExternalLink, Menu, X, UserCog, Palette, LayoutTemplate, Sparkles, Fingerprint, Mail, ShoppingBag,
} from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, perm: null },
  { href: '/dashboard/generate', label: 'Générateur magique', icon: Sparkles, perm: PERMISSIONS.SITE_EDIT },
  { href: '/dashboard/editor', label: 'Éditeur du site', icon: Palette, perm: PERMISSIONS.SITE_VIEW },
  { href: '/dashboard/messages', label: 'Messagerie', icon: Mail, perm: PERMISSIONS.SITE_VIEW, notification: true },
  { href: '/dashboard/identity', label: 'Identité (logo, couleurs)', icon: Fingerprint, perm: PERMISSIONS.SITE_EDIT },
  { href: '/dashboard/themes', label: 'Modèles de site', icon: LayoutTemplate, perm: PERMISSIONS.SITE_EDIT },
  { href: '/dashboard/shop', label: 'Boutique', icon: ShoppingBag, perm: PERMISSIONS.SITE_VIEW },
  { href: '/dashboard/donations', label: 'Dons', icon: HandCoins, perm: PERMISSIONS.DONATIONS_VIEW },
  { href: '/dashboard/campaigns', label: 'Campagnes', icon: Megaphone, perm: PERMISSIONS.CAMPAIGNS_VIEW },
  { href: '/dashboard/donors', label: 'Donateurs (CRM)', icon: Users, perm: PERMISSIONS.DONORS_VIEW },
  { href: '/dashboard/accounting', label: 'Comptabilité', icon: Calculator, perm: PERMISSIONS.ACCOUNTING_VIEW },
  { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3, perm: PERMISSIONS.STATS_VIEW },
  { href: '/dashboard/team', label: 'Équipe & rôles', icon: UserCog, perm: PERMISSIONS.TEAM_VIEW },
  { href: '/dashboard/settings', label: 'Réglages', icon: Settings, perm: PERMISSIONS.ORG_SETTINGS },
];

export function Sidebar({
  orgName, userName, permissions, siteUrl, published, unreadMessages, branded, brandLogoUrl,
}: {
  orgName: string; userName: string; permissions: string[]; siteUrl: string; published: boolean; unreadMessages: number; branded?: boolean; brandLogoUrl?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const has = (p: string | null) => p === null || permissions.includes(p);

  const content = (
    <div className={`flex h-full flex-col ${branded ? 'bg-[#0b0b10] text-[#f7f7fb]' : 'bg-white'}`}>
      <div className={`border-b px-5 py-4 ${branded ? 'border-white/10' : 'border-gray-100'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandLogoUrl || '/easyasso-logo.png'} alt={branded ? orgName : 'EasyAsso'} className="h-14 w-auto object-contain" />
        <p className={`mt-2 truncate text-sm font-medium ${branded ? 'text-white/85' : 'text-gray-900'}`}>{orgName}</p>
        {branded && <p className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#d33f5c]">Espace artiste</p>}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.filter((n) => has(n.perm) && (!branded || !['/dashboard/generate', '/dashboard/identity', '/dashboard/themes', '/dashboard/donations', '/dashboard/campaigns', '/dashboard/donors'].includes(n.href))).map((n) => {
          const active = n.href === '/dashboard' ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? (branded ? 'bg-[#d33f5c]/20 text-[#ff9aae]' : 'bg-brand-50 text-brand-700')
                  : (branded ? 'text-white/65 hover:bg-white/10 hover:text-white' : 'text-gray-600 hover:bg-gray-100')
              }`}
            >
              <n.icon className="h-5 w-5" /> {n.label}
              {'notification' in n && n.notification && unreadMessages > 0 && <span className="ml-auto grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
            </Link>
          );
        })}
      </nav>

      <div className={`border-t p-3 ${branded ? 'border-white/10' : 'border-gray-100'}`}>
        <a href={siteUrl} target="_blank" rel="noreferrer" className={`btn btn-ghost mb-2 w-full justify-start text-sm ${branded ? 'text-white/80 hover:bg-white/10' : ''}`}>
          <ExternalLink className="h-4 w-4" /> Voir mon site
          <span className={`ml-auto badge ${published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {published ? 'en ligne' : 'brouillon'}
          </span>
        </a>
        <div className="flex items-center justify-between px-2 py-1">
          <span className={`truncate text-xs ${branded ? 'text-white/50' : 'text-gray-500'}`}>{userName}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={branded ? 'text-white/45 hover:text-[#ff9aae]' : 'text-gray-400 hover:text-red-600'} title="Se déconnecter">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className={`flex items-center justify-between border-b px-4 py-3 lg:hidden ${branded ? 'border-white/10 bg-[#0b0b10]' : 'border-gray-100 bg-white'}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandLogoUrl || '/easyasso-logo.png'} alt={branded ? orgName : 'EasyAsso'} className="h-12 w-auto object-contain" />
        <button onClick={() => setOpen(true)} className="touch-target rounded-lg" aria-label="Ouvrir le menu"><Menu className={`h-6 w-6 ${branded ? 'text-white' : 'text-gray-700'}`} /></button>
      </div>

      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 hidden w-64 border-r lg:block ${branded ? 'border-white/10 bg-[#0b0b10]' : 'border-gray-100 bg-white'}`}>{content}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className={`absolute inset-y-0 left-0 w-72 ${branded ? 'bg-[#0b0b10]' : 'bg-white'}`}>
            <button onClick={() => setOpen(false)} className={`touch-target absolute right-3 top-3 rounded-lg ${branded ? 'text-white/60' : 'text-gray-500'}`} aria-label="Fermer le menu"><X className="h-6 w-6" /></button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
