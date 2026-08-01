const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Init Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://igqwayiihhinrxhzlqcu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || ''; // To be filled
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Products Route
app.get('/api/products', (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, 'database.json');
        
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            res.json(JSON.parse(data));
        } else {
            res.json([]);
        }
    } catch (e) {
        console.error("Error reading database:", e);
        res.status(500).json({ error: "Failed to load products" });
    }
});

// Auth Routes (OTP)
app.post('/api/auth/register', async (req, res) => {
    const { firstName, lastName, email, phone } = req.body;
    // Generate a 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app we'd save this code in memory/redis/DB mapped to the email.
    // For now, let's just return success for demo purposes, 
    // and attempt to send via EmailJS REST API if configured
    try {
        const serviceId = process.env.EMAILJS_SERVICE_ID;
        const templateId = process.env.EMAILJS_TEMPLATE_ID;
        const publicKey = process.env.EMAILJS_PUBLIC_KEY;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY; // Optional but good for REST

        if (serviceId && templateId && publicKey) {
            await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: {
                    to_name: firstName,
                    to_email: email,
                    otp_code: code
                }
            });
            console.log(`OTP sent to ${email}`);
        } else {
            console.warn("EmailJS not fully configured, OTP generated but not sent.");
        }
        
        // Mock success
        res.json({ success: true, message: 'OTP envoyé (ou simulé)', mockCode: code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi de l\'email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
