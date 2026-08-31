'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { PLANS, type PlanId } from '@/lib/plans';
import { PayButton } from './pay-button';
import { ManualTransferButton } from './manual-transfer-button';

// Lets the association pick between the annual and lifetime offer right before
// paying (the "après inscription" choice point). Both payment buttons receive
// the selected plan.
export function PlanChooser({ initialPlan = 'lifetime', demo }: { initialPlan?: PlanId; demo: boolean }) {
  const [plan, setPlan] = useState<PlanId>(initialPlan);
  const selected = PLANS[plan];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(['monthly', 'annual', 'lifetime'] as PlanId[]).map((id) => {
          const p = PLANS[id];
          const active = plan === id;
          const sub = id === 'monthly' ? 'Prélevé chaque mois' : id === 'annual' ? 'Prélevé chaque année' : 'Paiement unique, sans abonnement';
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPlan(id)}
              className={`relative rounded-2xl border-2 p-4 text-left transition ${active ? 'border-brand-600 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full border-2 ${active ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-300'}`}>
                {active && <Check className="h-3 w-3" />}
              </span>
              <p className="mt-2 font-extrabold text-gray-900">{p.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-700">{p.amountEur} €<span className="text-sm font-medium text-gray-500"> {p.unit}</span></p>
              <p className="mt-1 text-xs text-gray-500">{sub}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <PayButton price={String(selected.amountEur)} demo={demo} plan={plan} />
      </div>
      {plan === 'monthly' ? (
        <p className="mt-3 text-center text-xs text-gray-500">La formule mensuelle est réglée par carte (prélèvement automatique chaque mois).</p>
      ) : (
        <ManualTransferButton price={String(selected.amountEur)} plan={plan} />
      )}
    </div>
  );
}
