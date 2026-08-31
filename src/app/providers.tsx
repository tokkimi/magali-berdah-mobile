'use client';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/components/language-provider';
import { CookieBanner } from '@/components/cookie-banner';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><LanguageProvider>{children}<CookieBanner /></LanguageProvider></SessionProvider>;
}
