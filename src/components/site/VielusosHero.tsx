import type { HeaderConfig } from '@/lib/blocks';
import { VIELUSOS_BRAND } from '@/lib/vielusos';

export function VielusosHero({ title, config }: { title: string; config?: HeaderConfig['vielusosHero'] }) {
  return (
    <section className="relative isolate aspect-video w-full overflow-hidden bg-[#08080c]" aria-label={title}>
      <video className="absolute inset-0 h-full w-full object-contain opacity-80" autoPlay muted loop playsInline preload="metadata" poster={VIELUSOS_BRAND.backgroundUrl} aria-hidden="true">
        <source src={config?.videoUrl || '/vielusos/banner.mp4'} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-[#08080c]" aria-hidden="true" />
      <div className="relative flex h-full items-center justify-center px-6 text-center">
        <div className="flex max-w-xl flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {config?.showLogo !== false && <img src={VIELUSOS_BRAND.logoUrl} alt="" className="mb-5 h-32 w-32 object-contain opacity-95 drop-shadow-[0_0_18px_rgba(255,255,255,.18)] md:h-44 md:w-44" />}
          {config?.showName !== false && <p className="text-4xl font-light uppercase leading-none tracking-[0.32em] text-white md:text-6xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>{title.toUpperCase()}</p>}
          {config?.showTagline !== false && <h1 className="mt-5 text-lg font-light uppercase tracking-[0.24em] text-white/85 md:text-2xl" style={{ fontFamily: '"Cormorant Garamond", "Times New Roman", serif' }}>POWER OF EMOTION</h1>}
        </div>
      </div>
    </section>
  );
}
