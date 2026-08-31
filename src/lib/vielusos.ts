/**
 * The VIELUSOS site has a deliberately art-directed presentation that differs
 * from the general EasyAsso templates. Keep this in one place so the exception
 * never leaks into another tenant's public site or dashboard.
 */
export const VIELUSOS_SUBDOMAIN = 'ruche-dpjdd9ne';

export const VIELUSOS_BRAND = {
  logoUrl: '/vielusos/logo.png',
  backgroundUrl: '/vielusos/background.png',
  accent: '#d33f5c',
  surface: '#0b0b10',
};

export const VIELUSOS_SITE_CSS = `
html:has(.vielusos-site), body:has(.vielusos-site) { min-height: 100%; background: #0b0b10 !important; }
.vielusos-site { min-height: 100dvh; background-color: #0b0b10 !important; }
.vielusos-site main { background: transparent; font-family: "Montserrat", "Helvetica Neue", Arial, sans-serif; font-weight: 300; }
.vielusos-site .public-block-shell .text-gray-900, .vielusos-site .public-block-shell .text-gray-950 { color: #f7f7fb !important; }
.vielusos-site .public-block-shell .text-gray-600, .vielusos-site .public-block-shell .text-gray-500 { color: rgba(247,247,251,.72) !important; }
.vielusos-site .public-block-shell .bg-white { background: rgba(10,10,15,.68) !important; }
.vielusos-site .public-block-shell .ring-gray-100 { --tw-ring-color: rgba(255,255,255,.18) !important; }
.vielusos-site .public-header-shell, .vielusos-site .public-footer-shell { background: #0b0b10 !important; }
.vielusos-site .public-footer-shell { margin-bottom: 0 !important; }
.vielusos-site main h2 { font-family: "Cormorant Garamond", "Times New Roman", serif !important; font-size: clamp(1.75rem, 3vw, 2.5rem) !important; line-height: 1 !important; font-weight: 300 !important; letter-spacing: .18em !important; text-transform: uppercase !important; }
.vielusos-site .vielusos-fluid { width: 80% !important; max-width: none !important; padding-left: 0 !important; padding-right: 0 !important; }
.vielusos-site .vielusos-media-shell { padding-left: 0 !important; padding-right: 0 !important; }
.vielusos-site .public-social-block img,
.vielusos-site .public-footer-shell img[src*="integrations"],
.vielusos-site .vielusos-media-shell img,
.vielusos-site .vielusos-media-shell svg { filter: grayscale(1) saturate(0) !important; }
.vielusos-site .public-social-block a { color: rgba(247,247,251,.58) !important; border-color: rgba(247,247,251,.2) !important; }
.vielusos-site .public-social-block a:hover { color: rgba(247,247,251,.92) !important; background: rgba(255,255,255,.06); }
.vielusos-site .vielusos-media-shell [style*="color"] { color: rgba(247,247,251,.68) !important; }
.vielusos-site .vielusos-media-shell [style*="box-shadow"] { box-shadow: 0 12px 26px -12px rgba(180,180,188,.35) !important; }
@media (min-width: 768px) {
  .vielusos-site .vielusos-player-card, .vielusos-site .vielusos-video-card { width: calc((100% - 3rem) / 4) !important; max-width: none !important; }
}
@media (max-width: 640px) {
  .vielusos-site .public-footer-grid { justify-items: center; text-align: center; }
  .vielusos-site .public-footer-grid > div { display: flex; width: 100%; flex-direction: column; align-items: center; }
  .vielusos-site .public-footer-grid ul { align-items: center; justify-content: center; }
  .vielusos-site .public-footer-bottom { align-items: center !important; justify-content: center !important; text-align: center; }
  .vielusos-site .public-footer-bottom > div { flex-wrap: wrap; justify-content: center; }
}
`;

export function isVielusosSite(site?: { subdomain?: string | null } | null): boolean {
  return site?.subdomain === VIELUSOS_SUBDOMAIN;
}
