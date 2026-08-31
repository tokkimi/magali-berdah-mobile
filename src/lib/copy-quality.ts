import type { BuiltTemplate } from './templates';

type Lang = 'fr' | 'en';

function normalizeCopy(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value: string) {
  return new Set(normalizeCopy(value).split(' ').filter((word) => word.length > 3));
}

function similarity(a: string, b: string) {
  const ta = tokens(a);
  const tb = tokens(b);
  if (!ta.size || !tb.size) return 0;
  let common = 0;
  for (const word of ta) if (tb.has(word)) common += 1;
  return common / Math.min(ta.size, tb.size);
}

function isDuplicate(a: string, b: string) {
  const na = normalizeCopy(a);
  const nb = normalizeCopy(b);
  if (na.length < 90 || nb.length < 90) return false;
  return na === nb || similarity(a, b) >= 0.82;
}

function paragraphs(value = '') {
  return value
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function joinParagraphs(parts: string[]) {
  return parts.join('\n\n');
}

function dedupeText(value: string, seenParagraphs: string[]) {
  const kept: string[] = [];
  for (const paragraph of paragraphs(value)) {
    if (!seenParagraphs.some((seen) => isDuplicate(paragraph, seen))) {
      kept.push(paragraph);
      if (normalizeCopy(paragraph).length >= 90) seenParagraphs.push(paragraph);
    }
  }
  return joinParagraphs(kept);
}

export function removeGeneratedCopyDuplicates(template: BuiltTemplate, language: Lang = 'fr') {
  for (const page of template.pages || []) {
    const seenParagraphs: string[] = [];
    const seenBlocks: string[] = [];
    const nextBlocks: any[] = [];

    for (const block of page.blocks || []) {
      const content = block.content || {};
      const textValue = typeof content.text === 'string' ? content.text : '';

      if (textValue) {
        const nextText = dedupeText(textValue, seenParagraphs);
        const duplicateBlock = seenBlocks.some((seen) => isDuplicate(nextText, seen));

        // Drop a duplicate/emptied block entirely rather than injecting generic
        // templated filler in its place (that filler was meta-text about the
        // site that donors don't care about).
        if (!nextText || duplicateBlock) continue;

        content.text = nextText;
        const normalized = normalizeCopy(nextText);
        if (normalized.length >= 90) seenBlocks.push(nextText);
      }

      if (Array.isArray(content.items)) {
        content.items = content.items.map((item: any) => {
          if (typeof item.text !== 'string') return item;
          const cleaned = dedupeText(item.text, seenParagraphs);
          // Keep the original card text if dedup emptied it; never inject filler.
          return { ...item, text: cleaned || item.text };
        });
      }

      nextBlocks.push({ ...block, content });
    }

    page.blocks = nextBlocks.map((block, order) => ({ ...block, order }));
  }
  return template;
}
