(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),((e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports))((()=>{var e=[{id:1,title:`Fascicule ENA Sénégal - Culture Générale & Droit Public`,sector:`Administration & Justice`,type:`Fascicules & Packs`,price:7500,description:`Synthèse complète de culture générale, droit constitutionnel et administratif pour le concours de l'ENA.`,icon:`📜`},{id:2,title:`Annales Corrigées ENA (2018 - 2025)`,sector:`Administration & Justice`,type:`Annales corrigées`,price:5e3,description:`Sujets et corrigés détaillés des épreuves d'admissibilité et d'admission du concours direct ENA.`,icon:`📚`},{id:3,title:`Pack Concours Greffiers & Secrétaires de Greffe`,sector:`Administration & Justice`,type:`Fascicules & Packs`,price:6500,description:`Cours d'organisation judiciaire au Sénégal, droit pénal et procédure avec annales récentes.`,icon:`⚖️`},{id:4,title:`Cours PDF Droit Administratif & Institutions du Sénégal`,sector:`Administration & Justice`,type:`Cours PDF`,price:4e3,description:`Guide méthodologique complet pour la dissertation et le commentaire de texte aux concours administratifs.`,icon:`📄`},{id:5,title:`Fascicule Concours Police Nationale - Gardiens de la Paix`,sector:`Sécurité & Défense`,type:`Fascicules & Packs`,price:5e3,description:`Culture générale, dictée, entraînement aux tests psychotechniques et épreuves physiques.`,icon:`👮`},{id:6,title:`Annales Corrigées Officiers & Commissaires de Police`,sector:`Sécurité & Défense`,type:`Annales corrigées`,price:6e3,description:`Sujets corrigés de droit pénal, procédure pénale et culture générale (Session 2019-2025).`,icon:`📑`},{id:7,title:`Pack Concours Gendarmerie Nationale Sénégal`,sector:`Sécurité & Défense`,type:`Fascicules & Packs`,price:5500,description:`Preparation intégrale pour les Élèves Gendarmes et Sous-Officiers de Gendarmerie.`,icon:`🛡️`},{id:8,title:`Guide de Préparation Physique & Mentale aux Concours Militaires`,sector:`Sécurité & Défense`,type:`Cours PDF`,price:3500,description:`Programme d'entraînement, baremes des épreuves sportives et conseils médicaux.`,icon:`🏋️`},{id:9,title:`Fascicule Concours Douanes - Agents de Constatation`,sector:`Douanes Sénégalaises`,type:`Fascicules & Packs`,price:6e3,description:`Droit douanier, réglementation de l'UEMOA, culture générale et épreuves de calcul rapide.`,icon:`📦`},{id:10,title:`Annales Corrigées Inspecteurs & Contrôleurs des Douanes`,sector:`Douanes Sénégalaises`,type:`Annales corrigées`,price:7e3,description:`Collection exclusive des sujets d'économie générale, de finances publiques et d'épreuves de synthèse.`,icon:`📊`},{id:11,title:`Cours PDF Économie Internationale & Tarif Douanier`,sector:`Douanes Sénégalaises`,type:`Cours PDF`,price:4500,description:`Résumé clair des politiques commerciales, procédures de dédouanement et contentieux.`,icon:`📉`},{id:12,title:`Fascicule Concours Infirmiers d'État & Sages-Femmes (ENDSS)`,sector:`Santé & Social`,type:`Fascicules & Packs`,price:5e3,description:`Sciences de la vie et de la terre, anatomie, biologie humaine et qcm de culture sanitaire.`,icon:`🩺`},{id:13,title:`Annales Corrigées Concours Assistants Sociaux & Techniciens de Santé`,sector:`Santé & Social`,type:`Annales corrigées`,price:4500,description:`Questions à choix multiples et cas pratiques récents des épreuves d'entrée de l'ENDSS.`,icon:`💉`},{id:14,title:`Cours PDF Pharmacologie & Pathologies Courantes au Sénégal`,sector:`Santé & Social`,type:`Cours PDF`,price:4e3,description:`Répertoire complet des connaissances fondamentales pour réussir les concours de santé.`,icon:`💊`},{id:15,title:`Pack Prépa Concours EAMAC (Météo, Aviation, Contrôle)`,sector:`Grandes Écoles`,type:`Fascicules & Packs`,price:8e3,description:`Mathématiques approfondies, physique-chimie, anglais technique et logique spatiale.`,icon:`✈️`},{id:16,title:`Annales Corrigées ESP Dakar (École Supérieure Polytechnique)`,sector:`Grandes Écoles`,type:`Annales corrigées`,price:6500,description:`Corrigés officiels des concours d'entrée au DUT et Diplôme d'Ingénieur de l'ESP.`,icon:`⚙️`},{id:17,title:`Fascicule Concours ENSAE (Statistique & Analyse Économique)`,sector:`Grandes Écoles`,type:`Fascicules & Packs`,price:7500,description:`Entraînement intensif en probabilités, algebree linéaire et épreuves de réflexion analytique.`,icon:`📐`},{id:18,title:`Pack Concours INSEPS (Éducation Physique & Sportive)`,sector:`Grandes Écoles`,type:`Fascicules & Packs`,price:5e3,description:`Biomécanique, physiologie du sport et sujets d'admissibilité des sessions précédentes.`,icon:`⚽`},{id:19,title:`Fascicule Concours FASTEF - Élèves Professeurs (Secondaire)`,sector:`Enseignement`,type:`Fascicules & Packs`,price:6e3,description:`Didactique des disciplines, méthodologie de leçon et épreuves de spécialité.`,icon:`🎓`},{id:20,title:`Annales Corrigées CREM (Recrutement Élèves-Maîtres)`,sector:`Enseignement`,type:`Annales corrigées`,price:4500,description:`Sujets de français, mathématiques, psychopédagogie et géographie du Sénégal.`,icon:`📝`},{id:21,title:`Cours PDF Psychologie de l'Enfant & Pédagogie Générale`,sector:`Enseignement`,type:`Cours PDF`,price:3500,description:`Guide indispensable pour reussir les entretiens avec le jury et les épreuves écrites.`,icon:`📖`},{id:22,title:`Formation Complète Excel 2026 : De Débutant à Expert`,sector:`Formations Digitales`,type:`Formations`,price:12e3,description:`Maîtrisez les formules complexes, TCD, rechercheV/X et l'automatisation de tableaux de bord.`,icon:`💻`},{id:23,title:`Masterclass Intelligence Artificielle & Prompt Engineering 2026`,sector:`Formations Digitales`,type:`Formations`,price:15e3,description:`Apprenez à utiliser ChatGPT, Midjourney et Claude pour décupler votre productivité professionnelle.`,icon:`🤖`},{id:24,title:`Bootcamp Développement Web : HTML, CSS, JavaScript & React`,sector:`Formations Digitales`,type:`Formations`,price:25e3,description:`Créez des sites web modernes et des applications interactives de A à Z.`,icon:`🌐`},{id:25,title:`Formation Graphisme & Design avec Photoshop & Canva Pro`,sector:`Formations Digitales`,type:`Formations`,price:1e4,description:`Concevez des affiches, visuels réseaux sociaux et chartes graphiques de qualité pro.`,icon:`🎨`},{id:26,title:`Pack Bureautique Intégral : Word, PowerPoint & Gestion PDF`,sector:`Formations Digitales`,type:`Formations`,price:8e3,description:`Mise en page de rapports professionnels, présentations d'impact et gestion documentaire.`,icon:`🖥️`},{id:27,title:`Initiation à la Programmation Python & Analyse de Données`,sector:`Formations Digitales`,type:`Formations`,price:18e3,description:`Les bases solides de Python, manipulation de fichiers, Pandas et création de graphiques.`,icon:`🐍`}],t=[`Toutes les filières`,`Administration & Justice`,`Sécurité & Défense`,`Douanes Sénégalaises`,`Santé & Social`,`Grandes Écoles`,`Enseignement`,`Formations Digitales`],n=[`Tous les types`,`Fascicules & Packs`,`Annales corrigées`,`Cours PDF`,`Formations`],r={currentRoute:`accueil`,searchQuery:``,selectedSector:`Toutes les filières`,selectedType:`Tous les types`,cart:[],isCartOpen:!1,isCheckoutOpen:!1,orderSuccess:!1};function i(e){return new Intl.NumberFormat(`fr-FR`).format(e)+` FCFA`}function a(t){let n=e.find(e=>e.id===t);if(!n)return;let i=r.cart.find(e=>e.product.id===t);i?i.quantity+=1:r.cart.push({product:n,quantity:1}),l()}function o(e,t){let n=r.cart.find(t=>t.product.id===e);n&&(n.quantity+=t,n.quantity<=0&&(r.cart=r.cart.filter(t=>t.product.id!==e)),l())}function s(){return r.cart.reduce((e,t)=>e+t.product.price*t.quantity,0)}function c(){return r.cart.reduce((e,t)=>e+t.quantity,0)}function l(){let e=document.getElementById(`cartBadgeCount`);e&&(e.textContent=c()),v()}function u(){return`
    <header class="site-header">
        <div class="header-container">
            <a href="#accueil" class="brand-logo">
                <div class="brand-icon-box">🎓</div>
                <span>SK ACADEMIA</span>
            </a>
            
            <nav class="nav-menu">
                <a href="#accueil" class="nav-link ${r.currentRoute===`accueil`?`active`:``}">Accueil</a>
                <a href="#catalogue" class="nav-link ${r.currentRoute===`catalogue`?`active`:``}">Catalogue</a>
                <a href="#formations" class="nav-link ${r.currentRoute===`formations`?`active`:``}">Formations</a>
                <a href="#a-propos" class="nav-link ${r.currentRoute===`a-propos`?`active`:``}">À propos</a>
                <a href="#contact" class="nav-link ${r.currentRoute===`contact`?`active`:``}">Contact</a>
            </nav>
            
            <div class="header-actions">
                <button class="btn-cart" id="openCartDrawerBtn">
                    <span>🛒 Panier</span>
                    <span class="cart-badge-pill" id="cartBadgeCount">${c()}</span>
                </button>
            </div>
        </div>
    </header>
    `}function d(){return`
    <footer class="site-footer">
        <div class="footer-grid">
            <div>
                <div class="footer-brand">SK ACADEMIA SÉNÉGAL</div>
                <p class="footer-desc">Plateforme N°1 au Sénégal dédiée aux ressources de préparation aux concours administratifs, militaires, de santé, grandes écoles et formations aux compétences digitales du futur.</p>
            </div>
            <div>
                <h4 class="footer-col-title">ACCÈS RAPIDE</h4>
                <ul class="footer-links-list">
                    <li><a href="#accueil">Accueil</a></li>
                    <li><a href="#catalogue">Catalogue Complet</a></li>
                    <li><a href="#formations">Formations Digitales</a></li>
                    <li><a href="#a-propos">À Propos de Nous</a></li>
                </ul>
            </div>
            <div>
                <h4 class="footer-col-title">CONCOURS PHARRES</h4>
                <ul class="footer-links-list">
                    <li><a href="#catalogue" onclick="setCatalogueFilter('Administration & Justice')">Concours ENA</a></li>
                    <li><a href="#catalogue" onclick="setCatalogueFilter('Sécurité & Défense')">Police & Gendarmerie</a></li>
                    <li><a href="#catalogue" onclick="setCatalogueFilter('Douanes Sénégalaises')">Douanes Sénégalaises</a></li>
                    <li><a href="#catalogue" onclick="setCatalogueFilter('Santé & Social')">Concours ENDSS</a></li>
                </ul>
            </div>
            <div>
                <h4 class="footer-col-title">CONTACT & SUPPORT</h4>
                <ul class="footer-links-list">
                    <li>📞 WhatsApp / Tél : +221 76 574 93 43</li>
                    <li>✉️ Email : contact@skacademia.sn</li>
                    <li>📍 Adresse : Dakar, Sénégal</li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            © 2026 SK ACADEMIA — Tous droits réservés. Conçu pour la réussite aux concours au Sénégal.
        </div>
    </footer>
    `}function f(){return`
    <section class="hero-section">
        <div class="hero-content">
            <div>
                <h1 class="hero-title">Réussissez vos Concours au Sénégal avec SK ACADEMIA</h1>
                <p class="hero-subtitle">Accédez instantanément aux fascicules corrigés, annales de 2018 à 2025, cours synthétiques et formations en informatique conçus par des experts du Sénégal.</p>
                <a href="#catalogue" class="btn-hero-cta">🚀 Découvrir le Catalogue Complet</a>
            </div>
            <div class="hero-image-box">
                <img src="./hero_students.png" alt="Étudiants SK ACADEMIA Sénégal">
            </div>
        </div>
    </section>

    <div class="section-container">
        <h2 class="section-title">NOS SECTEURS DE PRÉPARATION</h2>
        <p class="section-subtitle">Sélectionnez votre filière pour consulter les annales et fascicules dédiés.</p>
        
        <div class="categories-cards-grid">
            <div class="cat-card-home" onclick="setCatalogueFilter('Administration & Justice')">
                <div class="cat-icon-header">🏛️</div>
                <h3 class="cat-card-title">Administration & Justice</h3>
                <div class="cat-items-list">
                    <div>• Concours Direct ENA</div>
                    <div>• Greffiers & Secrétaires de Greffe</div>
                    <div>• Administration Générale</div>
                </div>
            </div>

            <div class="cat-card-home" onclick="setCatalogueFilter('Sécurité & Défense')">
                <div class="cat-icon-header">🛡️</div>
                <h3 class="cat-card-title">Sécurité & Défense</h3>
                <div class="cat-items-list">
                    <div>• Gardiens de la Paix & Police</div>
                    <div>• Officiers & Commissaires</div>
                    <div>• Élèves Gendarmes</div>
                </div>
            </div>

            <div class="cat-card-home" onclick="setCatalogueFilter('Douanes Sénégalaises')">
                <div class="cat-icon-header">📦</div>
                <h3 class="cat-card-title">Douanes Sénégalaises</h3>
                <div class="cat-items-list">
                    <div>• Agents de Constatation</div>
                    <div>• Contrôleurs des Douanes</div>
                    <div>• Inspecteurs des Douanes</div>
                </div>
            </div>

            <div class="cat-card-home" onclick="setCatalogueFilter('Formations Digitales')">
                <div class="cat-icon-header">💻</div>
                <h3 class="cat-card-title">Formations Digitales</h3>
                <div class="cat-items-list">
                    <div>• Excel & Bureautique Pro</div>
                    <div>• IA & Prompt Engineering</div>
                    <div>• Développement Web</div>
                </div>
            </div>
        </div>
    </div>
    `}function p(){let a=e.filter(e=>{let t=r.searchQuery===``||e.title.toLowerCase().includes(r.searchQuery.toLowerCase())||e.description.toLowerCase().includes(r.searchQuery.toLowerCase()),n=r.selectedSector===`Toutes les filières`||e.sector===r.selectedSector,i=r.selectedType===`Tous les types`||e.type===r.selectedType;return t&&n&&i}),o=t.map(e=>`
        <button class="filter-pill ${r.selectedSector===e?`active`:``}" 
                onclick="window.selectSector('${e}')">
            ${e}
        </button>
    `).join(``),s=n.map(e=>`
        <button class="filter-pill ${r.selectedType===e?`active`:``}" 
                onclick="window.selectType('${e}')">
            ${e}
        </button>
    `).join(``),c=a.length>0?a.map(e=>`
            <div class="product-card">
                <div class="card-banner">
                    <span class="card-banner-icon">${e.icon}</span>
                    <span class="badge-type">${e.type}</span>
                </div>
                <div class="card-content">
                    <div class="category-tag">${e.sector}</div>
                    <h3 class="card-title">${e.title}</h3>
                    <p class="card-description">${e.description}</p>
                    <div class="card-footer">
                        <div class="card-price">${i(e.price)}</div>
                        <button class="btn-add-cart" onclick="window.handleAddToCart(${e.id}, this)">
                            <span>🛒 Ajouter</span>
                        </button>
                    </div>
                </div>
            </div>
        `).join(``):`<div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #64748B;">
                <h3>Aucun résultat trouvé</h3>
                <p>Essayez de modifier votre recherche ou de réinitialiser vos filtres.</p>
           </div>`;return`
    <div class="catalogue-container">
        <h1 class="page-header-title">Catalogue complet</h1>
        <p class="page-header-subtitle">27 supports pour les concours du Sénégal. Filtrez par filière, par type ou faites une recherche.</p>
        
        <div class="search-box-wrapper">
            <span class="search-icon-inside">🔍</span>
            <input type="text" class="search-input" id="searchInput" 
                   placeholder="Rechercher un concours, une matière..." 
                   value="${r.searchQuery}">
        </div>

        <div class="filter-group">
            <div class="filter-row">${o}</div>
            <div class="filter-row">${s}</div>
        </div>

        <div class="results-count-bar">
            ${a.length} résultat${a.length>1?`s`:``}
        </div>

        <div class="products-grid">
            ${c}
        </div>
    </div>
    `}function m(){return`
    <div class="catalogue-container">
        <h1 class="page-header-title">Formations Digitales 2026</h1>
        <p class="page-header-subtitle">Développez des compétences clés en bureautique, IA, programmation et design pour exceller dans le monde professionnel au Sénégal.</p>
        
        <div class="products-grid" style="margin-top: 2rem;">
            ${e.filter(e=>e.sector===`Formations Digitales`).map(e=>`
        <div class="product-card">
            <div class="card-banner" style="background: linear-gradient(135deg, #064E3B 0%, #0D9488 100%);">
                <span class="card-banner-icon">${e.icon}</span>
                <span class="badge-type">FORMATION</span>
            </div>
            <div class="card-content">
                <div class="category-tag">COMPÉTENCE DIGITALE</div>
                <h3 class="card-title">${e.title}</h3>
                <p class="card-description">${e.description}</p>
                <div class="card-footer">
                    <div class="card-price">${i(e.price)}</div>
                    <button class="btn-add-cart" onclick="window.handleAddToCart(${e.id}, this)">
                        <span>🎓 S'inscrire</span>
                    </button>
                </div>
            </div>
        </div>
    `).join(``)}
        </div>
    </div>
    `}function h(){return`
    <div class="catalogue-container">
        <h1 class="page-header-title">À Propos de SK ACADEMIA</h1>
        <p class="page-header-subtitle">Notre mission est d'offrir à chaque candidat du Sénégal les meilleures chances de réussite aux concours nationaux grâce à des contenus pédagogiques d'excellence.</p>
        
        <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 2.5rem; margin-top: 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
            <div>
                <h3 style="font-size: 1.25rem; color: #0F2C59; margin-bottom: 0.75rem;">📚 Rigueur & Conduite Pédagogique</h3>
                <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Tous nos fascicules et corrigés sont rédigés par des professeurs qualifiés et des anciens candidats ayant réussi les concours administratifs majeurs.</p>
            </div>
            <div>
                <h3 style="font-size: 1.25rem; color: #0F2C59; margin-bottom: 0.75rem;">⚡ Livraison Immédiate PDF</h3>
                <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Dès validation de votre commande, recevez vos fichiers directement sur votre téléphone via WhatsApp ou par Email sous format numérique accessible à tout moment.</p>
            </div>
            <div>
                <h3 style="font-size: 1.25rem; color: #0F2C59; margin-bottom: 0.75rem;">🤝 Assistance & Conseils</h3>
                <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Notre équipe reste disponible 7j/7 pour vous guider dans le choix des concours adaptés à votre profil et votre diplôme.</p>
            </div>
        </div>
    </div>
    `}function g(){return`
    <div class="catalogue-container">
        <h1 class="page-header-title">Contactez-nous</h1>
        <p class="page-header-subtitle">Une question sur un fascicule ou besoin d'orientation pour un concours ? Remplissez ce formulaire ou écrivez-nous sur WhatsApp.</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem;" class="contact-grid-wrapper">
            <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 2rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem;">Envoyer un message</h3>
                <form onsubmit="window.handleContactSubmit(event)">
                    <div class="form-group">
                        <label class="form-label">Nom complet</label>
                        <input type="text" class="form-control" placeholder="Moussa Sow" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Téléphone (WhatsApp)</label>
                        <input type="tel" class="form-control" placeholder="+221 77 000 00 00" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" placeholder="moussa@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Votre message</label>
                        <textarea class="form-control" rows="4" placeholder="Bonjour, je souhaite obtenir des informations sur..." required></textarea>
                    </div>
                    <button type="submit" class="btn-submit-order" style="background: #059669;">Envoyer le message</button>
                </form>
            </div>

            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div style="background: #0F2C59; color: white; border-radius: 16px; padding: 2rem;">
                    <h3 style="color: white; margin-bottom: 1rem;">📞 Contact Direct WhatsApp</h3>
                    <p style="color: #CBD5E1; margin-bottom: 1.5rem;">Pour une réponse instantanée et un accompagnement rapide :</p>
                    <a href="https://wa.me/221765749343" target="_blank" class="btn-hero-cta" style="background: #25D366;">💬 Discuter sur WhatsApp (+221 76 574 93 43)</a>
                </div>

                <div style="background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 2rem;">
                    <h4 style="margin-bottom: 0.5rem;">📍 Localisation</h4>
                    <p style="color: #64748B; font-size: 0.95rem;">Dakar, Sénégal — Service en ligne disponible dans toutes les régions du Sénégal.</p>
                </div>
            </div>
        </div>
    </div>
    `}function _(){return`
    <div class="cart-drawer-backdrop ${r.isCartOpen?`open`:``}" id="cartDrawerBackdrop">
        <div class="cart-drawer-content">
            <div class="cart-header">
                <div class="cart-title">🛒 Votre Panier</div>
                <button class="btn-close-drawer" onclick="window.toggleCart(false)">&times;</button>
            </div>
            
            <div class="cart-body" id="cartDrawerBody">
                <!-- Cart Items populated dynamically -->
            </div>
            
            <div class="cart-footer">
                <div class="cart-total-row">
                    <span>Total :</span>
                    <span id="cartTotalVal">${i(s())}</span>
                </div>
                <button class="btn-checkout" onclick="window.openCheckout()">Passer commande</button>
            </div>
        </div>
    </div>
    `}function v(){let e=document.getElementById(`cartDrawerBody`),t=document.getElementById(`cartTotalVal`);if(t&&(t.textContent=i(s())),e){if(r.cart.length===0){e.innerHTML=`<div class="cart-empty-msg">Votre panier est vide.</div>`;return}e.innerHTML=r.cart.map(e=>`
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-title">${e.product.title}</div>
                <div class="cart-item-price">${i(e.product.price)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-qty" onclick="window.updateCartQuantity(${e.product.id}, -1)">-</button>
                <span class="qty-val">${e.quantity}</span>
                <button class="btn-qty" onclick="window.updateCartQuantity(${e.product.id}, 1)">+</button>
            </div>
        </div>
    `).join(``)}}function y(){return`
    <div class="modal-overlay ${r.isCheckoutOpen?`open`:``}" id="checkoutModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3 class="modal-title">Valider ma Commande</h3>
                <button class="btn-close-drawer" onclick="window.closeCheckout()">&times;</button>
            </div>
            
            ${r.orderSuccess?`
                <div style="text-align: center; padding: 2rem 0;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                    <h3 style="color: #059669; margin-bottom: 0.5rem;">Commande Enregistrée !</h3>
                    <p style="color: #64748B; font-size: 0.95rem;">Merci pour votre confiance. Notre équipe vous contactera sur WhatsApp pour vous livrer vos fascicules numériques.</p>
                    <button class="btn-submit-order" style="margin-top: 1.5rem; background: #0F2C59;" onclick="window.closeCheckout()">Fermer</button>
                </div>
            `:`
                <form onsubmit="window.handleOrderConfirm(event)">
                    <div style="background: #F8FAFC; border-radius: 8px; padding: 0.85rem; margin-bottom: 1.25rem; font-size: 0.9rem; color: #475569;">
                        Articles : <strong>${c()}</strong> | Total : <strong style="color: #059669;">${i(s())}</strong>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Nom complet *</label>
                        <input type="text" class="form-control" id="orderName" placeholder="Ex: Fatou Ndiaye" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Téléphone (WhatsApp) *</label>
                        <input type="tel" class="form-control" id="orderPhone" placeholder="Ex: +221 77 123 45 67" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-control" id="orderEmail" placeholder="votre@email.com">
                    </div>

                    <button type="submit" class="btn-submit-order">Confirmer la commande</button>
                </form>
            `}
        </div>
    </div>
    `}window.selectSector=function(e){r.selectedSector=e,b()},window.selectType=function(e){r.selectedType=e,b()},window.setCatalogueFilter=function(e){r.selectedSector=e,window.location.hash=`#catalogue`},window.handleAddToCart=function(e,t){a(e),t&&(t.classList.add(`added`),t.innerHTML=`<span>✓ Ajouté</span>`,setTimeout(()=>{t.classList.remove(`added`),t.innerHTML=`<span>🛒 Ajouter</span>`},1200))},window.updateCartQuantity=function(e,t){o(e,t)},window.toggleCart=function(e){r.isCartOpen=e;let t=document.getElementById(`cartDrawerBackdrop`);t&&(e?t.classList.add(`open`):t.classList.remove(`open`))},window.openCheckout=function(){if(r.cart.length===0)return;r.isCheckoutOpen=!0,r.orderSuccess=!1;let e=document.getElementById(`checkoutModal`);e&&e.classList.add(`open`),b()},window.closeCheckout=function(){r.isCheckoutOpen=!1,r.orderSuccess=!1,b()},window.handleOrderConfirm=function(e){e.preventDefault(),r.orderSuccess=!0,r.cart=[],l(),b()},window.handleContactSubmit=function(e){e.preventDefault(),alert(`Merci ! Votre message a bien été envoyé à l'équipe SK ACADEMIA.`),e.target.reset()};function b(){let e=document.getElementById(`app`);if(!e)return;let t=``;switch(r.currentRoute){case`accueil`:t=f();break;case`catalogue`:t=p();break;case`formations`:t=m();break;case`a-propos`:t=h();break;case`contact`:t=g();break;default:t=f()}e.innerHTML=`
        ${u()}
        <main>
            ${t}
        </main>
        ${d()}
        ${_()}
        ${y()}
    `,v();let n=document.getElementById(`searchInput`);n&&n.addEventListener(`input`,e=>{r.searchQuery=e.target.value,b();let t=document.getElementById(`searchInput`);t&&(t.focus(),t.setSelectionRange(t.value.length,t.value.length))});let i=document.getElementById(`openCartDrawerBtn`);i&&i.addEventListener(`click`,()=>window.toggleCart(!0))}function x(){let e=window.location.hash.replace(`#`,``)||`accueil`;r.currentRoute=[`accueil`,`catalogue`,`formations`,`a-propos`,`contact`].includes(e)?e:`accueil`,b(),window.scrollTo({top:0,behavior:`smooth`})}document.addEventListener(`DOMContentLoaded`,()=>{window.addEventListener(`hashchange`,x),x()})}))();