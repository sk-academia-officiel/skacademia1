# Plan d'Architecture Technique - SK ACADEMIA

**Date :** Août 2026 (Mise à jour complète)  
**Projet :** Plateforme E-learning & E-commerce SK ACADEMIA  
**URL Live :** https://sk-academia-officiel.github.io/skacademia1/  
**Dépôt GitHub :** https://github.com/sk-academia-officiel/skacademia1  
**Supabase Project :** https://igqwayiihhinrxhzlqcu.supabase.co  

---

## 1. Présentation du Projet

SK ACADEMIA est une plateforme web de E-learning et E-commerce dédiée à la préparation des concours nationaux au Sénégal (ENA, Police, Douanes, Gendarmerie, FASTEF, Santé, etc.).

Elle permet aux visiteurs de :
- Consulter un catalogue de **Fascicules**, **Annales corrigées**, **Formations vidéo** et **Documents PDF**
- Ajouter des produits à un panier et finaliser l'achat via **redirection WhatsApp automatisée**
- Créer un compte avec **vérification OTP par email** (code à 6 chiffres)
- Accéder à un **Dashboard Étudiant** personnalisé (achats, formations, profil)
- Pour l'administrateur : accéder à un **Dashboard Admin complet** de type e-commerce professionnel

L'objectif est d'avoir une application légère, rapide et fonctionnelle avec une architecture hybride **Client-Side + Supabase Cloud**.

---

## 2. Choix Technologiques (Stack)

L'architecture est un **SPA hybride "Serverless Client-Side"** avec synchronisation cloud Supabase.

### Frontend Core
- **HTML5** sémantique (fichier unique `index.html` ~2207 lignes)
- **CSS3** Vanilla avec variables CSS (`--bg-color`, `--primary`, `--text-dark`, `--accent`) pour thématisation
- **JavaScript ES6+** Vanilla (fichier unique `app.js` ~3816 lignes)
- **Aucun framework** frontend (ni React, ni Vue, ni Angular)
- **Aucun framework** CSS (ni Bootstrap, ni Tailwind)

### Architecture CSS
- Design System sur mesure avec variables CSS globales
- Flexbox/Grid pour le Responsive Design
- Glassmorphism (`backdrop-filter: blur()`) pour les modales et cartes
- Animations natives (`@keyframes`) pour les transitions et micro-interactions
- Interface Dashboard de type e-commerce professionnel (sidebar fixe, topbar, grilles de KPI)

### Stockage de Données (Hybride)
- **Supabase PostgreSQL** (cloud) : Synchronisation des produits, commandes, paniers abandonnés, clients
- **`localStorage`** API : Persistance locale des sessions, paniers, configurations en fallback
- **`database.json`** : Catalogue produit initial de secours (fallback ultime)

### Hébergement & CI/CD
- **GitHub Pages** avec déploiement continu via la branche `main`
- Commandes : `git add .` → `git commit -m "..."` → `git push origin main`

### Librairies Externes (CDN)
- **Chart.js** (`defer`) : Graphiques dynamiques (CA, trafic) dans le Dashboard Admin
- **Supabase JS Client** (`@supabase/supabase-js@2`, `defer`) : Communication avec la base de données cloud

### DNS Prefetch (Performance)
- `cdn.jsdelivr.net` (Chart.js, Supabase JS)
- `igqwayiihhinrxhzlqcu.supabase.co` (API Supabase)
- `fonts.googleapis.com` / `fonts.gstatic.com` (Google Fonts)

---

## 3. Structure des Fichiers

```text
📁 SK ACADEMIA WEB/
├── 📄 index.html                    # Structure HTML unique (SPA) — ~2207 lignes
├── 📄 styles.css                    # Feuille de style unique — ~70 Ko
├── 📄 app.js                        # Moteur logique complet — ~174 Ko, ~3816 lignes
├── 📄 database.json                 # Catalogue produit initial (25 produits)
├── 📄 supabase_schema.sql           # Schéma SQL de la base Supabase
├── 📄 Plan_Architecture_SK_ACADEMIA.md  # Ce document
├── 📄 gemini.md                     # Document de transfert IA
├── 📄 .gitignore                    # Exclusions Git
└── 📁 images/                       # Assets graphiques locaux
```

---

## 4. Architecture du Code (`app.js`)

Le fichier `app.js` est organisé en modules fonctionnels séquentiels :

### Modules (ordre d'exécution)

| # | Module | Lignes | Description |
|---|--------|--------|-------------|
| 1 | 🔒 Sécurité | 1-50 | Sanitization XSS, SHA-256 hashing, rate limiting anti brute-force |
| 2 | 🎨 Thème & Config | 51-210 | Variables CSS, configuration du site, gestion des contacts |
| 3 | ⚡ Preloader | 210-228 | Dismissal instantané du loader (< 100ms) |
| 4 | 🧭 SPA Navigation | 230-350 | Routage hash (`window.onhashchange`), `navigateTo()` |
| 5 | 📦 Catalogue Produits | 350-511 | `DEFAULT_PRODUCTS` (25 produits avec catégories, prix, descriptions) |
| 6 | ☁️ Module Supabase | 513-695 | Init client, CRUD cloud (produits, commandes, paniers, clients) |
| 7 | 📊 Initialisation Données | 696-780 | `PRODUCTS`, `loadDatabase()`, `saveProducts()`, cascade de fallback |
| 8 | 🛒 Panier & Checkout | 780-955 | `addToCart()`, `removeFromCart()`, calcul FCFA, checkout WhatsApp |
| 9 | 🎴 Rendu Catalogue | 955-1100 | `renderProducts()`, filtres catégorie, pagination, preview document |
| 10 | 🔐 Authentification | 1100-1320 | Login/inscription, OTP 6 chiffres, SHA-256, brute-force protection |
| 11 | 📋 OTP Vérification | 1320-1500 | Auto-focus inputs, timer 10 min, cooldown resend 60s, 5 tentatives max |
| 12 | 🎓 Dashboard Étudiant | 1500-1960 | 5 onglets (Vue d'ensemble, Achats, Formations, Profil, Sécurité) |
| 13 | 📈 Dashboard Admin | 2700-3816 | 8 onglets (Vue d'ensemble, Produits, Visiteurs, Ventes, Clients, Paniers, Analytiques, Paramètres) |

---

## 5. Modèle de Données

### 5.1 Stockage Local (`localStorage`)

| Clé | Contenu | Format |
|-----|---------|--------|
| `sk_users` | Liste des utilisateurs inscrits | `[{prenom, nom, email, passwordHash, phone, verified, createdAt}]` |
| `sk_session` | Utilisateur connecté (session active) | `{prenom, nom, email, phone}` |
| `sk_admin_data` | Historique ventes, paniers abandonnés, logs | `{sales: [], abandonedCarts: [], logs: []}` |
| `sk_site_config` | Paramètres globaux du site | `{phone, email, address, whatsapp}` |
| `sk_products` | Cache local du catalogue produit | `[{id, type, category, title, desc, price, image, ...}]` |
| `sk_supabase_url` | URL Supabase (overridable) | `string` |
| `sk_supabase_key` | Clé anon Supabase (overridable) | `string` |

### 5.2 Base de Données Cloud (Supabase PostgreSQL)

**URL :** `https://igqwayiihhinrxhzlqcu.supabase.co`

| Table | Colonnes | Description |
|-------|----------|-------------|
| `products` | `id`, `type`, `category`, `title`, `desc`, `price`, `image`, `content`, `icon`, `bg`, `catLabel`, `catName`, `typeName` | Catalogue produit synchronisé |
| `orders` | `id`, `client`, `phone`, `items`, `total`, `date`, `status` | Commandes finalisées |
| `abandoned_carts` | `id`, `client`, `phone`, `items`, `total`, `date` | Paniers non finalisés (relance client) |
| `clients` | `id`, `prenom`, `nom`, `email`, `phone`, `created_at`, `status` | Base clients (CRM) |

### 5.3 Cascade de Chargement des Produits

```
1. Supabase Cloud (table `products`)
   ↓ (si vide ou erreur)
2. localStorage (`sk_products`)
   ↓ (si vide)
3. database.json (fichier local)
   ↓ (si introuvable)
4. DEFAULT_PRODUCTS (hardcodé dans app.js — 25 produits)
```

---

## 6. Fonctionnalités Implémentées

### 🛒 E-Commerce & Tunnel de Vente
- Catalogue dynamique avec **25 produits** répartis en 6 catégories (Administration, Forces de l'Ordre, Finances, Santé, Enseignement, Informatique)
- Filtres par catégorie et barre de recherche
- Système de panier complet : ajout, modification de quantité, suppression, calcul total en FCFA
- **Preview documents** : visualisation de 10 pages simulées avant achat
- **Checkout WhatsApp** : message formaté automatique avec liste des articles et total
- Sauvegarde automatique des paniers abandonnés (localStorage + Supabase)

### 🔐 Authentification & Inscription Sécurisée
- **Inscription avec OTP** : formulaire (Prénom, Nom, Email, Téléphone, Mot de passe)
- **Vérification par code OTP 6 chiffres** :
  - 6 inputs individuels avec auto-focus automatique
  - Email masqué affiché (`j***@gmail.com`)
  - Timer d'expiration de **10 minutes** avec compte à rebours visuel
  - Cooldown de **60 secondes** entre chaque renvoi de code
  - **5 tentatives maximum** avant blocage de 15 minutes (anti brute-force)
- **Hashage SHA-256** des mots de passe (jamais stockés en clair)
- **Nettoyage mémoire** immédiat du code OTP après validation
- Connexion par email + mot de passe hashé

### 🎓 Dashboard Étudiant (`#dashboard`) — 5 Onglets

| Onglet | Fonctionnalité |
|--------|---------------|
| Vue d'Ensemble | Statistiques personnelles (achats, progression, dernières activités) |
| Mes Achats | Liste des fascicules PDF achetés avec boutons de téléchargement |
| Mes Formations | Vidéos de formation avec barres de progression |
| Mon Profil | Modification des informations personnelles et changement de mot de passe |
| Paramètres & Sécurité | Gestion des notifications et suppression de compte |

### ⚙️ Dashboard Administrateur (`#admin`) — 8 Onglets

Architecture de type **Shopify/WooCommerce** avec :
- **Sidebar gauche fixe** (fond `#0f172a`) avec icônes + labels
- **Topbar** avec nom de l'admin et bouton de déconnexion
- **Onglet actif** avec fond coloré distinct (orange clair)

| Onglet | Fonctionnalité |
|--------|---------------|
| Vue d'Ensemble | 6 cartes KPI (CA, visiteurs, acheteurs, taux conversion, panier moyen, NPS) + graphiques Chart.js |
| Produits | Table CRUD complète avec modale d'ajout/édition, recherche et filtres par catégorie |
| Visiteurs | Suivi du trafic en temps réel (simulé), tableau des sessions |
| Ventes/Commandes | Historique des commandes avec statut, filtres et export |
| Clients | Base CRM avec données masquées (emails/téléphones partiellement cachés), contact WhatsApp direct |
| Paniers Abandonnés | Relance client avec détail des paniers non finalisés |
| Analytiques | Graphiques dynamiques Chart.js (évolution CA sur 12 mois, répartition par catégorie, trafic) |
| Paramètres | Éditeur de configuration globale (Téléphone, Email, Adresse, credentials Supabase) |

### 💬 Outils de Conversion
- **Chatbot Commercial (Moussa)** : widget flottant interactif avec suggestions d'achat guidées
- **Bouton WhatsApp flottant** : contact support accessible depuis toute page
- **Liens sociaux réels** : Facebook (`SK ACADEMIA`), Instagram (`@sk_academia`)

---

## 7. Sécurité & Bonnes Pratiques

### Authentification
- **SHA-256 hashing** de tous les mots de passe avec salt personnalisé (`_SK_ACADEMIA_SALT_2026`)
- **Hash admin pré-calculé** (constante `ADMIN_PASSWORD_HASH`) — jamais de mot de passe admin en clair dans le code
- **Rate limiting anti brute-force** : 5 tentatives → lockout 2 minutes
- **OTP brute-force protection** : 5 tentatives → lockout 15 minutes
- **Accès admin restreint** : vérification `email === 'admin@skacademia.sn'` sur chaque navigation vers `#admin`

### Protection XSS
- **Fonction `sanitizeHTML()`** : échappement systématique de `& < > " ' /` avant injection DOM
- **Content-Security-Policy (CSP)** : bloque les scripts tiers non autorisés

### Headers HTTP Sécurisés
- `X-Frame-Options: DENY` (anti-clickjacking)
- `X-Content-Type-Options: nosniff`

### Protection Anti-Copie
- Désactivation du clic droit, de la sélection de texte, et des raccourcis clavier de copie sur les contenus protégés

### Validation
- Validation côté client de tous les formulaires (email regex, longueur mot de passe, champs obligatoires)
- Isolation des routes : tentative d'accès `#admin` par non-admin → redirection automatique vers `#accueil`

---

## 8. Performance & Optimisations

### Preloader Ultra-Rapide
- **Script inline de secours** dans `index.html` (juste après le `<div#loader>`) : supprime le loader en **800ms maximum** même si `app.js` échoue
- **`dismissLoader()`** dans `app.js` : exécution immédiate dès `readyState === "interactive"`
- **CSS `display: none !important`** sur `.loader.fade-out` pour garantie absolue de disparition
- **Aucun délai artificiel** (`setTimeout` supprimé)

### Chargement des Scripts
- **`defer`** sur Chart.js et Supabase JS (ne bloquent pas le parsing HTML)
- **DNS Prefetch** (`<link rel="dns-prefetch">`) pour les domaines CDN et Supabase
- **Cache buster** (`app.js?v=2.0.1`) pour forcer le rechargement après mise à jour

### Architecture Légère
- Zéro framework = zéro overhead de compilation
- 3 fichiers principaux uniquement (HTML + CSS + JS)
- Images via Unsplash CDN (pas de téléchargement local lourd)

---

## 9. Intégration Supabase (BaaS)

### Configuration
- **Projet** : `igqwayiihhinrxhzlqcu`
- **URL** : `https://igqwayiihhinrxhzlqcu.supabase.co`
- **Clé Anon** : stockée dans `app.js` (overridable via `localStorage`)

### Fonctions Cloud (`app.js`)

| Fonction | Description |
|----------|-------------|
| `initSupabase()` | Initialise le client Supabase avec URL + clé anon |
| `loadProductsFromSupabase()` | Charge le catalogue depuis la table `products` |
| `saveProductsToSupabase(products)` | Sauvegarde/sync le catalogue vers Supabase |
| `saveOrderToSupabase(order)` | Enregistre une commande finalisée |
| `saveAbandonedCartToSupabase(cart)` | Enregistre un panier abandonné |
| `saveClientToSupabase(client)` | Enregistre un nouveau client |

### Schéma SQL
Le fichier `supabase_schema.sql` contient les instructions `CREATE TABLE` pour initialiser les tables Supabase.

---

## 10. Routage SPA (Navigation Hash)

| Hash | Section | Accès |
|------|---------|-------|
| `#accueil` | Page d'accueil (Hero, catégories, témoignages) | Public |
| `#boutique` | Catalogue produit avec filtres et panier | Public |
| `#admin` | Dashboard Administrateur (8 onglets) | Restreint (`admin@skacademia.sn`) |
| `#dashboard` | Dashboard Étudiant (5 onglets) | Connecté uniquement |

**Mécanisme** : `window.onhashchange` → `navigateTo(hash)` → afficher/masquer les `<section>` correspondantes.

---

## 11. Limitations Actuelles & Évolutions Futures

### Limitations
- Le **stockage `localStorage`** reste utilisé en fallback : les données ne sont pas synchronisées si Supabase est inaccessible
- L'**envoi d'email OTP** utilise actuellement une simulation côté client (pas de vrai envoi SMTP) — à remplacer par EmailJS ou Supabase Edge Functions
- Le **paiement** reste une redirection WhatsApp manuelle (pas de paiement en ligne intégré)
- Les **fichiers PDF et vidéos** ne sont pas encore hébergés (liens simulés)

### Évolutions Recommandées

| Priorité | Évolution | Description |
|----------|-----------|-------------|
| 🔴 Haute | **Envoi OTP réel** | Intégrer EmailJS ou Supabase Edge Functions pour envoyer les codes par email |
| 🔴 Haute | **Hébergement de contenu** | Uploader les PDF et vidéos sur Supabase Storage ou un CDN |
| 🟠 Moyenne | **Paiement en ligne** | Intégrer Wave, Orange Money ou PayDunya pour le paiement automatisé |
| 🟠 Moyenne | **Authentification JWT** | Migrer vers Supabase Auth pour tokens sécurisés côté serveur |
| 🟡 Basse | **PWA** | Ajouter un Service Worker et un `manifest.json` pour fonctionnement hors-ligne |
| 🟡 Basse | **Analytics réels** | Remplacer les données simulées par Google Analytics ou Plausible |

---

## 12. Instructions pour un Futur Développeur / IA 🚨

1. **Ne pas casser l'approche SPA Vanilla** : ne pas migrer vers React/Vue/Angular sans demande explicite
2. **Gestion de l'État** : tout nouvel état doit être synchronisé avec `localStorage` ET Supabase via les fonctions existantes (`saveProducts()`, `saveOrderToSupabase()`, etc.)
3. **Sécurité Admin** : l'accès admin repose sur la vérification `email === 'admin@skacademia.sn'` — conserver ce mécanisme
4. **Édition prudente** : utiliser des outils de remplacement précis (`multi_replace_file_content`) — ne JAMAIS réécrire `app.js` ou `index.html` en entier (fichiers de 3800+ et 2200+ lignes)
5. **Déploiement** : `git add .` → `git commit -m "..."` → `git push origin main` (GitHub Pages auto-deploy)
6. **Migration Backend** : si un vrai backend est ajouté, remplacer les appels `localStorage` par des requêtes `fetch()` asynchrones en conservant intact le code UI/DOM

---

*Ce document est la référence technique complète de SK ACADEMIA. Dernière mise à jour : Août 2026.*
