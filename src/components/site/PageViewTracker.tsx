'use client';

import { useEffect } from 'react';

// Sends one pageview beacon per visit (with external referrer) — works even
// with CDN/ISR caching, unlike server-side counting.
export function PageViewTracker({ organizationId, path }: { organizationId: string; path: string }) {
  useEffect(() => {
    if (!organizationId) return;
    let referrer = '';
    try {
      if (document.referrer && !document.referrer.includes(location.host)) referrer = document.referrer;
    } catch { /* ignore */ }
    const payload = JSON.stringify({ organizationId, path, referrer });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
      else fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
    } catch { /* ignore */ }
  }, [organizationId, path]);
  return null;
}
