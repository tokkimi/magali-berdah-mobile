'use client';

import { useLanguage } from '@/components/language-provider';
import type { HeaderConfig } from '@/lib/blocks';

const DEFAULT_FR = [
  'VIELUSOS crée une musique sombre et cinématographique, portée par une tension constante entre fragilité, puissance et lumière. Chaque sortie est pensée comme une scène : une atmosphère, une voix, une image et une émotion qui persiste après l’écoute.',
  'Entre productions introspectives et impulsions plus brutes, le projet construit son univers par le contraste. Les textures, le silence et la mélodie dessinent une signature singulière où la narration visuelle rencontre le son.',
  'PRODUCTION · ÉCRITURE · DIRECTION ARTISTIQUE',
];

const DEFAULT_EN = [
  'VIELUSOS creates dark, cinematic music driven by a constant tension between fragility, power and light. Every release is conceived as a scene: an atmosphere, a voice, an image and an emotion that lingers after listening.',
  'Moving between introspective productions and rawer impulses, the project builds its world through contrast. Textures, silence and melody shape a distinctive signature where visual storytelling meets sound.',
  'PRODUCTION · WRITING · ART DIRECTION',
];

export function VielusosBio({ blocks = [], config }: { blocks?: any[]; config?: HeaderConfig['vielusosBio'] }) {
  const { locale } = useLanguage();
  const copyFromBlocks = blocks
    .flatMap((block) => {
      const content = (block?.content || {}) as Record<string, unknown>;
      return [content.text, content.body, content.description, content.subtitle];
    })
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 40)
    .filter((value) => !/(association|associatif|bénévole|bénévoles|don|adhérent|public accompagné|partenaires)/i.test(value))
    .map((value) => value.trim())
    .slice(0, 3);

  const english = locale === 'en';
  const frenchParagraphs = config?.paragraphsFr?.filter(Boolean) || [];
  const englishParagraphs = (config?.paragraphsEn?.filter(Boolean) || config?.paragraphs?.filter(Boolean)) || [];
  const paragraphs = english
    ? (englishParagraphs.length ? englishParagraphs : DEFAULT_EN)
    : (frenchParagraphs.length ? frenchParagraphs : copyFromBlocks.length ? copyFromBlocks : DEFAULT_FR);
  const eyebrow = english
    ? (config?.eyebrowEn || config?.eyebrow || 'VIELUSOS · ARTIST')
    : (config?.eyebrowFr || config?.eyebrow || 'VIELUSOS · ARTISTE');
  const title = english
    ? (config?.titleEn || 'ABOUT')
    : (config?.titleFr || config?.title || 'À PROPOS');

  return (
    <section data-no-translate className="relative overflow-hidden border-y border-white/10 bg-black/35 px-5 py-12 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.05fr_.95fr] md:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/55">{eyebrow}</p>
          <h2 className="mt-3 font-['Cormorant_Garamond'] text-4xl font-light uppercase tracking-[0.16em] text-white md:text-5xl">{title}</h2>
          <div className="mt-6 space-y-5 font-['Montserrat'] text-base font-light leading-8 text-white/70 md:text-lg">
            {paragraphs.map((text, index) => <p key={index} className={index === paragraphs.length - 1 && text.length < 80 ? 'text-sm tracking-[0.18em] text-white/55' : ''}>{text}</p>)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[0] || '/vielusos/profile.jpg'} alt="VIELUSOS" className="col-span-2 aspect-[16/9] w-full rounded-2xl object-cover object-center shadow-2xl ring-1 ring-white/15" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[1] || '/vielusos/profile-2.png'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/15" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={config?.images?.[2] || '/vielusos/angel-in-hell.png'} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-xl ring-1 ring-white/15" />
        </div>
      </div>
    </section>
  );
}
