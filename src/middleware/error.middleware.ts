import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ZodError } from 'zod'; 

export const errorHandler: ErrorRequestHandler = (err, _req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan server internal.';
    let errors = null;

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validasi input gagal.';
        errors = err.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
    } 
    else if (err instanceof jwt.JsonWebTokenError) {
        statusCode = 401;
        message = 'Token autentikasi tidak valid atau kadaluarsa.';
    } 
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409; 
                message = `Konflik: Data '${err.meta?.target}' sudah ada.`;
                break;
            case 'P2025': 
                statusCode = 404; 
                message = `Resource tidak ditemukan.`;
                break;
            default:
                statusCode = 500;
                message = `Kesalahan Database: ${err.message.split('\n')[0]}`;
                break;
        }
    } 
    else if (err.statusCode) {
    }
    
    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            type: err.name 
        })
    });
};