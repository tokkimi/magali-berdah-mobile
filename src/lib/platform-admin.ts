import { redirect } from 'next/navigation';
import { getCurrentUser } from './session';

export function platformAdminEmails() {
  return (process.env.EASYASSO_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isPlatformAdmin(user: { email: string; isSuperAdmin?: boolean | null } | null | undefined) {
  if (!user?.email) return false;
  if (user.isSuperAdmin) return true;
  return platformAdminEmails().includes(user.email.toLowerCase());
}

export async function requirePlatformAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!isPlatformAdmin(user)) redirect('/dashboard');
  return user;
}

export function platformBankDetails() {
  return {
    iban: process.env.EASYASSO_BANK_IBAN || '',
    bic: process.env.EASYASSO_BANK_BIC || '',
    holder: 'Une Digitale',
    bankName: process.env.EASYASSO_BANK_NAME || '',
  };
}
