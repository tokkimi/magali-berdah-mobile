import type { Metadata } from 'next';
import { VielusosAdminLogin } from '@/components/vielusos-admin-login';

export const metadata: Metadata = {
  title: { absolute: 'VIELUSOS · Administration' },
  description: 'Administration du site officiel VIELUSOS.',
  icons: { icon: [{ url: '/vielusos/logo.png' }], apple: [{ url: '/vielusos/logo.png' }] },
  robots: { index: false, follow: false },
};

export default function VielusosAdminPage() {
  return <VielusosAdminLogin />;
}
