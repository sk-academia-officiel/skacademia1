/* ============================================
   SK ACADEMIA — app.js
   Logique complète : catalogue, panier, quiz
   ============================================ */

// ============================
//  BASE DE DONNÉES — PRODUITS
// ============================
const PRODUCTS = [
    // ADMINISTRATION & JUSTICE
    {
        id: 1, type: "fascicule", category: "administration",
        icon: "📋", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Fascicule Complet — Concours ENA Sénégal",
        desc: "Toutes les matières : culture générale, droit administratif, économie, rédaction administrative.",
        price: 12000,
        typeName: "Fascicule"
    },
    {
        id: 2, type: "annale", category: "administration",
        icon: "📜", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Annales Corrigées ENA — 10 ans",
        desc: "10 années d'annales corrigées avec méthodologie et conseils de réussite.",
        price: 8000,
        typeName: "Annale"
    },
    {
        id: 3, type: "fascicule", category: "administration",
        icon: "⚖️", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Fascicule Concours Magistrat",
        desc: "Procédure pénale, procédure civile, droit constitutionnel et questions d'actualité juridique.",
        price: 15000,
        typeName: "Fascicule"
    },
    {
        id: 4, type: "cours", category: "administration",
        icon: "📖", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Cours PDF — Droit Administratif Sénégalais",
        desc: "Cours complet et structuré pour maîtriser le droit administratif national.",
        price: 5000,
        typeName: "Cours PDF"
    },
    {
        id: 5, type: "fascicule", category: "administration",
        icon: "🗂️", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Pack CREM — Toutes Spécialités",
        desc: "Pack complet pour le CREM : cours, fiches, annales et exercices pour toutes les spécialités.",
        price: 18000,
        typeName: "Pack"
    },
    {
        id: 6, type: "fascicule", category: "administration",
        icon: "⚖️", bg: "bg-admin", catLabel: "cat-lbl-admin",
        catName: "Administration & Justice",
        title: "Fascicule Concours Greffier",
        desc: "Préparation ciblée : organisation judiciaire, procédure, culture juridique et rédaction.",
        price: 10000,
        typeName: "Fascicule"
    },

    // SÉCURITÉ & DÉFENSE
    {
        id: 7, type: "fascicule", category: "securite",
        icon: "👮", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Fascicule — Concours Police Nationale",
        desc: "Culture générale, dictée, QCM logique, math, et préparation aux épreuves physiques.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 8, type: "annale", category: "securite",
        icon: "📜", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Annales Police Nationale — 8 ans",
        desc: "8 années d'épreuves corrigées avec les critères de notation officiels.",
        price: 7000,
        typeName: "Annale"
    },
    {
        id: 9, type: "fascicule", category: "securite",
        icon: "🪖", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Fascicule — Concours Gendarmerie Nationale",
        desc: "Préparation complète pour la gendarmerie : épreuves écrites et guide physique.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 10, type: "fascicule", category: "securite",
        icon: "🛃", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Fascicule — Concours Douanes Sénégalaises",
        desc: "Économie, droit douanier, mathématiques et culture générale pour les douanes.",
        price: 12000,
        typeName: "Fascicule"
    },
    {
        id: 11, type: "fascicule", category: "securite",
        icon: "⭐", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Fascicule — Concours ENSOA",
        desc: "Toutes les épreuves de l'ENSOA : sciences, mathématiques, culture générale et discipline militaire.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 12, type: "cours", category: "securite",
        icon: "📖", bg: "bg-secu", catLabel: "cat-lbl-secu",
        catName: "Sécurité & Défense",
        title: "Cours PDF — Culture Générale Sécurité",
        desc: "Cours de culture générale axé sur les thèmes abordés dans les concours de la sécurité.",
        price: 4000,
        typeName: "Cours PDF"
    },

    // SANTÉ & SOCIAL
    {
        id: 13, type: "fascicule", category: "sante",
        icon: "🤱", bg: "bg-sante", catLabel: "cat-lbl-sante",
        catName: "Santé & Social",
        title: "Fascicule — Concours Sage-femme",
        desc: "Biologie, chimie, sciences naturelles, physique et test psychotechnique pour le concours sage-femme.",
        price: 12000,
        typeName: "Fascicule"
    },
    {
        id: 14, type: "annale", category: "sante",
        icon: "📜", bg: "bg-sante", catLabel: "cat-lbl-sante",
        catName: "Santé & Social",
        title: "Annales Corrigées — Concours Sage-femme",
        desc: "5 années d'annales avec corrections détaillées et barèmes officiels.",
        price: 7000,
        typeName: "Annale"
    },
    {
        id: 15, type: "fascicule", category: "sante",
        icon: "🏃", bg: "bg-sante", catLabel: "cat-lbl-sante",
        catName: "Santé & Social",
        title: "Fascicule — Concours INSEPS",
        desc: "Sciences de l'éducation physique, biologie humaine, anatomie et culture générale.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 16, type: "fascicule", category: "sante",
        icon: "🏥", bg: "bg-sante", catLabel: "cat-lbl-sante",
        catName: "Santé & Social",
        title: "Fascicule — Concours UDES",
        desc: "Préparation ciblée pour le concours UDES avec toutes les matières au programme.",
        price: 10000,
        typeName: "Fascicule"
    },

    // GRANDES ÉCOLES
    {
        id: 17, type: "fascicule", category: "grandes-ecoles",
        icon: "📐", bg: "bg-ecole", catLabel: "cat-lbl-ecole",
        catName: "Grandes Écoles",
        title: "Fascicule — Polytechnique de Thiès (EPT)",
        desc: "Mathématiques, physique, chimie et problèmes de sciences de l'ingénieur. Niveau avancé.",
        price: 18000,
        typeName: "Fascicule"
    },
    {
        id: 18, type: "annale", category: "grandes-ecoles",
        icon: "📜", bg: "bg-ecole", catLabel: "cat-lbl-ecole",
        catName: "Grandes Écoles",
        title: "Annales EPT — Mathématiques & Physique",
        desc: "10 ans d'épreuves corrigées de mathématiques et physique pour l'EPT.",
        price: 12000,
        typeName: "Annale"
    },
    {
        id: 19, type: "fascicule", category: "grandes-ecoles",
        icon: "🏗️", bg: "bg-ecole", catLabel: "cat-lbl-ecole",
        catName: "Grandes Écoles",
        title: "Fascicule — Polytechnique de Dakar (ESP)",
        desc: "Préparation complète pour l'ESP : maths, physique, chimie et informatique.",
        price: 18000,
        typeName: "Fascicule"
    },
    {
        id: 20, type: "cours", category: "grandes-ecoles",
        icon: "📖", bg: "bg-ecole", catLabel: "cat-lbl-ecole",
        catName: "Grandes Écoles",
        title: "Cours PDF — Mathématiques Niveau Concours",
        desc: "Algèbre, analyse, probabilités et géométrie au niveau des concours de grandes écoles.",
        price: 8000,
        typeName: "Cours PDF"
    },

    // ENSEIGNEMENT
    {
        id: 21, type: "fascicule", category: "enseignement",
        icon: "📚", bg: "bg-teach", catLabel: "cat-lbl-teach",
        catName: "Enseignement",
        title: "Pack FASTEF — Toutes Spécialités",
        desc: "Préparation complète au concours FASTEF : toutes les spécialités couvertes avec cours et exercices.",
        price: 20000,
        typeName: "Pack"
    },
    {
        id: 22, type: "fascicule", category: "enseignement",
        icon: "🧮", bg: "bg-teach", catLabel: "cat-lbl-teach",
        catName: "Enseignement",
        title: "Fascicule FASTEF — Mathématiques",
        desc: "Spécialité maths : cours, exercices et annales pour le concours FASTEF.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 23, type: "fascicule", category: "enseignement",
        icon: "🔤", bg: "bg-teach", catLabel: "cat-lbl-teach",
        catName: "Enseignement",
        title: "Fascicule FASTEF — Lettres & Français",
        desc: "Spécialité lettres : grammaire, littérature, composition et rédaction pédagogique.",
        price: 10000,
        typeName: "Fascicule"
    },
    {
        id: 24, type: "cours", category: "enseignement",
        icon: "📖", bg: "bg-teach", catLabel: "cat-lbl-teach",
        catName: "Enseignement",
        title: "Cours PDF — Méthodologie Pédagogique",
        desc: "Fiches de préparation de leçons, techniques d'enseignement et outils didactiques.",
        price: 5000,
        typeName: "Cours PDF"
    },

    // FORMATIONS DIGITALES
    {
        id: 25, type: "formation", category: "formation",
        icon: "💻", bg: "bg-form", catLabel: "cat-lbl-form",
        catName: "Formations Digitales",
        title: "Formation — Maîtriser l'IA en 2026",
        desc: "ChatGPT, Gemini, Copilot, automatisation, prompting avancé et cas pratiques pour professionnels.",
        price: 50000,
        typeName: "Formation"
    },
    {
        id: 26, type: "formation", category: "formation",
        icon: "🌐", bg: "bg-form", catLabel: "cat-lbl-form",
        catName: "Formations Digitales",
        title: "Formation — Développeur Web Full-Stack",
        desc: "HTML, CSS, JavaScript, Node.js, base de données et déploiement de A à Z.",
        price: 75000,
        typeName: "Formation"
    },
    {
        id: 27, type: "formation", category: "formation",
        icon: "📊", bg: "bg-form", catLabel: "cat-lbl-form",
        catName: "Formations Digitales",
        title: "Formation — Excel & Bureautique Avancée",
        desc: "Excel, Word, PowerPoint et outils Google Workspace pour la productivité professionnelle.",
        price: 25000,
        typeName: "Formation"
    },
];

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
//  LOADER
// ==================
window.addEventListener("load", () => {
    setTimeout(() => {
        loader.classList.add("fade-out");
    }, 1500);
});

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
    "dashboard": ["dashboard"],           // NEW: Espace étudiant
    "course": ["course"]                  // NEW: Course player
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
        const href = link.getAttribute("href");
        if (href !== "#") {
            e.preventDefault();
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
const showToast = (icon = "✅", msg = "Action effectuée") => {
    toastIcon.textContent = icon;
    toastMsg.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
};

// ==================
//  PAYMENT SIMULATION
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
    showToast("⏳", `Initialisation du paiement ${method}... Veuillez confirmer sur votre téléphone.`, 5000);
    
    setTimeout(() => {
        cart = []; // Empty cart
        renderCart();
        closeCartSidebar();
        showToast("✅", `Paiement ${method} réussi ! Retrouvez vos achats dans votre Dashboard.`);
        
        // Redirect to dashboard after a delay
        setTimeout(() => {
            history.pushState(null, null, "#dashboard");
            navigateTo("#dashboard");
        }, 2000);
    }, 4000);
};

// ==================
//  RENDER PRODUCTS
// ==================
const CAT_IMAGES = {
    "administration": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop", 
    "douane": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600&auto=format&fit=crop", 
    "sante": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop", 
    "grandes-ecoles": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop", 
    "enseignement": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop", 
    "formation": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop", 
};
PRODUCTS.forEach(p => p.image = CAT_IMAGES[p.category] || "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop");

const getFilteredProducts = () => {
    let list = PRODUCTS;
    if (currentFilter !== "all") {
        list = list.filter(p => p.category === currentFilter || p.type === currentFilter);
    }
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.catName.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q)
        );
    }
    return list;
};

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
                <span class="product-cat-label ${p.catLabel}">${p.catName}</span>
                <h3 class="product-title">${p.title}</h3>
                <p class="product-desc">${p.desc}</p>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(p.price)}</span>
                    <button class="btn-add" data-id="${p.id}">🛒 Ajouter au Panier</button>
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

// Get users from localStorage
const getUsers = () => {
    try {
        return JSON.parse(localStorage.getItem("sk_academia_users")) || [];
    } catch { return []; }
};

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
registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    registerError.classList.add("hidden");

    const firstName = document.getElementById("regFirstName").value.trim();
    const lastName = document.getElementById("regLastName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("regConfirmPassword").value;
    const acceptTerms = document.getElementById("acceptTerms").checked;

    // Validation
    if (!firstName || !lastName || !email || !password) {
        showAuthError(registerError, "Veuillez remplir tous les champs obligatoires.");
        return;
    }
    if (password.length < 6) {
        showAuthError(registerError, "Le mot de passe doit contenir au moins 6 caractères.");
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

    // Create user
    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        phone,
        password, // Note: In production, this should be hashed
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    // Show success
    authModal.querySelector(".auth-tabs").style.display = "none";
    registerForm.classList.add("hidden");
    loginForm.classList.add("hidden");
    authModal.querySelector(".auth-footer").style.display = "none";
    
    const successDiv = document.createElement("div");
    successDiv.className = "auth-success";
    successDiv.innerHTML = `
        <span class="success-icon">🎉</span>
        <h3>Bienvenue, ${firstName} !</h3>
        <p>Votre compte a été créé avec succès.</p>
    `;
    authModal.appendChild(successDiv);

    setTimeout(() => {
        closeAuthModal();
        // Clean up success message
        successDiv.remove();
        authModal.querySelector(".auth-tabs").style.display = "";
        authModal.querySelector(".auth-footer").style.display = "";
        registerForm.reset();
        updateAuthUI();
        updateGatedSections();
        showToast("🎉", `Bienvenue sur SK ACADEMIA, ${firstName} !`);
    }, 2000);
});

// LOGIN
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.classList.add("hidden");

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showAuthError(loginError, "Veuillez remplir tous les champs.");
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showAuthError(loginError, "E-mail ou mot de passe incorrect.");
        return;
    }

    setCurrentUser(user);
    closeAuthModal();
    loginForm.reset();
    updateAuthUI();
    updateGatedSections();
    showToast("👋", `Bon retour, ${user.firstName} !`);
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
        if (!document.getElementById("btnGoDashboard")) {
            // Insert it right after the header
            const btnDash = document.createElement("button");
            btnDash.className = "user-dropdown-item";
            btnDash.id = "btnGoDashboard";
            btnDash.innerHTML = "📊 Mon Dashboard (Espace Membre)";
            btnDash.onclick = () => {
                history.pushState(null, null, "#dashboard");
                navigateTo("#dashboard");
                // Close dropdown manually
                userDropdown.classList.remove("show");
            };
            const header = userDropdown.querySelector(".user-dropdown-header");
            header.insertAdjacentElement("afterend", btnDash);
        }
    } else {
        // Not logged in
        btnLoginNav.style.display = "";
        userProfileNav.classList.add("hidden");
    }
};

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
renderProducts();
renderFormations();
renderDocuments();
renderCart();
updateAuthUI();
updateGatedSections();

// Initialize SPA routing based on current URL hash
navigateTo(window.location.hash);

// Run scroll reveal
setTimeout(setupScrollReveal, 100);

// ==================
//  CHATBOT IA
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
    });

    chatbotClose.addEventListener("click", () => {
        chatbotWindow.classList.remove("open");
    });

    const chatbotKeywords = [
        { keys: ["prix", "combien", "tarif", "coût"], reply: "Nos fascicules varient entre 5 000 FCFA et 20 000 FCFA. Vous pouvez payer par Wave ou Orange Money dans la boutique." },
        { keys: ["concours", "préparer", "examen"], reply: "Nous préparons aux concours de l'État : ENA, Police, Gendarmerie, Santé, FASTEF, EPT, etc. Rendez-vous dans la rubrique 'Préparation Concours' pour choisir votre domaine." },
        { keys: ["bonjour", "salut", "bonsoir"], reply: "Bonjour ! Comment puis-je vous aider dans vos révisions aujourd'hui ?" },
        { keys: ["contact", "appeler", "téléphone"], reply: "Vous pouvez nous joindre par WhatsApp grâce au bouton vert flottant juste à côté de moi !" },
        { keys: ["connexion", "compte", "inscription"], reply: "Pour accéder à vos formations, cliquez sur 'Connexion' dans le menu. L'inscription est rapide et gratuite !" }
    ];

    const getChatbotReply = (msg) => {
        const text = msg.toLowerCase();
        for (const item of chatbotKeywords) {
            if (item.keys.some(key => text.includes(key))) {
                return item.reply;
            }
        }
        return "Je suis l'assistant virtuel SK ACADEMIA. Pour des questions spécifiques sur le contenu ou le paiement, n'hésitez pas à télécharger nos brochures ou à nous contacter sur WhatsApp !";
    };

    const handleChatbotSend = () => {
        const msg = chatbotInput.value.trim();
        if (!msg) return;
        
        // User bubble
        const userDiv = document.createElement("div");
        userDiv.className = "chatbot-msg user";
        userDiv.textContent = msg;
        chatbotBody.appendChild(userDiv);
        chatbotInput.value = "";
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        
        // Typing indicator
        const typingDiv = document.createElement("div");
        typingDiv.className = "chatbot-msg bot chatbot-typing";
        typingDiv.innerHTML = "<span></span><span></span><span></span>";
        chatbotBody.appendChild(typingDiv);
        chatbotBody.scrollTop = chatbotBody.scrollHeight;
        
        // AI reply
        setTimeout(() => {
            typingDiv.remove();
            const botDiv = document.createElement("div");
            botDiv.className = "chatbot-msg bot";
            botDiv.textContent = getChatbotReply(msg);
            chatbotBody.appendChild(botDiv);
            chatbotBody.scrollTop = chatbotBody.scrollHeight;
        }, 1500);
    };

    chatbotSend.addEventListener("click", handleChatbotSend);
    chatbotInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleChatbotSend();
    });
}
