-- ========================================================
-- SK ACADEMIA — SUPABASE DATABASE SCHEMA & INITIAL SEED DATA
-- Executer ce script dans le "SQL Editor" de votre projet Supabase
-- ========================================================

-- 1. Nettoyage (si re-création)
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.abandoned_carts CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 2. Table PRODUITS (Catalogue)
CREATE TABLE public.products (
    id BIGINT PRIMARY KEY,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    bg TEXT,
    cat_label TEXT,
    cat_name TEXT,
    title TEXT NOT NULL,
    desc_text TEXT,
    price INT NOT NULL DEFAULT 0,
    type_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table UTILISATEURS / PROFILS
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    is_subscribed BOOLEAN DEFAULT FALSE,
    subscription_plan TEXT,
    subscription_date TEXT,
    purchases JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table COMMANDES
CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    client TEXT NOT NULL,
    items TEXT NOT NULL,
    total INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'En attente de paiement (WhatsApp)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table PANIERS ABANDONNÉS
CREATE TABLE public.abandoned_carts (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    client TEXT NOT NULL,
    phone TEXT,
    items TEXT NOT NULL,
    total INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Table PARAMÈTRES DU SITE
CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table LOGS D'ACTIVITÉ (Back-office Admin)
CREATE TABLE public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    time TEXT NOT NULL,
    msg TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- POLITIQUES DE SÉCURITÉ (Row Level Security - RLS)
-- Permet la lecture et l'écriture anonyme via Anon Key
-- ========================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read/Write Products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Abandoned Carts" ON public.abandoned_carts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Site Settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Activity Logs" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- ========================================================
-- SEED DATA (Insertion initiale du catalogue produits)
-- ========================================================
INSERT INTO public.products (id, type, category, icon, bg, cat_label, cat_name, title, desc_text, price, type_name)
VALUES
(1, 'fascicule', 'administration', '📋', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Fascicule Complet — Concours ENA Sénégal', 'Toutes les matières : culture générale, droit administratif, économie, rédaction administrative.', 12000, 'Fascicule'),
(2, 'annale', 'administration', '📜', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Annales Corrigées ENA — 10 ans', '10 années d''annales corrigées avec méthodologie et conseils de réussite.', 8000, 'Annale'),
(3, 'fascicule', 'administration', '⚖️', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Fascicule Concours Magistrat', 'Procédure pénale, procédure civile, droit constitutionnel et questions d''actualité juridique.', 15000, 'Fascicule'),
(4, 'cours', 'administration', '📖', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Cours PDF — Droit Administratif Sénégalais', 'Cours complet et structuré pour maîtriser le droit administratif national.', 5000, 'Cours PDF'),
(5, 'fascicule', 'administration', '🗂️', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Pack CREM — Toutes Spécialités', 'Pack complet pour le CREM : cours, fiches, annales et exercices pour toutes les spécialités.', 18000, 'Pack'),
(6, 'fascicule', 'administration', '⚖️', 'bg-admin', 'cat-lbl-admin', 'Administration & Justice', 'Fascicule Concours Greffier', 'Préparation ciblée : organisation judiciaire, procédure, culture juridique et rédaction.', 10000, 'Fascicule'),
(7, 'fascicule', 'securite', '👮', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Fascicule — Concours Police Nationale', 'Culture générale, dictée, QCM logique, math, et préparation aux épreuves physiques.', 10000, 'Fascicule'),
(8, 'annale', 'securite', '📜', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Annales Police Nationale — 8 ans', '8 années d''épreuves corrigées avec les critères de notation officiels.', 7000, 'Annale'),
(9, 'fascicule', 'securite', '🪖', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Fascicule — Concours Gendarmerie Nationale', 'Préparation complète pour la gendarmerie : épreuves écrites et guide physique.', 10000, 'Fascicule'),
(10, 'fascicule', 'securite', '🛃', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Fascicule — Concours Douanes Sénégalaises', 'Économie, droit douanier, mathématiques et culture générale pour les douanes.', 12000, 'Fascicule'),
(11, 'fascicule', 'securite', '⭐', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Fascicule — Concours ENSOA', 'Toutes les épreuves de l''ENSOA : sciences, mathématiques, culture générale et discipline militaire.', 10000, 'Fascicule'),
(12, 'cours', 'securite', '📖', 'bg-secu', 'cat-lbl-secu', 'Sécurité & Défense', 'Cours PDF — Culture Générale Sécurité', 'Cours de culture générale axé sur les thèmes abordés dans les concours de la sécurité.', 4000, 'Cours PDF'),
(13, 'fascicule', 'sante', '🤱', 'bg-sante', 'cat-lbl-sante', 'Santé & Social', 'Fascicule — Concours Sage-femme', 'Biologie, chimie, sciences naturelles, physique et test psychotechnique pour le concours sage-femme.', 12000, 'Fascicule'),
(14, 'annale', 'sante', '📜', 'bg-sante', 'cat-lbl-sante', 'Santé & Social', 'Annales Corrigées — Concours Sage-femme', '5 années d''annales avec corrections détaillées et barèmes officiels.', 7000, 'Annale'),
(15, 'fascicule', 'sante', '🏃', 'bg-sante', 'cat-lbl-sante', 'Santé & Social', 'Fascicule — Concours INSEPS', 'Sciences de l''éducation physique, biologie humaine, anatomie et culture générale.', 10000, 'Fascicule'),
(16, 'fascicule', 'sante', '🏥', 'bg-sante', 'cat-lbl-sante', 'Santé & Social', 'Fascicule — Concours UDES', 'Préparation ciblée pour le concours UDES avec toutes les matières au programme.', 10000, 'Fascicule'),
(17, 'fascicule', 'grandes-ecoles', '📐', 'bg-ecole', 'cat-lbl-ecole', 'Grandes Écoles', 'Fascicule — Polytechnique de Thiès (EPT)', 'Mathématiques, physique, chimie et problèmes de sciences de l''ingénieur. Niveau avancé.', 18000, 'Fascicule'),
(18, 'annale', 'grandes-ecoles', '📜', 'bg-ecole', 'cat-lbl-ecole', 'Grandes Écoles', 'Annales EPT — Mathématiques & Physique', '10 ans d''épreuves corrigées de mathématiques et physique pour l''EPT.', 12000, 'Annale'),
(19, 'fascicule', 'grandes-ecoles', '🏗️', 'bg-ecole', 'cat-lbl-ecole', 'Grandes Écoles', 'Fascicule — Polytechnique de Dakar (ESP)', 'Préparation complète pour l''ESP : maths, physique, chimie et informatique.', 18000, 'Fascicule'),
(20, 'cours', 'grandes-ecoles', '📖', 'bg-ecole', 'cat-lbl-ecole', 'Grandes Écoles', 'Cours PDF — Mathématiques Niveau Concours', 'Algèbre, analyse, probabilités et géométrie au niveau des concours de grandes écoles.', 8000, 'Cours PDF'),
(21, 'fascicule', 'enseignement', '📚', 'bg-teach', 'cat-lbl-teach', 'Enseignement', 'Pack FASTEF — Toutes Spécialités', 'Préparation complète au concours FASTEF : toutes les spécialités couvertes avec cours et exercices.', 20000, 'Pack'),
(22, 'fascicule', 'enseignement', '🧮', 'bg-teach', 'cat-lbl-teach', 'Enseignement', 'Fascicule FASTEF — Mathématiques', 'Spécialité maths : cours, exercices et annales pour le concours FASTEF.', 10000, 'Fascicule'),
(23, 'fascicule', 'enseignement', '🔤', 'bg-teach', 'cat-lbl-teach', 'Enseignement', 'Fascicule FASTEF — Lettres & Français', 'Spécialité lettres : grammaire, littérature, composition et rédaction pédagogique.', 10000, 'Fascicule'),
(24, 'cours', 'enseignement', '📖', 'bg-teach', 'cat-lbl-teach', 'Enseignement', 'Cours PDF — Méthodologie Pédagogique', 'Fiches de préparation de leçons, techniques d''enseignement et outils didactiques.', 5000, 'Cours PDF'),
(25, 'formation', 'formation', '💻', 'bg-form', 'cat-lbl-form', 'Formations Digitales', 'Formation — Maîtriser l''IA en 2026', 'ChatGPT, Gemini, Copilot, automatisation, prompting avancé et cas pratiques pour professionnels.', 50000, 'Formation'),
(26, 'formation', 'formation', '🌐', 'bg-form', 'cat-lbl-form', 'Formations Digitales', 'Formation — Développeur Web Full-Stack', 'HTML, CSS, JavaScript, Node.js, base de données et déploiement de A à Z.', 75000, 'Formation'),
(27, 'formation', 'formation', '📊', 'bg-form', 'cat-lbl-form', 'Formations Digitales', 'Formation — Excel & Bureautique Avancée', 'Excel, Word, PowerPoint et outils Google Workspace pour la productivité professionnelle.', 25000, 'Formation')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    price = EXCLUDED.price,
    desc_text = EXCLUDED.desc_text;

-- Configuration initiale du site
INSERT INTO public.site_settings (key, value)
VALUES ('site_config', '{"phone": "+221 77 000 00 00", "email": "contact@skacademia.sn", "address": "Dakar, Sénégal"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Utilisateur Administrateur par défaut
INSERT INTO public.users (email, password_hash, first_name, last_name, phone, role)
VALUES ('admin@skacademia.sn', '84489a7101859c0cae687bdfae032ec8bd6efbf21fafe2a0edbb32aa4e3ffae8', 'Admin', 'SK ACADEMIA', '+221 77 000 00 00', 'admin')
ON CONFLICT (email) DO NOTHING;
