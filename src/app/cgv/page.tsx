import type { Metadata } from 'next';
import { LegalShell, LegalInfoTable } from '@/components/legal/LegalShell';
import { platformLegal } from '@/lib/platform-legal';

export const metadata: Metadata = {
  title: 'Conditions générales de vente — EasyAsso',
  description: 'Conditions générales de vente du service EasyAsso édité par Une Digitale.',
};

export default function CgvPage() {
  return (
    <LegalShell
      title="Conditions générales de vente"
      intro={`Ces conditions générales encadrent l’achat et l’utilisation d’${platformLegal.serviceName}, la solution de création et de gestion de sites internet pour associations éditée par ${platformLegal.companyName}.`}
    >
      <h2>1. Identification du prestataire</h2>
      <p>
        Le service {platformLegal.serviceName} est édité par {platformLegal.companyName}. Les informations administratives disponibles sont les suivantes :
      </p>
      <LegalInfoTable />

      <h2>2. Objet</h2>
      <p>
        Les présentes conditions générales de vente définissent les droits et obligations applicables à toute commande, création de compte, période d’essai, paiement et utilisation du service {platformLegal.serviceName}. Elles s’appliquent à toute association, structure ou personne autorisée qui utilise la plateforme pour créer, publier, gérer ou administrer un site internet associatif.
      </p>
      <p>
        Toute création de compte, utilisation de l’essai gratuit, validation de commande ou paiement implique l’acceptation des présentes conditions.
      </p>

      <h2>3. Description du service</h2>
      <p>{platformLegal.serviceName} est un service en ligne permettant notamment :</p>
      <ul>
        <li>de créer un site internet associatif à partir d’un questionnaire guidé ;</li>
        <li>de modifier visuellement les pages, blocs, textes, images, vidéos, couleurs, boutons, menus, en-têtes et pieds de page ;</li>
        <li>de publier le site sur une adresse EasyAsso ou sur un nom de domaine configuré par l’utilisateur ;</li>
        <li>de gérer des informations d’association, donateurs, messages, campagnes, reçus, recettes, dépenses et exports ;</li>
        <li>d’ajouter des moyens de don tels que carte bancaire, lien externe, virement ou chèque, selon les informations renseignées par l’association ;</li>
        <li>de générer des contenus d’aide, notamment des pages, textes, CGV et mentions légales modifiables.</li>
      </ul>
      <p>
        Les contenus générés automatiquement constituent une aide à la rédaction. L’association utilisatrice reste responsable de leur relecture, exactitude, conformité et publication.
      </p>

      <h2>4. Création de compte et période d’essai</h2>
      <p>
        L’utilisateur crée un compte en indiquant son identité, son email, le nom de son association, sa langue de travail et les informations utiles au paramétrage initial du service.
      </p>
      <p>
        Sauf mention contraire affichée lors de l’inscription, {platformLegal.serviceName} propose une période d’essai gratuite de {platformLegal.trialDays} jours, sans carte bancaire obligatoire. À l’issue de cette période, l’accès à certaines fonctionnalités, à la publication ou à l’administration du site peut être limité jusqu’au règlement du prix applicable.
      </p>

      <h2>5. Prix</h2>
      <p>
        Le prix public du service est de {platformLegal.priceEuro} € en paiement unique, sauf offre particulière, code promotionnel ou condition spécifique affichée au moment de la commande.
      </p>
      <p>
        Le prix comprend l’accès au service, l’éditeur, le tableau de bord, la création du site, les fonctionnalités incluses et l’hébergement standard du site tant que le service est maintenu commercialement et techniquement par {platformLegal.companyName}. Les frais externes restent à la charge de l’utilisateur, notamment l’achat ou le renouvellement d’un nom de domaine, les commissions éventuelles des prestataires de paiement, ou tout service tiers activé par l’utilisateur.
      </p>

      <h2>6. Commande et validation</h2>
      <p>
        La création du compte ne déclenche pas de paiement. Elle ouvre l’essai gratuit de {platformLegal.trialDays} jours lorsque celui-ci est proposé. Le paiement intervient ensuite depuis l’espace utilisateur, après consultation du prix, des caractéristiques essentielles du service et des présentes conditions. Toute action de validation clairement associée à une obligation de paiement vaut commande ferme.
      </p>
      <p>
        Après commande, un accusé de réception électronique peut être envoyé ou affiché dans le compte utilisateur. Le contrat est archivé par {platformLegal.companyName} dans des conditions permettant d’en assurer le suivi administratif.
      </p>

      <h2>7. Paiement</h2>
      <p>
        Le paiement peut être proposé par carte bancaire via un prestataire de paiement sécurisé, par virement bancaire manuel, ou par tout autre moyen indiqué dans l’espace utilisateur. Les données bancaires complètes ne sont pas conservées par {platformLegal.companyName} lorsqu’elles sont saisies sur l’interface d’un prestataire de paiement.
      </p>
      <p>
        En cas de paiement par virement, l’accès payant peut être activé manuellement après réception effective des fonds et vérification de la preuve transmise. L’envoi d’une preuve de virement ne vaut pas paiement définitif tant que les fonds ne sont pas reçus sur le compte indiqué.
      </p>
      <p>
        En cas de refus, erreur ou indisponibilité du prestataire de paiement, la commande peut ne pas être finalisée. L’utilisateur peut alors choisir un autre moyen de paiement proposé.
      </p>

      <h2>8. Accès au service et publication du site</h2>
      <p>
        L’accès au tableau de bord est fourni en ligne. La publication du site peut dépendre de la configuration technique, du paiement, de l’état du compte, de la disponibilité du service et des choix de mise en ligne effectués par l’utilisateur.
      </p>
      <p>
        L’association peut publier son site sur une adresse fournie par EasyAsso et, si la fonctionnalité est proposée, relier son propre nom de domaine. La configuration d’un domaine externe nécessite parfois une action chez le registrar ou l’hébergeur DNS de l’utilisateur. Un domaine ne doit être rendu public sur EasyAsso qu’après validation technique de sa configuration.
      </p>

      <h2>9. Obligations de l’utilisateur</h2>
      <p>L’utilisateur s’engage à :</p>
      <ul>
        <li>fournir des informations exactes, complètes et à jour ;</li>
        <li>utiliser le service pour une activité licite et conforme à l’objet de son association ;</li>
        <li>ne pas publier de contenus illicites, trompeurs, diffamatoires, contrefaisants ou portant atteinte aux droits de tiers ;</li>
        <li>disposer des autorisations nécessaires sur les textes, images, logos, marques, vidéos et documents publiés ;</li>
        <li>vérifier les informations légales, fiscales, comptables et associatives diffusées sur son site ;</li>
        <li>sécuriser ses identifiants et informer {platformLegal.companyName} en cas d’utilisation non autorisée suspectée.</li>
      </ul>

      <h2>10. Dons, paiements associatifs et reçus</h2>
      <p>
        {platformLegal.serviceName} fournit des outils de présentation, de suivi et d’administration des dons. L’association utilisatrice reste seule responsable des campagnes publiées, de la réalité de son habilitation à recevoir des dons, de l’émission des reçus, du traitement comptable, fiscal et réglementaire des sommes reçues, ainsi que des informations transmises aux donateurs.
      </p>
      <p>
        Lorsqu’un don est réalisé via un prestataire externe, tel qu’un prestataire de paiement ou une plateforme associative, les conditions de ce prestataire s’appliquent également.
      </p>

      <h2>11. Droit de rétractation</h2>
      <p>
        Si l’utilisateur agit en qualité de consommateur au sens du droit applicable, il peut bénéficier d’un droit de rétractation de quatorze jours, sauf exception légale. Lorsque l’utilisateur demande l’exécution immédiate d’un service numérique ou d’une prestation avant la fin de ce délai, il peut être invité à reconnaître que l’exécution commence immédiatement et que le droit de rétractation peut être limité ou perdu dans les conditions prévues par la loi.
      </p>
      <p>
        Pour toute demande liée à une rétractation, l’utilisateur peut contacter {platformLegal.companyName} à l’adresse indiquée dans les mentions légales.
      </p>

      <h2>12. Support, maintenance et évolution</h2>
      <p>
        {platformLegal.companyName} peut réaliser des opérations de maintenance, correction, sécurité, amélioration ou évolution du service. Certaines interruptions temporaires peuvent intervenir, notamment pour des raisons techniques, de sécurité ou d’intervention de prestataires tiers.
      </p>
      <p>
        Les fonctionnalités peuvent évoluer afin d’améliorer le produit, corriger des anomalies, tenir compte des contraintes techniques ou se conformer aux obligations légales.
      </p>

      <h2>13. Propriété intellectuelle</h2>
      <p>
        Le service {platformLegal.serviceName}, son interface, son code, ses éléments graphiques, sa structure, sa marque et ses contenus propres appartiennent à {platformLegal.companyName} ou à ses ayants droit. Toute reproduction non autorisée est interdite.
      </p>
      <p>
        L’utilisateur conserve les droits sur les contenus qu’il fournit ou publie. Il autorise {platformLegal.companyName} à les héberger, afficher, sauvegarder, transformer techniquement et diffuser uniquement pour les besoins du fonctionnement du service.
      </p>

      <h2>14. Données personnelles</h2>
      <p>
        Les traitements de données personnelles réalisés par {platformLegal.companyName} sont décrits dans les mentions légales, la politique de confidentialité et les informations affichées dans le service. L’utilisateur reste responsable des données qu’il collecte auprès de ses propres visiteurs, donateurs, membres ou contacts via son site.
      </p>

      <h2>15. Responsabilité</h2>
      <p>
        {platformLegal.companyName} met en œuvre des moyens raisonnables pour fournir un service fiable, sécurisé et accessible. Sa responsabilité ne peut toutefois être engagée pour les dommages résultant d’une mauvaise utilisation du service, d’informations erronées fournies par l’utilisateur, d’un contenu publié par l’association, d’un service tiers, d’un problème de domaine, d’un cas de force majeure ou d’une interruption indépendante de sa volonté.
      </p>
      <p>
        Les outils d’aide à la génération de contenus, de pages ou de documents ne remplacent pas un conseil juridique, comptable, fiscal ou administratif personnalisé.
      </p>

      <h2>16. Suspension, résiliation et suppression</h2>
      <p>
        {platformLegal.companyName} peut suspendre l’accès à tout compte ou site en cas de non-paiement, risque de sécurité, usage abusif, contenu manifestement illicite, violation des présentes conditions ou demande légitime d’une autorité compétente.
      </p>
      <p>
        L’utilisateur peut demander la suppression de son compte ou la mise hors ligne de son site selon les fonctionnalités disponibles ou en contactant le support. Certaines données peuvent être conservées pendant les durées nécessaires aux obligations légales, comptables, probatoires ou de sécurité.
      </p>

      <h2>17. Médiation et réclamations</h2>
      <p>
        Toute réclamation peut être adressée à {platformLegal.companyName} via l’adresse de contact indiquée dans les mentions légales. Si l’utilisateur agit en qualité de consommateur et qu’un dispositif de médiation est applicable, les coordonnées du médiateur sont les suivantes : {platformLegal.mediator}.
      </p>

      <h2>18. Droit applicable</h2>
      <p>
        Les présentes conditions sont soumises au droit applicable au siège de {platformLegal.companyName}, sous réserve des règles impératives protégeant le consommateur lorsque celles-ci s’appliquent. En cas de litige, les parties rechercheront d’abord une solution amiable.
      </p>
    </LegalShell>
  );
}
