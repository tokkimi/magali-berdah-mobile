import Stripe from 'stripe';

// Demo mode must always be explicitly enabled. A missing payment key must
// never grant a paid plan in production.
export const isDemoMode = process.env.DEMO_MODE === '1' && process.env.NODE_ENV !== 'production';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  : null;

export const PRICE_EUR = Number(process.env.NEXT_PUBLIC_PRICE_EUR || '250');
