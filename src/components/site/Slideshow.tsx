'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Slideshow({ slides, interval = 4 }: { slides: { image: string; caption?: string }[]; interval?: number }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % n), Math.max(2, interval) * 1000);
    return () => clearInterval(t);
  }, [n, interval]);
  if (n === 0) return null;
  return (
    <div className="relative aspect-[21/9] w-full overflow-hidden bg-gray-100">
      {slides.map((s, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={idx}
          src={s.image}
          alt={s.caption || ''}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {slides[i]?.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-center text-lg font-semibold text-white">
          {slides[i].caption}
        </div>
      )}
      {n > 1 && (
        <>
          <button onClick={() => setI((v) => (v - 1 + n) % n)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 hover:bg-white" aria-label="Précédent"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setI((v) => (v + 1) % n)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 hover:bg-white" aria-label="Suivant"><ChevronRight className="h-5 w-5" /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-5 bg-white' : 'w-2 bg-white/60'}`} aria-label={`Slide ${idx + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
