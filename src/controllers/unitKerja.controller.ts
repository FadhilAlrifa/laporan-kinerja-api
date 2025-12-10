import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

const checkSuperUser = (req: AuthRequest, next: NextFunction): boolean => {
    if (req.user?.role !== 'SUPER_USER') {
        next({ statusCode: 403, message: 'Akses ditolak. Hanya Super User yang dapat mengelola Unit Kerja.' });
        return false;
    }
    return true;
};

export const createUnitKerja = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    try {
        const { nama, deskripsi } = req.body;
        const newUnitKerja = await prisma.unitKerja.create({
            data: { nama, deskripsi },
        });

        res.status(201).json({
            success: true,
            message: 'Unit Kerja berhasil dibuat.',
            data: newUnitKerja,
        });

    } catch (error) {
        next(error);
    }
};

export const getUnitKerjas = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const units = await prisma.unitKerja.findMany({
            orderBy: { nama: 'asc' },
        });

        res.json({ success: true, count: units.length, data: units });
    } catch (error) {
        next(error);
    }
};

export const getUnitKerjaById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id!, 10);

    try {
        const unit = await prisma.unitKerja.findUnique({
            where: { id },
        });

        if (!unit) {
            return next({ statusCode: 404, message: 'Unit Kerja tidak ditemukan.' });
        }

        res.json({ success: true, data: unit });
    } catch (error) {
        next(error);
    }
};

export const updateUnitKerja = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    // ID sudah divalidasi
    const id = parseInt(req.params.id!, 10);
    const dataToUpdate = req.body;

    try {
        const updatedUnit = await prisma.unitKerja.update({
            where: { id },
            data: dataToUpdate,
        });

        res.json({
            success: true,
            message: 'Unit Kerja berhasil diperbarui.',
            data: updatedUnit,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUnitKerja = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!checkSuperUser(req, next)) return;

    const id = parseInt(req.params.id!, 10);

    try {
        await prisma.unitKerja.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2003') {
            return next({
                statusCode: 400,
                message: 'Tidak dapat menghapus Unit Kerja. Terdapat data User atau Laporan yang masih terhubung.',
            });
        }
        next(error);
    }
};