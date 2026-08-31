export type PlanLike = {
  planStatus: string;
  trialEndsAt: Date | string | null;
} | null;

const DAY_MS = 24 * 60 * 60 * 1000;

// Shared rule for dashboard access and public site visibility:
// - ACTIVE: fully available.
// - TRIAL: available until the 3-day trial end date.
// - PENDING_PAYMENT: still available if the original trial is not over yet.
//   Starting a card payment or requesting bank-transfer details must never cut
//   the free trial short.
// - every other status: blocked until validated by the super admin/payment flow.
export function planAccess(org: PlanLike) {
  if (!org) return { hasAccess: false, isTrial: false, daysLeft: 0, expired: true };
  if (org.planStatus === 'ACTIVE') return { hasAccess: true, isTrial: false, daysLeft: 0, expired: false };
  if ((org.planStatus === 'TRIAL' || org.planStatus === 'PENDING_PAYMENT') && org.trialEndsAt) {
    const ms = new Date(org.trialEndsAt).getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(ms / DAY_MS));
    return { hasAccess: ms > 0, isTrial: true, daysLeft, expired: ms <= 0 };
  }
  return { hasAccess: false, isTrial: org.planStatus === 'TRIAL', daysLeft: 0, expired: true };
}

export function canShowPublicSite(org: PlanLike) {
  return planAccess(org).hasAccess;
}
