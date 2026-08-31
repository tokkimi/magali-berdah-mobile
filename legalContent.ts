export type LegalDocument = {
  key: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
};

const COMPANY =
  "[À COMPLÉTER : raison sociale, forme, capital, siège, SIREN/RCS, TVA, e-mail et téléphone]";

export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms: {
    key: "terms",
    title: "Conditions générales de vente",
    updated: "Projet au 1er septembre 2026 — validation juridique requise",
    sections: [
      {
        heading: "1. Identité du vendeur",
        body: `L’application Magali Berdah est exploitée par ${COMPANY}. Directeur de la publication : [À COMPLÉTER]. Hébergeur et coordonnées : [À COMPLÉTER].`,
      },
      {
        heading: "2. Objet et champ d’application",
        body: "Les présentes CGV régissent les ventes à distance de biens physiques, notamment des articles de mode et accessoires de seconde main ou de collection, proposées aux consommateurs en France [et territoires à préciser]. Elles sont accessibles avant toute commande et leur acceptation expresse est requise.",
      },
      {
        heading: "3. Produits",
        body: "Chaque fiche présente les caractéristiques essentielles, l’état, les dimensions lorsqu’elles sont pertinentes, les photographies, le prix ou l’enchère en cours et les informations d’authentification disponibles. Les articles d’occasion peuvent présenter des traces d’usage décrites sur leur fiche. Les photographies ne remplacent pas la description écrite.",
      },
      {
        heading: "4. Prix et frais",
        body: "Les prix sont affichés en euros toutes taxes comprises, sous réserve du régime fiscal applicable [TVA/marge à compléter]. Avant validation, l’acheteur reçoit le détail du prix du bien, de la commission éventuelle [taux ou montant à compléter], de la livraison, de l’assurance et de toute taxe. Aucun coût non annoncé ne sera ajouté après confirmation.",
      },
      {
        heading: "5. Commande",
        body: "L’acheteur vérifie le récapitulatif, corrige les erreurs éventuelles puis confirme une commande comportant une obligation de paiement. La vente n’est définitive qu’après confirmation transmise sur un support durable et validation du paiement. Le vendeur peut refuser une opération en cas de fraude suspectée, d’erreur manifeste de prix ou d’indisponibilité.",
      },
      {
        heading: "6. Paiement",
        body: "Le paiement sera traité par [STRIPE / PRESTATAIRE À CONFIRMER]. Les données complètes de carte ne sont pas conservées par l’exploitant. Les moyens acceptés seront indiqués avant paiement. Une authentification forte 3D Secure peut être demandée. Pour les enchères, une carte valide peut être exigée avant la première mise et le gagnant autorise le débit selon les règles affichées.",
      },
      {
        heading: "7. Livraison et transfert des risques",
        body: "Zones, transporteurs, tarifs et délais : [À COMPLÉTER]. Une date ou un délai de livraison est communiqué avant la commande. Le risque est transféré lors de la prise de possession physique par le consommateur, sauf transporteur choisi indépendamment par celui-ci. Toute réserve doit être signalée au transporteur et au service client.",
      },
      {
        heading: "8. Droit de rétractation",
        body: "Sous réserve des exceptions légales et de la qualification exacte de chaque vente, le consommateur dispose en principe de quatorze jours à compter de la réception pour notifier sa rétractation, puis de quatorze jours pour retourner le bien. Adresse, procédure et coût du retour : [À COMPLÉTER]. Pour les ventes relevant d’une exception légale, notamment certaines enchères publiques au sens du Code de la consommation, l’absence de rétractation doit être clairement annoncée avant l’engagement. Ne pas appliquer cette exception aux enchères électroniques sans validation juridique.",
      },
      {
        heading: "9. Garanties légales",
        body: "Le consommateur bénéficie de la garantie légale de conformité applicable aux biens neufs et d’occasion ainsi que de la garantie des vices cachés, dans les conditions prévues par le Code de la consommation et le Code civil. Les modalités de mise en œuvre et l’adresse de réclamation seront communiquées par le service client.",
      },
      {
        heading: "10. Authenticité",
        body: "Le protocole d’authentification, l’identité ou la qualification des experts, la portée du certificat et la procédure en cas de contestation doivent être précisés ici : [À COMPLÉTER]. Toute promesse “garantie” devra correspondre à un processus réel, documenté et assuré.",
      },
      {
        heading: "11. Réclamations et médiation",
        body: "Service client : [adresse, e-mail, téléphone et horaires À COMPLÉTER]. Après une réclamation écrite préalable restée sans solution, le consommateur peut saisir gratuitement le médiateur auquel l’entreprise aura adhéré : [NOM, ADRESSE ET SITE DU MÉDIATEUR À COMPLÉTER].",
      },
      {
        heading: "12. Responsabilité et force majeure",
        body: "La responsabilité ne peut être exclue lorsqu’une règle impérative l’interdit. L’exploitant n’est pas responsable d’un préjudice indirect ou d’une inexécution causée par un événement de force majeure reconnu par la loi, sans préjudice des droits impératifs du consommateur.",
      },
      {
        heading: "13. Droit applicable",
        body: "Les CGV sont soumises au droit français, sans priver le consommateur des protections impératives de son pays de résidence. Les juridictions compétentes sont déterminées par les règles légales applicables aux consommateurs.",
      },
    ],
  },
  auctions: {
    key: "auctions",
    title: "Règlement des enchères",
    updated:
      "Projet au 1er septembre 2026 — modèle à valider selon le statut de l’opérateur",
    sections: [
      {
        heading: "1. Nature du service",
        body: "L’application permet de déposer des offres sur des biens physiques. Le statut exact de l’exploitant, du vendeur et de l’éventuel opérateur de ventes volontaires doit être déterminé avant lancement : [À COMPLÉTER]. L’usage du mot “enchère” ne préjuge pas de la qualification juridique du service.",
      },
      {
        heading: "2. Conditions pour enchérir",
        body: "L’utilisateur doit être majeur, disposer de la capacité juridique, fournir des informations exactes, vérifier son e-mail et son téléphone et enregistrer un moyen de paiement valide. Une vérification d’identité renforcée pourra être imposée selon le montant ou le risque.",
      },
      {
        heading: "3. Mise et engagement",
        body: "Chaque écran de confirmation affiche le lot, la mise proposée, le pas d’enchère, les frais, la livraison et le total maximal. Une mise confirmée est ferme selon les conditions annoncées. Aucun débit ni engagement ne doit résulter d’un simple toucher accidentel : une confirmation distincte est obligatoire.",
      },
      {
        heading: "4. Pas d’enchère et plafond",
        body: "Le pas peut varier selon le prix et sera affiché avant chaque offre. Si une enchère automatique est proposée, son plafond reste confidentiel et le système ne surenchérit que du minimum nécessaire. Règles de priorité en cas d’offres identiques : [À COMPLÉTER].",
      },
      {
        heading: "5. Clôture",
        body: "L’heure officielle est celle du serveur. La règle d’extension anti-sniping éventuelle doit être fixée : [ex. toute offre reçue dans les 2 dernières minutes prolonge de 2 minutes — À CONFIRMER]. Les interruptions techniques, annulations de lot et corrections d’erreur manifeste suivent une procédure documentée et traçable.",
      },
      {
        heading: "6. Gagnant et paiement",
        body: "Le meilleur enchérisseur valide à la clôture est informé sur un support durable. Le prix final, les frais et la livraison sont débités ou soumis à authentification. Délai de paiement, relances, conséquences d’un impayé et remise en vente : [À COMPLÉTER]. Aucune pénalité ne sera appliquée sans base contractuelle claire et proportionnée.",
      },
      {
        heading: "7. Traçabilité et contestation",
        body: "Le serveur conserve l’horodatage, l’identifiant pseudonymisé, le montant et le statut de chaque offre. L’utilisateur peut demander l’historique de ses propres offres. Procédure de contestation et délai : [À COMPLÉTER].",
      },
      {
        heading: "8. Lutte contre la fraude",
        body: "Les enchères artificielles, ententes, comptes multiples, moyens de paiement volés et manipulations sont interdits. Les mesures de détection doivent rester proportionnées, documentées et expliquées dans la politique de confidentialité.",
      },
    ],
  },
  privacy: {
    key: "privacy",
    title: "Politique de confidentialité",
    updated: "Projet au 1er septembre 2026 — registre RGPD à finaliser",
    sections: [
      {
        heading: "1. Responsable du traitement",
        body: `${COMPANY}. Délégué à la protection des données ou contact vie privée : [À COMPLÉTER].`,
      },
      {
        heading: "2. Données traitées",
        body: "Compte et contact ; adresses ; historique de navigation, favoris, commandes et enchères ; justificatifs nécessaires à la lutte contre la fraude ; données de paiement tokenisées fournies par le prestataire ; échanges avec le support ; données techniques, journaux de sécurité et préférences de consentement. Les données non nécessaires ne doivent pas être collectées.",
      },
      {
        heading: "3. Finalités et bases légales",
        body: "Exécution du contrat : compte, commande, paiement, livraison et enchères. Obligation légale : comptabilité, fiscalité et lutte contre la fraude. Intérêt légitime : sécurité, prévention des abus et amélioration strictement nécessaire. Consentement : prospection, notifications facultatives, traceurs non essentiels et accès aux fonctions du téléphone lorsqu’il est requis.",
      },
      {
        heading: "4. Destinataires",
        body: "Personnel habilité et sous-traitants strictement nécessaires : hébergement/base de données [À COMPLÉTER], paiement [À COMPLÉTER], transporteurs, authentification, support, e-mail et notifications. La liste finale, leurs rôles et pays d’hébergement devront être renseignés.",
      },
      {
        heading: "5. Transferts hors EEE",
        body: "Tout transfert hors Espace économique européen doit être identifié avec son mécanisme de protection : décision d’adéquation, clauses contractuelles types et mesures supplémentaires le cas échéant. [FOURNISSEURS ET GARANTIES À COMPLÉTER].",
      },
      {
        heading: "6. Durées de conservation",
        body: "Compte actif : durée de la relation. Compte supprimé : effacement ou anonymisation, sauf obligations légales. Commandes et factures : durée légale applicable [à confirmer]. Prospection : durée conforme aux recommandations de la CNIL. Journaux de sécurité et enchères : durées proportionnées [tableau à compléter].",
      },
      {
        heading: "7. Vos droits",
        body: "Accès, rectification, effacement, limitation, opposition, portabilité lorsque applicable, retrait du consentement et définition de directives post-mortem. Demandes : [E-MAIL/FORMULAIRE À COMPLÉTER]. Une preuve d’identité ne sera demandée qu’en cas de doute raisonnable. Réclamation possible auprès de la CNIL.",
      },
      {
        heading: "8. Suppression du compte",
        body: "La demande est accessible dans l’application et sur une page web publique à créer. L’utilisateur est informé des données supprimées, anonymisées ou conservées légalement, du délai de traitement et des conséquences sur les enchères ou commandes en cours.",
      },
      {
        heading: "9. Sécurité",
        body: "Chiffrement en transit, contrôle d’accès, journalisation, sauvegardes, séparation des environnements, gestion des secrets, tests de sécurité et procédure de violation de données. Les numéros de carte complets ne transitent pas par les serveurs de l’application.",
      },
      {
        heading: "10. Traceurs et mesure d’audience",
        body: "Aucun outil publicitaire ou de mesure non essentiel ne sera activé avant recueil du consentement lorsque celui-ci est requis. Un panneau permettra de refuser aussi facilement que d’accepter et de modifier le choix.",
      },
      {
        heading: "11. Mineurs",
        body: "Le service d’enchères est réservé aux personnes majeures. Les mesures de vérification doivent être proportionnées. L’application n’est pas destinée à collecter sciemment les données de mineurs.",
      },
    ],
  },
  legal: {
    key: "legal",
    title: "Mentions légales",
    updated: "Informations à compléter avant publication",
    sections: [
      { heading: "Éditeur", body: COMPANY },
      {
        heading: "Direction de la publication",
        body: "[NOM ET QUALITÉ À COMPLÉTER]",
      },
      {
        heading: "Hébergement",
        body: "Application et API : [PRESTATAIRES, RAISONS SOCIALES ET ADRESSES À COMPLÉTER].",
      },
      {
        heading: "Propriété intellectuelle",
        body: "La marque, les textes, visuels et éléments graphiques sont protégés. Les droits sur chaque photographie, marque de produit et contenu tiers doivent être inventoriés et justifiés avant publication.",
      },
      {
        heading: "Contact",
        body: "Service client : [E-MAIL, TÉLÉPHONE, ADRESSE, HORAIRES]. Contact confidentialité : [À COMPLÉTER].",
      },
    ],
  },
};

export const LEGAL_MENU = [
  {
    key: "terms",
    label: "Conditions générales de vente",
    icon: "document-text",
  },
  { key: "auctions", label: "Règlement des enchères", icon: "hourglass" },
  {
    key: "privacy",
    label: "Confidentialité & données",
    icon: "shield-checkmark",
  },
  { key: "legal", label: "Mentions légales", icon: "business" },
];
