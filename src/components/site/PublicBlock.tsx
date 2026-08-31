import {
  Facebook, Instagram, Twitter, Youtube, Linkedin, Music2,
  Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake,
} from 'lucide-react';
import type { BlockStyle, ButtonConfig, SocialConfig } from '@/lib/blocks';
import { alignClass, justifyClass, blockWrapperStyle, safePublicUrl, videoEmbed } from '@/lib/render';
import { Slideshow } from './Slideshow';
import { ContactForm } from './ContactForm';
import { DonationBlock } from './DonationBlock';
import { LeetchiBlock } from './LeetchiBlock';
import { ShopCatalog, type ShopProduct } from './ShopCatalog';
import { MusicTracks, VideoGrid, StreamingLinks, OfficialPlayers, InstagramPreview } from './MusicBlocks';
import { LocalizedEmbed } from './LocalizedEmbed';

const CARD_ICONS: Record<string, any> = {
  Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake, Music2,
};

// Blocks that break out of the narrow text column
const WIDE = new Set(['textimage', 'gallery', 'cards', 'contact', 'donation', 'leetchi', 'streaming', 'instagram']);
const FULL = new Set(['banner', 'slideshow', 'cta', 'shop', 'tracks', 'videos', 'players', 'html', 'event', 'events', 'stats']);

// The old default button colour was a fixed blue; on a themed site it should
// follow the site's brand colour instead.
const LEGACY_BLUE = '#1b5df5';
function themedColor(color: string) {
  return color?.toLowerCase() === LEGACY_BLUE ? 'var(--brand)' : color;
}

function Btn({ b, basePath = '' }: { b: ButtonConfig; basePath?: string }) {
  if (!b?.text) return null;
  const href = b.href?.startsWith('/') ? `${basePath}${b.href}` : safePublicUrl(b.href) || '#';
  const color = themedColor(b.color);
  const style = b.variant === 'solid'
    ? { background: color, color: b.color.toLowerCase() === '#ffffff' ? '#111827' : '#fff', border: `2px solid ${color}` }
    : { background: 'transparent', color, border: `2px solid ${color}` };
  return (
    <div className={`flex ${justifyClass(b.align)}`}>
      <a href={href} style={style} className="inline-flex items-center rounded-lg px-6 py-3 text-sm font-semibold transition hover:opacity-90">{b.text}</a>
    </div>
  );
}

export function PublicBlock({ type, content, style, basePath = '', organizationId, products, shopReady, branded = false }: { type: string; content: any; style: BlockStyle; basePath?: string; organizationId?: string; products?: ShopProduct[]; shopReady?: boolean; branded?: boolean }) {
  const publicContent = branded ? normalizeVielusosCopy(content) : content;
  const inner = renderInner(type, publicContent, style, basePath, organizationId, products, shopReady, branded);
  // Drop the old default sky-blue band (it also left white borders on the sides
  // of width-constrained blocks).
  const cleanBg = (bg?: string) => (bg && bg.toLowerCase() !== '#f1f5ff' ? bg : undefined);
  if (FULL.has(type)) {
    return <div style={blockWrapperStyle({ ...style, paddingY: type === 'html' ? 0 : style.paddingY, background: type === 'cta' ? cleanBg(style.background) : undefined })} className="w-full">{inner}</div>;
  }
  if (type === 'instagram' && content?.variant === 'vielusos') {
    return <div style={blockWrapperStyle({ ...style, background: cleanBg(style.background) })} className="w-full">{inner}</div>;
  }
  const maxW = WIDE.has(type) ? 'max-w-5xl' : 'max-w-3xl';
  const brandedStyle = branded && (type === 'streaming' || type === 'social') ? { ...style, paddingY: 0 } : style;
  return (
    <div style={blockWrapperStyle({ ...brandedStyle, background: cleanBg(brandedStyle.background) })} className={`public-block-shell mx-auto w-full ${maxW} px-4 ${alignClass(style.align)}`}>
      {inner}
    </div>
  );
}

function normalizeVielusosCopy(value: any, key = ''): any {
  if (typeof value === 'string') {
    if (/^(?:https?:|\/)/i.test(value) || ['variant', 'platform', 'align', 'layout', 'sort', 'linkStyle', 'backgroundType', 'contentPosition', 'textAlign'].includes(key)) return value;
    return value.replace(/vielusos/gi, 'VIELUSOS');
  }
  if (Array.isArray(value)) return value.map((child) => normalizeVielusosCopy(child, key));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([childKey, child]) => [childKey, normalizeVielusosCopy(child, childKey)]));
  return value;
}

function renderInner(type: string, content: any, style: BlockStyle, basePath: string, organizationId?: string, products?: ShopProduct[], shopReady?: boolean, branded = false) {
  switch (type) {
    case 'heading':
      return <h2 style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="font-extrabold leading-tight">{content.text}</h2>;
    case 'text':
      return <p style={{ color: style.color, fontSize: style.fontSize ? `${style.fontSize}px` : undefined }} className="whitespace-pre-wrap leading-relaxed">{content.text}</p>;
    case 'image':
      return content.url ? (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={safePublicUrl(content.url, { allowDataImage: true })} alt={content.alt || ''} loading="lazy" decoding="async" className="mx-auto max-h-[520px] w-auto rounded-xl" />
          {content.caption && <figcaption className="mt-2 text-sm text-gray-500">{content.caption}</figcaption>}
        </figure>
      ) : null;
    case 'video': {
      const src = safePublicUrl(videoEmbed(content.url));
      return src ? (
        <div className="relative mx-auto aspect-video w-full overflow-hidden rounded-xl">
          <iframe src={src} className="absolute inset-0 h-full w-full" allowFullScreen title="video" />
        </div>
      ) : null;
    }
    case 'button':
      return content.button ? <Btn b={content.button} basePath={basePath} /> : null;
    case 'social': {
      const s: SocialConfig = content.social || {};
      const items = [
        { k: 'facebook', url: s.facebook, Icon: Facebook },
        { k: 'instagram', url: s.instagram, Icon: Instagram },
        { k: 'twitter', url: s.twitter, Icon: Twitter },
        { k: 'youtube', url: s.youtube, Icon: Youtube, asset: '/integrations/youtube.svg' },
        { k: 'linkedin', url: s.linkedin, Icon: Linkedin },
        { k: 'tiktok', url: s.tiktok, Icon: Music2 },
        { k: 'spotify', url: s.spotify, Icon: Music2, asset: '/integrations/spotify.svg' },
        { k: 'deezer', url: s.deezer, Icon: Music2, asset: '/integrations/deezer.svg' },
        { k: 'soundcloud', url: s.soundcloud, Icon: Music2, asset: '/integrations/soundcloud.svg' },
        { k: 'appleMusic', url: s.appleMusic, Icon: Music2, asset: '/integrations/applemusic.svg' },
        { k: 'youtubeMusic', url: s.youtubeMusic, Icon: Music2, asset: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtubemusic.svg' },
        { k: 'amazonMusic', url: s.amazonMusic, Icon: Music2, asset: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/amazonmusic.svg' },
        { k: 'beatport', url: s.beatport, Icon: Music2, asset: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/beatport.svg' },
        { k: 'bandcamp', url: s.bandcamp, Icon: Music2, asset: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/bandcamp.svg' },
        { k: 'tidal', url: s.tidal, Icon: Music2, asset: 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/tidal.svg' },
      ].filter((i) => i.url);
      return (
        <div className={`public-social-block flex gap-4 ${justifyClass(s.align)}`}>
          {items.map(({ k, url, Icon, asset }) => (
            <a key={k} href={safePublicUrl(url) || '#'} target="_blank" rel="noreferrer" aria-label={k} title={k} className={`grid h-11 w-11 place-items-center rounded-xl border border-current/15 text-gray-600 transition hover:-translate-y-0.5 ${branded ? 'hover:text-gray-300' : 'hover:text-brand-600'}`}>{asset ? <img src={asset} alt="" className="h-6 w-6 object-contain" /> : <Icon className="h-6 w-6" />}</a>
          ))}
        </div>
      );
    }
    case 'columns':
      return (
        <div className={`public-responsive-columns ${(content.columns?.length || 2) >= 3 ? 'public-grid-3' : 'public-grid-2'}`}>
          {(content.columns || []).map((c: string, i: number) => (
            <p key={i} className="public-scroll-item whitespace-pre-wrap text-left leading-relaxed text-gray-600">{c}</p>
          ))}
        </div>
      );
    case 'spacer':
      return <div style={{ height: content.height || 40 }} />;
    case 'html':
      return <LocalizedEmbed html={content.html || ''} htmlEn={content.htmlEn || ''} height={content.height} />;
    case 'event':
      return <EventShowcase content={content} />;
    case 'events':
      return <EventHistory content={content} />;
    case 'stats':
      return <StatsShowcase content={content} hidePlatforms={branded} hideTrackStats={branded} />;

    // ---- Rich layouts ----
    case 'banner': {
      const h = content.height || 460;
      const overlay = (content.overlay ?? 45) / 100;
      const positions: Record<string, string> = {
        'top-left': 'items-start justify-start', 'top-center': 'items-start justify-center', 'top-right': 'items-start justify-end',
        'center-left': 'items-center justify-start', center: 'items-center justify-center', 'center-right': 'items-center justify-end',
        'bottom-left': 'items-end justify-start', 'bottom-center': 'items-end justify-center', 'bottom-right': 'items-end justify-end',
      };
      const textAlign = ['left', 'center', 'right'].includes(content.textAlign) ? content.textAlign : 'center';
      const mediaUrl = safePublicUrl(content.videoUrl || '');
      return (
        <div className={`relative flex w-full overflow-hidden p-6 md:p-10 ${positions[content.contentPosition] || positions.center}`} style={{ height: h }}>
          {content.backgroundType === 'video' && mediaUrl ? (
            <video src={mediaUrl} autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
          ) : content.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safePublicUrl(content.image, { allowDataImage: true })} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${overlay})` }} />
          <div className="relative text-white" style={{ width: '100%', maxWidth: `${Math.max(280, Math.min(1100, Number(content.contentWidth) || 720))}px`, textAlign: textAlign as any }}>
            {content.foregroundImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={safePublicUrl(content.foregroundImage, { allowDataImage: true })} alt="" className={`mb-5 h-auto object-contain ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : 'mr-auto'}`} style={{ width: `${Math.max(48, Math.min(520, Number(content.foregroundImageWidth) || 180))}px` }} />
            )}
            {content.title && <h2 className="text-3xl font-extrabold drop-shadow md:text-5xl">{content.title}</h2>}
            {content.subtitle && <p className={`mt-3 max-w-2xl whitespace-pre-wrap text-lg drop-shadow ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : 'mr-auto'}`}>{content.subtitle}</p>}
            {(content.button?.text || content.button2?.text) && <div className={`mt-6 flex flex-wrap gap-3 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
              {content.button?.text && <Btn b={{ ...content.button, align: textAlign }} basePath={basePath} />}
              {content.button2?.text && <Btn b={{ ...content.button2, align: textAlign }} basePath={basePath} />}
            </div>}
          </div>
        </div>
      );
    }
    case 'textimage': {
      const right = (content.imageSide || 'right') === 'right';
      const img = content.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={safePublicUrl(content.image, { allowDataImage: true })} alt="" loading="lazy" decoding="async" className="h-full max-h-[420px] w-full rounded-2xl object-cover" />
      ) : null;
      const txt = (
        <div className="flex flex-col justify-center text-left">
          {content.title && <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl" style={{ color: style.color }}>{content.title}</h3>}
          {content.text && <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-600">{content.text}</p>}
          {content.button?.text && <div className="mt-5"><Btn b={content.button} basePath={basePath} /></div>}
        </div>
      );
      return (
        <div className="public-textimage">
          {right ? <>{txt}{img}</> : <>{img}{txt}</>}
        </div>
      );
    }
    case 'gallery': {
      const cols = content.columns || 3;
      const gridCls = cols === 4 ? 'public-grid-4' : cols === 2 ? 'public-grid-2' : 'public-grid-3';
      return (
        <div className={`public-responsive-gallery ${gridCls}`}>
          {(content.images || []).map((src: string, i: number) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={safePublicUrl(src, { allowDataImage: true })} alt="" loading="lazy" decoding="async" className="public-scroll-item aspect-square rounded-xl object-cover" />
          ))}
        </div>
      );
    }
    case 'slideshow':
      return <Slideshow slides={content.slides || []} interval={content.interval || 4} />;
    case 'cards': {
      const cols = content.columns || 3;
      const gridCls = cols === 4 ? 'public-grid-4' : cols === 2 ? 'public-grid-2' : 'public-grid-3';
      return (
        <div className={`public-responsive-cards ${gridCls}`}>
          {(content.items || []).map((it: any, i: number) => {
            const Icon = CARD_ICONS[it.icon] || Heart;
            return (
              <div key={i} className="public-scroll-item rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-gray-100">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-6 w-6" /></div>
                {it.title && <h4 className="mt-4 font-bold text-gray-900">{it.title}</h4>}
                {it.text && <p className="mt-1 text-sm leading-relaxed text-gray-600">{it.text}</p>}
              </div>
            );
          })}
        </div>
      );
    }
    case 'cta':
      return (
        <div className="mx-auto max-w-3xl px-6 text-center">
          {content.title && <h3 className="text-2xl font-extrabold text-gray-900 md:text-3xl">{content.title}</h3>}
          {content.text && <p className="mx-auto mt-2 max-w-xl text-gray-600">{content.text}</p>}
          {content.button?.text && <div className="mt-5"><Btn b={content.button} basePath={basePath} /></div>}
        </div>
      );
    case 'contact':
      return <ContactForm organizationId={organizationId} content={content} />;
    case 'donation':
      return <DonationBlock content={content} organizationId={organizationId} />;
    case 'leetchi':
      return <LeetchiBlock content={content} />;
    case 'shop':
      return (
        <ShopCatalog
          products={products || []}
          title={content.title}
          intro={content.intro}
          search={content.search !== false}
          showCategories={content.showCategories !== false}
          columns={content.columns || 4}
          organizationId={organizationId}
          canCheckout={!!shopReady}
        />
      );
    case 'tracks':
      return <MusicTracks content={content} />;
    case 'videos':
      return <VideoGrid content={content} />;
    case 'streaming':
      return <StreamingLinks content={content} />;
    case 'players':
      return <OfficialPlayers content={content} />;
    case 'instagram':
      return <InstagramPreview content={content} />;
    default:
      return null;
  }
}

function EventShowcase({ content }: { content: any }) {
  const image = safePublicUrl(content.image, { allowDataImage: true });
  const href = safePublicUrl(content.buttonUrl);
  return (
    <section className="relative overflow-hidden px-5 py-14 text-white md:px-12 md:py-24">
      <div className="vielusos-fluid mx-auto max-w-7xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.55em] text-white/45">{content.eyebrow || 'Live'}</p>
        <h2 className="mt-5 text-5xl font-light uppercase tracking-[0.22em] md:text-7xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>{content.title || 'Next date'}</h2>
        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,.75fr)] lg:items-center">
          <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-[1.75rem] border border-white/15 bg-black/30 p-2 shadow-[0_30px_100px_rgba(0,0,0,.5)]">
            {image ? <img src={image} alt={content.eventName || ''} className="mx-auto h-auto max-h-[520px] w-full rounded-[1.35rem] object-contain" /> : <div className="grid aspect-[16/10] place-items-center rounded-[1.35rem] border border-dashed border-white/20 text-sm text-white/40">Ajoutez l’affiche dans l’éditeur</div>}
          </div>
          <div className="lg:pl-4">
            <p className="text-7xl font-semibold leading-none tracking-tight md:text-8xl">{content.day}</p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">{content.month}</p>
            <h3 className="mt-8 text-3xl font-light uppercase tracking-[0.08em] md:text-4xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>{content.eventName}</h3>
            <p className="mt-4 text-xs font-semibold uppercase leading-6 tracking-[0.22em] text-white/45">{content.venue}{content.city && <><br />{content.city}</>}</p>
            {content.time && <p className="mt-6 inline-flex rounded-full border border-white/20 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-white/85">{content.time}</p>}
            {href && <div><a href={href} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full border border-white/45 px-7 py-3 text-[11px] font-bold uppercase tracking-[0.28em] transition hover:bg-white hover:text-black">{content.buttonText || 'Tickets'}</a></div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, intro }: { eyebrow?: string; title?: string; intro?: string }) {
  return <div><p className="text-[8px] font-semibold uppercase tracking-[0.24em] text-white/45 sm:text-[10px] sm:tracking-[0.5em]">{eyebrow}</p>{title && <h2 className="mt-4 text-white">{title}</h2>}{intro && <p className="mt-4 max-w-2xl text-xs font-light leading-6 text-white/50 sm:text-sm sm:leading-7">{intro}</p>}</div>;
}

function StatsShowcase({ content, hidePlatforms = false, hideTrackStats = false }: { content: any; hidePlatforms?: boolean; hideTrackStats?: boolean }) {
  const items = (Array.isArray(content.items) ? content.items : []).filter((item: any) => !hideTrackStats || !/(techno\s+sombrero|jos[ée]\s+le\s+perroquet|kino\s+der\s+toten)/i.test(String(item?.label || '')));
  return <section className="px-5 pb-3 pt-10 text-white md:px-12 md:pb-4 md:pt-20"><div className="vielusos-fluid mx-auto max-w-7xl"><SectionHeading eyebrow={content.eyebrow} title={content.title} intro={content.intro} /><div className="mt-7 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 sm:mt-10 sm:rounded-3xl lg:grid-cols-3">{items.map((item: any, index: number) => <div key={index} className={`${items.length % 2 === 1 && index === 0 ? 'col-span-2 lg:col-span-1' : ''} min-h-28 border-b border-r border-white/10 p-4 sm:min-h-36 sm:p-6 lg:min-h-40`}><p className="break-words text-2xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{item.value}</p><p className="mt-4 max-w-[14rem] text-[7px] font-semibold uppercase leading-4 tracking-[0.16em] text-white/45 sm:mt-6 sm:text-[10px] sm:leading-5 sm:tracking-[0.25em]">{item.label}</p></div>)}</div>{!hidePlatforms && content.platforms && <p className="mt-4 break-words text-center text-[7px] font-semibold uppercase leading-4 tracking-[0.12em] text-white/35 sm:mt-5 sm:text-[9px] sm:tracking-[0.22em]">{content.platforms}</p>}</div></section>;
}

function EventHistory({ content }: { content: any }) {
  const items = Array.isArray(content.items) ? content.items : [];
  return <section className="px-5 py-12 text-white md:px-12 md:py-20"><div className="vielusos-fluid mx-auto max-w-7xl"><SectionHeading eyebrow={content.eyebrow} title={content.title} /><div className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mt-10 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">{items.map((item: any, index: number) => <article key={index} className="w-[82%] shrink-0 snap-start rounded-2xl border border-white/15 bg-black/20 p-5 backdrop-blur-sm md:w-auto md:p-6"><p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/40 sm:text-[9px] sm:tracking-[0.22em]">{item.date}</p><h3 className="mt-4 text-lg font-light uppercase tracking-[0.08em] text-white sm:mt-5 sm:text-xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>{item.name}</h3><p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.16em] text-white/40 sm:text-[9px] sm:tracking-[0.2em]">{item.location}</p></article>)}</div></div></section>;
}
