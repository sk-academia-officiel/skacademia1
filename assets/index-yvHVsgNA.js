(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),((e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports))((()=>{document.addEventListener(`DOMContentLoaded`,()=>{let n=document.getElementById(`app`);n.innerHTML=`
        <nav class="navbar">
            <a href="/" class="brand">SK<span>ACADEMIA</span></a>
            <div class="nav-links">
                <a href="#catalogue">Catalogue</a>
                <a href="#dashboard">Espace Étudiant</a>
                <a href="#admin" id="adminNavLink">Admin</a>
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
    `,s(),e(),t(),r(),c();let i=document.getElementById(`supabaseConfigBtn`),a=document.getElementById(`supabaseModal`),o=document.getElementById(`closeSupabaseModal`),l=document.getElementById(`supabaseForm`),u=document.getElementById(`sbUrl`),d=document.getElementById(`sbKey`);localStorage.getItem(`sk_supabase_url`)&&(u.value=localStorage.getItem(`sk_supabase_url`)),localStorage.getItem(`sk_supabase_key`)&&(d.value=localStorage.getItem(`sk_supabase_key`)),i.addEventListener(`click`,()=>{a.classList.add(`active`)}),o.addEventListener(`click`,()=>{a.classList.remove(`active`)}),a.addEventListener(`click`,e=>{e.target===a&&a.classList.remove(`active`)}),l.addEventListener(`submit`,async e=>{e.preventDefault();let n=u.value.trim(),r=d.value.trim(),i=document.getElementById(`sbSubmitBtn`);i.innerText=`Connexion...`,i.disabled=!0;try{let e=await(await fetch(`http://localhost:3000/api/settings/supabase`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({url:n,key:r})})).json();e.success?(localStorage.setItem(`sk_supabase_url`,n),localStorage.setItem(`sk_supabase_key`,r),alert(`⚡ `+e.message),a.classList.remove(`active`),t(),s()):alert(`⚠️ Erreur: `+e.error)}catch{alert(`Erreur de connexion au serveur Backend`)}i.innerText=`💾 Enregistrer & Connecter`,i.disabled=!1});let f=document.getElementById(`loginBtn`),p=document.getElementById(`authModal`),m=document.getElementById(`closeModal`),h=document.getElementById(`loginForm`),g=document.getElementById(`otpForm`),_=document.getElementById(`authTitle`),v=document.getElementById(`authEmail`);f.addEventListener(`click`,()=>{if(localStorage.getItem(`token`)){localStorage.removeItem(`token`),e();return}p.classList.add(`active`),h.style.display=`block`,g.style.display=`none`,_.innerText=`Connexion`}),m.addEventListener(`click`,()=>{p.classList.remove(`active`)}),p.addEventListener(`click`,e=>{e.target===p&&p.classList.remove(`active`)}),h.addEventListener(`submit`,async e=>{e.preventDefault();let t=v.value,n=document.getElementById(`loginSubmitBtn`);n.innerText=`Génération...`,n.disabled=!0;try{let e=await(await fetch(`http://localhost:3000/api/auth/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:t})})).json();e.success?(h.style.display=`none`,g.style.display=`block`,_.innerText=`Saisir le Code`,alert(`Pour le DEV, votre code est : `+e.dev_code)):alert(e.error||`Erreur serveur`)}catch{alert(`Erreur de connexion au serveur`)}n.innerText=`Recevoir mon code OTP`,n.disabled=!1}),g.addEventListener(`submit`,async t=>{t.preventDefault();let n=v.value,r=document.getElementById(`authOtp`).value,i=document.getElementById(`otpSubmitBtn`);i.innerText=`Vérification...`,i.disabled=!0;try{let t=await(await fetch(`http://localhost:3000/api/auth/verify`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:n,code:r})})).json();t.success?(localStorage.setItem(`token`,t.token),p.classList.remove(`active`),e(),alert(`Connexion réussie !`)):alert(t.error||`Code invalide`)}catch{alert(`Erreur de connexion au serveur`)}i.innerText=`Vérifier et me connecter`,i.disabled=!1})});function e(){let e=localStorage.getItem(`token`),t=document.getElementById(`loginBtn`);e?(t.innerText=`Déconnexion`,t.classList.remove(`btn-primary`),t.classList.add(`btn-accent`)):(t.innerText=`Connexion`,t.classList.add(`btn-primary`),t.classList.remove(`btn-accent`))}async function t(){let e=document.getElementById(`supabaseConfigBtn`);if(e)try{(await(await fetch(`http://localhost:3000/api/settings/supabase`)).json()).active?(e.innerText=`⚡ Supabase (Connecté)`,e.style.background=`#10b981`):(e.innerText=`⚡ Supabase (Déconnecté)`,e.style.background=`var(--orange)`)}catch{e.innerText=`⚡ Supabase`}}var n=JSON.parse(localStorage.getItem(`sk_cart`)||`[]`);function r(){let e=document.getElementById(`openCartBtn`),t=document.getElementById(`closeCartBtn`),r=document.getElementById(`cartOverlay`),i=document.getElementById(`checkoutBtn`);e.addEventListener(`click`,()=>{r.classList.add(`active`),o()}),t.addEventListener(`click`,()=>{r.classList.remove(`active`)}),r.addEventListener(`click`,e=>{e.target===r&&r.classList.remove(`active`)}),i.addEventListener(`click`,()=>{if(n.length===0){alert(`Votre panier est vide !`);return}let e=n.reduce((e,t)=>e+t.price*t.qty,0),t=`Bonjour SK ACADEMIA, je souhaite commander :

`;n.forEach(e=>{t+=`• ${e.title} (x${e.qty}) - ${e.price*e.qty} FCFA\n`}),t+=`\n*TOTAL : ${e} FCFA*`;let r=`https://wa.me/221765749343?text=${encodeURIComponent(t)}`;window.open(r,`_blank`)}),o()}function i(e){let t=n.find(t=>t.id===e.id);t?t.qty+=1:n.push({id:e.id,title:e.title,price:e.price,qty:1}),localStorage.setItem(`sk_cart`,JSON.stringify(n)),o(),document.getElementById(`cartOverlay`).classList.add(`active`)}function a(e){n=n.filter(t=>t.id!==e),localStorage.setItem(`sk_cart`,JSON.stringify(n)),o()}function o(){let e=document.getElementById(`cartBody`),t=document.getElementById(`cartCount`),r=document.getElementById(`cartTotal`),i=n.reduce((e,t)=>e+t.qty,0),a=n.reduce((e,t)=>e+t.price*t.qty,0);if(t.innerText=i,r.innerText=a.toLocaleString()+` FCFA`,n.length===0){e.innerHTML=`<p style="text-align: center; color: #64748b; margin-top: 2rem;">Votre panier est vide.</p>`;return}e.innerHTML=n.map(e=>`
        <div class="cart-item">
            <div>
                <div class="cart-item-title">${e.title}</div>
                <div style="font-size: 0.85rem; color: #64748b;">Quantité : ${e.qty}</div>
            </div>
            <div style="text-align: right;">
                <div class="cart-item-price">${(e.price*e.qty).toLocaleString()} FCFA</div>
                <button onclick="window.removeFromCart(${e.id})" style="background:none; border:none; color:red; cursor:pointer; font-size:0.8rem; margin-top:0.3rem;">Supprimer</button>
            </div>
        </div>
    `).join(``)}window.removeFromCart=a;async function s(){let e=document.getElementById(`productGrid`);e.innerHTML=`<p>Chargement des produits...</p>`;try{let t=await(await fetch(`http://localhost:3000/api/products`)).json();if(t.length===0){e.innerHTML=`<p>Aucun produit disponible.</p>`;return}window._PRODUCTS=t,e.innerHTML=t.map((e,t)=>`
            <div class="card">
                <div style="font-size: 2.5rem; margin-bottom: 1rem;">${e.icon||`📚`}</div>
                <div class="card-title">${e.title}</div>
                <p style="color: var(--text-main); font-size: 0.95rem;">${e.desc}</p>
                <div class="card-price">${e.price.toLocaleString()} FCFA</div>
                <button class="btn btn-primary" style="width: 100%;" onclick="window.addToCartById(${e.id})">Ajouter au panier</button>
            </div>
        `).join(``),window.addToCartById=e=>{let t=window._PRODUCTS.find(t=>t.id==e);t&&i(t)}}catch(t){console.error(`Failed to load products:`,t),e.innerHTML=`<p style="color:red;">Erreur lors du chargement des produits.</p>`}}function c(){let e=document.getElementById(`senyChatBtn`),t=document.getElementById(`senyChatBox`),n=document.getElementById(`closeSenyChat`),r=document.getElementById(`senyChatForm`),i=document.getElementById(`senyInput`),a=document.getElementById(`senyChatMessages`),o=document.getElementById(`senyTyping`),s=[],c=parseInt(sessionStorage.getItem(`seny_msg_count`)||`0`,10);e.addEventListener(`click`,()=>{t.classList.toggle(`active`),t.classList.contains(`active`)&&i.focus()}),n.addEventListener(`click`,()=>{t.classList.remove(`active`)}),r.addEventListener(`submit`,async e=>{e.preventDefault();let t=i.value.trim();if(t){if(c>=20){l(`bot`,`Vous avez atteint la limite de messages pour cette session. Pour continuer à discuter ou passer commande, contactez-nous directement sur WhatsApp au +221 76 574 93 43 ! 💬`),i.value=``;return}l(`user`,t),i.value=``,c+=1,sessionStorage.setItem(`seny_msg_count`,c.toString()),o.classList.add(`active`),a.scrollTop=a.scrollHeight;try{let e=await(await fetch(`http://localhost:3000/api/chat`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({message:t,history:s.slice(-10)})})).json();o.classList.remove(`active`),e.success&&e.reply?(l(`bot`,e.reply),s.push({role:`user`,content:t}),s.push({role:`assistant`,content:e.reply})):l(`bot`,`Désolé, je rencontre un souci technique. Contactez-nous directement sur WhatsApp au +221 76 574 93 43 ! 💬`)}catch(e){console.error(`Seny Chat Error:`,e),o.classList.remove(`active`),l(`bot`,`Désolé, je rencontre un souci de connexion. Vous pouvez me joindre directement sur WhatsApp au +221 76 574 93 43 ! 💬`)}}});function l(e,t){let n=document.createElement(`div`);n.className=`chat-msg ${e}`,n.innerText=t,a.appendChild(n),a.scrollTop=a.scrollHeight}}function l(){window.location.hash===`#admin`&&u()}window.addEventListener(`hashchange`,l),l();function u(){let e=document.getElementById(`app`);e.innerHTML=`
        <div class="admin-layout">
            <!-- Sidebar -->
            <aside class="admin-sidebar">
                <div>
                    <div class="admin-sidebar-brand">
                        SK<span>ACADEMIA</span>
                    </div>
                    <div class="admin-menu-section">
                        <div class="admin-menu-section-title">Menu Principal</div>
                        <a href="#admin" class="admin-menu-item active">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="#admin-commandes" class="admin-menu-item">
                            <i data-lucide="shopping-bag"></i>
                            <span>Commandes</span>
                        </a>
                        <a href="#admin-produits" class="admin-menu-item">
                            <i data-lucide="package"></i>
                            <span>Produits</span>
                        </a>
                        <a href="#admin-clients" class="admin-menu-item">
                            <i data-lucide="users"></i>
                            <span>Clients</span>
                        </a>
                        <a href="#admin-contenu" class="admin-menu-item">
                            <i data-lucide="file-text"></i>
                            <span>Contenu & Fascicules</span>
                        </a>
                        <a href="#accueil" class="admin-menu-item">
                            <i data-lucide="globe"></i>
                            <span>Boutique en ligne</span>
                        </a>
                    </div>

                    <div class="admin-menu-section">
                        <div class="admin-menu-section-title">Analyse & Finances</div>
                        <a href="#admin-finances" class="admin-menu-item">
                            <i data-lucide="credit-card"></i>
                            <span>Finances</span>
                        </a>
                        <a href="#admin-analytiques" class="admin-menu-item">
                            <i data-lucide="bar-chart-3"></i>
                            <span>Analytiques</span>
                        </a>
                        <a href="#admin-promotions" class="admin-menu-item">
                            <i data-lucide="tag"></i>
                            <span>Réductions & Promos</span>
                        </a>
                    </div>

                    <div class="admin-menu-section">
                        <div class="admin-menu-section-title">Système</div>
                        <a href="#admin-parametres" class="admin-menu-item">
                            <i data-lucide="settings"></i>
                            <span>Paramètres</span>
                        </a>
                        <a href="#admin-aide" class="admin-menu-item">
                            <i data-lucide="help-circle"></i>
                            <span>Aide & Support</span>
                        </a>
                    </div>
                </div>

                <div class="admin-premium-card">
                    <h5>Support WhatsApp 💬</h5>
                    <p>Accès direct à l'assistance officielle SK ACADEMIA 24/7.</p>
                    <button onclick="window.open('https://wa.me/221765749343', '_blank')">Contacter Support</button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="admin-main-wrapper">
                <!-- Header -->
                <header class="admin-header">
                    <div class="admin-header-title">
                        <h2>Tableau de bord</h2>
                    </div>
                    <div class="admin-header-actions">
                        <select class="admin-select-period">
                            <option value="30">30 derniers jours</option>
                            <option value="7">7 derniers jours</option>
                            <option value="90">Ce trimestre</option>
                        </select>
                        <button class="admin-btn-export" id="adminExportBtn">
                            <i data-lucide="download"></i> Exporter CSV
                        </button>
                        <div style="width: 38px; height: 38px; border-radius: 50%; background: white; border: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                            <i data-lucide="bell" style="width: 18px; color: #64748B;"></i>
                        </div>
                        <div class="admin-avatar">SK</div>
                    </div>
                </header>

                <!-- 4 Stat Cards Row -->
                <div class="admin-stats-row">
                    <div class="admin-stat-card">
                        <div class="admin-stat-card-header">
                            <span class="admin-stat-card-title">Visiteurs</span>
                            <div class="admin-stat-icon-box blue">
                                <i data-lucide="eye"></i>
                            </div>
                        </div>
                        <div class="admin-stat-number">6 225</div>
                        <div class="admin-stat-footer">
                            <span class="stat-badge-positive">↑ 8.4%</span>
                            <span class="stat-subtext">vs période précédente</span>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="admin-stat-card-header">
                            <span class="admin-stat-card-title">Nouvelles Inscriptions</span>
                            <div class="admin-stat-icon-box orange">
                                <i data-lucide="user-plus"></i>
                            </div>
                        </div>
                        <div class="admin-stat-number">1 224</div>
                        <div class="admin-stat-footer">
                            <span class="stat-badge-positive">↑ 12.5%</span>
                            <span class="stat-subtext">vs période précédente</span>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="admin-stat-card-header">
                            <span class="admin-stat-card-title">Commandes</span>
                            <div class="admin-stat-icon-box green">
                                <i data-lucide="shopping-cart"></i>
                            </div>
                        </div>
                        <div class="admin-stat-number">342</div>
                        <div class="admin-stat-footer">
                            <span class="stat-badge-positive">↑ 5.2%</span>
                            <span class="stat-subtext">vs période précédente</span>
                        </div>
                    </div>

                    <div class="admin-stat-card">
                        <div class="admin-stat-card-header">
                            <span class="admin-stat-card-title">Taux de Conversion</span>
                            <div class="admin-stat-icon-box purple">
                                <i data-lucide="trending-up"></i>
                            </div>
                        </div>
                        <div class="admin-stat-number">5.4%</div>
                        <div class="admin-stat-footer">
                            <span class="stat-badge-negative">↓ 1.2%</span>
                            <span class="stat-subtext">vs période précédente</span>
                        </div>
                    </div>
                </div>

                <!-- 2/3 + 1/3 Main Grid -->
                <div class="admin-grid-two-cols">
                    <!-- Left 2/3 Revenue Chart -->
                    <div class="admin-card">
                        <div class="admin-card-header">
                            <h3>Chiffre d'Affaires</h3>
                            <select class="admin-select-period" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">
                                <option>7 derniers jours</option>
                                <option selected>30 derniers jours</option>
                                <option>Tout l'historique</option>
                            </select>
                        </div>
                        <div class="admin-revenue-amount">
                            446 700 FCFA
                            <span class="stat-badge-positive" style="font-size: 0.85rem; font-weight: 700;">↑ 15.4% vs mois dernier</span>
                        </div>
                        <!-- Chart Canvas -->
                        <div style="height: 220px; width: 100%; position: relative;">
                            <canvas id="revenueChartCanvas"></canvas>
                        </div>

                        <!-- Category Breakdown Bars -->
                        <div class="admin-category-breakdown">
                            <div class="admin-cat-item">
                                <div class="admin-cat-label">
                                    <span>Administration & Justice</span>
                                    <strong>45%</strong>
                                </div>
                                <div class="admin-cat-progress-bg">
                                    <div class="admin-cat-progress-fill" style="width: 45%; background: var(--blue-deep);"></div>
                                </div>
                            </div>
                            <div class="admin-cat-item">
                                <div class="admin-cat-label">
                                    <span>Sécurité & Défense</span>
                                    <strong>28%</strong>
                                </div>
                                <div class="admin-cat-progress-bg">
                                    <div class="admin-cat-progress-fill" style="width: 28%; background: var(--orange);"></div>
                                </div>
                            </div>
                            <div class="admin-cat-item">
                                <div class="admin-cat-label">
                                    <span>Douanes & Santé</span>
                                    <strong>18%</strong>
                                </div>
                                <div class="admin-cat-progress-bg">
                                    <div class="admin-cat-progress-fill" style="width: 18%; background: #10B981;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right 1/3 Secondary Widgets -->
                    <div class="admin-widgets-column">
                        <!-- Widget 1: Activité par jour -->
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <h3>Activité par Jour</h3>
                                <i data-lucide="more-horizontal" style="width: 18px; color: #94A3B8;"></i>
                            </div>
                            <div class="admin-days-bar-container">
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 40%;"></div></div><span class="admin-day-label">Lun</span></div>
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 65%;"></div></div><span class="admin-day-label">Mar</span></div>
                                <div class="admin-day-col active"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 95%;"></div></div><span class="admin-day-label">Mer</span></div>
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 55%;"></div></div><span class="admin-day-label">Jeu</span></div>
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 80%;"></div></div><span class="admin-day-label">Ven</span></div>
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 45%;"></div></div><span class="admin-day-label">Sam</span></div>
                                <div class="admin-day-col"><div class="admin-day-bar-bg"><div class="admin-day-bar-fill" style="height: 30%;"></div></div><span class="admin-day-label">Dim</span></div>
                            </div>
                        </div>

                        <!-- Widget 2: Taux de réachat -->
                        <div class="admin-card">
                            <div class="admin-card-header">
                                <h3>Taux de Réachat</h3>
                                <i data-lucide="repeat" style="width: 18px; color: #94A3B8;"></i>
                            </div>
                            <div class="admin-gauge-box">
                                <svg width="180" height="100" viewBox="0 0 180 100">
                                    <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="#F1F5F9" stroke-width="16" stroke-linecap="round"/>
                                    <path d="M 20 90 A 70 70 0 0 1 142 42" fill="none" stroke="#10B981" stroke-width="16" stroke-linecap="round"/>
                                </svg>
                                <div class="admin-gauge-text">
                                    <div class="val">68%</div>
                                    <div class="sub">Fidélité étudiants</div>
                                </div>
                            </div>
                        </div>

                        <!-- Widget 3: Assistant Seny -->
                        <div class="admin-card" style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);">
                            <div class="admin-card-header">
                                <div style="display: flex; align-items: center; gap: 0.6rem;">
                                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--orange); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem;">🤖</div>
                                    <h3 style="font-size: 0.95rem;">Assistant Seny</h3>
                                </div>
                                <span class="stat-badge-positive" style="font-size: 0.72rem;">Actif</span>
                            </div>
                            <div style="font-size: 0.85rem; color: #475569; margin-bottom: 0.8rem;">
                                <strong>148 conversations</strong> traitées cette semaine.
                            </div>
                            <div style="font-size: 0.78rem; color: #64748b;">
                                Question fréquente : <em>"Quel est le prix du pack ENA ?"</em>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Full Width Table: Produits Vedettes -->
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h3>Produits Vedettes (Best Selling Products)</h3>
                        <a href="#admin-produits" style="font-size: 0.82rem; font-weight: 700; color: var(--blue-deep); text-decoration: none;">Voir tout →</a>
                    </div>
                    <div class="admin-table-responsive">
                        <table class="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Produit</th>
                                    <th>Catégorie</th>
                                    <th>Ventes</th>
                                    <th>Chiffre d'affaires</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>#83001</strong></td>
                                    <td>
                                        <div class="admin-prod-title-box">
                                            <div class="admin-prod-icon">📜</div>
                                            <div>
                                                <strong style="display: block; color: var(--blue-deep);">Fascicule Complet — Concours ENA Sénégal</strong>
                                                <span style="font-size: 0.78rem; color: #94A3B8;">Droit Public & Culture Générale</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Administration</td>
                                    <td><strong>2 310</strong> vendus</td>
                                    <td style="font-weight: 700; color: #10B981;">11 550 000 FCFA</td>
                                    <td><div class="admin-rating-stars">★ 5.0</div></td>
                                </tr>
                                <tr>
                                    <td><strong>#83002</strong></td>
                                    <td>
                                        <div class="admin-prod-title-box">
                                            <div class="admin-prod-icon">👮</div>
                                            <div>
                                                <strong style="display: block; color: var(--blue-deep);">Pack Spécial — Concours Police & Gendarmerie</strong>
                                                <span style="font-size: 0.78rem; color: #94A3B8;">Annales Corrigées 2020-2025</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Sécurité</td>
                                    <td><strong>1 230</strong> vendus</td>
                                    <td style="font-weight: 700; color: #10B981;">6 150 000 FCFA</td>
                                    <td><div class="admin-rating-stars">★ 4.8</div></td>
                                </tr>
                                <tr>
                                    <td><strong>#83003</strong></td>
                                    <td>
                                        <div class="admin-prod-title-box">
                                            <div class="admin-prod-icon">💻</div>
                                            <div>
                                                <strong style="display: block; color: var(--blue-deep);">Formation Complète — Développement Web & Mobile</strong>
                                                <span style="font-size: 0.78rem; color: #94A3B8;">HTML, CSS, JavaScript, React</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>Informatique</td>
                                    <td><strong>812</strong> vendus</td>
                                    <td style="font-weight: 700; color: #10B981;">12 180 000 FCFA</td>
                                    <td><div class="admin-rating-stars">★ 4.9</div></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    `,window.lucide&&window.lucide.createIcons();let t=document.getElementById(`adminExportBtn`);t&&t.addEventListener(`click`,()=>{let e=document.createElement(`a`);e.setAttribute(`href`,`data:text/csv;charset=utf-8,ID,Produit,Categorie,Ventes,CA%0A83001,Fascicule%20ENA,Administration,2310,11550000%0A83002,Pack%20Police,Securite,1230,6150000%0A83003,Formation%20Dev%20Web,Informatique,812,12180000`),e.setAttribute(`download`,`sk_academia_rapport_ventes.csv`),document.body.appendChild(e),e.click(),document.body.removeChild(e)}),setTimeout(()=>{let e=document.getElementById(`revenueChartCanvas`);if(e&&window.Chart){let t=e.getContext(`2d`);new window.Chart(t,{type:`line`,data:{labels:[`1 Jan`,`5 Jan`,`10 Jan`,`15 Jan`,`20 Jan`,`25 Jan`,`30 Jan`],datasets:[{label:`Chiffre d'Affaires (FCFA)`,data:[12e4,19e4,24e4,31e4,28e4,39e4,446700],borderColor:`#0f172a`,borderWidth:3,backgroundColor:`rgba(15, 23, 42, 0.05)`,fill:!0,tension:.4,pointRadius:4,pointBackgroundColor:`#f5a623`}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{x:{grid:{display:!1}},y:{grid:{color:`#F1F5F9`},ticks:{callback:function(e){return e.toLocaleString()+` F`}}}}}})}},100)}}))();