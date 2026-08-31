import { notFound } from 'next/navigation';
import { getTemplate } from '@/lib/templates';
import { PublicBlock } from '@/components/site/PublicBlock';
import { PublicHeader, PublicFooter } from '@/components/site/PublicChrome';
import { themeStyle, brandCss } from '@/lib/render';
import { googleFontsHref } from '@/lib/fonts';

export const dynamic = 'force-static';

// Public, chrome-free preview of a template's home page (used in an iframe).
export default async function TemplatePreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getTemplate(id);
  if (!t) notFound();

  const home = t.pages.find((p) => p.isHome) || t.pages[0];
  const nav = t.pages.filter((p) => p.showInNav).map((p) => ({ title: p.title, slug: p.slug, isHome: p.isHome }));
  const fontHref = googleFontsHref((t.theme as any).font);

  return (
    <div className="flex min-h-screen flex-col" style={themeStyle(t.theme)}>
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      <style dangerouslySetInnerHTML={{ __html: brandCss((t.theme as any).primary) }} />
      <PublicHeader header={t.header as any} nav={nav} basePath="#" />
      <main className="flex-1 py-8">
        {home.blocks.map((b: any, i: number) => (
          <PublicBlock key={i} type={b.type} content={b.content} style={b.style} basePath="#" />
        ))}
      </main>
      <PublicFooter footer={t.footer as any} orgId="preview" basePath="#" nav={nav} />
    </div>
  );
}
