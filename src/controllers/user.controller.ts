import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import * as bcrypt from 'bcryptjs';

const checkSuperUser = (req: AuthRequest, next: NextFunction): boolean => {
    if (req.user?.role !== 'SUPER_USER') {
        next({ statusCode: 403, message: 'Akses ditolak. Hanya Super User yang dapat mengelola pengguna.' });
        return false;
    }
    return true;
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    try {
        const { name, email, password, role, unitKerjaId } = req.body;
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next({ statusCode: 409, message: 'Email sudah terdaftar.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, // Simpan hash
                role, 
                unitKerjaId 
            },
            select: { id: true, name: true, email: true, role: true, unitKerjaId: true, createdAt: true }, // Jangan kembalikan password
        });

        res.status(201).json({
            success: true,
            message: 'Pengguna berhasil dibuat.',
            data: newUser,
        });

    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    let whereCondition: any = {};
    
    // Non-SUPER_USER hanya boleh melihat profil mereka sendiri
    if (user.role !== 'SUPER_USER') {
        whereCondition.id = user.id;
    }
    
    try {
        const users = await prisma.user.findMany({
            where: whereCondition,
            select: { id: true, name: true, email: true, role: true, unitKerjaId: true, unitKerja: { select: { nama: true } } },
            orderBy: { name: 'asc' },
        });

        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const id = parseInt(req.params.id!, 10);

    // Non-SUPER_USER hanya boleh melihat ID mereka sendiri
    if (user.role !== 'SUPER_USER' && user.id !== id) {
        return next({ statusCode: 403, message: 'Akses ditolak. Anda hanya dapat melihat profil Anda sendiri.' });
    }
    
    try {
        const targetUser = await prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, role: true, unitKerjaId: true, unitKerja: { select: { nama: true } } },
        });

        if (!targetUser) {
            return next({ statusCode: 404, message: 'Pengguna tidak ditemukan.' });
        }

        res.json({ success: true, data: targetUser });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    const id = parseInt(req.params.id!, 10);
    const { password, ...dataToUpdate } = req.body;
    
    try {
        await prisma.user.findUniqueOrThrow({ where: { id } });

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            dataToUpdate.password = hashedPassword;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, role: true, unitKerjaId: true, createdAt: true, updatedAt: true },
        });

        res.json({
            success: true,
            message: 'Pengguna berhasil diperbarui.',
            data: updatedUser,
        });

    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    const id = parseInt(req.params.id!, 10);

    if (req.user?.id === id) {
        return next({ statusCode: 403, message: 'Tidak diizinkan menghapus akun Anda sendiri.' });
    }

    try {
        await prisma.user.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};