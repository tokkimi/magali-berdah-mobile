import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';
const BASE_URL = ROOT.includes('localhost') ? `http://${ROOT}` : `https://${ROOT}`;
const TITLE = 'Easy Asso — Créez le site de votre association, sans compétence technique';
const DESCRIPTION =
  'Easy Asso permet à toute association de créer un site professionnel, collecter des dons, gérer ses donateurs et sa comptabilité, en toute autonomie.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  title: { default: TITLE, template: '%s · Easy Asso' },
  description: DESCRIPTION,
  applicationName: 'Easy Asso',
  keywords: ['association', 'site association', 'créer site association', 'collecte de dons', 'CRM donateurs', 'comptabilité association', 'HelloAsso', 'reçu fiscal'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: { type: 'website', siteName: 'Easy Asso', title: TITLE, description: DESCRIPTION, locale: 'fr_FR', url: BASE_URL },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
