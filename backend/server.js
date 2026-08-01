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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
