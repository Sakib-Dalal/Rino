import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// 1. CRITICAL: Initialize dotenv at the VERY TOP
dotenv.config();

const app = express();

// 2. Assign variables AFTER dotenv.config()
const PORT = process.env.PORT || 5050;

// ------------- CLI CONST
const AWS_API_CLI_AUTH_URL = process.env.AWS_API_CLI_AUTH_URL;

// ------------- FRONT END CONST
const AWS_API_URL = process.env.AWS_DEVICE_API_URL;

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send('RIHNO Backend is running! Go to /api/list_all_devices for data.');
});

// Health check route
app.get('/api/backend_check', (req, res) => {
    res.json({
        status: 'success',
        message: 'Hello World !',
        app: 'RIHNO Backend OK',
        port: PORT
    });
});

// ---------------------------------------------------------------------------------- CLI PART
app.get('/api/cli_auth', async (req, res) => {
    try {
        const { email, device, api_key } = req.query;
        if (!AWS_API_CLI_AUTH_URL) {
            return res.status(500).json({ error: "Backend configuration missing: AWS URL" });
        }

        if (!email || !device || !api_key) {
            return res.status(400).json({ status: 'error', message: 'Email and device is required' });
        }

        const response = await axios.get(AWS_API_CLI_AUTH_URL, {
            params: { email: email, device: device, api_key: api_key },
        });

        res.status(200).json(response.data);

    } catch (error) {
        // Log detailed error for you, send clean error to frontend
        console.error("Axios Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch from AWS',
            details: error.message
        });
    }
})


// ---------------------------------------------------------------------------------- FRONTEND PART
// Device List route
app.get('/api/list_all_devices', async (req, res) => {
    try {
        const { email } = req.query;

        // Double-check URL existence to prevent axios crash
        if (!AWS_API_URL) {
            return res.status(500).json({ error: "Backend configuration missing: AWS URL" });
        }

        if (!email) {
            return res.status(400).json({ status: 'error', message: 'Email required' });
        }

        const response = await axios.get(AWS_API_URL, {
            params: { email: email }
        });

        res.status(200).json(response.data);

    } catch (error) {
        // Log detailed error for you, send clean error to frontend
        console.error("Axios Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch from AWS',
            details: error.message
        });
    }
});

// Delete device route
app.delete('/api/delete', async (req, res) => {
    try {
        const { email, device } = req.query;

        // Double-check URL existence to prevent axios crash
        if (!AWS_API_URL) {
            return res.status(500).json({ error: "Backend configuration missing: AWS URL" });
        }

        if (!email) {
            return res.status(400).json({ status: 'error', message: 'Email required' });
        }

        const response = await axios.delete(AWS_API_URL, {
            params: { email: email , device: device },
        })

        res.status(200).json(response.data);

    } catch (error) {
        // Log detailed error for you, send clean error to frontend
        console.error("Axios Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch from AWS',
            details: error.message
        });
    }
})

app.listen(PORT, () => console.log(`RIHNO backend started on http://localhost:${PORT}`));