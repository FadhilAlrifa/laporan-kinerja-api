import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import * as bcrypt from 'bcryptjs';
import { AuthRequest, AuthPayload } from '../middleware/auth.middleware';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

const generateTokens = (userPayload: AuthPayload) => {
    const accessToken = jwt.sign(userPayload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
    const refreshToken = jwt.sign(userPayload, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
    return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body; 

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return next({ statusCode: 401, message: 'Email atau Password salah.' });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return next({ statusCode: 401, message: 'Email atau Password salah.' });
        }

        const payload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            unitKerjaId: user.unitKerjaId,
        };

        const { accessToken, refreshToken } = generateTokens(payload);

        res.json({
            success: true,
            message: 'Login berhasil.',
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role },
                accessToken,
                refreshToken,
            },
        });

    } catch (error) {
        next(error); 
    }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user; 
        
        if (!user) {
            return next({ statusCode: 404, message: 'Data pengguna tidak ditemukan di token.' });
        }
        
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { unitKerja: true }
        });

        if (!fullUser) {
            return next({ statusCode: 404, message: 'Profil pengguna tidak ditemukan di database.' });
        }

        res.json({
            success: true,
            message: 'Profil berhasil diambil.',
            data: {
                id: fullUser.id,
                name: fullUser.name,
                email: fullUser.email,
                role: fullUser.role,
                unitKerja: fullUser.unitKerja ? fullUser.unitKerja.nama : null,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next({ statusCode: 400, message: 'Refresh Token diperlukan.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
            return next({ statusCode: 401, message: 'Pengguna tidak ditemukan.' });
        }

        const newPayload: AuthPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            unitKerjaId: user.unitKerjaId,
        };
        
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(newPayload);

        res.json({
            success: true,
            message: 'Access Token diperbarui.',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        });

    } catch (error) {
        next({ statusCode: 401, message: 'Refresh Token tidak valid atau kedaluwarsa. Silakan login ulang.' });
    }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;
    
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next({ statusCode: 409, message: 'Email sudah terdaftar.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash,
                role: 'USER', 
            },
        });

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil. Silakan login.',
            data: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        });

    } catch (error) {
        next(error);
    }
};