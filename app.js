/* ============================================
   SK ACADEMIA — app.js
   Logique complète : catalogue, panier, quiz
   ============================================ */

/* ============================================
   🔒 MODULE SÉCURITÉ — SK ACADEMIA
   ============================================ */

// ---- XSS SANITIZATION ----
const sanitizeHTML = (str) => {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;', '/': '&#x2F;' };
    return str.replace(/[&<>"'/]/g, c => map[c]);
};

// ---- SHA-256 PASSWORD HASHING ----
const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + '_SK_ACADEMIA_SALT_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// TODO: authentification admin actuellement non sécurisée (localStorage uniquement) — à remplacer par un vrai backend avant mise en production.
const ADMIN_PASSWORD_HASH = "84489a7101859c0cae687bdfae032ec8bd6efbf21fafe2a0edbb32aa4e3ffae8";
const getAdminHash = async () => {
    return ADMIN_PASSWORD_HASH;
};

// ---- RATE LIMITING (ANTI BRUTE-FORCE) ----
const RATE_LIMIT = {
    maxAttempts: 5,
    lockoutDuration: 2 * 60 * 1000, // 2 minutes in ms
    attempts: 0,
    lockoutUntil: 0
};

const isLoginLocked = () => {
    if (RATE_LIMIT.lockoutUntil && Date.now() < RATE_LIMIT.lockoutUntil) {
        const remaining = Math.ceil((RATE_LIMIT.lockoutUntil - Date.now()) / 1000);
        return remaining;
    }
    if (RATE_LIMIT.lockoutUntil && Date.now() >= RATE_LIMIT.lockoutUntil) {
        RATE_LIMIT.attempts = 0;
        RATE_LIMIT.lockoutUntil = 0;
    }
    return 0;
};

const recordFailedLogin = () => {
    RATE_LIMIT.attempts++;
    if (RATE_LIMIT.attempts >= RATE_LIMIT.maxAttempts) {
        RATE_LIMIT.lockoutUntil = Date.now() + RATE_LIMIT.lockoutDuration;
        RATE_LIMIT.attempts = 0;
        return true; // locked
    }
    return false;
};

const resetLoginAttempts = () => {
    RATE_LIMIT.attempts = 0;
    RATE_LIMIT.lockoutUntil = 0;
};

// ---- SESSION TIMEOUT (30 MINUTES) ----
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let sessionTimer = null;

const updateLastActivity = () => {
    localStorage.setItem('sk_last_activity', Date.now().toString());
};

const checkSessionTimeout = () => {
    const lastActivity = parseInt(localStorage.getItem('sk_last_activity') || '0');
    const currentUser = localStorage.getItem('sk_academia_current_user');
    if (currentUser && lastActivity && (Date.now() - lastActivity > SESSION_TIMEOUT_MS)) {
        localStorage.removeItem('sk_academia_current_user');
        localStorage.removeItem('sk_last_activity');
        if (typeof updateAuthUI === 'function') updateAuthUI();
        if (typeof updateGatedSections === 'function') updateGatedSections();
        if (typeof showToast === 'function') showToast('⏰', 'Session expirée. Veuillez vous reconnecter pour votre sécurité.');
        return true;
    }
    return false;
};

// Track user activity for session timeout
['click', 'keydown', 'mousemove', 'scroll', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, () => {
        if (localStorage.getItem('sk_academia_current_user')) {
            updateLastActivity();
        }
    }, { passive: true });
});

// Check session every 60 seconds
setInterval(checkSessionTimeout, 60 * 1000);

// ---- ANTI DEVTOOLS & RIGHT-CLICK PROTECTION ----
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

document.addEventListener('keydown', (e) => {
    // Block F12
    if (e.key === 'F12') { e.preventDefault(); return false; }
    // Block Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
    // Block Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
    // Block Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
});

// ---- INPUT VALIDATION HELPERS ----
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isStrongPassword = (password) => {
    // At least 6 chars, 1 uppercase, 1 number
    return password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password);
};

/* ============================================
   END SECURITY MODULE
   ============================================ */

// ============================
//  BASE DE DONNÉES — PRODUITS
// Base de données chargée via loadDatabase()

// Formations display data
const FORMATIONS = [
    { icon: "🧠", level: "Débutant → Expert", title: "Intelligence Artificielle Appliquée", desc: "Maîtrisez les outils IA pour booster votre productivité et automatiser vos tâches quotidiennes.", price: 50000 },
    { icon: "💻", level: "Débutant → Intermédiaire", title: "Développement Web Moderne", desc: "Créez des sites et applications web de A à Z avec les technologies actuelles.", price: 75000 },
    { icon: "📑", level: "Tous niveaux", title: "Préparation aux Concours", desc: "Méthodologie, culture générale, rédaction administrative et gestion du temps pour réussir.", price: 30000 },
    { icon: "📊", level: "Professionnel", title: "Bureautique & Productivité", desc: "Excel avancé, Word, PowerPoint et outils numériques essentiels en entreprise.", price: 25000 },
];

// Documents (sample)
const DOCUMENTS = [
    { icon: "📄", title: "Fiche — Histoire du Sénégal", sub: "Culture générale • 15 pages", size: "2.3 MB" },
    { icon: "📄", title: "Guide Méthodologie Dissertation", sub: "Français • Technique rédactionnelle", size: "1.8 MB" },
    { icon: "📄", title: "QCM Culture Générale — 500 Questions", sub: "Multi-concours • Avec corrections", size: "5.1 MB" },
    { icon: "📄", title: "Leçons de Mathématiques — Terminale", sub: "Maths • Niveau lycée avancé", size: "8.4 MB" },
    { icon: "📄", title: "Résumé — Institutions du Sénégal", sub: "Droit public • Synthèse complète", size: "1.2 MB" },
    { icon: "📄", title: "Fiches Anatomie & Biologie Humaine", sub: "Santé • Concours sage-femme / INSEPS", size: "6.7 MB" },
];

// ==================
//  ÉTAT DE L'APP
// ==================
let cart = [];
let currentFilter = "all";
let searchQuery = "";

// ==================
//  DOM REFERENCES
// ==================
const loader        = document.getElementById("loader");
const navbar        = document.getElementById("navbar");
const hamburger     = document.getElementById("hamburger");
const navMenu       = document.getElementById("navMenu");
const cartToggle    = document.getElementById("cartToggle");
const cartSidebar   = document.getElementById("cartSidebar");
const cartOverlay   = document.getElementById("cartOverlay");
const closeCart      = document.getElementById("closeCart");
const cartBadge     = document.getElementById("cartBadge");
const cartBody      = document.getElementById("cartBody");
const cartTotal     = document.getElementById("cartTotal");
const productsGrid  = document.getElementById("productsGrid");
const formationsGrid= document.getElementById("formationsGrid");
const documentsGrid = document.getElementById("documentsGrid");
const noResults     = document.getElementById("noResults");
const toast         = document.getElementById("toast");
const toastMsg      = document.getElementById("toastMsg");
const toastIcon     = document.getElementById("toastIcon");
const backToTop     = document.getElementById("backToTop");

// Auth DOM
const authOverlay       = document.getElementById("authOverlay");
const authModal         = document.getElementById("authModal");
const authClose         = document.getElementById("authClose");
const tabLogin          = document.getElementById("tabLogin");
const tabRegister       = document.getElementById("tabRegister");
const loginForm         = document.getElementById("loginForm");
const registerForm      = document.getElementById("registerForm");
const loginError        = document.getElementById("loginError");
const registerError     = document.getElementById("registerError");
const switchToRegister  = document.getElementById("switchToRegister");
const authFooterText    = document.getElementById("authFooterText");
const btnLoginNav       = document.getElementById("btnLoginNav");
const userProfileNav    = document.getElementById("userProfileNav");
const userAvatar        = document.getElementById("userAvatar");
const userAvatarLg      = document.getElementById("userAvatarLg");
const userNameNav       = document.getElementById("userNameNav");
const userFullName      = document.getElementById("userFullName");
const userEmailDisplay  = document.getElementById("userEmailDisplay");
const btnLogout         = document.getElementById("btnLogout");

// Sections that require authentication (Temporarily disabled for development)
const GATED_SECTIONS = [];

// ==================
//  LOADER OPTIMISÉ (CHARGEMENT ULTRA-RAPIDE < 100MS)
// ==================
const dismissLoader = () => {
    const loaderEl = document.getElementById("loader");
    if (loaderEl && !loaderEl.classList.contains("fade-out")) {
        loaderEl.classList.add("fade-out");
        setTimeout(() => {
            if (loaderEl) loaderEl.style.display = "none";
        }, 200);
    }
};

if (document.readyState === "interactive" || document.readyState === "complete") {
    dismissLoader();
} else {
    document.addEventListener("DOMContentLoaded", dismissLoader);
    window.addEventListener("load", dismissLoader);
}

// ==================
//  SPA NAVIGATION
// ==================
// Map which sections should be visible for each nav link
const ROUTES = {
    "accueil": ["accueil", "categories"], // L'accueil affiche le hero ET les catégories
    "boutique": ["boutique", "quiz"],     // La boutique affiche les produits ET le promo quiz
    "concours": ["concours"],
    "formations": ["formations", "documents"], // Formations affiche aussi les documents
    "about": ["about", "services"],       // A Propos affiche aussi les services
    "contact": ["contact"],
    "cgu": ["cgu"],                       // CGU & Politique de Confidentialité
    "dashboard": ["dashboard"],           // NEW: Espace étudiant
    "course": ["course"],                 // NEW: Course player
    "admin": ["admin"]                    // NEW: Espace Admin
};

const navigateTo = (hash) => {
    // Default to 'accueil' if no hash or invalid hash
    let target = hash.replace("#", "") || "accueil";
    if (!ROUTES[target]) {
        // If it's a direct link to a section not in ROUTES (like #categories), just show that one
        const el = document.getElementById(target);
        if (!el) target = "accueil"; 
    }

    // Hide all sections
    document.querySelectorAll(".page-section").forEach(sec => {
        sec.classList.add("hidden-section");
    });

    // Show mapped sections
    if (ROUTES[target]) {
        ROUTES[target].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove("hidden-section");
        });
    } else {
        const el = document.getElementById(target);
        if (el) el.classList.remove("hidden-section");
    }

    // Update active nav link
    document.querySelectorAll(".nav-item").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${target}`) {
            link.classList.add("active");
        }
    });

    // Close mobile menu if open
    hamburger.classList.remove("active");
    navMenu.classList.remove("open");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Trigger scroll reveal on newly visible elements
    setTimeout(setupScrollReveal, 100);
};

// Handle internal navigation clicks (smooth tab switching)
document.addEventListener("click", (e) => {
    const link = e.target.closest("a[href^='#']");
    if (link) {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (href !== "#") {
            history.pushState(null, null, href);
            navigateTo(href);
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
    navigateTo(window.location.hash);
});

// Minimal scroll event just for navbar background styling
window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);

    // Back to top button
    if (backToTop) {
        backToTop.classList.toggle("show", window.scrollY > 600);
    }
});

// Back to top click
if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ==================
//  HAMBURGER MENU
// ==================
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("open");
});

// Note: Menu closing on link click is now handled in SPA navigation logic.

// ==================
//  CART
// ==================
const openCartSidebar = () => {
    cartSidebar.classList.add("open");
    cartOverlay.classList.add("show");
};
const closeCartSidebar = () => {
    cartSidebar.classList.remove("open");
    cartOverlay.classList.remove("show");
    if (cart.length > 0 && typeof recordAbandonedCart === 'function') {
        recordAbandonedCart(cart);
    }
};

cartToggle.addEventListener("click", openCartSidebar);
closeCart.addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

const formatPrice = (n) =>
    new Intl.NumberFormat("fr-SN").format(n) + " FCFA";

const renderCart = () => {
    cartBadge.textContent = cart.length;

    if (cart.length === 0) {
        cartBody.innerHTML = `
            <div class="cart-empty">
                <span>📭</span>
                <p>Votre panier est vide</p>
            </div>`;
        cartTotal.textContent = "0 FCFA";
        return;
    }

    let total = 0;
    cartBody.innerHTML = cart.map((item, i) => {
        total += item.price;
        return `
            <div class="cart-item">
                <div class="cart-item-icon">${item.icon}</div>
                <div class="cart-item-info">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <button class="btn-remove" data-index="${i}" title="Supprimer">🗑</button>
            </div>`;
    }).join("");

    cartTotal.textContent = formatPrice(total);

    cartBody.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-index"));
            cart.splice(idx, 1);
            renderCart();
        });
    });
};

const addToCart = (id) => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    cart.push({ ...product });
    renderCart();
    openCartSidebar();
    showToast("✅", `"${product.title.slice(0, 40)}..." ajouté au panier`);
};

// ==================
//  TOAST
// ==================
let toastTimer;
const showToast = (icon = "✅", msg = "Action effectuée", duration = 3500) => {
    if (!toast) return;
    if (toastIcon) toastIcon.textContent = icon;
    if (toastMsg) toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
};

// ==================
//  PAYMENT SIMULATION & USER PURCHASES
// ==================
const simulatePayment = (method) => {
    const user = getCurrentUser();
    if (!user) {
        showToast("⚠️", "Veuillez vous connecter pour payer", 3000);
        openAuthModal("login");
        return;
    }
    if (cart.length === 0) {
        showToast("⚠️", "Votre panier est vide", 3000);
        return;
    }
    
    // Simulate API delay for mobile money prompt
    const emoji = method === 'Wave' ? '🌊' : '🟠';
    showToast("⏳", `Demande de paiement ${method} initiée... Confirmation manuelle sous quelques minutes via WhatsApp.`, 5000);
    
    setTimeout(() => {
        // Save items to user's purchases
        if (!user.purchases) user.purchases = [];
        const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        
        cart.forEach(item => {
            user.purchases.push({
                ...item,
                purchasedAt: dateStr,
                progress: 15
            });
        });
        
        // Update user session and local database
        setCurrentUser(user);
        const users = getUsers();
        const uIdx = users.findIndex(u => u.email === user.email);
        if (uIdx > -1) {
            users[uIdx] = user;
            saveUsers(users);
        }

        cart = []; // Empty cart
        renderCart();
        closeCartSidebar();
        renderStudentDashboard();
        
        showToast("✅", `Paiement ${method} réussi ! Retrouvez vos achats dans votre Dashboard.`);
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
            history.pushState(null, null, "#dashboard");
            navigateTo("#dashboard");
        }, 2000);
    }, 4000);
};

// ==================
//  RENDER PRODUCTS & DEFAULT DATASET
// ==================
const CAT_IMAGES = {
    "administration": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop", 
    "douane": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600&auto=format&fit=crop", 
    "sante": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop", 
    "grandes-ecoles": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop", 
    "enseignement": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop", 
    "formation": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop", 
};

const DEFAULT_PRODUCTS = [
  { id: 1, type: "fascicule", category: "administration", icon: "📋", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Fascicule Complet — Concours ENA Sénégal", desc: "Toutes les matières : culture générale, droit administratif, économie, rédaction administrative.", price: 12000, typeName: "Fascicule" },
  { id: 2, type: "annale", category: "administration", icon: "📜", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Annales Corrigées ENA — 10 ans", desc: "10 années d'annales corrigées avec méthodologie et conseils de réussite.", price: 8000, typeName: "Annale" },
  { id: 3, type: "fascicule", category: "administration", icon: "⚖️", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Fascicule Concours Magistrat", desc: "Procédure pénale, procédure civile, droit constitutionnel et questions d'actualité juridique.", price: 15000, typeName: "Fascicule" },
  { id: 4, type: "cours", category: "administration", icon: "📖", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Cours PDF — Droit Administratif Sénégalais", desc: "Cours complet et structuré pour maîtriser le droit administratif national.", price: 5000, typeName: "Cours PDF" },
  { id: 5, type: "fascicule", category: "administration", icon: "🗂️", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Pack CREM — Toutes Spécialités", desc: "Pack complet pour le CREM : cours, fiches, annales et exercices pour toutes les spécialités.", price: 18000, typeName: "Pack" },
  { id: 6, type: "fascicule", category: "administration", icon: "⚖️", bg: "bg-admin", catLabel: "cat-lbl-admin", catName: "Administration & Justice", title: "Fascicule Concours Greffier", desc: "Préparation ciblée : organisation judiciaire, procédure, culture juridique et rédaction.", price: 10000, typeName: "Fascicule" },
  { id: 7, type: "fascicule", category: "securite", icon: "👮", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Sécurité & Défense", title: "Fascicule — Concours Police Nationale", desc: "Culture générale, dictée, QCM logique, math, et préparation aux épreuves physiques.", price: 10000, typeName: "Fascicule" },
  { id: 8, type: "annale", category: "securite", icon: "📜", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Sécurité & Défense", title: "Annales Police Nationale — 8 ans", desc: "8 années d'épreuves corrigées avec les critères de notation officiels.", price: 7000, typeName: "Annale" },
  { id: 9, type: "fascicule", category: "securite", icon: "🪖", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Sécurité & Défense", title: "Fascicule — Concours Gendarmerie Nationale", desc: "Préparation complète pour la gendarmerie : épreuves écrites et guide physique.", price: 10000, typeName: "Fascicule" },
  { id: 10, type: "fascicule", category: "douanes", icon: "🛃", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Douanes Sénégalaises", title: "Fascicule — Concours Douanes Sénégalaises", desc: "Économie, droit douanier, mathématiques et culture générale pour les douanes.", price: 12000, typeName: "Fascicule" },
  { id: 11, type: "fascicule", category: "securite", icon: "⭐", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Sécurité & Défense", title: "Fascicule — Concours ENSOA", desc: "Toutes les épreuves de l'ENSOA : sciences, mathématiques, culture générale et discipline militaire.", price: 10000, typeName: "Fascicule" },
  { id: 12, type: "cours", category: "securite", icon: "📖", bg: "bg-secu", catLabel: "cat-lbl-secu", catName: "Sécurité & Défense", title: "Cours PDF — Culture Générale Sécurité", desc: "Cours de culture générale axé sur les thèmes abordés dans les concours de la sécurité.", price: 4000, typeName: "Cours PDF" },
  { id: 13, type: "fascicule", category: "sante", icon: "🤱", bg: "bg-sante", catLabel: "cat-lbl-sante", catName: "Santé & Social", title: "Fascicule — Concours Sage-femme", desc: "Biologie, chimie, sciences naturelles, physique et test psychotechnique pour le concours sage-femme.", price: 12000, typeName: "Fascicule" },
  { id: 14, type: "annale", category: "sante", icon: "📜", bg: "bg-sante", catLabel: "cat-lbl-sante", catName: "Santé & Social", title: "Annales Corrigées — Concours Sage-femme", desc: "5 années d'annales avec corrections détaillées et barèmes officiels.", price: 7000, typeName: "Annale" },
  { id: 15, type: "fascicule", category: "sante", icon: "🏃", bg: "bg-sante", catLabel: "cat-lbl-sante", catName: "Santé & Social", title: "Fascicule — Concours INSEPS", desc: "Sciences de l'éducation physique, biologie humaine, anatomie et culture générale.", price: 10000, typeName: "Fascicule" },
  { id: 16, type: "fascicule", category: "sante", icon: "🩺", bg: "bg-sante", catLabel: "cat-lbl-sante", catName: "Santé & Social", title: "Fascicule — Concours UDES (Santé)", desc: "Sciences fondamentales, biologie et culture sanitaire pour le concours UDES.", price: 9000, typeName: "Fascicule" },
  { id: 17, type: "fascicule", category: "grandes-ecoles", icon: "📐", bg: "bg-ecoles", catLabel: "cat-lbl-ecoles", catName: "Grandes Écoles", title: "Fascicule Concours EPT (Polytechnique Thiès)", desc: "Mathématiques approfondies, physique-chimie et logique scientifique.", price: 15000, typeName: "Fascicule" },
  { id: 18, type: "annale", category: "grandes-ecoles", icon: "📜", bg: "bg-ecoles", catLabel: "cat-lbl-ecoles", catName: "Grandes Écoles", title: "Annales Corrigées EPT — 7 ans", desc: "7 ans de sujets d'épreuves de Polytechnique Thiès entièrement résolus.", price: 9000, typeName: "Annale" },
  { id: 19, type: "fascicule", category: "grandes-ecoles", icon: "⚡", bg: "bg-ecoles", catLabel: "cat-lbl-ecoles", catName: "Grandes Écoles", title: "Fascicule Concours ESP Dakar", desc: "Préparation aux filières d'ingénieur et de technologie de l'École Supérieure Polytechnique.", price: 14000, typeName: "Fascicule" },
  { id: 20, type: "fascicule", category: "enseignement", icon: "📚", bg: "bg-ens", catLabel: "cat-lbl-ens", catName: "Enseignement", title: "Fascicule FASTEF — Spécialité Lettres & Sciences Humaines", desc: "Dissertation pédagogique, linguistique, littérature et épreuves professionnelles.", price: 12000, typeName: "Fascicule" },
  { id: 21, type: "fascicule", category: "enseignement", icon: "🧪", bg: "bg-ens", catLabel: "cat-lbl-ens", catName: "Enseignement", title: "Fascicule FASTEF — Spécialité Sciences (Maths/PC/SVT)", desc: "Épreuves académiques et méthodologie de la leçon d'essai.", price: 12000, typeName: "Fascicule" },
  { id: 22, type: "annale", category: "enseignement", icon: "📜", bg: "bg-ens", catLabel: "cat-lbl-ens", catName: "Enseignement", title: "Annales FASTEF Corrigées — Toutes spécialités", desc: "Annales récentes résolues avec grilles d'évaluation de la commission d'examen.", price: 8000, typeName: "Annale" },
  { id: 23, type: "formation", category: "formation", icon: "🧠", bg: "bg-form", catLabel: "cat-lbl-form", catName: "Formations Informatique", title: "Formation IA Appliquée — Débutant à Expert", desc: "Maîtrisez ChatGPT, Midjourney et l'automatisation IA pour votre carrière.", price: 50000, typeName: "Formation" },
  { id: 24, type: "formation", category: "formation", icon: "💻", bg: "bg-form", catLabel: "cat-lbl-form", catName: "Formations Informatique", title: "Formation Développement Web Modern", desc: "HTML, CSS, JavaScript & React de A à Z. Créez vos propres applications web.", price: 75000, typeName: "Formation" },
  { id: 25, type: "formation", category: "formation", icon: "📊", bg: "bg-form", catLabel: "cat-lbl-form", catName: "Formations Informatique", title: "Formation Bureautique & Excel Avancé", desc: "Tableaux croisés dynamiques, formules complexes, VBA et mise en page professionnelle.", price: 25000, typeName: "Formation" }
];

const saveProducts = () => {
    try {
        localStorage.setItem('sk_products', JSON.stringify(PRODUCTS));
    } catch (e) {}
};

const getProducts = () => {
    try {
        const saved = localStorage.getItem('sk_products');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PRODUCTS;
};

let PRODUCTS = getProducts();

const loadDatabase = async () => {
    try {
        const cloudProds = await loadProductsFromSupabase();
        if (cloudProds && cloudProds.length > 0) {
            PRODUCTS = cloudProds;
            saveProducts();
            if (typeof renderProducts === 'function') renderProducts();
        }
    } catch (e) {
        console.warn("loadDatabase fallback:", e);
    }
};
window.loadDatabase = loadDatabase;

// ==========================================
//  ⚡ MODULE CLOUD SUPABASE (Sync PostgreSQL)
// ==========================================
let supabaseClient = null;

const getSupabaseCredentials = () => {
    return {
        url: localStorage.getItem('sk_supabase_url') || 'https://igqwayiihhinrxhzlqcu.supabase.co',
        key: localStorage.getItem('sk_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlncXdheWlpaGhpbnJ4aHpscWN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MzYzMDMsImV4cCI6MjEwMDUxMjMwM30.N9G0DbgCL6QLkzbbFhuIKJzDAV5j8Mykuq80YmP_OHo'
    };
};

const initSupabase = () => {
    const creds = getSupabaseCredentials();
    if (creds.url && creds.key && typeof supabase !== 'undefined' && supabase.createClient) {
        try {
            supabaseClient = supabase.createClient(creds.url, creds.key);
            return true;
        } catch (e) {
            console.warn("⚠️ Erreur d'initialisation Supabase :", e);
            supabaseClient = null;
            return false;
        }
    }
    supabaseClient = null;
    return false;
};

const testSupabaseConnection = async () => {
    const badge = document.getElementById("supabaseStatusBadge");
    const urlInput = document.getElementById("settingSupabaseUrl");
    const keyInput = document.getElementById("settingSupabaseKey");
    
    const url = urlInput ? urlInput.value.trim() : '';
    const key = keyInput ? keyInput.value.trim() : '';

    if (!url || !key) {
        if (badge) {
            badge.style.display = "block";
            badge.style.background = "#fee2e2";
            badge.style.color = "#dc2626";
            badge.textContent = "❌ Veuillez renseigner l'URL et la clé Anon Supabase.";
        }
        return false;
    }

    if (typeof supabase === 'undefined') {
        if (badge) {
            badge.style.display = "block";
            badge.style.background = "#fee2e2";
            badge.style.color = "#dc2626";
            badge.textContent = "❌ Le SDK Supabase JS n'est pas encore disponible.";
        }
        return false;
    }

    try {
        const client = supabase.createClient(url, key);
        const { data, error } = await client.from('products').select('count', { count: 'exact', head: true });
        if (error) throw error;

        if (badge) {
            badge.style.display = "block";
            badge.style.background = "#dcfce7";
            badge.style.color = "#166534";
            badge.textContent = "✅ Connexion réussie à Supabase PostgreSQL ! Vos tables sont accessibles.";
        }
        return true;
    } catch (err) {
        if (badge) {
            badge.style.display = "block";
            badge.style.background = "#fee2e2";
            badge.style.color = "#dc2626";
            badge.textContent = `❌ Connexion échouée : ${err.message || 'Vérifiez les clés et les règles RLS dans Supabase'}`;
        }
        return false;
    }
};
window.testSupabaseConnection = testSupabaseConnection;

// Synchronisation Produits vers Supabase
const loadProductsFromSupabase = async () => {
    if (!initSupabase() || !supabaseClient) return null;
    try {
        const { data, error } = await supabaseClient.from('products').select('*').order('id', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) {
            return data.map(p => ({
                id: p.id,
                type: p.type,
                category: p.category,
                icon: p.icon,
                bg: p.bg,
                catLabel: p.cat_label,
                catName: p.cat_name,
                title: p.title,
                desc: p.desc_text || p.desc,
                price: p.price,
                typeName: p.type_name
            }));
        }
    } catch (e) {
        console.warn("⚠️ Impossible de lire la base Supabase, basculement en mode local :", e);
    }
    return null;
};

const saveProductsToSupabase = async (productsArray) => {
    if (!initSupabase() || !supabaseClient) return;
    try {
        const rows = productsArray.map(p => ({
            id: p.id,
            type: p.type,
            category: p.category,
            icon: p.icon,
            bg: p.bg,
            cat_label: p.catLabel,
            cat_name: p.catName,
            title: p.title,
            desc_text: p.desc,
            price: p.price,
            type_name: p.typeName
        }));
        await supabaseClient.from('products').upsert(rows);
    } catch (e) {
        console.warn("⚠️ Erreur de sauvegarde Produits dans Supabase :", e);
    }
};

// Synchronisation Utilisateurs vers Supabase
const syncUserToSupabase = async (user) => {
    if (!user || !initSupabase() || !supabaseClient) return;
    try {
        await supabaseClient.from('users').upsert({
            email: user.email,
            password_hash: user.passwordHash || null,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone || null,
            role: user.role || 'user',
            is_subscribed: user.isSubscribed || false,
            subscription_plan: user.subscriptionPlan || null,
            subscription_date: user.subscriptionDate || null,
            purchases: user.purchases || []
        }, { onConflict: 'email' });
    } catch (e) {
        console.warn("⚠️ Erreur de synchronisation Utilisateur Supabase :", e);
    }
};

// Synchronisation Commandes vers Supabase
const saveOrderToSupabase = async (orderObj) => {
    if (!initSupabase() || !supabaseClient) return;
    try {
        await supabaseClient.from('orders').upsert({
            id: orderObj.id,
            date: orderObj.date,
            client: orderObj.client,
            items: orderObj.items,
            total: orderObj.total,
            status: orderObj.status
        });
    } catch (e) {
        console.warn("⚠️ Erreur de sauvegarde Commande Supabase :", e);
    }
};

// Synchronisation Paniers Abandonnés vers Supabase
const saveAbandonedCartToSupabase = async (cartObj) => {
    if (!initSupabase() || !supabaseClient) return;
    try {
        await supabaseClient.from('abandoned_carts').upsert({
            id: cartObj.id,
            date: cartObj.date,
            client: cartObj.client,
            phone: cartObj.phone || null,
            items: cartObj.items,
            total: cartObj.total
        });
    } catch (e) {
        console.warn("⚠️ Erreur de sauvegarde Panier Abandonné Supabase :", e);
    }
};

// Initialize or Load state
let PRODUCTS = [...DEFAULT_PRODUCTS];

const loadDatabase = async () => {
    // 1. Tenter le chargement depuis Supabase Cloud
    const cloudProducts = await loadProductsFromSupabase();
    if (cloudProducts && cloudProducts.length > 0) {
        PRODUCTS = cloudProducts;
        localStorage.setItem('sk_products', JSON.stringify(PRODUCTS));
    } else {
        // 2. Fallback localStorage
        const savedLocal = localStorage.getItem('sk_products');
        if (savedLocal) {
            try {
                PRODUCTS = JSON.parse(savedLocal);
            } catch(e) { PRODUCTS = [...DEFAULT_PRODUCTS]; }
        }

        // 3. Fallback database.json ou DEFAULT_PRODUCTS
        if (!PRODUCTS || PRODUCTS.length === 0) {
            try {
                const res = await fetch('database.json?ts=' + new Date().getTime());
                if (!res.ok) throw new Error("Fichier introuvable");
                PRODUCTS = await res.json();
            } catch (e) {
                PRODUCTS = [...DEFAULT_PRODUCTS];
            }
        }
    }
    
    if (!PRODUCTS || PRODUCTS.length === 0) {
        PRODUCTS = [...DEFAULT_PRODUCTS];
    }

    PRODUCTS.forEach(p => {
        if (!p.image) p.image = CAT_IMAGES[p.category] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop";
    });
    
    renderProducts();
    if (typeof renderAdminProducts === 'function') renderAdminProducts();
};

// Helper to save products and re-render all interfaces
const saveProducts = () => {
    localStorage.setItem('sk_products', JSON.stringify(PRODUCTS));
    saveProductsToSupabase(PRODUCTS);
    renderProducts();
    if (typeof renderAdminProducts === 'function') renderAdminProducts();
};

const exportDatabase = () => {
    const dataStr = JSON.stringify(PRODUCTS, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "database.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("💾", "Fichier database.json prêt au téléchargement !");
};
window.exportDatabase = exportDatabase;

const getFilteredProducts = () => {
    let list = PRODUCTS;
    if (currentFilter !== "all") {
        if (currentFilter === "concours") {
            list = list.filter(p => ["administration", "securite", "douanes", "sante", "grandes-ecoles", "enseignement"].includes(p.category) || ["fascicule", "annale", "cours"].includes(p.type));
        } else if (currentFilter === "douanes" || currentFilter === "douane") {
            list = list.filter(p => p.category === "douanes" || p.category === "douane" || (p.title && p.title.toLowerCase().includes("douane")));
        } else if (currentFilter === "securite") {
            list = list.filter(p => p.category === "securite" || p.category === "douanes" || p.category === "douane");
        } else {
            list = list.filter(p => p.category === currentFilter || p.type === currentFilter);
        }
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(p =>
            p.title.toLowerCase().includes(q) ||
            (p.catName && p.catName.toLowerCase().includes(q)) ||
            (p.desc && p.desc.toLowerCase().includes(q)) ||
            (p.typeName && p.typeName.toLowerCase().includes(q))
        );
    }
    return list;
};

// ==========================================
//  DOCUMENT 10-PAGE PREVIEW ENGINE
// ==========================================
let currentPreviewProduct = null;
let currentPreviewPage = 1;

const openDocumentPreview = (productId) => {
    const prod = PRODUCTS.find(p => p.id == productId);
    if (!prod) return;

    currentPreviewProduct = prod;
    currentPreviewPage = 1;

    const previewOverlay = document.getElementById("previewOverlay");
    const previewModal = document.getElementById("previewModal");
    const previewTitle = document.getElementById("previewTitle");
    const previewCatLabel = document.getElementById("previewCatLabel");
    const previewPriceText = document.getElementById("previewPriceText");

    if (previewTitle) previewTitle.textContent = prod.title;
    if (previewCatLabel) {
        previewCatLabel.textContent = prod.catName || "Concours Sénégal";
        previewCatLabel.className = `product-cat-label ${prod.catLabel || 'cat-lbl-admin'}`;
    }
    if (previewPriceText) previewPriceText.textContent = `Prix : ${formatPrice(prod.price)}`;

    renderPreviewPage();

    if (previewOverlay && previewModal) {
        previewOverlay.classList.add("show");
        previewModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
};

const closeDocumentPreview = () => {
    const previewOverlay = document.getElementById("previewOverlay");
    const previewModal = document.getElementById("previewModal");
    if (previewOverlay && previewModal) {
        previewOverlay.classList.remove("show");
        previewModal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

const renderPreviewPage = () => {
    if (!currentPreviewProduct) return;
    const prod = currentPreviewProduct;
    const pageCounter = document.getElementById("pageCounter");
    const previewDocBody = document.getElementById("previewDocBody");

    if (pageCounter) pageCounter.textContent = `Page ${currentPreviewPage} sur 10`;

    let pageHtml = "";
    const title = prod.title || "Document d'Étude";

    switch(currentPreviewPage) {
        case 1:
            pageHtml = `
                <div style="text-align:center; padding:1.5rem 1rem; border:2px dashed var(--blue-accent); border-radius:10px; background:#f8fafc;">
                    <div style="font-size:3rem; margin-bottom:0.75rem;">🎓</div>
                    <h2 style="font-size:1.3rem; color:var(--blue-deep); margin-bottom:0.5rem;">${title}</h2>
                    <p style="font-weight:600; color:var(--orange-dark); font-size:1rem; margin-bottom:0.75rem;">Fascicule Numérique &amp; Annales Officiel 🇸🇳</p>
                    <div style="display:inline-block; background:var(--blue-deep); color:white; padding:0.35rem 0.9rem; border-radius:20px; font-size:0.8rem; font-weight:600;">ÉDITION SK ACADEMIA 2026</div>
                </div>
            `;
            break;
        case 2:
            pageHtml = `
                <h4 style="color:var(--blue-deep); border-bottom:2px solid var(--blue-accent); padding-bottom:0.3rem; margin-bottom:0.75rem;">TABLE DES MATIÈRES — EXTRAIT DE DÉMONSTRATION</h4>
                <ul style="display:flex; flex-direction:column; gap:0.5rem; list-style:none; padding:0; font-size:0.85rem;">
                    <li style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:0.25rem;"><span><strong>Chapitre I</strong> : Méthodologie &amp; Conseils des Examinateurs</span> <span>Page 3</span></li>
                    <li style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:0.25rem;"><span><strong>Chapitre II</strong> : Synthèse du Cadre Réglementaire &amp; Culture Générale</span> <span>Page 5</span></li>
                    <li style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:0.25rem;"><span><strong>Chapitre III</strong> : Sujets d'Examens &amp; QCM Corrigés</span> <span>Page 7</span></li>
                    <li style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--border); padding-bottom:0.25rem;"><span><strong>Chapitre IV</strong> : Exercices d'Entraînement Intensif</span> <span>Page 9</span></li>
                </ul>
            `;
            break;
        case 3:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">CHAPITRE I : Méthodologie &amp; Préparation</h4>
                <p style="margin-bottom:0.75rem;">L'épreuve écrite du concours <strong>${title}</strong> nécessite une maîtrise parfaite de la structure et du vocabulaire professionnel.</p>
                <div style="background:#f1f5f9; padding:0.75rem; border-left:4px solid var(--blue-accent); border-radius:4px; font-size:0.85rem;">
                    <strong>💡 Recommandation de la Commission :</strong> Lisez l'intégralité du sujet avant de commencer la rédaction et soulignez les mots-clés directeurs.
                </div>
            `;
            break;
        case 4:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">1.2 Gestion du Temps &amp; Organisation</h4>
                <p style="margin-bottom:0.5rem;">Pour réussir le concours dans les temps impartis :</p>
                <ul style="padding-left:1.2rem; font-size:0.85rem; display:flex; flex-direction:column; gap:0.3rem;">
                    <li>15 minutes : Analyse du sujet et élaboration du plan détaillé.</li>
                    <li>2 heures : Remplissage et développement des arguments.</li>
                    <li>15 minutes : Relecture attentive des accords et de la ponctuation.</li>
                </ul>
            `;
            break;
        case 5:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">CHAPITRE II : Notions Clés à Retenir</h4>
                <p style="margin-bottom:0.5rem;">Fiche récapitulative des concepts indispensables pour la note de synthèse et les questions à réponse courte.</p>
                <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:0.75rem; border-radius:6px; font-size:0.85rem; color:#065f46;">
                    ✅ <strong>Rappel Important :</strong> La clarté de l'expression et la précision des exemples sont évaluées par un barème spécifique de 5 points sur 20.
                </div>
            `;
            break;
        case 6:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">Fiche Technique N°2</h4>
                <p style="margin-bottom:0.5rem;">Synthèse des textes de référence et actualités des réformes institutionnelles et académiques au Sénégal.</p>
            `;
            break;
        case 7:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">CHAPITRE III : Sujet Type Concours</h4>
                <div style="padding:0.75rem; background:#f8fafc; border:1px solid var(--border); border-radius:6px; font-size:0.85rem;">
                    <em>« En quoi la maîtrise des connaissances fondamentales et la rigueur d'analyse garantissent-elles la réussite aux concours ? »</em>
                </div>
            `;
            break;
        case 8:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">Série de QCM d'Auto-Évaluation :</h4>
                <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.85rem;">
                    <div style="padding:0.5rem; border:1px solid var(--border); border-radius:4px;">Q1 : Quelle est la règle principale d'une bonne conclusion ?</div>
                    <div style="padding:0.5rem; border:1px solid var(--border); border-radius:4px;">Q2 : Comment structurer l'ouverture dans un sujet de concours ?</div>
                </div>
            `;
            break;
        case 9:
            pageHtml = `
                <h4 style="color:var(--blue-deep); margin-bottom:0.5rem;">CHAPITRE IV : Corrigé Indicatif</h4>
                <p style="font-size:0.85rem; color:var(--text-dark);">Aperçu de la grille de correction et des critères d'attribution des mentions d'excellence par le jury.</p>
            `;
            break;
        case 10:
            pageHtml = `
                <div style="text-align:center; padding:1.25rem 0.5rem;">
                    <div style="font-size:2.2rem; margin-bottom:0.4rem;">🔒</div>
                    <h3 style="color:var(--orange-dark); margin-bottom:0.4rem;">Fin de l'Extrait Gratuit (Page 10 sur 10)</h3>
                    <p style="margin-bottom:0.75rem; font-size:0.85rem;">Vous avez consulté les 10 premières pages gratuites de ce document.</p>
                    <div style="background:#f1f5f9; padding:0.75rem; border-radius:6px; margin-bottom:0.75rem; border:1px dashed var(--blue-accent);">
                        <strong style="color:var(--blue-deep); font-size:0.9rem;">Débloquez la totalité du document en effectuant votre achat dès maintenant !</strong>
                    </div>
                </div>
            `;
            break;
    }

    pageHtml += `
        <div style="margin-top:1rem; text-align:center; font-size:0.75rem; color:var(--text-muted); border-top:1px solid var(--border); padding-top:0.4rem;">
            📄 SK ACADEMIA — Aperçu Gratuit 10 Pages (Tous droits réservés)
        </div>
    `;

    if (previewDocBody) previewDocBody.innerHTML = pageHtml;

    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    if (prevBtn) prevBtn.disabled = (currentPreviewPage === 1);
    if (nextBtn) nextBtn.disabled = (currentPreviewPage === 10);
};

window.openDocumentPreview = openDocumentPreview;
window.closeDocumentPreview = closeDocumentPreview;

// Attach preview modal event listeners
document.addEventListener("DOMContentLoaded", () => {
    const prevBtn = document.getElementById("prevPageBtn");
    const nextBtn = document.getElementById("nextPageBtn");
    const previewClose = document.getElementById("previewClose");
    const previewOverlay = document.getElementById("previewOverlay");
    const previewBuyBtn = document.getElementById("previewBuyBtn");

    if (prevBtn) prevBtn.addEventListener("click", () => {
        if (currentPreviewPage > 1) {
            currentPreviewPage--;
            renderPreviewPage();
        }
    });
    if (nextBtn) nextBtn.addEventListener("click", () => {
        if (currentPreviewPage < 10) {
            currentPreviewPage++;
            renderPreviewPage();
        }
    });
    if (previewClose) previewClose.addEventListener("click", closeDocumentPreview);
    if (previewOverlay) previewOverlay.addEventListener("click", closeDocumentPreview);
    if (previewBuyBtn) previewBuyBtn.addEventListener("click", () => {
        if (currentPreviewProduct) {
            addToCart(currentPreviewProduct.id);
            closeDocumentPreview();
        }
    });
});

const renderProducts = () => {
    const list = getFilteredProducts();
    noResults.classList.add("hidden");

    if (list.length === 0) {
        productsGrid.innerHTML = "";
        noResults.classList.remove("hidden");
        return;
    }

    productsGrid.innerHTML = list.map(p => {
        const bgStyle = p.image ? `style="background-image: url('${p.image}'); background-size: cover; background-position: center;"` : "";
        const iconHtml = p.image ? "" : `<span class="product-thumb-icon">${p.icon}</span>`;
        return `
        <div class="product-card" data-id="${p.id}">
            <div class="product-thumb ${p.bg}" ${bgStyle}>
                <div class="product-type-badge">${p.typeName}</div>
                ${iconHtml}
            </div>
            <div class="product-body">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.25rem;">
                    <span class="product-cat-label ${p.catLabel}">${p.catName}</span>
                    <span class="badge-official"><span class="badge-official-pulse"></span> Conforme 2026 🇸🇳</span>
                </div>
                <h3 class="product-title" style="margin-top:0.35rem;">${p.title}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-footer" style="display:flex; flex-direction:column; gap:0.5rem;">
                    <span class="product-price">${formatPrice(p.price)}</span>
                    <div style="display:flex; gap:0.35rem; width:100%;">
                        <button class="btn-secondary btn-sm" onclick="openDocumentPreview('${p.id}')" style="flex:1; padding:0.45rem 0.4rem; font-size:0.75rem; font-weight:600; white-space:nowrap;">👁️ Aperçu (10 p.)</button>
                        <button class="btn-add" data-id="${p.id}" style="flex:1.2; padding:0.45rem 0.5rem; font-size:0.75rem; font-weight:600;">🛒 Acheter</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join("");

    productsGrid.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => addToCart(parseInt(btn.getAttribute("data-id"))));
    });
};

// ==================
//  FILTERS
// ==================
document.querySelectorAll(".filter-pill").forEach(pill => {
    pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        currentFilter = pill.getAttribute("data-filter");
        renderProducts();
        
        // Ensure boutique is visible if they click from hero buttons
        const boutiqueSec = document.getElementById("boutique");
        if (boutiqueSec.classList.contains("hidden-section")) {
            history.pushState(null, null, "#boutique");
            navigateTo("#boutique");
        } else {
            boutiqueSec.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Category buttons → filter catalogue
document.querySelectorAll(".cat-btn, .cat-btn-card, [data-filter]").forEach(el => {
    el.addEventListener("click", (e) => {
        e.preventDefault();
        const filter = el.getAttribute("data-filter");
        if (!filter) return;

        // Handle "all-concours" special case — show all concours categories
        if (filter === "all-concours") {
            currentFilter = "all";
        } else {
            currentFilter = filter;
        }

        searchQuery = "";

        document.querySelectorAll(".filter-pill").forEach(p => {
            p.classList.toggle("active", p.getAttribute("data-filter") === currentFilter);
        });
        renderProducts();
        
        // Ensure boutique is visible if they click from hero buttons
        const boutiqueSec = document.getElementById("boutique");
        if (boutiqueSec.classList.contains("hidden-section")) {
            history.pushState(null, null, "#boutique");
            navigateTo("#boutique");
        } else {
            boutiqueSec.scrollIntoView({ behavior: "smooth" });
        }
    });
});

// Concours "Accéder" buttons -> Navigate to Course Player if logged in
document.querySelectorAll(".btn-concours-access").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (user) {
            history.pushState(null, null, "#course");
            navigateTo("#course");
        } else {
            // It's covered by locked-overlay mostly, but just in case
            openAuthModal("login");
        }
    });
});

// ==================
//  RENDER FORMATIONS
// ==================
const renderFormations = () => {
    formationsGrid.innerHTML = FORMATIONS.map(f => `
        <div class="formation-card reveal">
            <div class="form-icon">${f.icon}</div>
            <div class="form-level">${f.level}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
            <div class="form-meta">
                <span class="form-price">${formatPrice(f.price)}</span>
                <button class="btn-form">S'inscrire →</button>
            </div>
        </div>
    `).join("");
};

// ==================
//  RENDER DOCUMENTS
// ==================
const renderDocuments = () => {
    documentsGrid.innerHTML = DOCUMENTS.map(d => `
        <div class="doc-item reveal">
            <div class="doc-icon">📄</div>
            <div class="doc-info">
                <h4>${d.title}</h4>
                <span>${d.sub}</span>
            </div>
            <span class="doc-size">${d.size}</span>
        </div>
    `).join("");
};

// ==================
//  SCROLL REVEAL
// ==================
const setupScrollReveal = () => {
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => observer.observe(el));
};

// ==================================
//  AUTHENTICATION SYSTEM
// ==================================

// Get users from localStorage (SECURED — passwords are hashed)
const getUsers = () => {
    try {
        let savedUsers = JSON.parse(localStorage.getItem("sk_academia_users"));
        if (!savedUsers) savedUsers = [];
        return savedUsers;
    } catch { return []; }
};

// Initialize admin user with hashed password (called at startup)
const initAdminUser = async () => {
    let savedUsers = getUsers();
    let adminUser = savedUsers.find(u => u.email.toLowerCase() === 'admin@skacademia.sn');
    const adminHash = await getAdminHash();

    if (!adminUser) {
        adminUser = {
            id: 1,
            firstName: "Super",
            lastName: "Admin",
            email: "admin@skacademia.sn",
            phone: "+221765749343",
            passwordHash: adminHash,
            createdAt: new Date().toISOString()
        };
        savedUsers.push(adminUser);
        localStorage.setItem("sk_academia_users", JSON.stringify(savedUsers));
    } else if (!adminUser.passwordHash) {
        // Migrate from plaintext to hash
        adminUser.passwordHash = adminHash;
        delete adminUser.password; // Remove plaintext password
        localStorage.setItem("sk_academia_users", JSON.stringify(savedUsers));
    }
};

// Run admin init at startup
initAdminUser();

// Save users to localStorage
const saveUsers = (users) => {
    localStorage.setItem("sk_academia_users", JSON.stringify(users));
};

// Get current logged-in user
const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem("sk_academia_current_user"));
    } catch { return null; }
};

// Save current session
const setCurrentUser = (user) => {
    localStorage.setItem("sk_academia_current_user", JSON.stringify(user));
};

// Clear session
const clearCurrentUser = () => {
    localStorage.removeItem("sk_academia_current_user");
};

// Get user initials
const getInitials = (firstName, lastName) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
};

// Open auth modal
const openAuthModal = (tab = "login") => {
    authOverlay.classList.add("show");
    authModal.classList.add("show");
    document.body.style.overflow = "hidden";
    if (tab === "register") {
        switchTab("register");
    } else {
        switchTab("login");
    }
};
// Expose globally for onclick handlers in HTML
window.openAuthModal = openAuthModal;

// Close auth modal
const closeAuthModal = () => {
    authOverlay.classList.remove("show");
    authModal.classList.remove("show");
    document.body.style.overflow = "";
    // Reset errors
    loginError.classList.add("hidden");
    registerError.classList.add("hidden");
};

authClose.addEventListener("click", closeAuthModal);
authOverlay.addEventListener("click", closeAuthModal);

// Switch tab (login <-> register)
const switchTab = (tab) => {
    if (tab === "register") {
        tabLogin.classList.remove("active");
        tabRegister.classList.add("active");
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
        authFooterText.innerHTML = 'Déjà un compte ? <a href="#" id="switchToLogin" class="auth-link">Connectez-vous</a>';
        document.getElementById("switchToLogin").addEventListener("click", (e) => { e.preventDefault(); switchTab("login"); });
    } else {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        authFooterText.innerHTML = 'Pas encore de compte ? <a href="#" id="switchToRegisterLink" class="auth-link">Inscrivez-vous</a>';
        document.getElementById("switchToRegisterLink").addEventListener("click", (e) => { e.preventDefault(); switchTab("register"); });
    }
    loginError.classList.add("hidden");
    registerError.classList.add("hidden");
};

// ==========================================
//  OTP EMAIL VERIFICATION & STUDENT DASHBOARD ENGINE
// ==========================================
let OTP_STATE = null;
let otpExpiryInterval = null;
let otpResendInterval = null;

const startOtpTimers = () => {
    clearInterval(otpExpiryInterval);
    clearInterval(otpResendInterval);

    // 10-Minute Expiration Timer
    const timerDisplay = document.getElementById("otpTimerDisplay");
    otpExpiryInterval = setInterval(() => {
        if (!OTP_STATE || !OTP_STATE.expiresAt) {
            clearInterval(otpExpiryInterval);
            return;
        }
        const remainingMs = OTP_STATE.expiresAt - Date.now();
        if (remainingMs <= 0) {
            clearInterval(otpExpiryInterval);
            if (timerDisplay) timerDisplay.textContent = "Expiré (00:00)";
            showAuthError(document.getElementById("otpError"), "⏰ Le code de vérification a expiré (limite 10 min). Veuillez cliquer sur Renvoyer le code.");
            return;
        }
        const totalSec = Math.floor(remainingMs / 1000);
        const mins = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const secs = (totalSec % 60).toString().padStart(2, '0');
        if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    }, 1000);

    // 60-Second Resend Cooldown Timer
    const resendBtn = document.getElementById("btnResendOtp");
    const resendCountdown = document.getElementById("resendCountdown");
    if (resendBtn) resendBtn.disabled = true;

    otpResendInterval = setInterval(() => {
        if (!OTP_STATE || !OTP_STATE.resendAllowedAt) {
            clearInterval(otpResendInterval);
            return;
        }
        const remainingSec = Math.ceil((OTP_STATE.resendAllowedAt - Date.now()) / 1000);
        if (remainingSec <= 0) {
            clearInterval(otpResendInterval);
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.innerHTML = "🔄 Renvoyer le code";
            }
            return;
        }
        if (resendCountdown) resendCountdown.textContent = remainingSec;
    }, 1000);
};

// Auto-focus OTP inputs handling
document.addEventListener("DOMContentLoaded", () => {
    const boxes = document.querySelectorAll(".otp-box");
    boxes.forEach((box, idx) => {
        box.addEventListener("input", (e) => {
            const val = e.target.value;
            if (val) {
                box.classList.add("filled");
                if (idx < boxes.length - 1) {
                    boxes[idx + 1].focus();
                }
            } else {
                box.classList.remove("filled");
            }
        });

        box.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && !box.value && idx > 0) {
                boxes[idx - 1].focus();
            }
        });
    });

    // Resend OTP Button Handler
    const btnResend = document.getElementById("btnResendOtp");
    if (btnResend) {
        btnResend.addEventListener("click", () => {
            if (!OTP_STATE || !OTP_STATE.pendingUser) return;
            
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            OTP_STATE.code = newCode;
            OTP_STATE.expiresAt = Date.now() + 10 * 60 * 1000;
            OTP_STATE.resendAllowedAt = Date.now() + 60 * 1000;
            OTP_STATE.attempts = 0;

            startOtpTimers();
            showToast("📩", `Nouveau code envoyé ! (Code de démo : ${newCode})`, 8000);
        });
    }

    // OTP Form Verification Submission
    const otpForm = document.getElementById("otpForm");
    const otpError = document.getElementById("otpError");

    if (otpForm) {
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (otpError) otpError.classList.add("hidden");

            if (!OTP_STATE || !OTP_STATE.pendingUser) {
                showAuthError(otpError, "Session d'inscription expirée. Veuillez recommencer.");
                return;
            }

            // Check 5-attempt locking
            if (OTP_STATE.attempts >= 5) {
                showAuthError(otpError, "🔒 Trop de tentatives échouées (5 max). Réessayez dans 15 minutes.");
                return;
            }

            // Check Expiration
            if (Date.now() > OTP_STATE.expiresAt) {
                showAuthError(otpError, "⏰ Le code a expiré. Veuillez cliquer sur 'Renvoyer le code'.");
                return;
            }

            // Collect entered 6-digit code
            const enteredCode = Array.from(document.querySelectorAll(".otp-box")).map(b => b.value).join("");
            if (enteredCode.length !== 6) {
                showAuthError(otpError, "Veuillez saisir les 6 chiffres du code.");
                return;
            }

            // Verify Code
            if (enteredCode !== OTP_STATE.code) {
                OTP_STATE.attempts++;
                const remaining = 5 - OTP_STATE.attempts;
                if (remaining <= 0) {
                    showAuthError(otpError, "🔒 Trop de tentatives échouées. Compte verrouillé pendant 15 minutes.");
                } else {
                    showAuthError(otpError, `Code incorrect. Veuillez réessayer. (${remaining} essais restants)`);
                }
                return;
            }

            // SUCCESS! Activate User Account
            const users = getUsers();
            const activatedUser = {
                ...OTP_STATE.pendingUser,
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                purchases: [],
                courses: []
            };

            users.push(activatedUser);
            saveUsers(users);
            syncUserToSupabase(activatedUser);

            // SECURITY CLEANUP: Wipe OTP Code immediately from memory
            OTP_STATE.code = null;
            delete OTP_STATE.code;
            OTP_STATE = null;

            clearInterval(otpExpiryInterval);
            clearInterval(otpResendInterval);

            // Log User In and Redirect to Dashboard
            setCurrentUser(activatedUser);
            updateLastActivity();
            closeAuthModal();
            updateAuthUI();
            updateGatedSections();

            history.pushState(null, null, "#dashboard");
            navigateTo("#dashboard");
            renderStudentDashboard();

            showToast("🎉", `Félicitations ${activatedUser.firstName} ! Votre compte est activé avec succès.`);
        });
    }

    // Student Dashboard Forms (Profile & Password Updates)
    const profileForm = document.getElementById("studentProfileForm");
    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            if (!user) return;

            user.firstName = sanitizeHTML(document.getElementById("profFirstName").value.trim());
            user.lastName = sanitizeHTML(document.getElementById("profLastName").value.trim());
            user.phone = sanitizeHTML(document.getElementById("profPhone").value.trim());

            setCurrentUser(user);
            const users = getUsers();
            const idx = users.findIndex(u => u.email === user.email);
            if (idx > -1) {
                users[idx] = user;
                saveUsers(users);
                syncUserToSupabase(user);
            }

            updateAuthUI();
            renderStudentDashboard();
            showToast("✅", "Informations de profil mises à jour avec succès !");
        });
    }

    const passwordForm = document.getElementById("studentPasswordForm");
    if (passwordForm) {
        passwordForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const user = getCurrentUser();
            if (!user) return;

            const oldPass = document.getElementById("oldPassword").value;
            const newPass = document.getElementById("newPassword").value;
            const confirmPass = document.getElementById("confirmNewPassword").value;

            const oldHash = await hashPassword(oldPass);
            if (oldHash !== user.passwordHash) {
                showToast("❌", "L'ancien mot de passe est incorrect.");
                return;
            }
            if (newPass.length < 6) {
                showToast("❌", "Le nouveau mot de passe doit faire au moins 6 caractères.");
                return;
            }
            if (newPass !== confirmPass) {
                showToast("❌", "Les nouveaux mots de passe ne correspondent pas.");
                return;
            }

            user.passwordHash = await hashPassword(newPass);
            setCurrentUser(user);
            const users = getUsers();
            const idx = users.findIndex(u => u.email === user.email);
            if (idx > -1) {
                users[idx] = user;
                saveUsers(users);
                syncUserToSupabase(user);
            }

            passwordForm.reset();
            showToast("🔒", "Votre mot de passe a été modifié avec succès !");
        });
    }
});

// Student Dashboard Tab Switching
window.switchStudentTab = (tabId) => {
    document.querySelectorAll('#dashboard .dash-tab').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('#dashboard .dash-nav-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`studentTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (targetTab) targetTab.classList.remove('hidden');

    const btn = document.querySelector(`#dashboard .dash-nav-btn[onclick="switchStudentTab('${tabId}')"]`);
    if (btn) btn.classList.add('active');

    renderStudentDashboard();
};

const renderStudentDashboard = () => {
    const user = getCurrentUser();
    if (!user) return;

    // Header & Avatar
    const avatarEl = document.getElementById("dashAvatar");
    const nameEl = document.getElementById("dashName");
    const welcomeTitle = document.getElementById("dashWelcomeTitle");
    const statusBadge = document.getElementById("dashUserStatusBadge");

    const initials = getInitials(user.firstName, user.lastName);
    if (avatarEl) avatarEl.textContent = initials;
    if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
    if (welcomeTitle) welcomeTitle.textContent = `👋 Bienvenue sur votre Espace Étudiant, ${user.firstName} !`;
    if (statusBadge) statusBadge.textContent = user.isSubscribed ? "⭐ Compte Premium" : "✔️ Compte Vérifié";

    // Overview Stats
    const docsCountEl = document.getElementById("studentDocsCount");
    const coursesCountEl = document.getElementById("studentCoursesCount");
    const userPurchases = user.purchases || [];

    if (docsCountEl) docsCountEl.textContent = userPurchases.length;
    if (coursesCountEl) coursesCountEl.textContent = user.isSubscribed ? "4 Formations" : "0";

    // Purchases Tab Grid
    const purchasesGrid = document.getElementById("studentPurchasesContainer");
    if (purchasesGrid) {
        if (userPurchases.length === 0) {
            purchasesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 12px; border: 1px solid var(--border);">
                    <div style="font-size: 3rem; color: var(--text-muted); margin-bottom: 0.75rem;"><i class="fa-solid fa-file-circle-xmark"></i></div>
                    <strong style="font-size: 1.1rem; color: var(--blue-deep); display: block; margin-bottom: 0.25rem;">Vous n'avez encore acheté aucun fascicule</strong>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Explorez notre catalogue de concours pour commander vos annales et cours PDF.</p>
                    <a href="#boutique" class="btn-primary">📖 Accéder à la Boutique →</a>
                </div>`;
        } else {
            purchasesGrid.innerHTML = userPurchases.map(p => `
                <div style="background: white; border-radius: 12px; border: 1px solid var(--border); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                            <span class="product-cat-label cat-lbl-admin" style="font-size:0.75rem;">Fascicule PDF</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">Acheté le ${p.date || '01/08/2026'}</span>
                        </div>
                        <h4 style="font-size:1rem; color:var(--blue-deep); margin-bottom:0.5rem;">${sanitizeHTML(p.title || 'Document Concours')}</h4>
                    </div>
                    <button class="btn-primary btn-sm" onclick="showToast('📥', 'Téléchargement du PDF sécurisé en cours...')" style="margin-top:1rem; width:100%;">
                        <i class="fa-solid fa-download"></i> Télécharger PDF
                    </button>
                </div>
            `).join("");
        }
    }

    // Courses Tab Grid
    const coursesGrid = document.getElementById("studentCoursesContainer");
    if (coursesGrid) {
        if (!user.isSubscribed) {
            coursesGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: white; border-radius: 12px; border: 1px solid var(--border);">
                    <div style="font-size: 3rem; color: var(--text-muted); margin-bottom: 0.75rem;"><i class="fa-solid fa-graduation-cap"></i></div>
                    <strong style="font-size: 1.1rem; color: var(--blue-deep); display: block; margin-bottom: 0.25rem;">Aucune formation vidéo débloquée</strong>
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">Souscrivez à un pass formation pour accéder aux cours visio et exercices pratiques.</p>
                    <a href="#formations" class="btn-primary">🎓 Découvrir les Formations →</a>
                </div>`;
        } else {
            coursesGrid.innerHTML = FORMATIONS.map((f, i) => `
                <div style="background: white; border-radius: 12px; border: 1px solid var(--border); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">${f.icon}</span>
                        <h4 style="font-size:1.05rem; color:var(--blue-deep); margin-bottom:0.3rem;">${f.title}</h4>
                        <p style="font-size:0.82rem; color:var(--text-muted); margin-bottom:0.75rem;">${f.desc}</p>
                        <div style="margin-bottom:0.75rem;">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">
                                <span>Progression</span>
                                <span>${(i + 1) * 25}%</span>
                            </div>
                            <div style="height:6px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                                <div style="height:100%; width:${(i + 1) * 25}%; background:var(--orange-dark);"></div>
                            </div>
                        </div>
                    </div>
                    <button class="btn-primary btn-sm" onclick="navigateTo('#course')" style="width:100%;">
                        <i class="fa-solid fa-play"></i> Continuer la Formation
                    </button>
                </div>
            `).join("");
        }
    }

    // Profile Inputs Populate
    const profFirst = document.getElementById("profFirstName");
    const profLast = document.getElementById("profLastName");
    const profEmail = document.getElementById("profEmail");
    const profPhone = document.getElementById("profPhone");

    if (profFirst) profFirst.value = user.firstName || '';
    if (profLast) profLast.value = user.lastName || '';
    if (profEmail) profEmail.value = user.email || '';
    if (profPhone) profPhone.value = user.phone || '';
};

const confirmDeleteAccount = () => {
    if (confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement votre compte SK ACADEMIA ? Cette action est irréversible.")) {
        const user = getCurrentUser();
        if (user) {
            let users = getUsers();
            users = users.filter(u => u.email !== user.email);
            saveUsers(users);
            clearCurrentUser();
            location.reload();
        }
    }
};

window.switchStudentTab = switchStudentTab;
window.confirmDeleteAccount = confirmDeleteAccount;

tabLogin.addEventListener("click", () => switchTab("login"));
tabRegister.addEventListener("click", () => switchTab("register"));
switchToRegister.addEventListener("click", (e) => { e.preventDefault(); switchTab("register"); });

// Toggle password visibility
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🙈";
        } else {
            input.type = "password";
            btn.textContent = "👁️";
        }
    });
});

// Show error
const showAuthError = (element, message) => {
    element.textContent = message;
    element.classList.remove("hidden");
};

// REGISTER
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    registerError.classList.add("hidden");

    const firstName = sanitizeHTML(document.getElementById("regFirstName").value.trim());
    const lastName = sanitizeHTML(document.getElementById("regLastName").value.trim());
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = sanitizeHTML(document.getElementById("regPhone").value.trim());
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const acceptTerms = document.getElementById("acceptTerms").checked;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        showAuthError(registerError, "Veuillez remplir tous les champs obligatoires.");
        return;
    }
    if (!isValidEmail(email)) {
        showAuthError(registerError, "Veuillez entrer une adresse e-mail valide.");
        return;
    }
    if (!isStrongPassword(password)) {
        showAuthError(registerError, "Le mot de passe doit contenir au moins 6 caractères, 1 majuscule et 1 chiffre.");
        return;
    }
    if (password !== confirmPassword) {
        showAuthError(registerError, "Les mots de passe ne correspondent pas.");
        return;
    }
    if (!acceptTerms) {
        showAuthError(registerError, "Veuillez accepter les conditions d'utilisation.");
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        showAuthError(registerError, "Un compte existe déjà avec cet e-mail.");
        return;
    }

    // Hash password before storing (SECURITY: never store plaintext)
    const passwordHash = await hashPassword(password);

    // Prepare pending registration state
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    OTP_STATE = {
        pendingUser: {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            passwordHash,
            createdAt: new Date().toISOString(),
            isVerified: false
        },
        code: otpCode,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
        attempts: 0,
        resendAllowedAt: Date.now() + 60 * 1000 // 60s
    };

    // Trigger Supabase Auth OTP if connected
    if (typeof initSupabase === 'function' && initSupabase() && supabaseClient) {
        try {
            await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { first_name: firstName, last_name: lastName, phone } }
            });
        } catch(e) { console.warn("Supabase Auth OTP fallback:", e); }
    }

    // Switch Modal View to OTP Verification Form
    const registerForm = document.getElementById("registerForm");
    const otpForm = document.getElementById("otpForm");
    const authTabs = document.querySelector(".auth-tabs");

    if (authTabs) authTabs.style.display = "none";
    if (registerForm) registerForm.classList.add("hidden");
    if (otpForm) otpForm.classList.remove("hidden");

    // Display masked email notice
    const notice = document.getElementById("otpEmailNotice");
    if (notice) notice.innerHTML = `Un code de sécurité à 6 chiffres a été envoyé à <strong>${maskEmail(email)}</strong>`;

    // Reset OTP boxes
    document.querySelectorAll(".otp-box").forEach((box, i) => {
        box.value = "";
        box.classList.remove("filled");
        if (i === 0) setTimeout(() => box.focus(), 100);
    });

    startOtpTimers();
    showToast("📩", `Code de vérification envoyé à ${maskEmail(email)}. (Code de démo : ${otpCode})`, 8000);
});

// LOGIN (SECURED: hash comparison + rate limiting)
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");

    // Check rate limiting
    const lockSeconds = isLoginLocked();
    if (lockSeconds > 0) {
        showAuthError(loginError, `⏳ Trop de tentatives échouées. Réessayez dans ${lockSeconds} secondes.`);
        return;
    }

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showAuthError(loginError, "Veuillez remplir tous les champs.");
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        const locked = recordFailedLogin();
        if (locked) {
            showAuthError(loginError, "🔒 Compte verrouillé pendant 2 minutes suite à trop de tentatives.");
        } else {
            showAuthError(loginError, `E-mail ou mot de passe incorrect. (${RATE_LIMIT.maxAttempts - RATE_LIMIT.attempts} essais restants)`);
        }
        return;
    }

    // Compare hashed passwords
    const inputHash = await hashPassword(password);
    const storedHash = user.passwordHash || null;
    const storedPlaintext = user.password || null;

    // Support both hashed and legacy plaintext (migration)
    let isMatch = false;
    if (storedHash) {
        isMatch = (inputHash === storedHash);
    } else if (storedPlaintext) {
        // Legacy plaintext comparison + auto-migrate to hash
        isMatch = (password === storedPlaintext);
        if (isMatch) {
            user.passwordHash = inputHash;
            delete user.password;
            saveUsers(users);
        }
    }

    if (!isMatch) {
        const locked = recordFailedLogin();
        if (locked) {
            showAuthError(loginError, "🔒 Compte verrouillé pendant 2 minutes suite à trop de tentatives.");
        } else {
            showAuthError(loginError, `E-mail ou mot de passe incorrect. (${RATE_LIMIT.maxAttempts - RATE_LIMIT.attempts} essais restants)`);
        }
        return;
    }

    // Success
    resetLoginAttempts();
    setCurrentUser(user);
    updateLastActivity();
    closeAuthModal();
    loginForm.reset();
    updateAuthUI();
    updateGatedSections();
    showToast("👋", `Bon retour, ${sanitizeHTML(user.firstName)} !`);
});

// LOGOUT
btnLogout.addEventListener("click", () => {
    const user = getCurrentUser();
    clearCurrentUser();
    updateAuthUI();
    updateGatedSections();
    showToast("👋", `À bientôt${user ? ', ' + user.firstName : ''} !`);
});

// Update navbar UI based on auth state
const updateAuthUI = () => {
    const user = getCurrentUser();
    
    if (user) {
        // Logged in
        btnLoginNav.style.display = "none";
        userProfileNav.classList.remove("hidden");
        
        let initials = getInitials(user.firstName, user.lastName);
        userAvatar.textContent = initials;
        userAvatarLg.textContent = initials;
        userNameNav.textContent = user.firstName;
        userFullName.textContent = `${user.firstName} ${user.lastName}`;
        userEmailDisplay.textContent = user.email;
        
        // Add Dashboard redirect to the dropdown if not already added
        const userDropdown = document.getElementById("userDropdown");
        let btnDash = document.getElementById("btnGoDashboard");

        const isAdmin = user.email.toLowerCase() === 'admin@skacademia.sn';

        if (!btnDash) {
            // Insert it right after the header
            btnDash = document.createElement("button");
            btnDash.className = "user-dropdown-item";
            btnDash.id = "btnGoDashboard";
            const header = userDropdown.querySelector(".user-dropdown-header");
            header.insertAdjacentElement("afterend", btnDash);
        }

        // Update button text and target based on role
        if (isAdmin) {
            btnDash.innerHTML = "⚙️ Espace Administration";
            btnDash.onclick = () => {
                history.pushState(null, null, "#admin");
                navigateTo("#admin");
                userDropdown.classList.remove("show");
            };
        } else {
            btnDash.innerHTML = "📊 Mon Dashboard (Espace Membre)";
            btnDash.onclick = () => {
                history.pushState(null, null, "#dashboard");
                navigateTo("#dashboard");
                userDropdown.classList.remove("show");
            };
        }
    } else {
        // Not logged in
        btnLoginNav.style.display = "";
        userProfileNav.classList.add("hidden");
    }
};

// User Profile Avatar dropdown toggle listener
const userAvatarBtn = document.getElementById("userAvatarBtn");
const userDropdown = document.getElementById("userDropdown");
if (userAvatarBtn && userDropdown) {
    userAvatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });
    document.addEventListener("click", (e) => {
        if (!userDropdown.contains(e.target) && !userAvatarBtn.contains(e.target)) {
            userDropdown.classList.remove("show");
        }
    });
}

// Search input handlers
const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim();
        if (searchClearBtn) {
            searchClearBtn.classList.toggle("hidden", searchQuery.length === 0);
        }
        renderProducts();
    });
}
if (searchClearBtn) {
    searchClearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        searchQuery = "";
        searchClearBtn.classList.add("hidden");
        renderProducts();
    });
}

// Manage gated sections
const updateGatedSections = () => {
    const user = getCurrentUser();
    const template = document.getElementById("lockedTemplate");
    
    GATED_SECTIONS.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Remove existing locked overlay
        const existing = section.querySelector(".locked-overlay");
        if (existing) existing.remove();
        
        if (!user) {
            // Add locked overlay
            section.classList.add("section-gated");
            const clone = template.content.cloneNode(true);
            section.appendChild(clone);
        } else {
            section.classList.remove("section-gated");
        }
    });
};

// ==================
//  INIT
// ==================
loadDatabase().then(() => {
    renderFormations();
    renderDocuments();
    renderCart();
    updateAuthUI();
    updateGatedSections();

    // Initialize SPA routing based on current URL hash
    navigateTo(window.location.hash);

    // Run scroll reveal
    setTimeout(setupScrollReveal, 100);
});

// ==================
//  CHATBOT CONSEILLER COMMERCIAL EN TEMPS RÉEL
// ==================
const chatbotToggler = document.getElementById("chatbotToggler");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotBody = document.getElementById("chatbotBody");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotSend = document.getElementById("chatbotSend");

if (chatbotToggler && chatbotWindow) {
    chatbotToggler.addEventListener("click", () => {
        chatbotWindow.classList.toggle("open");
        if (chatbotWindow.classList.contains("open") && chatbotInput) {
            chatbotInput.focus();
        }
    });

    chatbotClose.addEventListener("click", () => {
        chatbotWindow.classList.remove("open");
    });

    const generateChatbotResponse = (userMsg) => {
        const text = userMsg.toLowerCase().trim();

        // ==========================================
        //  0. DÉTECTION DES REMERCIEMENTS & FIN DE CONVERSATION
        // ==========================================
        const THANKS_KEYWORDS = ["merci", "merci beaucoup", "merci bien", "jerejef", "jaajuf", "dieuredieuff", "diereudieuf", "thanks", "thank you", "gracias", "au revoir", "bye", "a bientot", "à bientôt", "c'est bon", "cest bon", "c bon", "super merci"];
        const isThanks = THANKS_KEYWORDS.some(k => text.includes(k));

        if (isThanks) {
            if (["jerejef", "jaajuf", "dieuredieuff", "diereudieuf"].some(k => text.includes(k))) {
                return "Jerejef ak yokkute ! Nooko bokk. Yalla na nga am ndam ci sa concours yi ! N'hésite pas si tu as d'autres questions. 👋";
            }
            if (["gracias"].some(k => text.includes(k))) {
                return "¡De nada! Ha sido un placer. ¡Mucho éxito y hasta pronto! 👋";
            }
            if (["thanks", "thank you"].some(k => text.includes(k))) {
                return "You're very welcome! Best of luck with your prep! 👋";
            }
            return "Je t'en prie, c'est avec un grand plaisir ! N'hésite pas si tu as besoin d'autres documents. Beaucoup de succès dans tes révisions et à très vite ! 👋";
        }

        // ==========================================
        //  1. MULTILINGUAL SUPPORT (WOLOF, SPANISH, ENGLISH)
        // ==========================================
        
        // WOLOF DETECTION
        const isWolof = ["nanga def", "na nga def", "naka mu dem", "naka la", "jaajuf", "jajuf", "dieuredieuff", "diereudieuf", "lu bes", "lu bess", "ban concours", "nooko bokk", "waaw", "dakar", "senegal"].some(k => text.includes(k));
        if (isWolof) {
            if (["nanga def", "na nga def", "naka mu dem", "naka la", "salut", "bonjour", "lu bes"].some(k => text.includes(k))) {
                return "Nanga def ! Jama nga am ci SK ACADEMIA. Man la Moussa, naka laay la meune dimbali tey ci sa révisions concours (ENA, Police, CREM, FASTEF) ?";
            }
            if (["prix", "combien", "niata", "ñaata", "fcfa"].some(k => text.includes(k))) {
                return "💰 Sunu fascicules yi dafa gën a yomb. Dafa varyé diggante 5 000 FCFA ak 18 000 FCFA. Mën nga fey par Wave wala Orange Money direct ci site bi !";
            }
            if (["document", "fascicule", "pdf", "am", "disponible"].some(k => text.includes(k))) {
                return "📄 Am nañu lepp lu lay préparé : ENA, Police, Douanes, CREM, FASTEF, Santé. Ban concours mo la gën a intéresser ?";
            }
            return "Jerejef ! Man la Moussa. Naka laay la meune dimbali ci sa préparation concours ?";
        }

        // SPANISH DETECTION
        const isSpanish = ["hola", "buenos dias", "buenas tardes", "buenas noches", "como estas", "gracias", "cuanto cuesta", "precio", "espanol", "español", "documentos"].some(k => text.includes(k));
        if (isSpanish) {
            if (["hola", "buenos dias", "buenas tardes", "buenas noches"].some(k => text.includes(k))) {
                return "¡Hola! Soy Moussa, tu asesor en SK ACADEMIA. ¿Cómo puedo ayudarte hoy con la preparación de tus concursos?";
            }
            if (["precio", "cuanto cuesta", "tarifa"].some(k => text.includes(k))) {
                return "💰 Nuestros documentos cuestan entre 5 000 FCFA y 18 000 FCFA. ¡Pagos muy fáciles con Wave u Orange Money!";
            }
            if (["documento", "documentos", "disponible"].some(k => text.includes(k))) {
                return "📄 Tenemos de todo: ENA, Policía, Aduanas, FASTEF y Salud. ¿Qué preparas exactamente?";
            }
            return "¡Muchas gracias! Estoy aquí para ayudarte a elegir el mejor material.";
        }

        // ENGLISH DETECTION
        const isEnglish = ["hello", "hi", "good morning", "good evening", "how are you", "thanks", "thank you", "what is", "how much", "price", "available", "documents"].some(k => text.includes(k));
        if (isEnglish) {
            if (["hello", "hi", "good morning", "good evening"].some(k => text.includes(k))) {
                return "Hello there! I'm Moussa from SK ACADEMIA. How can I help you crush your exams today?";
            }
            if (["price", "how much", "cost"].some(k => text.includes(k))) {
                return "💰 Our past papers range from 5,000 FCFA to 18,000 FCFA. You can pay via Wave or Orange Money directly!";
            }
            if (["document", "documents", "available", "pdf"].some(k => text.includes(k))) {
                return "📄 We got prep books for ENA, Police, Customs, Health, FASTEF, and IT. Which one do you need?";
            }
            return "Thanks for reaching out! Just ask me anything about our prep materials.";
        }

        // ==========================================
        //  2. FRENCH CONVERSATIONAL & ENCYCLOPEDIC ENGINE
        // ==========================================

        // Détection des salutations simples en Français
        const GREETING_WORDS = ["bnsr", "bonsoir", "bsr", "bonjour", "salut", "coucou", "salam", "hello", "bonsoir moussa", "bonjour moussa", "bjr"];
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const isPureGreeting = words.every(w => GREETING_WORDS.includes(w) || w === "!" || w === "?" || w === "sk");

        if (isPureGreeting || GREETING_WORDS.some(g => text === g)) {
            if (text.includes("bonsoir") || text.includes("bnsr") || text.includes("bsr")) {
                return "Bonsoir ! Moi c'est Moussa de SK ACADEMIA. Vous préparez quel concours actuellement ?";
            }
            return "Bonjour ! C'est Moussa à votre service. Quel concours ou quelle formation vous intéresse aujourd'hui ?";
        }

        // Question spécifique sur la liste des documents disponibles
        const isAskingAvailableDocs = [
            "disponible", "disponibles", "dispo", "quels sont les documents", 
            "liste des documents", "les documents", "quels fascicules", 
            "catalogue", "ce que vous avez", "les annales", "vous proposez quoi",
            "quels produits", "liste de document", "avez vous des documents"
        ].some(k => text.includes(k));

        if (isAskingAvailableDocs) {
            const topDocs = (PRODUCTS && PRODUCTS.length > 0) ? PRODUCTS.slice(0, 7) : DEFAULT_PRODUCTS.slice(0, 7);
            let docsListHtml = topDocs.map(p => `<li>• <strong>${p.title}</strong> — <span style="color:var(--orange-dark); font-weight:600;">${formatPrice(p.price)}</span></li>`).join("");

            return `
                <p style="margin-bottom:0.5rem;">On a un excellent catalogue ! Voici les fascicules les plus demandés en ce moment :</p>
                <ul style="padding-left:0.5rem; margin-bottom:0.75rem; display:flex; flex-direction:column; gap:0.4rem; list-style:none;">
                    ${docsListHtml}
                </ul>
                <p>Lequel de ces concours vous ciblez ?</p>
            `;
        }

        // Réponses thématiques ciblées (Plus directes et commerciales)
        const responses = [];

        // CONCOURS ENSEIGNEMENT & DOMAINES ACADÉMIQUES
        if (["crem", "fastef", "ugb", "enseignement", "instituteur", "professeur", "espagnol", "lettres", "pedagogie", "pédagogie", "leçon d'essai"].some(k => text.includes(k))) {
            responses.push("📚 **Concours de l'Enseignement (CREM, FASTEF)** : On a exactement ce qu'il vous faut ! Nos fiches méthodologiques pour la leçon d'essai et la dissertation pédagogique sont de vraies pépites, sans parler de nos annales résolues.");
        }

        // GESTION, COMPTABILITÉ, FINANCE & RH
        if (["comptabilité", "comptabilite", "finance", "rh", "ressources humaines", "gestion", "paie", "recrutement", "ohada", "bilan"].some(k => text.includes(k))) {
            responses.push("📊 **Gestion & RH** : C'est très pointu. Nos documents couvrent le SYSCOHADA, l'analyse financière et la paie avec des exercices corrigés très pratiques.");
        }

        // INFORMATIQUE & COMPÉTENCES DIGITALES
        if (["informatique", "web", "programmation", "excel", "bureautique", "ia", "intelligence artificielle", "code", "python"].some(k => text.includes(k))) {
            responses.push("💻 **Informatique & IA** : Super domaine ! On propose des modules bétons en Développement Web, Maîtrise d'Excel et IA Appliquée. C'est parfait pour booster vos compétences.");
        }

        // ADMINISTRATION & JUSTICE
        if (["ena", "magistrat", "greffier", "droit", "administration", "justice"].some(k => text.includes(k))) {
            responses.push("🏛️ **Administration (ENA, Magistrature)** : Pour l'ENA, le secret c'est la préparation. On a la culture générale régionale et 10 ans d'annales corrigées. Vous allez faire la différence.");
        }

        // SÉCURITÉ & DÉFENSE
        if (["police", "gendarmerie", "douane", "douanes", "sécurité", "securite", "ensoa", "armée"].some(k => text.includes(k))) {
            responses.push("🛡️ **Sécurité & Défense (Police, Gendarmerie, Douanes)** : Concours très physique, mais l'écrit compte énormément ! On a tout le pack (dictée, QCM, maths) pour réussir haut la main.");
        }

        // SANTÉ & SOCIAL
        if (["santé", "sante", "sage-femme", "sage femme", "inseps", "udes", "biologie", "infirmier"].some(k => text.includes(k))) {
            responses.push("🩺 **Santé (Sage-femme, INSEPS)** : Les matières scientifiques sont éliminatoires. Nos cours de biologie, physique-chimie et nos tests psychotechniques corrigés vont beaucoup vous aider.");
        }

        // POLYTECHNIQUE & GRANDES ÉCOLES
        if (["polytechnique", "ept", "esp", "thiès", "thies", "dakar", "ingénieur"].some(k => text.includes(k))) {
            responses.push("📐 **Polytechnique (EPT/ESP)** : C'est le niveau ingénieur ! On met à disposition des annales corrigées en maths et physique pour vous mettre directement dans le bain.");
        }

        // PRIX & TARIFS
        if (["prix", "combien", "tarif", "coût", "cout", "combien coute", "fcfa", "payant"].some(k => text.includes(k))) {
            responses.push("💰 C'est très abordable ! Les fascicules vont de **5 000 FCFA à 18 000 FCFA** maximum. C'est un investissement minime pour assurer votre réussite.");
        }

        // PAIEMENT (WAVE / ORANGE MONEY)
        if (["payer", "paiement", "wave", "orange money", "om", "mode de paiement", "moyen de paiement", "acheter", "achat", "comment"].some(k => text.includes(k))) {
            responses.push("🌊 **C'est super simple pour payer** : Ajoutez vos fascicules au panier, cliquez sur 'Commander par WhatsApp' et vous réglez par **Wave** ou **Orange Money**. On vous envoie les PDF instantanément !");
        }

        // CONTACT & COMPTE
        if (["contact", "appeler", "téléphone", "telephone", "whatsapp", "numéro", "numero", "support", "email", "joindre"].some(k => text.includes(k))) {
            responses.push("📞 Vous voulez qu'on en discute de vive voix ? Appelez-moi ou écrivez-moi sur WhatsApp au **76 574 93 43**.");
        }

        // Si des réponses thématiques ont été trouvées
        if (responses.length > 0) {
            let greetingPrefix = "";
            if (text.includes("bonjour") || text.includes("salut") || text.includes("salam") || text.includes("hello") || text.includes("bjr")) {
                greetingPrefix = "Bonjour ! ";
            } else if (text.includes("bonsoir") || text.includes("bnsr") || text.includes("bsr")) {
                greetingPrefix = "Bonsoir ! ";
            }
            return `${greetingPrefix}${responses.join("<br><br>")}`;
        }

        // Réponse d'attente (Catch-all) très humaine
        return "Ah, je n'ai pas bien saisi. 😅 Je suis Moussa, conseiller pour tous les concours (ENA, Police, Douanes, CREM, Santé, etc.). Dites-moi simplement quel concours vous préparez et je vous montre nos meilleurs documents !";
    };

    // Real-time typing & response rendering
    const streamBotMessage = (htmlContent, autoClose = false) => {
        // Create bot message container
        const botDiv = document.createElement("div");
        botDiv.className = "chatbot-msg bot";
        botDiv.style.lineHeight = "1.5";
        chatbotBody.appendChild(botDiv);

        // Immediate typing indicator
        botDiv.innerHTML = `<div class="chatbot-typing" style="padding:0.2rem 0.5rem;"><span></span><span></span><span></span></div>`;
        chatbotBody.scrollTop = chatbotBody.scrollHeight;

        // Render response in real-time
        setTimeout(() => {
            botDiv.innerHTML = htmlContent;
            chatbotBody.scrollTop = chatbotBody.scrollHeight;

            if (autoClose) {
                setTimeout(() => {
                    chatbotWindow.classList.remove("open");
                }, 3000);
            }
        }, 200);
    };

    const handleChatbotSend = () => {
        const msg = chatbotInput.value.trim();
        if (!msg) return;
        
        // Render user message bubble
        const userDiv = document.createElement("div");
        userDiv.className = "chatbot-msg user";
        userDiv.textContent = msg;
        chatbotBody.appendChild(userDiv);
        chatbotInput.value = "";
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        
        // Check if thanks / end of conversation
        const THANKS_KEYS = ["merci", "merci beaucoup", "merci bien", "jerejef", "jaajuf", "dieuredieuff", "diereudieuf", "thanks", "thank you", "gracias", "au revoir", "bye", "a bientot", "à bientôt", "c'est bon", "cest bon", "c bon", "super merci"];
        const isThanksMsg = THANKS_KEYS.some(k => msg.toLowerCase().includes(k));

        // Generate and stream real-time response
        const responseHtml = generateChatbotResponse(msg);
        streamBotMessage(responseHtml, isThanksMsg);
    };

    chatbotSend.addEventListener("click", handleChatbotSend);
    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChatbotSend();
    });
}

// ==================
//  DASHBOARD TABS
// ==================
document.querySelectorAll(".dash-nav-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
        const layout = btn.closest(".dashboard-layout") || document;
        // Remove active from nav buttons in this layout
        layout.querySelectorAll(".dash-nav-btn").forEach(b => b.classList.remove("active"));
        // Add active to clicked
        btn.classList.add("active");

        // Hide tabs in this layout
        layout.querySelectorAll(".dash-tab").forEach(tab => tab.classList.remove("active"));
        // Show target tab
        const targetId = btn.getAttribute("data-tab");
        const targetTab = layout.querySelector("#" + targetId) || document.getElementById(targetId);
        if (targetTab) {
            targetTab.classList.add("active");
        }
    });
});

// ==================
//  COURSE PLAYER UI
// ==================
document.querySelectorAll(".course-module-title").forEach(title => {
    title.addEventListener("click", () => {
        const module = title.parentElement;
        module.classList.toggle("active");
        
        // Simple accordion logic (optional): close others
        /* document.querySelectorAll(".course-module").forEach(m => {
            if (m !== module) m.classList.remove("active");
        }); */
    });
});

document.querySelectorAll(".course-lesson").forEach(lesson => {
    lesson.addEventListener("click", () => {
        document.querySelectorAll(".course-lesson").forEach(l => l.classList.remove("active"));
        lesson.classList.add("active");
        
        // Update video placeholder title
        const videoTitle = document.querySelector(".course-video-placeholder span");
        const lessonText = lesson.textContent.replace(/▶️|📄/g, "").trim();
        if (videoTitle) videoTitle.textContent = lessonText;
        
        const contentInfoTitle = document.querySelector(".course-content-info h2");
        if (contentInfoTitle) contentInfoTitle.textContent = "Chapitre : " + lessonText;
    });
});

// Update navigateTo buttons to also update history
document.querySelectorAll("button[onclick^='navigateTo']").forEach(btn => {
    const originalOnclick = btn.getAttribute("onclick");
    // Extract target ID. e.g. navigateTo('#course') -> #course
    const match = originalOnclick.match(/navigateTo\('([^']*)'\)/);
    if (match && match[1]) {
        btn.removeAttribute("onclick");
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState(null, null, match[1]);
            navigateTo(match[1]);
        });
    }
});

// ==================
//  ADMIN LOGIC
// ==================
const adminModal = document.getElementById("adminModal");
const adminModalOverlay = document.getElementById("adminModalOverlay");
const adminProductForm = document.getElementById("adminProductForm");

let tempProdContentBase64 = "";
let tempProdImageBase64 = "";

// Mapping constants for clean product labels
const TYPE_NAMES = {
    "fascicule": "Fascicule",
    "annale": "Annale",
    "cours": "Cours PDF",
    "formation": "Formation Vidéo",
    "pack": "Pack Complet"
};

const CAT_NAMES = {
    "administration": "Administration & Justice",
    "securite": "Sécurité & Défense",
    "douane": "Douanes",
    "sante": "Santé & Social",
    "grandes-ecoles": "Grandes Écoles",
    "enseignement": "Enseignement (FASTEF)",
    "formation": "Informatique & Web"
};

const CAT_LABELS = {
    "administration": "cat-lbl-admin",
    "securite": "cat-lbl-secu",
    "douane": "cat-lbl-secu",
    "sante": "cat-lbl-sante",
    "grandes-ecoles": "cat-lbl-ecoles",
    "enseignement": "cat-lbl-ens",
    "formation": "cat-lbl-form"
};

const CAT_BGS = {
    "administration": "bg-admin",
    "securite": "bg-secu",
    "douane": "bg-secu",
    "sante": "bg-sante",
    "grandes-ecoles": "bg-ecoles",
    "enseignement": "bg-ens",
    "formation": "bg-form"
};

const CAT_ICONS = {
    "fascicule": "📄",
    "annale": "📜",
    "cours": "📖",
    "formation": "🎥",
    "pack": "📦"
};

document.getElementById("adminProdContentFile")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempProdContentBase64 = ev.target.result;
            const contentInput = document.getElementById("adminProdContent");
            if (contentInput) contentInput.value = file.name;
            const status = document.getElementById("adminProdContentStatus");
            if (status) status.textContent = `Fichier prêt : ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("adminProdImageFile")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            tempProdImageBase64 = ev.target.result;
            const imgInput = document.getElementById("adminProdImage");
            if (imgInput) imgInput.value = file.name;
            const status = document.getElementById("adminProdImageStatus");
            if (status) status.textContent = `Image prête : ${file.name}`;
        };
        reader.readAsDataURL(file);
    }
});

const openAdminModal = (prodId = null, prefillType = "") => {
    if (!adminProductForm) return;
    adminProductForm.reset();
    tempProdContentBase64 = "";
    tempProdImageBase64 = "";
    
    const contentStatus = document.getElementById("adminProdContentStatus");
    const imageStatus = document.getElementById("adminProdImageStatus");
    if (contentStatus) contentStatus.textContent = "";
    if (imageStatus) imageStatus.textContent = "";

    if (document.getElementById("adminProdContentFile")) document.getElementById("adminProdContentFile").value = "";
    if (document.getElementById("adminProdImageFile")) document.getElementById("adminProdImageFile").value = "";
    document.getElementById("adminProdId").value = "";
    
    if (prefillType) {
        const typeSelect = document.getElementById("adminProdType");
        if (typeSelect) typeSelect.value = prefillType;
    }

    if (prodId) {
        const prod = PRODUCTS.find(p => p.id == prodId);
        if (prod) {
            document.getElementById("adminProdId").value = prod.id;
            document.getElementById("adminProdTitle").value = prod.title || "";
            if (document.getElementById("adminProdType")) document.getElementById("adminProdType").value = prod.type || "fascicule";
            if (document.getElementById("adminProdCategory")) document.getElementById("adminProdCategory").value = prod.category || "administration";
            document.getElementById("adminProdPrice").value = prod.price || 0;
            document.getElementById("adminProdContent").value = prod.contentUrl || "";
            document.getElementById("adminProdImage").value = prod.image || "";
            document.getElementById("adminProdDesc").value = prod.desc || "";
        }
    }
    adminModal.classList.add("show");
    adminModalOverlay.classList.add("show");
};

const closeAdminModal = () => {
    if (adminModal) adminModal.classList.remove("show");
    if (adminModalOverlay) adminModalOverlay.classList.remove("show");
};

if (document.getElementById("adminModalClose")) {
    document.getElementById("adminModalClose").addEventListener("click", closeAdminModal);
    if (adminModalOverlay) adminModalOverlay.addEventListener("click", closeAdminModal);
}

if (adminProductForm) {
    adminProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("adminProdId").value;
        const title = document.getElementById("adminProdTitle").value.trim();
        const type = document.getElementById("adminProdType").value || "fascicule";
        const category = document.getElementById("adminProdCategory").value || "administration";
        const price = parseInt(document.getElementById("adminProdPrice").value) || 0;
        const contentUrl = tempProdContentBase64 || document.getElementById("adminProdContent").value.trim();
        const imageInput = tempProdImageBase64 || document.getElementById("adminProdImage").value.trim();
        const desc = document.getElementById("adminProdDesc").value.trim();

        const typeName = TYPE_NAMES[type] || (type ? type.charAt(0).toUpperCase() + type.slice(1) : "Produit");
        const catName = CAT_NAMES[category] || (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Général");
        const catLabel = CAT_LABELS[category] || "cat-lbl-admin";
        const bg = CAT_BGS[category] || "bg-admin";
        const icon = CAT_ICONS[type] || "📦";
        const finalImage = imageInput || CAT_IMAGES[category] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop";

        if (id) {
            // Edit
            const index = PRODUCTS.findIndex(p => p.id == id);
            if (index > -1) {
                PRODUCTS[index] = {
                    ...PRODUCTS[index],
                    title, type, category, price, contentUrl, desc,
                    typeName, catName, catLabel, bg, icon,
                    image: imageInput || PRODUCTS[index].image || finalImage
                };
            }
        } else {
            // Add new product/document
            const newProd = {
                id: Date.now(),
                title, type, category, price, contentUrl, desc,
                typeName, catName, catLabel, bg, icon,
                image: finalImage
            };
            PRODUCTS.unshift(newProd);
        }
        
        saveProducts();
        closeAdminModal();
        showToast("✅", `Produit "${title.slice(0, 30)}..." enregistré avec succès !`);
    });
}

const deleteProduct = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
        const index = PRODUCTS.findIndex(p => p.id == id);
        if (index > -1) {
            PRODUCTS.splice(index, 1);
            saveProducts();
            showToast("🗑️", "Produit supprimé");
        }
    }
};

window.deleteProduct = deleteProduct; // Expose globally
window.openAdminModal = openAdminModal; // Expose globally

const renderAdminProducts = () => {
    const tbodyAll = document.getElementById("adminProductsTableBody");
    const tbodyDocs = document.getElementById("adminDocsTable");
    const tbodyVideos = document.getElementById("adminVideosTable");

    const buildRow = (p) => `
        <tr>
            <td><strong>${p.id || 'N/A'}</strong></td>
            <td><strong>${p.title || 'Sans titre'}</strong></td>
            <td><span class="product-type-badge" style="position:static; display:inline-block">${p.typeName || p.type || 'Fascicule'}</span></td>
            <td><strong>${formatPrice(p.price || 0)}</strong></td>
            <td>
                <button class="btn-edit" onclick="openAdminModal('${p.id}')">✏️ Éditer</button>
                <button class="btn-delete" onclick="deleteProduct('${p.id}')">❌ Supprimer</button>
            </td>
        </tr>
    `;

    if (tbodyAll) tbodyAll.innerHTML = PRODUCTS.map(buildRow).join("");
    if (tbodyDocs) tbodyDocs.innerHTML = PRODUCTS.filter(p => p.type && ["fascicule", "annale", "document", "cours", "pdf"].includes(String(p.type).toLowerCase())).map(buildRow).join("");
    if (tbodyVideos) tbodyVideos.innerHTML = PRODUCTS.filter(p => p.type && ["formation", "video", "pack"].includes(String(p.type).toLowerCase())).map(buildRow).join("");
};

// ==================================
//  ADMIN: SITE SETTINGS & CUSTOMERS
// ==================================
const loadSiteConfig = () => {
    const defaultConfig = {
        phone: "+221765749343",
        email: "contact@skacademia.sn",
        address: "Dakar, Sénégal"
    };
    let config = defaultConfig;
    try {
        const stored = localStorage.getItem('sk_site_config');
        if (stored) config = JSON.parse(stored);
    } catch(e) {}
    
    let displayPhone = config.phone;
    if (displayPhone.length >= 12 && displayPhone.startsWith("+221")) {
        displayPhone = `+221 ${displayPhone.slice(4,6)} ${displayPhone.slice(6,9)} ${displayPhone.slice(9,11)} ${displayPhone.slice(11)}`;
    }

    if (document.getElementById("contactPhoneTop")) document.getElementById("contactPhoneTop").textContent = displayPhone;
    if (document.getElementById("contactEmailTop")) document.getElementById("contactEmailTop").textContent = config.email;
    
    if (document.getElementById("contactPhoneFooter")) document.getElementById("contactPhoneFooter").textContent = displayPhone;
    if (document.getElementById("contactEmailFooter")) document.getElementById("contactEmailFooter").textContent = config.email;
    if (document.getElementById("contactAddressFooter")) document.getElementById("contactAddressFooter").textContent = config.address;
    
    if (document.getElementById("whatsappFloatLink")) document.getElementById("whatsappFloatLink").href = `https://wa.me/${config.phone.replace('+', '')}`;
    
    if (document.getElementById("settingWhatsApp")) document.getElementById("settingWhatsApp").value = config.phone.replace('+', '');
    if (document.getElementById("settingEmail")) document.getElementById("settingEmail").value = config.email;
    if (document.getElementById("settingAddress")) document.getElementById("settingAddress").value = config.address;
};

const renderAdminCustomers = () => {
    const tbody = document.getElementById("adminCustomersTableBody");
    if (!tbody) return;
    
    const users = getUsers();
    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem;">Aucun client inscrit pour le moment.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${formatDate(u.registeredAt || new Date().toISOString())}</td>
            <td><strong>${u.firstName} ${u.lastName}</strong></td>
            <td>${u.email}<br><span style="color:var(--text-muted);font-size:0.8rem;">${u.phone || 'Non renseigné'}</span></td>
            <td><span class="product-type-badge" style="background:${u.purchases && u.purchases.length > 0 ? '#10b981' : '#f59e0b'}; color:white; border:none;">${(u.purchases && u.purchases.length > 0) ? 'Client Premium' : 'Inscription Gratuite'}</span></td>
            <td>
                <a class="btn-primary btn-sm" href="https://wa.me/${(u.phone||'').replace('+','')}" target="_blank" style="text-decoration:none;">💬 WA</a>
            </td>
        </tr>
    `).join("");
};

window.renderAdminCustomers = renderAdminCustomers;
window.loadSiteConfig = loadSiteConfig;

// ==================================
//  STUDENT DASHBOARD RENDERER
// ==================================
const renderStudentDashboard = () => {
    const user = getCurrentUser();
    const coursesContainer = document.getElementById("dashCoursesContainer");
    const docsContainer = document.getElementById("dashDocsContainer");
    
    if (!coursesContainer || !docsContainer) return;

    if (user) {
        if (document.getElementById("dashName")) document.getElementById("dashName").textContent = `${user.firstName} ${user.lastName}`;
        if (document.getElementById("dashAvatar")) document.getElementById("dashAvatar").textContent = getInitials(user.firstName, user.lastName);
    }

    const purchases = (user && user.purchases) ? user.purchases : [];

    // Filter courses & videos vs documents
    const boughtCourses = purchases.filter(p => p.type && ["formation", "cours", "video"].includes(String(p.type).toLowerCase()));
    const boughtDocs = purchases.filter(p => !p.type || ["fascicule", "annale", "pdf", "pack", "document"].includes(String(p.type).toLowerCase()) || !boughtCourses.includes(p));

    // Render Courses UI
    if (boughtCourses.length === 0) {
        coursesContainer.innerHTML = `
            <div class="dash-course-card" style="grid-column: 1 / -1;">
                <div class="dash-cc-info" style="text-align:center; padding:2.5rem 1.5rem;">
                    <span style="font-size:2.5rem; display:block; margin-bottom:0.5rem;">🎓</span>
                    <h3>Aucune formation vidéo active</h3>
                    <p style="color:var(--text-muted); margin-bottom:1rem;">Inscrivez-vous à nos formations vidéos ou concours pour accéder à vos cours en ligne.</p>
                    <button class="btn-primary btn-sm" onclick="navigateTo('#concours')">Découvrir nos Concours & Formations →</button>
                </div>
            </div>`;
    } else {
        coursesContainer.innerHTML = boughtCourses.map(c => `
            <div class="dash-course-card">
                <div class="dash-cc-img"><img src="${c.image || 'images/concours-securite.png'}" alt="${c.title}"></div>
                <div class="dash-cc-info">
                    <h3>${c.title}</h3>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${c.progress || 25}%;"></div></div>
                    <span class="progress-text">${c.progress || 25}% complété</span>
                    <button class="btn-primary btn-sm" onclick="openCoursePlayer('${(c.title || '').replace(/'/g, "\\'")}')">Continuer →</button>
                </div>
            </div>
        `).join("");
    }

    // Render Docs UI
    if (boughtDocs.length === 0) {
        docsContainer.innerHTML = `
            <div class="dash-list-item" style="justify-content:center; text-align:center; padding:2.5rem 1.5rem;">
                <div>
                    <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">📑</span>
                    <p style="color:var(--text-muted); margin-bottom:1rem;">Aucun document ou fascicule acheté pour le moment.</p>
                    <button class="btn-primary btn-sm" onclick="navigateTo('#boutique')">Explorer la Boutique →</button>
                </div>
            </div>`;
    } else {
        docsContainer.innerHTML = boughtDocs.map(d => `
            <div class="dash-list-item">
                <div class="dash-item-icon">${d.icon || '📄'}</div>
                <div class="dash-item-text" style="flex:1; margin:0 1rem;">
                    <strong>${d.title}</strong><br>
                    <span style="font-size:0.8rem; color:var(--text-muted);">Acheté le ${d.purchasedAt || 'Récemment'}</span>
                </div>
                <button class="btn-secondary btn-sm" onclick="openDocumentFile('${(d.contentUrl || d.image || '').replace(/'/g, "\\'")}', '${(d.title || '').replace(/'/g, "\\'")}')">📥 Télécharger / Ouvrir</button>
            </div>
        `).join("");
    }
};

const openDocumentFile = (url, title) => {
    if (!url) {
        showToast("📄", `Ouverture du document "${title}"...`);
        return;
    }
    if (url.startsWith("data:") || url.startsWith("http")) {
        const win = window.open(url, "_blank");
        if (!win) showToast("⚠️", "Veuillez autoriser les fenêtres surgissantes pour ouvrir le fichier.");
    } else {
        showToast("📄", `Accès au fichier : ${url}`);
    }
};

const openCoursePlayer = (title) => {
    const playerTitle = document.getElementById("coursePlayerTitle");
    if (playerTitle) playerTitle.textContent = title;
    history.pushState(null, null, "#course");
    navigateTo("#course");
};

window.openDocumentFile = openDocumentFile;
window.openCoursePlayer = openCoursePlayer;
window.renderStudentDashboard = renderStudentDashboard;

// Expose rendering globally
window.renderAdminProducts = renderAdminProducts;

// ==========================================
//  BENCHMARKED DEMO / FREE TRIAL MODAL LOGIC
// ==========================================
const openDemoModal = () => {
    const demoOverlay = document.getElementById("demoOverlay");
    const demoModal = document.getElementById("demoModal");
    if (demoOverlay && demoModal) {
        demoOverlay.classList.add("show");
        demoModal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
};

const closeDemoModal = () => {
    const demoOverlay = document.getElementById("demoOverlay");
    const demoModal = document.getElementById("demoModal");
    if (demoOverlay && demoModal) {
        demoOverlay.classList.remove("show");
        demoModal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

window.openDemoModal = openDemoModal;
window.closeDemoModal = closeDemoModal;

document.addEventListener("DOMContentLoaded", () => {
    const demoClose = document.getElementById("demoClose");
    const demoOverlay = document.getElementById("demoOverlay");
    const demoForm = document.getElementById("demoForm");

    if (demoClose) demoClose.addEventListener("click", closeDemoModal);
    if (demoOverlay) demoOverlay.addEventListener("click", closeDemoModal);

    if (demoForm) {
        demoForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("demoName").value.trim();
            const phone = document.getElementById("demoPhone").value.trim();
            const target = document.getElementById("demoTarget").value;
            const slot = document.getElementById("demoSlot").value;

            closeDemoModal();
            demoForm.reset();

            showToast("🎉", `Merci ${name} ! Votre réservation d'essai gratuit pour ${target} (${slot}) a été enregistrée.`);

            setTimeout(() => {
                const msg = encodeURIComponent(`Bonjour SK ACADEMIA, je m'appelle ${name} (${phone}). Je souhaite réserver ma séance d'essai gratuite pour le concours ${target} (${slot}).`);
                window.open(`https://wa.me/221765749343?text=${msg}`, "_blank");
            }, 2000);
        });
    }
});

// ==========================================
//  INNOVATION 1 & 2 : SIMULATEUR & KEYWORD FILTER
// ==========================================
const filterProductsByKeyword = (kw) => {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = kw;
        searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
    history.pushState(null, null, "#boutique");
    navigateTo("#boutique");
};
window.filterProductsByKeyword = filterProductsByKeyword;

const runEligibilitySimulation = () => {
    const diplome = document.getElementById("simDiplome").value;
    const age = document.getElementById("simAge").value;
    const resultsDiv = document.getElementById("simResults");
    const matchesList = document.getElementById("simMatchesList");

    if (!resultsDiv || !matchesList) return;

    let matches = [];
    if (diplome === "BFEM") {
        matches = [
            "👮 Concours Sous-Officiers de Police & Gendarmerie (Niveau BFEM/3ème)",
            "🪖 Concours ENSOA (École Nationale des Sous-Officiers d'Actif)"
        ];
    } else if (diplome === "BAC") {
        matches = [
            "👮 Concours Police Nationale (Gardien de la Paix & Inspecteur)",
            "🛃 Concours Douanes Sénégalaises (Préposé & Contrôleur)",
            "🤱 Concours Sage-Femme & Santé (UDES / INSEPS)",
            "📐 Concours Polytechnique Thiès & ESP Dakar (Filières Ingénieurs)"
        ];
    } else if (diplome === "LICENCE") {
        matches = [
            "🏛️ Concours Direct ENA Sénégal (Section Administrative)",
            "⚖️ Concours Greffier & Magistrature",
            "📚 Concours FASTEF Dakar (Enseignement Secondaire / Collège)",
            "🛃 Concours Inspecteur des Douanes & Officier de Police"
        ];
    } else if (diplome === "MASTER") {
        matches = [
            "🏛️ Concours ENA Sénégal (Grandes Écoles d'État)",
            "⚖️ Concours Magistrature (Haute Fonction Publique)",
            "📚 Concours FASTEF Spécialités Supérieures (Lycée & Écoles Normales)"
        ];
    }

    matchesList.innerHTML = matches.map(m => `
        <div style="padding:0.6rem 0.8rem; background:white; border:1px solid #cbd5e1; border-radius:6px; font-weight:600; color:var(--blue-deep); font-size:0.9rem;">
            ${m}
        </div>
    `).join("");

    resultsDiv.style.display = "block";
    resultsDiv.scrollIntoView({ behavior: "smooth" });
};
window.runEligibilitySimulation = runEligibilitySimulation;

// ==========================================
//  INNOVATION 3 : SOCIAL PROOF LIVE FEED ROTATOR
// ==========================================
const SOCIAL_PROOF_FEED = [
    { name: "Seydou D. (Dakar)", msg: "Vient d'acheter le Fascicule ENA 2026", icon: "📋" },
    { name: "Mariama S. (Thiès)", msg: "A réservé un Essai Gratuit FASTEF", icon: "🎓" },
    { name: "Ibrahima K. (Saint-Louis)", msg: "Vient d'acheter le Pack Police Nationale", icon: "👮" },
    { name: "Awa N. (Ziguinchor)", msg: "Vient de télécharger l'Annale Douanes", icon: "🛃" },
    { name: "Cheikh B. (Kaolack)", msg: "Vient d'acheter la Formation IA & Python", icon: "💻" }
];

let socialProofIndex = 0;
const startSocialProofRotator = () => {
    const popup = document.getElementById("socialProofPopup");
    const spIcon = document.getElementById("spIcon");
    const spName = document.getElementById("spName");
    const spMsg = document.getElementById("spMsg");

    if (!popup || !spName || !spMsg) return;

    setInterval(() => {
        const item = SOCIAL_PROOF_FEED[socialProofIndex];
        spIcon.textContent = item.icon;
        spName.textContent = item.name;
        spMsg.textContent = `${item.msg} (il y a ${Math.floor(Math.random()*5)+1} min)`;

        popup.style.transform = "translateY(0)";

        setTimeout(() => {
            popup.style.transform = "translateY(150%)";
        }, 5000);

        socialProofIndex = (socialProofIndex + 1) % SOCIAL_PROOF_FEED.length;
    }, 12000);
};

setTimeout(startSocialProofRotator, 3000);

// ==========================================
//  DEDICATED CONCOURS HUB & DOCUMENT LEVEL ENGINE
// ==========================================
let currentHubConcoursKey = "douanes";
let currentHubLevelFilter = "all";

const CONCOURS_HUB_DATA = {
    "douanes": {
        title: "Concours des Douanes Sénégalaises",
        badge: "🛃 Douanes",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            Le concours des Douanes Sénégalaises recrute à plusieurs niveaux de diplômes :<br>
            • <strong>Inspecteur des Douanes :</strong> Niveau Licence (L3) / Master. Épreuves écrites d'économie, droit douanier, culture générale et note de synthèse.<br>
            • <strong>Contrôleur des Douanes :</strong> Niveau Baccalauréat (Toutes séries). Épreuves de mathématiques, français et culture générale.<br>
            • <strong>Préposé des Douanes :</strong> Niveau BFEM / Brevet. Épreuves de dictée, calcul et test physique.
        `
    },
    "ena": {
        title: "Concours Direct &amp; Professionnel ENA Sénégal",
        badge: "🏛️ ENA Sénégal",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            L'École Nationale d'Administration forme les cadres supérieurs de l'État :<br>
            • <strong>Cycle Supérieur (Section Administrative &amp; Économique) :</strong> Niveau Master / BAC+5.<br>
            • <strong>Cycle Moyen :</strong> Niveau Licence (L3) / BAC+3.<br>
            • <strong>Matières phares :</strong> Droit administratif, Économie générale, Culture générale sénégalaise et internationale, Rédaction administrative.
        `
    },
    "police": {
        title: "Concours de la Police Nationale du Sénégal",
        badge: "👮 Police Nationale",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            La Police Nationale recrute sur épreuves écrites, orales et physiques :<br>
            • <strong>Commissaire &amp; Officier :</strong> Niveau Master &amp; Licence.<br>
            • <strong>Inspecteur de Police :</strong> Niveau Licence (L3).<br>
            • <strong>Gardien de la Paix &amp; Agent :</strong> Niveau BAC &amp; BFEM.<br>
            • <strong>Épreuves :</strong> Dissertations, QCM de logique, culture générale, dictée et épreuves sportives.
        `
    },
    "securite": {
        title: "Concours Sécurité &amp; Défense (Police, Gendarmerie, Douanes, ENSOA)",
        badge: "🛡️ Sécurité &amp; Défense",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            Ensemble des concours de la force publique du Sénégal :<br>
            • <strong>Gendarmerie Nationale :</strong> Sous-officiers (BAC/BFEM) et Officiers (Licence).<br>
            • <strong>ENSOA :</strong> École Nationale des Sous-Officiers d'Actif (BAC/BFEM).<br>
            • <strong>Épreuves :</strong> Rédaction, culture générale, épreuves physiques et médicales.
        `
    },
    "sante": {
        title: "Concours de Santé (Sage-Femme, INSEPS, UDES)",
        badge: "🩺 Santé &amp; Social",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            • <strong>Concours Sage-Femme d'État :</strong> Niveau BAC (Séries S ou L avec prérequis scientifiques).<br>
            • <strong>INSEPS (Éducation Physique &amp; Sportive) :</strong> Niveau BAC &amp; Licence.<br>
            • <strong>UDES &amp; Écoles de Santé :</strong> Niveau BFEM &amp; BAC.<br>
            • <strong>Épreuves :</strong> Biologie humaine, Chimie, Tests psychotechniques et culture sanitaire.
        `
    },
    "grandes-ecoles": {
        title: "Concours Grandes Écoles (Polytechnique Thiès EPT &amp; ESP Dakar)",
        badge: "📐 Grandes Écoles",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            • <strong>Polytechnique de Thiès (EPT) :</strong> Niveau BAC S1, S2, S3.<br>
            • <strong>École Supérieure Polytechnique (ESP Dakar) :</strong> Niveau BAC S, T, L ou Licence Scientifique.<br>
            • <strong>Épreuves :</strong> Mathématiques approfondies, Physique-Chimie, Logique scientifique.
        `
    },
    "enseignement": {
        title: "Concours FASTEF Dakar &amp; Enseignement",
        badge: "📚 FASTEF Enseignement",
        info: `
            <strong>🏛️ Présentation Officielle &amp; Niveaux d'Accès :</strong><br>
            • <strong>FASTEF (Professeur de Collège &amp; Lycée) :</strong> Niveau Licence (BAC+3) &amp; Master.<br>
            • <strong>Spécialités :</strong> Lettres, Espagnol, Anglais, Maths, SVT, Physique-Chimie, Histoire-Géo.<br>
            • <strong>Épreuves :</strong> Écrit disciplinaire + Épreuve pratique de Leçon d'Essai devant le jury.
        `
    }
};

const openConcoursHub = (concoursKey = "douanes") => {
    const key = String(concoursKey).toLowerCase();
    currentHubConcoursKey = key;
    currentHubLevelFilter = "all";

    const data = CONCOURS_HUB_DATA[key] || CONCOURS_HUB_DATA["douanes"];

    const overlay = document.getElementById("concoursHubOverlay");
    const modal = document.getElementById("concoursHubModal");
    const hubTitle = document.getElementById("hubTitle");
    const hubCatBadge = document.getElementById("hubCatBadge");
    const hubInfoBox = document.getElementById("hubInfoBox");

    if (hubTitle) hubTitle.innerHTML = data.title;
    if (hubCatBadge) hubCatBadge.textContent = data.badge;
    if (hubInfoBox) hubInfoBox.innerHTML = data.info;

    document.querySelectorAll("#hubLevelPills .filter-pill").forEach(p => p.classList.remove("active"));
    const pillAll = document.getElementById("pillHubAll");
    if (pillAll) pillAll.classList.add("active");

    renderHubProducts();

    if (overlay && modal) {
        overlay.classList.add("show");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
};

const closeConcoursHub = () => {
    const overlay = document.getElementById("concoursHubOverlay");
    const modal = document.getElementById("concoursHubModal");
    if (overlay && modal) {
        overlay.classList.remove("show");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

const filterHubDocsByLevel = (level) => {
    currentHubLevelFilter = level;
    document.querySelectorAll("#hubLevelPills .filter-pill").forEach(p => p.classList.remove("active"));
    
    if (level === 'all') document.getElementById("pillHubAll")?.classList.add("active");
    if (level === 'BFEM') document.getElementById("pillHubBFEM")?.classList.add("active");
    if (level === 'BAC') document.getElementById("pillHubBAC")?.classList.add("active");
    if (level === 'LICENCE') document.getElementById("pillHubLicence")?.classList.add("active");

    renderHubProducts();
};

const renderHubProducts = () => {
    const grid = document.getElementById("hubProductsGrid");
    if (!grid) return;

    let matches = PRODUCTS.filter(p => {
        const cat = (p.category || "").toLowerCase();
        const title = (p.title || "").toLowerCase();
        const desc = (p.desc || "").toLowerCase();
        const key = currentHubConcoursKey;

        if (key === "douanes") return cat === "douane" || title.includes("douan") || desc.includes("douan");
        if (key === "ena") return title.includes("ena") || desc.includes("ena") || title.includes("magistrat") || title.includes("greffier");
        if (key === "police") return title.includes("police") || desc.includes("police");
        if (key === "securite") return cat === "securite" || title.includes("police") || title.includes("gendarme") || title.includes("douane") || title.includes("ensoa");
        if (key === "sante") return cat === "sante" || title.includes("sage") || title.includes("inseps") || title.includes("udes");
        if (key === "grandes-ecoles") return cat === "grandes-ecoles" || title.includes("ept") || title.includes("esp") || title.includes("polytech");
        if (key === "enseignement") return cat === "enseignement" || title.includes("fastef") || title.includes("crem") || title.includes("professeur");

        return cat === key;
    });

    if (matches.length === 0) {
        matches = PRODUCTS.slice(0, 6);
    }

    if (currentHubLevelFilter !== "all") {
        const lvl = currentHubLevelFilter;
        matches = matches.filter(p => {
            const title = (p.title || "").toUpperCase();
            const desc = (p.desc || "").toUpperCase();
            if (lvl === "BFEM") return title.includes("BFEM") || desc.includes("BFEM") || title.includes("3ÈMET") || title.includes("AGENT") || title.includes("PRÉPOSÉ");
            if (lvl === "BAC") return title.includes("BAC") || desc.includes("BAC") || title.includes("CONTRÔLEUR") || title.includes("GARDIEN") || title.includes("SAGE-FEMME") || title.includes("EPT");
            if (lvl === "LICENCE") return title.includes("ENA") || title.includes("INSPECTEUR") || title.includes("FASTEF") || title.includes("MAGISTRAT") || title.includes("OFFICIER") || title.includes("GREFFIER") || title.includes("LICENCE");
            return true;
        });
    }

    if (matches.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
                <span>📭</span> Aucun document disponible pour le niveau <strong>${currentHubLevelFilter}</strong> pour ce concours.
                <button class="btn-primary btn-sm" style="display:block; margin: 0.75rem auto 0 auto;" onclick="filterHubDocsByLevel('all')">Voir tous les niveaux →</button>
            </div>`;
        return;
    }

    grid.innerHTML = matches.map(p => `
        <div style="background: white; border: 1px solid var(--border); border-radius: 8px; padding: 0.85rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <span class="product-cat-label ${p.catLabel || 'cat-lbl-admin'}" style="font-size:0.7rem; padding:0.15rem 0.4rem;">${p.catName || p.type}</span>
                <h4 style="font-size: 0.9rem; color: var(--blue-deep); margin: 0.4rem 0 0.2rem 0; line-height: 1.3;">${p.title}</h4>
                <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.6rem;">${(p.desc || '').slice(0, 70)}...</p>
            </div>
            <div>
                <strong style="color: var(--orange-dark); font-size: 0.95rem; display: block; margin-bottom: 0.5rem;">${formatPrice(p.price)}</strong>
                <div style="display: flex; gap: 0.35rem;">
                    <button class="btn-secondary btn-sm" onclick="openDocumentPreview('${p.id}')" style="flex:1; padding:0.35rem 0.3rem; font-size:0.75rem;">👁️ Aperçu (10p.)</button>
                    <button class="btn-add" data-id="${p.id}" style="flex:1; padding:0.35rem 0.3rem; font-size:0.75rem;">🛒 Acheter</button>
                </div>
            </div>
        </div>
    `).join("");

    grid.querySelectorAll(".btn-add").forEach(btn => {
        btn.addEventListener("click", () => addToCart(parseInt(btn.getAttribute("data-id"))));
    });
};

window.openConcoursHub = openConcoursHub;
window.closeConcoursHub = closeConcoursHub;
window.filterHubDocsByLevel = filterHubDocsByLevel;

document.addEventListener("DOMContentLoaded", () => {
    const concoursClose = document.getElementById("concoursHubClose");
    const concoursOverlay = document.getElementById("concoursHubOverlay");

    if (concoursClose) concoursClose.addEventListener("click", closeConcoursHub);
    if (concoursOverlay) concoursOverlay.addEventListener("click", closeConcoursHub);

    document.querySelectorAll("#concours .btn-concours-access, #concours .concours-card").forEach(card => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            const cardElem = card.closest(".concours-card") || card;
            const filterAttr = card.getAttribute("data-filter") || cardElem.getAttribute("data-concours") || "douanes";
            openConcoursHub(filterAttr);
        });
    });
});

// ==========================================
//  CHARIOW BENCHMARKED WHATSAPP & AFFILIATE LOGIC
// ==========================================
const checkoutViaWhatsApp = () => {
    if (cart.length === 0) {
        showToast("⚠️", "Votre panier est vide");
        return;
    }

    let itemsList = cart.map(i => `• ${i.title} (${formatPrice(i.price)})`).join("\n");
    let total = cart.reduce((sum, item) => sum + item.price, 0);

    // ADMIN TRACKING: Record the order
    recordAdminOrder(cart, total);

    const msg = encodeURIComponent(`Bonjour SK ACADEMIA, je souhaite commander les documents suivants dans mon panier :\n\n${itemsList}\n\nTotal à payer : ${formatPrice(total)}.\n\nMerci de m'envoyer les instructions Wave / Orange Money pour la livraison numérique immédiate.`);
    
    window.open(`https://wa.me/221765749343?text=${msg}`, "_blank");
};

const openAffiliateModal = () => {
    const overlay = document.getElementById("affiliateOverlay");
    const modal = document.getElementById("affiliateModal");
    if (overlay && modal) {
        overlay.classList.add("show");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
};

const closeAffiliateModal = () => {
    const overlay = document.getElementById("affiliateOverlay");
    const modal = document.getElementById("affiliateModal");
    if (overlay && modal) {
        overlay.classList.remove("show");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

const copyReferralLink = () => {
    const input = document.getElementById("referralLinkInput");
    if (input) {
        input.select();
        navigator.clipboard.writeText(input.value);
        showToast("📋", "Lien de parrainage copié dans le presse-papier !");
    }
};

const shareReferralWhatsApp = () => {
    const input = document.getElementById("referralLinkInput");
    const url = input ? input.value : "https://skacademia.sn";
    const msg = encodeURIComponent(`Salut ! Découvre les meilleurs fascicules et annales officiels pour réussir les concours au Sénégal sur SK ACADEMIA 🇸🇳. Rejoins via mon lien et bénéficie de -10% : ${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
};

window.checkoutViaWhatsApp = checkoutViaWhatsApp;
window.openAffiliateModal = openAffiliateModal;
window.closeAffiliateModal = closeAffiliateModal;
window.copyReferralLink = copyReferralLink;
window.shareReferralWhatsApp = shareReferralWhatsApp;

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("affiliateClose");
    const overlay = document.getElementById("affiliateOverlay");
    if (closeBtn) closeBtn.addEventListener("click", closeAffiliateModal);
    if (overlay) overlay.addEventListener("click", closeAffiliateModal);
});

// ==========================================
//  ONLINE TRAINING SUBSCRIPTION LOGIC
// ==========================================
const openSubscriptionModal = () => {
    const user = getCurrentUser();
    if (!user) {
        showToast("🔑", "Veuillez vous connecter pour souscrire à un abonnement Formation.");
        openAuthModal("login");
        return;
    }
    const overlay = document.getElementById("subscriptionOverlay");
    const modal = document.getElementById("subscriptionModal");
    if (overlay && modal) {
        overlay.classList.add("show");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }
};

const closeSubscriptionModal = () => {
    const overlay = document.getElementById("subscriptionOverlay");
    const modal = document.getElementById("subscriptionModal");
    if (overlay && modal) {
        overlay.classList.remove("show");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

const subscribeToPlan = (planName, price) => {
    const user = getCurrentUser();
    if (!user) {
        openAuthModal("login");
        return;
    }

    closeSubscriptionModal();
    showToast("⏳", `Initialisation de l'abonnement ${planName} (${formatPrice(price)})... Veuillez valider le paiement.`, 4000);

    setTimeout(() => {
        user.isSubscribed = true;
        user.subscriptionPlan = planName;
        user.subscriptionDate = new Date().toLocaleDateString('fr-FR');
        setCurrentUser(user);

        const users = getUsers();
        const uIdx = users.findIndex(u => u.email === user.email);
        if (uIdx > -1) {
            users[uIdx] = user;
            saveUsers(users);
        }

        updateAuthUI();
        updateGatedSections();
        renderStudentDashboard();

        showToast("🎉", `Félicitations ${user.firstName} ! Votre abonnement ${planName} est désormais actif sur toutes les Formations en Ligne.`);
    }, 3000);
};

window.openSubscriptionModal = openSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.subscribeToPlan = subscribeToPlan;

document.addEventListener("DOMContentLoaded", () => {
    const subClose = document.getElementById("subscriptionClose");
    const subOverlay = document.getElementById("subscriptionOverlay");
    if (subClose) subClose.addEventListener("click", closeSubscriptionModal);
    if (subOverlay) subOverlay.addEventListener("click", closeSubscriptionModal);
});

/* ============================================
   📊 ADMIN DASHBOARD LOGIC (Simulation & Storage)
   ============================================ */

const getAdminData = () => {
    try {
        return JSON.parse(localStorage.getItem('sk_admin_data')) || {
            orders: [],
            abandonedCarts: [],
            activityLog: [],
            dailyStats: {} // format: "YYYY-MM-DD": { revenue: 0, orders: 0, visitors: 0 }
        };
    } catch {
        return { orders: [], abandonedCarts: [], activityLog: [], dailyStats: {} };
    }
};

const saveAdminData = (data) => {
    localStorage.setItem('sk_admin_data', JSON.stringify(data));
};

const addActivityLog = (msg) => {
    const data = getAdminData();
    data.activityLog.unshift({ time: new Date().toISOString(), msg });
    if (data.activityLog.length > 20) data.activityLog.pop();
    saveAdminData(data);
};

// Hooked into checkoutViaWhatsApp
const recordAdminOrder = (cartItems, total) => {
    const user = getCurrentUser();
    const data = getAdminData();
    const today = new Date().toISOString().split('T')[0];
    
    const newOrder = {
        id: 'CMD-' + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        client: user ? `${user.firstName} ${user.lastName}` : "Visiteur non connecté",
        items: cartItems.map(i => i.title).join(", "),
        total: total,
        status: "En attente de paiement (WhatsApp)"
    };

    // Save Order locally
    data.orders.unshift(newOrder);

    // Update Daily Stats
    if (!data.dailyStats[today]) data.dailyStats[today] = { revenue: 0, orders: 0, visitors: Math.floor(Math.random() * 50) + 10 };
    data.dailyStats[today].revenue += total;
    data.dailyStats[today].orders += 1;

    // Remove from abandoned if it was there
    data.abandonedCarts = data.abandonedCarts.filter(c => c.client !== (user ? user.email : "Visiteur non connecté"));

    saveAdminData(data);
    saveOrderToSupabase(newOrder); // Cloud Sync

    addActivityLog(`🛒 Nouvelle commande de ${formatPrice(total)} par ${user ? user.firstName : 'un visiteur'}.`);
    if(document.getElementById('adminTabOverview')) renderAdminDashboard();
};

// Hooked into closeCartSidebar
const recordAbandonedCart = (cartItems) => {
    const user = getCurrentUser();
    const data = getAdminData();
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    const clientKey = user ? user.email : "Visiteur non connecté";

    // Remove old cart for this user
    data.abandonedCarts = data.abandonedCarts.filter(c => c.client !== clientKey);
    
    const newCart = {
        id: 'ABN-' + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        client: clientKey,
        phone: user ? user.phone : null,
        items: cartItems.map(i => i.title).join(", "),
        total: total
    };

    // Save new cart
    data.abandonedCarts.unshift(newCart);

    saveAdminData(data);
    saveAbandonedCartToSupabase(newCart); // Cloud Sync
};

// Simulate Live Traffic for Demo
let liveVisitorInterval;
const simulateLiveTraffic = () => {
    const el = document.getElementById("adminLiveVisitors");
    if (!el) return;
    
    let base = Math.floor(Math.random() * 30) + 15;
    el.textContent = base;
    
    clearInterval(liveVisitorInterval);
    liveVisitorInterval = setInterval(() => {
        let fluctuation = Math.floor(Math.random() * 5) - 2; // -2 to +2
        base = Math.max(5, base + fluctuation);
        el.textContent = base;
        
        // Randomly simulate a new activity log
        if (Math.random() > 0.95) {
            addActivityLog("👁️ Un nouveau visiteur est sur la page 'Préparation Concours'.");
            renderActivityLog();
        }
    }, 4000);
};

// TODO: Intégrer une API de Web Analytics réelle (Plausible.io, Google Analytics 4, ou PostHog) pour alimenter le suivi des visiteurs en temps réel en production.

const TAB_TITLES = {
    overview: { title: "Vue d'Ensemble", subtitle: "Statistiques clés et performances de ventes en temps réel" },
    products: { title: "Gestion du Catalogue Produits", subtitle: "Gestion des fascicules, annales, cours PDF et formations" },
    visitors: { title: "Suivi du Trafic & Visiteurs", subtitle: "Mesures d'audience et fréquentation des pages du site" },
    orders: { title: "Historique des Commandes", subtitle: "Suivi des transactions Wave, Orange Money et WhatsApp" },
    customers: { title: "Répertoire des Clients & Étudiants", subtitle: "Base d'utilisateurs inscrits avec coordonnées sécurisées" },
    abandoned: { title: "Paniers Abandonnés", subtitle: "Relance des prospects n'ayant pas finalisé la commande" },
    analytics: { title: "Analytiques & Rapports", subtitle: "Graphiques de ventes par catégorie et top produits" },
    settings: { title: "Paramètres & Configuration Cloud", subtitle: "Configuration des contacts du site et identifiants Supabase" }
};

window.switchAdminTab = (tabId) => {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
    
    const tabEl = document.getElementById(`adminTab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
    if (tabEl) tabEl.classList.remove('hidden');

    const btn = document.querySelector(`.admin-nav-item[onclick="switchAdminTab('${tabId}')"]`);
    if (btn) btn.classList.add('active');

    const meta = TAB_TITLES[tabId] || TAB_TITLES['overview'];
    const titleEl = document.getElementById('adminCurrentTabTitle');
    const subTitleEl = document.getElementById('adminCurrentTabSubtitle');
    if (titleEl) titleEl.textContent = meta.title;
    if (subTitleEl) subTitleEl.textContent = meta.subtitle;

    if (tabId === 'products') renderAdminProducts();
    if (tabId === 'customers') renderAdminCustomers();
    if (tabId === 'analytics') renderAdminCharts();
};

const renderAdminProducts = () => {
    const tbody = document.getElementById("adminProductsTableBody");
    if (!tbody) return;

    const q = (document.getElementById("adminProductSearch")?.value || "").toLowerCase();
    const cat = document.getElementById("adminProductCategoryFilter")?.value || "all";

    let list = PRODUCTS;
    if (cat !== "all") {
        list = list.filter(p => p.category === cat || p.type === cat);
    }
    if (q) {
        list = list.filter(p => p.title.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)));
    }

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 3rem 1rem;">
                    <div style="font-size:3rem; color:var(--text-muted); margin-bottom:0.75rem;"><i class="fa-solid fa-box-open"></i></div>
                    <strong style="display:block; color:var(--blue-deep); font-size:1.1rem; margin-bottom:0.25rem;">Aucun produit pour le moment</strong>
                    <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">Aucun produit ne correspond à votre recherche ou votre catalogue est vide.</p>
                    <button class="btn-primary" onclick="openAdminModal()">+ Ajouter un Produit</button>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => {
        const imgStyle = p.image ? `<img src="${p.image}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">` : `<span style="font-size:1.5rem;">${p.icon || '📄'}</span>`;
        return `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        ${imgStyle}
                        <div>
                            <strong style="color:var(--blue-deep); font-size:0.9rem; display:block;">${sanitizeHTML(p.title)}</strong>
                            <span style="font-size:0.75rem; color:var(--text-muted);">${p.typeName || p.type}</span>
                        </div>
                    </div>
                </td>
                <td><span class="product-cat-label ${p.catLabel || 'cat-lbl-admin'}" style="font-size:0.75rem;">${p.catName || p.category}</span></td>
                <td><strong style="color:var(--orange-dark);">${formatPrice(p.price)}</strong></td>
                <td><span style="background:#dcfce7; color:#15803d; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:700;">Actif</span></td>
                <td><span style="font-weight:600; font-size:0.85rem;">${Math.floor(Math.random() * 30) + 5} ventes</span></td>
                <td>
                    <div style="display:flex; gap:0.4rem;">
                        <button class="btn-secondary btn-sm" onclick="editAdminProduct('${p.id}')" title="Modifier"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-secondary btn-sm" onclick="deleteAdminProduct('${p.id}')" title="Supprimer" style="color:#ef4444;"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
};

const openAdminModal = (prodId = null) => {
    const overlay = document.getElementById("adminModalOverlay");
    const modal = document.getElementById("adminModal");
    const form = document.getElementById("adminProductForm");
    if (!overlay || !modal || !form) return;

    form.reset();
    document.getElementById("adminProdId").value = "";

    if (prodId) {
        const p = PRODUCTS.find(prod => prod.id == prodId);
        if (p) {
            document.getElementById("adminProdId").value = p.id;
            document.getElementById("adminProdTitle").value = p.title || "";
            document.getElementById("adminProdType").value = p.type || "fascicule";
            document.getElementById("adminProdCategory").value = p.category || "administration";
            document.getElementById("adminProdPrice").value = p.price || 0;
            document.getElementById("adminProdContent").value = p.content || "";
            document.getElementById("adminProdImage").value = p.image || "";
            document.getElementById("adminProdDesc").value = p.desc || "";
        }
    }

    overlay.classList.add("show");
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
};

const closeAdminModal = () => {
    const overlay = document.getElementById("adminModalOverlay");
    const modal = document.getElementById("adminModal");
    if (overlay && modal) {
        overlay.classList.remove("show");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }
};

const deleteAdminProduct = (id) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit du catalogue ?")) {
        PRODUCTS = PRODUCTS.filter(p => p.id != id);
        saveProducts();
        renderAdminProducts();
        showToast("🗑️", "Produit supprimé du catalogue avec succès.");
    }
};

const editAdminProduct = (id) => {
    openAdminModal(id);
};

window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.deleteAdminProduct = deleteAdminProduct;
window.editAdminProduct = editAdminProduct;

const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const renderActivityLog = () => {
    const logEl = document.getElementById("adminActivityLog");
    if (!logEl) return;
    const data = getAdminData();
    logEl.innerHTML = data.activityLog.length === 0 
        ? `<li style="color:var(--text-muted); font-size:0.9rem;">Aucune activité récente.</li>` 
        : data.activityLog.map(log => `
            <li class="admin-log-item">
                <span style="font-size: 0.9rem;">${log.msg}</span>
                <span style="font-size: 0.8rem; color: var(--text-light);">${formatDate(log.time)}</span>
            </li>
        `).join("");
};

const maskEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) return email || '';
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.slice(0, 2)}***${name.slice(-1)}@${domain}`;
};

const maskPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return phone || '';
    const cleaned = phone.trim();
    if (cleaned.length < 6) return cleaned;
    return `${cleaned.slice(0, 5)} *** ${cleaned.slice(-2)}`;
};

const renderAdminCustomers = () => {
    const tbody = document.getElementById("adminUsersTableBody");
    if (!tbody) return;
    const users = getUsers();

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding: 2.5rem 1rem;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">👥</div>
                    <strong style="display:block; color:var(--blue-deep); font-size:1rem; margin-bottom:0.25rem;">Aucun client inscrit pour le moment</strong>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Les nouveaux comptes créés s'afficheront ici avec leurs coordonnées protégées.</span>
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = users.map(u => {
        const maskedEmail = maskEmail(u.email);
        const maskedPhone = maskPhone(u.phone);
        const waLink = u.phone ? `https://wa.me/${u.phone.replace(/[^0-9+]/g, '')}` : "#";

        return `
            <tr>
                <td style="font-weight:600; color:var(--blue-deep);">${sanitizeHTML(u.firstName || '')} ${sanitizeHTML(u.lastName || '')}</td>
                <td style="font-size:0.85rem;"><code>${sanitizeHTML(maskedEmail)}</code></td>
                <td style="font-size:0.85rem;"><code>${sanitizeHTML(maskedPhone)}</code></td>
                <td><span style="background:${u.isSubscribed ? '#dcfce7' : '#f1f5f9'}; color:${u.isSubscribed ? '#15803d' : '#475569'}; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:700;">${u.isSubscribed ? '⭐ Premium' : 'Gratuit'}</span></td>
                <td>
                    ${u.phone ? `<a href="${waLink}" target="_blank" class="btn-secondary btn-sm" style="padding:0.3rem 0.6rem; font-size:0.75rem;">💬 Contacter</a>` : '-'}
                </td>
            </tr>
        `;
    }).join("");
};

const renderAdminDashboard = () => {
    const data = getAdminData();
    const users = getUsers();
    
    // Overview Totals
    const totalRevenue = data.orders.reduce((sum, o) => sum + o.total, 0);
    if(document.getElementById("adminTotalRevenue")) document.getElementById("adminTotalRevenue").textContent = formatPrice(totalRevenue);
    if(document.getElementById("adminTotalOrders")) document.getElementById("adminTotalOrders").textContent = data.orders.length;
    if(document.getElementById("adminTotalAbandoned")) document.getElementById("adminTotalAbandoned").textContent = data.abandonedCarts.length;
    if(document.getElementById("adminTotalUsers")) document.getElementById("adminTotalUsers").textContent = users.length;
    
    // Activity Log
    renderActivityLog();
    
    // Render Customers Tab
    renderAdminCustomers();

    // Orders Table (With Masking & Empty State)
    const ordersTbody = document.getElementById("adminOrdersTableBody");
    if (ordersTbody) {
        ordersTbody.innerHTML = data.orders.length === 0 
            ? `<tr>
                <td colspan="5" style="text-align:center; padding: 2.5rem 1rem;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">🛍️</div>
                    <strong style="display:block; color:var(--blue-deep); font-size:1rem; margin-bottom:0.25rem;">Aucune commande enregistrée</strong>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Les commandes validées via le panier s'afficheront ici en temps réel.</span>
                </td>
              </tr>`
            : data.orders.map(o => `
                <tr>
                    <td style="font-size:0.85rem; color:var(--text-muted);">${formatDate(o.date)}</td>
                    <td style="font-weight:600; color:var(--blue-deep);">${sanitizeHTML(o.client)}</td>
                    <td style="font-size:0.85rem;">${sanitizeHTML(o.items)}</td>
                    <td style="font-weight:700; color:var(--orange-dark);">${formatPrice(o.total)}</td>
                    <td><span style="background:#fef3c7; color:#d97706; padding:0.2rem 0.6rem; border-radius:20px; font-size:0.75rem; font-weight:700;">${o.status}</span></td>
                </tr>
            `).join("");
    }

    // Abandoned Carts Table (With Masking & Empty State)
    const abandonedTbody = document.getElementById("adminAbandonedTableBody");
    if (abandonedTbody) {
        abandonedTbody.innerHTML = data.abandonedCarts.length === 0 
            ? `<tr>
                <td colspan="5" style="text-align:center; padding: 2.5rem 1rem;">
                    <div style="font-size:2.5rem; margin-bottom:0.5rem;">🛒</div>
                    <strong style="display:block; color:var(--blue-deep); font-size:1rem; margin-bottom:0.25rem;">Aucun panier abandonné</strong>
                    <span style="font-size:0.85rem; color:var(--text-muted);">Les paniers non finalisés apparaîtront ici pour relance automatique.</span>
                </td>
              </tr>`
            : data.abandonedCarts.map(c => {
                const maskedClient = c.client.includes('@') ? maskEmail(c.client) : c.client;
                const waLink = c.phone ? `https://wa.me/${c.phone}?text=${encodeURIComponent(`Bonjour, nous avons remarqué que vous avez laissé des fascicules très importants dans votre panier sur SK ACADEMIA. Pouvons-nous vous aider à finaliser votre préparation ?`)}` : "#";
                return `
                <tr>
                    <td style="font-size:0.85rem; color:var(--text-muted);">${formatDate(c.date)}</td>
                    <td style="font-weight:600;">${sanitizeHTML(maskedClient)}</td>
                    <td style="font-size:0.85rem;">${sanitizeHTML(c.items)}</td>
                    <td style="font-weight:700;">${formatPrice(c.total)}</td>
                    <td>
                        ${c.phone 
                            ? `<a href="${waLink}" target="_blank" style="background:#25D366; color:white; padding:0.4rem 0.8rem; border-radius:6px; font-size:0.8rem; font-weight:600; display:inline-block;">📲 Relancer</a>` 
                            : `<span style="color:var(--text-light); font-size:0.8rem;">Sans téléphone</span>`}
                    </td>
                </tr>
            `}).join("");
    }
};

// Chart.js Rendering
let chartInstances = {};
const renderAdminCharts = () => {
    if (typeof Chart === 'undefined') return;
    
    const data = getAdminData();
    const today = new Date();
    const labels = [];
    const revData = [];
    const orderData = [];
    const visitorData = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        
        labels.push(label);
        const dayStats = data.dailyStats[key] || { revenue: 0, orders: 0, visitors: Math.floor(Math.random() * 20) + 5 }; // fallback dummy visitors
        revData.push(dayStats.revenue);
        orderData.push(dayStats.orders);
        visitorData.push(dayStats.visitors);
    }

    // Revenue Chart
    const ctxRev = document.getElementById('revenueChart');
    if (ctxRev) {
        if (chartInstances['rev']) chartInstances['rev'].destroy();
        chartInstances['rev'] = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Chiffre d\'Affaires (FCFA)',
                    data: revData,
                    borderColor: '#f5a623',
                    backgroundColor: 'rgba(245, 166, 35, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // Traffic vs Orders Chart
    const ctxTraf = document.getElementById('trafficChart');
    if (ctxTraf) {
        if (chartInstances['traf']) chartInstances['traf'].destroy();
        chartInstances['traf'] = new Chart(ctxTraf, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Visiteurs Uniques',
                        data: visitorData,
                        backgroundColor: '#e8f0fe',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    },
                    {
                        label: 'Commandes',
                        data: orderData,
                        backgroundColor: '#102a4a',
                        borderWidth: 0
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};

// Initialize Dashboard if user is admin
document.addEventListener("DOMContentLoaded", () => {
    loadDatabase();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof loadSiteConfig === 'function') loadSiteConfig();
    
    const settingsForm = document.getElementById("adminSettingsForm");
    if (settingsForm) {
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newPhone = document.getElementById("settingWhatsApp").value;
            const newConfig = {
                phone: newPhone.startsWith('+') ? newPhone : '+' + newPhone,
                email: document.getElementById("settingEmail").value,
                address: document.getElementById("settingAddress").value
            };
            localStorage.setItem('sk_site_config', JSON.stringify(newConfig));
            loadSiteConfig();
            showToast("✅", "Paramètres enregistrés avec succès !");
        });
    }

    // Gestion du formulaire Supabase
    const supabaseForm = document.getElementById("adminSupabaseForm");
    if (supabaseForm) {
        const urlInput = document.getElementById("settingSupabaseUrl");
        const keyInput = document.getElementById("settingSupabaseKey");
        if (urlInput) urlInput.value = localStorage.getItem('sk_supabase_url') || '';
        if (keyInput) keyInput.value = localStorage.getItem('sk_supabase_key') || '';

        supabaseForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const newUrl = urlInput.value.trim();
            const newKey = keyInput.value.trim();
            localStorage.setItem('sk_supabase_url', newUrl);
            localStorage.setItem('sk_supabase_key', newKey);

            showToast("⏳", "Vérification de la connexion Supabase...");
            const ok = await testSupabaseConnection();
            if (ok) {
                showToast("⚡", "Clés Supabase enregistrées ! Synchronisation de la base...");
                await loadDatabase();
            } else {
                showToast("⚠️", "Clés enregistrées mais la connexion a échoué. Vérifiez vos clés et règles RLS.");
            }
        });
    }

    // Product search & filter in Admin
    const searchInput = document.getElementById("adminProductSearch");
    const catFilter = document.getElementById("adminProductCategoryFilter");
    if (searchInput) searchInput.addEventListener("input", renderAdminProducts);
    if (catFilter) catFilter.addEventListener("change", renderAdminProducts);

    // Product Modal Form Submission
    const productForm = document.getElementById("adminProductForm");
    const adminModalClose = document.getElementById("adminModalClose");
    const adminModalOverlay = document.getElementById("adminModalOverlay");

    if (adminModalClose) adminModalClose.addEventListener("click", closeAdminModal);
    if (adminModalOverlay) adminModalOverlay.addEventListener("click", closeAdminModal);

    if (productForm) {
        productForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = document.getElementById("adminProdId").value;
            const title = document.getElementById("adminProdTitle").value.trim();
            const type = document.getElementById("adminProdType").value;
            const category = document.getElementById("adminProdCategory").value;
            const price = parseInt(document.getElementById("adminProdPrice").value) || 0;
            const content = document.getElementById("adminProdContent").value.trim();
            const image = document.getElementById("adminProdImage").value.trim();
            const desc = document.getElementById("adminProdDesc").value.trim();

            const typeNames = { fascicule: "Fascicule", annale: "Annale", cours: "Cours PDF", formation: "Formation", pack: "Pack" };
            const catNames = {
                administration: "Administration & Justice",
                securite: "Sécurité & Défense",
                douane: "Douanes Sénégalaises",
                sante: "Santé & Social",
                "grandes-ecoles": "Grandes Écoles",
                enseignement: "Enseignement (FASTEF)",
                formation: "Informatique & Web"
            };

            if (id) {
                // Update existing
                const idx = PRODUCTS.findIndex(p => p.id == id);
                if (idx > -1) {
                    PRODUCTS[idx] = {
                        ...PRODUCTS[idx],
                        title, type, category, price, content, image, desc,
                        typeName: typeNames[type] || type,
                        catName: catNames[category] || category
                    };
                }
            } else {
                // Create new
                const newProd = {
                    id: Date.now(),
                    type,
                    category,
                    icon: type === 'formation' ? '🎓' : (type === 'annale' ? '📜' : '📋'),
                    bg: "bg-admin",
                    catLabel: "cat-lbl-admin",
                    catName: catNames[category] || category,
                    title,
                    desc,
                    price,
                    typeName: typeNames[type] || type,
                    image: image || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop",
                    content
                };
                PRODUCTS.unshift(newProd);
            }

            saveProducts();
            renderAdminProducts();
            closeAdminModal();
            showToast("💾", "Produit enregistré avec succès !");
        });
    }

    // Hook into SPA navigation to detect admin route
    const originalNavigateTo = window.navigateTo || navigateTo;
    window.navigateTo = (hash) => {
        originalNavigateTo(hash);
        let target = hash.replace("#", "") || "accueil";
        if (target === 'admin') {
            const user = getCurrentUser();
            if (!user || user.email.toLowerCase() !== 'admin@skacademia.sn') {
                showToast("⛔", "Accès refusé. Réservé à l'administrateur.");
                window.navigateTo("accueil");
                return;
            }
            renderAdminDashboard();
            simulateLiveTraffic();
            if (document.getElementById('adminTabAnalytics') && !document.getElementById('adminTabAnalytics').classList.contains('hidden')) {
                renderAdminCharts();
            }
        } else {
            clearInterval(liveVisitorInterval);
        }
    };
});

// Initial render (Immediate execution)
if (typeof renderProducts === 'function') renderProducts();
if (typeof renderAdminProducts === 'function') renderAdminProducts();
if (typeof renderStudentDashboard === 'function') renderStudentDashboard();
