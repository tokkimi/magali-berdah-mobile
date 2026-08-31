'use client';
import { useEffect, useMemo, useState } from 'react';
import { Search, X, Heart, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  images: string[];
  category?: string;
  brand?: string;
  stock?: number | null;
};

type CartLine = { id: string; name: string; priceCents: number; image?: string; qty: number };

function euros(cents: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: (cents % 100 ? 2 : 0) }).format((cents || 0) / 100);
}

export function ShopCatalog({
  products, title, intro, search = true, showCategories = true, columns = 4, organizationId = '', canCheckout = false,
}: { products: ShopProduct[]; title?: string; intro?: string; search?: boolean; showCategories?: boolean; columns?: number; organizationId?: string; canCheckout?: boolean }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [sort, setSort] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [open, setOpen] = useState<ShopProduct | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);

  const storageKey = `easyasso-cart-${organizationId}`;
  const favoritesKey = `easyasso-favorites-${organizationId}`;
  useEffect(() => {
    try { const raw = localStorage.getItem(storageKey); if (raw) setCart(JSON.parse(raw)); } catch {}
  }, [storageKey]);
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch {}
  }, [cart, storageKey]);
  useEffect(() => {
    try { const raw = localStorage.getItem(favoritesKey); if (raw) setFavorites(JSON.parse(raw)); } catch {}
  }, [favoritesKey]);
  useEffect(() => {
    try { localStorage.setItem(favoritesKey, JSON.stringify(favorites)); } catch {}
  }, [favorites, favoritesKey]);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[], [products]);
  const list = useMemo(() => {
    let l = products.slice();
    if (showFavorites) l = l.filter((p) => favorites.includes(p.id));
    if (cat) l = l.filter((p) => p.category === cat);
    const query = q.trim().toLowerCase();
    if (query) l = l.filter((p) => [p.name, p.brand, p.category, p.description].some((v) => (v || '').toLowerCase().includes(query)));
    if (sort === 'price-asc') l.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === 'price-desc') l.sort((a, b) => b.priceCents - a.priceCents);
    return l;
  }, [products, cat, q, sort, favorites, showFavorites]);

  const gridCols = columns >= 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : columns === 3 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2';
  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.priceCents * l.qty, 0);

  function addToCart(p: ShopProduct, qty = 1) {
    setCart((c) => {
      const found = c.find((l) => l.id === p.id);
      if (found) return c.map((l) => (l.id === p.id ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
      return [...c, { id: p.id, name: p.name, priceCents: p.priceCents, image: p.images[0], qty }];
    });
    setOpen(null);
    setCartOpen(true);
  }
  function setQty(id: string, qty: number) {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty: Math.min(99, qty) } : l))));
  }
  function toggleFavorite(id: string) {
    setFavorites((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id]);
  }

  async function checkout() {
    if (cart.length === 0) return;
    setPaying(true);
    const returnPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const res = await fetch('/api/shop/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId, returnPath, items: cart.map((l) => ({ productId: l.id, quantity: l.qty })) }),
    });
    const data = await res.json().catch(() => ({}));
    setPaying(false);
    if (!res.ok || !data.url) { alert(data.error || 'Paiement impossible pour le moment.'); return; }
    window.location.href = data.url;
  }

  // Clear the cart after a successful return from Stripe.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).get('order') === 'success') { setCart([]); try { localStorage.removeItem(storageKey); } catch {} }
  }, [storageKey]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4">
      {title && <h2 className="text-center text-3xl font-extrabold text-gray-900 md:text-4xl">{title}</h2>}
      {intro && <p className="mx-auto mt-2 max-w-2xl text-center text-gray-500">{intro}</p>}

      {showCategories && categories.length > 0 && (
        <div className="mt-6 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button onClick={() => setCat('')} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === '' ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tout</button>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${cat === c ? 'bg-[var(--brand)] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{c}</button>
          ))}
        </div>
      )}

      {(search || products.length > 3) && (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {search ? (
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit, une marque…" className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--brand)]" />
            </div>
          ) : <div />}
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--brand)]">
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFavorites((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${showFavorites ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-gray-200 bg-white text-gray-700 hover:border-[var(--brand)] hover:text-[var(--brand)]'}`}
          >
            <Heart className={`h-4 w-4 ${showFavorites ? 'fill-current' : ''}`} />
            Favoris {favorites.length > 0 ? `(${favorites.length})` : ''}
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <p className="py-16 text-center text-gray-400">{products.length === 0 ? 'La boutique arrive bientôt.' : showFavorites ? 'Aucun favori pour le moment.' : 'Aucun produit ne correspond à votre recherche.'}</p>
      ) : (
        <div className={`mt-6 grid gap-4 ${gridCols}`}>
          {list.map((p) => (
            <button key={p.id} onClick={() => setOpen(p)} className="group text-left">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                ) : null}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={favorites.includes(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggleFavorite(p.id); } }}
                  className={`absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm transition ${favorites.includes(p.id) ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(p.id) ? 'fill-current' : ''}`} />
                </span>
              </div>
              <div className="mt-2">
                {(p.brand || p.category) && <p className="truncate text-[11px] font-bold uppercase tracking-wide text-gray-500"><span className="text-[var(--brand)]">{p.brand}</span>{p.brand && p.category ? ' · ' : ''}{p.category}</p>}
                <p className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-gray-900">{p.name}</p>
                <p className="mt-1 font-extrabold text-gray-900">{euros(p.priceCents)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && <ProductModal product={open} canCheckout={canCheckout} isFavorite={favorites.includes(open.id)} onToggleFavorite={() => toggleFavorite(open.id)} onAdd={addToCart} onClose={() => setOpen(null)} />}

      {/* Floating cart */}
      {canCheckout && cartCount > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 font-bold text-white shadow-lg">
          <ShoppingBag className="h-5 w-5" /> {cartCount} · {euros(cartTotal)}
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50" onClick={() => setCartOpen(false)}>
          <div className="flex h-full w-full max-w-md flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <p className="text-lg font-extrabold text-gray-900">Votre panier</p>
              <button onClick={() => setCartOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? <p className="py-16 text-center text-gray-400">Votre panier est vide.</p> : cart.map((l) => (
                <div key={l.id} className="flex items-center gap-3 border-b border-gray-100 py-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {l.image && <img src={l.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{l.name}</p>
                    <p className="text-sm text-gray-500">{euros(l.priceCents)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <button onClick={() => setQty(l.id, l.qty - 1)} className="grid h-7 w-7 place-items-center rounded-md border border-gray-200"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-semibold">{l.qty}</span>
                      <button onClick={() => setQty(l.id, l.qty + 1)} className="grid h-7 w-7 place-items-center rounded-md border border-gray-200"><Plus className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setQty(l.id, 0)} className="ml-auto text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 p-4">
              <div className="mb-3 flex items-center justify-between text-lg font-extrabold text-gray-900"><span>Total</span><span>{euros(cartTotal)}</span></div>
              <button onClick={checkout} disabled={paying || cart.length === 0} className="w-full rounded-xl bg-[var(--brand)] py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-50">{paying ? 'Redirection…' : 'Payer par carte'}</button>
              <p className="mt-2 text-center text-xs text-gray-400">Paiement sécurisé par Stripe · Livraison renseignée à l’étape suivante</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, canCheckout, isFavorite, onToggleFavorite, onAdd, onClose }: { product: ShopProduct; canCheckout: boolean; isFavorite: boolean; onToggleFavorite: () => void; onAdd: (p: ShopProduct, qty: number) => void; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [qty, setQty] = useState(1);
  const imgs = product.images.length ? product.images : [''];
  const soldOut = product.stock != null && product.stock <= 0;
  const prev = () => setI((v) => (v - 1 + imgs.length) % imgs.length);
  const next = () => setI((v) => (v + 1) % imgs.length);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100 sm:aspect-[4/3]">
            {imgs[i] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgs[i]} alt={product.name} className="h-full w-full object-contain" />
            ) : null}
            {imgs.length > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={next} className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
          <button onClick={onClose} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-700 shadow"><X className="h-5 w-5" /></button>
          {imgs.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2">
              {imgs.map((_, idx) => <button key={idx} onClick={() => setI(idx)} className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-5 bg-[var(--brand)]' : 'w-1.5 bg-gray-300'}`} />)}
            </div>
          )}
        </div>
        <div className="p-5">
          {(product.brand || product.category) && <p className="text-xs font-bold uppercase tracking-wide text-gray-500"><span className="text-[var(--brand)]">{product.brand}</span>{product.brand && product.category ? ' · ' : ''}{product.category}</p>}
          <div className="mt-1 flex items-start justify-between gap-3">
            <h3 className="text-xl font-extrabold text-gray-900">{product.name}</h3>
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-xl font-extrabold text-gray-900">{euros(product.priceCents)}</p>
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`grid h-10 w-10 place-items-center rounded-full border transition ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-500'}`}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          {product.stock != null && <p className="mt-1 text-sm text-gray-500">{product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}</p>}
          {product.description && <p className="mt-3 whitespace-pre-wrap leading-relaxed text-gray-600">{product.description}</p>}
          {canCheckout && !soldOut && (
            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-gray-200">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-gray-600"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="grid h-11 w-11 place-items-center text-gray-600"><Plus className="h-4 w-4" /></button>
              </div>
              <button onClick={() => onAdd(product, qty)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-3 font-bold text-white transition hover:opacity-90"><ShoppingBag className="h-5 w-5" /> Ajouter au panier</button>
            </div>
          )}
          {soldOut && <p className="mt-5 rounded-xl bg-gray-100 py-3 text-center font-semibold text-gray-500">Produit épuisé</p>}
        </div>
      </div>
    </div>
  );
}
