import { NextResponse } from 'next/server';
import { resolveMediaLink } from '@/lib/oembed';

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('url') || '';
  const resolved = await resolveMediaLink(raw);
  if (!resolved) {
    return NextResponse.json({ error: 'Lien non pris en charge. Utilisez Spotify, YouTube, SoundCloud, Deezer, Apple Music, Bandcamp ou Instagram.' }, { status: 400 });
  }
  return NextResponse.json(resolved);
}
