import type { Align, BlockStyle } from './blocks';
import { fontById } from './fonts';

// Whole-site theme → CSS applied on the site/editor root.
export function themeStyle(theme: any): React.CSSProperties {
  const t = theme || {};
  return {
    fontFamily: fontById(t.font).stack,
    background: t.background || '#ffffff',
    color: t.text || '#1f2937',
  };
}

export function safeHexColor(value: unknown, fallback = '#1b5df5'): string {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

export function safePublicUrl(value: unknown, options: { allowRelative?: boolean; allowDataImage?: boolean } = {}): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (options.allowRelative && raw.startsWith('/')) return raw;
  if (options.allowDataImage && /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(raw)) return raw;
  try {
    const parsed = new URL(raw);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return parsed.toString();
  } catch {
    return '';
  }
  return '';
}

// Mix a hex colour toward a target (white/black) by weight (0..1).
export function mixHex(hex: string, target: string, weight: number): string {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const clean = (h: string) => (h || '#000000').replace(/[^#0-9a-fA-F]/g, '').padEnd(7, '0');
  const [r1, g1, b1] = p(clean(hex));
  const [r2, g2, b2] = p(clean(target));
  const m = (a: number, b: number) => Math.round(a + (b - a) * weight).toString(16).padStart(2, '0');
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}

// A <style> body that makes the "brand" Tailwind utilities follow the theme
// primary colour on a public tenant page (safe: each public page is its own doc).
export function brandCss(primary?: string): string {
  const c = safeHexColor(primary);
  const tint = mixHex(c, '#ffffff', 0.88);
  const dark = mixHex(c, '#000000', 0.12);
  return `
:root{--brand:${c};}
.text-brand-600,.text-brand-700{color:${c} !important;}
.bg-brand-600{background-color:${c} !important;}
.hover\\:bg-brand-600:hover,.hover\\:bg-brand-700:hover{background-color:${dark} !important;}
.bg-brand-50{background-color:${tint} !important;}
.text-brand-100,.text-brand-200{color:${tint} !important;}
.ring-brand-100{--tw-ring-color:${tint} !important;}
.border-brand-400,.hover\\:border-brand-400:hover{border-color:${c} !important;}
`;
}

export function alignClass(a?: Align): string {
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center';
}
export function justifyClass(a?: Align): string {
  return a === 'left' ? 'justify-start' : a === 'right' ? 'justify-end' : 'justify-center';
}

export function blockWrapperStyle(style: BlockStyle): React.CSSProperties {
  return {
    paddingTop: style.paddingY ?? 12,
    paddingBottom: style.paddingY ?? 12,
    background: style.background || undefined,
  };
}

// Extract an embeddable URL for common video providers
export function videoEmbed(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return url;
}
