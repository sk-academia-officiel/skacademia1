const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { setupDatabase } = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');

let db;
let supabaseClient = null;

function initSupabaseFromEnv() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
    if (url && key && url.startsWith('http')) {
        try {
            supabaseClient = createClient(url, key);
            console.log('⚡ Supabase connecté avec succès !');
        } catch (e) {
            console.error('Erreur initialisation Supabase:', e);
            supabaseClient = null;
        }
    } else {
        supabaseClient = null;
    }
}

dotenv.config();
initSupabaseFromEnv();

// Initialize SQLite fallback
setupDatabase().then(database => {
    db = database;
});

// Health check & Status
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Backend is running',
        supabaseActive: !!supabaseClient,
        supabaseUrl: process.env.SUPABASE_URL || null
    });
});

// GET /api/settings/supabase
app.get('/api/settings/supabase', (req, res) => {
    res.json({
        active: !!supabaseClient,
        url: process.env.SUPABASE_URL || '',
        keyConfigured: !!(process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY)
    });
});

// POST /api/settings/supabase (Enregistrer les clés Supabase & Migrer)
app.post('/api/settings/supabase', async (req, res) => {
    const { url, key } = req.body;
    if (!url || !key) {
        return res.status(400).json({ success: false, error: "URL et Clé Supabase requises." });
    }

    try {
        const testClient = createClient(url, key);
        // Test simple connection
        const { data, error } = await testClient.from('products').select('count', { count: 'exact', head: true });
        
        // If table doesn't exist, Supabase returns error. But client works.
        // Save to .env
        const envPath = path.join(__dirname, '.env');
        const envContent = `SUPABASE_URL=${url}\nSUPABASE_SERVICE_KEY=${key}\nSUPABASE_KEY=${key}\nJWT_SECRET=${JWT_SECRET}\n`;
        fs.writeFileSync(envPath, envContent, 'utf8');

        process.env.SUPABASE_URL = url;
        process.env.SUPABASE_SERVICE_KEY = key;
        process.env.SUPABASE_KEY = key;

        supabaseClient = testClient;

        // Auto-migration of products to Supabase if empty or table missing
        try {
            const dbPath = path.join(__dirname, 'database.json');
            if (fs.existsSync(dbPath)) {
                const productsData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                // Attempt to insert/upsert
                const { error: insertError } = await supabaseClient.from('products').upsert(productsData, { onConflict: 'id' });
                if (insertError) {
                    console.log("Supabase notice (Auto Migration):", insertError.message);
                } else {
                    console.log("Produits migrés avec succès vers Supabase !");
                }
            }
        } catch (migErr) {
            console.error("Erreur lors de l'auto-migration:", migErr);
        }

        res.json({ success: true, message: "Supabase connecté et configuré avec succès !", active: true });
    } catch (err) {
        console.error("Erreur lors de la sauvegarde Supabase:", err);
        res.status(500).json({ success: false, error: "Impossible de se connecter à Supabase avec ces clés: " + err.message });
    }
});

// Products Route (Priorité Supabase, Fallback SQLite)
app.get('/api/products', async (req, res) => {
    try {
        if (supabaseClient) {
            const { data, error } = await supabaseClient.from('products').select('*');
            if (!error && data && data.length > 0) {
                return res.json(data);
            }
        }
        if (db) {
            const products = await db.all('SELECT * FROM products');
            return res.json(products);
        }
        res.status(500).json({ error: "Base de données non disponible" });
    } catch (e) {
        console.error("Error reading products:", e);
        res.status(500).json({ error: "Failed to load products" });
    }
});

// Auth Routes (OTP)
app.post('/api/auth/register', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: "Email requis" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    try {
        if (supabaseClient) {
            // Save OTP to Supabase users table or OTP table
            await supabaseClient.from('users').upsert({ email, otpCode: code, otpExpiresAt: expiresAt }, { onConflict: 'email' });
        } else if (db) {
            const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
            if (existingUser) {
                await db.run('UPDATE users SET otpCode = ?, otpExpiresAt = ? WHERE email = ?', [code, expiresAt, email]);
            } else {
                await db.run('INSERT INTO users (email, otpCode, otpExpiresAt) VALUES (?, ?, ?)', [email, code, expiresAt]);
            }
        }
        
        console.log(`[DEV] OTP Code for ${email} is: ${code}`);
        res.json({ success: true, message: 'OTP généré avec succès.', dev_code: code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Erreur lors de la génération de l\'OTP' });
    }
});

// Verify OTP Route
app.post('/api/auth/verify', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, error: "Email et Code requis" });

    try {
        let user = null;

        if (supabaseClient) {
            const { data } = await supabaseClient.from('users').select('*').eq('email', email).single();
            user = data;
        } else if (db) {
            user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        }
        
        if (!user) {
            return res.status(404).json({ success: false, error: "Utilisateur non trouvé" });
        }

        if (user.otpCode !== code) {
            return res.status(400).json({ success: false, error: "Code invalide" });
        }

        if (new Date() > new Date(user.otpExpiresAt)) {
            return res.status(400).json({ success: false, error: "Code expiré" });
        }

        if (supabaseClient) {
            await supabaseClient.from('users').update({ otpCode: null, otpExpiresAt: null }).eq('email', email);
        } else if (db) {
            await db.run('UPDATE users SET otpCode = NULL, otpExpiresAt = NULL WHERE email = ?', [email]);
        }

        const token = jwt.sign({ id: user.id || user.email, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, message: "Authentification réussie", token, user: { email: user.email } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
});

// Chatbot Seny Route (API Claude Anthropic + Moteur IA Local SK ACADEMIA)
app.post('/api/chat', async (req, res) => {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, error: "Message requis" });

    try {
        // 1. Récupérer le catalogue pour le contexte
        let products = [];
        if (supabaseClient) {
            const { data } = await supabaseClient.from('products').select('*');
            if (data && data.length > 0) products = data;
        } 
        if (products.length === 0 && db) {
            products = await db.all('SELECT * FROM products');
        }
        if (products.length === 0) {
            const dbPath = path.join(__dirname, 'database.json');
            if (fs.existsSync(dbPath)) {
                products = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            }
        }

        // 2. Si clé API Anthropic disponible -> Appeler Claude 3.5 Sonnet
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (apiKey && apiKey.startsWith('sk-ant-')) {
            const catalogContext = products.map(p => 
                `- ${p.title} (${p.typeName || p.type || 'Fascicule'}) : ${p.price} FCFA. ${p.desc || ''}`
            ).join('\n');

            const systemPrompt = `Tu es Seny, le conseiller virtuel commercial et académique officiel de SK ACADEMIA au Sénégal.
MISSION : Aider chaleureusement et professionnellement les visiteurs à choisir la meilleure préparation aux concours sénégalais (ENA, Police, Gendarmerie, Douanes, FASTEF, Polytechnique, Santé / Sage-femme) ou formations en informatique.
TON : Chaleureux, bienveillant, orienté conseil. 3 à 4 phrases maximum ! Termine toujours par une question.
CATALOGUE EN TEMPS RÉEL :
${catalogContext}
CONTACT : WhatsApp +221 76 574 93 43`;

            const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
            const formattedMessages = recentHistory.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content || m.text || ''
            }));
            formattedMessages.push({ role: 'user', content: message });

            const anthropicRes = await axios.post('https://api.anthropic.com/v1/messages', {
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 350,
                system: systemPrompt,
                messages: formattedMessages
            }, {
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                timeout: 10000
            });

            if (anthropicRes.data && anthropicRes.data.content && anthropicRes.data.content[0]) {
                return res.json({ success: true, reply: anthropicRes.data.content[0].text });
            }
        }

        // 3. Moteur IA Autonome Seny (Si clé non définie ou hors ligne)
        const aiReply = generateSenySmartResponse(message, products);
        return res.json({ success: true, reply: aiReply });

    } catch (err) {
        console.error("[SENY] Erreur serveur/chat:", err.message);
        const aiReply = generateSenySmartResponse(message, []);
        return res.json({ success: true, reply: aiReply });
    }
});

// Moteur de Réponse IA Intelligente Seny pour SK ACADEMIA
function generateSenySmartResponse(query, products) {
    const q = query.toLowerCase();

    // Inscription / Commande
    if (q.includes('commander') || q.includes('acheter') || q.includes('panier') || q.includes('payer') || q.includes('wave') || q.includes('orange money')) {
        return "Pour commander un fascicule ou vous inscrire à une formation, ajoutez simplement le produit à votre panier sur le site puis cliquez sur 'Commander via WhatsApp'. Notre équipe finalisera votre accès immédiatement par Wave ou Orange Money (+221 76 574 93 43). Quel concours ou formation souhaitez-vous commander aujourd'hui ?";
    }

    // ENA
    if (q.includes('ena') || q.includes('administration')) {
        return "Notre prépa au concours de l'ENA (École Nationale d'Administration) comprend les sujets corrigés de Droit Public, Économie et Culture Générale pour 5 000 FCFA. C'est l'un de nos packs les plus prisés avec un taux de réussite élevé. Souhaitez-vous l'ajouter à votre panier ou recevoir le programme détaillé ?";
    }

    // Police / Gendarmerie / Sécurité
    if (q.includes('police') || q.includes('gendarmerie') || q.includes('sécurité') || q.includes('gardien')) {
        return "Le pack Concours Police & Gendarmerie contient les annales corrigées 2020-2025, les conseils pour les épreuves physiques et la culture générale pour 5 000 FCFA. Il couvre les concours de Gardiens de la Paix, Sous-officiers et Officiers. Souhaitez-vous le commander pour démarrer vos révisions ?";
    }

    // Douanes / Trésor / Impôts
    if (q.includes('douane') || q.includes('trésor') || q.includes('impôt') || q.includes('finances')) {
        return "Le fascicule spécial Concours des Douanes & Trésor (5 000 FCFA) prépare intensivement au droit fiscal, aux finances publiques et à la rédaction administrative. Il est conçu par d'anciens lauréats du concours. Voulez-vous connaître les critères d'éligibilité pour cette année ?";
    }

    // Santé / Sage-femme / Infirmiers
    if (q.includes('santé') || q.includes('sage') || q.includes('infirmier') || q.includes('médical')) {
        return "Notre prépa aux concours de Santé (Sage-Femme, État, Infirmiers) est disponible à 5 000 FCFA avec les annales de biologie, anatomie et QCM corrigés. Elle garantit une révision ciblée sur les épreuves officielles. Souhaitez-vous ajouter ce fascicule à votre panier ?";
    }

    // FASTEF / Enseignement
    if (q.includes('fastef') || q.includes('enseignant') || q.includes('professeur') || q.includes('éducation')) {
        return "Le fascicule Concours FASTEF (5 000 FCFA) contient toutes les ressources pédagogiques, la méthodologie de la dissertation et les sujets d'épreuve d'admission. C'est le guide de référence pour réussir l'entrée à la FASTEF. Avez-vous une spécialité précise (Lettres, Mathématiques, SVT) ?";
    }

    // Informatique / Développement Web / Bureautique
    if (q.includes('informatique') || q.includes('web') || q.includes('code') || q.includes('programmation') || q.includes('bureautique') || q.includes('excel')) {
        return "SK ACADEMIA propose des formations pratiques en Informatique (Développement Web & Mobile, HTML/CSS/JS/React à 25 000 FCFA, et Bureautique Excel/Word à 15 000 FCFA). Chaque cours inclut des projets réels et un suivi personnalisé. Quel niveau souhaitez-vous atteindre ?";
    }

    // Prix / Tarifs
    if (q.includes('prix') || q.includes('tarif') || q.includes('combien') || q.includes('coût')) {
        return "Tous nos fascicules de préparation aux concours sénégalais sont au tarif unique de 5 000 FCFA. Nos formations pratiques en informatique varient de 15 000 FCFA à 25 000 FCFA. Le paiement se fait facilement via Wave ou Orange Money. Lequel de ces programmes vous intéresse ?";
    }

    // Salutations
    if (q.includes('bonjour') || q.includes('salut') || q.includes('bonsoir') || q.includes('hello')) {
        return "Bonjour et bienvenue chez SK ACADEMIA ! 👋 Je suis Seny, votre conseiller virtuel. Je peux vous guider dans le choix de votre préparation aux concours (ENA, Police, Douanes, FASTEF, Santé) ou formations en informatique. Comment puis-je vous aider aujourd'hui ?";
    }

    // Recherche par produit
    if (products && products.length > 0) {
        const matched = products.find(p => p.title.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q)));
        if (matched) {
            return `Le produit "${matched.title}" est disponible au tarif de ${matched.price.toLocaleString()} FCFA. ${matched.desc} Souhaitez-vous l'ajouter à votre panier dès maintenant ?`;
        }
    }

    // Fallback IA Généraliste SK ACADEMIA
    return "SK ACADEMIA est la plateforme N°1 au Sénégal pour la préparation aux concours de la fonction publique (ENA, Police, Douanes, Gendarmerie, FASTEF, Santé) et les formations en informatique. Vous pouvez commander directement sur le site ou contacter notre secrétariat sur WhatsApp au +221 76 574 93 43. Que souhaitez-vous réviser en priorité ?";
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
