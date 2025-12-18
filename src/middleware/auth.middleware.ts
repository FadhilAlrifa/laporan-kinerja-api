import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken'); 

export interface AuthPayload {
    id: number;
    email: string;
    role: string; 
    unitKerjaId: number | null;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}

const JWT_SECRET = process.env.JWT_SECRET!; 
const FALLBACK_SECRET = 'fallback_secret_jangan_pernah_dipakai_di_prod'; 

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({ 
            success: false, 
            message: 'Akses ditolak. Token autentikasi tidak ditemukan.' 
        });
    }

    const secret = JWT_SECRET || FALLBACK_SECRET; 
    
    jwt.verify(token, secret, (err: any, user: AuthPayload | undefined) => { 
        if (err) {
            console.error("JWT Error:", err.message);
            
            let message = 'Token tidak valid.';
            if (err.name === 'TokenExpiredError') {
                message = 'Token kadaluarsa. Silakan refresh atau login kembali.';
            }

            return res.status(401).json({ 
                success: false, 
                message: message
            });
        }

        req.user = user as AuthPayload; 
        
        return next(); 
    });
};