import { NextResponse, type NextRequest } from 'next/server';

// Maps custom domains to the internal /domain/<host> renderer. The app's own
// domain (root) and Vercel preview URLs are served normally.
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost').split(':')[0].toLowerCase();
  const isVielusosHost = host === 'vielusos.com' || host === 'www.vielusos.com';

  if (host === 'vielusos.com') {
    const canonical = req.nextUrl.clone();
    canonical.protocol = 'https:';
    canonical.hostname = 'www.vielusos.com';
    return NextResponse.redirect(canonical, 308);
  }

  // Public files must keep their real path on custom domains. Rewriting an
  // image or video request to /domain/<host>/... makes Next render a page and
  // returns a 404 instead of the asset.
  if (/\.[a-z0-9]{2,16}$/i.test(req.nextUrl.pathname)) return NextResponse.next();

  if (isVielusosHost && req.nextUrl.pathname === '/admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/vielusos-admin';
    return NextResponse.rewrite(url);
  }

  if (isVielusosHost && ['/dashboard', '/vielusos-admin', '/login', '/forgot-password', '/reset-password', '/verify-email'].some((path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const isRoot =
    host === root ||
    host === `www.${root}` ||
    host === 'localhost' ||
    host.endsWith('.vercel.app') ||
    host === '127.0.0.1';

  if (isRoot) {
    const language = req.cookies.get('easyasso-language')?.value;
    if (language === 'en' && req.nextUrl.pathname === '/cgv') {
      const url = req.nextUrl.clone();
      url.pathname = '/en/terms';
      return NextResponse.redirect(url);
    }
    if (language === 'en' && req.nextUrl.pathname === '/mentions-legales') {
      const url = req.nextUrl.clone();
      url.pathname = '/en/legal-notice';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Any other host is treated as a linked custom domain.
  const url = req.nextUrl.clone();
  const path = url.pathname === '/' ? '' : url.pathname;
  url.pathname = `/domain/${encodeURIComponent(host)}${path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and static assets.
  matcher: ['/((?!_next/|api/|favicon.ico|robots.txt).*)'],
};
