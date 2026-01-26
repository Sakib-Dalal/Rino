import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import * as crypto from "node:crypto";

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

// Add new device
// Add new device
app.post('/api/create', async (req, res) => {
    // 1. Move the helper function outside or keep it here;
    // but pull the secret from process.env for security.
    function generateAPIKey(email, deviceName) {
        const timestamp = Date.now().toString();
        const secret = process.env.API_SECRET || 'fallback-secret-key';

        const seed = `${email}-${deviceName}-${timestamp}`;
        return crypto
            .createHmac('sha256', secret)
            .update(seed)
            .digest('hex');
    }

    try {
        // req.query pulls from the URL: ?email=...&deviceName=...
        const { email, deviceName, deviceLocation, deviceStatus, dateCreated, deviceType } = req.query;

        // Validation
        if (!email || !deviceName || !deviceLocation || !deviceStatus || !dateCreated || !deviceType) {
            return res.status(400).json({ status: 'error', message: 'All Information Required' });
        }

        if (!AWS_API_URL) {
            return res.status(500).json({ error: "Backend configuration missing: AWS URL" });
        }

        // Generate the key
        const deviceAPI = generateAPIKey(email, deviceName);

        // 2. FIX: Send data as a JSON BODY, not as params
        // This matches how most AWS POST endpoints expect data
        const response = await axios.post(AWS_API_URL, {
            UserEmail: email,
            DeviceName: deviceName,
            Status: deviceStatus,
            Location: deviceLocation,
            DateCreated: dateCreated,
            DeviceAPI: deviceAPI, // Fixed typo: DeviveAPI -> DeviceAPI
            DeviceType: deviceType
        });

        res.status(200).json({
            status: 'success',
            generatedKey: deviceAPI,
            awsResponse: response.data
        });

    } catch (error) {
        console.error("Axios Error:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            message: 'Failed to fetch from AWS',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => console.log(`RIHNO backend started on http://localhost:${PORT}`));