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
                <button class="cart-btn" id="openCartBtn">🛒 Panier <span class="cart-badge" id="cartCount">0</span></button>
                <button class="btn btn-accent" id="supabaseConfigBtn" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">⚡ Supabase</button>
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

        <!-- Auth Modal -->
        <div class="modal-backdrop" id="authModal">
            <div class="modal">
                <div class="modal-header">
                    <h3 id="authTitle">Connexion</h3>
                    <button class="close-btn" id="closeModal">&times;</button>
                </div>
                <!-- Step 1: Email Input -->
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="authEmail" placeholder="votre@email.com" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;" id="loginSubmitBtn">Recevoir mon code OTP</button>
                </form>
                
                <!-- Step 2: OTP Input (Hidden initially) -->
                <form id="otpForm" style="display: none;">
                    <div class="form-group">
                        <label>Code OTP</label>
                        <input type="text" id="authOtp" placeholder="123456" required autocomplete="off" maxlength="6">
                    </div>
                    <button type="submit" class="btn btn-accent" style="width: 100%; margin-top: 1rem;" id="otpSubmitBtn">Vérifier et me connecter</button>
                </form>
            </div>
        </div>

        <!-- Supabase Modal -->
        <div class="modal-backdrop" id="supabaseModal">
            <div class="modal">
                <div class="modal-header">
                    <h3>⚡ Supabase Cloud</h3>
                    <button class="close-btn" id="closeSupabaseModal">&times;</button>
                </div>
                <form id="supabaseForm">
                    <div class="form-group">
                        <label>Supabase Project URL</label>
                        <input type="url" id="sbUrl" placeholder="https://xyz.supabase.co" required>
                    </div>
                    <div class="form-group">
                        <label>Supabase Anon / Service Key</label>
                        <input type="password" id="sbKey" placeholder="eyJhbGciOiJIUzI1NiIsIn..." required>
                    </div>
                    <button type="submit" class="btn btn-accent" style="width: 100%; margin-top: 1rem;" id="sbSubmitBtn">💾 Enregistrer & Connecter</button>
                </form>
            </div>
        </div>

        <!-- Cart Drawer Overlay -->
        <div class="cart-drawer-overlay" id="cartOverlay">
            <div class="cart-drawer">
                <div class="cart-header">
                    <h3>🛒 Votre Panier</h3>
                    <button class="close-btn" id="closeCartBtn">&times;</button>
                </div>
                <div class="cart-body" id="cartBody">
                    <p style="text-align: center; color: #64748b; margin-top: 2rem;">Votre panier est vide.</p>
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total :</span>
                        <span id="cartTotal">0 FCFA</span>
                    </div>
                    <button class="btn btn-accent" style="width: 100%; padding: 1rem; font-size: 1.05rem;" id="checkoutBtn">Commander via WhatsApp 💬</button>
                </div>
            </div>
        </div>

        <!-- Chatbot Seny Floating Widget -->
        <button class="chat-widget-btn" id="senyChatBtn" title="Discuter avec Seny">🤖</button>
        <div class="chat-widget-box" id="senyChatBox">
            <div class="chat-box-header">
                <div class="info">
                    <div class="chat-avatar">🤖</div>
                    <div>
                        <h4>Seny</h4>
                        <p>Conseiller SK ACADEMIA</p>
                    </div>
                </div>
                <button class="close-btn" id="closeSenyChat" style="color: white;">&times;</button>
            </div>
            <div class="chat-box-messages" id="senyChatMessages">
                <div class="chat-msg bot">
                    Bonjour ! 👋 Je suis Seny, votre conseiller SK ACADEMIA. Quelle préparation aux concours ou quelle formation informatique recherchez-vous aujourd'hui ?
                </div>
            </div>
            <div class="chat-typing-indicator" id="senyTyping">Seny est en train d'écrire...</div>
            <form class="chat-box-input" id="senyChatForm">
                <input type="text" id="senyInput" placeholder="Posez votre question à Seny..." autocomplete="off" required>
                <button type="submit">➔</button>
            </form>
        </div>
    `;

    // Fetch and render products from backend
    fetchProducts();
    
    // Check Auth & Supabase Status & Cart & Chatbot
    checkAuthState();
    checkSupabaseStatus();
    initCart();
    initSenyChatbot();

    // Supabase Modal Logic
    const supabaseConfigBtn = document.getElementById('supabaseConfigBtn');
    const supabaseModal = document.getElementById('supabaseModal');
    const closeSupabaseModal = document.getElementById('closeSupabaseModal');
    const supabaseForm = document.getElementById('supabaseForm');
    const sbUrlInput = document.getElementById('sbUrl');
    const sbKeyInput = document.getElementById('sbKey');

    // Pre-fill if present in LocalStorage
    if (localStorage.getItem('sk_supabase_url')) sbUrlInput.value = localStorage.getItem('sk_supabase_url');
    if (localStorage.getItem('sk_supabase_key')) sbKeyInput.value = localStorage.getItem('sk_supabase_key');

    supabaseConfigBtn.addEventListener('click', () => {
        supabaseModal.classList.add('active');
    });

    closeSupabaseModal.addEventListener('click', () => {
        supabaseModal.classList.remove('active');
    });

    supabaseModal.addEventListener('click', (e) => {
        if (e.target === supabaseModal) supabaseModal.classList.remove('active');
    });

    supabaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = sbUrlInput.value.trim();
        const key = sbKeyInput.value.trim();
        const btn = document.getElementById('sbSubmitBtn');
        btn.innerText = "Connexion...";
        btn.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/settings/supabase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, key })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('sk_supabase_url', url);
                localStorage.setItem('sk_supabase_key', key);
                alert("⚡ " + data.message);
                supabaseModal.classList.remove('active');
                checkSupabaseStatus();
                fetchProducts();
            } else {
                alert("⚠️ Erreur: " + data.error);
            }
        } catch (err) {
            alert("Erreur de connexion au serveur Backend");
        }
        btn.innerText = "💾 Enregistrer & Connecter";
        btn.disabled = false;
    });

    // Modal Logic
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');
    const otpForm = document.getElementById('otpForm');
    const authTitle = document.getElementById('authTitle');
    const emailInput = document.getElementById('authEmail');

    loginBtn.addEventListener('click', () => {
        // If already logged in, this button acts as Logout
        if (localStorage.getItem('token')) {
            localStorage.removeItem('token');
            checkAuthState();
            return;
        }
        authModal.classList.add('active');
        loginForm.style.display = 'block';
        otpForm.style.display = 'none';
        authTitle.innerText = "Connexion";
    });

    closeModal.addEventListener('click', () => {
        authModal.classList.remove('active');
    });

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const btn = document.getElementById('loginSubmitBtn');
        btn.innerText = "Génération...";
        btn.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            
            if (data.success) {
                // Show OTP form
                loginForm.style.display = 'none';
                otpForm.style.display = 'block';
                authTitle.innerText = "Saisir le Code";
                // Show mock code for demo (normally sent by email)
                alert("Pour le DEV, votre code est : " + data.dev_code);
            } else {
                alert(data.error || "Erreur serveur");
            }
        } catch (err) {
            alert("Erreur de connexion au serveur");
        }
        btn.innerText = "Recevoir mon code OTP";
        btn.disabled = false;
    });

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        const code = document.getElementById('authOtp').value;
        const btn = document.getElementById('otpSubmitBtn');
        btn.innerText = "Vérification...";
        btn.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                authModal.classList.remove('active');
                checkAuthState();
                alert("Connexion réussie !");
            } else {
                alert(data.error || "Code invalide");
            }
        } catch (err) {
            alert("Erreur de connexion au serveur");
        }
        btn.innerText = "Vérifier et me connecter";
        btn.disabled = false;
    });
});

function checkAuthState() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('loginBtn');
    if (token) {
        loginBtn.innerText = "Déconnexion";
        loginBtn.classList.remove('btn-primary');
        loginBtn.classList.add('btn-accent');
    } else {
        loginBtn.innerText = "Connexion";
        loginBtn.classList.add('btn-primary');
        loginBtn.classList.remove('btn-accent');
    }
}

async function checkSupabaseStatus() {
    const btn = document.getElementById('supabaseConfigBtn');
    if (!btn) return;
    try {
        const res = await fetch('http://localhost:3000/api/settings/supabase');
        const data = await res.json();
        if (data.active) {
            btn.innerText = "⚡ Supabase (Connecté)";
            btn.style.background = "#10b981"; // green
        } else {
            btn.innerText = "⚡ Supabase (Déconnecté)";
            btn.style.background = "var(--orange)";
        }
    } catch (e) {
        btn.innerText = "⚡ Supabase";
    }
}

let CART = JSON.parse(localStorage.getItem('sk_cart') || '[]');

function initCart() {
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const checkoutBtn = document.getElementById('checkoutBtn');

    openCartBtn.addEventListener('click', () => {
        cartOverlay.classList.add('active');
        renderCart();
    });

    closeCartBtn.addEventListener('click', () => {
        cartOverlay.classList.remove('active');
    });

    cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) cartOverlay.classList.remove('active');
    });

    checkoutBtn.addEventListener('click', () => {
        if (CART.length === 0) {
            alert("Votre panier est vide !");
            return;
        }
        let total = CART.reduce((sum, item) => sum + item.price * item.qty, 0);
        let text = "Bonjour SK ACADEMIA, je souhaite commander :\n\n";
        CART.forEach(item => {
            text += `• ${item.title} (x${item.qty}) - ${item.price * item.qty} FCFA\n`;
        });
        text += `\n*TOTAL : ${total} FCFA*`;
        
        const phone = "221765749343";
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
    });

    renderCart();
}

function addToCart(product) {
    const existing = CART.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        CART.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
    }
    localStorage.setItem('sk_cart', JSON.stringify(CART));
    renderCart();
    document.getElementById('cartOverlay').classList.add('active');
}

function removeFromCart(id) {
    CART = CART.filter(item => item.id !== id);
    localStorage.setItem('sk_cart', JSON.stringify(CART));
    renderCart();
}

function renderCart() {
    const cartBody = document.getElementById('cartBody');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    const totalQty = CART.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = CART.reduce((sum, item) => sum + item.price * item.qty, 0);

    cartCount.innerText = totalQty;
    cartTotal.innerText = totalPrice.toLocaleString() + ' FCFA';

    if (CART.length === 0) {
        cartBody.innerHTML = '<p style="text-align: center; color: #64748b; margin-top: 2rem;">Votre panier est vide.</p>';
        return;
    }

    cartBody.innerHTML = CART.map(item => `
        <div class="cart-item">
            <div>
                <div class="cart-item-title">${item.title}</div>
                <div style="font-size: 0.85rem; color: #64748b;">Quantité : ${item.qty}</div>
            </div>
            <div style="text-align: right;">
                <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} FCFA</div>
                <button onclick="window.removeFromCart(${item.id})" style="background:none; border:none; color:red; cursor:pointer; font-size:0.8rem; margin-top:0.3rem;">Supprimer</button>
            </div>
        </div>
    `).join('');
}

window.removeFromCart = removeFromCart;

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

        window._PRODUCTS = data;

        grid.innerHTML = data.map((p, index) => `
            <div class="card">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${p.icon || '📚'}</div>
                <div class="card-title">${p.title}</div>
                <p style="color: var(--text-main); font-size: 0.95rem;">${p.desc}</p>
                <div class="card-price">${p.price.toLocaleString()} FCFA</div>
                <button class="btn btn-primary" style="width: 100%;" onclick="window.addToCartById(${p.id})">Ajouter au panier</button>
            </div>
        `).join('');

        window.addToCartById = (id) => {
            const prod = window._PRODUCTS.find(item => item.id == id);
            if (prod) addToCart(prod);
        };
    } catch (error) {
        console.error("Failed to load products:", error);
        grid.innerHTML = '<p style="color:red;">Erreur lors du chargement des produits.</p>';
    }
}

// Seny Chatbot Logic
function initSenyChatbot() {
    const senyChatBtn = document.getElementById('senyChatBtn');
    const senyChatBox = document.getElementById('senyChatBox');
    const closeSenyChat = document.getElementById('closeSenyChat');
    const senyChatForm = document.getElementById('senyChatForm');
    const senyInput = document.getElementById('senyInput');
    const senyChatMessages = document.getElementById('senyChatMessages');
    const senyTyping = document.getElementById('senyTyping');

    let chatHistory = [];
    let messageCount = parseInt(sessionStorage.getItem('seny_msg_count') || '0', 10);
    const MAX_SESSION_MESSAGES = 20;

    senyChatBtn.addEventListener('click', () => {
        senyChatBox.classList.toggle('active');
        if (senyChatBox.classList.contains('active')) {
            senyInput.focus();
        }
    });

    closeSenyChat.addEventListener('click', () => {
        senyChatBox.classList.remove('active');
    });

    senyChatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = senyInput.value.trim();
        if (!userText) return;

        // Check session rate limit
        if (messageCount >= MAX_SESSION_MESSAGES) {
            appendChatMsg('bot', "Vous avez atteint la limite de messages pour cette session. Pour continuer à discuter ou passer commande, contactez-nous directement sur WhatsApp au +221 76 574 93 43 ! 💬");
            senyInput.value = '';
            return;
        }

        // Render User Message
        appendChatMsg('user', userText);
        senyInput.value = '';
        messageCount += 1;
        sessionStorage.setItem('seny_msg_count', messageCount.toString());

        // Show typing indicator
        senyTyping.classList.add('active');
        senyChatMessages.scrollTop = senyChatMessages.scrollHeight;

        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    history: chatHistory.slice(-10) // Send last 10 messages max
                })
            });

            const data = await res.json();
            senyTyping.classList.remove('active');

            if (data.success && data.reply) {
                appendChatMsg('bot', data.reply);
                // Update conversation history
                chatHistory.push({ role: 'user', content: userText });
                chatHistory.push({ role: 'assistant', content: data.reply });
            } else {
                appendChatMsg('bot', "Désolé, je rencontre un souci technique. Contactez-nous directement sur WhatsApp au +221 76 574 93 43 ! 💬");
            }
        } catch (err) {
            console.error("Seny Chat Error:", err);
            senyTyping.classList.remove('active');
            appendChatMsg('bot', "Désolé, je rencontre un souci de connexion. Vous pouvez me joindre directement sur WhatsApp au +221 76 574 93 43 ! 💬");
        }
    });

    function appendChatMsg(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        msgDiv.innerText = text;
        senyChatMessages.appendChild(msgDiv);
        senyChatMessages.scrollTop = senyChatMessages.scrollHeight;
    }
}
