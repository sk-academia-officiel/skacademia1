const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("ERREUR: Veuillez définir SUPABASE_URL et SUPABASE_SERVICE_KEY dans backend/.env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importData() {
    const dbPath = path.join(__dirname, 'database.json');
    if (!fs.existsSync(dbPath)) {
        console.error("ERREUR: database.json introuvable.");
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`${data.length} produits trouvés dans database.json. Début de l'importation...`);

    // We can insert all at once or one by one
    const { data: insertedData, error } = await supabase
        .from('products')
        .insert(data)
        .select();

    if (error) {
        console.error("Erreur lors de l'importation:", error.message);
    } else {
        console.log(`Succès ! ${insertedData.length} produits insérés dans Supabase.`);
    }
}

importData();
