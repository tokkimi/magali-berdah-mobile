import { platformLegal } from './platform-legal';

type LegalProfile = Record<string, any>;

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function yes(value: unknown) {
  return value === true || value === 'true' || value === 'on';
}

function detectCountry(profile: LegalProfile) {
  const explicit = clean(profile.legalCountry || profile.country);
  if (explicit) return explicit;
  const raw = `${clean(profile.legalAddress)} ${clean(profile.city)}`.toLowerCase();
  if (/\b(france|paris|lyon|marseille|toulouse|nantes|lille|bordeaux|rennes|montpellier|réunion|reunion|guadeloupe|martinique|guyane|mayotte)\b/.test(raw)) return 'France';
  if (/\b(belgique|belgium|bruxelles|brussels)\b/.test(raw)) return 'Belgique';
  if (/\b(suisse|switzerland|genève|geneva|lausanne)\b/.test(raw)) return 'Suisse';
  if (/\b(luxembourg)\b/.test(raw)) return 'Luxembourg';
  if (/\b(canada|québec|quebec|montréal|montreal)\b/.test(raw)) return 'Canada';
  if (/\b(united kingdom|royaume-uni|london|angleterre|england)\b/.test(raw)) return 'Royaume-Uni';
  if (/\b(united states|usa|états-unis|etats-unis|new york|california)\b/.test(raw)) return 'États-Unis';
  return 'France';
}

function countryKind(country: string) {
  const c = country.toLowerCase();
  if (c.includes('france')) return 'france';
  if (/(belgique|belgium|luxembourg|allemagne|germany|espagne|spain|italie|italy|portugal|pays-bas|netherlands|irlande|ireland|autriche|austria|grèce|greece|europe|union européenne)/.test(c)) return 'eu';
  return 'other';
}

function activity(profile: LegalProfile) {
  const hasShop = yes(profile.hasShop) || yes(profile.shopEnabled) || profile.siteType === 'shop';
  const isAssociation = profile.isAssociation !== false && profile.siteType !== 'shop';
  if (hasShop && isAssociation) return 'association_shop';
  if (hasShop) return 'shop';
  if (isAssociation) return 'association';
  return 'project';
}

function paymentMethods(profile: LegalProfile, en: boolean) {
  const methods = [
    yes(profile.donationCardEnabled) || clean(profile.donationStripeUrl) ? (en ? 'card / Stripe' : 'carte bancaire / Stripe') : '',
    yes(profile.donationHelloAssoEnabled) || clean(profile.donationHelloAssoUrl) ? 'HelloAsso' : '',
    yes(profile.donationTransferEnabled) || clean(profile.donationIban) ? (en ? 'bank transfer' : 'virement bancaire') : '',
    yes(profile.donationChequeEnabled) || clean(profile.donationChequePayable) ? (en ? 'cheque' : 'chèque') : '',
    yes(profile.leetchiEnabled) || clean(profile.leetchiUrl) ? 'Leetchi' : '',
  ].filter(Boolean);
  return methods.length ? methods.join(', ') : (en ? 'the payment methods shown on the website' : 'les moyens de paiement affichés sur le site');
}

function detailsList(profile: LegalProfile, associationName: string, en: boolean) {
  const name = clean(profile.legalName) || associationName;
  const country = detectCountry(profile);
  const rows = [
    [en ? 'Website publisher' : 'Éditeur du site', name],
    [en ? 'Legal country' : 'Pays légal', country],
    [en ? 'Registration number' : 'Numéro d’enregistrement', clean(profile.registrationNumber)],
    [en ? 'Registered office' : 'Siège social', clean(profile.legalAddress)],
    [en ? 'Public contact email' : 'Email public de contact', clean(profile.email)],
    [en ? 'Phone' : 'Téléphone', clean(profile.phone)],
    [en ? 'Publication manager' : 'Responsable de publication', clean(profile.publicationDirector)],
  ].filter(([, value]) => value);

  return rows.map(([label, value]) => `${label} : ${value}`).join('\n');
}

function countryLawNotice(country: string, en: boolean) {
  const kind = countryKind(country);
  if (en) {
    if (kind === 'france') return 'The website is drafted for an organization established in France. French rules on legal notices, personal data, online donations and, where relevant, consumer e-commerce may apply.';
    if (kind === 'eu') return `The website is drafted for an organization established in ${country}. European personal-data rules may apply, and local consumer/e-commerce rules should be checked by the publisher.`;
    return `The website is drafted from the country declared by the publisher (${country}). Local legal, tax, consumer and data-protection rules must be checked before publication.`;
  }
  if (kind === 'france') return 'Le site est rédigé pour une structure établie en France. Les règles françaises relatives aux mentions légales, aux données personnelles, aux dons en ligne et, le cas échéant, à la vente à distance peuvent s’appliquer.';
  if (kind === 'eu') return `Le site est rédigé pour une structure établie en ${country}. Les règles européennes relatives aux données personnelles peuvent s’appliquer ; les règles locales de consommation, fiscalité et vente à distance doivent être vérifiées par l’éditeur.`;
  return `Le site est rédigé à partir du pays déclaré par l’éditeur (${country}). Les règles locales applicables en matière juridique, fiscale, commerciale et de protection des données doivent être vérifiées avant publication.`;
}

function frDocuments(profile: LegalProfile, associationName: string) {
  const name = clean(profile.legalName) || associationName;
  const country = detectCountry(profile);
  const kind = countryKind(country);
  const act = activity(profile);
  const hasShop = act === 'shop' || act === 'association_shop';
  const isAssociation = act === 'association' || act === 'association_shop';
  const methods = paymentMethods(profile, false);
  const mission = clean(profile.mission);
  const details = detailsList(profile, associationName, false);
  const fiscal = kind === 'france'
    ? 'L’association reste seule responsable de vérifier si elle est habilitée à émettre des reçus fiscaux et de respecter les conditions fiscales applicables. Un don ne donne droit à avantage fiscal que si l’association et le donateur remplissent les conditions prévues par la réglementation.'
    : 'L’éditeur reste seul responsable de vérifier, dans son pays, les règles fiscales applicables aux dons, reçus, attestations ou justificatifs remis aux contributeurs.';

  const mentions = `MENTIONS LÉGALES, DONNÉES PERSONNELLES ET COOKIES

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}.

1. ÉDITEUR DU SITE
${details || `Éditeur du site : ${name}`}

${mission ? `Activité déclarée : ${mission}` : `Activité déclarée : ${isAssociation ? 'présentation d’une association, de ses actions et de ses moyens de soutien' : hasShop ? 'présentation d’une activité et vente en ligne de produits ou services' : 'présentation d’un projet ou d’une structure'}.`}

2. PAYS ET CADRE JURIDIQUE À VÉRIFIER
${countryLawNotice(country, false)}

3. HÉBERGEMENT ET PRESTATAIRE TECHNIQUE
Le site est créé et administré avec EasyAsso, service exploité par ${platformLegal.companyName}. L’hébergement technique est assuré par ${platformLegal.hostName}, ${platformLegal.hostAddress}, site : ${platformLegal.hostWebsite}. L’association ou la structure éditrice reste responsable des contenus, images, textes, produits, campagnes, dons et informations qu’elle publie.

4. RESPONSABLE DE PUBLICATION
Le responsable de publication est la personne indiquée ci-dessus. À défaut, il appartient à la structure éditrice de compléter cette information avant la publication définitive.

5. PROPRIÉTÉ INTELLECTUELLE
Les textes, logos, images, vidéos, marques, documents et éléments graphiques publiés sur le site appartiennent à leurs titulaires respectifs. Toute reproduction, adaptation, diffusion ou exploitation sans autorisation est interdite, sauf exceptions prévues par la loi.

6. DONNÉES PERSONNELLES COLLECTÉES
Le site peut collecter des données via les formulaires de contact, dons, newsletter, commande, compte client ou message : identité, email, téléphone, adresse, historique de dons ou commandes, informations de livraison, justificatifs transmis, préférences de contact et contenu des messages. Les champs obligatoires sont ceux nécessaires au traitement de la demande.

7. FINALITÉS ET BASES DE TRAITEMENT
Les données sont utilisées pour répondre aux messages, gérer les dons, préparer les reçus ou justificatifs, traiter les commandes, assurer la livraison, suivre la relation avec les donateurs ou clients, envoyer une newsletter si elle est demandée, tenir la comptabilité et sécuriser le site. Selon les cas, les traitements reposent sur l’exécution d’une demande ou d’un contrat, une obligation légale, l’intérêt légitime de la structure ou le consentement.

8. DURÉES DE CONSERVATION
Les messages de contact sont conservés le temps nécessaire au suivi de la demande. Les données liées aux dons, paiements, commandes, reçus, justificatifs et obligations comptables peuvent être conservées pendant les durées légales applicables. Les données newsletter sont conservées jusqu’au désabonnement ou retrait du consentement.

9. DESTINATAIRES ET PRESTATAIRES
Les données sont accessibles aux personnes habilitées de la structure éditrice et aux prestataires nécessaires au fonctionnement du site : EasyAsso, hébergeur, prestataire email, prestataires de paiement ou plateformes connectées comme Stripe, HelloAsso ou Leetchi lorsque l’éditeur les active. Chaque service tiers peut appliquer ses propres conditions et politique de confidentialité.

10. DROITS DES PERSONNES
Toute personne peut demander l’accès, la rectification, l’effacement, la limitation, l’opposition ou la portabilité de ses données lorsque ces droits sont applicables. La demande doit être adressée au contact indiqué dans les présentes mentions. Une pièce justificative peut être demandée en cas de doute raisonnable sur l’identité.

11. COOKIES
Le site peut utiliser des cookies nécessaires à son fonctionnement, à la sécurité, au panier, à la connexion ou à la mesure d’audience lorsque celle-ci est activée. Les cookies non strictement nécessaires doivent être soumis au consentement lorsque la réglementation applicable l’exige.

12. LIENS EXTERNES
Le site peut contenir des liens vers des plateformes tierces, notamment paiement, cagnotte, réseaux sociaux, billetterie ou outils associatifs. La structure éditrice n’est pas responsable du contenu, de la sécurité ou des politiques de ces services externes.

13. SIGNALEMENT
Pour signaler un contenu illicite, une erreur, une atteinte à des droits ou une demande relative aux données personnelles, contactez la structure éditrice à l’adresse indiquée ci-dessus.

Document généré automatiquement par EasyAsso à partir des informations fournies par l’éditeur. Il doit être relu, complété et validé par la structure avant publication.`;

  const cgv = `CONDITIONS GÉNÉRALES D’UTILISATION${hasShop ? ', DE VENTE' : ''} ET DE DONS

Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}.

1. OBJET
Les présentes conditions encadrent l’accès au site de ${name}, l’utilisation de ses contenus et formulaires, les demandes de contact, les dons ou contributions,${hasShop ? ' ainsi que les commandes réalisées dans la boutique,' : ''} lorsque ces fonctionnalités sont proposées.

2. IDENTITÉ DE LA STRUCTURE
${details || `Éditeur du site : ${name}`}

3. CADRE APPLICABLE
${countryLawNotice(country, false)}

4. ACCÈS AU SITE
Le site est accessible sous réserve des interruptions techniques, opérations de maintenance ou événements indépendants de la volonté de l’éditeur. L’éditeur peut corriger, suspendre, retirer ou mettre à jour un contenu lorsque cela est nécessaire.

5. UTILISATION DU SITE
Le visiteur s’engage à utiliser le site de manière loyale, à fournir des informations exactes dans les formulaires et à ne pas perturber son fonctionnement. Tout usage frauduleux, automatisé, illicite ou portant atteinte aux droits de tiers est interdit.

6. DONS, CONTRIBUTIONS ET MOYENS DE PAIEMENT
${isAssociation ? 'Les dons et contributions servent à soutenir la mission et les actions de la structure.' : 'Les contributions ou paiements éventuellement proposés sont réalisés selon les informations affichées sur le site.'} Les moyens actuellement prévus ou activables sont : ${methods}. Le montant, la finalité et les informations essentielles doivent être affichés avant validation.

7. REÇUS, JUSTIFICATIFS ET FISCALITÉ DES DONS
${fiscal} Les reçus, attestations ou justificatifs doivent être émis avec des informations exactes : identité du donateur, montant, date, moyen de paiement, référence de transaction ou de virement lorsque disponible.

8. ANNULATION ET REMBOURSEMENT DES DONS
Un don validé est en principe définitif. En cas d’erreur matérielle, double paiement, suspicion de fraude ou demande particulière, le donateur doit contacter rapidement la structure. Toute annulation ou tout remboursement est étudié au regard des circonstances, des règles applicables et des frais éventuellement prélevés par les prestataires de paiement.
${hasShop ? `
9. BOUTIQUE, PRODUITS ET COMMANDES
Les produits, services, prix, disponibilités, frais, délais et modalités de livraison sont ceux affichés sur le site au moment de la commande. La structure éditrice est responsable de l’exactitude des fiches produits, photos, descriptions, stocks, prix et taxes applicables. La commande devient ferme selon les étapes affichées sur le site et après validation du paiement ou du moyen de règlement proposé.

10. PRIX ET PAIEMENT DES COMMANDES
Les prix sont indiqués dans la devise affichée sur le site. Les éventuels frais de livraison, commissions ou taxes doivent être indiqués avant validation. Le paiement peut être traité par Stripe ou tout autre prestataire indiqué au moment du règlement. La structure éditrice reste responsable du suivi de commande, de la facturation, des justificatifs et de sa comptabilité.

11. LIVRAISON, RETRAIT ET SUIVI
Lorsque des produits physiques sont vendus, l’acheteur doit fournir des coordonnées exactes. La structure éditrice précise les modes de livraison, zones desservies, délais estimatifs et éventuels numéros de suivi. En cas de retard, perte, erreur d’adresse ou difficulté de livraison, l’acheteur doit contacter la structure pour rechercher une solution.

12. DROIT DE RÉTRACTATION, RETOURS ET REMBOURSEMENTS
Si l’acheteur est un consommateur et que la réglementation applicable prévoit un droit de rétractation, la structure éditrice doit l’informer des conditions, délais, exclusions, frais de retour et modalités pratiques. Certains biens ou services peuvent être exclus du droit de rétractation, notamment selon leur nature personnalisée, périssable, numérique ou événementielle. Les retours et remboursements doivent être traités conformément aux règles applicables au pays déclaré par l’éditeur.

13. GARANTIES
Les garanties légales ou commerciales applicables dépendent du pays de la structure, du type de produit ou service et de la qualité de l’acheteur. La structure éditrice doit compléter cette section selon son activité réelle et les règles qui lui sont applicables.
` : `
9. ABSENCE DE VENTE EN LIGNE
Si aucune boutique ou commande payante n’est proposée sur le site, les présentes conditions ne constituent pas des conditions de vente de produits. Les pages de dons ou de contact ne doivent pas être présentées comme une vente si elles servent uniquement au soutien de la structure.
`}
14. FORMULAIRES, CONTACT ET MESSAGERIE
Les messages envoyés via le site sont transmis à la structure éditrice. Le visiteur doit fournir des informations exactes et ne pas envoyer de contenu illicite, abusif, diffamatoire ou portant atteinte aux droits de tiers.

15. COMPTE CLIENT OU DONATEUR
Lorsque le site propose un espace client ou donateur, celui-ci sert à retrouver des commandes, dons, favoris, messages ou informations transmises. L’utilisateur reste responsable de l’exactitude de ses informations et de la confidentialité de ses accès.

16. NEWSLETTER
L’inscription à la newsletter est facultative. La personne inscrite peut demander à ne plus recevoir de messages selon les modalités affichées ou en contactant la structure.

17. PROPRIÉTÉ INTELLECTUELLE
Les contenus du site restent la propriété de leurs titulaires. Toute reproduction, diffusion ou exploitation non autorisée est interdite.

18. RESPONSABILITÉ
La structure éditrice est responsable des contenus, produits, dons, campagnes, informations légales, reçus et communications publiés sur son site. EasyAsso fournit un outil technique de création et d’administration. La responsabilité de la structure ou d’EasyAsso ne peut être engagée pour un usage frauduleux, une information erronée fournie par un utilisateur, un service tiers, un cas de force majeure ou une interruption indépendante de sa volonté.

19. DONNÉES PERSONNELLES
Les données personnelles sont traitées selon les mentions légales et la politique de confidentialité affichées sur le site. Les informations collectées via les dons, commandes, formulaires et messages servent au traitement des demandes, au suivi administratif, comptable et relationnel.

20. MODIFICATION DES CONDITIONS
La structure éditrice peut modifier les présentes conditions. La version publiée sur le site au moment de l’utilisation ou de la commande est la version applicable.

21. RÉCLAMATIONS, MÉDIATION ET LITIGES
Toute réclamation doit d’abord être adressée à la structure éditrice. ${kind === 'france' && hasShop ? 'Si l’acheteur est un consommateur et qu’un dispositif de médiation de la consommation est applicable, la structure doit indiquer les coordonnées du médiateur compétent avant publication définitive.' : 'Les modalités de médiation ou de règlement des litiges doivent être complétées selon le pays et l’activité de la structure.'} À défaut de solution amiable, les juridictions compétentes sont déterminées selon les règles applicables.

Document généré automatiquement par EasyAsso à partir des informations fournies par l’éditeur. Il doit être relu, complété et validé par la structure avant publication.`;

  return { details: mentions, cgv };
}

function enDocuments(profile: LegalProfile, associationName: string) {
  const name = clean(profile.legalName) || associationName;
  const country = detectCountry(profile);
  const act = activity(profile);
  const hasShop = act === 'shop' || act === 'association_shop';
  const isAssociation = act === 'association' || act === 'association_shop';
  const methods = paymentMethods(profile, true);
  const mission = clean(profile.mission);
  const details = detailsList(profile, associationName, true);

  const mentions = `LEGAL NOTICE, PRIVACY AND COOKIES

Last updated: ${new Date().toLocaleDateString('en-GB')}.

1. WEBSITE PUBLISHER
${details || `Website publisher: ${name}`}

${mission ? `Declared activity: ${mission}` : `Declared activity: ${isAssociation ? 'presentation of an organization, its work and support options' : hasShop ? 'presentation of an activity and online sale of products or services' : 'presentation of a project or organization'}.`}

2. COUNTRY AND LEGAL FRAMEWORK TO CHECK
${countryLawNotice(country, true)}

3. HOSTING AND TECHNICAL PROVIDER
The website is created and administered with EasyAsso, operated by ${platformLegal.companyName}. Technical hosting is provided by ${platformLegal.hostName}, ${platformLegal.hostAddress}, website: ${platformLegal.hostWebsite}. The publishing organization remains responsible for the content, images, copy, products, campaigns, donations and information it publishes.

4. PERSONAL DATA
The website may collect data through contact, donation, newsletter, order, customer-account or message forms: identity, email, phone, address, donation or order history, delivery details, supporting documents, contact preferences and message content.

5. PURPOSES AND LEGAL BASES
Data is used to answer messages, manage donations, prepare receipts or supporting documents, process orders, organize delivery, manage donor or customer relations, send newsletters where requested, maintain accounting records and secure the website. Depending on the case, processing may rely on contract performance, legal obligation, legitimate interest or consent.

6. RETENTION
Contact messages are kept as long as needed to handle the request. Donation, payment, order, receipt, supporting-document and accounting data may be kept for legally required periods. Newsletter data is kept until unsubscribe or consent withdrawal.

7. RECIPIENTS AND THIRD-PARTY SERVICES
Data may be accessed by authorized people within the publishing organization and by service providers required to operate the website: EasyAsso, hosting provider, email provider, payment providers or connected platforms such as Stripe, HelloAsso or Leetchi when enabled. Third-party services may apply their own terms and privacy policies.

8. RIGHTS
Individuals may request access, correction, deletion, restriction, objection or portability where applicable. Requests should be sent to the contact details above.

9. COOKIES
The website may use cookies required for operation, security, cart, login or analytics where enabled. Non-essential cookies should be subject to consent where required by applicable law.

10. EXTERNAL LINKS AND REPORTING
The website may link to third-party services. The publishing organization is not responsible for external content or policies. To report unlawful content, an error, rights infringement or a privacy request, contact the publisher above.

Automatically generated by EasyAsso from information supplied by the publisher. It must be reviewed, completed and validated by the organization before publication.`;

  const cgv = `TERMS OF USE${hasShop ? ', SALE' : ''} AND DONATIONS

Last updated: ${new Date().toLocaleDateString('en-GB')}.

1. PURPOSE
These terms govern access to the website of ${name}, use of its content and forms, contact requests, donations or contributions${hasShop ? ', and orders placed through the shop' : ''} where those features are offered.

2. ORGANIZATION DETAILS
${details || `Website publisher: ${name}`}

3. APPLICABLE FRAMEWORK
${countryLawNotice(country, true)}

4. WEBSITE ACCESS AND USE
The website may be interrupted for maintenance or technical reasons. Visitors must use it fairly, provide accurate information and avoid unlawful, fraudulent or disruptive use.

5. DONATIONS, CONTRIBUTIONS AND PAYMENT METHODS
${isAssociation ? 'Donations and contributions support the organization’s mission and activities.' : 'Contributions or payments are made according to the information shown on the website.'} The payment methods currently planned or enabled are: ${methods}. The amount, purpose and essential information should be shown before validation.

6. RECEIPTS AND TAX MATTERS
The publishing organization is solely responsible for checking whether it may issue tax receipts or supporting documents and for complying with applicable tax rules. Receipts should include accurate information: donor identity, amount, date, payment method and transaction or transfer reference where available.
${hasShop ? `
7. SHOP, PRODUCTS AND ORDERS
Products, services, prices, availability, costs, delivery times and delivery terms are those shown on the website when the order is placed. The publishing organization is responsible for product descriptions, images, stock, prices, taxes, order processing, invoices and accounting.

8. DELIVERY, WITHDRAWAL, RETURNS AND WARRANTIES
For physical products, the buyer must provide accurate delivery details. The publishing organization should state delivery methods, territories, estimated times and tracking information where available. Consumer withdrawal rights, exclusions, returns, refunds and warranties depend on the country declared by the publisher and the type of product or service. This section must be completed according to the real activity.
` : `
7. NO ONLINE SALE
If no shop or paid order is offered, these terms are not product-sale terms. Donation and contact pages should not be presented as sales if they only support the organization.
`}
9. CONTACT, CUSTOMER OR DONOR ACCOUNT AND NEWSLETTER
Messages are sent to the publishing organization. Where a customer or donor area exists, it helps users find orders, donations, favorites, messages or submitted information. Newsletter subscription is optional and may be withdrawn.

10. INTELLECTUAL PROPERTY AND LIABILITY
Website content remains the property of its respective owners. The publishing organization is responsible for its content, products, donations, campaigns, legal information, receipts and communications. EasyAsso provides a technical creation and administration tool.

11. PERSONAL DATA
Personal data is handled according to the legal notice and privacy information displayed on the website.

12. CHANGES, CLAIMS AND DISPUTES
The publishing organization may update these terms. Claims should first be sent to the organization. Mediation and dispute rules must be completed according to the organization’s country and activity.

Automatically generated by EasyAsso from information supplied by the publisher. It must be reviewed, completed and validated by the organization before publication.`;

  return { details: mentions, cgv };
}

export function legalDocuments(profile: LegalProfile, associationName: string) {
  return profile.language === 'en' ? enDocuments(profile, associationName) : frDocuments(profile, associationName);
}
