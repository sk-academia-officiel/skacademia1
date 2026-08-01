# Plan d'Architecture Technique - SK ACADEMIA

**Date :** Juillet 2026
**Projet :** Plateforme E-learning & E-commerce SK ACADEMIA
**URL :** https://sk-academia-officiel.github.io/skacademia1/

---

## 1. Présentation du Projet
SK ACADEMIA est une plateforme web visant à fournir des ressources éducatives (Fascicules, Annales, Formations Vidéo, Documents PDF) destinées à la préparation des concours nationaux au Sénégal (ENA, Police, Douanes, Gendarmerie, FASTEF, etc.).
L'objectif est d'avoir une application légère, rapide et 100% fonctionnelle côté client sans nécessiter d'infrastructure backend lourde dans un premier temps.

## 2. Choix Technologiques (Stack)
L'approche choisie est une architecture **"Serverless Client-Side" (SPA hybride)** pour minimiser les coûts d'hébergement tout en garantissant des performances maximales.

- **Frontend Core :** HTML5 Sémantique, CSS3 (Vanilla avec variables CSS pour thématisation), JavaScript (ES6+ Vanilla).
- **Architecture CSS :** Design System sur mesure (Variables `--bg-color`, `--primary`, `--text-dark`). Utilisation de Flexbox/Grid pour le Responsive Design. Aucun framework lourd (ni Bootstrap, ni Tailwind) n'a été utilisé pour garantir une performance optimale.
- **Stockage de Données :** 
  - `localStorage` API pour la persistance des sessions utilisateurs, des paniers abandonnés, et des configurations du site.
  - `database.json` pour charger dynamiquement le catalogue produit initial.
- **Hébergement & CI/CD :** GitHub Pages avec déploiement continu via la branche `main`.
- **Librairies Externes :** 
  - *Chart.js* (via CDN) pour les analytiques du Dashboard Administrateur.

## 3. Architecture du Code
Le projet est architecturé autour de trois fichiers principaux pour faciliter la maintenance :

- **`index.html`** : Contient la structure (DOM). Construit en format SPA (Single Page Application) naviguant à travers différentes "sections" cachées ou affichées dynamiquement (`#accueil`, `#boutique`, `#admin`).
- **`styles.css`** : Gère l'UI/UX. Intègre un mode "Glassmorphism", des animations fluides (`@keyframes`), et une interface de type Dashboard E-commerce.
- **`app.js`** : Moteur logique de l'application. Gère le routage hash (`window.onhashchange`), l'authentification simulée (Admin vs Utilisateur), la manipulation du DOM, et les interactions dynamiques (Panier, Checkout via WhatsApp, Statistiques).

## 4. Modèle de Données (Stockage Local)
Les données sont sauvegardées dans le navigateur des utilisateurs sous les clés suivantes :
- `sk_users` : Liste des utilisateurs inscrits (Prénom, Nom, Email, Mot de passe hashé/simulé).
- `sk_session` : Stocke l'utilisateur actuellement connecté pour maintenir la session.
- `sk_admin_data` : Contient l'historique des ventes, les paniers abandonnés et les journaux d'activités du Dashboard Admin.
- `sk_site_config` : Stocke les paramètres globaux dynamiques (Numéro WhatsApp, Email officiel, Adresse physique).

## 5. Fonctionnalités Clés
- **E-Commerce & Tunnel de Vente** : Ajout au panier, gestion des quantités, et redirection automatique vers WhatsApp avec un message pré-rempli listant la commande et le total en FCFA.
- **Espace Administrateur (`#admin`)** :
  - Accès restreint au compte `admin@skacademia.sn`.
  - *Analytiques* : Chiffre d'affaires, statistiques en temps réel avec graphiques (Chart.js).
  - *Gestion des Produits* : Interface CRUD (Création, Lecture, Mise à jour, Suppression) sur le catalogue.
  - *CRM Basic* : Liste des clients inscrits avec bouton de contact direct sur WhatsApp.
  - *Relance Client* : Tableau des paniers abandonnés.
  - *Paramètres* : Éditeur de contact (Téléphone, Email) se répercutant globalement sur le site.
- **Espace Élève (`#dashboard`)** : Espace réservé listant les cours vidéo achetés avec barre de progression et les documents téléchargeables.
- **Chatbot Commercial** : Widget interactif (Moussa) générant des suggestions d'achat guidées.

## 6. Sécurité & Bonnes Pratiques
- **Content-Security-Policy (CSP)** : Bloque l'exécution de scripts tiers non autorisés, protégeant contre les attaques XSS.
- **Headers HTTP Sécurisés** : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- **Validation Formulaire** : Les champs d'authentification sont validés côté client avant tout traitement.
- **Isolations des routes** : Une tentative d'accès à la route `#admin` par un utilisateur non-admin redirige automatiquement vers l'accueil.

## 7. Limitations Actuelles & Évolutions Futures
Étant donné la nature du stockage local (localStorage), les données (ventes, nouveaux utilisateurs inscrits autres que soi-même) ne sont pas synchronisées entre différents appareils ou utilisateurs. 
**Recommandation pour le Développeur futur :**
1. **Création d'une API Backend :** Remplacer les appels `localStorage` par des appels `fetch()` vers une base de données distante (ex: Firebase, Supabase, ou API Node.js/MongoDB).
2. **Paiement en ligne :** Intégrer des agrégateurs de paiement locaux (PayDunya, Wave, Orange Money) au lieu de la redirection WhatsApp.
3. **Authentification JWT :** Mettre en place un système d'authentification par token (JSON Web Token) sécurisé côté serveur.

---
*Ce document sert de base technique et conceptuelle. L'interface (Frontend) est prête pour la production et peut être connectée à n'importe quelle technologie Backend (Headless CMS, Node.js, PHP, Python) via de simples requêtes API.*
