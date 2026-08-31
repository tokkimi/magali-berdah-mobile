import type { BuiltTemplate } from './templates';
import type { GenerateInput } from './generate';

type Lang = 'fr' | 'en';
type CauseId =
  | 'identity'
  | 'environment'
  | 'animals'
  | 'education'
  | 'health'
  | 'culture'
  | 'sport'
  | 'humanitarian'
  | 'food'
  | 'seniors'
  | 'community';

function clean(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function normalize(value = '') {
  return clean(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

function sentence(value = '') {
  const v = clean(value);
  if (!v) return '';
  return /[.!?…]$/.test(v) ? v : `${v}.`;
}

function firstUseful(value = '', fallback = '') {
  const v = clean(value);
  if (!v) return fallback;
  if (v.length < 10 || !v.includes(' ')) return fallback;
  return sentence(v);
}

function stripEnd(value = '') {
  return sentence(value).replace(/[.!?…]$/, '');
}

function polishUser(value = '') {
  return sentence(clean(value)
    .replace(/\bLGBTQIA\+?\b/gi, 'LGBTQIA+')
    .replace(/\bLGBTQ\+?\b/gi, 'LGBTQ+')
    .replace(/\bLGBT\+?\b/gi, 'LGBT+')
    .replace(/\bfille ou g[as]rcon\b/gi, 'filles, garçons et personnes non-binaires')
    .replace(/\bfille ou garçon\b/gi, 'filles, garçons et personnes non-binaires')
    .replace(/\bsi on veut\b/gi, 'librement'));
}

function inferCause(input: GenerateInput): CauseId {
  const text = normalize([
    input.category,
    input.mission,
    input.functioning,
    input.actions,
    input.beneficiaries,
    input.goodToKnow,
    input.description,
  ].filter(Boolean).join(' '));
  if (/\blgbt|lgbtq|genre|gender|jupe|vetement|identite|discrimin|trans|queer|egalite/.test(text)) return 'identity';
  if (/climat|biodiversite|nature|arbre|foret|dechet|pollution|ecolog|ocean|planete|animal sauvage/.test(text)) return 'environment';
  if (/animal|chien|chat|refuge|adoption|maltraitance|faune/.test(text)) return 'animals';
  if (/enfant|ecole|education|scolaire|jeunesse|etudiant|orphelin|apprentissage/.test(text)) return 'education';
  if (/sante|maladie|handicap|patient|hopital|soin|cancer|autisme|medical/.test(text)) return 'health';
  if (/culture|patrimoine|art|musee|festival|musique|theatre|histoire|exposition/.test(text)) return 'culture';
  if (/sport|club|football|basket|rugby|tennis|competition|entrainement|athle/.test(text)) return 'sport';
  if (/humanitaire|urgence|refugie|international|eau|developpement|catastrophe|crise/.test(text)) return 'humanitarian';
  if (/alimentaire|repas|faim|nourriture|epicerie|maraude|precarite|sans abri/.test(text)) return 'food';
  if (/aine|senior|age|isolement|ehpad|retraite|solitude|vieillesse/.test(text)) return 'seniors';
  return 'community';
}

function causeLabel(cause: CauseId, lang: Lang) {
  const fr: Record<CauseId, string> = {
    identity: 'la liberté d’être soi-même, l’expression de genre et la lutte contre les discriminations',
    environment: 'la protection du vivant, du climat et des écosystèmes',
    animals: 'la protection animale, le sauvetage et l’adoption responsable',
    education: 'l’accès à l’éducation, l’égalité des chances et la protection de l’enfance',
    health: 'l’accompagnement des personnes concernées par la santé, la maladie ou le handicap',
    culture: 'l’accès à la culture, la création et la transmission du patrimoine',
    sport: 'l’accès au sport, l’esprit d’équipe et l’inclusion par la pratique',
    humanitarian: 'l’aide humanitaire, l’urgence et l’appui aux communautés vulnérables',
    food: 'la solidarité alimentaire, la dignité et la lutte contre la précarité',
    seniors: 'le lien social, l’accompagnement des aînés et la lutte contre l’isolement',
    community: 'la solidarité locale, l’entraide et le lien social',
  };
  const en: Record<CauseId, string> = {
    identity: 'the freedom to be oneself, gender expression and the fight against discrimination',
    environment: 'the protection of living systems, climate and ecosystems',
    animals: 'animal protection, rescue and responsible adoption',
    education: 'access to education, equal opportunity and child protection',
    health: 'support for people affected by health issues, illness or disability',
    culture: 'access to culture, creativity and heritage transmission',
    sport: 'access to sport, team spirit and inclusion through practice',
    humanitarian: 'humanitarian aid, emergency response and support for vulnerable communities',
    food: 'food solidarity, dignity and the fight against precarity',
    seniors: 'social connection, support for older people and the fight against isolation',
    community: 'local solidarity, mutual aid and social connection',
  };
  return lang === 'en' ? en[cause] : fr[cause];
}

function audience(input: GenerateInput, cause: CauseId, lang: Lang) {
  const raw = clean(input.beneficiaries || '');
  const n = normalize(raw);
  if (raw.length > 12 && raw.includes(' ') && !/lgbt|genre|jupe|vetement/.test(n)) return stripEnd(polishUser(raw));
  if (cause === 'identity') return lang === 'en'
    ? 'LGBTQIA+ people, young people questioning their identity, families, educators and anyone affected by gender-expression discrimination'
    : 'les personnes LGBTQIA+, les jeunes en questionnement, les familles, les équipes éducatives et toutes les personnes concernées par les discriminations liées à l’expression de genre';
  if (cause === 'environment') return lang === 'en'
    ? 'residents, volunteers, schools, local partners and anyone who wants to protect natural environments'
    : 'les habitants, bénévoles, établissements scolaires, partenaires locaux et toutes les personnes qui veulent protéger les milieux naturels';
  if (cause === 'animals') return lang === 'en'
    ? 'animals in distress, adopters, foster families, volunteers and local partners'
    : 'les animaux en détresse, les adoptants, familles d’accueil, bénévoles et partenaires de proximité';
  if (cause === 'education') return lang === 'en'
    ? 'children, young people, families and educational partners who need practical support'
    : 'les enfants, les jeunes, les familles et les partenaires éducatifs qui ont besoin d’un appui concret';
  if (cause === 'health') return lang === 'en'
    ? 'people affected by illness or disability, their relatives, carers and support networks'
    : 'les personnes touchées par la maladie ou le handicap, leurs proches, les aidants et les réseaux d’accompagnement';
  if (cause === 'food') return lang === 'en'
    ? 'people facing food insecurity, families, isolated individuals and field volunteers'
    : 'les personnes confrontées à la précarité alimentaire, les familles, les personnes isolées et les bénévoles de terrain';
  if (cause === 'seniors') return lang === 'en'
    ? 'older people, relatives, caregivers, neighbours and volunteers who want to maintain social ties'
    : 'les personnes âgées, leurs proches, les aidants, les voisins et les bénévoles qui veulent maintenir le lien social';
  return lang === 'en'
    ? 'the people directly affected by the cause, volunteers, members and local partners'
    : 'les personnes directement concernées par la cause, les bénévoles, les adhérents et les partenaires locaux';
}

function contextFact(cause: CauseId, lang: Lang) {
  const fr: Record<CauseId, string> = {
    identity: 'Depuis plusieurs décennies, les associations LGBTQIA+ ont joué un rôle décisif pour rendre visibles les discriminations, ouvrir des espaces d’écoute et faire progresser les droits. Ce contexte rappelle qu’un choix vestimentaire, une identité ou une expression de genre ne sont pas des détails : ils touchent à la dignité, à la sécurité et à la possibilité de participer pleinement à la vie sociale.',
    environment: 'Les rapports du GIEC et de l’IPBES rappellent régulièrement que le climat, la biodiversité et la qualité des milieux naturels sont liés. À l’échelle locale, une association peut rendre ces enjeux compréhensibles : planter, nettoyer, sensibiliser, mesurer, transmettre et créer des habitudes plus respectueuses du vivant.',
    animals: 'La protection animale s’inscrit dans une évolution profonde du regard porté sur les animaux : abandon, maltraitance, stérilisation, adoption responsable et conditions d’accueil demandent une organisation constante. Les associations jouent souvent le rôle de premier recours, entre urgence, soin, médiation et pédagogie.',
    education: 'La Convention internationale des droits de l’enfant, adoptée en 1989, rappelle l’importance de la protection, de l’éducation et de l’épanouissement des enfants. Sur le terrain, ces principes deviennent concrets grâce aux associations qui accompagnent les familles, sécurisent les parcours et créent des espaces d’apprentissage accessibles.',
    health: 'Dans les parcours de santé ou de handicap, les besoins ne se limitent pas aux soins : information fiable, orientation, écoute des proches, inclusion et continuité du quotidien comptent tout autant. Les associations complètent souvent l’action institutionnelle en créant un lien humain, souple et proche des personnes concernées.',
    culture: 'La culture n’est pas seulement un loisir : elle transmet une mémoire, crée des rencontres et donne à chacun la possibilité de comprendre son territoire autrement. Les associations culturelles rendent cette transmission vivante, notamment lorsque les institutions seules ne suffisent pas à toucher tous les publics.',
    sport: 'Le sport associatif a une place particulière : il relie apprentissage, santé, confiance, règles collectives et appartenance à un groupe. Un club ou une association sportive ne se limite pas aux résultats ; il construit aussi des repères, de l’inclusion et des moments partagés.',
    humanitarian: 'L’action humanitaire repose sur une exigence forte : répondre à l’urgence sans perdre de vue la dignité, l’autonomie et la réalité locale. Les organisations sérieuses articulent aide immédiate, partenariats de terrain, transparence et continuité des projets.',
    food: 'La solidarité alimentaire touche à un besoin fondamental : manger correctement, mais aussi être accueilli sans humiliation. Les associations de terrain rendent visibles des situations parfois cachées et organisent une réponse concrète, depuis la collecte jusqu’à l’accompagnement des personnes.',
    seniors: 'Le vieillissement et l’isolement sont des sujets de société durables. Les associations qui interviennent auprès des aînés apportent plus qu’une présence : elles recréent de la confiance, repèrent les fragilités et maintiennent un lien avec le quartier, la famille ou les services utiles.',
    community: 'La solidarité locale répond à une réalité simple : beaucoup de difficultés se voient d’abord au plus près, dans un quartier, une commune, une école, une famille ou un réseau de voisins. Les associations transforment cette proximité en capacité d’agir, en confiance et en entraide organisée.',
  };
  const en: Record<CauseId, string> = {
    identity: 'For decades, LGBTQIA+ organisations have helped make discrimination visible, create listening spaces and advance rights. This context matters because clothing, identity and gender expression are not superficial details: they relate to dignity, safety and the ability to take part fully in social life.',
    environment: 'Reports by the IPCC and IPBES regularly remind us that climate, biodiversity and the quality of natural habitats are connected. At local level, an association can make these issues understandable through planting, clean-ups, education, measurement, transmission and concrete habits that protect living systems.',
    animals: 'Animal protection reflects a deeper shift in how society considers animals: abandonment, abuse, sterilisation, responsible adoption and shelter conditions all require constant organisation. Associations often act as a first line of support, combining emergency response, care, mediation and education.',
    education: 'The Convention on the Rights of the Child, adopted in 1989, underlines the importance of protection, education and child development. On the ground, these principles become practical when associations support families, secure pathways and create accessible learning spaces.',
    health: 'In health or disability journeys, needs go beyond care itself: reliable information, guidance, support for relatives, inclusion and continuity in everyday life are equally important. Associations often complement institutional services by creating a human, flexible and local connection.',
    culture: 'Culture is not only entertainment: it carries memory, creates encounters and helps people understand their community differently. Cultural associations keep this transmission alive, especially when institutions alone cannot reach every audience.',
    sport: 'Community sport has a particular role: it links learning, health, confidence, shared rules and belonging. A sports association is not only about results; it also builds reference points, inclusion and collective moments.',
    humanitarian: 'Humanitarian work depends on a demanding balance: responding to urgent needs while preserving dignity, autonomy and local realities. Serious organisations combine immediate aid, field partnerships, transparency and continuity.',
    food: 'Food solidarity touches a basic need: eating properly, but also being welcomed without humiliation. Field associations make hidden situations visible and organise a practical response, from collection to support for people.',
    seniors: 'Ageing and isolation are long-term social issues. Associations working with older people bring more than presence: they rebuild trust, identify vulnerabilities and maintain links with the neighbourhood, families and useful services.',
    community: 'Local solidarity starts from a simple reality: many difficulties are first noticed close by, in a neighbourhood, town, school, family or network of neighbours. Associations turn that proximity into action, trust and organised mutual aid.',
  };
  return lang === 'en' ? en[cause] : fr[cause];
}

function meaningfulMission(input: GenerateInput, cause: CauseId, lang: Lang) {
  const raw = polishUser(input.mission || input.description || '');
  const n = normalize(raw);
  if (cause === 'identity' && /jupe|vetement|fille|garcon|genre|lgbt/.test(n)) {
    return lang === 'en'
      ? 'The project defends a clear freedom: being able to dress, present oneself and express one’s identity without being reduced to a stereotype or exposed to mockery. The association turns that principle into a practical framework of listening, awareness and support.'
      : 'Le projet défend une liberté très concrète : pouvoir s’habiller, se présenter et exprimer son identité sans être enfermé dans un stéréotype ni exposé aux moqueries. L’association transforme ce principe en cadre pratique d’écoute, de sensibilisation et de soutien.';
  }
  const fallback = lang === 'en'
    ? `The mission of ${input.name || 'the association'} is to turn ${causeLabel(cause, lang)} into clear, useful and accessible action.`
    : `La mission de ${input.name || 'l’association'} est de transformer ${causeLabel(cause, lang)} en action claire, utile et accessible.`;
  return firstUseful(raw, fallback);
}

function concreteActions(input: GenerateInput, cause: CauseId, lang: Lang) {
  const raw = firstUseful(polishUser(input.actions || input.functioning || ''), '');
  if (raw) {
    const compact = raw.replace(/[.!?…]$/, '');
    const looksLikeList = compact.length < 120 || /^[a-zà-ÿ0-9,\s;:/-]+$/i.test(compact);
    if (looksLikeList) {
      return lang === 'en'
        ? `Concretely, our work takes shape through several complementary actions: ${compact}. Each one answers a real need on the ground and pursues a clear goal — reaching the people concerned, responding to the situations we see and building solutions that last rather than one-off gestures.`
        : `Concrètement, notre action prend la forme de plusieurs volets complémentaires : ${compact}. Chacun répond à un besoin réel du terrain et poursuit un but précis — aller vers les personnes concernées, répondre aux situations que nous rencontrons et construire des réponses qui durent plutôt que des gestes ponctuels.`;
    }
    return raw;
  }
  if (cause === 'identity') return lang === 'en'
    ? 'The association can organise listening sessions, awareness workshops, practical resources, school or community discussions and campaigns that make respect visible in everyday life.'
    : 'L’association peut organiser des temps d’écoute, des ateliers de sensibilisation, des ressources pratiques, des échanges avec les écoles ou structures locales et des campagnes qui rendent le respect visible au quotidien.';
  if (cause === 'environment') return lang === 'en'
    ? 'The work can combine field action, awareness, citizen mobilisation, partnerships with schools or local authorities and follow-up of visible environmental improvements.'
    : 'L’action peut associer interventions de terrain, sensibilisation, mobilisation citoyenne, partenariats avec les écoles ou collectivités et suivi des améliorations visibles pour l’environnement.';
  return lang === 'en'
    ? 'The association can combine welcoming people, organising activities, coordinating volunteers, documenting needs and building partnerships so each initiative remains useful and understandable.'
    : 'L’association peut associer accueil, organisation d’activités, coordination des bénévoles, repérage des besoins et partenariats afin que chaque initiative reste utile et compréhensible.';
}

function buildCopy(input: GenerateInput) {
  const lang: Lang = input.language === 'en' ? 'en' : 'fr';
  const name = clean(input.name) || (lang === 'en' ? 'the association' : 'l’association');
  const cause = inferCause(input);
  const who = audience(input, cause, lang);
  const mission = meaningfulMission(input, cause, lang);
  const actions = concreteActions(input, cause, lang);
  const good = polishUser(input.goodToKnow || '');
  const created = input.year
    ? (lang === 'en'
      ? `Founded in ${input.year}${input.city ? ` in ${input.city}` : ''}, ${name} gives this commitment a concrete local anchor.`
      : `Créée en ${input.year}${input.city ? ` à ${input.city}` : ''}, ${name} donne à cet engagement un ancrage concret.`)
    : (lang === 'en'
      ? `${name} starts from a clear observation: a cause becomes stronger when it is explained, organised and made accessible.`
      : `${name} part d’un constat clair : une cause devient plus forte lorsqu’elle est expliquée, organisée et rendue accessible.`);

  return {
    lang,
    name,
    cause,
    who,
    mission,
    actions,
    good,
    homeContext: lang === 'en'
      ? `${created} ${contextFact(cause, lang)}\n\n${mission} This is why our work matters today: behind the cause there are real people and real situations, and every concrete action helps to change them for the better.`
      : `${created} ${contextFact(cause, lang)}\n\n${mission} C’est pourquoi notre engagement compte aujourd’hui : derrière la cause, il y a des personnes et des situations bien réelles, et chaque action concrète contribue à les faire évoluer.`,
    homeAction: lang === 'en'
      ? `We work alongside ${who}. What matters first is to grasp the situation clearly: who is concerned, what problem we address, why it is urgent today and what a concrete form of support really changes.\n\nOur commitment is not a generic promise. It becomes specific actions, carried by people on the ground, close to real needs — and there are several ways you can support them.`
      : `Nous agissons auprès de ${who}. Ce qui compte d’abord, c’est de bien saisir la situation : qui est concerné, quel problème nous traitons, pourquoi il est urgent aujourd’hui et ce que change vraiment un soutien concret.\n\nNotre engagement n’est pas une promesse générale. Il se traduit en actions précises, portées par des personnes de terrain, au plus près des besoins réels — et vous pouvez les soutenir de plusieurs façons.`,
    story: lang === 'en'
      ? `${created} Its story is not only a founding date: it is the moment when a need, a conviction and people ready to act met. Around ${causeLabel(cause, lang)}, the association gives a public shape to situations that are often misunderstood, minimised or left to isolated individuals.\n\n${mission} This founding idea becomes stronger when it is shared with members, volunteers and partners who can each bring a skill, a network or field experience. The association can then grow without losing its first purpose: staying useful to the people concerned.`
      : `${created} Notre histoire ne se résume pas à une date : elle commence lorsque se rencontrent un besoin, une conviction et des personnes prêtes à agir. Autour de ${causeLabel(cause, lang)}, nous donnons une forme concrète à des situations souvent mal comprises, minimisées ou laissées aux personnes seules.\n\n${mission} Cette idée fondatrice devient plus solide à mesure qu’elle est partagée avec des adhérents, des bénévoles et des partenaires qui apportent chacun une compétence, un réseau ou une expérience de terrain. Nous pouvons ainsi grandir sans perdre notre but premier : rester utiles aux personnes concernées.`,
    methods: lang === 'en'
      ? `${actions}\n\nBehind each of these actions there is a clear purpose: not just to help occasionally, but to answer the real needs of ${who} in a lasting way. We stay close to the ground, adjust to the situations we meet and make it easy for those who need us to reach us. ${good ? `${good} ` : ''}`
      : `${actions}\n\nDerrière chacune de ces actions, il y a un but clair : ne pas aider ponctuellement, mais répondre durablement aux besoins de ${who}. Nous restons au plus près du terrain, nous nous adaptons aux situations rencontrées et nous faisons en sorte que celles et ceux qui en ont besoin puissent nous joindre facilement. ${good ? `${good} ` : ''}`,
    impact: lang === 'en'
      ? `Our impact is not a slogan — it shows in concrete signs: people who feel listened to, volunteers who know what to do, partners who understand the project, and actions that continue over time.\n\nFor ${who}, moving forward can mean better information, less isolation, more confidence or a clearer path to support. That is what we work for, day after day, and what every donation and every helping hand makes possible.`
      : `Notre impact n’est pas un slogan : il se lit dans des signes concrets : des personnes qui se sentent écoutées, des bénévoles qui savent comment agir, des partenaires qui comprennent le projet et des actions qui durent.\n\nPour ${who}, avancer peut vouloir dire être mieux informé, moins isolé, plus confiant ou mieux orienté. C’est pour cela que nous agissons, jour après jour, et c’est ce que rendent possible chaque don et chaque coup de main.`,
    donation: lang === 'en'
      ? `Your donation directly strengthens our work. It makes concrete things possible: welcoming people, preparing our activities, producing resources, covering essential costs or helping us respond faster when it matters.\n\nEvery contribution counts, whatever its amount. You can give online, or by bank transfer, cheque, HelloAsso or Leetchi — whichever is easiest for you.`
      : `Votre don renforce directement notre action. Il rend possibles des choses très concrètes : accueillir les personnes, préparer nos activités, produire des ressources, couvrir des frais essentiels ou nous permettre de répondre plus vite quand c’est nécessaire.\n\nChaque contribution compte, quel que soit son montant. Vous pouvez donner en ligne, ou par virement, chèque, HelloAsso ou Leetchi — au plus simple pour vous.`,
    engagement: lang === 'en'
      ? `Supporting ${name} can take several forms: volunteering, membership, a donation, a partnership, sharing the project or offering a specific skill. The best way to encourage action is to explain what each contribution makes possible.\n\nA person who discovers the association should quickly understand where to start: who to contact, what is needed, how donations are used and what kind of help is useful. This clarity turns goodwill into participation.`
      : `Nous soutenir peut prendre plusieurs formes : bénévolat, adhésion, don, partenariat, relais de communication ou mise à disposition d’une compétence. Chaque contribution, même modeste, nous aide à aller plus loin.\n\nVous ne savez pas par où commencer ? Contactez-nous : nous vous dirons quels sont nos besoins du moment, comment les dons sont utilisés et où votre aide serait la plus utile. Il n’en faut pas plus pour nous rejoindre.`,
    contact: lang === 'en'
      ? `${input.email ? `Email: ${input.email}. ` : ''}${input.city ? `Based in ${input.city}. ` : ''}A question, a partnership idea or a desire to help? Contact the association so the team can direct you to the right person and the right form of involvement.`
      : `${input.email ? `Email : ${input.email}. ` : ''}${input.city ? `Nous sommes basés à ${input.city}. ` : ''}Une question, une idée de partenariat ou l’envie d’aider ? Écrivez-nous : nous vous répondrons et vous orienterons vers la bonne personne et la bonne façon de vous engager.`,
  };
}

function weakText(value = '') {
  const n = normalize(value);
  if (n.length < 420) return true;
  const bad = [
    'notre demarche repose sur l ecoute la proximite et une action concrete',
    'nous voulons inscrire chaque initiative dans la duree',
    'projet clair et accessible',
    'mettent tout en leur possible',
    'en faveur de lgbt',
    'en faveur de lgbtq',
    'en faveur de',
    'concrete and lasting action',
    'clear and accessible project',
    'we do everything possible',
  ];
  return bad.some((needle) => n.includes(needle));
}

function roleForPage(page: BuiltTemplate['pages'][number], index: number) {
  const key = normalize(`${page.slug} ${page.title}`);
  if (key.includes('histoire') || key.includes('story')) return 'story';
  if (key.includes('action') || key.includes('work')) return index === 0 ? 'methods' : 'impact';
  if (key.includes('impact')) return 'impact';
  if (key.includes('don') || key.includes('donate') || key.includes('support')) return index === 0 ? 'donation' : 'engagement';
  if (key.includes('engag') || key.includes('benevol') || key.includes('involv')) return 'engagement';
  if (key.includes('contact')) return 'contact';
  if (page.isHome) return index === 0 ? 'homeContext' : 'homeAction';
  return index % 2 === 0 ? 'methods' : 'impact';
}

function roleText(copy: ReturnType<typeof buildCopy>, role: string) {
  return (copy as any)[role] || copy.homeAction;
}

function similarEnough(a = '', b = '') {
  const ta = new Set(normalize(a).split(/\s+/).filter((w) => w.length > 4));
  const tb = new Set(normalize(b).split(/\s+/).filter((w) => w.length > 4));
  if (!ta.size || !tb.size) return false;
  let common = 0;
  for (const word of ta) if (tb.has(word)) common += 1;
  return common / Math.min(ta.size, tb.size) > 0.62;
}

function enrichCards(items: any[], copy: ReturnType<typeof buildCopy>) {
  const fr = copy.lang !== 'en';
  const byCause: Record<CauseId, any[]> = {
    identity: fr ? [
      { icon: 'Users', title: 'Écoute et sécurité', text: 'Des espaces où les personnes peuvent parler de leur vécu, poser des questions et recevoir une réponse respectueuse, sans moquerie ni pression.' },
      { icon: 'BookOpen', title: 'Sensibilisation', text: 'Des ressources et ateliers pour expliquer les discriminations, l’expression de genre et la liberté d’être soi avec des mots simples.' },
      { icon: 'Sparkles', title: 'Visibilité positive', text: 'Des actions qui montrent que chacun peut exister publiquement, avec son style, son identité et sa dignité.' },
    ] : [
      { icon: 'Users', title: 'Listening and safety', text: 'Spaces where people can share experiences, ask questions and receive respectful support without mockery or pressure.' },
      { icon: 'BookOpen', title: 'Awareness', text: 'Resources and workshops that explain discrimination, gender expression and the freedom to be oneself in clear words.' },
      { icon: 'Sparkles', title: 'Positive visibility', text: 'Actions showing that everyone can exist publicly with their style, identity and dignity.' },
    ],
    environment: fr ? [
      { icon: 'Leaf', title: 'Terrain', text: 'Des actions visibles pour protéger les milieux naturels : plantations, nettoyages, suivi local et mobilisation des bénévoles.' },
      { icon: 'BookOpen', title: 'Comprendre', text: 'Une pédagogie accessible pour relier climat, biodiversité et gestes concrets sans jargon inutile.' },
      { icon: 'Handshake', title: 'Agir ensemble', text: 'Habitants, écoles, collectivités et partenaires peuvent contribuer à une dynamique locale durable.' },
    ] : [
      { icon: 'Leaf', title: 'Field work', text: 'Visible action to protect natural habitats: planting, clean-ups, local follow-up and volunteer mobilisation.' },
      { icon: 'BookOpen', title: 'Understanding', text: 'Accessible education connecting climate, biodiversity and practical habits without unnecessary jargon.' },
      { icon: 'Handshake', title: 'Act together', text: 'Residents, schools, local authorities and partners can contribute to a lasting local dynamic.' },
    ],
    animals: [], education: [], health: [], culture: [], sport: [], humanitarian: [], food: [], seniors: [], community: [],
  };
  const generic = fr ? [
    { icon: 'Users', title: 'Public accompagné', text: `L’association construit ses actions avec ${copy.who}, en partant des besoins réels plutôt que d’une formule générale.` },
    { icon: 'Handshake', title: 'Méthode claire', text: 'Chaque initiative doit être facile à comprendre, à rejoindre et à suivre pour les bénévoles comme pour les partenaires.' },
    { icon: 'Star', title: 'Impact visible', text: 'Le but est de rendre les effets de l’engagement lisibles : information, soutien, participation et continuité.' },
  ] : [
    { icon: 'Users', title: 'People supported', text: `The association builds its work with ${copy.who}, starting from real needs rather than a generic promise.` },
    { icon: 'Handshake', title: 'Clear method', text: 'Each initiative should be easy to understand, join and follow for volunteers as well as partners.' },
    { icon: 'Star', title: 'Visible impact', text: 'The goal is to make commitment readable through information, support, participation and continuity.' },
  ];
  const source = byCause[copy.cause].length ? byCause[copy.cause] : generic;
  return (items || []).map((item, index) => ({
    ...item,
    ...(weakText(`${item?.title || ''} ${item?.text || ''}`) ? source[index % source.length] : item),
  }));
}

export function enhanceGeneratedEditorialCopy(template: BuiltTemplate, input: GenerateInput) {
  // Music, commerce and other project sites have their own editorial voice.
  // Never run the association-only enrichment over them.
  if (input.siteType && input.siteType !== 'association') return template;
  const copy = buildCopy(input);
  const forceInternalGenerator = /-generated$/.test(template.id || '') && !/-ai-generated$/.test(template.id || '');

  for (const page of template.pages || []) {
    const pageKey = normalize(`${page.slug} ${page.title}`);
    const forcePage = forceInternalGenerator && !/actualit|news/.test(pageKey);
    let textIndex = 0;
    const usedTexts: string[] = [];
    for (const block of page.blocks || []) {
      const content = block.content || {};
      if (block.type === 'text' || block.type === 'textimage') {
        const role = roleForPage(page, textIndex++);
        const replacement = roleText(copy, role);
        const current = typeof content.text === 'string' ? content.text : '';
        if (forcePage || weakText(current) || usedTexts.some((seen) => similarEnough(current, seen))) {
          content.text = replacement;
          if (block.type === 'textimage' && (!content.title || weakText(String(content.title)))) {
            content.title = copy.lang === 'en'
              ? (role === 'homeContext' ? 'A cause with real context' : 'How the association acts')
              : (role === 'homeContext' ? 'Une cause, un contexte, une réponse' : 'Comment l’association agit');
          }
        }
        usedTexts.push(String(content.text || ''));
      }
      if (block.type === 'cards' && Array.isArray(content.items)) {
        content.items = enrichCards(content.items, copy);
      }
      block.content = content;
    }
  }

  return template;
}
