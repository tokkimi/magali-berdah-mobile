// Fetches real, cause-themed photos from the Unsplash API when a key is set, so
// generated sites get images that are coherent AND varied. Returns [] when the
// key is missing or on any error, in which case the curated fallback photos are
// used instead. Set UNSPLASH_ACCESS_KEY (a free Unsplash "Access Key") to enable.
const SEARCH_URL = 'https://api.unsplash.com/search/photos';

export function unsplashEnabled() {
  return !!process.env.UNSPLASH_ACCESS_KEY;
}

export async function fetchCausePhotos(query: string, count = 24): Promise<string[]> {
  if (!unsplashEnabled() || !query.trim()) return [];
  try {
    const url = `${SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${Math.min(30, count)}&orientation=landscape&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`, 'Accept-Version': 'v1' },
      // Cache each query for a day so repeated generations reuse the result and
      // stay well within the Unsplash rate limit.
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      console.error('[unsplash] search failed', res.status);
      return [];
    }
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    return results.map((p: any) => p?.urls?.raw).filter((u: unknown): u is string => typeof u === 'string');
  } catch (e) {
    console.error('[unsplash] search error', e);
    return [];
  }
}
