# Norya Labs - E-Commerce MVP

Une plateforme e-commerce complète pour la vente de produits de beauté naturels algériens, construite avec Next.js 14, TypeScript, Tailwind CSS et Prisma.

## Fonctionnalités

- 🛍️ Catalogue de produits avec filtres et pagination
- 🛒 Panier d'achat avec persistance localStorage
- 💳 Processus de checkout avec validation Zod
- 📦 Gestion des commandes pour les administrateurs
- 📱 Design responsive mobile-first
- 🎨 Interface élégante avec palette de couleurs algérienne
- 💬 Intégration WhatsApp pour le support client

## Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL avec Prisma ORM
- **Validation**: Zod
- **State Management**: React Context API

## Installation

### Prérequis

- Node.js 18+ et pnpm
- PostgreSQL

### Étapes

1. **Cloner le repository**
```bash
git clone <repo-url>
cd noryalabs
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer la base de données**

Créer une base de données PostgreSQL et mettre à jour le fichier `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/noryalabs?schema=public"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
ADMIN_SECRET="votre-secret-admin"
```

4. **Migrer la base de données et générer le client Prisma**
```bash
pnpm prisma:migrate
pnpm prisma:generate
```

5. **Peupler la base de données**
```bash
pnpm prisma:seed
```

6. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## Structure du Projet

```
├── app/
│   ├── api/              # Routes API
│   │   ├── products/     # API produits
│   │   ├── checkout/     # API checkout
│   │   ├── orders/       # API commandes
│   │   └── admin/        # API admin
│   ├── (pages)/          # Pages de l'application
│   │   ├── shop/         # Page boutique
│   │   ├── product/      # Page produit
│   │   ├── cart/         # Page panier
│   │   ├── checkout/     # Page checkout
│   │   ├── about/        # Page à propos
│   │   ├── delivery/     # Page livraison
│   │   ├── contact/      # Page contact
│   │   └── admin/        # Page admin
│   ├── layout.tsx        # Layout principal
│   └── globals.css       # Styles globaux
├── components/           # Composants réutilisables
├── contexts/            # Contextes React (Cart)
├── lib/                 # Utilitaires et helpers
│   ├── prisma.ts        # Client Prisma
│   ├── validations.ts   # Schémas Zod
│   └── utils.ts         # Fonctions utilitaires
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Script de seed
└── public/              # Assets statiques
```

## Pages Principales

- **/** - Page d'accueil avec produits vedettes
- **/shop** - Catalogue avec filtres (catégorie, prix) et pagination
- **/product/[slug]** - Détails du produit avec galerie d'images
- **/cart** - Panier d'achat
- **/checkout** - Formulaire de commande
- **/admin/orders** - Gestion des commandes (protégé par ADMIN_SECRET)

## API Routes

- `GET /api/products` - Liste des produits (avec filtres)
- `GET /api/products/[slug]` - Détails d'un produit
- `POST /api/checkout` - Créer une commande
- `PATCH /api/orders/[id]` - Mettre à jour le statut d'une commande (admin)
- `GET /api/admin/orders` - Liste des commandes (admin)

## Schéma de Base de Données

### Product
- Informations produit (nom, prix, description)
- Images (JSON array)
- Bienfaits (JSON array)
- Stock et featured flag

### Order
- Informations client (nom, téléphone, wilaya, adresse)
- Statut (pending, confirmed, shipped, delivered, canceled)
- Total en DA

### OrderItem
- Relation produit-commande
- Quantité et prix au moment de la commande

## Validation

### Checkout
- Nom: minimum 2 caractères
- Téléphone: format algérien (0X XX XX XX XX)
- Wilaya: liste des 58 wilayas
- Adresse: minimum 10 caractères

## Administration

Accéder à `/admin/orders` et utiliser le secret défini dans `.env` pour gérer les commandes.

**Note de sécurité**: L'authentification admin actuelle est basique (client-side) et conçue pour un MVP. Pour la production, implémentez une authentification serveur complète avec sessions ou JWT.

## Déploiement

### Variables d'environnement requises
- `DATABASE_URL`: URL de connexion PostgreSQL
- `NEXT_PUBLIC_SITE_URL`: URL du site
- `ADMIN_SECRET`: Secret pour l'accès admin

### Build
```bash
pnpm build
pnpm start
```

## License

MIT
