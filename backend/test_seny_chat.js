const axios = require('axios');

async function testSeny() {
    try {
        console.log("Testing POST /api/chat (Seny fallback / Claude API)...");
        const res = await axios.post('http://localhost:3000/api/chat', {
            message: "Bonjour, quel est le prix du fascicule ENA ?",
            history: []
        });

        console.log("Status:", res.status);
        console.log("Response data:", res.data);
    } catch (e) {
        console.error("Error:", e.response ? e.response.data : e.message);
    }
}

testSeny();
