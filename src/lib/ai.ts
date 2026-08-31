import Anthropic from '@anthropic-ai/sdk';
import { getTemplate, TEMPLATES, createPhotoAllocator, type BuiltTemplate } from './templates';
import { pickTemplateId, type GenerateInput } from './generate';
import { defaultStyleFor } from './blocks';

// Default to a strong copywriting model for per-signup generation.
// Override with ANTHROPIC_MODEL (e.g. claude-opus-5) if desired.
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';

export function aiEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

type Section =
  | { type: 'banner'; title: string; subtitle?: string }
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'textimage'; title?: string; text: string; imageSide?: 'left' | 'right' }
  | { type: 'cards'; title?: string; items: { icon?: string; title: string; text: string }[] }
  | { type: 'cta'; title: string; text?: string; buttonText?: string }
  | { type: 'gallery' };

interface AiSite {
  tagline: string;
  pages: { title: string; slug: string; isHome?: boolean; sections: Section[] }[];
}

const SYSTEM = `Tu es le concepteur-rédacteur de l'association. Tu n'es PAS un observateur qui décrit l'association : tu écris le site À SA PLACE, de l'intérieur, à la première personne du pluriel ("nous", "notre association", "nos bénévoles"). Le lecteur doit avoir l'impression que ce sont les membres eux-mêmes qui parlent de leur cause.

Tu réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après, pas de balises markdown), respectant ce format :
{
  "tagline": "phrase courte d'accroche",
  "pages": [
    { "title": "Accueil", "slug": "accueil", "isHome": true, "sections": [ ... ] },
    ...
  ]
}
Chaque "section" a un "type" parmi :
- {"type":"banner","title":"...","subtitle":"..."}  (grande bannière, uniquement en haut de l'accueil)
- {"type":"heading","text":"..."}
- {"type":"text","text":"paragraphe(s)"}
- {"type":"textimage","title":"...","text":"paragraphe","imageSide":"right"}
- {"type":"cards","title":"...","items":[{"icon":"Heart","title":"...","text":"..."}]}  (icônes possibles: Heart, Users, HandHeart, HandCoins, Star, Gift, Leaf, Home, BookOpen, Shield, Sparkles, Handshake)
- {"type":"cta","title":"...","text":"...","buttonText":"Faire un don"}
- {"type":"gallery"}  (galerie de photos, sans contenu)

IMAGES — le site doit être ILLUSTRÉ (les images sont ajoutées automatiquement, ne fournis JAMAIS d'URL) :
- Commence l'Accueil par un "banner".
- Privilégie "textimage" plutôt que "text" seul pour les sections développées, en alternant imageSide "left" / "right" : ainsi chaque grande section porte une image.
- Ajoute au moins une "gallery" (sur l'Accueil ou Nos actions).
- N'enchaîne jamais une page entière en blocs "text" sans aucune image.

Génère un site neuf, dans CET ORDRE de pages (les premières sont les plus importantes et doivent être écrites en premier) : Accueil, Nos actions, Notre impact, Notre histoire, S'engager / Devenir bénévole, Faire un don, et Contact. Crée une page Actualités (à la fin) uniquement si des actualités sont fournies.

INTERDICTIONS ABSOLUES (c'est ici que se jouent les mauvais textes) :
1. NE PARLE JAMAIS DU SITE NI DES PAGES. Bannis toute phrase du genre « le site présente… », « cette page permet de comprendre… », « chaque page aide les visiteurs à… », « l'association présente sa cause de manière claire/accessible », « cette première lecture donne aux visiteurs une vision précise ». Tu n'écris pas la notice d'un site : tu écris directement le contenu. Parle de la CAUSE et des ACTIONS, jamais de la manière dont le site les présente.
2. EXACTITUDE ABSOLUE — AUCUNE FAUSSE INFO, AUCUNE FAUSSE STATISTIQUE. C'est la règle la plus importante. Tu ne cites un chiffre, une date, une statistique, un nom de rapport, une loi, une étude ou une institution QUE si tu es certain de son exactitude (fait très largement établi et vérifiable). Tu n'inventes JAMAIS un chiffre précis ni ne fabriques une source « crédible » pour faire sérieux. Dans le MOINDRE doute : PAS DE CHIFFRE — écris plutôt un constat qualitatif fiable (« une part importante de… », « de nombreuses personnes… », « un enjeu majeur aujourd'hui ») sans nombre inventé. Il vaut TOUJOURS mieux omettre une donnée que d'en inventer une fausse. N'attribue jamais un chiffre général du secteur comme un résultat de CETTE association ; les chiffres, résultats, dates, adresse, email et partenaires propres à l'association ne viennent QUE du questionnaire.
3. NE PLANTE JAMAIS le nom de l'association comme sujet brut d'une phrase bancale (ex : « Hello it's me agit avec les habitants »). Emploie le nom naturellement, ou remplace-le par « nous » / « notre association ».
4. NE RÉPÈTE JAMAIS deux fois le même titre, ni le même paragraphe (ou une variante à peine reformulée) d'une section ou d'une page à l'autre. Chaque page apporte du contenu nouveau.
5. NE RECOPIE JAMAIS un champ du questionnaire tel quel, surtout s'il est en MAJUSCULES, abrégé ou en style télégraphique. Exemple à NE PAS FAIRE : « nous transformons ces priorités en actions : CAMPAGNES SUR LES RESEAUX SOCIAUX ». À FAIRE : « Nous menons des campagnes de sensibilisation sur les réseaux sociaux pour faire connaître la cause et mobiliser autour de nous. » Réécris toujours en phrases naturelles, en casse normale (jamais de bloc en majuscules).
6. N'ÉCRIS PAS SUR L'ASSOCIATION DE FAÇON ABSTRAITE ET NOMBRILISTE. Le donateur ou le visiteur se fiche de vos qualités auto-proclamées. Bannis : « nous sommes une association utile / sérieuse / crédible », « notre méthode, c'est d'accueillir sans jugement », « expliquer avant de demander un engagement », « cette exigence rend le projet crédible pour les donateurs », « une information simple ». Parle plutôt de la CAUSE, des PERSONNES concernées, de ce qui se passe CONCRÈTEMENT sur le terrain et de ce que change un don ou un coup de main.

TRAITEMENT DES RÉPONSES DU QUESTIONNAIRE :
- Comprends et reformule chaque réponse ; ne colle jamais un champ brut dans une phrase si cela sonne faux.
- Si un champ est court, abrégé, mal orthographié ou écrit comme un mot-clé (ex. "LGBT", "jeunes", "quartier"), reformule-le en public / problématique compréhensible.
- N'utilise jamais de tournure mécanique du type « en faveur de [champ] » : préfère « auprès de », « avec », « pour accompagner », « pour défendre », « pour soutenir », selon le sens réel.
- Corrige discrètement les fautes évidentes des textes fournis, sans changer l'intention.
- Si le projet touche l'identité, l'expression de genre ou les personnes LGBT+, écris avec respect, précision et naturel.
- Interdiction des formulations vides : « nous faisons tout notre possible », « nous mettons tout en œuvre », « actions concrètes » sans dire lesquelles, « une cause importante » sans contenu.

CONTEXTE, STATISTIQUES ET RÉFÉRENCES — déballe ta science, mais intelligemment :
- Enrichis les textes avec du VRAI contexte qui éclaire la cause : ampleur du problème, chiffres marquants du secteur, repères historiques, évolution des mentalités, cadre légal, rôle des associations. C'est ce qui rend le propos crédible et donne envie d'agir.
- Choisis des repères adaptés à la cause : GIEC / IPBES (climat, biodiversité), OMS ou Santé publique France (santé), Convention internationale des droits de l'enfant de 1989 (enfance), Restos du Cœur / aide alimentaire (précarité), histoire des luttes LGBTQIA+ (droits et discriminations), etc. Ne cite un repère que s'il éclaire vraiment le projet.
- Intègre-les NATURELLEMENT dans les phrases, jamais en liste ni en bibliographie. Une attribution légère suffit (« selon le GIEC… », « d'après l'OMS… », « les études de référence estiment que… »).
- Mieux vaut une ou deux données SÛRES et exactes (ou aucune) qu'un empilement de chiffres approximatifs. Une donnée dont tu n'es pas certain ne se met pas : tu la remplaces par une formulation qualitative. Le contexte doit servir le message, pas le noyer.
- Le développement et la richesse d'un texte ne viennent JAMAIS de chiffres inventés : ils viennent d'explications claires (le problème, les enjeux, qui est concerné, ce que l'action change). On peut être très développé sans citer un seul chiffre incertain.
- Ne confonds pas le contexte du secteur (autorisé, connaissances générales fiables) avec les résultats de l'association (uniquement ceux du questionnaire).

RÈGLES DE RÉDACTION — DÉVELOPPE VRAIMENT (c'est essentiel) :
- Le site doit être RICHE et DÉVELOPPÉ. Chaque page a 4 à 6 sections. Chaque section "text" ou "textimage" fait 120 à 220 mots (2 à 4 vrais paragraphes), pleins de fond : contexte, faits, explications, exemples. Ne rends jamais une section creuse ou expédiée.
- POUR CHAQUE CAUSE ET CHAQUE ACTION, EXPLIQUE POURQUOI C'EST IMPORTANT. C'est la demande centrale : ne te contente pas de dire ce que vous faites, explique l'enjeu — quel problème, quelle ampleur (avec chiffres/contexte fiables du secteur), qui est touché et comment, ce qui se passe si personne n'agit, et ce que votre action change concrètement.
- LA PAGE « NOS ACTIONS » EST LA PLUS IMPORTANTE et la plus détaillée (5 à 6 sections) : décris chaque action une par une — en quoi elle consiste, pour qui, comment elle se déroule, pourquoi elle compte, ce qu'elle permet. C'est le cœur du site.
- Enchaîne les pages dans cet ordre de priorité (les premières sont écrites en premier) : Accueil, Nos actions, Notre impact, Notre histoire, S'engager, Faire un don, Contact.
- Chaque page a un rôle éditorial différent (présentation, contexte, action, impact, histoire, engagement, contact). Deux blocs ne disent jamais la même chose avec les mêmes mots.
- Nourris chaque page du contexte, des statistiques et des références de la section ci-dessus. « Développer » veut dire apporter de la matière réelle (contexte, faits, enjeux, exemples concrets) — jamais des phrases creuses, du méta-texte ni du nombrilisme.
- L'accueil dit qui nous sommes, pourquoi la cause compte (contexte et chiffres à l'appui), ce que nous faisons concrètement et comment aider.
- La page impact décrit ce que change notre action et rappelle l'enjeu global chiffré ; les résultats propres à l'association viennent du questionnaire, le contexte du secteur de tes connaissances fiables.
- Le ton est chaleureux, direct, crédible, développé et immédiatement publiable.`;

// Shop / brand / creator variant: same JSON format and same exactness rules, but
// a commercial voice and a page structure built around an offer, not a cause.
const SYSTEM_SHOP = `Tu es le concepteur-rédacteur de cette boutique / marque. Tu écris le site À SA PLACE, de l'intérieur, à la première personne ("nous", "notre boutique", "notre atelier", "je" pour un créateur solo si c'est plus juste). Le lecteur doit avoir l'impression que ce sont les fondateurs eux-mêmes qui présentent leur univers et leurs produits.

Tu réponds UNIQUEMENT avec un objet JSON valide (aucun texte avant ou après, pas de markdown), au format :
{
  "tagline": "phrase d'accroche courte",
  "pages": [ { "title": "Accueil", "slug": "accueil", "isHome": true, "sections": [ ... ] }, ... ]
}
Types de "section" : {"type":"banner","title":"...","subtitle":"..."} (uniquement en haut de l'accueil), {"type":"heading","text":"..."}, {"type":"text","text":"..."}, {"type":"textimage","title":"...","text":"...","imageSide":"right"}, {"type":"cards","title":"...","items":[{"icon":"Star","title":"...","text":"..."}]} (icônes: Star, Gift, Sparkles, Heart, Handshake, Shield, Leaf, Home, Users), {"type":"cta","title":"...","text":"...","buttonText":"Découvrir la boutique"}, {"type":"gallery"}.

STRUCTURE DES PAGES (dans cet ordre) : Accueil, Notre univers (à propos / histoire de la marque), Notre sélection / Nos produits (page DESCRIPTIVE qui présente les gammes, les matières, le style, le savoir-faire — SANS lister de produits précis ni de prix : le catalogue s'affiche sur une page Boutique séparée), Livraison & retours / Infos pratiques, puis Contact. Crée une page Actualités seulement si des nouveautés sont fournies.

INTERDICTIONS ABSOLUES :
1. N'INVENTE JAMAIS de produits, de références, de prix, de promotions, de stock, d'avis clients ni de chiffres de ventes. Le catalogue réel sera ajouté séparément par le commerçant. Sur la page produits, décris l'OFFRE et l'UNIVERS (types d'articles, matières, style, engagement qualité), jamais un article précis inventé.
2. AUCUNE FAUSSE INFO. Ne cite un chiffre, une date, un label ou une certification que si c'est un fait général fiable ; dans le doute, reste qualitatif.
3. NE PARLE JAMAIS DU SITE NI DES PAGES (« cette page présente… »). Écris directement le contenu.
4. NE PARLE PAS de dons, de bénévoles, d'adhérents ni de cause caritative (sauf si le questionnaire indique explicitement une dimension solidaire).
5. Ne recopie jamais un champ brut du questionnaire, ne mets jamais un bloc en MAJUSCULES.

RÉDACTION : développe vraiment (chaque page 3 à 5 sections, chaque texte 90 à 180 mots), parle du style, de la qualité, du savoir-faire, de l'expérience client, des valeurs de la marque, de ce qui la rend unique. Ton chaleureux, désirable, professionnel, immédiatement publiable.`;

const SYSTEM_MUSIC = `Tu es le concepteur-rédacteur d'un artiste, d'un groupe ou d'un projet musical. Tu écris directement à la première personne ("je", "nous", "mon projet", "notre musique"), jamais comme une association.

Retourne UNIQUEMENT un objet JSON valide, sans markdown, au format :
{"tagline":"accroche courte","pages":[{"title":"Accueil","slug":"accueil","isHome":true,"sections":[{"type":"banner","title":"...","subtitle":"..."},{"type":"textimage","title":"...","text":"...","imageSide":"right"},{"type":"cards","items":[{"icon":"Music2","title":"...","text":"..."}]},{"type":"text","text":"..."}]}]}
Types autorisés : banner (uniquement en premier sur l'accueil), heading, text, textimage, cards, cta, gallery. Chaque section doit utiliser exactement les propriétés montrées par le schéma.

Crée dans cet ordre : Accueil (4 à 6 sections éditoriales), Sons / Musique, Bio / Univers (4 à 6 sections substantielles), Actualités uniquement si elles sont fournies, Contact. L'accueil explique immédiatement l'identité, la couleur musicale, l'expérience proposée et le projet actuel. La Bio raconte un parcours et une intention artistique sans inventer de faits. La page Sons introduit la discographie et l'écoute ; les vrais lecteurs officiels seront ajoutés séparément par EasyAsso.

Décris le style musical, les influences, les textures, l'énergie, le processus de création, le parcours, l'univers visuel, le live et l'expérience d'écoute uniquement à partir des informations données. Chaque bloc texte fait 110 à 190 mots et apporte une idée nouvelle. Évite les slogans creux et les répétitions.

N'invente JAMAIS de titre, date de sortie, chiffre, concert, festival, collaboration, label, récompense, matériel ou plateforme. N'emploie jamais les mots association, bénévoles, adhérents, donateurs, cause ou bénéficiaires. N'ajoute aucun appel au don.`;

const SYSTEM_OTHER = `Tu es le concepteur-rédacteur d'un projet, d'une entreprise, d'un indépendant ou d'un collectif créatif. Tu écris le site de l'intérieur, avec "je", "nous", "notre projet" ou "notre activité" selon le contexte. Retourne uniquement un objet JSON valide avec "tagline" et "pages". Adapte les pages à l'activité : accueil, à propos, services / offre, réalisations ou projets, informations pratiques et contact ; actualités uniquement si elles sont fournies. N'utilise jamais le vocabulaire d'une association (cause, bénévoles, adhérents, public aidé, donateurs) et ne crée pas de page de don, sauf si le questionnaire demande explicitement une collecte. N'invente ni produit, ni prix, ni certification, ni résultat, ni statistique. Reformule les réponses en textes clairs, concrets et développés, sans répétition ni phrase générique.`;

function systemFor(input: GenerateInput) {
  if (input.siteType === 'shop') return SYSTEM_SHOP;
  if (input.siteType === 'music') return SYSTEM_MUSIC;
  if (input.siteType === 'other') return SYSTEM_OTHER;
  return SYSTEM;
}

// Walk the "pages" array object by object, brace-matching and respecting
// strings, so we can recover every COMPLETE page even if the response was cut
// off mid-array (token cap). The important "Nos actions" page comes early and
// is preserved even when the tail is truncated.
function salvagePages(body: string): AiSite['pages'] {
  const key = body.indexOf('"pages"');
  if (key < 0) return [];
  let i = body.indexOf('[', key);
  if (i < 0) return [];
  const pages: any[] = [];
  i++;
  while (i < body.length) {
    while (i < body.length && body[i] !== '{' && body[i] !== ']') i++;
    if (i >= body.length || body[i] === ']') break;
    let depth = 0, inStr = false, esc = false;
    const start = i;
    for (; i < body.length; i++) {
      const ch = body[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === '\\') esc = true;
        else if (ch === '"') inStr = false;
      } else if (ch === '"') inStr = true;
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) { i++; break; } }
    }
    if (depth !== 0) break; // last object is truncated → stop
    try {
      const obj = JSON.parse(body.slice(start, i));
      if (obj && Array.isArray(obj.sections)) pages.push(obj);
    } catch { /* skip a malformed page, keep the rest */ }
  }
  return pages;
}

function parseAiSite(text: string): AiSite | null {
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = cleaned.indexOf('{');
  if (start < 0) return null;
  const body = cleaned.slice(start);
  // 1) Strict parse of the whole object (normal case).
  const end = body.lastIndexOf('}');
  if (end > 0) {
    try {
      const obj = JSON.parse(body.slice(0, end + 1)) as AiSite;
      if (obj && Array.isArray(obj.pages) && obj.pages.length) return obj;
    } catch { /* fall through to salvage */ }
  }
  // 2) Salvage complete pages from a truncated response.
  const pages = salvagePages(body);
  if (pages.length) {
    const tag = body.match(/"tagline"\s*:\s*"([^"]*)"/);
    return { tagline: tag?.[1] || '', pages };
  }
  return null;
}

// The route runs under the serverless function limit (300s on Vercel Pro). Rich
// multi-page generation can be long; if the platform kills the function mid-
// request we lose everything. So we stream, accumulate text as it arrives, and
// self-abort a few seconds before the limit — then salvage the pages that
// already completed. Because the prompt emits pages in priority order (Accueil,
// Nos actions…), the important pages survive even when the tail is cut.
const GENERATION_DEADLINE_MS = 280000;

async function callClaude(prompt: string, system: string = SYSTEM): Promise<AiSite | null> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let buffer = '';
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 24000,
      thinking: { type: 'disabled' },
      system,
      messages: [{ role: 'user', content: prompt }],
    });
    stream.on('text', (delta) => { buffer += delta; });

    const completed = stream.finalMessage().then(() => true).catch((e) => {
      console.error('AI stream error:', e);
      return false;
    });
    const deadline = new Promise<'deadline'>((resolve) => {
      timer = setTimeout(() => resolve('deadline'), GENERATION_DEADLINE_MS);
    });
    const outcome = await Promise.race([completed, deadline]);
    if (outcome === 'deadline') { try { stream.abort(); } catch { /* already settled */ } }

    // `buffer` holds all text emitted so far — the whole response when the
    // stream finished, or a valid prefix when we aborted at the deadline.
    return parseAiSite(buffer.trim());
  } catch (e) {
    console.error('AI generation failed:', e);
    return parseAiSite(buffer.trim()); // salvage anything we captured
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function buildPrompt(input: GenerateInput): string {
  const languageInstruction = input.language === 'en'
    ? 'Write the ENTIRE generated website in natural, professional English. Every title, paragraph, button and navigation label must be in English.'
    : 'Rédige l’intégralité du site en français naturel et professionnel.';

  if (input.siteType === 'shop') {
    const lines = [
      `Nom de la boutique / marque : ${input.name || 'Non précisé'}`,
      input.year ? `Année de création : ${input.year}` : '',
      input.mission ? `Présentation / univers de la marque : ${input.mission}` : '',
      input.brandStory ? `Histoire réelle de la marque : ${input.brandStory}` : '',
      input.brandPromise ? `Promesse faite au client : ${input.brandPromise}` : '',
      input.brandProof ? `Preuves, méthode et savoir-faire : ${input.brandProof}` : '',
      input.shippingInfo ? `Livraison, délais et retours : ${input.shippingInfo}` : '',
      input.functioning ? `Ce que nous proposons / notre offre : ${input.functioning}` : '',
      input.actions ? `Notre savoir-faire / nos gammes : ${input.actions}` : '',
      input.beneficiaries ? `Notre clientèle : ${input.beneficiaries}` : '',
      input.goodToKnow ? `Infos pratiques (livraison, retours, matières…) : ${input.goodToKnow}` : '',
      input.news ? `Nouveautés à mettre en avant : ${input.news}` : 'Aucune nouveauté fournie : ne pas créer de page Actualités.',
      input.slogan ? `Slogan exact pour le pied de page : ${input.slogan}` : '',
      input.city ? `Ville : ${input.city}` : '',
      input.email ? `Email de contact : ${input.email}` : '',
    ].filter(Boolean);
    return `${languageInstruction}

Important : les informations ci-dessous peuvent être courtes ou incomplètes. Comprends-les, reformule-les et transforme-les en vrais textes de site marchand désirables. N'invente AUCUN produit, prix ou promotion précis : le catalogue sera ajouté séparément. Décris l'univers, le style, la qualité et l'expérience.

Crée le site complet de cette boutique / marque :

${lines.join('\n')}`;
  }

  if (input.siteType === 'music') {
    const lines = [
      `Nom de l’artiste / projet : ${input.name || 'Non précisé'}`,
      input.genre ? `Genre et esthétique musicale : ${input.genre}` : '',
      input.year ? `Début du projet : ${input.year}` : '',
      input.mission ? `Bio / univers : ${input.mission}` : '',
      input.artistStory ? `Parcours et origine du projet : ${input.artistStory}` : '',
      input.artistSound ? `Son, influences, textures et émotions : ${input.artistSound}` : '',
      input.artistLive ? `Live, scénographie et univers visuel : ${input.artistLive}` : '',
      input.functioning ? `Manière de créer et de travailler : ${input.functioning}` : '',
      input.actions ? `Sons, sorties ou activités : ${input.actions}` : '',
      input.goodToKnow ? `Informations utiles : ${input.goodToKnow}` : '',
      input.news ? `Actualités : ${input.news}` : 'Aucune actualité fournie : ne pas créer de page Actualités.',
      input.slogan ? `Slogan : ${input.slogan}` : '',
      input.city ? `Ville / scène : ${input.city}` : '',
      input.email ? `Email de contact : ${input.email}` : '',
    ].filter(Boolean);
    return `${languageInstruction}\n\nComprends ces réponses et écris le site de cet artiste ou projet musical. Ne les recopie pas telles quelles, n'invente aucune information et ne transforme jamais le projet en association.\n\n${lines.join('\n')}`;
  }

  if (input.siteType === 'other') {
    const lines = [
      `Nom du projet / activité : ${input.name || 'Non précisé'}`,
      input.category ? `Type d’activité : ${input.category}` : '',
      input.year ? `Année de création : ${input.year}` : '',
      input.mission ? `Présentation / univers : ${input.mission}` : '',
      input.functioning ? `Fonctionnement : ${input.functioning}` : '',
      input.actions ? `Offre, services ou réalisations : ${input.actions}` : '',
      input.beneficiaries ? `Clients, audience ou utilisateurs : ${input.beneficiaries}` : '',
      input.goodToKnow ? `Informations pratiques : ${input.goodToKnow}` : '',
      input.news ? `Actualités : ${input.news}` : 'Aucune actualité fournie : ne pas créer de page Actualités.',
      input.slogan ? `Slogan : ${input.slogan}` : '',
      input.city ? `Ville : ${input.city}` : '',
      input.email ? `Email : ${input.email}` : '',
    ].filter(Boolean);
    return `${languageInstruction}\n\nComprends ces réponses et écris un site adapté à cette activité. Utilise le vocabulaire du métier, pas celui d’une association. Ne recopie pas les champs bruts et n’invente aucune information.\n\n${lines.join('\n')}`;
  }

  const lines = [
    `Nom de l'association : ${input.name || 'Non précisé'}`,
    input.year ? `Année de création : ${input.year}` : '',
    input.mission ? `Mission / à propos : ${input.mission}` : '',
    input.functioning ? `Fonctionnement : ${input.functioning}` : '',
    input.actions ? `Actions / activités : ${input.actions}` : '',
    input.beneficiaries ? `Public aidé : ${input.beneficiaries}` : '',
    input.goodToKnow ? `Choses à savoir : ${input.goodToKnow}` : '',
    input.news ? `Actualités à publier : ${input.news}` : 'Aucune actualité fournie : ne pas créer de page Actualités.',
    input.slogan ? `Slogan exact à afficher dans le pied de page : ${input.slogan}` : '',
    input.city ? `Ville : ${input.city}` : '',
    input.email ? `Email de contact : ${input.email}` : '',
  ].filter(Boolean);
  return `${languageInstruction}

Important : les informations ci-dessous peuvent être courtes, mal orthographiées ou incomplètes. Tu dois les comprendre, les reformuler et les transformer en vrais textes de site. Ne recopie pas bêtement les mots du questionnaire dans des phrases toutes faites.

Appuie-toi sur ces informations pour parler de CETTE association, de sa cause et de ses actions, puis enrichis-les avec du contexte fiable : ampleur du problème, statistiques marquantes, repères historiques, cadre légal, références connues — intégrés naturellement et seulement s'ils éclairent la cause. Ne fabrique jamais un chiffre précis faux et ne prête jamais à l'association un résultat qui n'est pas dans le questionnaire.

Crée le site complet de cette association :

${lines.join('\n')}`;
}

const IMAGE_SECTIONS = new Set(['banner', 'textimage', 'gallery']);

// Guarantee a page is illustrated. If the model returned only plain `text`
// blocks (no image), promote every other one to `textimage` so an image is
// auto-filled — a text-only page would otherwise render with no pictures.
function illustrate(sections: Section[]): Section[] {
  const list = sections.map((s) => ({ ...s })) as Section[];
  if (list.some((s) => IMAGE_SECTIONS.has(s.type))) return list;
  let side: 'left' | 'right' = 'right';
  let seen = 0;
  for (let i = 0; i < list.length; i++) {
    const s = list[i] as any;
    if (s.type === 'text' && s.text) {
      if (seen % 2 === 0) {
        list[i] = { type: 'textimage', title: s.title || '', text: s.text, imageSide: side } as Section;
        side = side === 'right' ? 'left' : 'right';
      }
      seen++;
    }
  }
  return list;
}

// Convert AI sections into our block model, injecting the association's photos.
// `nextPhoto` is a shared, site-wide allocator so no image is ever repeated.
function sectionsToBlocks(sections: Section[], nextPhoto: (w?: number, h?: number) => string, isHome: boolean, language: 'fr' | 'en', cta: { label: string; href: string }) {
  const donateLabel = cta.label;
  const blocks: any[] = [];
  for (const s of illustrate(sections)) {
    switch (s.type) {
      case 'banner':
        blocks.push({ type: 'banner', content: { image: nextPhoto(1600, 720), title: s.title, subtitle: s.subtitle || '', overlay: 45, height: 460, button: { text: donateLabel, href: cta.href, color: '#ffffff', variant: 'solid', align: 'center' } } });
        break;
      case 'heading':
        blocks.push({ type: 'heading', content: { text: s.text } });
        break;
      case 'text':
        blocks.push({ type: 'text', content: { text: s.text } });
        break;
      case 'textimage':
        blocks.push({ type: 'textimage', content: { title: s.title || '', text: s.text, image: nextPhoto(900, 700), imageSide: s.imageSide || 'right' } });
        break;
      case 'cards':
        blocks.push({ type: 'cards', content: { columns: Math.min(3, Math.max(2, (s.items || []).length)) || 3, items: (s.items || []).slice(0, 4).map((it) => ({ icon: it.icon || 'Heart', title: it.title, text: it.text })) } });
        break;
      case 'cta':
        blocks.push({ type: 'cta', content: { title: s.title, text: s.text || '', button: { text: s.buttonText || donateLabel, href: cta.href, color: '#1b5df5', variant: 'solid', align: 'center' } }, style: { paddingY: 44 } });
        break;
      case 'gallery':
        // Keep the gallery small so it doesn't force repeats when the curated
        // photo pool is limited (uploaded photos / Unsplash key add more).
        blocks.push({ type: 'gallery', content: { columns: 3, images: Array.from({ length: 3 }, () => nextPhoto(600, 600)) } });
        break;
    }
  }
  return blocks.map((b, order) => ({ type: b.type, order, content: b.content, style: { ...defaultStyleFor(b.type), ...(b.style || {}) } }));
}

// Full AI generation → a customized template (theme/chrome from the closest
// preset, pages/content written by Claude).
export async function aiGenerateSite(input: GenerateInput, themePhotos: string[] = []): Promise<BuiltTemplate | null> {
  if (!aiEnabled()) return null;
  const ai = await callClaude(buildPrompt(input), systemFor(input));
  if (!ai || !Array.isArray(ai.pages) || ai.pages.length === 0) return null;
  const isShop = input.siteType === 'shop';
  const isAssociation = input.siteType === 'association' || !input.siteType;
  const cta = isShop
    ? { label: input.language === 'en' ? 'Shop now' : 'Découvrir la boutique', href: '/boutique' }
    : isAssociation
      ? { label: input.language === 'en' ? 'Donate' : 'Faire un don', href: '/don' }
      : { label: input.language === 'en' ? 'Learn more' : 'Découvrir', href: '/contact' };

  const detect = [input.mission, input.functioning, input.goodToKnow, input.beneficiaries, input.actions].filter(Boolean).join(' ');
  const baseId = pickTemplateId(detect, input.category);
  const requested = getTemplate(input.category || '');
  const desiredFamily = isShop ? 'shop' : input.siteType === 'music' ? 'music' : 'association';
  const base = (requested?.family === desiredFamily ? requested : undefined)
    || TEMPLATES.find((template) => template.family === desiredFamily)
    || getTemplate(baseId)
    || TEMPLATES[0];
  const t: BuiltTemplate = JSON.parse(JSON.stringify(base));
  const name = input.name?.trim() || (isAssociation ? 'Votre association' : 'Votre projet');
  const photos = (input.photos || []).filter(Boolean);
  const language = input.language === 'en' ? 'en' : 'fr';
  // One allocator for the whole site → the same image is never used twice.
  const nextPhoto = createPhotoAllocator(baseId, photos, themePhotos);

  t.id = `${base.id}-ai-generated`;
  t.name = name;
  t.header.logoText = name;
  t.header.logoUrl = input.logoUrl || undefined;
  t.footer.logoText = name;
  t.footer.logoUrl = input.logoUrl || undefined;
  t.footer.text = input.slogan?.trim() || (input.language === 'en' ? 'Together, we make a difference.' : 'Ensemble, faisons la différence.');

  const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'page';
  let homeAssigned = false;
  const usedSlugs = new Set<string>();

  const aiPages = ai.pages.filter((p) => input.news?.trim() || !/actualit|news/i.test(`${p.slug} ${p.title}`));
  t.pages = aiPages.slice(0, 8).map((p, i) => {
    let slug = slugify(p.slug || p.title || `page-${i}`);
    while (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);
    const isHome = !homeAssigned && (p.isHome || i === 0);
    if (isHome) homeAssigned = true;
    const blocks = sectionsToBlocks(p.sections || [], nextPhoto, isHome, language, cta);
    // Guarantee a hero image on the home page even if the model didn't emit a banner.
    if (isHome && !blocks.some((b: any) => b.type === 'banner')) {
      blocks.unshift({
        type: 'banner', order: 0,
        content: {
          image: nextPhoto(1600, 720),
          title: name, subtitle: ai.tagline || '', overlay: 45, height: 460,
          button: { text: cta.label, href: cta.href, color: '#ffffff', variant: 'solid', align: 'center' },
        },
        style: defaultStyleFor('banner'),
      });
      blocks.forEach((b: any, order: number) => { b.order = order; });
    }
    return { title: p.title || `Page ${i + 1}`, slug: isHome ? 'accueil' : slug, isHome, showInNav: true, blocks };
  });
  if (!homeAssigned && t.pages[0]) t.pages[0].isHome = true;

  // Contact details are authoritative user data, not copywriting. Inject them
  // after the AI response so the model can never omit, alter or hallucinate
  // the email/city supplied in the questionnaire.
  let contact = t.pages.find((p) => p.slug === 'contact' || /contact/i.test(p.title));
  if (!contact) {
    contact = { title: 'Contact', slug: 'contact', isHome: false, showInNav: true, blocks: [] };
    t.pages.push(contact);
  }
  const contactClosing = isShop
    ? (language === 'en' ? 'A question about an item, an order or a custom request? Contact us — we’ll be happy to help.' : 'Une question sur un article, une commande ou une demande sur mesure ? Contactez-nous : nous vous répondrons avec plaisir.')
    : isAssociation
      ? (language === 'en' ? 'A question, a partnership idea or ready to get involved? Contact us: our team will be happy to reply.' : 'Une question, une proposition de partenariat ou l’envie de nous rejoindre ? Contactez-nous : notre équipe vous répondra avec plaisir.')
      : (language === 'en' ? 'A question about the project or a collaboration idea? Contact us and we will get back to you.' : 'Une question sur le projet ou une idée de collaboration ? Contactez-nous et nous vous répondrons.');
  const contactLines = [
    input.email ? `Email${language === 'en' ? '' : ' '} : ${input.email.trim()}` : '',
    input.city ? (language === 'en' ? `We are based in ${input.city.trim()}.` : `Nous sommes basés à ${input.city.trim()}.`) : '',
    contactClosing,
  ].filter(Boolean).join('\n\n');
  contact.blocks.unshift(
    { type: 'heading', order: 0, content: { text: isShop ? (language === 'en' ? 'Contact us' : 'Contactez-nous') : isAssociation ? (language === 'en' ? 'Let’s talk about your involvement' : 'Parlons de votre engagement') : (language === 'en' ? 'Let’s talk' : 'Parlons-en') }, style: defaultStyleFor('heading') },
    { type: 'text', order: 1, content: { text: contactLines }, style: defaultStyleFor('text') },
  );
  contact.blocks.forEach((block: any, order: number) => { block.order = order; });

  return t;
}
