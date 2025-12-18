import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Terjadi kesalahan server internal.';
    let errors: any = null;

    console.error(`[ERROR] ${req.method} ${req.url} :`, err);

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validasi input gagal.';
        errors = err.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));
    } 
    else if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
        statusCode = 401;
        message = err instanceof jwt.TokenExpiredError ? 'Token sudah kadaluarsa.' : 'Token autentikasi tidak valid.';
    } 
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                statusCode = 409;
                const target = (err.meta?.target as string[]) || 'data';
                message = `Konflik: Data '${target}' sudah ada (duplikat).`;
                break;
            case 'P2025':
                statusCode = 404;
                message = 'Data yang diminta tidak ditemukan.';
                break;
            case 'P2003':
                statusCode = 400;
                message = 'Gagal menyimpan: Relasi ID (Foreign Key) tidak ditemukan di database.';
                break;
            default:
                statusCode = 500;
                message = `Kesalahan Database: ${err.code}`;
                errors = err.meta;
                break;
        }
    }
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Format data yang dikirim ke database tidak valid.';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        ...(process.env.NODE_ENV !== 'production' && { 
            stack: err.stack,
            errorType: err.name 
        })
    });
};