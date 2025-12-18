import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now(); 

    res.on('finish', () => {
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        const { method, originalUrl, ip } = req;
        const statusCode = res.statusCode;

        console.log(`[${timestamp}] ${method} ${originalUrl} ${statusCode} - ${duration}ms - IP: ${ip}`);
    });

    next();
};