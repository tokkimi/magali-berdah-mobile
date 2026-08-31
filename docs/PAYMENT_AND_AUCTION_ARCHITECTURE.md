# Architecture cible — paiement et enchères

Statut : conception prête à implémenter après ouverture des comptes professionnels.

## Principes non négociables

- Le téléphone n'est jamais la source de vérité pour le prix, le gagnant ou l'heure de clôture.
- Toute mise est validée dans une transaction atomique côté serveur.
- Les clés Stripe secrètes et clés administrateur de base de données restent exclusivement côté serveur.
- Les numéros complets de carte ne transitent ni ne sont enregistrés par l'application.
- Les webhooks Stripe sont vérifiés par leur signature et traités de façon idempotente.
- Une action financière sensible nécessite une confirmation distincte, un récapitulatif complet et une protection contre les doubles clics.

## Parcours recommandé

1. Compte vérifié (e-mail, téléphone, majorité déclarée, contrôle renforcé selon le risque).
2. Enregistrement d'un moyen de paiement via Stripe SetupIntent.
3. Création d'une mise côté serveur avec clé d'idempotence.
4. Verrouillage transactionnel du lot, contrôle de l'heure serveur, du pas et du montant.
5. Écriture de la mise et publication temps réel après commit.
6. Notification aux enchérisseurs dépassés.
7. Clôture par tâche serveur durable, jamais par le téléphone.
8. Détermination du gagnant, création/confirmation du paiement et gestion de 3D Secure si nécessaire.
9. Webhook de paiement : création idempotente de la commande, facture/reçu et préparation logistique.
10. Gestion explicite des échecs, remboursements, litiges et remise en vente.

## Événements à journaliser

`auction.created`, `bid.accepted`, `bid.rejected`, `auction.extended`, `auction.closed`, `winner.selected`, `payment.action_required`, `payment.succeeded`, `payment.failed`, `order.created`, `refund.created`, `account.deletion_requested`.

Chaque entrée comporte un identifiant, un horodatage serveur UTC, l'acteur, la ressource, le résultat et un identifiant de corrélation sans donnée bancaire sensible.

## Comptes nécessaires

- Compte Apple Developer Organisation.
- Compte Google Play Console Organisation.
- Compte Stripe professionnel avec identité bancaire vérifiée.
- Hébergement backend/base de données en région européenne si possible.
- Prestataire e-mail transactionnel et notifications.
- Contrat avec un médiateur de la consommation.

## Décisions métier à fournir

- Entité juridique exploitante et pays desservis.
- Statut de l'opérateur d'enchères, vendeurs professionnels ou particuliers.
- Commission acheteur/vendeur, TVA et facturation.
- Pas d'enchère, règle anti-sniping et procédure d'impayé.
- Droit de rétractation applicable à chaque type de vente.
- Transport, assurance, retours et procédure d'authentification.
