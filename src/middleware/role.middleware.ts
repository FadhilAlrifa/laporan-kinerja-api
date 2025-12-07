import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { User } from '@prisma/client';

type Role = User['role']; 

export const authorizeRoles = (allowedRoles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ 
                success: false, 
                message: 'Autentikasi diperlukan sebelum otorisasi.' 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Akses ditolak. Anda tidak memiliki izin yang diperlukan.' 
            });
        }

        return next();
    };
};