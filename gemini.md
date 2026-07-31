# 🤖 Document de Transfert IA - Projet SK ACADEMIA

Ce document (`gemini.md`) est conçu pour fournir tout le contexte nécessaire à un futur modèle d'Intelligence Artificielle ou à un développeur reprenant le projet **SK ACADEMIA**.

---

## 1. Description du Projet (Ce que l'application fait)
**SK ACADEMIA** est une plateforme web "Serverless Client-Side" (SPA hybride) d'E-learning et d'E-commerce dédiée à la préparation des concours nationaux au Sénégal (ENA, Police, Douanes, Gendarmerie, FASTEF, Santé, etc.). 
Elle permet aux visiteurs de consulter un catalogue de formations, de fascicules et de cours vidéo, de les ajouter à un panier, et de finaliser l'achat via une redirection WhatsApp automatisée. Le site dispose également d'un espace membre (Dashboard Étudiant) et d'un back-office complet (Dashboard Admin).

## 2. Fonctionnalités Implémentées

### 🛒 E-Commerce & Catalogue
- **Affichage dynamique des produits** (Fascicules, Formations, Packs) générés via JavaScript.
- **Système de Panier complet** : Ajout, modification de la quantité, calcul du total (FCFA), et suppression.
- **Checkout WhatsApp** : Conversion du panier en un message WhatsApp formaté et redirection vers le numéro officiel de la plateforme.

### 🔐 Authentification & Espace Membre
- **Système de Login/Inscription simulé** (géré via `localStorage`).
- **Dashboard Étudiant** : Affiche les vidéos et les documents achetés avec une barre de progression. Accès restreint via une overlay de sécurité pour les non-connectés.
- **Dashboard Administrateur** : Protégé par une vérification stricte de l'email (`admin@skacademia.sn`).

### ⚙️ Back-Office (Tableau de Bord Admin)
Le Back-Office comprend 7 onglets entièrement dynamiques :
1. **Vue d'ensemble** : Statistiques globales (Chiffre d'affaires, Visiteurs en ligne simulés, Total Commandes).
2. **Produits** : Affichage sous forme de table.
3. **Base Clients** : Liste des utilisateurs inscrits avec leurs informations et statut (Premium/Gratuit), et bouton de contact WhatsApp direct.
4. **Commandes / Ventes** : Suivi des conversions.
5. **Paniers Abandonnés** : Enregistrement automatique des paniers non finalisés pour relance client.
6. **Analytiques** : Graphiques dynamiques générés via Chart.js (Évolution du CA et trafic).
7. **Paramètres** : Formulaire permettant de modifier dynamiquement les informations de contact (Téléphone, Email, Adresse) partout sur le site.

### 💬 Outils de Conversion
- **Chatbot Commercial (Moussa)** : Widget flottant interactif qui suggère des produits et répond aux clics des utilisateurs pour guider l'achat.
- **Bouton WhatsApp flottant** : Toujours accessible pour contacter le support.

## 3. Structure des Fichiers

```text
📁 SK ACADEMIA WEB/
 ├── 📄 index.html        # Fichier unique de structure, inclut toutes les vues (Accueil, Boutique, Admin, Dashboard) gérées en SPA.
 ├── 📄 styles.css        # Feuille de style unique. Utilise le "Glassmorphism" et des variables CSS pour un design system propre.
 ├── 📄 app.js            # Fichier logique principal gérant l'état, le routage hash, le localStorage et le DOM.
 ├── 📄 database.json     # Base de données initiale mockée pour injecter le catalogue produit par défaut.
 ├── 📄 gemini.md         # Ce document de contexte IA.
 └── 📁 images/           # (Optionnel) Dossier contenant les assets graphiques si hébergés localement.
```

## 4. Technologies Utilisées
- **Architecture** : Single Page Application (SPA) sans framework (Vanilla).
- **Frontend** : HTML5 sémantique, CSS3 (Flexbox/Grid, Animations natives, Variables), JavaScript (ES6+).
- **Stockage de données** : API `localStorage` du navigateur.
- **Librairies Tierces** : `Chart.js` (inséré via CDN) pour le rendu graphique des statistiques admin.
- **Hébergement et Déploiement** : GitHub Pages (Déploiement statique via la branche `main`).

## 5. Décisions de Design (Architecture & UI)
- **Pourquoi pas de Backend ?** Pour un déploiement gratuit, rapide et sans maintenance serveur. Le stockage se fait via `localStorage` pour simuler une base de données.
- **Pourquoi Vanilla JS / CSS ?** Pour s'affranchir des temps de compilation et garder un code 100% lisible et éditable sans build tools (pas de Webpack, pas de Vite). L'interface est néanmoins codée avec les standards d'un composant moderne.
- **Esthétique "Premium"** : Utilisation d'un thème à forte dominance de bleu (`#102a4a`), orange (`#f5a623`) et blanc, couplé avec des effets de transparence ("Glassmorphism" `backdrop-filter`) et des ombres douces pour refléter un aspect académique et moderne.
- **Routage Hash** : Les changements de page s'effectuent via l'URL hash (`#boutique`, `#admin`) interceptés par l'événement `window.onhashchange` pour afficher/masquer dynamiquement les `<section>` sans rechargement.

## 6. Instructions pour un Futur Modèle d'IA 🚨
Si vous (un autre modèle IA) êtes amené à poursuivre le développement de cette plateforme, veuillez respecter strictement ces règles :

1. **Ne pas casser l'approche SPA Vanilla** : Ne tentez pas de migrer l'application vers React, Vue ou Angular à moins d'une demande explicite de l'utilisateur. Le code doit rester simple et exécutable directement dans un navigateur.
2. **Gestion de l'État** : Tout nouvel état (nouveau produit, nouvelle configuration) doit impérativement être synchronisé avec le `localStorage` pour persister au rafraîchissement de la page. Consultez les fonctions existantes `getAdminData()` et `saveAdminData()` dans `app.js`.
3. **Sécurité et Permissions** : L'accès aux interfaces administrateur repose sur la vérification de l'email `admin@skacademia.sn` dans le `localStorage`. Veillez à conserver ce mécanisme si vous ajoutez de nouvelles routes protégées.
4. **Outils d'Édition** : Utilisez des outils précis (comme `multi_replace_file_content` ou des blocs de regex) plutôt que de réécrire les gros fichiers (`index.html` fait plus de 1500 lignes, `app.js` fait plus de 2800 lignes).
5. **Migration Backend (Future)** : Si l'utilisateur souhaite un "vrai" backend (ex: Firebase, Node.js), votre priorité sera de remplacer les appels `localStorage` dans `app.js` par des requêtes `fetch()` asynchrones, en conservant intact le code UI/DOM.
6. **Mise en ligne** : Les modifications se publient avec les commandes standards `git add .`, `git commit` et `git push`. La synchronisation sur GitHub Pages est automatique.
