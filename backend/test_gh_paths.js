const axios = require('axios');

async function testPaths() {
    const urls = [
        "https://sk-academia-officiel.github.io/skacademia1/",
        "https://sk-academia-officiel.github.io/skacademia1/docs/",
        "https://sk-academia-officiel.github.io/skacademia1/index.html"
    ];
    for (const u of urls) {
        try {
            console.log("Testing:", u);
            const res = await axios.get(u);
            console.log("SUCCESS!", u, "Status:", res.status);
            return;
        } catch (e) {
            console.log("Failed:", u, "Status:", e.response ? e.response.status : e.message);
        }
    }
}

testPaths();
