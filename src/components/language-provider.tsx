'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Languages } from 'lucide-react';

type Locale = 'fr' | 'en';

const translations: Record<string, string> = {
  'Connexion': 'Log in', 'Créer mon site': 'Create my website', 'Créer un compte': 'Create an account',
  'Se connecter': 'Log in', 'Se déconnecter': 'Log out', 'Adresse e-mail': 'Email address', 'Mot de passe': 'Password',
  'Nom complet': 'Full name', 'Nom de l’association': 'Association name', 'Retour à l’accueil': 'Back to home',
  'Tableau de bord': 'Dashboard', 'Générateur magique': 'Magic generator', 'Éditeur du site': 'Website editor',
  'Identité (logo, couleurs)': 'Brand (logo, colors)', 'Modèles de site': 'Website templates', 'Dons': 'Donations',
  'Campagnes': 'Campaigns', 'Donateurs (CRM)': 'Donors (CRM)', 'Comptabilité': 'Accounting',
  'Statistiques': 'Analytics', 'Équipe & rôles': 'Team & roles', 'Réglages': 'Settings', 'Voir mon site': 'View my website',
  'en ligne': 'live', 'brouillon': 'draft', 'Enregistrer': 'Save', 'Annuler': 'Cancel', 'Supprimer': 'Delete',
  'Modifier': 'Edit', 'Ajouter': 'Add', 'Créer': 'Create', 'Fermer': 'Close', 'Continuer': 'Continue',
  'Accepter': 'Accept', 'Refuser': 'Reject', 'Cookies et confidentialité': 'Cookies and privacy',
  'EasyAsso utilise des cookies nécessaires au fonctionnement du site et, si vous l’acceptez, des cookies de mesure pour améliorer l’expérience.': 'EasyAsso uses cookies that are necessary for the website to work and, if you accept them, analytics cookies to improve the experience.',
  'Retour': 'Back', 'Suivant': 'Next', 'Rechercher': 'Search', 'Exporter': 'Export', 'Aucun résultat': 'No results',
  'Chargement…': 'Loading…', 'Vérification…': 'Checking…', 'Publié': 'Published', 'Non publié': 'Unpublished',
  'Accueil': 'Home', 'À propos': 'About', 'Pages': 'Pages', 'Titre': 'Title', 'Texte': 'Text', 'Image': 'Image', 'Vidéo': 'Video',
  'Bouton': 'Button', 'Couleur': 'Color', 'Alignement': 'Alignment', 'Gauche': 'Left', 'Centre': 'Center', 'Droite': 'Right',
  'Plein': 'Filled', 'Contour': 'Outline', 'Lien': 'Link', 'Nom': 'Name', 'E-mail': 'Email', 'Téléphone': 'Phone',
  'Date': 'Date', 'Montant': 'Amount', 'Statut': 'Status', 'Actions': 'Actions', 'Description': 'Description',
  'Catégorie': 'Category', 'Recette': 'Income', 'Dépense': 'Expense', 'Solde': 'Balance', 'Total': 'Total',
  'Donateur': 'Donor', 'Campagne': 'Campaign', 'Reçu fiscal': 'Tax receipt', 'Moyen de paiement': 'Payment method',
  'Ajouter une page': 'Add a page', 'Nouvelle page': 'New page', 'Renommer': 'Rename', 'Ajouter un bloc': 'Add a block',
  'Publier le site': 'Publish website', 'Dépublier': 'Unpublish', 'Aperçu': 'Preview', 'Prévisualiser': 'Preview',
  'Choisir ce modèle': 'Choose this template', 'Utiliser ce modèle': 'Use this template', 'Personnaliser': 'Customize',
  'Générer mon site': 'Generate my website', 'Génération en cours…': 'Generating your website…',
  'Votre site est prêt !': 'Your website is ready!', 'Cause / type d’association': 'Cause / association type',
  'Année de création': 'Year founded', 'Mission et raison d’être': 'Mission and purpose', 'Fonctionnement': 'How you operate',
  'Actions concrètes': 'Key activities', 'Public accompagné': 'People you support', 'Informations importantes': 'Key information',
  'Ville / territoire': 'City / area', 'E-mail public': 'Public email', 'Enregistrer la fiche': 'Save association profile',
  'Fiche de l’association': 'Association profile', 'Général': 'General', 'Adresse de votre site': 'Your website address',
  'Nom de domaine personnalisé': 'Custom domain', 'Adresse personnalisée de l’association': 'Custom association address',
  'J’ai déjà une adresse': 'I already own a domain', 'Je veux acheter une adresse': 'I want to buy a domain',
  'Quelle adresse appartient à l’association ?': 'Which domain belongs to the association?',
  'Vérifier si tout est prêt': 'Check if everything is ready', 'Branchement à terminer': 'Setup required', 'Prêt': 'Ready',
  'Abonnement': 'Plan', 'Paiement unique — accès à vie': 'One-time payment — lifetime access',
  'Essai gratuit': 'Free trial', 'Paiement en attente': 'Payment pending', 'Formule actuelle :': 'Current plan:',
  'Upgrade demandé :': 'Upgrade requested:', 'Votre formule active.': 'Your active plan.',
  'Formule inférieure à votre abonnement actuel.': 'Lower than your current plan.',
  'Si vous êtes en essai ou en attente de paiement, choisissez une formule pour activer durablement votre site. Si vous êtes déjà actif, seuls les upgrades sont proposés pour éviter les doubles changements contradictoires.': 'If you are on a trial or waiting for payment, choose a plan to keep your website active. If you are already active, only upgrades are offered to avoid conflicting plan changes.',
  'Prélèvement mensuel par carte.': 'Monthly card payment.',
  'Paiement annuel, carte ou virement.': 'Annual payment, card or bank transfer.',
  'Paiement unique, carte ou virement.': 'One-time payment, card or bank transfer.',
  'Payer': 'Pay', 'Passer à': 'Upgrade to', 'Ouverture…': 'Opening…',
  'Créer une campagne': 'Create campaign', 'Ajouter un don': 'Add donation', 'Ajouter un donateur': 'Add donor',
  'Ajouter une transaction': 'Add transaction', 'Inviter un membre': 'Invite a member', 'Créer un rôle': 'Create role',
  'Meilleurs donateurs': 'Top donors', 'Dons récents': 'Recent donations', 'Activité récente': 'Recent activity',
  'Tous les donateurs': 'All donors', 'Toutes les campagnes': 'All campaigns', 'Toutes les transactions': 'All transactions',
  'Objectif': 'Goal', 'Collecté': 'Raised', 'Progression': 'Progress', 'Actif': 'Active', 'Terminée': 'Completed',
  'Rôle': 'Role', 'Permissions': 'Permissions', 'Propriétaire': 'Owner', 'Administrateur': 'Administrator',
  'Éditeur': 'Editor', 'Comptable': 'Accountant', 'Membre': 'Member', 'Lecteur': 'Viewer',
  'Logo principal': 'Main logo', 'Logo du pied de page': 'Footer logo', 'Couleurs de la marque': 'Brand colors',
  'Couleur principale': 'Primary color', 'Couleur secondaire': 'Secondary color', 'Importer une image': 'Upload an image',
  'Tout est inclus': 'Everything is included', 'Une offre unique, tout compris': 'One simple, all-inclusive offer',
  'paiement unique — pas d’abonnement caché': 'one-time payment — no hidden subscription',
  'Créer le site de mon association': 'Create my association website', 'J’ai déjà un compte': 'I already have an account',
  'Paiement unique · Site illimité · Sans engagement': 'One-time payment · Unlimited website · No commitment',
  'Pensé pour les associations, simple pour tous': 'Built for associations, simple for everyone',
  'Désormais ouvert à tous': 'Now open to everyone',
  'Votre site internet,': 'Your website,',
  'Le site de votre association,': 'Your association website,', 'en ligne en': 'online in', 'quelques minutes': 'just a few minutes',
  'Associations, boutiques, entreprises, créateurs : créez, éditez et gérez tout vous-même, sans aucune compétence technique. Dons, ventes, contacts, comptabilité et statistiques inclus. En totale autonomie.': 'Associations, shops, businesses and creators: create, edit and manage everything yourself, with no technical skills. Donations, sales, contacts, accounting and analytics included. Completely independently.',
  'Créez, éditez et gérez tout vous-même, sans aucune compétence technique. Dons, donateurs,': 'Create, edit and manage everything yourself, with no technical skills. Donations, donors,',
  'comptabilité et statistiques inclus. En totale autonomie.': 'accounting and analytics included. Completely independently.',
  'Commencer — 250 € une seule fois': 'Get started — €250 once',
  'Commencer — dès': 'Get started — from', 'Commencer —': 'Get started —', '€ / mois': '€/month', '€ une seule fois': '€ once',
  '3 jours gratuits, sans carte bancaire': '3-day free trial, no credit card required',
  'Site illimité': 'Unlimited website', 'Sans engagement': 'No commitment',
  'Testez tout gratuitement pendant 3 jours. Payez seulement si EasyAsso vous convient.': 'Try everything free for 3 days. Pay only if EasyAsso works for you.',
  'Cliquez, écrivez, glissez. Ce que vous voyez est ce que vos visiteurs verront.': 'Click, write and arrange. What you see is what your visitors will see.',
  'Titres, textes, images, vidéos, réseaux sociaux, alignements et boutons configurables.': 'Configurable headings, copy, images, videos, social links, alignment and buttons.',
  'Collectez via Stripe ou reliez HelloAsso. Reçus fiscaux et classement des donateurs.': 'Collect through Stripe or connect HelloAsso. Tax receipts and donor rankings.',
  'Collectez via Stripe, virement, chèque ou connectez HelloAsso en un clic. Reçus fiscaux et classement des donateurs.': 'Collect via Stripe, bank transfer, cheque or connect HelloAsso in one click. Tax receipts and donor rankings.',
  'Collectez via Stripe, virement, chèque, HelloAsso en un clic ou cagnotte Leetchi. Reçus fiscaux et classement des donateurs.': 'Collect via Stripe, bank transfer, cheque, one-click HelloAsso or a Leetchi money pot. Tax receipts and donor rankings.',
  'Base de donateurs, rôles et permissions détaillés pour vos bénévoles.': 'Donor database, detailed roles and permissions for your volunteers.',
  'Recettes, dépenses, catégories, exports comptables et statistiques.': 'Income, expenses, categories, accounting exports and analytics.',
  'Un sous-domaine offert immédiatement, votre domaine personnalisé en quelques clics.': 'An EasyAsso address included immediately, with your custom domain connectable in a few clicks.',
  'Renseignez le nom de votre association.': 'Enter your association name.',
  'Testez 3 jours gratuitement': 'Try it free for 3 days',
  'Aucune carte bancaire à l’inscription.': 'No credit card required at signup.',
  'Gardez EasyAsso pour 250 €': 'Keep EasyAsso for €250',
  'Paiement unique ensuite, depuis votre tableau de bord.': 'One-time payment later, from your dashboard.',
  'Paiement unique et sécurisé. Accès immédiat.': 'Secure one-time payment. Immediate access.',
  'Une adresse est générée automatiquement pour vous.': 'An address is generated automatically for you.',
  'Puis reliez votre propre nom de domaine.': 'Then connect your own domain.',
  'Easy Asso · Une Digitale · Créé pour les associations': 'Easy Asso · Une Digitale · Built for associations',
  'CGV': 'Terms',
  'Mentions légales': 'Legal notice',
  'Confidentialité': 'Privacy',
  'Actualités à publier (optionnel)': 'News to publish (optional)',
  'La page Actualités sera créée uniquement si vous ajoutez du contenu ici.': 'The News page is created only when you add content here.',
  'Réseaux sociaux': 'Social media', 'Informations légales': 'Legal information',
  'Nom légal complet': 'Full legal name', 'Numéro RNA / SIREN / enregistrement': 'RNA / SIREN / registration number',
  'Adresse du siège social': 'Registered office address', 'Pays légal': 'Legal country',
  'Pays légal pour les CGV / mentions': 'Legal country for terms / legal notices',
  'France, Belgique, Canada…': 'France, Belgium, Canada…',
  'Utilisé pour adapter les documents au pays déclaré dans vos coordonnées légales.': 'Used to adapt the documents to the country declared in your legal details.',
  'Responsable de publication': 'Publication manager',
  'Éditeur visuel bloc par bloc': 'Block-by-block visual editor', '50 couleurs & boutons sur mesure': '50 colors & custom buttons',
  'Dons, reçus & campagnes': 'Donations, receipts & campaigns', 'CRM & équipe': 'CRM & team',
  'Comptabilité complète': 'Complete accounting', 'Votre nom de domaine': 'Your custom domain',
  'Support Stripe, HelloAsso & Leetchi': 'Stripe, HelloAsso & Leetchi support',
  'Créez votre compte': 'Create your account', 'Votre site est en ligne': 'Your website goes live',
  'Personnalisez tout': 'Customize everything', 'Réglez 250 €': 'Pay €250',
  'Une erreur est survenue.': 'Something went wrong.', 'Impossible d’enregistrer.': 'Unable to save.',
  'Découvrez l’outil magique': 'Discover the magic builder',
  'Votre projet raconté avec justesse, votre site créé en quelques minutes': 'Your project told accurately, your website created in minutes',
  'Renseignez votre activité, votre histoire, ce que vous faites et vos coordonnées. L’outil magique transforme ces informations en un véritable site complet, structuré et différent pour chaque projet.': 'Enter your activity, your story, what you do and your contact details. The magic builder turns this information into a complete, structured website that is different for every project.',
  'Votre association racontée avec justesse, votre site créé en quelques minutes': 'Your association told authentically, your website created in minutes',
  'Renseignez votre cause, votre histoire, vos actions et vos coordonnées. L’outil magique transforme ces informations en un véritable site complet, structuré et différent pour chaque association.': 'Share your cause, story, activities and contact details. The magic builder turns them into a complete, structured website uniquely crafted for each association.',
  '1. Précisez votre projet': '1. Define your project',
  'Association, boutique / commerce ou autre site : EasyAsso adapte les questions et récupère les informations utiles.': 'Association, shop / commerce or another website: EasyAsso adapts the questions and collects the useful information.',
  'Association, boutique / commerce ou autre site : EasyAsso adapte les questions. Pour une boutique, vous indiquez l’univers, le type de produits, les marques, les catégories, le style et les informations utiles.': 'Association, shop / commerce or another website: EasyAsso adapts the questions. For a shop, you describe the universe, product type, brands, categories, style and useful information.',
  '2. Laissez construire': '2. Let it build',
  '2. Laissez la magie construire': '2. Let the magic build',
  'Pages, textes, boutique, appels au don, CGV et mentions légales : la base est préparée automatiquement.': 'Pages, copy, shop, donation appeals, terms and legal notices: the foundation is prepared automatically.',
  'L’outil prépare les pages, les textes, la boutique, les appels au don, les CGV, les mentions légales et les sections importantes selon les informations données.': 'The builder prepares pages, copy, the shop, donation appeals, terms, legal notices and important sections based on the information provided.',
  '3. Ajustez simplement': '3. Adjust simply',
  '3. Ajustez tout simplement': '3. Adjust everything simply',
  'Vous modifiez ensuite textes, images, couleurs, boutons, pages, produits, menus et footer dans l’éditeur visuel.': 'You then edit copy, images, colors, buttons, pages, products, menus and footer in the visual editor.',
  'Rien n’est figé : vous modifiez immédiatement les textes, images, couleurs, boutons, pages, menus, produits et footer dans l’éditeur visuel.': 'Nothing is locked: you immediately edit copy, images, colors, buttons, pages, menus, products and footer in the visual editor.',
  '1. Parlez-nous de votre association': '1. Tell us about your association',
  'Un questionnaire simple, prérempli avec les informations déjà enregistrées dans vos réglages.': 'A simple questionnaire, pre-filled with the information already saved in your settings.',
  '2. Laissez la magie opérer': '2. Let the magic happen',
  'L’outil rédige des textes développés, choisit une structure adaptée à votre cause et compose toutes les pages.': 'The builder writes substantial copy, chooses a structure suited to your cause and creates every page.',
  '3. Gardez le contrôle': '3. Stay in control',
  'Tout est immédiatement modifiable dans l’éditeur visuel : textes, images, couleurs, boutons, pages, menu et pied de page.': 'Everything is immediately editable in the visual editor: copy, images, colors, buttons, pages, navigation and footer.',
  'Un questionnaire clair, pas un tunnel compliqué': 'A clear questionnaire, not a complicated tunnel',
  'Les utilisateurs voient tout de suite quoi remplir selon leur projet : association, boutique / commerce ou autre site. Logo, mission, offre, actualités, CGV et mentions légales restent guidés. Sur mobile, les aperçus restent petits et se parcourent au doigt.': 'Users immediately see what to fill in depending on their project: association, shop / commerce or another website. Logo, mission, offer, news, terms and legal notices remain guided. On mobile, previews stay compact and can be swiped through.',
  'Les utilisateurs voient tout de suite quoi remplir selon leur projet : association, boutique / commerce ou autre site. Logo, mission, offre, actualités, CGV et mentions légales restent guidés.': 'Users immediately see what to fill in depending on their project: association, shop / commerce or another website. Logo, mission, offer, news, terms and legal notices remain guided.',
  'À droite, faites défiler les captures pour voir les deux versions du questionnaire. Sur mobile, le défilement se fait naturellement au doigt.': 'On the right, scroll through the screenshots to see both questionnaire versions. On mobile, scrolling works naturally with your finger.',
  'Aperçu scrollable': 'Scrollable preview',
  'Mini aperçu scrollable': 'Small scrollable preview',
  'Questionnaire association': 'Association questionnaire',
  'Questionnaire boutique': 'Shop questionnaire',
  'Questionnaires en aperçu scrollable': 'Scrollable questionnaire previews',
  'Type': 'Type',
  'Association · Boutique · Autre': 'Association · Shop · Other',
  'Association · Boutique · Autre projet': 'Association · Shop · Other project',
  'Contenus': 'Content',
  'Site · dons · boutique · contact': 'Website · donations · shop · contact',
  'Exemple boutique': 'Shop example',
  'Bougies · bijoux · produits solidaires': 'Candles · jewelry · solidarity products',
  'Analyse': 'Analysis',
  'Pas de copier-coller': 'No copy-paste',
  'L’outil lit vos réponses, choisit les pages utiles et rédige des textes structurés.': 'The builder reads your answers, chooses useful pages and writes structured copy.',
  'Le générateur lit vos réponses, évite le copier-coller, choisit les pages utiles et transforme vos informations en textes structurés.': 'The generator reads your answers, avoids copy-and-paste, chooses useful pages and turns your information into structured copy.',
  'Résultat': 'Result',
  'Un site prêt, mais chaque bloc reste modifiable dans l’éditeur visuel.': 'A ready website, while every block remains editable in the visual editor.',
  'Site vitrine, appel au don, boutique, contact, actualités, documents légaux et tableau de bord restent prêts à modifier.': 'Showcase website, donation appeal, shop, contact, news, legal documents and dashboard are ready to edit.',
  '7 pages et 31 sections prêtes': '7 pages and 31 sections ready',
  'Textes approfondis · navigation · appels à l’action · contact': 'Detailed copy · navigation · calls to action · contact',
  'Cause, mission, fonctionnement, dons, CGV et actualités.': 'Cause, mission, operations, donations, terms and news.',
  'Boutique / commerce': 'Shop / commerce',
  'Univers de marque, offre, logo, pages et boutique prête à remplir.': 'Brand universe, offer, logo, pages and a shop ready to fill in.',
  'Un nouveau départ à chaque génération': 'A fresh start with every generation',
  'Lorsque vous recommencez, l’ancien site est entièrement remplacé. Aucun ancien texte, logo ou bloc ne vient polluer la nouvelle création.': 'When you start again, the previous website is fully replaced. No old copy, logo or block carries over into the new creation.',
  'Il prépare aussi les parties compliquées': 'It also prepares the complicated parts',
  'Pas besoin de savoir rédiger une page légale, construire un appel au don ou organiser les informations du tableau de bord : l’outil magique pose les bases, vous ajustez ensuite si besoin.': 'No need to know how to write legal pages, build a donation journey or organize dashboard data: the magic builder lays the groundwork, and you adjust it afterwards if needed.',
  'Un backend très complet, une interface “pour les nuls”. Pas besoin de savoir rédiger une page légale, construire un appel au don, lancer une boutique ou organiser les informations du tableau de bord : EasyAsso pose les bases, vous gardez le contrôle de A à Z.': 'A very complete backend with a truly beginner-friendly interface. No need to know how to write legal pages, build a donation journey, launch a shop or organize dashboard data: EasyAsso lays the groundwork, and you stay in control from A to Z.',
  'Pages, menus, textes, images, vidéos, boutons et couleurs restent modifiables directement.': 'Pages, menus, copy, images, videos, buttons and colors remain directly editable.',
  'Titres, réseaux sociaux, alignements, boutons pleins ou contours : tout se personnalise simplement.': 'Headings, social links, alignment, filled or outlined buttons: everything is easy to customize.',
  'Boutique / commerce inclus': 'Shop / commerce included',
  'Produits, univers de marque, pages boutique et contenus adaptés si le projet vend quelque chose.': 'Products, brand universe, shop pages and adapted content when the project sells something.',
  'Sites artistes & musique': 'Artist & music websites',
  'Pages artistes, pochettes, derniers sons, vidéos et liens Spotify, Deezer, SoundCloud, YouTube et Instagram.': 'Artist pages, cover art, latest tracks, videos and Spotify, Deezer, SoundCloud, YouTube and Instagram links.',
  'Collecte par carte, virement, chèque, HelloAsso ou Leetchi, avec suivi des donateurs et reçus.': 'Collect by card, bank transfer, cheque, HelloAsso or Leetchi, with donor tracking and receipts.',
  'CGV et mentions légales générées': 'Generated terms and legal notices',
  'EasyAsso prépare des documents détaillés à partir des informations légales de l’association, puis vous pouvez les modifier.': 'EasyAsso prepares detailed documents from the association’s legal information, and you can edit them afterwards.',
  'Questionnaire de dons prêt à l’emploi': 'Ready-to-use donation questionnaire',
  'Montants proposés, don libre, coordonnées donateur, carte, virement ou chèque : tout est déjà structuré.': 'Suggested amounts, custom donation, donor details, card, bank transfer or cheque: everything is already structured.',
  'Montants proposés, don libre, coordonnées donateur, carte, HelloAsso, virement ou chèque : tout est déjà structuré.': 'Suggested amounts, custom donation, donor details, card, HelloAsso, bank transfer or cheque: everything is already structured.',
  'HelloAsso connecté en un clic': 'HelloAsso connected in one click',
  'Collez simplement votre lien HelloAsso : EasyAsso l’ajoute automatiquement au formulaire de dons de votre site.': 'Simply paste your HelloAsso link: EasyAsso automatically adds it to your website donation form.',
  'Cagnotte Leetchi intégrée': 'Integrated Leetchi money pot',
  'Ajoutez votre lien Leetchi pour afficher une cagnotte avec jauge et bouton de participation directement sur le site.': 'Add your Leetchi link to display a money pot with a progress bar and contribution button directly on the website.',
  'CRM, stats et comptabilité': 'CRM, analytics and accounting',
  'Dons, donateurs, reçus, recettes, dépenses, exports et statistiques remontent dans le tableau de bord.': 'Donations, donors, receipts, income, expenses, exports and analytics all flow into the dashboard.',
  'Nom de domaine guidé': 'Guided custom domain',
  'Sous-domaine immédiat, domaine personnalisé seulement quand il est vraiment prêt.': 'Instant EasyAsso address, with the custom domain shown only when it is truly ready.',
  'Site et espace en français ou en anglais': 'Website and workspace in French or English',
  'La langue choisie à l’inscription ou dans les réglages est respectée dans le générateur, le profil et les pages créées.': 'The language chosen at registration or in settings is respected in the generator, profile and generated pages.',
  'Contact, messages et données utiles': 'Contact, messages and useful data',
  'Les vraies coordonnées, le formulaire de contact, les messages reçus et les informations donateurs remontent dans le tableau de bord.': 'Real contact details, the contact form, received messages and donor information all flow back into the dashboard.',
  'Contact et messagerie': 'Contact and inbox',
  'Les vraies coordonnées, le formulaire de contact et les messages reçus arrivent dans l’espace utilisateur.': 'Real contact details, the contact form and received messages arrive in the user workspace.',
  'Connexions sur mesure': 'Custom connections',
  'Des espaces connectés pour tous vos liens en ligne': 'Connected spaces for all your online links',
  'Pour les associations, les boutiques et les sites artistes : EasyAsso crée des emplacements adaptés pour afficher vos liens, vos contenus et vos collectes, toujours reliés aux plateformes d’origine.': 'For associations, shops and artist websites: EasyAsso creates the right spaces to display your links, content and fundraising, always connected to the original platforms.',
  'Plateformes connectées': 'Connected platforms',
  'Les liens restent gérés sur chaque plateforme et s’affichent dans le bon format sur votre site.': 'Links remain managed on each platform and appear in the right format on your website.',
  'Tableau de bord : dons, CRM, comptabilité, statistiques et édition du site au même endroit.': 'Dashboard: donations, CRM, accounting, analytics and website editing in one place.',
  'Tableau de bord : boutique, dons, CRM, comptabilité, statistiques et édition du site au même endroit.': 'Dashboard: shop, donations, CRM, accounting, analytics and website editing in one place.',
  'Démarche responsable': 'Responsible approach',
  'Un site utile, et plus sobre': 'A useful website, with a lighter footprint',
  'Le numérique n’est jamais sans impact. Notre approche est de le réduire concrètement : une seule infrastructure partagée par toutes les associations plutôt que des sites sur-mesure refaits tous les trois ans, des pages légères servies depuis un cache, des images compressées, et la dématérialisation des reçus, des newsletters et des dons.': 'Digital tools always have an impact. Our approach is to reduce it in practical ways: one shared infrastructure for all organizations instead of custom websites rebuilt every few years, lightweight cached pages, compressed images, and paperless receipts, newsletters and donations.',
  'Mutualisé': 'Shared infrastructure',
  'Une infrastructure partagée plutôt qu’un site sur-mesure par association.': 'One shared infrastructure instead of a custom setup for every organization.',
  'Pages en cache': 'Cached pages',
  'Servies depuis un CDN : moins de calcul à chaque visite.': 'Served from a CDN: less processing on every visit.',
  'Images optimisées': 'Optimized images',
  'Compressées et dimensionnées pour alléger le chargement.': 'Compressed and resized to keep pages lighter.',
  'Dématérialisé': 'Paperless',
  'Reçus, newsletters et dons en ligne : moins de papier et d’envois.': 'Receipts, newsletters and online donations: less paper and fewer mailings.',
  'Empreinte estimée': 'Estimated footprint',
  'de CO₂e par page vue (estimation)': 'CO₂e per page view (estimate)',
  'Estimation basée sur le poids de nos pages et le modèle Sustainable Web Design. À titre de repère, une page web classique est souvent plus lourde et émet davantage. Le numérique reste un usage à impact : nous cherchons à le réduire, pas à le nier.': 'Estimate based on our page weight and the Sustainable Web Design model. As a reference point, a typical web page is often heavier and emits more. Digital use still has an impact: we aim to reduce it, not deny it.',
  'Trois formules, tout compris': 'Three all-inclusive plans',
  'Choisissez ce qui vous convient : au mois, à l’année ou à vie. Mêmes fonctionnalités. Paiement par carte ou par virement.': 'Choose what suits you: monthly, yearly or lifetime. Same features. Payment by card or bank transfer.',
  'Tous les outils sont inclus dans chaque formule. Seule la durée change : mensuel, annuel ou accès à vie. L’adresse EasyAsso et l’hébergement sont inclus ; un domaine personnalisé peut être connecté s’il est acheté séparément.': 'All tools are included in every plan. Only the duration changes: monthly, yearly or lifetime access. The EasyAsso address and hosting are included; a custom domain can be connected if it is purchased separately.',
  'Mensuel': 'Monthly', 'Annuel': 'Yearly', 'À vie': 'Lifetime',
  'Sans engagement, résiliable à tout moment.': 'No commitment, cancel anytime.',
  'Même outil complet, réglé une fois pour l’année.': 'The same complete tool, paid once for the year.',
  '2 mois offerts par rapport au mensuel.': 'Two months free compared with monthly billing.',
  'Un seul paiement, plus jamais d’abonnement.': 'One payment, no subscription ever again.',
  'Le plus tranquille': 'The most peaceful option',
  'Éditeur visuel complet': 'Complete visual editor',
  'Adresse EasyAsso incluse avec l’hébergement': 'EasyAsso address included with hosting',
  'Domaine personnalisé connectable s’il est acheté séparément': 'Custom domain connectable if purchased separately',
  'Boutique, dons, reçus & campagnes': 'Shop, donations, receipts & campaigns',
  'Stripe, HelloAsso & Leetchi inclus': 'Stripe, HelloAsso & Leetchi included',
  'CRM donateurs, comptabilité & statistiques': 'Donor CRM, accounting & analytics',
  'Choisir le mensuel —': 'Choose monthly —',
  'Choisir l’annuel —': 'Choose yearly —',
  'Choisir à vie —': 'Choose lifetime —',
  'Vous pouvez tester gratuitement 3 jours avant de choisir, et changer de formule à tout moment avant de payer.': 'You can try everything free for 3 days before choosing, and change plans anytime before paying.',
  'Pour les associations, les boutiques et les créateurs': 'For associations, shops and creators',
  'Ce que l’outil prépare pour vous': 'What the builder creates for you',
  'Une page d’accueil convaincante': 'A compelling homepage', 'Votre histoire et votre mission': 'Your story and mission',
  'Des pages dédiées à vos actions': 'Dedicated pages for your activities', 'Une présentation claire de votre impact': 'A clear presentation of your impact',
  'Des parcours pour adhérer, aider ou donner': 'Journeys to join, help or donate', 'Une page contact avec vos vraies coordonnées': 'A contact page with your real details',
  'Essayer l’outil magique': 'Try the magic builder', 'Aucune page générique copiée-collée': 'No generic copy-and-paste pages',
  'Créer le site de votre association': 'Create your association website', 'Votre nom': 'Your name', '6 caractères minimum': '6 characters minimum',
  'Déjà un compte ?': 'Already have an account?', 'Pas encore de compte ?': 'New to EasyAsso?', 'Votre site est activé 🎉': 'Your website is active 🎉',
  'Choisir le style de mon site': 'Choose my website style', 'Aller directement au tableau de bord': 'Go straight to the dashboard',
  'Votre adresse générée automatiquement': 'Your automatically generated address', 'Vous pourrez relier votre propre nom de domaine ensuite.': 'You can connect your own domain afterwards.',
  'Répondez au petit questionnaire : votre site complet, avec des textes développés, se crée tout seul.': 'Answer a short questionnaire: your complete website, with substantial copy, creates itself.',
  'Quel type de site voulez-vous créer ?': 'What type of website do you want to create?',
  'Ajouter aussi une boutique en ligne': 'Also add an online shop',
  'Une page Boutique prête à remplir sera créée (activable/désactivable ensuite).': 'A ready-to-fill Shop page will be created (you can enable/disable it afterwards).',
  'L’IA écrira un vrai site de boutique (univers, sélection, infos pratiques) — les produits s’ajoutent ensuite dans l’onglet Boutique.': 'The AI will write a real shop website (brand universe, selection, practical information) — products are then added from the Shop tab.',
  'L’IA adapte les textes et les pages à votre type de projet.': 'The AI adapts copy and pages to your project type.',
  'Générer mes CGV et mentions légales': 'Generate my terms and legal notices',
  'EasyAsso crée des documents détaillés et modifiables avec les informations légales enregistrées dans Réglages.': 'EasyAsso creates detailed, editable documents from the legal information saved in Settings.',
  'À propos / votre mission ★': 'About you / your mission ★', 'Champ le plus important — sert de base à tous les textes.': 'The most important field — it is the foundation for all your copy.',
  'Comment fonctionne l’association ?': 'How does the association operate?', 'Vos actions concrètes': 'Your key activities', 'Public aidé / bénéficiaires': 'People supported / beneficiaries',
  'Détection automatique ✨': 'Automatic detection ✨', 'Bon à savoir': 'Good to know', 'Email de contact': 'Contact email', 'Logo (optionnel)': 'Logo (optional)',
  'Vos photos (optionnel)': 'Your photos (optional)', 'Ajouter une photo': 'Add a photo', 'Création de votre site…': 'Creating your website…',
  '★ champ requis. Vous pourrez tout modifier ensuite dans l’éditeur.': '★ required field. You can edit everything afterwards.',
  'Voici la situation de votre association en un coup d’œil.': 'Here is your association at a glance.', 'Créez votre site en un clic ✨': 'Create your website in one click ✨',
  'Lancer le générateur': 'Launch the builder', 'Logo, polices & couleurs': 'Logo, fonts & colors', 'Choisir un modèle': 'Choose a template', 'Éditer mon site': 'Edit my website',
  'Dons des 12 derniers mois': 'Donations over the last 12 months', 'Derniers dons': 'Latest donations', 'Aucun don enregistré pour le moment.': 'No donations recorded yet.',
  'Identité du site': 'Website identity', 'Enregistré': 'Saved', 'Police d’écriture': 'Font', 'Couleurs du site': 'Website colors',
  'Couleur principale (boutons, accents)': 'Primary color (buttons, accents)', 'Couleur de fond du site': 'Website background color', 'Couleur du texte': 'Text color',
  'Votre association': 'Your association', 'Faire un don': 'Donate', 'Ensemble, changeons les choses': 'Together, let’s make a difference',
  'Bouton plein': 'Filled button', 'Bouton contour': 'Outline button', 'Importer': 'Upload', 'Retirer': 'Remove', 'Traitement…': 'Processing…', 'Choisir une image': 'Choose an image',
  'Votre base de contacts et le classement des meilleurs donateurs.': 'Your contact database and top donor ranking.', 'Rechercher un donateur…': 'Search donors…',
  'Aucun donateur': 'No donors', 'Total donné': 'Total donated', 'Prénom': 'First name', 'Code postal': 'Postal code', 'Particulier': 'Individual', 'Entreprise': 'Company', 'Notes': 'Notes',
  'Nouveau': 'New', 'Nouvelle': 'New', 'Libellé': 'Description', 'Aucune': 'None', 'Opération': 'Transaction', 'Export comptable': 'Accounting export',
  'Catégories :': 'Categories:', '+ ajouter': '+ add', 'Aucune opération enregistrée': 'No transactions recorded', 'Ajouter une opération': 'Add a transaction',
  'Nouvelle opération': 'New transaction', 'Nouvelle catégorie': 'New category', 'Recettes, dépenses, catégories et solde de votre association.': 'Income, expenses, categories and your association balance.',
  'Nom, adresse du site, nom de domaine et abonnement.': 'Name, website address, domain and plan.', 'Nom de l’association / du site': 'Association / website name',
  'Choisir une cause': 'Choose a cause', 'Votre adresse gratuite, disponible immédiatement :': 'Your free address, available immediately:',
  'Par exemple mon-association.fr': 'For example my-association.org', 'Nous vous guidons, sans abonnement d’hébergement inutile': 'We guide you, with no unnecessary hosting plan',
  '1. Choisissez et achetez votre adresse': '1. Choose and purchase your domain', 'Chercher une adresse disponible': 'Find an available domain', 'Dernière étape': 'Final step',
  'Gérez vos bénévoles et leurs permissions, dans le détail.': 'Manage volunteers and their permissions in detail.', 'Inviter': 'Invite', 'Membres': 'Members', '(vous)': '(you)',
  'Invitations en attente': 'Pending invitations', 'Rôles personnalisés': 'Custom roles', 'Nouveau rôle': 'New role',
  'Aucun rôle personnalisé. Les rôles système suffisent souvent.': 'No custom roles. System roles are often enough.', 'Envoyer l’invitation': 'Send invitation',
  'Nom du rôle': 'Role name', 'Enregistrer le rôle': 'Save role', 'Choisissez le style de votre site': 'Choose your website style',
  'Choisir': 'Choose', 'Appliquer ce modèle ?': 'Apply this template?', 'Appliquer': 'Apply', 'Audience du site': 'Website audience', 'Visiteurs': 'Visitors', 'Vues': 'Views',
  'Boutique en ligne': 'Online shop',
  'Activée — vos produits peuvent être affichés sur votre site.': 'Enabled — your products can be shown on your website.',
  'Désactivée — activez-la pour vendre en ligne.': 'Disabled — enable it to sell online.',
  'Activez la boutique ci-dessus pour commencer à ajouter des produits.': 'Enable the shop above to start adding products.',
  'Votre page Boutique est en ligne': 'Your Shop page is live',
  'Ajouter une page Boutique à votre site': 'Add a Shop page to your website',
  'Vos produits s’affichent avec catégories, recherche et tri, aux couleurs de votre site.': 'Your products appear with categories, search and sorting, in your website colors.',
  'Une page toute prête (catégories, recherche, grille) reliée à vos produits.': 'A ready-made page (categories, search, grid) connected to your products.',
  'Protection animale': 'Animal welfare', 'Environnement': 'Environment', 'Santé & handicap': 'Health & disability', 'Culture & patrimoine': 'Culture & heritage',
  'Club sportif': 'Sports club', 'Humanitaire': 'Humanitarian aid', 'Solidarité locale': 'Local solidarity', 'Aînés': 'Older people', 'Enfance & éducation': 'Children & education',
  'VIELUSOS en chiffres': 'VIELUSOS by the numbers', 'Un son qui résonne.': 'A sound that resonates.', 'Une audience qui ne cesse de grandir.': 'An audience that keeps growing.',
  'Prochaine date': 'Next date', 'Dates précédentes': 'Previous dates', 'Événement suivant': 'Next event', 'Billets': 'Tickets',
  'Espace client': 'Customer area', 'Connexion ou création de votre compte client': 'Sign in or create your customer account',
  'Adresse email': 'Email address', 'Connexion / inscription client': 'Sign in / create my customer account',
  'Comment nous joindre ?': 'How can we help?', 'Appeler': 'Call', 'Envoyer un SMS': 'Send a text', 'Envoyer un courriel': 'Send an email', 'Messagerie': 'Messaging',
};

const reverse = Object.fromEntries(Object.entries(translations).map(([fr, en]) => [en, fr]));
const normalizeForLookup = (value: string) => value.replace(/\s+/g, ' ').trim();
const normalizedTranslations = Object.fromEntries(Object.entries(translations).map(([fr, en]) => [normalizeForLookup(fr), en]));
const normalizedReverse = Object.fromEntries(Object.entries(reverse).map(([en, fr]) => [normalizeForLookup(en), fr]));
const LocaleContext = createContext({ locale: 'fr' as Locale, setLocale: (_: Locale) => {}, t: (value: string) => value });
const originalText = new WeakMap<Text, { source: string; rendered: string }>();
const originalAttributes = new WeakMap<Element, Record<string, { source: string; rendered: string }>>();

function translateText(value: string, locale: Locale) {
  const leading = value.match(/^\s*/)?.[0] || '';
  const trailing = value.match(/\s*$/)?.[0] || '';
  const clean = value.trim();
  if (locale === 'fr' && clean === 'Email') return value;
  const table = locale === 'en' ? translations : reverse;
  const normalizedTable = locale === 'en' ? normalizedTranslations : normalizedReverse;
  let translated = table[clean] || normalizedTable[normalizeForLookup(clean)];

  if (!translated && locale === 'en') {
    const pricing = clean.match(/^(\d+)\s*€\s*\/\s*mois,\s*(\d+)\s*€\s*\/\s*an ou\s*(\d+)\s*€\s*à vie · Site illimité · Sans engagement$/);
    if (pricing) translated = `${pricing[1]}€/month, ${pricing[2]}€/year or ${pricing[3]}€ lifetime · Unlimited website · No commitment`;
    const keep = clean.match(/^Gardez EasyAsso dès\s*(\d+)\s*€\s*\/\s*mois$/);
    if (keep) translated = `Keep EasyAsso from ${keep[1]}€/month`;
    const keepText = clean.match(/^(\d+)\s*€\/mois,\s*(\d+)\s*€\/an ou\s*(\d+)\s*€\s*à vie — par carte ou virement, depuis votre tableau de bord\.$/);
    if (keepText) translated = `${keepText[1]}€/month, ${keepText[2]}€/year or ${keepText[3]}€ lifetime — by card or bank transfer, from your dashboard.`;
  }
  return translated ? `${leading}${translated}${trailing}` : value;
}

function translateTree(root: Node, locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  nodes.forEach((node) => {
    if (node.parentElement?.closest('[data-no-translate], script, style')) return;
    const current = node.nodeValue || '';
    let record = originalText.get(node);
    if (!record || current !== record.rendered) record = { source: current, rendered: current };
    const next = translateText(record.source, locale);
    record.rendered = next;
    originalText.set(node, record);
    if (next !== node.nodeValue) node.nodeValue = next;
  });
  if (root instanceof Element) {
    [root, ...Array.from(root.querySelectorAll('[placeholder],[title],[aria-label]'))].forEach((element) => {
      ['placeholder', 'title', 'aria-label'].forEach((attr) => {
        const value = element.getAttribute(attr);
        if (!value) return;
        const records = originalAttributes.get(element) || {};
        let record = records[attr];
        if (!record || value !== record.rendered) record = { source: value, rendered: value };
        const next = translateText(record.source, locale);
        record.rendered = next;
        records[attr] = record;
        originalAttributes.set(element, records);
        if (next !== value) element.setAttribute(attr, next);
      });
    });
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [forceFrench, setForceFrench] = useState(false);
  const [isVielusosDomain, setIsVielusosDomain] = useState(false);
  const pathname = usePathname();
  const isAssociationSite = pathname.startsWith('/s/') || pathname.startsWith('/domain/') || pathname.startsWith('/theme-preview/');
  useEffect(() => {
    const saved = localStorage.getItem('easyasso-language');
    const preferred = saved === 'en' || (!saved && navigator.language.toLowerCase().startsWith('en')) ? 'en' : 'fr';
    setLocaleState(preferred);
  }, []);
  useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    setIsVielusosDomain(hostname === 'vielusos.com' || hostname === 'www.vielusos.com');
    const vielusosAdmin = (hostname === 'vielusos.com' || hostname === 'www.vielusos.com') && ['/admin', '/login', '/forgot-password', '/reset-password', '/verify-email'].some((path) => pathname === path || pathname.startsWith(`${path}/`));
    const locked = vielusosAdmin || Boolean(document.querySelector('[data-dashboard-locale="fr"]'));
    setForceFrench(locked);
    if (locked) {
      localStorage.setItem('easyasso-language', 'fr');
      document.cookie = 'easyasso-language=fr;path=/;max-age=31536000;samesite=lax';
      setLocaleState('fr');
      return;
    }
    if (!pathname.startsWith('/dashboard')) return;
    fetch('/api/organization/profile').then((response) => response.ok ? response.json() : null).then((profile) => {
      if (profile?.language === 'fr' || profile?.language === 'en') {
        localStorage.setItem('easyasso-language', profile.language);
        setLocaleState(profile.language);
      }
    }).catch(() => {});
    const onProfileLanguage = (event: Event) => {
      const language = (event as CustomEvent).detail;
      if (language === 'fr' || language === 'en') setLocaleState(language);
    };
    window.addEventListener('easyasso-language-change', onProfileLanguage);
    return () => window.removeEventListener('easyasso-language-change', onProfileLanguage);
  }, [pathname]);
  useEffect(() => {
    document.documentElement.lang = locale;
    translateTree(document.body, locale);
    const observer = new MutationObserver((changes) => changes.forEach((change) => {
      change.addedNodes.forEach((node) => translateTree(node, locale));
      if (change.type === 'characterData') translateTree(change.target, locale);
    }));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [locale, pathname]);
  const setLocale = (next: Locale) => {
    localStorage.setItem('easyasso-language', next);
    document.cookie = `easyasso-language=${next};path=/;max-age=31536000;samesite=lax`;
    setLocaleState(next);
  };
  const value = useMemo(() => ({ locale, setLocale, t: (text: string) => locale === 'en' ? translations[text] || text : text }), [locale]);
  return <LocaleContext.Provider value={value}>{children}{!isAssociationSite && !isVielusosDomain && pathname !== '/' && !forceFrench && <LanguageSwitcher />}</LocaleContext.Provider>;
}

export function useLanguage() { return useContext(LocaleContext); }

export function LanguageSwitcher({ variant = 'floating' }: { variant?: 'floating' | 'inline' }) {
  const { locale, setLocale } = useContext(LocaleContext);
  const className = variant === 'inline'
    ? 'inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-700 shadow-sm hover:border-brand-300 hover:text-brand-700'
    : 'language-switcher fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-lg hover:border-brand-300 hover:text-brand-700';
  return (
    <button type="button" onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')} className={className} aria-label={locale === 'fr' ? 'Switch to English' : 'Passer en français'} data-no-translate>
      <Languages className="h-4 w-4" /> {locale === 'fr' ? 'EN' : 'FR'}
    </button>
  );
}
