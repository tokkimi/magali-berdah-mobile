import { randomUUID } from 'crypto';

const AIRWALLEX_API = process.env.AIRWALLEX_API_URL || 'https://api.airwallex.com/api/v1';

export const airwallexConfigured = Boolean(process.env.AIRWALLEX_CLIENT_ID && process.env.AIRWALLEX_API_KEY);
export const airwallexClientEnvironment = AIRWALLEX_API.includes('sandbox') ? 'demo' : 'prod';

async function accessToken() {
  const response = await fetch(`${AIRWALLEX_API}/authentication/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID!,
      'x-api-key': process.env.AIRWALLEX_API_KEY!,
    },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.token) throw new Error(data.message || 'Authentification Airwallex impossible');
  return data.token as string;
}

function airwallexError(data: any, fallback: string) {
  const message = String(data?.message || fallback);
  const code = data?.code ? ` [${data.code}]` : '';
  const trace = data?.trace_id ? ` Trace Airwallex: ${data.trace_id}.` : '';
  return new Error(`${message}${code}.${trace}`);
}

export async function createAirwallexPaymentLink(input: { organizationId: string; organizationName: string; amount: number }) {
  const token = await accessToken();
  const response = await fetch(`${AIRWALLEX_API}/pa/payment_links/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'EasyAsso — création de votre site associatif',
      description: `Accès à vie pour ${input.organizationName}`,
      amount: input.amount,
      currency: 'EUR',
      reusable: false,
      reference: `easyasso-${input.organizationId}`,
      metadata: { organizationId: input.organizationId, product: 'easyasso-lifetime' },
      collectable_shopper_info: { billing_address: false, message: false, phone_number: false, reference: false, shipping_address: false },
    }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id || !data.url) throw airwallexError(data, 'Création du paiement Airwallex impossible');
  return { id: data.id as string, url: data.url as string };
}

export async function createAirwallexPaymentIntent(input: { organizationId: string; organizationName: string; amount: number; email?: string | null; returnUrl: string }) {
  const token = await accessToken();
  const response = await fetch(`${AIRWALLEX_API}/pa/payment_intents/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request_id: randomUUID(),
      merchant_order_id: `easyasso-${input.organizationId}-${Date.now()}`,
      amount: input.amount,
      currency: 'EUR',
      return_url: input.returnUrl,
      description: `EasyAsso — création du site de ${input.organizationName}`,
      customer: input.email ? { email: input.email } : undefined,
      metadata: { organizationId: input.organizationId, product: 'easyasso-lifetime' },
    }),
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.id || !data.client_secret) {
    throw airwallexError(data, 'Création du paiement Airwallex impossible');
  }
  return { id: data.id as string, clientSecret: data.client_secret as string, currency: 'EUR' };
}

export async function retrieveAirwallexPaymentIntent(intentId: string) {
  const token = await accessToken();
  const response = await fetch(`${AIRWALLEX_API}/pa/payment_intents/${encodeURIComponent(intentId)}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Vérification Airwallex impossible');
  return data as any;
}
