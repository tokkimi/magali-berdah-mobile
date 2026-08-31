# Checklist de publication iOS et Android

## Bloquants juridiques et entreprise

- [ ] Renseigner raison sociale, forme, capital, siège, SIREN/RCS, TVA et contacts.
- [ ] Faire valider CGV, règlement des enchères, confidentialité et rétractation par un juriste.
- [ ] Déterminer le statut juridique exact de l'activité d'enchères.
- [ ] Adhérer à un médiateur de la consommation et renseigner ses coordonnées.
- [ ] Confirmer les droits sur marque, logo, photographies et descriptions.
- [ ] Définir transport, assurance, retours, remboursements et garanties.

## Produit et sécurité

- [ ] Backend de comptes et enchères avec contrôle d'accès et journal d'audit.
- [ ] Suppression du compte dans l'app et page web publique.
- [ ] Stripe en mode test, webhooks signés, idempotence, 3D Secure, Apple Pay et Google Pay.
- [ ] Notifications avec consentement et préférences fines.
- [ ] Tests de concurrence sur les enchères, fraude, panne et clôture.
- [ ] Test d'intrusion et revue des dépendances avant production.
- [ ] Sauvegarde, restauration, gestion d'incident et violation de données.

## Apple

- [ ] Compte Apple Developer Organisation et contrats à jour.
- [ ] Build réel testé sur petits/grands iPhone et version iOS minimale supportée.
- [ ] TestFlight interne puis externe.
- [ ] URL confidentialité, URL support et suppression de compte opérationnelles.
- [ ] App Privacy renseignée selon tous les SDK intégrés.
- [ ] Captures, description, catégorie, âge et notes de revue.
- [ ] Compte de démonstration pour l'équipe App Review.

## Google Play

- [ ] Compte Play Console Organisation vérifié.
- [ ] Android App Bundle signé et ciblant l'API exigée au moment du dépôt.
- [ ] Tests fermés Play Console sur plusieurs appareils et tailles.
- [ ] Data Safety, suppression de compte, URL confidentialité et accès app renseignés.
- [ ] Captures téléphone, icône, bannière, description et classification de contenu.
- [ ] Vérifier rapports pré-lancement, crashs, ANR et accessibilité.

## Validation finale

- [ ] Aucun bouton mort ni contenu de démonstration.
- [ ] Prix, frais et obligation de paiement visibles avant confirmation.
- [ ] Commandes, enchères, reçus, retours et support testés de bout en bout.
- [ ] Contraste, taille du texte, lecteur d'écran et zones tactiles vérifiés.
- [ ] Politique de version, mises à jour et retour arrière documentés.
