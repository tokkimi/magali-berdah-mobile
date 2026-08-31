// Resolve the real thumbnail + title of a music/social link so blocks never
// show a random or broken image. Restricted to known hosts (no SSRF).

const ALLOWED = [
  'open.spotify.com', 'spotify.com', 'youtube.com', 'www.youtube.com', 'youtu.be', 'music.youtube.com',
  'soundcloud.com', 'on.soundcloud.com', 'deezer.com', 'www.deezer.com', 'dzr.page.link',
  'music.apple.com', 'geo.music.apple.com', 'bandcamp.com', 'instagram.com', 'www.instagram.com',
];

export function mediaHostAllowed(u: URL) {
  return ALLOWED.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
}

export function youtubeId(u: URL): string | null {
  if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
  if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
  if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
  return u.searchParams.get('v');
}

function meta(html: string, prop: string): string {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i');
  const m = html.match(re) || html.match(re2);
  return m ? m[1] : '';
}
function decode(s: string) {
  return s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

export type ResolvedMedia = { source: string; title: string; author: string; thumbnail: string; embedUrl: string };

export async function resolveMediaLink(raw: string): Promise<ResolvedMedia | null> {
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' || !mediaHostAllowed(u)) return null;

  const source =
    u.hostname.includes('spotify') ? 'Spotify' :
    u.hostname.includes('youtu') ? 'YouTube' :
    u.hostname.includes('soundcloud') ? 'SoundCloud' :
    u.hostname.includes('deezer') ? 'Deezer' :
    u.hostname.includes('apple') ? 'Apple Music' :
    u.hostname.includes('bandcamp') ? 'Bandcamp' :
    u.hostname.includes('instagram') ? 'Instagram' : 'Lien';
  const ytId = source === 'YouTube' ? youtubeId(u) : null;
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '';

  try {
    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EasyAssoBot/1.0; +https://easyasso.vercel.app)', 'Accept-Language': 'fr,en' },
      redirect: 'follow',
    });
    const html = await res.text();
    return {
      source,
      title: decode(meta(html, 'og:title')),
      author: decode(meta(html, 'og:site_name') || meta(html, 'music:musician') || ''),
      thumbnail: decode(meta(html, 'og:image')) || ytThumb,
      embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : '',
    };
  } catch {
    return { source, title: '', author: '', thumbnail: ytThumb, embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : '' };
  }
}
