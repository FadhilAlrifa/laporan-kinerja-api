import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';

import { prisma } from './config/prisma'; // Mengimpor client Prisma dari file config
import { authRouter } from './routes/auth.route'; 
import { errorHandler } from './middleware/error.middleware'; 

const app = express();
// Hapus baris ini: const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware Global
app.use(express.json());

// 1. Health Check Endpoint (Menggunakan '_' untuk mengabaikan req agar tidak ada error TS6133)
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

// 2. Route Utama 
app.use('/api/auth', authRouter); 

// 3. Error Handler Global (HARUS diletakkan paling akhir)
app.use(errorHandler); 

// ----------------------------------------------------
// START SERVER & DATABASE CONNECTION
// ----------------------------------------------------

async function startServer() {
    try {
        // 1. Cek Koneksi Database (Wajib dilakukan sebelum server menerima request)
        await prisma.$connect();
        console.log('Database connected successfully.');

        // 2. Start Express Server
        app.listen(PORT, () => {
            console.log(`Server berjalan di http://localhost:${PORT}`);
        });

    } catch (e) {
        console.error('Failed to start server due to database connection error:', e);
        // Jika koneksi gagal, matikan aplikasi
        process.exit(1); 
    }
}

// Panggil fungsi async untuk memulai aplikasi
startServer();