# 🤖 Document de Transfert IA - Projet SK ACADEMIA

Ce document (`gemini.md`) est conçu pour fournir tout le contexte nécessaire à un futur modèle d'Intelligence Artificielle ou à un développeur reprenant le projet **SK ACADEMIA**.

---

## 1. Description du Projet (Ce que l'application fait)
**SK ACADEMIA** est une plateforme web "SPA hybride Serverless + Supabase Cloud" d'E-learning et d'E-commerce dédiée à la préparation des concours nationaux au Sénégal (ENA, Police, Douanes, Gendarmerie, FASTEF, Santé, etc.). 
Elle permet aux visiteurs de consulter un catalogue de formations, de fascicules et de cours vidéo, de les ajouter à un panier, et de finaliser l'achat via une redirection WhatsApp automatisée. Le site dispose d'un système d'inscription avec **vérification OTP par email** (code 6 chiffres), d'un **espace membre** (Dashboard Étudiant 5 onglets) et d'un **back-office complet** (Dashboard Admin 8 onglets de type Shopify/WooCommerce).

## 2. Fonctionnalités Implémentées

### 🛒 E-Commerce & Catalogue
- **Catalogue de 25 produits** répartis en 6 catégories (Administration, Forces de l'Ordre, Finances, Santé, Enseignement, Informatique).
- **Système de Panier complet** : Ajout, modification de la quantité, calcul du total (FCFA), et suppression.
- **Preview documents** : Visualisation de 10 pages simulées avant achat.
- **Checkout WhatsApp** : Conversion du panier en un message WhatsApp formaté et redirection vers le numéro officiel.
- **Sauvegarde automatique** des paniers abandonnés (localStorage + Supabase cloud).

### 🔐 Authentification & Inscription Sécurisée
- **Inscription avec vérification OTP** : formulaire complet (Prénom, Nom, Email, Téléphone, Mot de passe).
- **Code OTP 6 chiffres** avec 6 inputs auto-focus, timer 10 min, cooldown resend 60s.
- **SHA-256 hashing** de tous les mots de passe (jamais stockés en clair).
- **Anti brute-force** : 5 tentatives max → lockout 15 min (OTP) / 2 min (login).
- **Admin protégé** : accès `#admin` restreint à `admin@skacademia.sn` avec hash pré-calculé.

### 🎓 Dashboard Étudiant (`#dashboard`) — 5 Onglets
1. **Vue d'Ensemble** : Statistiques personnelles et dernières activités.
2. **Mes Achats** : Fascicules PDF achetés avec boutons de téléchargement.
3. **Mes Formations** : Vidéos avec barres de progression.
4. **Mon Profil** : Modification des informations et changement de mot de passe.
5. **Paramètres & Sécurité** : Notifications et suppression de compte.

### ⚙️ Dashboard Administrateur (`#admin`) — 8 Onglets
Architecture Shopify-like avec sidebar fixe sombre + topbar :
1. **Vue d'Ensemble** : 6 cartes KPI + graphiques Chart.js.
2. **Produits** : Table CRUD avec modale d'ajout/édition, recherche et filtres.
3. **Visiteurs** : Suivi trafic en temps réel (simulé).
4. **Ventes/Commandes** : Historique avec statuts et filtres.
5. **Clients** : CRM avec données masquées + contact WhatsApp direct.
6. **Paniers Abandonnés** : Relance client.
7. **Analytiques** : Graphiques Chart.js (CA 12 mois, répartition, trafic).
8. **Paramètres** : Configuration globale (téléphone, email, adresse, Supabase).

### ☁️ Intégration Supabase
- **Projet** : `igqwayiihhinrxhzlqcu`
- **Tables** : `products`, `orders`, `abandoned_carts`, `clients`
- **Cascade de chargement** : Supabase → localStorage → database.json → DEFAULT_PRODUCTS hardcodé.

### 💬 Outils de Conversion
- **Chatbot Commercial (Moussa)** : Widget flottant interactif avec suggestions d'achat guidées.
- **Bouton WhatsApp flottant** : Contact support accessible depuis toute page.
- **Liens sociaux réels** : Facebook (SK ACADEMIA), Instagram (@sk_academia).

## 3. Structure des Fichiers

```text
📁 SK ACADEMIA WEB/
├── 📄 index.html                        # Structure HTML unique (SPA) — ~2207 lignes
├── 📄 styles.css                        # Feuille de style unique — ~70 Ko
├── 📄 app.js                            # Moteur logique complet — ~174 Ko, ~3816 lignes
├── 📄 database.json                     # Catalogue produit initial (25 produits)
├── 📄 supabase_schema.sql               # Schéma SQL de la base Supabase
├── 📄 Plan_Architecture_SK_ACADEMIA.md  # Architecture technique complète
├── 📄 gemini.md                         # Ce document de contexte IA
├── 📄 .gitignore                        # Exclusions Git
└── 📁 images/                           # Assets graphiques locaux
```

## 4. Technologies Utilisées
- **Architecture** : SPA hybride (Vanilla JS + Supabase Cloud).
- **Frontend** : HTML5 sémantique, CSS3 (Flexbox/Grid, Animations, Variables, Glassmorphism), JavaScript ES6+.
- **Stockage de données** : Supabase PostgreSQL (cloud) + `localStorage` (fallback local).
- **Sécurité** : SHA-256 hashing, sanitization XSS, rate limiting, CSP headers.
- **Librairies Tierces** : Chart.js (CDN, defer), Supabase JS Client (CDN, defer).
- **Hébergement** : GitHub Pages (branche `main`).

## 5. Décisions de Design (Architecture & UI)
- **Pourquoi Supabase ?** Pour synchroniser les données (produits, commandes, clients) entre appareils sans backend custom. Gratuit pour démarrer.
- **Pourquoi garder localStorage ?** Comme fallback si Supabase est inaccessible. Garantit que le site fonctionne toujours.
- **Pourquoi Vanilla JS / CSS ?** Pour s'affranchir des temps de compilation et garder un code 100% lisible et éditable sans build tools.
- **Esthétique "Premium"** : Thème bleu foncé (`#0f172a`), orange (`#f5a623`) et blanc. Glassmorphism (`backdrop-filter`) et ombres douces.
- **Routage Hash** : `window.onhashchange` → `navigateTo()` → afficher/masquer les `<section>`.
- **Preloader Failsafe** : Script inline de secours + CSS `display: none !important` pour garantir que le loader disparaît en < 800ms.

## 6. Instructions pour un Futur Modèle d'IA 🚨
Si vous (un autre modèle IA) êtes amené à poursuivre le développement de cette plateforme, veuillez respecter strictement ces règles :

1. **Ne pas casser l'approche SPA Vanilla** : Ne tentez pas de migrer l'application vers React, Vue ou Angular à moins d'une demande explicite de l'utilisateur. Le code doit rester simple et exécutable directement dans un navigateur.
2. **Gestion de l'État** : Tout nouvel état doit être synchronisé avec `localStorage` ET Supabase via les fonctions existantes (`saveProducts()`, `saveOrderToSupabase()`, `saveClientToSupabase()`, etc.).
3. **Sécurité et Permissions** : L'accès admin repose sur `email === 'admin@skacademia.sn'`. Le mot de passe admin est stocké sous forme de hash SHA-256 (`ADMIN_PASSWORD_HASH`). Ne jamais stocker de mots de passe en clair.
4. **Outils d'Édition** : Utilisez des outils précis (`multi_replace_file_content`) plutôt que de réécrire les gros fichiers (`index.html` ~2207 lignes, `app.js` ~3816 lignes).
5. **Migration Backend (Future)** : Si un vrai backend est ajouté, remplacer les appels `localStorage` par des requêtes `fetch()` asynchrones, en conservant intact le code UI/DOM.
6. **Mise en ligne** : `git add .` → `git commit -m "..."` → `git push origin main`. GitHub Pages auto-deploy.
7. **Performance** : Toujours utiliser `defer` pour les scripts CDN. Ne jamais ajouter de délai artificiel au preloader.
