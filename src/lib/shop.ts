// Shared helpers for the shop/product API routes.

export function eurosToCents(value: unknown) {
  return Math.max(0, Math.round((Number(value) || 0) * 100));
}

export function optionalStock(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Keep at most 8 photos, each capped in size; images[0] is the main image.
export function cleanImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v || '').slice(0, 3_000_000)).filter(Boolean).slice(0, 8);
}
