// SK ACADEMIA - Frontend Entry Point
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    // Layout
    app.innerHTML = `
        <nav class="navbar">
            <a href="/" class="brand">SK<span>ACADEMIA</span></a>
            <div class="nav-links">
                <a href="#catalogue">Catalogue</a>
                <a href="#dashboard">Espace Étudiant</a>
                <button class="btn btn-primary" id="loginBtn">Connexion</button>
            </div>
        </nav>

        <header class="hero">
            <h1>Préparation d'Excellence aux Concours</h1>
            <p>Accédez aux meilleurs fascicules, annales et cours pour réussir les concours de l'ENA, Police, Douanes et Santé au Sénégal.</p>
            <button class="btn btn-accent" style="font-size: 1.1rem; padding: 1rem 2rem;">Découvrir le Catalogue</button>
        </header>

        <main class="container">
            <h2 style="margin-bottom: 2rem; color: var(--blue-deep);">Nos Formations & Fascicules</h2>
            <div class="grid" id="productGrid">
                <!-- Products will be injected here -->
            </div>
        </main>
    `;

    // Fetch and render products from backend (or fallback to dummy for now)
    fetchProducts();
});

async function fetchProducts() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<p>Chargement des produits...</p>';

    try {
        // Fetch from backend
        const res = await fetch('http://localhost:3000/api/products');
        const data = await res.json();
        
        if (data.length === 0) {
            grid.innerHTML = '<p>Aucun produit disponible.</p>';
            return;
        }

        grid.innerHTML = data.map(p => `
            <div class="card">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${p.icon || '📚'}</div>
                <div class="card-title">${p.title}</div>
                <p style="color: var(--text-main); font-size: 0.95rem;">${p.desc}</p>
                <div class="card-price">${p.price} FCFA</div>
                <button class="btn btn-primary" style="width: 100%;">Ajouter au panier</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("Failed to load products:", error);
        grid.innerHTML = '<p style="color:red;">Erreur lors du chargement des produits.</p>';
    }
}
