import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';

import { prisma } from './config/prisma';
import { authRouter } from './routes/auth.route'; 
import { errorHandler } from './middleware/error.middleware'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'API Laporan Kinerja Perusahaan berjalan. Akses /health atau /api/auth/login.',
        version: 'v1.0'
    });
});
app.get('/health', (_req: Request, res: Response) => {
    const uptimeSeconds = process.uptime();
    res.json({
        success: true,
        status: 'OK',
        message: 'API Laporan Kinerja Berjalan',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptimeSeconds)} seconds`,
    });
});

app.use('/api/auth', authRouter); 

app.use(errorHandler); 

async function startServer() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (e) {
        console.error('Failed to start server due to database connection error:', e);
        process.exit(1); 
    }
}

startServer();