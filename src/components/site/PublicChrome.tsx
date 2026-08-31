'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Facebook, Linkedin, UserRound } from 'lucide-react';
import type { HeaderConfig, FooterConfig, ButtonConfig } from '@/lib/blocks';
import { NewsletterForm } from './NewsletterForm';
import { LanguageSwitcher, useLanguage } from '@/components/language-provider';

interface NavItem { title: string; slug: string; isHome: boolean }
const SOCIAL_LABELS = new Set(['facebook', 'instagram', 'linkedin', 'youtube', 'youtubemusic', 'spotify', 'deezer', 'soundcloud', 'applemusic', 'amazonmusic', 'beatport', 'bandcamp', 'tidal', 'shotgun', 'tiktok', 'x', 'twitter']);
const socialKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]/g, '');
const isSocialColumn = (column: FooterConfig['columns'][number]) => column.links.length > 0 && column.links.every((link) => SOCIAL_LABELS.has(socialKey(link.label)));
const logoFrameClass = 'inline-flex max-w-[220px] items-center rounded-xl bg-transparent p-0.5 sm:max-w-[280px]';
const headerLogoClass = 'max-h-11 w-auto max-w-full object-contain sm:max-h-12';
const footerLogoClass = 'max-h-16 w-auto max-w-full object-contain';

function SocialMark({ label, monochrome = false }: { label: string; monochrome?: boolean }) {
  const key = socialKey(label);
  const assets: Record<string, string> = {
    instagram: '/integrations/instagram.svg',
    youtube: '/integrations/youtube.svg',
    youtubemusic: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtubemusic.svg',
    spotify: '/integrations/spotify.svg',
    deezer: '/integrations/deezer.svg',
    soundcloud: '/integrations/soundcloud.svg',
    applemusic: '/integrations/applemusic.svg',
    amazonmusic: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonmusic.svg',
    beatport: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/beatport.svg',
    bandcamp: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bandcamp.svg',
    tidal: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tidal.svg',
  };
  const asset = assets[key] || '';
  if (asset) return <img src={asset} alt="" className={`h-[18px] w-[18px] object-contain ${monochrome ? 'brightness-0 invert' : asset.startsWith('http') ? 'rounded bg-white/90 p-0.5' : ''}`} />;
  if (key === 'shotgun') return <img src="https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9e/a0/59/9ea0590d-68e5-d649-ca93-e31becb08410/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/128x128bb.jpg" alt="" className="h-[18px] w-[18px] rounded-[4px] object-contain" />;
  if (key === 'tiktok') return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] fill-current"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 1 1-2-2.76v-3.5a6.34 6.34 0 1 0 5.45 6.26V8.73a8.16 8.16 0 0 0 4.77 1.52V6.8c-.34 0-.67-.04-1-.11Z" /></svg>;
  if (key === 'facebook') return <Facebook className="h-[18px] w-[18px]" />;
  if (key === 'linkedin') return <Linkedin className="h-[18px] w-[18px]" />;
  if (key === 'x' || key === 'twitter') return <span className="text-base font-medium leading-none">𝕏</span>;
  return null;
}

export function PublicHeader({
  header, nav, basePath,
}: { header: HeaderConfig; nav: NavItem[]; basePath: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();
  const cta: ButtonConfig | undefined = header.cta;
  const socials = Object.entries(header.social || {}).filter((entry): entry is [string, string] => Boolean(entry[1]));
  const brandedHeader = header.logoUrl?.includes('/vielusos/') || header.background?.toLowerCase() === '#0b0b10';
  const glassMenu = !brandedHeader && (header.menuGlass ?? true);
  const menuOpacity = Math.max(20, Math.min(100, Number(header.menuOpacity) || 78)) / 100;
  const menuBackground = header.menuBackground || '#111827';
  const hexToRgba = (hex: string, alpha: number) => {
    const value = hex.replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(17,24,39,${alpha})`;
    return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${alpha})`;
  };
  const link = (slug: string, isHome: boolean) => (isHome ? basePath || '/' : `${basePath}/${slug}`);
  const customerHref = basePath === '#' ? '#client' : `${basePath || ''}/client`;
  return (
    <header
      style={{ background: header.background, color: header.textColor }}
      className={`public-header-shell ${header.sticky ? 'sticky top-0 z-40' : ''} border-b border-black/5 backdrop-blur`}
    >
      <div className="relative flex w-full items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-8">
        <Link href={basePath || '/'} className="flex min-w-0 flex-1 basis-0 items-center justify-start text-lg font-extrabold">
          {header.logoUrl ? (
            <span className={logoFrameClass}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={header.logoUrl} alt={header.logoText} className={headerLogoClass} />
            </span>
          ) : (
            <span className="truncate">{header.logoText}</span>
          )}
        </Link>
        <div className={`${brandedHeader ? 'hidden' : 'public-header-desktop'} min-w-0 flex-[2_1_0%] items-center justify-center gap-4`}>
          {header.showNav && (
            <nav className="flex min-w-0 items-center justify-center gap-2 text-center text-sm font-medium lg:gap-4">
              {nav.map((p) => (
                <Link key={p.slug} href={link(p.slug, p.isHome)} className="max-w-[10rem] break-words leading-tight opacity-80 hover:opacity-100">{t(p.title)}</Link>
              ))}
            </nav>
          )}
        </div>
        <div className="flex flex-1 basis-0 items-center justify-end gap-2.5">
          {!brandedHeader && socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name} className="hidden h-7 w-7 shrink-0 items-center justify-center text-current opacity-80 transition hover:opacity-100 lg:inline-flex"><SocialMark label={name} /></a>)}
          <span className="hidden sm:inline-flex"><LanguageSwitcher variant="inline" /></span>
          {header.showCta !== false && cta && (
            <a
              href={cta.href.startsWith('/') ? `${basePath}${cta.href}` : cta.href}
              style={cta.variant === 'solid'
                ? { background: cta.color, color: '#fff' }
                : { border: `2px solid ${cta.color}`, color: cta.color }}
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold sm:inline-flex"
            >
              {cta.text}
            </a>
          )}
          <Link
            href={customerHref}
            title="Connexion ou inscription client"
            aria-label="Connexion ou inscription client"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-current/25 bg-transparent text-current transition hover:border-current/60"
          >
            <UserRound className="h-5 w-5" />
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className={`${brandedHeader ? 'flex' : 'public-header-menu-button'} touch-target shrink-0 items-center justify-center rounded-xl border ${brandedHeader ? 'border-white/20 bg-transparent text-white hover:bg-white/10' : 'border-black/10 bg-white/80'}`} aria-expanded={menuOpen} aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div style={!brandedHeader ? { background: glassMenu ? hexToRgba(menuBackground, menuOpacity) : menuBackground, color: glassMenu ? '#fff' : header.textColor, backdropFilter: glassMenu ? `blur(${Math.max(0, Math.min(36, Number(header.menuBlur) || 20))}px)` : undefined } : undefined} className={`${brandedHeader ? 'right-3 block w-[min(20rem,calc(100vw-1.5rem))]' : 'public-header-dropdown left-3 right-3'} absolute top-[calc(100%+0.5rem)] z-50 rounded-2xl p-3 shadow-2xl ${brandedHeader ? 'border border-white/15 bg-[#0b0b10]/55 text-white shadow-black/60 backdrop-blur-2xl' : glassMenu ? 'border border-white/20 text-white shadow-black/30' : 'ring-1 ring-black/10'}`}>
            {header.showNav && <nav className="flex flex-col">{nav.map((p) => <Link key={p.slug} href={link(p.slug, p.isHome)} onClick={() => setMenuOpen(false)} className={`rounded-xl px-4 py-3 text-base font-semibold ${(brandedHeader || glassMenu) ? 'border-b border-white/10 hover:bg-white/10' : 'hover:bg-black/5'}`}>{t(p.title)}</Link>)}</nav>}
            <div className={`${brandedHeader ? 'grid grid-cols-4 place-items-center gap-3 p-2' : 'mt-3 flex flex-wrap items-center gap-3 px-2 pt-3'} ${(brandedHeader || glassMenu) && header.showNav && nav.length ? 'border-t border-white/10' : !brandedHeader ? 'border-t border-black/10' : ''}`}>
              {socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} className={`grid h-10 w-10 place-items-center rounded-full border ${(brandedHeader || glassMenu) ? 'border-white/20 text-white/80 hover:bg-white/10 hover:text-white' : 'border-black/15 text-current'}`}><SocialMark label={name} monochrome={brandedHeader || glassMenu} /></a>)}
              {!brandedHeader && <LanguageSwitcher variant="inline" />}
            </div>
            {header.showCta !== false && cta && <a href={cta.href.startsWith('/') ? `${basePath}${cta.href}` : cta.href} onClick={() => setMenuOpen(false)} style={{ background: cta.color, color: '#fff' }} className="mt-2 flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-bold">{cta.text}</a>}
          </div>
        )}
      </div>
    </header>
  );
}

export function PublicFooter({
  footer, orgId, basePath, nav,
}: { footer: FooterConfig; orgId: string; basePath: string; nav: NavItem[] }) {
  const { t } = useLanguage();
  const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  const footerHref = (href: string, label: string) => {
    if (!href.startsWith('/')) return href;
    const slug = href.replace(/^\/+|\/+$/g, '');
    const page = nav.find((item) => item.slug === slug) || nav.find((item) => normalize(item.title) === normalize(label));
    return page ? (page.isHome ? basePath || '/' : `${basePath}/${page.slug}`) : basePath || '/';
  };
  const selectedPages = nav.filter((page) => !footer.pageSlugs || footer.pageSlugs.includes(page.slug));
  const socialColumns = (footer.columns || []).filter(isSocialColumn);
  const brandedFooter = footer.logoUrl?.includes('/vielusos/') || footer.background?.toLowerCase() === '#0b0b10';
  return (
    <footer style={{ background: footer.background, color: footer.textColor, paddingBottom: 'env(safe-area-inset-bottom)' }} className="public-footer-shell mt-0">
      <div className="public-footer-grid mx-auto grid max-w-5xl gap-8 px-4 py-12">
        <div>
          <div className="text-lg font-extrabold">
            {footer.logoUrl ? (
              <span className={logoFrameClass}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={footer.logoUrl} alt={footer.logoText} className={footerLogoClass} />
              </span>
            ) : footer.logoText}
          </div>
          <p className="mt-3 text-sm opacity-80">{t(footer.text)}</p>
        </div>

        {selectedPages.length > 0 && <div>
          <p className="text-sm font-bold uppercase tracking-wide opacity-90">{t('Pages')}</p>
          <ul className="mt-3 space-y-2 text-sm opacity-80">{selectedPages.map((page) => <li key={page.slug}><a href={page.isHome ? basePath || '/' : `${basePath}/${page.slug}`} className="hover:opacity-100">{t(page.title)}</a></li>)}</ul>
        </div>}

        {socialColumns.map((col, i) => (
          <div key={i}>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">{t(col.title)}</p>
            <ul className={`mt-3 text-sm opacity-80 ${isSocialColumn(col) ? 'flex flex-wrap gap-2' : 'space-y-2'}`}>
              {col.links.map((l, j) => (
                <li key={j}>
                  <a href={footerHref(l.href, l.label)} target={isSocialColumn(col) ? '_blank' : undefined} rel={isSocialColumn(col) ? 'noreferrer' : undefined} title={t(l.label)} aria-label={t(l.label)} className={isSocialColumn(col) ? 'grid h-11 w-11 place-items-center rounded-xl border border-current/20 transition hover:bg-white/10 hover:opacity-100' : 'hover:opacity-100'}>
                    {isSocialColumn(col) ? <SocialMark label={l.label} monochrome={brandedFooter} /> : t(l.label)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {footer.showNewsletter && (
          <div>
            <p className="text-sm font-bold uppercase tracking-wide opacity-90">{t(footer.newsletterTitle)}</p>
            <div className="mt-3"><NewsletterForm orgId={orgId} /></div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10">
        <div className="public-footer-bottom mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs opacity-70">
          <span>{t(footer.allRightsText)}</span>
          <div className="flex gap-4">
            {footer.showCgv && <a href={`${basePath}/cgv`} className="hover:opacity-100">CGV</a>}
            {footer.showMentions && <a href={`${basePath}/mentions-legales`} className="hover:opacity-100">{t('Mentions légales')}</a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
