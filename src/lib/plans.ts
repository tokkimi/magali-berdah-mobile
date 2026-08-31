// The ways an association can keep EasyAsso after the free trial.
export type PlanId = 'lifetime' | 'annual' | 'monthly';

const LIFETIME_EUR = Number(process.env.NEXT_PUBLIC_PRICE_EUR || '250');
const ANNUAL_EUR = Number(process.env.NEXT_PUBLIC_PRICE_ANNUAL_EUR || '99');
const MONTHLY_EUR = Number(process.env.NEXT_PUBLIC_PRICE_MONTHLY_EUR || '19');

export const PLANS = {
  monthly: { id: 'monthly' as PlanId, amountEur: MONTHLY_EUR, name: 'Mensuel', period: 'par mois', unit: '/ mois', interval: 'month' as 'month' | 'year' | null, recurring: true },
  annual: { id: 'annual' as PlanId, amountEur: ANNUAL_EUR, name: 'Annuel', period: 'par an', unit: '/ an', interval: 'year' as 'month' | 'year' | null, recurring: true },
  lifetime: { id: 'lifetime' as PlanId, amountEur: LIFETIME_EUR, name: 'À vie', period: 'paiement unique', unit: 'à vie', interval: null as 'month' | 'year' | null, recurring: false },
} as const;

export function isPlanId(value: unknown): value is PlanId {
  return value === 'annual' || value === 'lifetime' || value === 'monthly';
}

export function planFor(id?: string | null) {
  if (id === 'annual') return PLANS.annual;
  if (id === 'monthly') return PLANS.monthly;
  return PLANS.lifetime;
}

export function planRank(id?: string | null) {
  if (id === 'monthly') return 1;
  if (id === 'annual') return 2;
  if (id === 'lifetime') return 3;
  return 0;
}

export function canUpgradePlan(current?: string | null, next?: string | null) {
  return planRank(next) > planRank(current || 'monthly');
}
