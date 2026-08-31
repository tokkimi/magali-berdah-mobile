import type { Metadata } from 'next';
import { AshleyAdminLogin } from '@/components/ashley-admin-login';

export const metadata: Metadata = {
  title: { absolute: 'ASHLEY · Administration' },
  description: 'Administration du site officiel ASHLEY.',
  robots: { index: false, follow: false },
};

export default function AshleyAdminPage() {
  return <AshleyAdminLogin />;
}
