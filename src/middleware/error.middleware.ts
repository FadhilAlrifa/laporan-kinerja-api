// src/middleware/error.middleware.ts

import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ZodError } from 'zod'; 

// ErrorRequestHandler harus memiliki 4 parameter: (err, req, res, next)
export const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan server internal.';
    let errors = null;

    // 1. Zod/Validation Error (HTTP 400)
    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validasi input gagal.';
        errors = err.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
    } 
    // 2. JWT Error (HTTP 401)
    else if (err instanceof jwt.JsonWebTokenError) {
        statusCode = 401;
        message = 'Token autentikasi tidak valid atau kadaluarsa.';
    } 
    // 3. Prisma Error (P2002/409 Conflict, P2025/404 Not Found)
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': // Unique constraint failed (Conflict)
                statusCode = 409; 
                message = `Konflik: Data '${err.meta?.target}' sudah ada.`;
                break;
            case 'P2025': // Not found (Resource tidak ditemukan)
                statusCode = 404; 
                message = `Resource tidak ditemukan.`;
                break;
            default:
                statusCode = 500;
                message = `Kesalahan Database: ${err.message.split('\n')[0]}`;
                break;
        }
    } 
    // 4. Custom Error (Misalnya dari controller: next({ statusCode: 401, message: '...' }))
    else if (err.statusCode) {
    }
    
    // Default response structure
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        // PRODUCTION: Jangan ekspos stack trace. DEVELOPMENT: Ekspos untuk debugging.
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            type: err.name 
        })
    });
};