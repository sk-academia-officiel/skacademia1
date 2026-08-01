-- Supabase SQL Schema for SK ACADEMIA

-- Table for Products (Fascicules, Annales, Cours, Packs)
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(10),
    bg VARCHAR(50),
    "catLabel" VARCHAR(50),
    "catName" VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    "desc" TEXT,
    price INTEGER NOT NULL,
    "typeName" VARCHAR(50)
);

-- Note: In Supabase SQL editor, you can run this to create the table.
-- The quotes around "desc", "catLabel", "catName" and "typeName" are important 
-- because they use camelCase or are reserved SQL words.
