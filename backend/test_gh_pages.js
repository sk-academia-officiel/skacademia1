const axios = require('axios');

async function testGhPages() {
    const url = "https://sk-academia-officiel.github.io/skacademia1/";
    try {
        console.log("Checking GitHub Pages live URL:", url);
        const res = await axios.get(url);
        console.log("SUCCESS! HTTP Status Code:", res.status);
        console.log("First 200 chars of HTML:", res.data.substring(0, 200));
    } catch (e) {
        console.log("Status Code / Error:", e.response ? e.response.status : e.message);
    }
}

testGhPages();
