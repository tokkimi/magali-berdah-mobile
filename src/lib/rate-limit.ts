import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as { easyassoRateLimit?: Map<string, Bucket> };
const buckets = globalForRateLimit.easyassoRateLimit ?? new Map<string, Bucket>();
globalForRateLimit.easyassoRateLimit = buckets;

function clientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimit(req: Request, scope: string, limit = 20, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `${scope}:${clientIp(req)}`;
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}

export function rateLimitExceeded() {
  return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
}
