import { ExternalLink, Gift } from 'lucide-react';
import { safePublicUrl } from '@/lib/render';

function extractIframeSrc(value = '') {
  const match = value.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || '';
}

function isLeetchiUrl(value = '') {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return host === 'leetchi.com' || host.endsWith('.leetchi.com');
  } catch {
    return false;
  }
}

export function LeetchiBlock({ content }: { content: any }) {
  const en = content.locale === 'en';
  const link = safePublicUrl(content.url || '');
  const iframeCandidate = content.embedUrl || extractIframeSrc(content.embedCode || '') || content.url || '';
  const iframeSrc = safePublicUrl(iframeCandidate);
  const canDisplay = !!link && isLeetchiUrl(link);
  const canEmbed = !!iframeSrc && isLeetchiUrl(iframeSrc);
  if (!canDisplay) return null;

  const collected = Number(content.collectedEuros || 0);
  const goal = Number(content.goalEuros || 0);
  const hasGauge = goal > 0 && collected >= 0;
  const percent = hasGauge ? Math.min(100, Math.round((collected / goal) * 100)) : 0;

  return (
    <section className="leetchi-block mx-auto max-w-4xl text-left">
      <div className="text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Gift className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900">{content.title || (en ? 'Our Leetchi money pot' : 'Notre cagnotte Leetchi')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">{content.intro || (en ? 'Follow the campaign progress and contribute securely on Leetchi.' : 'Suivez l’avancement de la collecte et participez en toute sécurité sur Leetchi.')}</p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        {canEmbed && (
          <iframe
            title="Cagnotte Leetchi"
            src={iframeSrc}
            sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
            className="h-[420px] w-full border-0 bg-white"
          />
        )}

        <div className="space-y-5 p-6">
          {hasGauge && (
            <div>
              <div className="mb-2 flex items-end justify-between gap-3 text-sm">
                <span className="font-bold text-gray-900">{en ? 'Campaign progress' : 'Avancement de la cagnotte'}</span>
                <span className="font-semibold text-brand-700">{collected.toLocaleString(en ? 'en-GB' : 'fr-FR')} € / {goal.toLocaleString(en ? 'en-GB' : 'fr-FR')} €</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">{percent}% {en ? 'of the target reached' : 'de l’objectif atteint'}</p>
            </div>
          )}

          <a href={link} target="_blank" rel="noreferrer" className="btn btn-primary w-full justify-center py-4 text-base">
            <ExternalLink className="h-5 w-5" />
            {content.buttonText || (en ? 'Contribute on Leetchi' : 'Participer à la cagnotte')}
          </a>
        </div>
      </div>
    </section>
  );
}
