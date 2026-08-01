(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),((e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports))((()=>{document.addEventListener(`DOMContentLoaded`,()=>{let n=document.getElementById(`app`);n.innerHTML=`
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
    `,s(),e(),t(),r();let i=document.getElementById(`supabaseConfigBtn`),a=document.getElementById(`supabaseModal`),o=document.getElementById(`closeSupabaseModal`),c=document.getElementById(`supabaseForm`),l=document.getElementById(`sbUrl`),u=document.getElementById(`sbKey`);localStorage.getItem(`sk_supabase_url`)&&(l.value=localStorage.getItem(`sk_supabase_url`)),localStorage.getItem(`sk_supabase_key`)&&(u.value=localStorage.getItem(`sk_supabase_key`)),i.addEventListener(`click`,()=>{a.classList.add(`active`)}),o.addEventListener(`click`,()=>{a.classList.remove(`active`)}),a.addEventListener(`click`,e=>{e.target===a&&a.classList.remove(`active`)}),c.addEventListener(`submit`,async e=>{e.preventDefault();let n=l.value.trim(),r=u.value.trim(),i=document.getElementById(`sbSubmitBtn`);i.innerText=`Connexion...`,i.disabled=!0;try{let e=await(await fetch(`http://localhost:3000/api/settings/supabase`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({url:n,key:r})})).json();e.success?(localStorage.setItem(`sk_supabase_url`,n),localStorage.setItem(`sk_supabase_key`,r),alert(`⚡ `+e.message),a.classList.remove(`active`),t(),s()):alert(`⚠️ Erreur: `+e.error)}catch{alert(`Erreur de connexion au serveur Backend`)}i.innerText=`💾 Enregistrer & Connecter`,i.disabled=!1});let d=document.getElementById(`loginBtn`),f=document.getElementById(`authModal`),p=document.getElementById(`closeModal`),m=document.getElementById(`loginForm`),h=document.getElementById(`otpForm`),g=document.getElementById(`authTitle`),_=document.getElementById(`authEmail`);d.addEventListener(`click`,()=>{if(localStorage.getItem(`token`)){localStorage.removeItem(`token`),e();return}f.classList.add(`active`),m.style.display=`block`,h.style.display=`none`,g.innerText=`Connexion`}),p.addEventListener(`click`,()=>{f.classList.remove(`active`)}),f.addEventListener(`click`,e=>{e.target===f&&f.classList.remove(`active`)}),m.addEventListener(`submit`,async e=>{e.preventDefault();let t=_.value,n=document.getElementById(`loginSubmitBtn`);n.innerText=`Génération...`,n.disabled=!0;try{let e=await(await fetch(`http://localhost:3000/api/auth/register`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:t})})).json();e.success?(m.style.display=`none`,h.style.display=`block`,g.innerText=`Saisir le Code`,alert(`Pour le DEV, votre code est : `+e.dev_code)):alert(e.error||`Erreur serveur`)}catch{alert(`Erreur de connexion au serveur`)}n.innerText=`Recevoir mon code OTP`,n.disabled=!1}),h.addEventListener(`submit`,async t=>{t.preventDefault();let n=_.value,r=document.getElementById(`authOtp`).value,i=document.getElementById(`otpSubmitBtn`);i.innerText=`Vérification...`,i.disabled=!0;try{let t=await(await fetch(`http://localhost:3000/api/auth/verify`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({email:n,code:r})})).json();t.success?(localStorage.setItem(`token`,t.token),f.classList.remove(`active`),e(),alert(`Connexion réussie !`)):alert(t.error||`Code invalide`)}catch{alert(`Erreur de connexion au serveur`)}i.innerText=`Vérifier et me connecter`,i.disabled=!1})});function e(){let e=localStorage.getItem(`token`),t=document.getElementById(`loginBtn`);e?(t.innerText=`Déconnexion`,t.classList.remove(`btn-primary`),t.classList.add(`btn-accent`)):(t.innerText=`Connexion`,t.classList.add(`btn-primary`),t.classList.remove(`btn-accent`))}async function t(){let e=document.getElementById(`supabaseConfigBtn`);if(e)try{(await(await fetch(`http://localhost:3000/api/settings/supabase`)).json()).active?(e.innerText=`⚡ Supabase (Connecté)`,e.style.background=`#10b981`):(e.innerText=`⚡ Supabase (Déconnecté)`,e.style.background=`var(--orange)`)}catch{e.innerText=`⚡ Supabase`}}var n=JSON.parse(localStorage.getItem(`sk_cart`)||`[]`);function r(){let e=document.getElementById(`openCartBtn`),t=document.getElementById(`closeCartBtn`),r=document.getElementById(`cartOverlay`),i=document.getElementById(`checkoutBtn`);e.addEventListener(`click`,()=>{r.classList.add(`active`),o()}),t.addEventListener(`click`,()=>{r.classList.remove(`active`)}),r.addEventListener(`click`,e=>{e.target===r&&r.classList.remove(`active`)}),i.addEventListener(`click`,()=>{if(n.length===0){alert(`Votre panier est vide !`);return}let e=n.reduce((e,t)=>e+t.price*t.qty,0),t=`Bonjour SK ACADEMIA, je souhaite commander :

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
        `).join(``),window.addToCartById=e=>{let t=window._PRODUCTS.find(t=>t.id==e);t&&i(t)}}catch(t){console.error(`Failed to load products:`,t),e.innerHTML=`<p style="color:red;">Erreur lors du chargement des produits.</p>`}}}))();