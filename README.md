# Magali Berdah — application mobile

Application Expo/React Native destinée à iOS et Android pour la marketplace Magali Berdah.

## Expérience incluse
- accueil éditorial et ventes exclusives ;
- catalogue, recherche et filtres ;
- fiches produits et certificats ;
- enchères, favoris et panier ;
- compte, commandes et conciergerie ;
- identité visuelle et configuration de build iOS/Android.

## Démarrage
```bash
npm install
npm start
```

## Vérification
```bash
npm run typecheck
npx expo export --platform all
```

## Builds stores
```bash
npx eas-cli build --platform all --profile production
npx eas-cli submit --platform ios
npx eas-cli submit --platform android
```

La soumission exige les comptes développeur, les certificats, l’API et le paiement de production. Consultez `STORE_LISTING.md` pour la checklist.
