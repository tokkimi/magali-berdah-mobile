import { NextRequest, NextResponse } from 'next/server';

type InstagramNode = {
  is_video?: boolean;
  display_url?: string;
  video_url?: string;
  dimensions?: { width?: number; height?: number };
  edge_sidecar_to_children?: { edges?: Array<{ node?: InstagramNode }> };
};

function allowedMediaUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    const officialContentHost = host.startsWith('scontent-') && (host.endsWith('.cdninstagram.com') || host.endsWith('.fbcdn.net'));
    return url.protocol === 'https:' && officialContentHost ? url.toString() : '';
  } catch {
    return '';
  }
}

async function officialPosterFallback(code: string) {
  const response = await fetch(`https://www.instagram.com/p/${code}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
    cache: 'no-store',
  });
  const html = await response.text();
  const image = allowedMediaUrl(html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1]?.replaceAll('&amp;', '&'));
  return image ? [{ type: 'image', src: image, poster: image, width: 1, height: 1 }] : [];
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code') || '';
  if (!/^[A-Za-z0-9_-]{5,30}$/.test(code)) return NextResponse.json({ media: [] }, { status: 400 });

  try {
    let match: RegExpMatchArray | null = null;
    for (const kind of ['p', 'reel']) {
      const response = await fetch(`https://www.instagram.com/${kind}/${code}/embed`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'fr-FR,fr;q=0.9' },
        cache: 'no-store',
      });
      if (!response.ok) continue;
      match = (await response.text()).match(/"contextJSON":"((?:\\.|[^"\\])*)"/);
      if (match) break;
    }
    if (!match) {
      const media = await officialPosterFallback(code);
      if (!media.length) throw new Error('Instagram media payload missing');
      return NextResponse.json({ media }, { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' } });
    }
    const context = JSON.parse(JSON.parse(`"${match[1]}"`));
    const root: InstagramNode | undefined = context?.gql_data?.shortcode_media;
    const sidecarNodes = root?.edge_sidecar_to_children?.edges?.map((edge) => edge.node).filter((node): node is InstagramNode => Boolean(node));
    const nodes: InstagramNode[] = sidecarNodes?.length ? sidecarNodes : (root ? [root] : []);
    const media = nodes.map((node) => ({
      type: node.is_video && allowedMediaUrl(node.video_url) ? 'video' : 'image',
      src: node.is_video ? allowedMediaUrl(node.video_url) : allowedMediaUrl(node.display_url),
      poster: allowedMediaUrl(node.display_url),
      width: Number(node.dimensions?.width) || 1,
      height: Number(node.dimensions?.height) || 1,
    })).filter((item) => item.src);
    if (!media.length) throw new Error('Instagram media empty');
    return NextResponse.json({ media }, { headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400' } });
  } catch {
    return NextResponse.json({ media: [] }, { status: 502 });
  }
}
