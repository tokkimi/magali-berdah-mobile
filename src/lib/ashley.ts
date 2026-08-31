/**
 * ASHLEY — « Techno Doll ».
 * Site sur-mesure construit sur la plateforme (mêmes blocs éditables et même
 * dashboard que les autres tenants). Tout le contenu ci-dessous est un point
 * de départ : Ashley modifie ensuite chaque bloc depuis /ashley-admin.
 *
 * On ne touche ni à Vielusos ni aux autres tenants : Ashley est un tenant
 * indépendant, avec sa propre marque (claire / lumineuse).
 */
import type { BuiltTemplate } from './templates';

export const ASHLEY_SUBDOMAIN = 'ashley';
export const ASHLEY_ORG_NAME = 'ASHLEY';

// Identifiants de connexion à l'espace d'administration (modifiables via env).
export const ASHLEY_ADMIN_EMAIL = (process.env.ASHLEY_ADMIN_EMAIL || 'hello@skorm-agency.com').toLowerCase();
export const ASHLEY_ADMIN_PASSWORD = process.env.ASHLEY_ADMIN_PASSWORD || 'EnterTheRave2026';

// Liens officiels réels
const IG = 'https://www.instagram.com/ashley.musicoff/';
const TIKTOK = 'https://www.tiktok.com/@ashley.musicoff';
const SPOTIFY = 'https://open.spotify.com/artist/6J9GhUodUMaj81Fj5xbNcB';
const SOUNDCLOUD = 'https://soundcloud.com/ashleymusicoff';
const BEATPORT_UNO = 'https://www.beatport.com/release/uno-dos-tres/4772465';
const BEATPORT_INFERNO = 'https://www.beatport.com/release/psychedelic-inferno/4938848';
const BOOKING = 'Hello@skorm-agency.com';
const SLOGAN = 'Escape the mind, Enter the rave';

export const ASHLEY_PROFILE = {
  siteType: 'music' as const,
  language: 'fr' as const,
  slogan: SLOGAN,
  instagram: IG,
  tiktok: TIKTOK,
  email: BOOKING,
};

// Couleurs lumineuses (contraste avec l'univers sombre de Vielusos)
const THEME = {
  primary: '#ff2e93', // magenta électrique
  secondary: '#7b3cff', // violet
  background: '#ffffff',
  text: '#1b1030',
  font: 'montserrat',
};

const HERO_IMG = 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=1600&q=90';
const BIO_IMG = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=900&q=90';

const streaming = { spotify: SPOTIFY, soundcloud: SOUNDCLOUD, beatport: BEATPORT_UNO };

const tracks = [
  { title: 'UNO DOS TRES', artist: 'ASHLEY', year: '2024', source: 'Beatport · iM Electronica', url: BEATPORT_UNO },
  { title: 'PSYCHEDELIC INFERNO', artist: 'ASHLEY', year: '2025', source: 'Beatport · iM Electronica', url: BEATPORT_INFERNO },
];

const players = [
  { platform: 'spotify', url: SPOTIFY, title: 'ASHLEY', artist: 'Spotify' },
  { platform: 'soundcloud', url: SOUNDCLOUD, title: 'ASHLEY', artist: 'SoundCloud' },
];

const socialContent = {
  align: 'center' as const,
  instagram: IG,
  tiktok: TIKTOK,
  spotify: SPOTIFY,
  soundcloud: SOUNDCLOUD,
  beatport: BEATPORT_UNO,
};

const dates = [
  { date: '12 SEP 2026', name: 'Paris — La Machine du Moulin Rouge', location: 'Paris, FR' },
  { date: '26 SEP 2026', name: 'Berlin — RSO', location: 'Berlin, DE' },
  { date: '24 OCT 2026', name: 'London — FOLD', location: 'London, UK' },
];

const BIO = `ASHLEY — « Techno Doll ». DJ et productrice de hard techno, elle fait rimer chrome, hyperpop et kicks tranchants. Sorties sur iM Electronica (Beatport), sets en clubs, warehouses et open airs. Une signature : ${SLOGAN}.`;

function seedBlocks(list: { type: string; content: any; style?: any }[]) {
  return list.map((b, order) => ({ type: b.type, order, content: b.content, style: b.style || {} }));
}

export function ashleyTemplate(): BuiltTemplate {
  return {
    id: 'ashley-luminous',
    name: 'ASHLEY — Techno Doll',
    category: 'Musique',
    family: 'music',
    tagline: SLOGAN,
    preview: HERO_IMG,
    theme: THEME,
    header: {
      logoText: ASHLEY_ORG_NAME,
      showNav: true,
      sticky: true,
      background: '#ffffff',
      textColor: '#1b1030',
      menuGlass: true,
      menuOpacity: 85,
      menuBlur: 18,
      menuBackground: '#ffffff',
      cta: { text: 'Écouter', href: '/sons', color: THEME.primary, variant: 'solid', align: 'right' },
    },
    footer: {
      logoText: ASHLEY_ORG_NAME,
      text: SLOGAN,
      showNewsletter: true,
      newsletterTitle: 'Recevez mes sorties',
      showCgv: false,
      cgvContent: '',
      showMentions: true,
      mentionsContent: 'Mentions légales à compléter.',
      allRightsText: `© ${new Date().getFullYear()} ASHLEY.`,
      background: '#1b1030',
      textColor: '#e9defb',
      showContactBubble: true,
      contactBubblePosition: 'right',
      contactBubbleColor: '#ff2e93',
      contactBubbleTextColor: '#ffffff',
      contactBubbleShowPhone: false,
      contactBubbleShowSms: false,
      contactBubbleShowEmail: true,
      contactBubbleShowMessage: true,
      contactBubbleShowBooking: true,
      contactBubbleEmail: BOOKING,
      contactBubbleBookingLabel: 'Booking',
      contactBubbleBookingSubtitle: 'Dates, clubs, festivals — via SKORM Agency',
      contactBubbleBookingHref: `mailto:${BOOKING}`,
      bookingTitle: 'Booking ASHLEY',
      bookingDescription: 'Booking, média, partenariat ou demande professionnelle concernant ASHLEY (SKORM Agency).',
      bookingFormTitle: 'Contact · Booking',
      columns: [
        { title: 'Musique', links: [{ label: 'Accueil', href: '/' }, { label: 'Sons', href: '/sons' }, { label: 'Dates', href: '/dates' }] },
        { title: 'Infos', links: [{ label: 'Bio', href: '/bio' }, { label: 'Contact', href: '/contact' }] },
      ],
    },
    pages: [
      {
        title: 'Accueil', slug: 'accueil', isHome: true, showInNav: true,
        blocks: seedBlocks([
          { type: 'banner', content: { backgroundType: 'image', image: HERO_IMG, title: ASHLEY_ORG_NAME, subtitle: SLOGAN, overlay: 40, height: 560, contentPosition: 'center', textAlign: 'center', button: { text: 'Écouter', href: '/sons', color: '#ffffff', variant: 'solid', align: 'center' }, button2: { text: 'Dates', href: '/dates', color: '#ffffff', variant: 'outline', align: 'center' } } },
          { type: 'streaming', content: { title: 'Écouter partout', linkStyle: 'dark-button', glowColor: '#ff2e93', links: streaming } },
          { type: 'players', content: { title: 'Dernières sorties', intro: 'Écoutez directement depuis les plateformes officielles.', sort: 'newest', items: players } },
          { type: 'tracks', content: { title: 'Sons', layout: 'grid', tracks } },
          { type: 'events', content: { eyebrow: 'LIVE', title: 'Prochaines dates', items: dates } },
          { type: 'instagram', content: { title: 'Instagram', username: 'ashley.musicoff', url: IG, count: 6, postUrls: [], tiktokTitle: 'TikTok', tiktokUsername: 'ashley.musicoff', tiktokUrl: TIKTOK, tiktokPostUrls: [] } },
        ]),
      },
      {
        title: 'Sons', slug: 'sons', isHome: false, showInNav: true,
        blocks: seedBlocks([
          { type: 'heading', content: { text: 'Discographie' }, style: { align: 'center', fontSize: 36, paddingY: 16 } },
          { type: 'tracks', content: { title: '', layout: 'list', tracks } },
          { type: 'players', content: { title: 'Lecteurs officiels', intro: '', sort: 'newest', items: players } },
          { type: 'streaming', content: { title: 'Écouter partout', linkStyle: 'dark-button', glowColor: '#7b3cff', links: streaming } },
        ]),
      },
      {
        title: 'Dates', slug: 'dates', isHome: false, showInNav: true,
        blocks: seedBlocks([
          { type: 'heading', content: { text: 'Dates' }, style: { align: 'center', fontSize: 36, paddingY: 16 } },
          { type: 'events', content: { eyebrow: 'TOUR 2026', title: 'En live', items: dates } },
        ]),
      },
      {
        title: 'Bio', slug: 'bio', isHome: false, showInNav: true,
        blocks: seedBlocks([
          { type: 'textimage', content: { title: 'ASHLEY', text: BIO, image: BIO_IMG, imageSide: 'right' } },
          { type: 'social', content: { social: socialContent } },
        ]),
      },
      {
        title: 'Contact', slug: 'contact', isHome: false, showInNav: true,
        blocks: seedBlocks([
          { type: 'heading', content: { text: 'Contact & booking' }, style: { align: 'center', fontSize: 36, paddingY: 16 } },
          { type: 'contact', content: { title: 'Écrivez-nous', intro: 'Booking, presse, collaborations — via SKORM Agency.', email: BOOKING, phone: '', address: '', buttonText: 'Envoyer', successText: 'Merci, votre message a bien été envoyé.' } },
          { type: 'social', content: { social: socialContent } },
        ]),
      },
    ],
  } as BuiltTemplate;
}
