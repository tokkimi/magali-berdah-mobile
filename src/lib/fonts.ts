// Font choices applied across a tenant site + editor preview.
export interface FontOption {
  id: string;
  label: string;
  stack: string;
  google?: string; // Google Fonts family query, e.g. "Poppins:wght@400;600;800"
}

export const FONTS: FontOption[] = [
  { id: 'sans', label: 'Moderne (Inter)', stack: "'Inter', ui-sans-serif, system-ui, sans-serif", google: 'Inter:wght@400;600;800' },
  { id: 'poppins', label: 'Arrondie (Poppins)', stack: "'Poppins', ui-sans-serif, system-ui, sans-serif", google: 'Poppins:wght@400;600;800' },
  { id: 'montserrat', label: 'Géométrique (Montserrat)', stack: "'Montserrat', ui-sans-serif, system-ui, sans-serif", google: 'Montserrat:wght@400;600;800' },
  { id: 'merriweather', label: 'Classique (Merriweather)', stack: "'Merriweather', Georgia, 'Times New Roman', serif", google: 'Merriweather:wght@400;700;900' },
  { id: 'playfair', label: 'Élégante (Playfair)', stack: "'Playfair Display', Georgia, serif", google: 'Playfair+Display:wght@400;600;800' },
  { id: 'system', label: 'Système (rapide)', stack: "ui-sans-serif, system-ui, 'Segoe UI', Roboto, sans-serif" },
];

export function fontById(id?: string): FontOption {
  return FONTS.find((f) => f.id === id) || FONTS[0];
}

export function googleFontsHref(id?: string): string | null {
  const f = fontById(id);
  if (!f.google) return null;
  return `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
}
