import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5050;

// 1. Enable CORS before routes
app.use(cors());
app.use(express.json());

// Root route (for testing http://localhost:5050/)
app.get('/', (req, res) => {
    res.send('RIHNO Backend is running! Go to /api/hello for the data.');
});

// Your API route
app.get('/api/backend_check', (req, res) => {
    res.json({
        status: 'success',
        message: 'Hello World !',
        app: 'RIHNO Backend OK',
        port: PORT
    });
});

app.listen(PORT, () => console.log(`🚀 RIHNO backend started on http://localhost:${PORT}`));