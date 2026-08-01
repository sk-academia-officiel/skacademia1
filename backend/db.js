const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbPromise = null;

async function setupDatabase() {
    if (dbPromise) return dbPromise;

    const dbPath = path.join(__dirname, 'database.sqlite');
    
    dbPromise = open({
        filename: dbPath,
        driver: sqlite3.Database
    }).then(async (db) => {
        console.log('Connecté à la base de données SQLite.');

        // 1. Création de la table 'products'
        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT,
                category TEXT,
                icon TEXT,
                bg TEXT,
                catLabel TEXT,
                catName TEXT,
                title TEXT,
                desc TEXT,
                price INTEGER,
                typeName TEXT
            );
        `);

        // 2. Création de la table 'users'
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                firstName TEXT,
                lastName TEXT,
                phone TEXT,
                otpCode TEXT,
                otpExpiresAt DATETIME
            );
        `);

        // 3. Importer les produits depuis database.json s'ils n'existent pas encore
        const productsCount = await db.get(`SELECT COUNT(*) as count FROM products`);
        if (productsCount.count === 0) {
            console.log("La table products est vide. Importation de database.json...");
            const jsonPath = path.join(__dirname, 'database.json');
            if (fs.existsSync(jsonPath)) {
                const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                for (const p of data) {
                    await db.run(
                        `INSERT INTO products (type, category, icon, bg, catLabel, catName, title, desc, price, typeName) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [p.type, p.category, p.icon, p.bg, p.catLabel, p.catName, p.title, p.desc, p.price, p.typeName]
                    );
                }
                console.log(`${data.length} produits importés avec succès !`);
            } else {
                console.warn("Fichier database.json introuvable, aucun produit importé.");
            }
        }

        return db;
    }).catch(err => {
        console.error('Erreur lors de la configuration de SQLite :', err);
        throw err;
    });

    return dbPromise;
}

module.exports = {
    setupDatabase
};
