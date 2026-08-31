"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Eye,
  Home,
  GripVertical,
  Type,
  Heading,
  Image as ImageIcon,
  Video,
  MousePointerClick,
  Share2,
  Columns,
  MoveVertical,
  Code,
  PanelTop,
  PanelBottom,
  Palette,
  Files,
  ChevronLeft,
  Check,
  GalleryThumbnails,
  PanelsTopLeft,
  GalleryHorizontalEnd,
  Images,
  LayoutGrid,
  Megaphone,
  SlidersHorizontal,
  X,
  Mail,
  HandCoins,
  ExternalLink,
  ShoppingBag,
  Music2,
  Youtube,
  Music,
  Instagram,
  ListMusic,
  Loader2,
  CalendarDays,
  CalendarRange,
  BarChart3,
} from "lucide-react";
import { BLOCK_LIBRARY, type BlockType, type ButtonConfig } from "@/lib/blocks";
import { PublicBlock } from "@/components/site/PublicBlock";
import { PublicHeader, PublicFooter } from "@/components/site/PublicChrome";
import { VielusosHero } from "@/components/site/VielusosHero";
import { VielusosBio } from "@/components/site/VielusosBio";
import { themeStyle, brandCss } from "@/lib/render";
import { VIELUSOS_BRAND, VIELUSOS_SITE_CSS } from "@/lib/vielusos";
import { googleFontsHref } from "@/lib/fonts";
import { ColorGrid, AlignPicker, Field, Toggle, ImageInput } from "./controls";

const ICONS: Record<string, any> = {
  Heading,
  Type,
  Image: ImageIcon,
  Video,
  MousePointerClick,
  Share2,
  Columns,
  MoveVertical,
  Code,
  GalleryThumbnails,
  PanelsTopLeft,
  GalleryHorizontalEnd,
  Images,
  LayoutGrid,
  Megaphone,
  Mail,
  HandCoins,
  ExternalLink,
  ShoppingBag,
  Music2,
  Youtube,
  Music,
  Instagram,
  ListMusic,
  CalendarDays,
  CalendarRange,
  BarChart3,
};

const CARD_ICON_CHOICES = [
  "Heart",
  "Users",
  "HandHeart",
  "HandCoins",
  "Star",
  "Gift",
  "Leaf",
  "Home",
  "BookOpen",
  "Shield",
  "Sparkles",
  "Handshake",
];

type Block = {
  id: string;
  type: string;
  order: number;
  content: any;
  style: any;
};
type Page = {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  showInNav: boolean;
  order: number;
  blocks: Block[];
};
type Site = {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  published: boolean;
  header: any;
  footer: any;
  theme: any;
  pages: Page[];
};

async function api(url: string, method: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).error || "Erreur");
  return res.json();
}

export function EditorClient({
  site: initial,
  canEdit,
  canPublish,
  siteUrl,
  branded = false,
}: {
  site: Site;
  canEdit: boolean;
  canPublish: boolean;
  siteUrl: string;
  branded?: boolean;
}) {
  const [pages, setPages] = useState<Page[]>(initial.pages);
  const [activeId, setActiveId] = useState<string>(initial.pages[0]?.id);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [tab, setTab] = useState<"blocks" | "header" | "footer" | "theme">(
    "blocks",
  );
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [header, setHeader] = useState(initial.header || {});
  const [footer, setFooter] = useState(initial.footer || {});
  const [published, setPublished] = useState(initial.published);
  const [saving, setSaving] = useState<string>("");
  const [showPalette, setShowPalette] = useState(false);
  const [mobileInspector, setMobileInspector] = useState(false);

  const active = pages.find((p) => p.id === activeId);
  const block = active?.blocks.find((b) => b.id === selectedBlock) || null;

  const flash = (m: string) => {
    setSaving(m);
    setTimeout(() => setSaving(""), 1200);
  };

  // ---- debounced site save (header/footer) ----
  const siteTimer = useRef<any>(undefined);
  const saveSite = useCallback((patch: any) => {
    clearTimeout(siteTimer.current);
    siteTimer.current = setTimeout(async () => {
      try {
        await api("/api/site", "PATCH", patch);
        flash("Enregistré");
      } catch {
        flash("Erreur");
      }
    }, 600);
  }, []);

  // ---- block operations ----
  const blockTimer = useRef<Record<string, any>>({});
  function patchBlockLocal(id: string, changes: Partial<Block>) {
    setPages((ps) =>
      ps.map((p) =>
        p.id !== activeId
          ? p
          : {
              ...p,
              blocks: p.blocks.map((b) =>
                b.id === id ? { ...b, ...changes } : b,
              ),
            },
      ),
    );
  }
  function saveBlock(id: string, data: { content?: any; style?: any }) {
    clearTimeout(blockTimer.current[id]);
    blockTimer.current[id] = setTimeout(async () => {
      try {
        await api(`/api/blocks/${id}`, "PATCH", data);
        flash("Enregistré");
      } catch {
        flash("Erreur");
      }
    }, 500);
  }
  function updateContent(id: string, content: any) {
    patchBlockLocal(id, { content });
    saveBlock(id, { content });
  }
  function updateStyle(id: string, style: any) {
    patchBlockLocal(id, { style });
    saveBlock(id, { style });
  }

  async function addBlock(type: BlockType) {
    const created = await api("/api/blocks", "POST", {
      pageId: activeId,
      type,
    });
    const artistDefaults: Partial<Record<BlockType, any>> = {
      banner: {
        title: "Nouveau projet",
        subtitle: "Présentez votre univers, une sortie ou une actualité.",
        button: {
          text: "Découvrir",
          href: "#",
          variant: "solid",
          color: VIELUSOS_BRAND.accent,
        },
      },
      cards: {
        title: "À découvrir",
        cards: [
          { title: "Musique", text: "Présentez vos dernières sorties." },
          { title: "Univers", text: "Partagez votre direction artistique." },
          { title: "Actualités", text: "Annoncez vos prochaines dates." },
        ],
      },
      cta: {
        title: "Suivez VIELUSOS",
        text: "Découvrez les dernières sorties et les prochaines dates.",
        button: {
          text: "Écouter",
          href: "#",
          variant: "solid",
          color: VIELUSOS_BRAND.accent,
        },
      },
      contact: {
        title: "Contact",
        intro: "Pour toute demande professionnelle, écrivez-nous.",
        email: "",
        phone: "",
        address: "",
        buttonText: "Envoyer",
      },
    };
    const adjusted =
      branded && artistDefaults[type]
        ? { ...created, content: artistDefaults[type] }
        : created;
    if (adjusted !== created)
      await api(`/api/blocks/${created.id}`, "PATCH", {
        content: adjusted.content,
      });
    setPages((ps) =>
      ps.map((p) =>
        p.id === activeId ? { ...p, blocks: [...p.blocks, adjusted] } : p,
      ),
    );
    setSelectedBlock(adjusted.id);
    setShowPalette(false);
    flash("Bloc ajouté");
  }
  async function deleteBlock(id: string) {
    setPages((ps) =>
      ps.map((p) =>
        p.id === activeId
          ? { ...p, blocks: p.blocks.filter((b) => b.id !== id) }
          : p,
      ),
    );
    setSelectedBlock(null);
    await api(`/api/blocks/${id}`, "DELETE").catch(() => {});
  }
  async function moveBlock(id: string, dir: -1 | 1) {
    if (!active) return;
    const idx = active.blocks.findIndex((b) => b.id === id);
    const to = idx + dir;
    if (to < 0 || to >= active.blocks.length) return;
    const arr = [...active.blocks];
    [arr[idx], arr[to]] = [arr[to], arr[idx]];
    setPages((ps) =>
      ps.map((p) => (p.id === activeId ? { ...p, blocks: arr } : p)),
    );
    await api("/api/blocks", "PATCH", {
      pageId: activeId,
      ids: arr.map((b) => b.id),
    }).catch(() => {});
  }

  // ---- page operations ----
  async function addPage() {
    const title = prompt("Nom de la nouvelle page ?", "Nouvelle page");
    if (!title) return;
    const created = await api("/api/pages", "POST", { title });
    setPages((ps) => [...ps, { ...created, blocks: [] }]);
    setActiveId(created.id);
    setSelectedBlock(null);
  }
  async function renamePage(id: string) {
    const p = pages.find((x) => x.id === id);
    const title = prompt("Renommer la page", p?.title);
    if (!title) return;
    const updated = await api(`/api/pages/${id}`, "PATCH", { title });
    setPages((ps) =>
      ps.map((x) => (x.id === id ? { ...x, title: updated.title } : x)),
    );
  }
  async function deletePage(id: string) {
    const p = pages.find((x) => x.id === id);
    if (p?.isHome) {
      alert("Impossible de supprimer la page d’accueil.");
      return;
    }
    if (!confirm(`Supprimer la page “${p?.title}” ?`)) return;
    setPages((ps) => ps.filter((x) => x.id !== id));
    if (activeId === id) setActiveId(pages.find((x) => x.id !== id)!.id);
    await api(`/api/pages/${id}`, "DELETE").catch(() => {});
  }
  async function setHome(id: string) {
    setPages((ps) => ps.map((x) => ({ ...x, isHome: x.id === id })));
    await api(`/api/pages/${id}`, "PATCH", { setHome: true }).catch(() => {});
  }
  async function toggleNav(id: string, showInNav: boolean) {
    setPages((ps) => ps.map((x) => (x.id === id ? { ...x, showInNav } : x)));
    await api(`/api/pages/${id}`, "PATCH", { showInNav }).catch(() => {});
  }

  async function togglePublish() {
    const next = !published;
    setPublished(next);
    await api("/api/site", "PATCH", { published: next }).catch(() =>
      setPublished(!next),
    );
    flash(next ? "Site publié" : "Site dépublié");
  }

  const width = device === "mobile" ? 390 : 900;

  const fontHref = googleFontsHref((initial.theme as any)?.font);
  const previewHeader = branded
    ? {
        ...header,
        logoUrl: VIELUSOS_BRAND.logoUrl,
        logoText: initial.name.toUpperCase(),
        background: VIELUSOS_BRAND.surface,
        textColor: "#f7f7fb",
      }
    : header;
  const previewFooter = branded
    ? {
        ...footer,
        logoUrl: VIELUSOS_BRAND.logoUrl,
        logoText: initial.name.toUpperCase(),
        background: VIELUSOS_BRAND.surface,
        textColor: "#f7f7fb",
      }
    : footer;

  return (
    <div className="vielusos-editor-surface fixed inset-0 z-30 flex flex-col bg-gray-100 lg:left-64">
      {fontHref && <link rel="stylesheet" href={fontHref} />}
      {branded && (
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Montserrat:wght@300;400;500&display=swap"
        />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `${brandCss((initial.theme as any)?.primary)}${branded ? VIELUSOS_SITE_CSS : ""}`,
        }}
      />
      {/* Top bar */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-2 py-2 sm:px-3">
        <a
          href="/dashboard"
          className="touch-target flex shrink-0 items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />{" "}
          <span className="hidden sm:inline">Tableau de bord</span>
        </a>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              {saving}
            </span>
          )}
          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => setDevice("desktop")}
              className={`rounded p-1.5 ${device === "desktop" ? "bg-gray-900 text-white" : "text-gray-500"}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`rounded p-1.5 ${device === "mobile" ? "bg-gray-900 text-white" : "text-gray-500"}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost !py-1.5 text-sm"
          >
            <Eye className="h-4 w-4" /> Aperçu
          </a>
          {canPublish && (
            <button
              onClick={togglePublish}
              className={`btn !py-1.5 text-sm ${published ? "btn-ghost" : "btn-primary"}`}
            >
              {published ? "En ligne ✓" : "Publier"}
            </button>
          )}
        </div>
      </div>

      {/* Phone controls: pages and the three parts of the site stay reachable without a computer. */}
      <div className="flex gap-2 overflow-x-auto border-b border-gray-200 bg-white p-2 md:hidden">
        <select
          aria-label="Page à modifier"
          value={activeId}
          onChange={(e) => {
            setActiveId(e.target.value);
            setSelectedBlock(null);
            setTab("blocks");
          }}
          className="input min-w-[150px] flex-1"
        >
          {pages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.isHome ? "⌂ " : ""}
              {p.title}
            </option>
          ))}
        </select>
        {canEdit && (
          <button
            onClick={addPage}
            className="touch-target shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-brand-700"
            aria-label="Ajouter une page"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => {
            setTab("header");
            setSelectedBlock(null);
            setMobileInspector(true);
          }}
          className="touch-target shrink-0 rounded-lg border border-gray-200 bg-white px-3"
          aria-label="Modifier l’en-tête"
        >
          <PanelTop className="h-5 w-5" />
        </button>
        <button
          onClick={() => {
            setTab("footer");
            setSelectedBlock(null);
            setMobileInspector(true);
          }}
          className="touch-target shrink-0 rounded-lg border border-gray-200 bg-white px-3"
          aria-label="Modifier le pied de page"
        >
          <PanelBottom className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: pages */}
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 md:block">
          <div className="mb-4">
            <span className="flex items-center gap-2 font-extrabold text-gray-900">
              <Files className="h-5 w-5 text-brand-600" /> Les pages du site
            </span>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Choisissez une page ci-dessous, puis cliquez directement sur son
              contenu pour le modifier.
            </p>
            {canEdit && (
              <button onClick={addPage} className="btn btn-primary mt-3 w-full">
                <Plus className="h-4 w-4" /> Nouvelle page
              </button>
            )}
          </div>
          <ul className="space-y-2">
            {pages.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => {
                    setActiveId(p.id);
                    setSelectedBlock(null);
                    setTab("blocks");
                  }}
                  className={`group flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${activeId === p.id && tab === "blocks" ? "border-brand-300 bg-brand-50 text-brand-700 shadow-sm" : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  {p.isHome && <Home className="h-3.5 w-3.5 shrink-0" />}
                  <span className="flex-1 truncate">{p.title}</span>
                  {activeId === p.id && tab === "blocks" && (
                    <Check className="h-4 w-4 text-brand-600" />
                  )}
                </button>
                {activeId === p.id && canEdit && (
                  <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-gray-50 p-2 text-xs">
                    <button
                      onClick={() => renamePage(p.id)}
                      className="rounded-lg bg-white px-2 py-2 text-gray-700 ring-1 ring-gray-200"
                    >
                      Renommer
                    </button>
                    {!p.isHome && (
                      <button
                        onClick={() => setHome(p.id)}
                        className="rounded-lg bg-white px-2 py-2 text-gray-700 ring-1 ring-gray-200"
                      >
                        Définir accueil
                      </button>
                    )}
                    {!p.isHome && (
                      <button
                        onClick={() => deletePage(p.id)}
                        className="rounded-lg bg-white px-2 py-2 text-red-600 ring-1 ring-gray-200"
                      >
                        Supprimer
                      </button>
                    )}
                    <label className="flex items-center justify-center gap-2 rounded-lg bg-white px-2 py-2 text-gray-700 ring-1 ring-gray-200">
                      <input
                        type="checkbox"
                        checked={p.showInNav}
                        onChange={(e) => toggleNav(p.id, e.target.checked)}
                      />{" "}
                      Dans le menu
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-gray-200 pt-5">
            <span className="mb-2 block font-extrabold text-gray-900">
              Éléments communs
            </span>
            <button
              onClick={() => {
                setTab("header");
                setSelectedBlock(null);
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold ${tab === "header" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <PanelTop className="h-5 w-5" /> En-tête du site
            </button>
            <button
              onClick={() => {
                setTab("footer");
                setSelectedBlock(null);
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-sm font-semibold ${tab === "footer" ? "border-brand-300 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-700 hover:bg-gray-50"}`}
            >
              <PanelBottom className="h-5 w-5" /> Pied de page
            </button>
          </div>
        </aside>

        {/* Center: canvas */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-1.5 sm:p-4">
          <div className="mx-auto mb-3 flex max-w-[900px] flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-200">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                Vous modifiez
              </p>
              <p className="font-extrabold text-gray-900">
                {tab === "header"
                  ? "L’en-tête du site"
                  : tab === "footer"
                    ? "Le pied de page"
                    : `La page « ${active?.title || ""} »`}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Touchez ou cliquez sur un élément pour ouvrir ses réglages.
            </p>
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-xl shadow-sm ring-1 ring-gray-200 transition-all ${branded ? "vielusos-site" : ""}`}
            style={{
              maxWidth: width,
              ...themeStyle(initial.theme),
              ...(branded
                ? {
                    backgroundColor: VIELUSOS_BRAND.surface,
                    backgroundImage: `linear-gradient(rgba(8,8,12,.72),rgba(8,8,12,.72)),url(${VIELUSOS_BRAND.backgroundUrl})`,
                    backgroundSize: "cover",
                    color: "#f7f7fb",
                  }
                : {}),
            }}
          >
            {/* Live header preview (click to edit) */}
            <div
              onClick={() => {
                setTab("header");
                setSelectedBlock(null);
                setMobileInspector(true);
              }}
              className={`cursor-pointer ${tab === "header" ? "ring-2 ring-brand-500" : "hover:ring-1 hover:ring-brand-200"}`}
            >
              <div className="pointer-events-none">
                <PublicHeader
                  header={previewHeader as any}
                  nav={pages
                    .filter((p) => p.showInNav)
                    .map((p) => ({
                      title: p.title,
                      slug: p.slug,
                      isHome: p.isHome,
                    }))}
                  basePath="#"
                />
              </div>
            </div>
            {branded && active?.isHome && (
              <VielusosHero title={initial.name} config={header.vielusosHero} />
            )}
            <main className="flex-1 py-8">
              {branded &&
              active &&
              ["bio", "about", "a-propos"].includes(active.slug) ? (
                <div
                  onClick={() => {
                    setTab("header");
                    setSelectedBlock(null);
                    setMobileInspector(true);
                  }}
                  className="cursor-pointer hover:ring-1 hover:ring-brand-200"
                >
                  <VielusosBio
                    blocks={active.blocks}
                    config={header.vielusosBio}
                  />
                </div>
              ) : (
                <>
                  {active?.blocks.length === 0 && (
                    <div className="py-16 text-center text-gray-400">
                      <p>Page vide.</p>
                      {canEdit && (
                        <button
                          onClick={() => setShowPalette(true)}
                          className="btn btn-primary mt-4 mx-auto"
                        >
                          Ajouter un bloc
                        </button>
                      )}
                    </div>
                  )}
                  {active?.blocks.map((b, i) => (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (canEdit) {
                          setSelectedBlock(b.id);
                          setTab("blocks");
                          setMobileInspector(true);
                        }
                      }}
                      className={`group relative cursor-pointer ${selectedBlock === b.id ? "ring-2 ring-brand-500" : "hover:ring-1 hover:ring-brand-200"}`}
                    >
                      <PublicBlock
                        type={b.type}
                        content={b.content}
                        style={b.style}
                        basePath="#"
                        organizationId={(initial as any).organizationId}
                      />
                      {canEdit && selectedBlock === b.id && (
                        <div className="absolute right-2 top-2 flex gap-1 rounded-lg bg-gray-900/90 p-1 text-white">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(b.id, -1);
                            }}
                            disabled={i === 0}
                            className="rounded p-1 hover:bg-white/20 disabled:opacity-30"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveBlock(b.id, 1);
                            }}
                            disabled={i === active.blocks.length - 1}
                            className="rounded p-1 hover:bg-white/20 disabled:opacity-30"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBlock(b.id);
                            }}
                            className="rounded p-1 hover:bg-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {canEdit && active && active.blocks.length > 0 && (
                    <div className="border-t border-dashed border-gray-200 p-3 text-center">
                      <button
                        onClick={() => setShowPalette(true)}
                        className="btn btn-ghost mx-auto text-sm"
                      >
                        <Plus className="h-4 w-4" /> Ajouter un bloc
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
            {/* Live footer preview (click to edit) */}
            <div
              onClick={() => {
                setTab("footer");
                setSelectedBlock(null);
                setMobileInspector(true);
              }}
              className={`cursor-pointer ${tab === "footer" ? "ring-2 ring-brand-500" : "hover:ring-1 hover:ring-brand-200"}`}
            >
              <div className="pointer-events-none">
                <PublicFooter
                  footer={previewFooter as any}
                  orgId={(initial as any).organizationId || "preview"}
                  basePath="#"
                  nav={pages
                    .filter((p) => p.showInNav)
                    .map((p) => ({
                      title: p.title,
                      slug: p.slug,
                      isHome: p.isHome,
                    }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: inspector */}
        {canEdit && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-4 lg:block">
            {tab === "blocks" && block && (
              <BlockInspector
                block={block}
                branded={branded}
                onContent={(c) => updateContent(block.id, c)}
                onStyle={(s) => updateStyle(block.id, s)}
                onDelete={() => deleteBlock(block.id)}
              />
            )}
            {tab === "blocks" && !block && (
              <div className="text-sm text-gray-500">
                <p className="font-medium text-gray-700">
                  Sélectionnez un bloc
                </p>
                <p className="mt-1">
                  Cliquez sur un élément de la page pour le modifier, ou
                  ajoutez-en un nouveau.
                </p>
                <button
                  onClick={() => setShowPalette(true)}
                  className="btn btn-primary mt-4 w-full"
                >
                  <Plus className="h-4 w-4" /> Ajouter un bloc
                </button>
              </div>
            )}
            {tab === "header" && (
              <HeaderEditor
                value={header}
                branded={branded}
                onChange={(h) => {
                  setHeader(h);
                  saveSite({ header: h });
                }}
              />
            )}
            {tab === "footer" && (
              <FooterEditor
                value={footer}
                pages={pages}
                branded={branded}
                onChange={(f) => {
                  setFooter(f);
                  saveSite({ footer: f });
                }}
              />
            )}
          </aside>
        )}
      </div>

      {/* Touch inspector: a scrollable bottom sheet replaces the desktop side panel. */}
      {canEdit && mobileInspector && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Options de modification"
        >
          <button
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileInspector(false)}
            aria-label="Fermer les options"
          />
          <aside className="absolute inset-x-0 bottom-0 max-h-[72dvh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
            <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-gray-100 bg-white pb-3">
              <span className="flex items-center gap-2 font-bold text-gray-900">
                <SlidersHorizontal className="h-5 w-5 text-brand-600" />{" "}
                Modifier
              </span>
              <button
                onClick={() => setMobileInspector(false)}
                className="touch-target grid place-items-center rounded-lg bg-gray-100"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {tab === "blocks" && block && (
              <BlockInspector
                block={block}
                branded={branded}
                onContent={(c) => updateContent(block.id, c)}
                onStyle={(s) => updateStyle(block.id, s)}
                onDelete={() => {
                  deleteBlock(block.id);
                  setMobileInspector(false);
                }}
              />
            )}
            {tab === "blocks" && !block && (
              <div className="text-sm text-gray-600">
                <p>Sélectionnez une partie de la page ou ajoutez un bloc.</p>
                <button
                  onClick={() => {
                    setMobileInspector(false);
                    setShowPalette(true);
                  }}
                  className="btn btn-primary mt-4 w-full"
                >
                  <Plus className="h-4 w-4" /> Ajouter un bloc
                </button>
              </div>
            )}
            {tab === "header" && (
              <HeaderEditor
                value={header}
                branded={branded}
                onChange={(h) => {
                  setHeader(h);
                  saveSite({ header: h });
                }}
              />
            )}
            {tab === "footer" && (
              <FooterEditor
                value={footer}
                pages={pages}
                branded={branded}
                onChange={(f) => {
                  setFooter(f);
                  saveSite({ footer: f });
                }}
              />
            )}
          </aside>
        </div>
      )}

      {/* Block palette modal */}
      {showPalette && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 font-bold text-gray-900">Ajouter un bloc</h3>
            <p className="mb-4 text-sm text-gray-500">
              Choisissez une mise en page prête à l’emploi, puis remplacez le
              texte et les photos.
            </p>

            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-600">
              Essentiels
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BLOCK_LIBRARY.filter((b) =>
                branded
                  ? b.type === "contact"
                  : b.type === "donation" || b.type === "contact",
              ).map((b) => {
                const Icon = ICONS[b.icon] || Type;
                return (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="flex items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-left hover:border-brand-500 hover:bg-brand-100"
                  >
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
                    <span>
                      <span className="block text-sm font-extrabold text-gray-900">
                        {b.label}
                      </span>
                      <span className="block text-xs text-gray-600">
                        {b.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-brand-600">
              Mises en page prêtes
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOCK_LIBRARY.filter(
                (b) =>
                  b.group === "layouts" &&
                  b.type !== "donation" &&
                  b.type !== "contact" &&
                  (!branded || b.type !== "leetchi"),
              ).map((b) => {
                const Icon = ICONS[b.icon] || Type;
                return (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50"
                  >
                    <Icon className="h-5 w-5 text-brand-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {b.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {b.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wide text-gray-400">
              Blocs simples
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BLOCK_LIBRARY.filter(
                (b) =>
                  b.group === "basics" &&
                  (!branded || (b.type !== "donation" && b.type !== "leetchi")),
              ).map((b) => {
                const Icon = ICONS[b.icon] || Type;
                return (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className="flex flex-col items-start gap-1 rounded-xl border border-gray-200 p-3 text-left hover:border-brand-400 hover:bg-brand-50"
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {b.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {b.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------- Block inspector -------------------------
function BlockInspector({
  block,
  branded = false,
  onContent,
  onStyle,
  onDelete,
}: {
  block: Block;
  branded?: boolean;
  onContent: (c: any) => void;
  onStyle: (s: any) => void;
  onDelete: () => void;
}) {
  const c = block.content || {};
  const s = block.style || {};
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold capitalize text-gray-900">
          {BLOCK_LIBRARY.find((b) => b.type === block.type)?.label ||
            block.type}
        </h3>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {(block.type === "heading" || block.type === "text") && (
        <>
          <Field label="Texte">
            <textarea
              className="input min-h-[90px]"
              value={c.text || ""}
              onChange={(e) => onContent({ ...c, text: e.target.value })}
            />
          </Field>
          <Field label="Alignement">
            <AlignPicker
              value={s.align}
              onChange={(a) => onStyle({ ...s, align: a })}
            />
          </Field>
          <Field label="Taille du texte">
            <input
              type="range"
              min={12}
              max={64}
              value={s.fontSize || 20}
              onChange={(e) => onStyle({ ...s, fontSize: +e.target.value })}
              className="w-full"
            />
          </Field>
          <Field label="Couleur du texte">
            <ColorGrid
              value={s.color}
              onChange={(col) => onStyle({ ...s, color: col })}
            />
          </Field>
        </>
      )}

      {block.type === "image" && (
        <>
          <ImageInput
            label="Image"
            value={c.url}
            onChange={(url) => onContent({ ...c, url })}
          />
          <Field label="Texte alternatif">
            <input
              className="input"
              value={c.alt || ""}
              onChange={(e) => onContent({ ...c, alt: e.target.value })}
            />
          </Field>
          <Field label="Légende">
            <input
              className="input"
              value={c.caption || ""}
              onChange={(e) => onContent({ ...c, caption: e.target.value })}
            />
          </Field>
          <Field label="Alignement">
            <AlignPicker
              value={s.align}
              onChange={(a) => onStyle({ ...s, align: a })}
            />
          </Field>
        </>
      )}

      {block.type === "video" && (
        <Field label="Lien vidéo (YouTube, Vimeo…)">
          <input
            className="input"
            placeholder="https://youtube.com/…"
            value={c.url || ""}
            onChange={(e) => onContent({ ...c, url: e.target.value })}
          />
        </Field>
      )}

      {block.type === "button" && (
        <ButtonEditor
          value={c.button}
          onChange={(b) => onContent({ ...c, button: b })}
        />
      )}

      {block.type === "social" && (
        <SocialEditor
          value={c.social}
          onChange={(soc) => onContent({ ...c, social: soc })}
        />
      )}

      {block.type === "contact" && (
        <>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Introduction">
            <textarea
              className="input min-h-20"
              value={c.intro || ""}
              onChange={(e) => onContent({ ...c, intro: e.target.value })}
            />
          </Field>
          <Field label={branded ? "E-mail public" : "E-mail de l’association"}>
            <input
              className="input"
              type="email"
              value={c.email || ""}
              onChange={(e) => onContent({ ...c, email: e.target.value })}
            />
          </Field>
          <Field label="Téléphone">
            <input
              className="input"
              value={c.phone || ""}
              onChange={(e) => onContent({ ...c, phone: e.target.value })}
            />
          </Field>
          <Field label="Adresse">
            <textarea
              className="input min-h-20"
              value={c.address || ""}
              onChange={(e) => onContent({ ...c, address: e.target.value })}
            />
          </Field>
          <Field label="Texte du bouton">
            <input
              className="input"
              value={c.buttonText || ""}
              onChange={(e) => onContent({ ...c, buttonText: e.target.value })}
            />
          </Field>
        </>
      )}

      {!branded && block.type === "donation" && (
        <>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Introduction">
            <textarea
              className="input min-h-20"
              value={c.intro || ""}
              onChange={(e) => onContent({ ...c, intro: e.target.value })}
            />
          </Field>
          <Toggle
            label="Carte bancaire / Stripe"
            checked={!!c.cardEnabled}
            onChange={(cardEnabled) => onContent({ ...c, cardEnabled })}
          />
          {c.cardEnabled && (
            <Field label="Lien Stripe">
              <input
                className="input"
                type="url"
                value={c.stripeUrl || ""}
                onChange={(e) => onContent({ ...c, stripeUrl: e.target.value })}
              />
            </Field>
          )}
          <Toggle
            label="HelloAsso"
            checked={c.helloAssoEnabled ?? !!c.helloAssoUrl}
            onChange={(helloAssoEnabled) =>
              onContent({ ...c, helloAssoEnabled })
            }
          />
          {(c.helloAssoEnabled ?? !!c.helloAssoUrl) && (
            <Field label="Lien HelloAsso">
              <input
                className="input"
                type="url"
                value={c.helloAssoUrl || ""}
                onChange={(e) =>
                  onContent({ ...c, helloAssoUrl: e.target.value })
                }
              />
            </Field>
          )}
          <Toggle
            label="Virement bancaire"
            checked={!!c.transferEnabled}
            onChange={(transferEnabled) => onContent({ ...c, transferEnabled })}
          />
          {c.transferEnabled && (
            <>
              <Field label="IBAN">
                <input
                  className="input font-mono"
                  value={c.iban || ""}
                  onChange={(e) => onContent({ ...c, iban: e.target.value })}
                />
              </Field>
              <Field label="BIC / SWIFT">
                <input
                  className="input font-mono"
                  value={c.bic || ""}
                  onChange={(e) => onContent({ ...c, bic: e.target.value })}
                />
              </Field>
              <Field label="Titulaire du compte">
                <input
                  className="input"
                  value={c.accountHolder || ""}
                  onChange={(e) =>
                    onContent({ ...c, accountHolder: e.target.value })
                  }
                />
              </Field>
            </>
          )}
          <Toggle
            label="Chèque"
            checked={!!c.chequeEnabled}
            onChange={(chequeEnabled) => onContent({ ...c, chequeEnabled })}
          />
          {c.chequeEnabled && (
            <>
              <Field label="Ordre du chèque">
                <input
                  className="input"
                  value={c.chequePayable || ""}
                  onChange={(e) =>
                    onContent({ ...c, chequePayable: e.target.value })
                  }
                />
              </Field>
              <Field label="Adresse d’envoi">
                <textarea
                  className="input min-h-20"
                  value={c.chequeAddress || ""}
                  onChange={(e) =>
                    onContent({ ...c, chequeAddress: e.target.value })
                  }
                />
              </Field>
            </>
          )}
        </>
      )}

      {!branded && block.type === "leetchi" && (
        <>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Introduction">
            <textarea
              className="input min-h-20"
              value={c.intro || ""}
              onChange={(e) => onContent({ ...c, intro: e.target.value })}
            />
          </Field>
          <Field label="Lien de la cagnotte Leetchi">
            <input
              className="input"
              type="url"
              value={c.url || ""}
              onChange={(e) => onContent({ ...c, url: e.target.value })}
              placeholder="https://www.leetchi.com/..."
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Montant collecté (€)">
              <input
                className="input"
                type="number"
                min="0"
                value={c.collectedEuros || ""}
                onChange={(e) =>
                  onContent({ ...c, collectedEuros: e.target.value })
                }
              />
            </Field>
            <Field label="Objectif (€)">
              <input
                className="input"
                type="number"
                min="0"
                value={c.goalEuros || ""}
                onChange={(e) => onContent({ ...c, goalEuros: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Lien iframe Leetchi (optionnel)">
            <input
              className="input"
              type="url"
              value={c.embedUrl || ""}
              onChange={(e) => onContent({ ...c, embedUrl: e.target.value })}
            />
          </Field>
          <Field label="Code iframe Leetchi (optionnel)">
            <textarea
              className="input min-h-24 font-mono text-xs"
              value={c.embedCode || ""}
              onChange={(e) => onContent({ ...c, embedCode: e.target.value })}
              placeholder="<iframe ...></iframe>"
            />
          </Field>
          <Field label="Texte du bouton">
            <input
              className="input"
              value={c.buttonText || ""}
              onChange={(e) => onContent({ ...c, buttonText: e.target.value })}
            />
          </Field>
        </>
      )}

      {block.type === "tracks" && <TracksEditor c={c} onContent={onContent} />}
      {block.type === "videos" && <VideosEditor c={c} onContent={onContent} />}
      {block.type === "streaming" && (
        <StreamingEditor c={c} onContent={onContent} />
      )}
      {block.type === "players" && (
        <PlayersEditor c={c} onContent={onContent} />
      )}
      {block.type === "instagram" && (
        <InstagramEditor c={c} onContent={onContent} />
      )}

      {block.type === "columns" && (
        <>
          <Field label="Nombre de colonnes">
            <select
              className="input"
              value={(c.columns || []).length}
              onChange={(e) => {
                const n = +e.target.value;
                const cur = c.columns || [];
                const next = Array.from(
                  { length: n },
                  (_, i) => cur[i] ?? `Colonne ${i + 1}`,
                );
                onContent({ ...c, columns: next });
              }}
            >
              <option value={2}>2 colonnes</option>
              <option value={3}>3 colonnes</option>
            </select>
          </Field>
          {(c.columns || []).map((col: string, i: number) => (
            <Field key={i} label={`Colonne ${i + 1}`}>
              <textarea
                className="input min-h-[70px]"
                value={col}
                onChange={(e) => {
                  const next = [...c.columns];
                  next[i] = e.target.value;
                  onContent({ ...c, columns: next });
                }}
              />
            </Field>
          ))}
        </>
      )}

      {block.type === "spacer" && (
        <Field label={`Hauteur : ${c.height || 40}px`}>
          <input
            type="range"
            min={10}
            max={200}
            value={c.height || 40}
            onChange={(e) => onContent({ ...c, height: +e.target.value })}
            className="w-full"
          />
        </Field>
      )}

      {block.type === "html" && (
        <Field label="Code HTML / intégration (HelloAsso, carte…)">
          <textarea
            className="input min-h-[140px] font-mono text-xs"
            value={c.html || ""}
            onChange={(e) => onContent({ ...c, html: e.target.value })}
          />
        </Field>
      )}

      {block.type === "event" && (
        <>
          <Field label="Petit titre">
            <input
              className="input"
              value={c.eyebrow || ""}
              onChange={(e) => onContent({ ...c, eyebrow: e.target.value })}
              placeholder="Live"
            />
          </Field>
          <Field label="Grand titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
              placeholder="Next date"
            />
          </Field>
          <ImageInput
            label="Affiche de l’événement"
            value={c.image}
            onChange={(image) => onContent({ ...c, image })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jour">
              <input
                className="input"
                value={c.day || ""}
                onChange={(e) => onContent({ ...c, day: e.target.value })}
              />
            </Field>
            <Field label="Mois / année">
              <input
                className="input"
                value={c.month || ""}
                onChange={(e) => onContent({ ...c, month: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Nom de l’événement">
            <input
              className="input"
              value={c.eventName || ""}
              onChange={(e) => onContent({ ...c, eventName: e.target.value })}
            />
          </Field>
          <Field label="Lieu">
            <input
              className="input"
              value={c.venue || ""}
              onChange={(e) => onContent({ ...c, venue: e.target.value })}
            />
          </Field>
          <Field label="Ville">
            <input
              className="input"
              value={c.city || ""}
              onChange={(e) => onContent({ ...c, city: e.target.value })}
            />
          </Field>
          <Field label="Horaire / artiste">
            <input
              className="input"
              value={c.time || ""}
              onChange={(e) => onContent({ ...c, time: e.target.value })}
            />
          </Field>
          <Field label="Texte du bouton">
            <input
              className="input"
              value={c.buttonText || ""}
              onChange={(e) => onContent({ ...c, buttonText: e.target.value })}
            />
          </Field>
          <Field label="Lien billetterie">
            <input
              className="input"
              type="url"
              value={c.buttonUrl || ""}
              onChange={(e) => onContent({ ...c, buttonUrl: e.target.value })}
            />
          </Field>
        </>
      )}

      {block.type === "stats" && (
        <>
          <Field label="Petit titre">
            <input
              className="input"
              value={c.eyebrow || ""}
              onChange={(e) => onContent({ ...c, eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Introduction">
            <input
              className="input"
              value={c.intro || ""}
              onChange={(e) => onContent({ ...c, intro: e.target.value })}
            />
          </Field>
          {(c.items || []).map((item: any, index: number) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-gray-200 p-3"
            >
              <input
                className="input"
                value={item.value || ""}
                onChange={(e) => {
                  const items = [...c.items];
                  items[index] = { ...item, value: e.target.value };
                  onContent({ ...c, items });
                }}
                placeholder="3.5M+"
              />
              <input
                className="input"
                value={item.label || ""}
                onChange={(e) => {
                  const items = [...c.items];
                  items[index] = { ...item, label: e.target.value };
                  onContent({ ...c, items });
                }}
                placeholder="Streams Spotify"
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    items: c.items.filter((_: any, i: number) => i !== index),
                  })
                }
                className="text-xs text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onContent({
                ...c,
                items: [...(c.items || []), { value: "", label: "" }],
              })
            }
            className="btn btn-ghost w-full text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter un chiffre
          </button>
          <Field label="Plateformes">
            <input
              className="input"
              value={c.platforms || ""}
              onChange={(e) => onContent({ ...c, platforms: e.target.value })}
            />
          </Field>
        </>
      )}

      {block.type === "events" && (
        <>
          <Field label="Petit titre">
            <input
              className="input"
              value={c.eyebrow || ""}
              onChange={(e) => onContent({ ...c, eyebrow: e.target.value })}
            />
          </Field>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          {(c.items || []).map((item: any, index: number) => (
            <div
              key={index}
              className="space-y-2 rounded-xl border border-gray-200 p-3"
            >
              <input
                className="input"
                value={item.date || ""}
                onChange={(e) => {
                  const items = [...c.items];
                  items[index] = { ...item, date: e.target.value };
                  onContent({ ...c, items });
                }}
                placeholder="February 27, 2026"
              />
              <input
                className="input"
                value={item.name || ""}
                onChange={(e) => {
                  const items = [...c.items];
                  items[index] = { ...item, name: e.target.value };
                  onContent({ ...c, items });
                }}
                placeholder="Nom de l’événement"
              />
              <input
                className="input"
                value={item.location || ""}
                onChange={(e) => {
                  const items = [...c.items];
                  items[index] = { ...item, location: e.target.value };
                  onContent({ ...c, items });
                }}
                placeholder="Lieu"
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    items: c.items.filter((_: any, i: number) => i !== index),
                  })
                }
                className="text-xs text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onContent({
                ...c,
                items: [
                  ...(c.items || []),
                  { date: "", name: "", location: "" },
                ],
              })
            }
            className="btn btn-ghost w-full text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter une date
          </button>
        </>
      )}

      {block.type === "banner" && (
        <>
          {!branded && (
            <Field label="Type de fond">
              <select
                className="input"
                value={c.backgroundType || "image"}
                onChange={(e) =>
                  onContent({ ...c, backgroundType: e.target.value })
                }
              >
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
              </select>
            </Field>
          )}
          {(c.backgroundType || "image") === "video" && !branded ? (
            <Field label="Vidéo de fond (URL MP4/WebM)">
              <input
                className="input"
                type="url"
                value={c.videoUrl || ""}
                onChange={(e) => onContent({ ...c, videoUrl: e.target.value })}
                placeholder="https://…/video.mp4"
              />
              <p className="mt-1 text-xs text-gray-500">
                La vidéo est lue automatiquement, en boucle et sans son.
              </p>
            </Field>
          ) : (
            <ImageInput
              label="Photo de fond"
              value={c.image}
              onChange={(image) => onContent({ ...c, image })}
            />
          )}
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Sous-titre">
            <textarea
              className="input"
              value={c.subtitle || ""}
              onChange={(e) => onContent({ ...c, subtitle: e.target.value })}
            />
          </Field>
          {!branded && (
            <>
              <ImageInput
                label="Image superposée (logo, visuel, optionnel)"
                value={c.foregroundImage || ""}
                onChange={(foregroundImage) =>
                  onContent({ ...c, foregroundImage })
                }
                kind="logo"
              />
              {c.foregroundImage && (
                <Field
                  label={`Largeur de l’image superposée : ${c.foregroundImageWidth || 180}px`}
                >
                  <input
                    type="range"
                    min={48}
                    max={520}
                    value={c.foregroundImageWidth || 180}
                    onChange={(e) =>
                      onContent({ ...c, foregroundImageWidth: +e.target.value })
                    }
                    className="w-full"
                  />
                </Field>
              )}
              <Field label="Position du contenu">
                <select
                  className="input"
                  value={c.contentPosition || "center"}
                  onChange={(e) =>
                    onContent({ ...c, contentPosition: e.target.value })
                  }
                >
                  <option value="top-left">Haut gauche</option>
                  <option value="top-center">Haut centre</option>
                  <option value="top-right">Haut droite</option>
                  <option value="center-left">Milieu gauche</option>
                  <option value="center">Milieu centre</option>
                  <option value="center-right">Milieu droite</option>
                  <option value="bottom-left">Bas gauche</option>
                  <option value="bottom-center">Bas centre</option>
                  <option value="bottom-right">Bas droite</option>
                </select>
              </Field>
              <Field label="Alignement du texte">
                <AlignPicker
                  value={c.textAlign || "center"}
                  onChange={(textAlign) => onContent({ ...c, textAlign })}
                />
              </Field>
              <Field label={`Largeur du contenu : ${c.contentWidth || 720}px`}>
                <input
                  type="range"
                  min={280}
                  max={1100}
                  step={20}
                  value={c.contentWidth || 720}
                  onChange={(e) =>
                    onContent({ ...c, contentWidth: +e.target.value })
                  }
                  className="w-full"
                />
              </Field>
            </>
          )}
          <Field label={`Hauteur : ${c.height || 460}px`}>
            <input
              type="range"
              min={240}
              max={720}
              value={c.height || 460}
              onChange={(e) => onContent({ ...c, height: +e.target.value })}
              className="w-full"
            />
          </Field>
          <Field label={`Assombrir la photo : ${c.overlay ?? 45}%`}>
            <input
              type="range"
              min={0}
              max={80}
              value={c.overlay ?? 45}
              onChange={(e) => onContent({ ...c, overlay: +e.target.value })}
              className="w-full"
            />
          </Field>
          <div className="border-t border-gray-100 pt-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Bouton</p>
            <ButtonEditor
              value={c.button}
              onChange={(button) => onContent({ ...c, button })}
            />
          </div>
          {!branded && (
            <div className="border-t border-gray-100 pt-3">
              <p className="mb-2 text-sm font-semibold text-gray-700">
                Deuxième bouton (optionnel)
              </p>
              <ButtonEditor
                value={c.button2}
                onChange={(button2) => onContent({ ...c, button2 })}
              />
            </div>
          )}
        </>
      )}

      {block.type === "textimage" && (
        <>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Texte">
            <textarea
              className="input min-h-[110px]"
              value={c.text || ""}
              onChange={(e) => onContent({ ...c, text: e.target.value })}
            />
          </Field>
          <ImageInput
            label="Image"
            value={c.image}
            onChange={(image) => onContent({ ...c, image })}
          />
          <Field label="Position de l’image">
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
              <button
                type="button"
                onClick={() => onContent({ ...c, imageSide: "left" })}
                className={`rounded-md px-3 py-1.5 text-sm ${c.imageSide === "left" ? "bg-brand-600 text-white" : "text-gray-600"}`}
              >
                À gauche
              </button>
              <button
                type="button"
                onClick={() => onContent({ ...c, imageSide: "right" })}
                className={`rounded-md px-3 py-1.5 text-sm ${(c.imageSide || "right") === "right" ? "bg-brand-600 text-white" : "text-gray-600"}`}
              >
                À droite
              </button>
            </div>
          </Field>
          <div className="border-t border-gray-100 pt-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">
              Bouton (optionnel)
            </p>
            <ButtonEditor
              value={c.button}
              onChange={(button) => onContent({ ...c, button })}
            />
          </div>
        </>
      )}

      {block.type === "gallery" && (
        <>
          <Field label="Colonnes">
            <select
              className="input"
              value={c.columns || 3}
              onChange={(e) => onContent({ ...c, columns: +e.target.value })}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </Field>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Photos
          </p>
          {(c.images || []).map((img: string, i: number) => (
            <div key={i} className="rounded-lg border border-gray-100 p-2">
              <ImageInput
                value={img}
                onChange={(url) => {
                  const next = [...c.images];
                  next[i] = url;
                  onContent({ ...c, images: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    images: c.images.filter((_: any, j: number) => j !== i),
                  })
                }
                className="mt-1 text-xs text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onContent({ ...c, images: [...(c.images || []), ""] })
            }
            className="btn btn-ghost w-full text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter une photo
          </button>
        </>
      )}

      {block.type === "slideshow" && (
        <>
          <Field label={`Défilement : ${c.interval || 4}s`}>
            <input
              type="range"
              min={2}
              max={10}
              value={c.interval || 4}
              onChange={(e) => onContent({ ...c, interval: +e.target.value })}
              className="w-full"
            />
          </Field>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Images du diaporama
          </p>
          {(c.slides || []).map((sl: any, i: number) => (
            <div key={i} className="rounded-lg border border-gray-100 p-2">
              <ImageInput
                value={sl.image}
                onChange={(image) => {
                  const next = [...c.slides];
                  next[i] = { ...sl, image };
                  onContent({ ...c, slides: next });
                }}
              />
              <input
                className="input mt-1"
                placeholder="Légende (optionnel)"
                value={sl.caption || ""}
                onChange={(e) => {
                  const next = [...c.slides];
                  next[i] = { ...sl, caption: e.target.value };
                  onContent({ ...c, slides: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    slides: c.slides.filter((_: any, j: number) => j !== i),
                  })
                }
                className="mt-1 text-xs text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onContent({
                ...c,
                slides: [...(c.slides || []), { image: "", caption: "" }],
              })
            }
            className="btn btn-ghost w-full text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter une image
          </button>
        </>
      )}

      {block.type === "cards" && (
        <>
          <Field label="Colonnes">
            <select
              className="input"
              value={c.columns || 3}
              onChange={(e) => onContent({ ...c, columns: +e.target.value })}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </Field>
          {(c.items || []).map((it: any, i: number) => (
            <div
              key={i}
              className="space-y-2 rounded-lg border border-gray-100 p-2"
            >
              <Field label="Icône">
                <select
                  className="input"
                  value={it.icon || "Heart"}
                  onChange={(e) => {
                    const next = [...c.items];
                    next[i] = { ...it, icon: e.target.value };
                    onContent({ ...c, items: next });
                  }}
                >
                  {CARD_ICON_CHOICES.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </Field>
              <input
                className="input"
                placeholder="Titre"
                value={it.title || ""}
                onChange={(e) => {
                  const next = [...c.items];
                  next[i] = { ...it, title: e.target.value };
                  onContent({ ...c, items: next });
                }}
              />
              <textarea
                className="input"
                placeholder="Texte"
                value={it.text || ""}
                onChange={(e) => {
                  const next = [...c.items];
                  next[i] = { ...it, text: e.target.value };
                  onContent({ ...c, items: next });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    items: c.items.filter((_: any, j: number) => j !== i),
                  })
                }
                className="text-xs text-red-500"
              >
                Retirer
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onContent({
                ...c,
                items: [
                  ...(c.items || []),
                  { icon: "Heart", title: "Nouveau", text: "" },
                ],
              })
            }
            className="btn btn-ghost w-full text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter une carte
          </button>
        </>
      )}

      {block.type === "cta" && (
        <>
          <Field label="Titre">
            <input
              className="input"
              value={c.title || ""}
              onChange={(e) => onContent({ ...c, title: e.target.value })}
            />
          </Field>
          <Field label="Texte">
            <textarea
              className="input"
              value={c.text || ""}
              onChange={(e) => onContent({ ...c, text: e.target.value })}
            />
          </Field>
          <Field label="Couleur de fond">
            <ColorGrid
              value={s.background}
              onChange={(col) => onStyle({ ...s, background: col })}
            />
          </Field>
          <div className="border-t border-gray-100 pt-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">Bouton</p>
            <ButtonEditor
              value={c.button}
              onChange={(button) => onContent({ ...c, button })}
            />
          </div>
        </>
      )}

      <Field label="Espacement vertical">
        <input
          type="range"
          min={0}
          max={80}
          value={s.paddingY ?? 16}
          onChange={(e) => onStyle({ ...s, paddingY: +e.target.value })}
          className="w-full"
        />
      </Field>
    </div>
  );
}

async function fetchOembed(url: string) {
  try {
    const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function TracksEditor({
  c,
  onContent,
}: {
  c: any;
  onContent: (v: any) => void;
}) {
  const tracks: any[] = Array.isArray(c.tracks) ? c.tracks : [];
  const [loading, setLoading] = useState<number | null>(null);
  const setTrack = (i: number, patch: any) =>
    onContent({
      ...c,
      tracks: tracks.map((t, j) => (j === i ? { ...t, ...patch } : t)),
    });
  const add = () =>
    onContent({
      ...c,
      tracks: [
        ...tracks,
        { title: "", artist: "", url: "", thumbnail: "", year: "", source: "" },
      ],
    });
  const remove = (i: number) =>
    onContent({ ...c, tracks: tracks.filter((_, j) => j !== i) });
  const resolve = async (i: number, url: string) => {
    if (!url) return;
    setLoading(i);
    const data = await fetchOembed(url);
    setLoading(null);
    if (!data) {
      alert("Impossible de récupérer la pochette de ce lien.");
      return;
    }
    setTrack(i, {
      thumbnail: data.thumbnail || tracks[i]?.thumbnail,
      title: tracks[i]?.title || data.title || "",
      artist: tracks[i]?.artist || data.author || "",
      source: data.source || "",
    });
  };
  return (
    <>
      <Field label="Titre du bloc">
        <input
          className="input"
          value={c.title || ""}
          onChange={(e) => onContent({ ...c, title: e.target.value })}
          placeholder="Derniers sons"
        />
      </Field>
      <Field label="Affichage">
        <select
          className="input"
          value={c.layout || "grid"}
          onChange={(e) => onContent({ ...c, layout: e.target.value })}
        >
          <option value="grid">
            Grille qui défile (comme « Derniers sons »)
          </option>
          <option value="list">Liste (comme un catalogue)</option>
        </select>
      </Field>
      <div className="space-y-3">
        {tracks.map((t, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {t.thumbnail && (
                  <img
                    src={t.thumbnail}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    type="url"
                    value={t.url || ""}
                    onChange={(e) => setTrack(i, { url: e.target.value })}
                    placeholder="Lien Spotify, YouTube, SoundCloud…"
                  />
                  <button
                    type="button"
                    onClick={() => resolve(i, t.url)}
                    disabled={loading === i}
                    className="btn btn-ghost shrink-0 text-sm"
                  >
                    {loading === i ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Pochette"
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="input"
                    value={t.title || ""}
                    onChange={(e) => setTrack(i, { title: e.target.value })}
                    placeholder="Titre"
                  />
                  <input
                    className="input"
                    value={t.artist || ""}
                    onChange={(e) => setTrack(i, { artist: e.target.value })}
                    placeholder="Artiste"
                  />
                  <input
                    className="input"
                    value={t.year || ""}
                    onChange={(e) => setTrack(i, { year: e.target.value })}
                    placeholder="Année"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="shrink-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn btn-ghost text-sm">
        <Plus className="h-4 w-4" /> Ajouter un son
      </button>
    </>
  );
}

function VideosEditor({
  c,
  onContent,
}: {
  c: any;
  onContent: (v: any) => void;
}) {
  const videos: any[] = Array.isArray(c.videos) ? c.videos : [];
  const setV = (i: number, patch: any) =>
    onContent({
      ...c,
      videos: videos.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    });
  return (
    <>
      <Field label="Titre du bloc">
        <input
          className="input"
          value={c.title || ""}
          onChange={(e) => onContent({ ...c, title: e.target.value })}
          placeholder="Vidéos"
        />
      </Field>
      <div className="space-y-2">
        {videos.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              type="url"
              value={v.url || ""}
              onChange={(e) => setV(i, { url: e.target.value })}
              placeholder="https://youtube.com/watch?v=…"
            />
            <input
              className="input w-40"
              value={v.title || ""}
              onChange={(e) => setV(i, { title: e.target.value })}
              placeholder="Titre (option)"
            />
            <button
              type="button"
              onClick={() =>
                onContent({ ...c, videos: videos.filter((_, j) => j !== i) })
              }
              className="shrink-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onContent({ ...c, videos: [...videos, { url: "", title: "" }] })
        }
        className="btn btn-ghost text-sm"
      >
        <Plus className="h-4 w-4" /> Ajouter une vidéo YouTube
      </button>
    </>
  );
}

function StreamingEditor({
  c,
  onContent,
}: {
  c: any;
  onContent: (v: any) => void;
}) {
  const links = c.links || {};
  const set = (k: string, v: string) =>
    onContent({ ...c, links: { ...links, [k]: v } });
  const fields: [string, string, string][] = [
    ["spotify", "Spotify", "https://open.spotify.com/artist/…"],
    ["deezer", "Deezer", "https://www.deezer.com/artist/…"],
    ["appleMusic", "Apple Music", "https://music.apple.com/…"],
    ["soundcloud", "SoundCloud", "https://soundcloud.com/…"],
    ["youtube", "YouTube", "https://youtube.com/@…"],
    ["youtubeMusic", "YouTube Music", "https://music.youtube.com/channel/…"],
    ["amazonMusic", "Amazon Music", "https://music.amazon.com/artists/…"],
    ["beatport", "Beatport", "https://www.beatport.com/artist/…"],
    ["bandcamp", "Bandcamp", "https://artiste.bandcamp.com/…"],
    ["tidal", "TIDAL", "https://tidal.com/browse/artist/…"],
  ];
  return (
    <>
      <Field label="Titre du bloc">
        <input
          className="input"
          value={c.title || ""}
          onChange={(e) => onContent({ ...c, title: e.target.value })}
          placeholder="Écoutez-moi"
        />
      </Field>
      <Field label="Style des liens">
        <select
          className="input"
          value={c.linkStyle || "dark-button"}
          onChange={(e) => onContent({ ...c, linkStyle: e.target.value })}
        >
          <option value="dark-button">Bouton noir, texte blanc</option>
          <option value="transparent-dark">Fond transparent, texte noir</option>
          <option value="text-black">Logo + texte noir, sans bouton</option>
          <option value="text-white">Logo + texte blanc, sans bouton</option>
        </select>
      </Field>
      {!["text-black", "text-white"].includes(c.linkStyle || "dark-button") && (
        <Field label="Couleur du reflet sous les boutons">
          <ColorGrid
            value={c.glowColor || "#ef4444"}
            onChange={(glowColor) => onContent({ ...c, glowColor })}
          />
          <button
            type="button"
            onClick={() => onContent({ ...c, glowColor: "" })}
            className="mt-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Utiliser la couleur de chaque plateforme
          </button>
          <p className="mt-1 text-xs text-gray-400">
            Choisissez une couleur unique pour le reflet, ou gardez les couleurs
            Spotify, YouTube, Deezer, etc.
          </p>
        </Field>
      )}
      {fields.map(([k, label, ph]) => (
        <Field key={k} label={label}>
          <input
            className="input"
            type="url"
            value={links[k] || ""}
            onChange={(e) => set(k, e.target.value)}
            placeholder={ph}
          />
        </Field>
      ))}
    </>
  );
}

function PlayersEditor({
  c,
  onContent,
}: {
  c: any;
  onContent: (v: any) => void;
}) {
  const items: any[] = Array.isArray(c.items) ? c.items : [];
  const [loading, setLoading] = useState<number | null>(null);
  const setItem = (i: number, patch: any) =>
    onContent({
      ...c,
      items: items.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    });
  const add = () =>
    onContent({
      ...c,
      items: [
        ...items,
        {
          platform: "spotify",
          url: "",
          title: "",
          artist: "",
          releaseDate: "",
        },
      ],
    });
  const remove = (i: number) =>
    onContent({ ...c, items: items.filter((_, j) => j !== i) });
  const resolve = async (i: number, url: string) => {
    if (!url) return;
    setLoading(i);
    const data = await fetchOembed(url);
    setLoading(null);
    if (!data) {
      alert(
        "Impossible de récupérer les infos de ce lien. Vous pouvez quand même les remplir à la main.",
      );
      return;
    }
    setItem(i, {
      title: items[i]?.title || data.title || "",
      artist: items[i]?.artist || data.author || "",
    });
  };
  return (
    <>
      <Field label="Titre du bloc">
        <input
          className="input"
          value={c.title || ""}
          onChange={(e) => onContent({ ...c, title: e.target.value })}
          placeholder="Dernières sorties"
        />
      </Field>
      <Field label="Petit texte d’introduction">
        <textarea
          className="input"
          value={c.intro || ""}
          onChange={(e) => onContent({ ...c, intro: e.target.value })}
          placeholder="Écoutez les sons directement depuis les plateformes officielles."
        />
      </Field>
      <Field label="Ordre d’affichage">
        <select
          className="input"
          value={c.sort || "newest"}
          onChange={(e) => onContent({ ...c, sort: e.target.value })}
        >
          <option value="newest">Plus récent en premier (avec la date)</option>
          <option value="manual">Ordre manuel</option>
        </select>
      </Field>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-gray-200 p-3"
          >
            <div className="grid gap-2 sm:grid-cols-[150px_1fr_auto]">
              <select
                className="input"
                value={item.platform || "spotify"}
                onChange={(e) => setItem(i, { platform: e.target.value })}
              >
                <option value="spotify">Spotify</option>
                <option value="soundcloud">SoundCloud</option>
                <option value="deezer">Deezer</option>
                <option value="youtube">YouTube</option>
              </select>
              <input
                className="input"
                type="url"
                value={item.url || ""}
                onChange={(e) => setItem(i, { url: e.target.value })}
                placeholder="Lien officiel du son, album, playlist ou vidéo"
              />
              <button
                type="button"
                onClick={() => resolve(i, item.url)}
                disabled={loading === i}
                className="btn btn-ghost shrink-0 text-sm"
              >
                {loading === i ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Infos"
                )}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="input"
                value={item.title || ""}
                onChange={(e) => setItem(i, { title: e.target.value })}
                placeholder="Titre"
              />
              <input
                className="input"
                value={item.artist || ""}
                onChange={(e) => setItem(i, { artist: e.target.value })}
                placeholder="Artiste / projet"
              />
              <input
                className="input"
                type="date"
                value={item.releaseDate || ""}
                onChange={(e) => setItem(i, { releaseDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" /> Retirer ce lecteur
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="btn btn-ghost text-sm">
        <Plus className="h-4 w-4" /> Ajouter un lecteur officiel
      </button>
      <p className="text-xs leading-relaxed text-gray-500">
        Astuce : mettez les dates de sortie pour obtenir automatiquement l’ordre
        chronologique du plus récent au plus ancien. Sans date, l’ordre reste
        manuel.
      </p>
    </>
  );
}

function InstagramEditor({
  c,
  onContent,
}: {
  c: any;
  onContent: (v: any) => void;
}) {
  const postUrls: string[] = Array.isArray(c.postUrls) ? c.postUrls : [];
  const tiktokPostUrls: string[] = Array.isArray(c.tiktokPostUrls)
    ? c.tiktokPostUrls
    : [];
  const setUrl = (i: number, v: string) =>
    onContent({ ...c, postUrls: postUrls.map((u, j) => (j === i ? v : u)) });
  const setTiktokUrl = (i: number, v: string) =>
    onContent({
      ...c,
      tiktokPostUrls: tiktokPostUrls.map((u, j) => (j === i ? v : u)),
    });
  return (
    <>
      <Field label="Titre du bloc">
        <input
          className="input"
          value={c.title || ""}
          onChange={(e) => onContent({ ...c, title: e.target.value })}
          placeholder="Sur Instagram"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nom d’utilisateur">
          <input
            className="input"
            value={c.username || ""}
            onChange={(e) => onContent({ ...c, username: e.target.value })}
            placeholder="oddymatt_music"
          />
        </Field>
        <Field label="Nombre de posts affichés">
          <input
            className="input"
            type="number"
            min={1}
            max={20}
            value={c.count || 6}
            onChange={(e) =>
              onContent({
                ...c,
                count: Math.max(1, Math.min(20, +e.target.value || 6)),
              })
            }
          />
        </Field>
      </div>
      <Field label="Lien du profil (optionnel)">
        <input
          className="input"
          type="url"
          value={c.url || ""}
          onChange={(e) => onContent({ ...c, url: e.target.value })}
          placeholder="https://instagram.com/…"
        />
      </Field>

      <div>
        <label className="label">Liens de vos posts (affichés en direct)</label>
        <p className="mb-2 text-xs text-gray-500">
          Collez l’adresse de chaque post (…/p/… ou …/reel/…) : ils s’affichent
          en temps réel via Instagram.
        </p>
        <div className="space-y-2">
          {postUrls.map((u, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                type="url"
                value={u}
                onChange={(e) => setUrl(i, e.target.value)}
                placeholder="https://www.instagram.com/p/…"
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    postUrls: postUrls.filter((_, j) => j !== i),
                  })
                }
                className="shrink-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {postUrls.length < 20 && (
          <button
            type="button"
            onClick={() => onContent({ ...c, postUrls: [...postUrls, ""] })}
            className="btn btn-ghost mt-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter un post officiel
          </button>
        )}
      </div>
      <p className="rounded-xl bg-green-50 p-3 text-xs leading-5 text-green-800">
        Seuls les liens officiels Instagram sont acceptés. Les images importées,
        captures et widgets tiers ne sont jamais utilisés.
      </p>
      <div className="border-t border-gray-200 pt-5">
        <h4 className="font-bold text-gray-900">TikTok</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Titre du bloc">
            <input
              className="input"
              value={c.tiktokTitle || ""}
              onChange={(e) => onContent({ ...c, tiktokTitle: e.target.value })}
              placeholder="TikTok"
            />
          </Field>
          <Field label="Nom d’utilisateur">
            <input
              className="input"
              value={c.tiktokUsername || ""}
              onChange={(e) =>
                onContent({ ...c, tiktokUsername: e.target.value })
              }
              placeholder="vielusos"
            />
          </Field>
        </div>
        <Field label="Lien du profil">
          <input
            className="input"
            type="url"
            value={c.tiktokUrl || ""}
            onChange={(e) => onContent({ ...c, tiktokUrl: e.target.value })}
            placeholder="https://www.tiktok.com/@…"
          />
        </Field>
        <label className="label">Liens des publications TikTok</label>
        <div className="space-y-2">
          {tiktokPostUrls.map((u, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                type="url"
                value={u}
                onChange={(e) => setTiktokUrl(i, e.target.value)}
                placeholder="https://www.tiktok.com/@…/video/…"
              />
              <button
                type="button"
                onClick={() =>
                  onContent({
                    ...c,
                    tiktokPostUrls: tiktokPostUrls.filter((_, j) => j !== i),
                  })
                }
                className="shrink-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {tiktokPostUrls.length < 20 && (
          <button
            type="button"
            onClick={() =>
              onContent({ ...c, tiktokPostUrls: [...tiktokPostUrls, ""] })
            }
            className="btn btn-ghost mt-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Ajouter un post TikTok
          </button>
        )}
      </div>
    </>
  );
}

function ButtonEditor({
  value,
  onChange,
}: {
  value?: ButtonConfig;
  onChange: (b: ButtonConfig) => void;
}) {
  const b: ButtonConfig = value || {
    text: "Bouton",
    href: "#",
    color: "#1b5df5",
    variant: "solid",
    align: "center",
  };
  const set = (patch: Partial<ButtonConfig>) => onChange({ ...b, ...patch });
  return (
    <div className="space-y-3">
      <Field label="Texte du bouton">
        <input
          className="input"
          value={b.text}
          onChange={(e) => set({ text: e.target.value })}
        />
      </Field>
      <Field label="Lien (URL ou /page)">
        <input
          className="input"
          value={b.href}
          onChange={(e) => set({ href: e.target.value })}
        />
      </Field>
      <Field label="Style">
        <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
          <button
            type="button"
            onClick={() => set({ variant: "solid" })}
            className={`rounded-md px-3 py-1.5 text-sm ${b.variant === "solid" ? "bg-brand-600 text-white" : "text-gray-600"}`}
          >
            Plein
          </button>
          <button
            type="button"
            onClick={() => set({ variant: "outline" })}
            className={`rounded-md px-3 py-1.5 text-sm ${b.variant === "outline" ? "bg-brand-600 text-white" : "text-gray-600"}`}
          >
            Contour
          </button>
        </div>
      </Field>
      <Field label="Alignement">
        <AlignPicker value={b.align} onChange={(a) => set({ align: a })} />
      </Field>
      <Field label="Couleur">
        <ColorGrid value={b.color} onChange={(col) => set({ color: col })} />
      </Field>
    </div>
  );
}

function SocialEditor({
  value,
  onChange,
}: {
  value?: any;
  onChange: (s: any) => void;
}) {
  const s = value || { align: "center" };
  const set = (patch: any) => onChange({ ...s, ...patch });
  const nets = [
    "facebook",
    "instagram",
    "twitter",
    "youtube",
    "linkedin",
    "tiktok",
    "spotify",
    "deezer",
    "soundcloud",
    "appleMusic",
    "youtubeMusic",
    "amazonMusic",
    "beatport",
    "bandcamp",
    "tidal",
  ];
  return (
    <div className="space-y-3">
      {nets.map((n) => (
        <Field key={n} label={n === "twitter" ? "X (Twitter)" : n}>
          <input
            className="input"
            placeholder={
              n === "twitter" ? "https://x.com/…" : `https://${n}.com/…`
            }
            value={s[n] || ""}
            onChange={(e) => set({ [n]: e.target.value })}
          />
        </Field>
      ))}
      <Field label="Alignement">
        <AlignPicker value={s.align} onChange={(a) => set({ align: a })} />
      </Field>
    </div>
  );
}

// ------------------------- Header / Footer editors -------------------------
function HeaderEditor({
  value,
  branded = false,
  onChange,
}: {
  value: any;
  branded?: boolean;
  onChange: (v: any) => void;
}) {
  const h = value;
  const set = (patch: any) => onChange({ ...h, ...patch });
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">En-tête</h3>
      {branded ? (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          Le logo officiel VIELUSOS est utilisé dans l’en-tête.
        </p>
      ) : (
        <>
          <Field label="Texte du logo">
            <input
              className="input"
              value={h.logoText || ""}
              onChange={(e) => set({ logoText: e.target.value })}
            />
          </Field>
          <ImageInput
            label="Logo (image, optionnel)"
            value={h.logoUrl}
            onChange={(logoUrl) => set({ logoUrl })}
            kind="logo"
          />
        </>
      )}
      <Toggle
        checked={h.showNav ?? true}
        onChange={(v) => set({ showNav: v })}
        label="Afficher le menu"
      />
      <Toggle
        checked={h.sticky ?? true}
        onChange={(v) => set({ sticky: v })}
        label="En-tête fixe au défilement"
      />
      {!branded && (
        <>
          <Field label="Couleur de fond">
            <ColorGrid
              value={h.background}
              onChange={(c) => set({ background: c })}
            />
          </Field>
          <Field label="Couleur du texte">
            <ColorGrid
              value={h.textColor}
              onChange={(c) => set({ textColor: c })}
            />
          </Field>
        </>
      )}
      {!branded && (
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-800">Menu déroulant</p>
          <Toggle
            checked={h.menuGlass ?? true}
            onChange={(menuGlass) => set({ menuGlass })}
            label="Effet verre transparent"
          />
          <Field label="Couleur du panneau">
            <ColorGrid
              value={h.menuBackground || "#111827"}
              onChange={(menuBackground) => set({ menuBackground })}
            />
          </Field>
          <Field label={`Transparence : ${h.menuOpacity ?? 78}%`}>
            <input
              type="range"
              min={20}
              max={100}
              value={h.menuOpacity ?? 78}
              onChange={(e) => set({ menuOpacity: +e.target.value })}
              className="w-full"
            />
          </Field>
          <Field label={`Flou : ${h.menuBlur ?? 20}px`}>
            <input
              type="range"
              min={0}
              max={36}
              value={h.menuBlur ?? 20}
              onChange={(e) => set({ menuBlur: +e.target.value })}
              className="w-full"
            />
          </Field>
        </div>
      )}
      <div className="border-t border-gray-100 pt-3">
        <p className="mb-2 text-sm font-semibold text-gray-700">
          Bouton d’action
        </p>
        <Toggle
          checked={h.showCta ?? true}
          onChange={(v) => set({ showCta: v })}
          label="Afficher le bouton du header"
        />
        {h.showCta !== false && (
          <ButtonEditor value={h.cta} onChange={(cta) => set({ cta })} />
        )}
      </div>
      <div className="space-y-3 border-t border-gray-100 pt-3">
        <p className="text-sm font-semibold text-gray-700">
          Réseaux et plateformes du header
        </p>
        <p className="rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-600">
          Chaque lien est modifiable ou supprimable ici. Les mêmes plateformes
          et leurs logos officiels sont repris automatiquement dans le footer.
        </p>
        {[
          ["instagram", "Instagram"],
          ["tiktok", "TikTok"],
          ["spotify", "Spotify"],
          ["deezer", "Deezer"],
          ["soundcloud", "SoundCloud"],
          ["applemusic", "Apple Music"],
          ["youtubemusic", "YouTube Music"],
          ["shotgun", "Shotgun"],
          ["amazonmusic", "Amazon Music"],
          ["youtube", "YouTube"],
          ["beatport", "Beatport"],
          ["bandcamp", "Bandcamp"],
          ["tidal", "TIDAL"],
          ["facebook", "Facebook"],
          ["linkedin", "LinkedIn"],
          ["twitter", "X / Twitter"],
        ].map(([name, label]) => (
          <Field key={name} label={label}>
            <input
              className="input"
              type="url"
              value={h.social?.[name] || ""}
              onChange={(e) =>
                set({ social: { ...(h.social || {}), [name]: e.target.value } })
              }
              placeholder={`Lien ${label}`}
            />
          </Field>
        ))}
      </div>
      {branded && (
        <>
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <p className="text-sm font-semibold text-gray-700">
              Bannière vidéo VIELUSOS
            </p>
            <Field label="URL de la vidéo">
              <input
                className="input"
                value={h.vielusosHero?.videoUrl || ""}
                onChange={(e) =>
                  set({
                    vielusosHero: {
                      ...(h.vielusosHero || {}),
                      videoUrl: e.target.value,
                    },
                  })
                }
                placeholder="/vielusos/banner.mp4"
              />
            </Field>
            <Toggle
              checked={h.vielusosHero?.showLogo ?? true}
              onChange={(v) =>
                set({
                  vielusosHero: { ...(h.vielusosHero || {}), showLogo: v },
                })
              }
              label="Afficher le logo central"
            />
            <Toggle
              checked={h.vielusosHero?.showName ?? true}
              onChange={(v) =>
                set({
                  vielusosHero: { ...(h.vielusosHero || {}), showName: v },
                })
              }
              label="Afficher VIELUSOS"
            />
            <Toggle
              checked={h.vielusosHero?.showTagline ?? true}
              onChange={(v) =>
                set({
                  vielusosHero: { ...(h.vielusosHero || {}), showTagline: v },
                })
              }
              label="Afficher POWER OF EMOTION"
            />
          </div>
          <div className="space-y-3 border-t border-gray-100 pt-3">
            <p className="text-sm font-semibold text-gray-700">
              Page « À propos » VIELUSOS
            </p>
            <p className="rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-600">
              Ces champs pilotent directement la section visible sur la page À
              propos. La version française et la version anglaise restent
              séparées : VIELUSOS peut écrire et refaire sa bio sans toucher au
              code.
            </p>
            <Field label="Petit titre (français)">
              <input
                className="input"
                value={h.vielusosBio?.eyebrowFr || h.vielusosBio?.eyebrow || ""}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      eyebrowFr: e.target.value,
                    },
                  })
                }
                placeholder="VIELUSOS · ARTISTE"
              />
            </Field>
            <Field label="Petit titre (anglais)">
              <input
                className="input"
                value={h.vielusosBio?.eyebrowEn || ""}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      eyebrowEn: e.target.value,
                    },
                  })
                }
                placeholder="VIELUSOS · ARTIST"
              />
            </Field>
            <Field label="Titre (français)">
              <input
                className="input"
                value={h.vielusosBio?.titleFr || h.vielusosBio?.title || ""}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      titleFr: e.target.value,
                    },
                  })
                }
                placeholder="À PROPOS"
              />
            </Field>
            <Field label="Titre (anglais)">
              <input
                className="input"
                value={h.vielusosBio?.titleEn || ""}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      titleEn: e.target.value,
                    },
                  })
                }
                placeholder="ABOUT"
              />
            </Field>
            <Field label="Bio en français">
              <textarea
                className="input min-h-40"
                value={(h.vielusosBio?.paragraphsFr || []).join("\n\n")}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      paragraphsFr: e.target.value.split(/\n\s*\n/),
                    },
                  })
                }
                placeholder="Écrivez la bio française ici. Séparez les paragraphes par une ligne vide."
              />
            </Field>
            <Field label="Bio en anglais">
              <textarea
                className="input min-h-40"
                value={(
                  h.vielusosBio?.paragraphsEn ||
                  h.vielusosBio?.paragraphs ||
                  []
                ).join("\n\n")}
                onChange={(e) =>
                  set({
                    vielusosBio: {
                      ...(h.vielusosBio || {}),
                      paragraphsEn: e.target.value.split(/\n\s*\n/),
                    },
                  })
                }
                placeholder="Write the English biography here. Separate paragraphs with a blank line."
              />
            </Field>
            {[0, 1, 2].map((index) => (
              <ImageInput
                key={index}
                label={`Image ${index + 1}`}
                value={h.vielusosBio?.images?.[index] || ""}
                onChange={(value) => {
                  const images = [...(h.vielusosBio?.images || [])];
                  images[index] = value;
                  set({ vielusosBio: { ...(h.vielusosBio || {}), images } });
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FooterEditor({
  value,
  pages,
  branded = false,
  onChange,
}: {
  value: any;
  pages: Page[];
  branded?: boolean;
  onChange: (v: any) => void;
}) {
  const f = value;
  const set = (patch: any) => onChange({ ...f, ...patch });
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900">Pied de page</h3>
      {!branded && (
        <div className="rounded-xl border-2 border-brand-200 bg-brand-50 p-3">
          <p className="mb-2 font-bold text-gray-900">
            Couleurs du pied de page
          </p>
          <Field label="Couleur de fond">
            <ColorGrid
              value={f.background}
              onChange={(c) => set({ background: c })}
            />
          </Field>
          <label className="mt-3 flex items-center justify-between gap-3 text-sm font-medium text-gray-700">
            Choisir une autre couleur
            <input
              type="color"
              value={f.background || "#111827"}
              onChange={(e) => set({ background: e.target.value })}
              className="h-11 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
            />
          </label>
          <div className="mt-3">
            <Field label="Couleur du texte">
              <ColorGrid
                value={f.textColor}
                onChange={(c) => set({ textColor: c })}
              />
            </Field>
          </div>
        </div>
      )}
      {branded ? (
        <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
          Le logo et les couleurs officiels VIELUSOS sont utilisés dans le pied
          de page.
        </p>
      ) : (
        <>
          <Field label="Texte du logo">
            <input
              className="input"
              value={f.logoText || ""}
              onChange={(e) => set({ logoText: e.target.value })}
            />
          </Field>
          <ImageInput
            label="Logo (image)"
            value={f.logoUrl}
            onChange={(logoUrl) => set({ logoUrl })}
            kind="logo"
          />
        </>
      )}
      <Field label="Texte de présentation">
        <textarea
          className="input min-h-[70px]"
          value={f.text || ""}
          onChange={(e) => set({ text: e.target.value })}
        />
      </Field>
      <Field label="Texte “tous droits réservés”">
        <input
          className="input"
          value={f.allRightsText || ""}
          onChange={(e) => set({ allRightsText: e.target.value })}
        />
      </Field>
      <div className="space-y-2 border-t border-gray-100 pt-3">
        <p className="text-sm font-semibold text-gray-700">
          Pages affichées dans le footer
        </p>
        {pages.map((page) => {
          const selected: string[] = Array.isArray(f.pageSlugs)
            ? f.pageSlugs
            : pages.filter((item) => item.showInNav).map((item) => item.slug);
          return (
            <Toggle
              key={page.slug}
              checked={selected.includes(page.slug)}
              onChange={(checked) =>
                set({
                  pageSlugs: checked
                    ? [...selected, page.slug]
                    : selected.filter((slug) => slug !== page.slug),
                })
              }
              label={page.title}
            />
          );
        })}
        <p className="text-xs text-gray-500">
          Seules les pages encore présentes sur le site peuvent être
          sélectionnées. Les CGV se règlent séparément ci-dessous.
        </p>
      </div>
      <div className="border-t border-gray-100 pt-3">
        <Toggle
          checked={f.showContactBubble ?? true}
          onChange={(v) => set({ showContactBubble: v })}
          label="Bulle de contact flottante"
        />
        <p className="mt-1 text-xs text-gray-500">
          Affiche en bas de chaque page une bulle « en ligne » avec le logo, le
          nom, le slogan et les moyens de contact (appel, SMS, e-mail,
          messagerie).
        </p>
        {f.showContactBubble !== false && (
          <div className="mt-3 space-y-3">
            <Field label="Texte de la bulle (français)">
              <input
                className="input"
                value={f.contactBubbleText || ""}
                onChange={(e) => set({ contactBubbleText: e.target.value })}
              />
            </Field>
            <Field label="Texte de la bulle (anglais)">
              <input
                className="input"
                value={f.contactBubbleTextEn || ""}
                onChange={(e) => set({ contactBubbleTextEn: e.target.value })}
              />
            </Field>
            <Field label="E-mail de la bulle">
              <input
                className="input"
                type="email"
                value={f.contactBubbleEmail || ""}
                onChange={(e) => set({ contactBubbleEmail: e.target.value })}
              />
            </Field>
            <Field label="Téléphone de la bulle">
              <input
                className="input"
                type="tel"
                value={f.contactBubblePhone || ""}
                onChange={(e) => set({ contactBubblePhone: e.target.value })}
              />
            </Field>
            {branded && (
              <div className="space-y-3 rounded-2xl border border-gray-200 p-4">
                <Toggle
                  checked={f.contactBubbleShowBooking ?? true}
                  onChange={(contactBubbleShowBooking) =>
                    set({ contactBubbleShowBooking })
                  }
                  label="Afficher la ligne Booking"
                />
                <Field label="Libellé Booking (français)">
                  <input
                    className="input"
                    value={f.contactBubbleBookingLabel || "Booking"}
                    onChange={(e) =>
                      set({ contactBubbleBookingLabel: e.target.value })
                    }
                  />
                </Field>
                <Field label="Libellé Booking (anglais)">
                  <input
                    className="input"
                    value={f.contactBubbleBookingLabelEn || "Booking"}
                    onChange={(e) =>
                      set({ contactBubbleBookingLabelEn: e.target.value })
                    }
                  />
                </Field>
                <Field label="Sous-texte Booking (français)">
                  <input
                    className="input"
                    value={f.contactBubbleBookingSubtitle || ""}
                    onChange={(e) =>
                      set({ contactBubbleBookingSubtitle: e.target.value })
                    }
                  />
                </Field>
                <Field label="Sous-texte Booking (anglais)">
                  <input
                    className="input"
                    value={f.contactBubbleBookingSubtitleEn || ""}
                    onChange={(e) =>
                      set({ contactBubbleBookingSubtitleEn: e.target.value })
                    }
                  />
                </Field>
                <Field label="Lien de la page Booking">
                  <input
                    className="input"
                    value={f.contactBubbleBookingHref || "/booking"}
                    onChange={(e) =>
                      set({ contactBubbleBookingHref: e.target.value })
                    }
                  />
                </Field>
                <div className="border-t border-gray-200 pt-3">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Contenu de la page Booking</p>
                  <div className="space-y-3">
                    <Field label="Grand titre (français)"><input className="input" value={f.bookingTitle || "Envoyer un brief clair"} onChange={(e) => set({ bookingTitle: e.target.value })} /></Field>
                    <Field label="Grand titre (anglais)"><input className="input" value={f.bookingTitleEn || "Send a clear brief"} onChange={(e) => set({ bookingTitleEn: e.target.value })} /></Field>
                    <Field label="Introduction (français)"><textarea className="input min-h-24" value={f.bookingDescription || ""} onChange={(e) => set({ bookingDescription: e.target.value })} /></Field>
                    <Field label="Introduction (anglais)"><textarea className="input min-h-24" value={f.bookingDescriptionEn || ""} onChange={(e) => set({ bookingDescriptionEn: e.target.value })} /></Field>
                    <Field label="Titre du formulaire (français)"><input className="input" value={f.bookingFormTitle || "Contact · Projet"} onChange={(e) => set({ bookingFormTitle: e.target.value })} /></Field>
                    <Field label="Titre du formulaire (anglais)"><input className="input" value={f.bookingFormTitleEn || "Contact · Project"} onChange={(e) => set({ bookingFormTitleEn: e.target.value })} /></Field>
                  </div>
                </div>
              </div>
            )}
            {!branded && (
              <>
                <Field label="Position">
                  <select
                    className="input"
                    value={f.contactBubblePosition || "right"}
                    onChange={(e) =>
                      set({ contactBubblePosition: e.target.value })
                    }
                  >
                    <option value="right">En bas à droite</option>
                    <option value="left">En bas à gauche</option>
                  </select>
                </Field>
                <Field label="Couleur de la bulle">
                  <ColorGrid
                    value={f.contactBubbleColor || "#171717"}
                    onChange={(contactBubbleColor) =>
                      set({ contactBubbleColor })
                    }
                  />
                </Field>
                <Field label="Couleur du texte">
                  <ColorGrid
                    value={f.contactBubbleTextColor || "#ffffff"}
                    onChange={(contactBubbleTextColor) =>
                      set({ contactBubbleTextColor })
                    }
                  />
                </Field>
                <Toggle
                  checked={f.contactBubbleShowPhone ?? true}
                  onChange={(contactBubbleShowPhone) =>
                    set({ contactBubbleShowPhone })
                  }
                  label="Afficher l’appel"
                />
                <Toggle
                  checked={f.contactBubbleShowSms ?? true}
                  onChange={(contactBubbleShowSms) =>
                    set({ contactBubbleShowSms })
                  }
                  label="Afficher le SMS"
                />
                <Toggle
                  checked={f.contactBubbleShowEmail ?? true}
                  onChange={(contactBubbleShowEmail) =>
                    set({ contactBubbleShowEmail })
                  }
                  label="Afficher l’e-mail"
                />
                <Toggle
                  checked={f.contactBubbleShowMessage ?? true}
                  onChange={(contactBubbleShowMessage) =>
                    set({ contactBubbleShowMessage })
                  }
                  label="Afficher la messagerie"
                />
              </>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 pt-3">
        <Toggle
          checked={f.showNewsletter ?? true}
          onChange={(v) => set({ showNewsletter: v })}
          label="Bloc newsletter"
        />
        {f.showNewsletter && (
          <Field label="Titre de la newsletter">
            <input
              className="input"
              value={f.newsletterTitle || ""}
              onChange={(e) => set({ newsletterTitle: e.target.value })}
            />
          </Field>
        )}
      </div>
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <Toggle
          checked={f.showCgv ?? true}
          onChange={(v) => set({ showCgv: v })}
          label="Afficher lien CGV"
        />
        {f.showCgv && (
          <Field label="Contenu CGV">
            <textarea
              className="input min-h-[70px]"
              value={f.cgvContent || ""}
              onChange={(e) => set({ cgvContent: e.target.value })}
            />
          </Field>
        )}
        <Toggle
          checked={f.showMentions ?? true}
          onChange={(v) => set({ showMentions: v })}
          label="Afficher mentions légales"
        />
        {f.showMentions && (
          <Field label="Contenu mentions légales">
            <textarea
              className="input min-h-[70px]"
              value={f.mentionsContent || ""}
              onChange={(e) => set({ mentionsContent: e.target.value })}
            />
          </Field>
        )}
      </div>
    </div>
  );
}
