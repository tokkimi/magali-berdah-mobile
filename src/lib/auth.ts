import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const isHostedProduction = process.env.VERCEL_ENV === 'production';
const authSecret = process.env.NEXTAUTH_SECRET || (isHostedProduction ? undefined : 'dev-secret-change-me');
if (!authSecret) {
  throw new Error('NEXTAUTH_SECRET doit être configuré en production.');
}

// "Se connecter avec Google" is only enabled when the OAuth credentials are set,
// so the app still builds and runs with just email/password.
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Email',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Mot de passe', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;
      const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
      if (!user?.passwordHash) return null;
      const ok = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!ok) return null;
      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (googleEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: authSecret,
  providers,
  events: {
    // A brand-new Google user has no organization/site yet (the email/password
    // flow builds those in /api/register). Bootstrap one on first sign-in so
    // Google users land on a ready workspace with their free trial.
    async createUser({ user }) {
      try {
        const { createOrganizationForUser } = await import('./bootstrap');
        const already = await prisma.membership.findFirst({ where: { userId: user.id } });
        if (already) return;
        const assoName = (user.name?.trim() || 'Mon association').slice(0, 60);
        await createOrganizationForUser(user.id, assoName, 'fr', false, { email: user.email || undefined });
      } catch (err) {
        console.error('createUser bootstrap failed', err);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) (session.user as any).id = token.uid as string;
      return session;
    },
  },
};
