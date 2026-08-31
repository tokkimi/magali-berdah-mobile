import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public, unauthenticated pageview beacon. Fired client-side on every visit so
// tracking stays accurate even though public pages are CDN-cached (ISR).
export async function POST(req: Request) {
  try {
    const b = await req.json().catch(() => null);
    const organizationId = typeof b?.organizationId === 'string' ? b.organizationId : '';
    if (!/^[a-z0-9]{10,40}$/i.test(organizationId)) return NextResponse.json({ ok: false }, { status: 200 });
    const path = typeof b.path === 'string' ? b.path.slice(0, 300) : null;
    const referrer = typeof b.referrer === 'string' && b.referrer ? b.referrer.slice(0, 300) : null;
    await prisma.siteEvent.create({ data: { organizationId, type: 'pageview', path, referrer } }).catch(() => {});
  } catch { /* never fail a beacon */ }
  return NextResponse.json({ ok: true });
}
