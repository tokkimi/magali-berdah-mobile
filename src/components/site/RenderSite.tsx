import type { Metadata } from 'next';
import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HEADER, DEFAULT_FOOTER, type HeaderConfig, type FooterConfig } from '@/lib/blocks';
import { PublicBlock } from './PublicBlock';
import { PublicHeader, PublicFooter } from './PublicChrome';
import { ContactBubble } from './ContactBubble';
import { CustomerAccessForm } from './CustomerAccessForm';
import { PageViewTracker } from './PageViewTracker';
import { themeStyle, brandCss } from '@/lib/render';
import { googleFontsHref } from '@/lib/fonts';
import { canShowPublicSite } from '@/lib/plan';
import { isVielusosSite, VIELUSOS_BRAND } from '@/lib/vielusos';
import { VIELUSOS_SITE_CSS } from '@/lib/vielusos';
import { VielusosHero } from './VielusosHero';
import { VielusosBio } from './VielusosBio';
import { VielusosBooking } from './VielusosBooking';

type SiteWithPages = NonNullable<Awaited<ReturnType<typeof loadSiteBySubdomain>>>;

const VIELUSOS_TIKTOK_POSTS = [
  'https://www.tiktok.com/@vielusos/video/7639034526311796001',
  'https://www.tiktok.com/@vielusos/video/7634953189300751638',
  'https://www.tiktok.com/@vielusos/video/7617513144914627862',
  'https://www.tiktok.com/@vielusos/video/7668617576657800480',
  'https://www.tiktok.com/@vielusos/video/7665450867595808033',
  'https://www.tiktok.com/@vielusos/video/7654693326142049568',
  'https://www.tiktok.com/@vielusos/video/7637826062151322902',
  'https://www.tiktok.com/@vielusos/video/7636121804993498390',
  'https://www.tiktok.com/@vielusos/video/7633087077567040790',
  'https://www.tiktok.com/@vielusos/photo/7632358675759320342',
];

export async function loadSiteBySubdomain(subdomain: string) {
  return prisma.site.findUnique({
    where: { subdomain },
    include: {
      organization: { select: { planStatus: true, trialEndsAt: true, profile: true } },
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
    },
  });
}
export async function loadSiteByDomain(domain: string) {
  const apex = domain.replace(/^www\./i, '');
  return prisma.site.findFirst({
    where: { customDomain: { in: [domain, apex, `www.${apex}`] }, domainVerified: true },
    include: {
      organization: { select: { planStatus: true, trialEndsAt: true, profile: true } },
      pages: { orderBy: { order: 'asc' }, include: { blocks: { orderBy: { order: 'asc' } } } },
    },
  });
}

// SEO metadata for a public tenant site (title, description, Open Graph/Twitter
// with the association's logo). `absolute` title keeps the tenant's own name
// without the EasyAsso suffix.
export function siteMetadata(site: { name: string; header: unknown; footer: unknown } | null, subdomain?: string): Metadata {
  if (!site) return { title: 'Easy Asso' };
  const footer = (site.footer as any) || {};
  const header = (site.header as any) || {};
  const raw = typeof footer.text === 'string' && footer.text.trim() ? footer.text.trim() : `Le site de ${site.name}.`;
  const description = raw.slice(0, 300);
  const image = isVielusosSite({ subdomain }) ? VIELUSOS_BRAND.logoUrl : (header.logoUrl || footer.logoUrl);
  return {
    title: { absolute: site.name },
    description,
    // Each published site uses its own uploaded logo for the browser tab and
    // home-screen shortcut. Fall back to EasyAsso's default only when no logo
    // was provided by the site owner.
    icons: image ? { icon: [{ url: image }], apple: [{ url: image }] } : undefined,
    openGraph: { title: site.name, description, type: 'website', images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary', title: site.name, description },
  };
}

// Active products for a tenant shop, newest first, shaped for the catalogue.
async function loadShopProducts(organizationId: string) {
  const rows = await prisma.product.findMany({
    where: { organizationId, active: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  return rows.map((p) => {
    const images = Array.isArray(p.images) ? (p.images as string[]) : [];
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      images: images.length ? images : p.imageUrl ? [p.imageUrl] : [],
      category: p.category,
      brand: p.brand,
      stock: p.stock,
    };
  });
}

export async function RenderSite({ site, basePath, slug }: { site: SiteWithPages; basePath: string; slug?: string }) {
  if (!site) notFound();
  if (!site.published || !canShowPublicSite(site.organization)) return <SiteOffline />;

  const header = { ...DEFAULT_HEADER, ...(site.header as any) } as HeaderConfig;
  const footer = { ...DEFAULT_FOOTER, ...(site.footer as any) } as FooterConfig;
  const profile = (((site.organization as any)?.profile) || {}) as Record<string, any>;
  const vielusos = isVielusosSite(site);
  const publicHeader = vielusos
    ? { ...header, logoUrl: VIELUSOS_BRAND.logoUrl, logoText: site.name.toUpperCase(), background: VIELUSOS_BRAND.surface, textColor: '#f7f7fb' }
    : header;
  const headerSocials = Object.entries((publicHeader as any).social || {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string' && Boolean(entry[1].trim()));
  const socialLabels = new Set(['facebook', 'instagram', 'linkedin', 'youtube', 'youtube music', 'spotify', 'deezer', 'soundcloud', 'apple music', 'amazon music', 'beatport', 'bandcamp', 'tidal', 'shotgun', 'tiktok', 'x', 'twitter']);
  const socialDisplayLabels: Record<string, string> = {
    applemusic: 'Apple Music',
    amazonmusic: 'Amazon Music',
    youtubemusic: 'YouTube Music',
    soundcloud: 'SoundCloud',
    beatport: 'Beatport',
    bandcamp: 'Bandcamp',
    tidal: 'TIDAL',
    shotgun: 'Shotgun',
  };
  const footerColumns = Array.isArray(footer.columns) ? footer.columns : [];
  const columnsWithHeaderSocials = [
    ...footerColumns.filter((column) => !column.links?.length || !column.links.every((link) => socialLabels.has(String(link.label).toLowerCase()))),
    ...(headerSocials.length ? [{ title: 'Réseaux sociaux', links: headerSocials.map(([label, href]) => ({ label: label === 'x' ? 'X' : socialDisplayLabels[label.toLowerCase()] || label.charAt(0).toUpperCase() + label.slice(1), href })) }] : []),
  ];
  const publicFooter = vielusos
    ? {
      ...footer,
      logoUrl: VIELUSOS_BRAND.logoUrl,
      logoText: site.name.toUpperCase(),
      background: VIELUSOS_BRAND.surface,
      textColor: '#f7f7fb',
      columns: columnsWithHeaderSocials,
      text: String(footer.text || '').replace(/vielusos/gi, 'VIELUSOS'),
      allRightsText: String(footer.allRightsText || '').replace(/vielusos/gi, 'VIELUSOS'),
    }
    : { ...footer, columns: columnsWithHeaderSocials };
  const shopEnabled = Boolean(profile.shopEnabled ?? profile.hasShop);
  const nav = site.pages
    .filter((p) => p.showInNav && (p.slug !== 'boutique' || shopEnabled))
    .filter((p) => !vielusos || (!p.isHome && !['bio', 'about', 'a-propos'].includes(p.slug)))
    .map((p) => ({ title: p.title, slug: p.slug, isHome: p.isHome }));
  const theme = (site.theme as any) || {};
  const fontHref = googleFontsHref(theme.font);

  // Floating contact bubble — shown on every page of every site (opt-out via
  // footer.showContactBubble = false in the editor).
  const bubble = (footer as any).showContactBubble === false ? null : (
    <ContactBubble
      name={vielusos ? site.name.toUpperCase() : site.name}
      slogan={(footer as any).contactBubbleText || publicFooter.text}
      sloganEn={(footer as any).contactBubbleTextEn}
      logoUrl={(publicHeader as any).logoUrl || (publicFooter as any).logoUrl}
      email={(footer as any).contactBubbleEmail || profile.email}
      phone={(footer as any).contactBubblePhone || profile.phone}
      organizationId={site.organizationId}
      locale={profile.language === 'en' ? 'en' : 'fr'}
      position={(footer as any).contactBubblePosition || 'right'}
      backgroundColor={(footer as any).contactBubbleColor || '#171717'}
      textColor={(footer as any).contactBubbleTextColor || '#ffffff'}
      showPhone={(footer as any).contactBubbleShowPhone ?? true}
      showSms={(footer as any).contactBubbleShowSms ?? true}
      showEmail={(footer as any).contactBubbleShowEmail ?? true}
      showMessage={(footer as any).contactBubbleShowMessage ?? true}
      branded={vielusos}
      showBooking={vielusos}
      bookingLabel={(footer as any).contactBubbleBookingLabel || 'Booking'}
      bookingLabelEn={(footer as any).contactBubbleBookingLabelEn || 'Booking'}
      bookingSubtitle={(footer as any).contactBubbleBookingSubtitle || 'Dates, événements et demandes professionnelles'}
      bookingSubtitleEn={(footer as any).contactBubbleBookingSubtitleEn || 'Dates, events and professional enquiries'}
      bookingHref={(footer as any).contactBubbleBookingHref || `${basePath || ''}/booking`}
    />
  );

  if (slug === 'client') {
    return (
      <div className={`flex min-h-screen flex-col ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusos ? VIELUSOS_SITE_CSS : ''}` }} />
        <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
        <ClientAccessPage organizationId={site.organizationId} organizationName={vielusos ? site.name.toUpperCase() : site.name} locale={profile.language === 'en' ? 'en' : 'fr'} branded={vielusos} />
        <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
        {bubble}
      </div>
    );
  }

  if (slug === 'cgv' || slug === 'mentions-legales') {
    const isCgv = slug === 'cgv';
    return (
      <div className={`min-h-screen ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
        {fontHref && <link rel="stylesheet" href={fontHref} />}
        <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusos ? VIELUSOS_SITE_CSS : ''}` }} />
        <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="text-3xl font-extrabold">{isCgv ? 'Conditions générales' : 'Mentions légales'}</h1>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-600">{isCgv ? publicFooter.cgvContent : publicFooter.mentionsContent}</p>
        </main>
        <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
        {bubble}
      </div>
    );
  }

  if (slug === 'boutique' && !shopEnabled) notFound();

  if (vielusos && slug === 'booking') {
    return (
      <div className="vielusos-site flex min-h-screen flex-col" style={publicSiteStyle(theme, true)}>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap" />
        <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${VIELUSOS_SITE_CSS}` }} />
        <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
        <VielusosBooking organizationId={site.organizationId} copy={{
          title: (footer as any).bookingTitle,
          titleEn: (footer as any).bookingTitleEn,
          description: (footer as any).bookingDescription,
          descriptionEn: (footer as any).bookingDescriptionEn,
          formTitle: (footer as any).bookingFormTitle,
          formTitleEn: (footer as any).bookingFormTitleEn,
        }} />
        <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
        {bubble}
      </div>
    );
  }

  const page = slug ? site.pages.find((p) => p.slug === slug) : site.pages.find((p) => p.isHome) || site.pages[0];
  if (!page) notFound();

  // Load products only when the page actually shows a shop block, and only when
  // the shop is enabled for this organization.
  const shopReady = Boolean(profile.stripeConnectReady);
  const hasShopBlock = page.blocks.some((b) => b.type === 'shop');
  const products = hasShopBlock && shopEnabled ? await loadShopProducts(site.organizationId) : [];
  const renderedBlocks = vielusos && page.isHome ? moveNetworksBelowStats(page.blocks) : page.blocks;

  return (
    <div className={`flex min-h-screen flex-col ${vielusos ? 'vielusos-site' : ''}`} style={publicSiteStyle(theme, vielusos)}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      {vielusos && <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap" />}
      <style dangerouslySetInnerHTML={{ __html: `${brandCss(theme.primary)}${vielusos ? VIELUSOS_SITE_CSS : ''}` }} />
      <PageViewTracker organizationId={site.organizationId} path={page.slug} />
      <PublicHeader header={publicHeader} nav={nav} basePath={basePath} />
      {vielusos && page.isHome && <VielusosHero title={site.name} config={(header as any).vielusosHero} />}
      {vielusos && (page.slug === 'bio' || page.slug === 'about' || page.slug === 'a-propos') && <VielusosBio blocks={page.blocks as any[]} config={(header as any).vielusosBio} />}
      <main className="flex-1 py-8">
        {vielusos && (page.slug === 'bio' || page.slug === 'about' || page.slug === 'a-propos') ? null : page.blocks.length === 0 ? (
          <p className="py-20 text-center text-gray-400">Cette page est vide.</p>
        ) : (
          renderedBlocks.map((b) => (
            <Fragment key={b.id}>
              <PublicBlock type={b.type} content={b.type === 'instagram' && vielusos ? { ...(b.content as any), variant: 'vielusos', tiktokTitle: (b.content as any)?.tiktokTitle || 'TikTok', tiktokUsername: (b.content as any)?.tiktokUsername || 'vielusos', tiktokUrl: (b.content as any)?.tiktokUrl || (publicHeader as any).social?.tiktok || 'https://www.tiktok.com/@vielusos', tiktokPostUrls: Array.isArray((b.content as any)?.tiktokPostUrls) && (b.content as any).tiktokPostUrls.length ? (b.content as any).tiktokPostUrls : VIELUSOS_TIKTOK_POSTS } : b.content as any} style={b.style as any} basePath={basePath} organizationId={site.organizationId} products={b.type === 'shop' ? products : undefined} shopReady={b.type === 'shop' ? shopReady : undefined} branded={vielusos} />
              {vielusos && page.isHome && b.type === 'instagram' && <VielusosBio config={(header as any).vielusosBio} />}
            </Fragment>
          ))
        )}
      </main>
      <PublicFooter footer={publicFooter} orgId={site.organizationId} basePath={basePath} nav={nav} />
      {bubble}
    </div>
  );
}

function moveNetworksBelowStats<T extends { type: string }>(blocks: T[]): T[] {
  const statsIndex = blocks.findIndex((block) => block.type === 'stats');
  const networkIndexes = blocks.map((block, index) => ({ type: block.type, index })).filter(({ type }) => type === 'streaming' || type === 'social').map(({ index }) => index);
  if (statsIndex < 0 || networkIndexes.length === 0) return blocks;
  const ordered = [...blocks];
  const networks = networkIndexes.map((index) => blocks[index]);
  for (const index of [...networkIndexes].sort((a, b) => b - a)) ordered.splice(index, 1);
  const adjustedStatsIndex = ordered.findIndex((block) => block.type === 'stats');
  ordered.splice(adjustedStatsIndex + 1, 0, ...networks.sort((a, b) => (a.type === 'streaming' ? -1 : b.type === 'streaming' ? 1 : 0)));
  return ordered;
}

function publicSiteStyle(theme: any, vielusos: boolean): React.CSSProperties {
  const base = themeStyle(theme);
  if (!vielusos) return base;
  return {
    ...base,
    backgroundColor: VIELUSOS_BRAND.surface,
    backgroundImage: `linear-gradient(rgba(8, 8, 12, .72), rgba(8, 8, 12, .72)), url(${VIELUSOS_BRAND.backgroundUrl})`,
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    color: '#f7f7fb',
  };
}

function ClientAccessPage({ organizationId, organizationName, locale, branded = false }: { organizationId: string; organizationName: string; locale: 'fr' | 'en'; branded?: boolean }) {
  const en = locale === 'en';
  return (
    <main className={`flex-1 px-4 py-12 ${branded ? 'bg-transparent' : 'bg-gray-50'}`}>
      <section className={`mx-auto max-w-2xl rounded-3xl p-5 text-center shadow-sm sm:p-7 md:rounded-[2rem] md:p-10 ${branded ? 'bg-[#0b0b10]/55 text-[#f7f7fb] ring-1 ring-white/15 backdrop-blur-xl' : 'bg-white ring-1 ring-gray-200'}`}>
        <p className={`text-sm font-bold uppercase tracking-[0.2em] ${branded ? 'text-[#d33f5c]' : 'text-[var(--brand)]'}`}>
          {branded ? 'VIELUSOS · espace client' : en ? 'Customer area' : 'Espace client'}
        </p>
        <h1 className={`mt-3 text-2xl font-black sm:text-3xl md:text-4xl ${branded ? 'text-white' : 'text-gray-900'}`}>
          {en ? 'Sign in or create your customer account' : 'Connexion ou inscription client'}
        </h1>
        <p className={`mx-auto mt-4 max-w-xl ${branded ? 'text-white/65' : 'text-gray-600'}`}>
          {en
            ? `Use your email to sign in or create your customer profile on ${organizationName}'s website.`
            : `Utilisez votre email pour vous connecter ou créer votre profil client sur le site de ${organizationName}.`}
        </p>
        <CustomerAccessForm organizationId={organizationId} organizationName={organizationName} locale={locale} branded={branded} />
      </section>
    </main>
  );
}

function SiteOffline() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 px-4 py-12 text-center">
      <section className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-gray-200">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Site hors ligne</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">Ce site est temporairement indisponible.</h1>
        <p className="mt-4 text-gray-600">
          L’association doit finaliser son activation pour remettre son site en ligne.
        </p>
      </section>
    </main>
  );
}

