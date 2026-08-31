# Easy Asso

**Le SaaS qui permet à toute association de créer son site, collecter des dons et gérer sa compta — en totale autonomie, sans compétence technique.**

Une association crée un compte, règle un paiement unique (250 €), obtient immédiatement une adresse web dédiée, personnalise entièrement son site via un éditeur visuel bloc par bloc, puis relie son propre nom de domaine.

---

## ✨ Fonctionnalités

### Éditeur de site visuel
- Édition **bloc par bloc** directement dans un aperçu réaliste (desktop / mobile)
- Types de blocs : **titre, texte, image, vidéo (YouTube/Vimeo), bouton, réseaux sociaux, colonnes, espace, HTML/intégration** (HelloAsso, cartes…)
- Alignement gauche / centre / droite, **grille d’environ 50 couleurs**, taille de texte, espacements
- **Boutons configurables** : texte, lien, couleur, plein ou contour, alignement
- **Header entièrement éditable** : logo (texte ou image), navigation, style, bouton d’action, header fixe
- **Footer entièrement éditable** : logo, colonnes de menus, CGV, mentions légales, texte « tous droits réservés », **newsletter activable/désactivable**
- Gestion des pages depuis le menu : **création / suppression / renommage / réordonnancement / page d’accueil / visibilité dans le menu**
- Publication en un clic

### Backend complet
- **Gestion des utilisateurs, rôles et permissions très détaillée** : rôles système (Propriétaire, Admin, Éditeur, Trésorier, Membre, Lecture seule) + **rôles personnalisés** avec permissions à la carte, invitations d’équipe
- **CRM donateurs / clients** : fiches, recherche, tags, notes, **classement des meilleurs donateurs**
- **Dons** : saisie manuelle, méthodes (espèces, chèque, virement, Stripe, HelloAsso), **reçus fiscaux** numérotés
- **Campagnes** : objectif, progression, statut, **lien externe HelloAsso**
- **Comptabilité complète** : recettes / dépenses, **catégories**, solde, les dons alimentent automatiquement les recettes
- **Exports CSV** : dons, donateurs, comptabilité
- **Statistiques** : évolution des dons sur 12 mois, don moyen, répartition par méthode, audience du site, inscrits newsletter
- **Paiements** : Stripe Checkout pour l’activation (mode démo intégré), prise en charge des liens externes type HelloAsso

### Multi-tenant & domaines
- Chaque association = un espace isolé avec un **sous-domaine aléatoire** généré automatiquement (ex. `oasis-8kd2fa`)
- Site public servi sur `…/s/<sous-domaine>` et sur **nom de domaine personnalisé** (via middleware) avec instructions DNS guidées

---

## 🧱 Stack technique

| Domaine | Choix |
|---|---|
| Framework | **Next.js 15** (App Router, React 19, TypeScript) |
| Style | **Tailwind CSS** |
| Base de données | **PostgreSQL** via **Prisma** |
| Authentification | **NextAuth** (Auth.js) — email + mot de passe, sessions JWT, mots de passe hachés (bcrypt) |
| Paiements | **Stripe** (Checkout + webhook), mode démo sans clé |
| Déploiement | **Vercel** |
| Icônes | lucide-react |

Sécurité : permissions vérifiées côté serveur sur **chaque** route API, isolation stricte par organisation (chaque page/bloc/donateur est rattaché à une organisation et vérifié), validation des entrées (zod).

---

## 🚀 Démarrage local

```bash
# 1. Dépendances
npm install

# 2. Variables d’environnement
cp .env.example .env
#   → renseignez DATABASE_URL (PostgreSQL) et NEXTAUTH_SECRET
#   openssl rand -base64 32   # pour générer un secret

# 3. Base de données
npx prisma migrate deploy      # crée les tables
npm run db:seed                # (optionnel) données de démonstration

# 4. Lancer
npm run dev
# → http://localhost:3000
```

**Compte de démonstration** (après `db:seed`) : `demo@easyasso.fr` / `demo1234`

---

## 🔐 Variables d’environnement

| Variable | Requise | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Chaîne de connexion PostgreSQL |
| `NEXTAUTH_SECRET` | ✅ | Secret de session (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | prod | URL publique de l’app |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL publique (redirections Stripe) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | ✅ | Domaine racine pour construire les adresses des sites |
| `NEXT_PUBLIC_PRICE_EUR` | – | Prix d’activation (défaut `250`) |
| `DEMO_MODE` | – | `1` = active sans paiement réel (Stripe non requis) |
| `STRIPE_SECRET_KEY` | – | Clé secrète Stripe (paiement réel) |
| `STRIPE_WEBHOOK_SECRET` | – | Secret du webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | – | Clé publique Stripe |
| `STRIPE_PRICE_ID` | – | ID de prix Stripe (sinon prix dynamique) |

---

## ☁️ Déploiement sur Vercel

Le dépôt GitHub est connecté à Vercel : chaque push sur la branche de production déclenche un déploiement.

**Étape unique à réaliser dans le tableau de bord Vercel :**

1. **Ajouter une base PostgreSQL** — onglet *Storage* → *Create Database* → *Postgres* (Neon). Vercel injecte automatiquement `DATABASE_URL`. (Ou collez l’URL d’un Neon/Supabase existant.)
2. **Ajouter les variables d’environnement** (onglet *Settings → Environment Variables*) :
   ```
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://<votre-projet>.vercel.app
   NEXT_PUBLIC_APP_URL=https://<votre-projet>.vercel.app
   NEXT_PUBLIC_ROOT_DOMAIN=<votre-projet>.vercel.app
   DEMO_MODE=1
   ```
3. **Redéployer.** Le build applique automatiquement les migrations Prisma (`prisma migrate deploy`) : les tables sont créées toutes seules.

Pour activer les **vrais paiements Stripe**, renseignez les variables `STRIPE_*`, passez `DEMO_MODE=0`, et configurez le webhook sur `https://<domaine>/api/stripe/webhook` (événement `checkout.session.completed`).

### Relier un nom de domaine personnalisé
Dans *Réglages → Nom de domaine* de l’app, l’association saisit son domaine et suit les instructions DNS. Ajoutez également le domaine dans Vercel (*Settings → Domains*) pour le certificat SSL automatique.

---

## 🗺️ Aperçu du code

```
prisma/schema.prisma      Modèle de données (multi-tenant)
src/lib/                  permissions, blocs, couleurs, stats, auth, stripe, bootstrap
src/app/                  landing, auth, onboarding (paywall)
src/app/dashboard/        tableau de bord + éditeur visuel + modules
src/app/s/[subdomain]/    rendu public des sites (sous-domaine)
src/app/domain/[host]/    rendu public (domaine personnalisé)
src/app/api/              routes API sécurisées (pages, blocs, dons, compta, équipe…)
middleware.ts             routage des domaines personnalisés
```

---

## 📌 État & limites connues
- L’encaissement Stripe fonctionne pour l’**activation** ; la collecte de dons en ligne s’appuie sur la saisie manuelle et les liens externes (HelloAsso). Un module de don en ligne intégré peut être branché sur le même socle Stripe.
- La vérification de domaine est « best-effort » (joignabilité HTTP) ; couplez-la à l’API Domaines de votre hébergeur pour la validation DNS + SSL automatique.
- Envoi d’emails (invitations, reçus PDF) non branché : les points d’extension sont prévus dans le code.

Construit pour être simple pour les associations, complet pour leurs besoins.
