import { AirwallexCheckoutClient } from './ui';

export const dynamic = 'force-dynamic';

export default async function AirwallexCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ intent_id?: string; client_secret?: string; currency?: string; env?: string }>;
}) {
  const params = await searchParams;
  return (
    <AirwallexCheckoutClient
      intentId={params.intent_id || ''}
      clientSecret={params.client_secret || ''}
      currency={params.currency || 'EUR'}
      env={params.env === 'demo' ? 'demo' : 'prod'}
    />
  );
}
