// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken'); // Menggunakan require

// ... (Interface AuthPayload dan AuthRequest)
export interface AuthPayload {
    id: number;
    email: string;
    role: string; 
    unitKerjaId: number | null;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

// Variabel ini dideklarasikan di scope luar. Kita akan memastikan ia digunakan di bawah.
const JWT_SECRET = process.env.JWT_SECRET!; 
const FALLBACK_SECRET = 'fallback_secret_jangan_pernah_dipakai_di_prod'; 

// PERBAIKAN TS2322: Tambahkan | Response pada tipe kembalian
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        // Baris ini sekarang kompatibel dengan tipe kembalian: Response
        return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak. Token autentikasi tidak ditemukan.' 
        });
    }

    // PERBAIKAN TS6133: Menggunakan variabel yang dideklarasikan di luar scope
    const secret = JWT_SECRET || FALLBACK_SECRET; 
    
    // Verifikasi Token
    jwt.verify(token, secret, (err: any, user: AuthPayload | undefined) => { 
        if (err) {
            console.error("JWT Error:", err.message);
            
            let message = 'Token tidak valid.';
            if (err.name === 'TokenExpiredError') {
                message = 'Token kadaluarsa. Silakan refresh atau login kembali.';
            }

            // Baris ini sekarang kompatibel dengan tipe kembalian: Response
            return res.status(401).json({ 
                success: false, 
                message: message
            });
        }

        req.user = user as AuthPayload; 
        
        // Memanggil next() (tipe kembalian void)
        return next(); 
    });
};