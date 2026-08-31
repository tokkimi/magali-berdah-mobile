import type { Metadata } from 'next';
import { LegalShell, LegalInfoTable } from '@/components/legal/LegalShell';
import { platformLegal } from '@/lib/platform-legal';

export const metadata: Metadata = {
  title: 'Mentions légales et confidentialité — EasyAsso',
  description: 'Mentions légales, hébergement, confidentialité, données personnelles et cookies du site EasyAsso.',
};

export default function MentionsLegalesPage() {
  return (
    <LegalShell
      title="Mentions légales, confidentialité et cookies"
      intro={`Cette page présente les informations légales du site ${platformLegal.brand}, son hébergement, les règles applicables aux contenus, ainsi que la manière dont les données personnelles et cookies sont traités.`}
    >
      <h2>1. Éditeur du site</h2>
      <p>
        Le site {platformLegal.brand} est édité par {platformLegal.companyName}. Les informations d’identification de l’éditeur sont les suivantes :
      </p>
      <LegalInfoTable />

      <h2>2. Directeur ou directrice de publication</h2>
      <p>
        Le directeur ou la directrice de publication est : {platformLegal.publicationDirector}. Cette personne est responsable de la publication des contenus propres à {platformLegal.brand}, hors contenus créés ou publiés par les associations utilisatrices dans leur propre espace.
      </p>

      <h2>3. Hébergeur</h2>
      <p>
        Le site est hébergé par {platformLegal.hostName}, {platformLegal.hostAddress}. Site internet : <a href={platformLegal.hostWebsite}>{platformLegal.hostWebsite}</a>.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        La marque {platformLegal.brand}, l’interface, la structure du service, les textes de présentation, éléments graphiques, logos, icônes, composants, développements, bases de données, modèles et contenus propres au service sont protégés par le droit de la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, adaptation, extraction, diffusion ou exploitation non autorisée, totale ou partielle, est interdite, sauf accord écrit préalable de {platformLegal.companyName}.
      </p>

      <h2>5. Responsabilité sur les sites créés par les associations</h2>
      <p>
        {platformLegal.brand} permet à des associations de créer et publier leurs propres sites. Chaque association est seule responsable des contenus qu’elle publie : textes, images, vidéos, logos, informations légales, campagnes de dons, coordonnées, documents, reçus et messages.
      </p>
      <p>
        Les documents générés automatiquement par le service, notamment les CGV, mentions légales ou textes de pages, sont fournis comme une aide à la rédaction. Ils doivent être relus, complétés et validés par l’association avant publication.
      </p>

      <h2 id="donnees-personnelles">6. Données personnelles traitées par EasyAsso</h2>
      <p>
        Dans le cadre de l’exploitation de {platformLegal.brand}, {platformLegal.companyName} peut traiter des données personnelles relatives aux utilisateurs du service, notamment :
      </p>
      <ul>
        <li>identité et coordonnées : nom, prénom, email, téléphone, adresse professionnelle ou associative ;</li>
        <li>informations d’association : nom, objet, adresse, numéro d’enregistrement, informations légales, logo, réseaux sociaux, moyens de contact ;</li>
        <li>données de compte : langue, préférences, statut du site, rôle, permissions, historique d’actions utiles à l’administration ;</li>
        <li>données de paiement et de facturation : statut du paiement, moyen utilisé, preuve de virement, reçus, références de transaction lorsque disponibles ;</li>
        <li>données de support : messages, demandes, pièces jointes et échanges avec l’utilisateur ;</li>
        <li>données techniques : adresse IP, journaux de connexion, identifiants techniques, informations de sécurité et de fonctionnement.</li>
      </ul>

      <h2>7. Finalités et bases légales</h2>
      <p>Ces données sont utilisées pour :</p>
      <ul>
        <li>créer et gérer les comptes utilisateurs ;</li>
        <li>fournir l’éditeur, le tableau de bord, les sites publiés et les outils associés ;</li>
        <li>gérer l’essai gratuit, les paiements, preuves de virement, facturation et obligations comptables ;</li>
        <li>assurer la sécurité, prévenir la fraude, corriger les erreurs et maintenir le service ;</li>
        <li>répondre aux demandes de support ;</li>
        <li>respecter les obligations légales et réglementaires ;</li>
        <li>améliorer le service et mesurer son utilisation lorsque cela est autorisé.</li>
      </ul>
      <p>
        Les bases légales peuvent être l’exécution du contrat, l’intérêt légitime de {platformLegal.companyName}, le respect d’une obligation légale ou le consentement lorsque celui-ci est requis.
      </p>

      <h2>8. Données collectées par les associations via leur site</h2>
      <p>
        Lorsqu’un visiteur contacte une association, effectue une intention de don, transmet ses coordonnées ou utilise un formulaire sur un site créé avec {platformLegal.brand}, les données sont collectées pour le compte de l’association concernée. L’association détermine les finalités de cette collecte et doit informer ses visiteurs conformément au droit applicable.
      </p>
      <p>
        {platformLegal.companyName} intervient alors principalement comme prestataire technique pour permettre l’hébergement, l’affichage, l’enregistrement et la transmission de ces données dans le tableau de bord de l’association.
      </p>

      <h2>9. Destinataires et sous-traitants</h2>
      <p>
        Les données peuvent être accessibles aux personnes habilitées de {platformLegal.companyName} et à des prestataires techniques strictement nécessaires au fonctionnement du service : hébergement, base de données, authentification, email, paiement, sécurité, journalisation, support et sauvegarde.
      </p>
      <p>
        Lorsque l’utilisateur connecte un service tiers ou ajoute un lien externe, tel qu’une plateforme de paiement, une plateforme associative, un outil email ou un nom de domaine, les données transmises à ce service sont soumises aux conditions et politiques de ce tiers.
      </p>

      <h2>10. Durées de conservation</h2>
      <p>
        Les données sont conservées pendant la durée nécessaire aux finalités décrites ci-dessus. Les données de compte sont conservées tant que le compte est actif, puis peuvent être supprimées ou archivées. Les données nécessaires à la facturation, à la comptabilité, à la preuve d’un paiement ou à la gestion d’un litige peuvent être conservées pendant la durée légale applicable.
      </p>
      <p>
        Les journaux techniques et données de sécurité sont conservés pour une durée limitée, proportionnée aux besoins de sécurité, diagnostic et preuve.
      </p>

      <h2>11. Droits des personnes</h2>
      <p>
        Toute personne concernée peut, dans les conditions prévues par la réglementation, demander l’accès à ses données, leur rectification, leur suppression, la limitation du traitement, l’opposition au traitement ou la portabilité des données lorsque ce droit s’applique.
      </p>
      <p>
        Les demandes peuvent être adressées à : {platformLegal.privacyEmail}. Une preuve d’identité peut être demandée lorsque cela est nécessaire pour protéger les données concernées.
      </p>
      <p>
        En cas de difficulté non résolue, la personne concernée peut introduire une réclamation auprès de l’autorité de protection des données compétente.
      </p>

      <h2>12. Cookies et traceurs</h2>
      <p>
        Le site peut utiliser des cookies ou traceurs nécessaires au fonctionnement du service, par exemple pour maintenir une session, sécuriser l’accès, mémoriser une préférence de langue ou enregistrer un choix de consentement. Ces traceurs strictement nécessaires ne requièrent pas toujours un consentement préalable.
      </p>
      <p>
        Des cookies ou traceurs optionnels, notamment de mesure d’audience ou d’amélioration du service, ne sont utilisés qu’avec le consentement de l’utilisateur lorsque celui-ci est requis. L’utilisateur peut accepter, refuser ou modifier ses choix depuis le bandeau ou le module prévu à cet effet.
      </p>

      <h2>13. Sécurité</h2>
      <p>
        {platformLegal.companyName} met en œuvre des mesures raisonnables pour protéger les données contre l’accès non autorisé, la perte, l’altération ou la divulgation. Ces mesures incluent notamment le contrôle des accès, l’authentification, l’hébergement sécurisé, la séparation des espaces utilisateurs et des mécanismes de sauvegarde ou de journalisation lorsque nécessaires.
      </p>
      <p>
        L’utilisateur reste responsable de la confidentialité de ses identifiants et doit signaler toute suspicion d’accès non autorisé.
      </p>

      <h2>14. Liens externes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers. {platformLegal.companyName} n’est pas responsable des contenus, pratiques, politiques de confidentialité ou conditions de ces sites tiers.
      </p>

      <h2>15. Signalement et contact</h2>
      <p>
        Pour toute question concernant le site, les présentes mentions, les données personnelles, un contenu manifestement illicite ou une demande de retrait, l’utilisateur peut contacter {platformLegal.companyName} à l’adresse suivante : {platformLegal.contactEmail}.
      </p>

      <h2>16. Mise à jour</h2>
      <p>
        Les présentes mentions peuvent être mises à jour pour tenir compte de l’évolution du service, de la réglementation, des prestataires utilisés ou de l’organisation de {platformLegal.companyName}. La date de dernière mise à jour figure en haut de page.
      </p>
    </LegalShell>
  );
}
