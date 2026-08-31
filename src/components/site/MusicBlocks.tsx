'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Instagram, Music2, Youtube, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { safePublicUrl, videoEmbed } from '@/lib/render';

export type Track = { title?: string; artist?: string; url?: string; thumbnail?: string; year?: string; source?: string };
type PlayerItem = { platform?: string; url?: string; title?: string; artist?: string; releaseDate?: string };

// ---- Sons / Playlist -------------------------------------------------------
export function MusicTracks({ content }: { content: any }) {
  const tracks: Track[] = Array.isArray(content?.tracks) ? content.tracks : [];
  const layout = content?.layout === 'list' ? 'list' : 'grid';
  const clean = tracks.filter((t) => t && (t.title || t.thumbnail || t.url));

  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-6xl px-4 pt-6">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez vos sons — leurs pochettes s’afficheront automatiquement.</p>
      ) : layout === 'list' ? (
        <div className="mt-5 space-y-2">
          {clean.map((t, i) => {
            const href = safePublicUrl(t.url || '');
            const Row = (
              <div className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                  {t.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.thumbnail} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold text-gray-900">{t.title || 'Titre'}</p>
                  <p className="truncate text-sm text-gray-500">{t.artist || t.source || ''}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-gray-400"><Play className="h-5 w-5" /></span>
              </div>
            );
            return href ? <a key={i} href={href} target="_blank" rel="noreferrer" className="block">{Row}</a> : <div key={i}>{Row}</div>;
          })}
        </div>
      ) : (
        <div className="mt-5 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {clean.map((t, i) => {
            const href = safePublicUrl(t.url || '');
            return (
              <div key={i} className="w-60 shrink-0 snap-start overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
                <div className="aspect-square w-full overflow-hidden bg-gray-100">
                  {t.thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <div className="p-4">
                  {t.year && <p className="text-xs font-bold tracking-widest text-[var(--brand)]">{t.year}</p>}
                  <p className="mt-1 truncate text-lg font-extrabold text-gray-900">{t.title || 'Titre'}</p>
                  <p className="truncate text-sm text-gray-500">{t.artist || ''}</p>
                  {t.source && <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400">{t.source}</p>}
                  {href && (
                    <a href={href} target="_blank" rel="noreferrer" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gray-900 py-2.5 text-sm font-bold text-white transition hover:opacity-90"><Play className="h-4 w-4" /> Écouter</a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Vidéos YouTube --------------------------------------------------------
export function VideoGrid({ content }: { content: any }) {
  const videos: { url?: string; title?: string }[] = Array.isArray(content?.videos) ? content.videos : [];
  const clean = videos.filter((v) => v && v.url);
  const [playing, setPlaying] = useState<Record<number, boolean>>({});

  const youtubeId = (url: string) => url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] || '';
  const youtubeMark = <svg viewBox="0 0 24 17" aria-hidden="true" className="h-6 w-8"><path fill="#FF0000" d="M23.5 2.65a3 3 0 0 0-2.12-2.12C19.5 0 12 0 12 0S4.5 0 2.62.53A3 3 0 0 0 .5 2.65 31.6 31.6 0 0 0 0 8.5a31.6 31.6 0 0 0 .5 5.85 3 3 0 0 0 2.12 2.12C4.5 17 12 17 12 17s7.5 0 9.38-.53a3 3 0 0 0 2.12-2.12A31.6 31.6 0 0 0 24 8.5a31.6 31.6 0 0 0-.5-5.85Z"/><path fill="white" d="m9.6 12.15 6.3-3.65-6.3-3.65v7.3Z"/></svg>;
  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-6xl px-4 pt-6">
      <div className="mb-3" aria-label="YouTube">{youtubeMark}</div>
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez des liens YouTube — les vidéos s’intègrent automatiquement.</p>
      ) : (
        <div className="relative mt-5">
          <button type="button" aria-label="Vidéo précédente" onClick={() => document.getElementById('video-rail')?.scrollBy({ left: -340, behavior: 'smooth' })} className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/80"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Vidéo suivante" onClick={() => document.getElementById('video-rail')?.scrollBy({ left: 340, behavior: 'smooth' })} className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/80"><ChevronRight className="h-5 w-5" /></button>
          <div id="video-rail" className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {clean.map((v, i) => {
            const src = safePublicUrl(videoEmbed(v.url || ''));
            const id = youtubeId(v.url || '');
            const thumbnail = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
            return (
              <div key={i} className="vielusos-video-card w-[78vw] max-w-[320px] shrink-0 snap-start md:w-[320px]">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-sm">
                  {playing[i] && src ? (
                    <iframe src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`} className="absolute inset-0 h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={`YouTube video ${i + 1}`} />
                  ) : (
                    <button type="button" aria-label="Lire la vidéo" onClick={() => setPlaying((state) => ({ ...state, [i]: true }))} className="absolute inset-0 flex items-center justify-center bg-black/35 transition hover:bg-black/45 focus:outline-none focus:ring-2 focus:ring-white/80">
                      {thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                      <span className="relative grid h-14 w-20 place-items-center rounded-2xl bg-black/50 shadow-lg backdrop-blur-sm transition hover:bg-black/60">{youtubeMark}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          </div>
          <div className="mt-1 flex justify-center gap-1.5" aria-label="Indicateurs de défilement">
            {Array.from({ length: Math.min(clean.length, 6) }).map((_, i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60 ring-1 ring-black/20" />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Liens streaming (stylés) ---------------------------------------------
const STREAMING = [
  { key: 'spotify', label: 'Spotify', color: '#1DB954' },
  { key: 'deezer', label: 'Deezer', color: '#A238FF' },
  { key: 'appleMusic', label: 'Apple Music', color: '#FA57C1' },
  { key: 'soundcloud', label: 'SoundCloud', color: '#FF5500' },
  { key: 'youtube', label: 'YouTube', color: '#FF0000' },
  { key: 'youtubeMusic', label: 'YouTube Music', color: '#FF0000' },
  { key: 'amazonMusic', label: 'Amazon Music', color: '#25D1DA' },
  { key: 'beatport', label: 'Beatport', color: '#01FF95' },
  { key: 'bandcamp', label: 'Bandcamp', color: '#1DA0C3' },
  { key: 'tidal', label: 'TIDAL', color: '#000000' },
];
function StreamingIcon({ k }: { k: string }) {
  if (k === 'youtube') return <Youtube className="h-5 w-5" />;
  const officialMarks: Record<string, string> = {
    youtubeMusic: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtubemusic.svg',
    amazonMusic: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonmusic.svg',
    beatport: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/beatport.svg',
    bandcamp: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bandcamp.svg',
    tidal: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tidal.svg',
  };
  if (officialMarks[k]) return <span aria-hidden="true" className="block h-5 w-5 bg-current" style={{ WebkitMask: `url(${officialMarks[k]}) center / contain no-repeat`, mask: `url(${officialMarks[k]}) center / contain no-repeat` }} />;
  if (k === 'appleMusic') return <img src="/integrations/applemusic.svg" alt="" className="h-5 w-5 object-contain" />;
  if (k === 'soundcloud') {
    return <svg viewBox="0 0 44 28" className="h-5 w-8" aria-hidden="true"><path fill="currentColor" d="M31 27H11a11 11 0 0 1 0-22 12 12 0 0 1 21 5 8.5 8.5 0 0 1-1 17ZM3 15h2v10H3Zm5-6h2v18H8Zm5-4h2v22h-2Zm5-1h2v23h-2Zm5 2h2v21h-2Z" /></svg>;
  }
  if (k === 'spotify') {
    return <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="currentColor" /><path d="M8.2 12.2c5.4-1.8 11.3-1 15.2 1.3M9.5 16c4.4-1.3 9-.8 12.2 1M10.7 19.5c3.2-.9 6.5-.5 9 .7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" className="text-black/75" /></svg>;
  }
  if (k === 'deezer') {
    return <svg viewBox="0 0 36 30" className="h-5 w-6" aria-hidden="true"><path fill="#ff0092" d="M0 20h7v7H0z" /><path fill="#ff8c00" d="M8 13h7v14H8z" /><path fill="#00c7f2" d="M16 6h7v21h-7z" /><path fill="#a238ff" d="M24 0h7v27h-7z" /></svg>;
  }
  return <Music2 className="h-5 w-5" />;
}

function streamingLinkClass(style: string) {
  if (style === 'transparent-dark') return 'bg-white/0 text-gray-950 ring-1 ring-gray-950/20 hover:bg-gray-950/5';
  if (style === 'text-white') return 'bg-transparent px-2 text-white shadow-none hover:opacity-75';
  if (style === 'text-black') return 'bg-transparent px-2 text-gray-950 shadow-none hover:opacity-75';
  return 'bg-gray-950 text-white hover:opacity-90';
}
export function StreamingLinks({ content }: { content: any }) {
  const links = content?.links || {};
  const items = STREAMING.filter((s) => links[s.key]);
  const linkStyle = content?.linkStyle || 'dark-button';
  const glowColor = content?.glowColor || '';
  const textOnly = linkStyle === 'text-white' || linkStyle === 'text-black';
  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-4xl px-4 pb-8 pt-2 text-center md:pb-12">
      {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
      {items.length === 0 ? (
        <p className="py-8 text-sm text-gray-400">Ajoutez vos liens Spotify, Deezer, Apple Music, SoundCloud, YouTube.</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {items.map((s) => (
            <a key={s.key} href={safePublicUrl(links[s.key]) || '#'} target="_blank" rel="noreferrer"
              className={`inline-flex items-center gap-2.5 rounded-full py-3 text-sm font-bold transition ${textOnly ? '' : 'px-5'} ${streamingLinkClass(linkStyle)}`}
              style={textOnly ? undefined : { boxShadow: `0 12px 26px -12px ${(glowColor || s.color)}aa` }}>
              <span style={{ color: s.color }}><StreamingIcon k={s.key} /></span> {s.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Lecteurs officiels Spotify / SoundCloud / Deezer / YouTube -----------
function detectPlatform(rawUrl = '', forced = '') {
  const forcedPlatform = String(forced || '').toLowerCase();
  if (['spotify', 'soundcloud', 'deezer', 'youtube'].includes(forcedPlatform)) return forcedPlatform;
  const u = String(rawUrl).toLowerCase();
  if (u.includes('open.spotify.com')) return 'spotify';
  if (u.includes('soundcloud.com')) return 'soundcloud';
  if (u.includes('deezer.com')) return 'deezer';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return '';
}

function spotifyEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('open.spotify.com')) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return '';
    const [kind, id] = parts;
    if (!['track', 'album', 'playlist', 'artist', 'episode', 'show'].includes(kind)) return '';
    return `https://open.spotify.com/embed/${kind}/${id}`;
  } catch { return ''; }
}

function soundCloudEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('soundcloud.com')) return '';
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=true`;
  } catch { return ''; }
}

function deezerEmbed(rawUrl: string) {
  const clean = safePublicUrl(rawUrl);
  if (!clean) return '';
  try {
    const u = new URL(clean);
    if (!u.hostname.includes('deezer.com')) return '';
    const parts = u.pathname.split('/').filter(Boolean);
    const typeIndex = parts.findIndex((part) => ['track', 'album', 'playlist', 'artist'].includes(part));
    if (typeIndex < 0 || !parts[typeIndex + 1]) return '';
    return `https://widget.deezer.com/widget/dark/${parts[typeIndex]}/${parts[typeIndex + 1]}`;
  } catch { return ''; }
}

function officialEmbed(item: PlayerItem) {
  const platform = detectPlatform(item.url, item.platform);
  if (platform === 'spotify') return spotifyEmbed(item.url || '');
  if (platform === 'soundcloud') return soundCloudEmbed(item.url || '');
  if (platform === 'deezer') return deezerEmbed(item.url || '');
  if (platform === 'youtube') return safePublicUrl(videoEmbed(item.url || ''));
  return '';
}

function platformLabel(platform: string) {
  if (platform === 'spotify') return 'Spotify';
  if (platform === 'soundcloud') return 'SoundCloud';
  if (platform === 'deezer') return 'Deezer';
  if (platform === 'youtube') return 'YouTube';
  return 'Lecteur';
}

function PlatformLogo({ platform }: { platform: string }) {
  if (platform === 'youtube') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#ff0000]" aria-label="YouTube">
        <span className="grid h-7 w-10 place-items-center rounded-lg bg-[#ff0000] text-white"><Play className="h-4 w-4 fill-current" /></span>
        YouTube
      </span>
    );
  }
  if (platform === 'spotify') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#1db954]">
        <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="currentColor" /><path d="M8.2 12.2c5.4-1.8 11.3-1 15.2 1.3M9.5 16c4.4-1.3 9-.8 12.2 1M10.7 19.5c3.2-.9 6.5-.5 9 .7" fill="none" stroke="#0a0a0a" strokeLinecap="round" strokeWidth="2.2" /></svg>
        Spotify
      </span>
    );
  }
  if (platform === 'soundcloud') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#ff5500]">
        <svg viewBox="0 0 44 28" className="h-7 w-11" aria-hidden="true"><path fill="currentColor" d="M31 27H11a11 11 0 0 1 0-22 12 12 0 0 1 21 5 8.5 8.5 0 0 1-1 17ZM3 15h2v10H3Zm5-6h2v18H8Zm5-4h2v22h-2Zm5-1h2v23h-2Zm5 2h2v21h-2Z" /></svg>
        SoundCloud
      </span>
    );
  }
  if (platform === 'deezer') {
    return (
      <span className="inline-flex items-center gap-2 font-black text-[#a238ff]">
        <svg viewBox="0 0 36 30" className="h-7 w-9" aria-hidden="true">
          <path fill="#ff0092" d="M0 20h7v7H0z" /><path fill="#ff8c00" d="M8 13h7v14H8z" /><path fill="#00c7f2" d="M16 6h7v21h-7z" /><path fill="#a238ff" d="M24 0h7v27h-7z" />
        </svg>
        Deezer
      </span>
    );
  }
  return <span className="inline-flex items-center gap-2 font-black"><Music2 className="h-6 w-6" />Lecteur</span>;
}

export function OfficialPlayers({ content }: { content: any }) {
  const [playing, setPlaying] = useState<Record<string, boolean>>({});
  const items: PlayerItem[] = Array.isArray(content?.items) ? content.items : [];
  // Also surface platform URLs saved in the site's streaming-links settings.
  // This prevents a configured release from disappearing simply because it
  // was not manually duplicated in the player block.
  const linkedItems: PlayerItem[] = Object.entries(content?.links || {})
    .filter(([, url]) => typeof url === 'string' && url.trim())
    .map(([platform, url]) => ({ platform, url: String(url) }));
  const uniqueItems = Array.from(new Map([...items, ...linkedItems].filter((item) => item?.url).map((item) => [item.url, item])).values());
  const clean = uniqueItems
    .filter((item) => item?.url && officialEmbed(item))
    .sort((a, b) => {
      if (content?.sort === 'manual') return 0;
      const da = Date.parse(a.releaseDate || '');
      const db = Date.parse(b.releaseDate || '');
      if (Number.isNaN(da) && Number.isNaN(db)) return 0;
      if (Number.isNaN(da)) return 1;
      if (Number.isNaN(db)) return -1;
      return db - da;
    });

  return (
    <div className="vielusos-fluid vielusos-media-shell mx-auto w-full max-w-6xl px-4 pt-6">
      <div className="max-w-2xl">
        {content?.title && <h2 className="text-2xl font-extrabold uppercase tracking-tight md:text-3xl">{content.title}</h2>}
        {content?.intro && <p className="mt-2 text-sm leading-relaxed text-gray-500">{content.intro}</p>}
      </div>
      {clean.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Ajoutez des liens Spotify, SoundCloud, Deezer ou YouTube : les lecteurs officiels s’afficheront ici.</p>
      ) : (
        <div className="mt-6 space-y-10">
          {Array.from(new Set(clean.map((item) => detectPlatform(item.url, item.platform)))).map((platform) => {
            const group = clean.filter((item) => detectPlatform(item.url, item.platform) === platform);
            const railId = `official-player-rail-${platform}`;
            return (
              <section key={platform} aria-labelledby={`${railId}-title`}>
                <div id={`${railId}-title`} className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white/85">
                  <PlatformLogo platform={platform} />
                </div>
                <div className="relative">
                  <button type="button" aria-label={`${platformLabel(platform)} précédent`} onClick={() => document.getElementById(railId)?.scrollBy({ left: -330, behavior: 'smooth' })} className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white/80"><ChevronLeft className="h-5 w-5" /></button>
                  <button type="button" aria-label={`${platformLabel(platform)} suivant`} onClick={() => document.getElementById(railId)?.scrollBy({ left: 330, behavior: 'smooth' })} className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85 focus:outline-none focus:ring-2 focus:ring-white/80"><ChevronRight className="h-5 w-5" /></button>
                  <div id={railId} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {group.map((item, i) => {
                      const src = officialEmbed(item);
                      const isVideo = platform === 'youtube';
                      const youtubeId = isVideo ? item.url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] : '';
                      const thumbnail = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : '';
                      const key = `${platform}-${item.url}-${i}`;
                      if (isVideo) return (
                        <article key={key} className="vielusos-player-card relative aspect-video w-[82vw] max-w-[320px] shrink-0 snap-start overflow-hidden rounded-2xl bg-black/70 shadow-sm ring-1 ring-white/20 md:w-[320px]">
                          {playing[key] ? (
                            <iframe src={`${src}${src.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`} title="YouTube video" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
                          ) : (
                            <button type="button" aria-label="Lire la vidéo" onClick={() => setPlaying((state) => ({ ...state, [key]: true }))} className="absolute inset-0 flex items-center justify-center bg-black/20 transition hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-white/80">
                              {thumbnail && /* eslint-disable-next-line @next/next/no-img-element */ <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />}
                              <span className="relative grid h-14 w-20 place-items-center rounded-2xl bg-[#ff0000]/80 text-white shadow-lg backdrop-blur-sm"><Play className="h-7 w-7 fill-current" /></span>
                            </button>
                          )}
                        </article>
                      );
                      return (
                        <article key={key} className="vielusos-player-card flex h-[410px] w-[82vw] max-w-[320px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/20 bg-transparent shadow-sm backdrop-blur-md md:w-[320px]">
                          <div className="flex h-[144px] shrink-0 flex-col justify-between gap-2 border-b border-white/20 bg-transparent p-3">
                            <div className="sr-only"><PlatformLogo platform={platform} /></div>
                            <div className="min-h-0">
                              <h3 className="line-clamp-2 text-base font-extrabold text-white">{item.title || `${platformLabel(platform)} ${i + 1}`}</h3>
                              {item.artist && <p className="mt-1 truncate text-sm text-white/70">{item.artist}</p>}
                              {item.releaseDate && <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/50"><CalendarDays className="h-3.5 w-3.5" /> {new Date(item.releaseDate).toLocaleDateString('fr-FR')}</p>}
                            </div>
                          </div>
                          <div className="h-[266px] shrink-0 bg-transparent p-2"><iframe src={src} title={`${platformLabel(platform)} ${item.title || i + 1}`} loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full rounded-xl border-0" /></div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Aperçu Instagram (posts en temps réel via l'embed officiel) -----------
function instaEmbedUrl(url: string): string {
  const m = String(url).match(/instagram\.com\/(?:[^/]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed` : '';
}
function instaPostCode(url: string): string {
  return String(url).match(/instagram\.com\/(?:[^/]+\/)?(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)?.[1] || '';
}
type InstagramMedia = { type: 'image' | 'video'; src: string; poster?: string; width: number; height: number };
function InstagramMediaCard({ code, eager, position, variant = 'vielusos' }: { code: string; eager: boolean; position: number; variant?: 'vielusos' | 'generic' }) {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const delay = eager ? position * 180 : 900 + position * 180;
    let retryTimer: number | undefined;
    const load = async (attempt = 0) => {
      try {
        const response = await fetch(`/api/public/instagram-media?code=${encodeURIComponent(code)}&v=8-${attempt}`, { signal: controller.signal });
        const payload = response.ok ? await response.json() : { media: [] };
        const loaded = Array.isArray(payload.media) ? payload.media : [];
        if (loaded.length) setMedia(loaded);
        else if (attempt < 3) retryTimer = window.setTimeout(() => load(attempt + 1), 700 * (attempt + 1));
      } catch {
        if (!controller.signal.aborted && attempt < 3) retryTimer = window.setTimeout(() => load(attempt + 1), 700 * (attempt + 1));
      }
    };
    const timer = window.setTimeout(() => load(), delay);
    return () => { window.clearTimeout(timer); if (retryTimer) window.clearTimeout(retryTimer); controller.abort(); };
  }, [code, eager, position]);

  const item = media[active];
  const move = (direction: number) => setActive((current) => (current + direction + media.length) % media.length);
  return (
    <article
      className={variant === 'vielusos'
        ? 'relative aspect-[4/5] w-[calc((100%-0.75rem)/2)] shrink-0 snap-start overflow-hidden rounded-2xl bg-black/30 shadow-[0_18px_50px_rgba(0,0,0,.3)] md:w-[calc((100%-3rem)/5)]'
        : 'relative aspect-[4/5] w-[78vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-2xl bg-gray-950/10 shadow-[0_18px_45px_rgba(15,23,42,.16)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]'}
      onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }}
      onTouchEnd={(event) => {
        if (touchStart.current === null || media.length < 2) return;
        const distance = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
        if (Math.abs(distance) > 35) move(distance < 0 ? 1 : -1);
        touchStart.current = null;
      }}
    >
      {!item && <div className="absolute inset-0 animate-pulse bg-white/[0.035]" />}
      {item?.type === 'video' ? (
        <video key={item.src} src={item.src} poster={item.poster} controls playsInline preload={eager ? 'metadata' : 'none'} className="absolute inset-0 h-full w-full bg-black object-cover" />
      ) : item ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.src} alt="" loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      {media.length > 1 && <>
        <button type="button" aria-label="Média précédent" onClick={() => move(-1)} className="absolute left-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-[0_0_16px_rgba(255,255,255,.18)]"><ChevronLeft className="h-5 w-5" /></button>
        <button type="button" aria-label="Média suivant" onClick={() => move(1)} className="absolute right-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white shadow-[0_0_16px_rgba(255,255,255,.18)]"><ChevronRight className="h-5 w-5" /></button>
      </>}
    </article>
  );
}
export function InstagramPreview({ content }: { content: any }) {
  const username = String(content?.username || '').replace(/^@/, '');
  const profileUrl = safePublicUrl(content?.url || (username ? `https://instagram.com/${username}` : ''));
  const count = Math.max(1, Math.min(20, Number(content?.count) || 6));
  const embeds = (Array.isArray(content?.postUrls) ? content.postUrls : []).map(instaEmbedUrl).filter(Boolean).slice(0, count);
  const postCodes = (Array.isArray(content?.postUrls) ? content.postUrls : []).map(instaPostCode).filter(Boolean).slice(0, count);
  const tiktokUsername = String(content?.tiktokUsername || '').replace(/^@/, '');
  const tiktokProfileUrl = safePublicUrl(content?.tiktokUrl || (tiktokUsername ? `https://www.tiktok.com/@${tiktokUsername}` : ''));
  const tiktokPosts = (Array.isArray(content?.tiktokPostUrls) ? content.tiktokPostUrls : [])
    .map((url: string) => ({ url: safePublicUrl(url), id: String(url).match(/tiktok\.com\/@[^/]+\/(?:video|photo)\/(\d+)/)?.[1] || '' }))
    .filter((post: { url: string; id: string }) => post.url && post.id)
    .slice(0, count);

  if (content?.variant === 'vielusos') {
    return (
      <>
      <section className="vielusos-fluid mx-auto w-full max-w-7xl px-6 py-10 md:px-16 md:py-14 lg:px-20">
        <div className="flex items-center gap-3" aria-label="Instagram">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><Instagram className="h-4 w-4 text-white" /></span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.42em] text-white/45">Social</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-4">
          <h2 className="text-white">{content?.title || 'Instagram'}</h2>
          {profileUrl && <a href={profileUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-white/25 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/75 hover:bg-white/10">@{username}</a>}
        </div>
        {embeds.length > 0 ? (
          <div className="relative mt-7">
            <button type="button" aria-label="Publication Instagram précédente" onClick={() => document.getElementById('vielusos-instagram-rail')?.scrollBy({ left: -window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white/90 shadow-[0_0_22px_rgba(255,255,255,.18)] backdrop-blur-md transition hover:border-white/60 hover:bg-black/80 hover:shadow-[0_0_28px_rgba(255,255,255,.32)] focus:outline-none focus:ring-2 focus:ring-white/70"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="Publication Instagram suivante" onClick={() => document.getElementById('vielusos-instagram-rail')?.scrollBy({ left: window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white/90 shadow-[0_0_22px_rgba(255,255,255,.18)] backdrop-blur-md transition hover:border-white/60 hover:bg-black/80 hover:shadow-[0_0_28px_rgba(255,255,255,.32)] focus:outline-none focus:ring-2 focus:ring-white/70"><ChevronRight className="h-5 w-5" /></button>
            <div id="vielusos-instagram-rail" className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {postCodes.map((code: string, i: number) => <InstagramMediaCard key={code} code={code} eager={i < 5} position={i} />)}
            </div>
          </div>
        ) : <p className="mt-6 text-sm text-white/45">Ajoutez les liens de chaque post dans l’éditeur.</p>}

      </section>
      <section className="vielusos-fluid mx-auto w-full max-w-7xl px-6 py-10 md:px-16 md:py-14 lg:px-20">
        <div>
          <div className="flex items-center gap-3" aria-label="TikTok">
            <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/20 text-white/70"><Music2 className="h-4 w-4" /></span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.42em] text-white/45">Social</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h2 className="text-white">{content?.tiktokTitle || 'TikTok'}</h2>
            {tiktokProfileUrl && <a href={tiktokProfileUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-white/25 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/75 hover:bg-white/10">@{tiktokUsername || 'TikTok'}</a>}
          </div>
          {tiktokPosts.length > 0 ? (
            <div className="relative mt-7">
              <button type="button" aria-label="Publication TikTok précédente" onClick={() => document.getElementById('vielusos-tiktok-rail')?.scrollBy({ left: -window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white/90 backdrop-blur-md"><ChevronLeft className="h-5 w-5" /></button>
              <button type="button" aria-label="Publication TikTok suivante" onClick={() => document.getElementById('vielusos-tiktok-rail')?.scrollBy({ left: window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white/90 backdrop-blur-md"><ChevronRight className="h-5 w-5" /></button>
              <div id="vielusos-tiktok-rail" className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tiktokPosts.map((post: { url: string; id: string }, index: number) => <article key={`${post.id}-${index}`} className="aspect-[4/5] w-[calc((100%-0.75rem)/2)] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/15 bg-black/35 md:w-[calc((100%-3rem)/5)]"><iframe src={`https://www.tiktok.com/player/v1/${post.id}?autoplay=0&loop=0`} title={`TikTok ${index + 1}`} loading="lazy" allow="fullscreen" className="h-full w-full border-0" /></article>)}
              </div>
            </div>
          ) : <p className="mt-6 text-sm text-white/45">Ajoutez les liens des publications TikTok dans l’éditeur.</p>}
        </div>
      </section>
      </>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
      <div className="flex items-end justify-between gap-4">
        <div><div className="flex items-center gap-2" aria-label="Instagram"><span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"><Instagram className="h-4 w-4 text-white" /></span><span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Instagram</span></div>{content?.title && <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">{content.title}</h2>}</div>
        {profileUrl && <a href={profileUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-current/20 px-4 py-2 text-xs font-bold hover:bg-black/5">@{username || 'Instagram'}</a>}
      </div>

      {postCodes.length > 0 ? (
        <div className="relative mt-6">
          <button type="button" aria-label="Publication Instagram précédente" onClick={() => document.getElementById(`instagram-rail-${username || 'posts'}`)?.scrollBy({ left: -window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute left-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/65 text-white shadow-lg backdrop-blur-md"><ChevronLeft className="h-5 w-5" /></button>
          <button type="button" aria-label="Publication Instagram suivante" onClick={() => document.getElementById(`instagram-rail-${username || 'posts'}`)?.scrollBy({ left: window.innerWidth * 0.75, behavior: 'smooth' })} className="absolute right-1 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/65 text-white shadow-lg backdrop-blur-md"><ChevronRight className="h-5 w-5" /></button>
          <div id={`instagram-rail-${username || 'posts'}`} className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {postCodes.map((code: string, i: number) => <InstagramMediaCard key={`${code}-${i}`} code={code} eager={i < 5} position={i} variant="generic" />)}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-gray-400">Ajoutez les liens de vos posts Instagram — ils s’afficheront ici en direct.</p>
      )}
    </section>
  );
}
