'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/components/language-provider';

export function LocalizedEmbed({ html, htmlEn, height }: { html?: string; htmlEn?: string; height?: number }) {
  const { locale } = useLanguage();
  const source = locale === 'en' && htmlEn?.trim() ? htmlEn : html;
  const frame = useRef<HTMLIFrameElement>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(120);

  // These snippets are page sections, not complete standalone pages. Remove
  // browser defaults and full-viewport minimums that otherwise create large
  // empty bands between consecutive manual blocks.
  const compactSource = `${source || ''}<style data-easyasso-compact-embed>
html,body{margin:0!important;padding:0!important;min-height:0!important;height:auto!important;overflow:hidden!important}
body>main,body>section{min-height:0!important;height:auto!important;margin-top:0!important;margin-bottom:0!important}
</style>`;

  const resize = useCallback(() => {
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    const body = doc.body;
    const next = Math.min(2400, Math.max(40, Math.ceil(Math.max(
      body?.scrollHeight || 0,
      body?.offsetHeight || 0,
    ))));
    setMeasuredHeight((current) => Math.abs(current - next) > 2 ? next : current);
  }, []);

  const connect = useCallback(() => {
    observer.current?.disconnect();
    const doc = frame.current?.contentDocument;
    if (!doc) return;
    resize();
    observer.current = new ResizeObserver(resize);
    if (doc.documentElement) observer.current.observe(doc.documentElement);
    if (doc.body) observer.current.observe(doc.body);
    doc.querySelectorAll('img,video,iframe').forEach((element) => {
      element.addEventListener('load', resize);
      element.addEventListener('loadedmetadata', resize);
    });
  }, [resize]);

  useEffect(() => {
    setMeasuredHeight(120);
    return () => observer.current?.disconnect();
  }, [compactSource]);

  const safeHeight = measuredHeight;
  return (
    <iframe
      ref={frame}
      data-previous-height={height || undefined}
      title="Intégration externe"
      srcDoc={compactSource}
      onLoad={connect}
      scrolling="no"
      sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-same-origin"
      className="block w-full border-0 bg-transparent"
      style={{ height: safeHeight }}
    />
  );
}
